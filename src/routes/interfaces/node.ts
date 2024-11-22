import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import type { INode } from '../../types/interfaces';
import { fetchAll, query } from '../../database';
import { toINode } from '../../lib/format';

const router = Router();

const getINode = async (client: CosmosClient, name: String) => {
	const { resources: resultLocations } = await query(client, 'Locations', {
		query: 'SELECT * FROM r WHERE r.name = @name',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});
	const { resources: resultPlaces } = await query(client, 'Places', {
		query: 'SELECT * FROM r WHERE r.name = @name',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});
	let resultRef = null;
	if (resultPlaces.length != 0 && resultPlaces[0].ref) {
		const { resources } = await query(client, 'Buildings', {
			query: 'SELECT * FROM r WHERE r.name = @name',
			parameters: [
				{
					name: '@name',
					value: resultPlaces[0].ref,
				},
			],
		});
		resultRef = resources[0];
	}
	if (!resultLocations.length || !resultPlaces.length) return null;
	return toINode(resultPlaces[0], resultLocations[0], resultRef);
};

router.get('/', async (req: Request, res) => {
	if (!req.query['name']) {
		res.status(400).json({
			error: 'bad request',
		});
		return;
	}

	const client: CosmosClient = req.app.get('client');

	const result = await getINode(client, req.query['name'].toString());

	res.status(200).json({
		data: result,
	});
});

export { router };
