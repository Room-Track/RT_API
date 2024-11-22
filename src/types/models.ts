import type { PlaceTypeType } from './util';
/**
 * @param {string} nameA from Place.name ( name of vertex A )
 * @param {string} nameB from Place.name ( name of vertex B )
 * @param {string} forwardInfo info to go from A to B
 * @param {string} backwardInfo info to go from B to A
 */
export type Indication = {
	nameA: string;
	nameB: string;
	forwardInfo: string;
	backwardInfo: string;
};
/**
 * @param {string} name from Place.name
 * @param {string} lat latitude of location/vertex
 * @param {string} lng longitude of location/vertex
 * @param {string} atl altitude of location/vertex
 * @param {string} rad coverage radius of the place area
 */
export type Location = {
	name: string;
	lat: string;
	lng: string;
	alt: string;
	rad: string;
};
/**
 * @param {string} name name of the building/place
 * @param {boolean} inside true if the building is inside USM
 * @param {number} lowestF the number of the lowest Floor
 * @param {number} highestF the number of the highest Floor
 */
export type Building = {
	name: string;
	inside: boolean;
	lowestF: number;
	highestF: number;
};
/**
 * @param {string} name name of the vertex
 * @param {string} type type of the vertex
 * @param {number} level level from ground
 * @param {string?} img to the image of the place
 * @param {string} ref reference to Building.name
 */
export type Place = {
	name: string;
	type: PlaceTypeType;
	level: number;
	img?: string;
	ref?: string;
};
/**
 * @param {string} name name of place
 * @param {string} of name of location group
 */
export type Group = {
	name: string;
	of: string;
};