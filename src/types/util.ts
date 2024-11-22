import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Building, Indication, Place, Location, Group } from './models';
import type { SqlQuerySpec } from '@azure/cosmos';
import type { IIndication, IInfo, IRef, ISearch } from './interfaces';

export type ReqQuerySpec = SqlQuerySpec & {
	length: number;
	fields?: Object;
};

export type ReqBodySpec = {
	items: Object[];
};

declare module 'express' {
	interface Request {
		token?: DecodedIdToken;
		querySpec?: ReqQuerySpec;
		bodySpec?: ReqBodySpec;
	}
}

export type ContainerType =
	| 'Places'
	| 'Locations'
	| 'Buildings'
	| 'Indications'
	| 'Groups';

export type ServerINameType = 'ISearch' | 'IRef' | 'IInfo' | 'IIndication';

export type ServerIModelType = ISearch | IRef | IInfo | IIndication;

export type PlaceTypeType = 'ClassRoom' | 'ComputerLab' | 'Building' | 'Vertex';

export type ModelType = Place | Location | Building | Indication | Group;

export type TempDataType = {
	Places?: Place[];
	Locations?: Location[];
	Buildings?: Building[];
	Indications?: Indication[];
};
