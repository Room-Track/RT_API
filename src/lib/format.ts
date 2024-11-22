import type {
	IIndication,
	IInfo,
	ILink,
	INode,
	IRef,
	ISearch,
	IUserPos,
} from '../types/interfaces';
import type { Building, Indication, Location, Place } from '../types/models';
/*
==============================================================
						ROOM TRACK
==============================================================
*/
export function toISearch(place: Place): ISearch {
	return {
		name: place.name,
		type: place.type,
	};
}

export function toIRef(location: Location, building: Building): IRef {
	return {
		name: building.name,
		lowestF: building.lowestF,
		highestF: building.highestF,
		inside: building.inside,
		lat: location.lat,
		lng: location.lng,
	};
}

export function toIInfo(place: Place, location?: Location, ref?: IRef | null): IInfo {
	return {
		name: place.name,
		type: place.type,
		level: place.level,
		loc: location,
		ref: ref,
	};
}

export function toIIndication(
	place: Place,
	location: Location,
	indication: Indication
): IIndication {
	return {
		name: place.name,
		img: place.img,
		forwardInfo: indication.forwardInfo,
		backwardInfo: indication.backwardInfo,
		lat: location.lat,
		lng: location.lng,
		rad: location.rad,
	};
}

export function toIUserPos(lat: string, lng: string): IUserPos {
	return {
		lat: lat,
		lng: lng,
	};
}
/*
==============================================================
					  ROOM TRACK DEV
==============================================================
*/
export function toINode(
	place: Place,
	location: Location,
	ref?: Building
): INode {
	return {
		place: place,
		location: location,
		ref: ref,
	};
}

export function toILink(
	placeA: Place,
	placeB: Place,
	indication: Indication
): ILink {
	return {
		pA: placeA,
		pB: placeB,
		indication: indication,
	};
}
