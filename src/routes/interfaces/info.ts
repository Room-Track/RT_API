import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import type { IInfo, IRef } from '../../types/interfaces';
import { query } from '../../database';
import { toIInfo } from '../../lib/format';
import { getIRefByName } from './ref';

const router = Router();

const getIInfoByName = async (
	client: CosmosClient,
	name: String
): Promise<IInfo | null> => {
	const { resources } = await query(client, 'Places', {
		query: 'SELECT * FROM r WHERE r.name = @name',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});

	let resultLoc: any[] = [];

	const { resources: resultLocOne } = await query(client, 'Locations', {
		query: 'SELECT * FROM r WHERE r.name = @name',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});
	resultLoc = resultLocOne;

	if (!resultLoc.length) {
		const { resources: resultGroup } = await query(client, 'Groups', {
			query: 'SELECT * FROM r WHERE r.name = @name',
			parameters: [
				{
					name: '@name',
					value: name,
				},
			]
		});
		if (resultGroup.length) {
			const docGroup = resultGroup[0];
			const { resources: resultLocTwo } = await query(client, 'Locations', {
				query: 'SELECT * FROM r WHERE r.name = @name',
				parameters: [
					{
						name: '@name',
						value: docGroup.of,
					},
				],
			});
			resultLoc = resultLocTwo;
		}
	}

	if (!resources.length) return null;


	let ref: IRef | null = null;

	if (resources[0].ref) {
		ref = await getIRefByName(client, resources[0].ref);
	}

	return toIInfo(resources[0], resultLoc.length ? resultLoc[0] : null, ref);
};

router.get('/', async (req: Request, res) => {
	if (!req.query['by'] || !req.query[req.query['by'].toString()]) {
		res.status(400).json({
			error: 'bad request',
		});
		return;
	}
	const client: CosmosClient = req.app.get('client');

	let result: IInfo | null = null;

	if (req.query['by'] == 'name' && req.query['name']) {
		result = await getIInfoByName(client, req.query['name'].toString());
	}

	res.status(200).json({ data: result });
});

export { router, getIInfoByName };
