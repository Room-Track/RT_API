import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import type { ISearch } from '../../types/interfaces';
import { query } from '../../database';
import { toISearch } from '../../lib/format';

const router = Router();

const getISearchArrByName = async (
	client: CosmosClient,
	name: string
): Promise<Array<ISearch>> => {
	const { resources } = await query(client, 'Places', {
		query: 'SELECT * FROM r WHERE CONTAINS(r.name, @name)',
		parameters: [
			{
				name: '@name',
				value: name,
			},
		],
	});
	return resources.map((el) => toISearch(el));
};

const getISearchArrByType = async (
	client: CosmosClient,
	type: string
): Promise<Array<ISearch>> => {
	const { resources } = await query(client, 'Places', {
		query: 'SELECT * FROM r WHERE r.type = @type',
		parameters: [
			{
				name: '@type',
				value: type,
			},
		],
	});
	return resources.map((el) => toISearch(el));
};

const getISearchArrByRef = async (
	client: CosmosClient,
	ref: string
): Promise<Array<ISearch>> => {
	const { resources } = await query(client, 'Places', {
		query: 'SELECT * FROM r WHERE r.ref = @ref',
		parameters: [
			{
				name: '@ref',
				value: ref,
			},
		],
	});
	return resources.map((el) => toISearch(el));
};

const getISearchArrByLevel = async (
	client: CosmosClient,
	level: number,
	ref: string
): Promise<Array<ISearch>> => {
	const { resources } = await query(client, 'Places', {
		query: 'SELECT * FROM r WHERE r.ref = @ref AND r.level = @level',
		parameters: [
			{
				name: '@ref',
				value: ref,
			},
			{
				name: '@level',
				value: level,
			},
		],
	});
	return resources.map((el) => toISearch(el));
};

router.get('/', async (req: Request, res) => {
	if (!req.query['by'] || !req.query[req.query['by'].toString()]) {
		res.status(400).json({
			error: 'bad request',
		});
		return;
	}
	const client: CosmosClient = req.app.get('client');

	let result: Array<ISearch> = [];

	if (req.query['by'] == 'name' && req.query['name']) {
		result = await getISearchArrByName(client, req.query['name'].toString());
	} else if (req.query['by'] == 'type' && req.query['type']) {
		result = await getISearchArrByType(client, req.query['type'].toString());
	} else if (
		req.query['by'] == 'level' &&
		req.query['ref'] &&
		req.query['level']
	) {
		result = await getISearchArrByLevel(
			client,
			Number(req.query['level']),
			req.query['ref'].toString()
		);
	} else if (req.query['by'] == 'ref' && req.query['ref']) {
		result = await getISearchArrByRef(client, req.query['ref'].toString());
	}

	res.status(200).json({ data: result });
});

export {
	router,
	getISearchArrByName,
	getISearchArrByLevel,
	getISearchArrByType,
	getISearchArrByRef,
};
