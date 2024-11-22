import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import type { IIndication } from '../../types/interfaces';
import { query } from '../../database';
import { toIIndication } from '../../lib/format';

const router = Router();

const getIIndicationByName = async (
	client: CosmosClient,
	name: string
): Promise<IIndication | null> => {
	const { resources: resultIndication } = await query(client, 'Indications', {
		query: 'SELECT * FROM r WHERE r.nameA = @name OR r.nameB = @name',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});
	if (!resultIndication.length) return null;

	const { resources: resultLocations } = await query(client, 'Locations', {
		query: 'SELECT * FROM r WHERE r.name = @name',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});

	if (!resultLocations.length) return null;

	const { resources: resultPlaces } = await query(client, 'Places', {
		query: 'SELECT * FROM r WHERE r.name = @name',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});

	if (!resultPlaces.length) return null;

	return toIIndication(
		resultPlaces[0],
		resultLocations[0],
		resultIndication[0]
	);
};

router.get('/', async (req: Request, res) => {
	if (!req.query['by'] || !req.query[req.query['by'].toString()]) {
		res.status(400).json({
			error: 'bad request',
		});
		return;
	}
	const client: CosmosClient = req.app.get('client');

	let result: IIndication | null = null;

	if (req.query['by'] == 'name' && req.query['name']) {
		result = await getIIndicationByName(client, req.query['name'].toString());
	}

	res.status(200).json({ data: result });
});

export { router, getIIndicationByName };
