import type { Building, Indication, Location, Place } from './models';
import type { PlaceTypeType } from './util';
/*
==============================================================
						ROOM TRACK
==============================================================
*/
/**
 * @param {string} name from Place.name
 * @param {string} type from Place.type
 */
export interface ISearch {
	name: string;
	type: PlaceTypeType;
}
/**
 * @param {string} name from Building.name / Place.name / Location.name
 * @param {number} lowestF from Building.lowestF
 * @param {number} highestF from Building.highestF
 * @param {boolean} inside from Building.inside
 * @param {string} lat from Location.lat
 * @param {string} lng from Location.lng
 */
export interface IRef {
	name: string;
	lowestF: number;
	highestF: number;
	inside: boolean;
	lat: string;
	lng: string;
}
/**
 * @param {string} name from Place.name
 * @param {string} type from Place.type
 * @param {number} level from Place.level
 * @param {IRef?} ref from Place.ref
 */
export interface IInfo {
	name: string;
	type: PlaceTypeType;
	level: number;
	loc?: Location;
	ref?: IRef | null;
}
/**
 * @param {string} name from Place.name (A) + Place.name (B)
 * @param {string?} img from Place.img
 * @param {string} infoF from Indication.forwardInfo
 * @param {string} infoB from Indication.backwardInfo
 * @param {string} lat from Location.lat
 * @param {string} lng from Location.lng
 * @param {string} rad from Location.rad
 *
 * La indicacion tiene la ubicacion y como llegar al nodo B desde el A,
 * NO SE DA INFORMACION SOBRE EL NODO A!!
 */
export interface IIndication {
	name: string;
	img?: string;
	forwardInfo: string;
	backwardInfo: string;
	lat: string;
	lng: string;
	rad: string;
}
/**
 * @param {string} lat from Request
 * @param {string} lng from Request
 */
export interface IUserPos {
	lat: string;
	lng: string;
}
/*
==============================================================
					  ROOM TRACK DEV
==============================================================
*/
/**
 * @param {Place} place from Place
 * @param {Location} location from Location
 * @param {Building?} ref from Building
 */
export interface INode {
	place: Place;
	location: Location;
	ref?: Building | null;
}
/**
 * @param {Place} pA from Place
 * @param {Place} pB from Place
 * @param {Indication} indication from Indication
 */
export interface ILink {
	pA: Place;
	pB: Place;
	indication: Indication;
}
