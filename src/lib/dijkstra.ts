import type { CosmosClient } from "@azure/cosmos";
import type { Indication, Location } from "../types/models";
import { Decimal } from "decimal.js";
import { query } from "../database";

type Node = {
    name: string;
    latitude: Decimal;
    longitude: Decimal;
    altitude: Decimal;
    rad: Decimal;
    neighbors: { [key: string]: Decimal };
};

type InfoInd = {
    from: string;
    to: string;
    info: string;
};
function calculateDistance(
    lat1: Decimal,
    lon1: Decimal,
    alt1: Decimal,
    lat2: Decimal,
    lon2: Decimal,
    alt2: Decimal
): Decimal {
    const latDiff = lat2.minus(lat1);
    const lonDiff = lon2.minus(lon1);
    const altDiff = alt2.minus(alt1);
    return Decimal.sqrt(latDiff.pow(2).plus(lonDiff.pow(2)).plus(altDiff.pow(2)));
}

export const dijkstra = (
    nodes: { [key: string]: Node },
    start: string,
    end: string
): string[] => {
    const distances: { [key: string]: Decimal } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set(Object.keys(nodes));

    Object.keys(nodes).forEach((node) => {
        distances[node] = new Decimal(Infinity);
        previous[node] = null;
    });
    distances[start] = new Decimal(0);

    while (unvisited.size) {
        const currentNode = Array.from(unvisited).reduce((minNode, node) =>
            distances[node].lessThan(distances[minNode]) ? node : minNode
        );

        if (currentNode === end) break;

        unvisited.delete(currentNode);

        Object.entries(nodes[currentNode].neighbors).forEach(([neighbor, distance]) => {
            if (unvisited.has(neighbor)) {
                const newDistance = distances[currentNode].plus(distance);
                if (newDistance.lessThan(distances[neighbor])) {
                    distances[neighbor] = newDistance;
                    previous[neighbor] = currentNode;
                }
            }
        });
    }

    const path = [];
    for (let at = end; at; at = previous[at]!) {
        path.unshift(at);
    }

    return path[0] === start ? path : [];
};

export const initializeNodes = async (
    client: CosmosClient,
    lat: string,
    lng: string,
    alt: string
) => {
    const { resources: resLocation } = await query(client, 'Locations', {
        query: 'SELECT * FROM r',
    });
    const { resources: resIndication } = await query(client, 'Indications', {
        query: 'SELECT * FROM r',
    });

    const nodes: { [key: string]: Node } = {};

    const initLat = new Decimal(lat);
    const initLng = new Decimal(lng);
    const initAlt = new Decimal(alt);
    let minDist = new Decimal(Infinity);
    let start = '';

    resLocation.forEach((doc: Location) => {
        const docLat = new Decimal(doc.lat);
        const docLng = new Decimal(doc.lng);
        const docAlt = new Decimal(doc.alt);
        const docRad = new Decimal(doc.rad);

        const dist = calculateDistance(
            initLat,
            initLng,
            initAlt,
            docLat,
            docLng,
            docAlt
        );

        if (dist.lessThan(minDist)) {
            minDist = dist;
            start = doc.name;
        }

        nodes[doc.name] = {
            name: doc.name,
            latitude: docLat,
            longitude: docLng,
            altitude: docAlt,
            rad: docRad,
            neighbors: {},
        };
    });

    resIndication.forEach((doc: Indication) => {
        const { nameA, nameB } = doc;
        if (nodes[nameA] && nodes[nameB]) {
            const dist = calculateDistance(
                nodes[nameA].latitude,
                nodes[nameA].longitude,
                nodes[nameA].altitude,
                nodes[nameB].latitude,
                nodes[nameB].longitude,
                nodes[nameB].altitude
            );
            nodes[nameA].neighbors[nameB] = dist;
            nodes[nameB].neighbors[nameA] = dist;
        }
    });

    return { nodes, start };
};

export async function getPolylinesFromPath(nodes: { [key: string]: Node }, path: Array<string>) {
    const poly: string[][][] = [];
    for (let i = 1; i < path.length; i++) {
        const nodeFrom = nodes[path.at(i - 1)!];
        const nodeTo = nodes[path.at(i)!];
        poly.push([
            [nodeFrom.latitude.toString(), nodeFrom.longitude.toString()],
            [nodeTo.latitude.toString(), nodeTo.longitude.toString()],
        ]);
    }
    return poly;
}

export async function getRouteFromPath(client: CosmosClient, path: Array<string>) {
    const route: Array<InfoInd> = [];
    for (let i = 1; i < path.length; i++) {
        const from = path.at(i - 1)!;
        const to = path.at(i)!
        const { resources } = await query(client, 'Indications', {
            query: 'SELECT * FROM r WHERE r.nameA = @nameA AND r.nameB = @nameB OR r.nameA = @nameB AND r.nameB = @nameA',
            parameters: [
                {
                    name: '@nameA',
                    value: to,
                },
                {
                    name: '@nameB',
                    value: from,
                }
            ],
        });
        if (resources.length) {
            const doc: Indication = resources[0];
            const reversed = doc.nameA == to;
            route.push({
                from: from,
                to: to,
                info: reversed ? doc.backwardInfo : doc.forwardInfo,
            });
        }
    }
    return route;
}

export async function getNodesFromPath(allNodes: { [key: string]: Node }, path: Array<string>) {
    const nodes: {
        [key: string]: {
            name: string;
            rad: string;
            latitude: string;
            altitude: string;
            longitude: string;
        }
    } = {};
    path.forEach((node) => {
        nodes[node] = {
            name: node,
            rad: allNodes[node].rad.toString(),
            altitude: allNodes[node].altitude.toString(),
            latitude: allNodes[node].latitude.toString(),
            longitude: allNodes[node].longitude.toString(),
        };
    });
    return nodes;
}