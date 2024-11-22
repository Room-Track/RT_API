import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import { dijkstra, getNodesFromPath, getPolylinesFromPath, getRouteFromPath, initializeNodes } from '../lib/dijkstra';
import { query } from '../database';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
router.use(authenticate);


router.get('/dijkstra', async (req, res) => {
    if (!req.query['target'] || !req.query['lat'] || !req.query['lng'] || !req.query['alt']) {
        res.status(400).json({
            error: 'bad request',
        });
        return;
    }
    const client: CosmosClient = req.app.get('client');
    let target = req.query['target']!.toString();

    const { nodes: allNodes, start } = await initializeNodes(client, req.query['lat']!.toString(), req.query['lng']!.toString(), req.query['alt']!.toString());

    const { resources } = await query(client, 'Locations', {
        query: 'SELECT * FROM r WHERE r.name = @name',
        parameters: [
            {
                name: '@name',
                value: req.query['target']!.toString(),
            }
        ],
    });

    if (!resources.length) {
        const { resources: resultGroup } = await query(client, 'Groups', {
            query: 'SELECT * FROM r WHERE r.name = @name',
            parameters: [
                {
                    name: '@name',
                    value: target,
                },
            ]
        });
        if (resultGroup.length) {
            target = resultGroup[0].of;
        }
    }

    const path = dijkstra(allNodes, start, target);

    const route = await getRouteFromPath(client, path);
    const poly = await getPolylinesFromPath(allNodes, path);
    const nodes = await getNodesFromPath(allNodes, path);

    res.status(200).json({
        data: {
            path: path,
            nodes: nodes,
            route: route,
            polylines: poly,
        },
    });
});

export default router;
