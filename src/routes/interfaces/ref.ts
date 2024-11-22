import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import type { IRef } from '../../types/interfaces';
import { query } from '../../database';
import { toIRef } from '../../lib/format';

const router = Router();

const getIRefByName = async (
	client: CosmosClient,
	name: string
): Promise<IRef | null> => {
	const { resources: resultBuildings } = await query(client, 'Buildings', {
		query: 'SELECT * FROM r WHERE r.name = @name',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});

	if (!resultBuildings.length) return null;

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

	return toIRef(resultLocations[0], resultBuildings[0]);
};

router.get('/', async (req: Request, res) => {
	if (!req.query['by'] || !req.query[req.query['by'].toString()]) {
		res.status(400).json({
			error: 'bad request',
		});
		return;
	}
	const client: CosmosClient = req.app.get('client');

	let result: IRef | null = null;

	if (req.query['by'] == 'name' && req.query['name']) {
		result = await getIRefByName(client, req.query['name'].toString());
	}

	res.status(200).json({ data: result });
});

export { router, getIRefByName };
