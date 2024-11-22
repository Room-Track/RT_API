import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import { fetchAll, query } from '../../database';

const router = Router();

router.get('/', async (req: Request, res) => {
	const client: CosmosClient = req.app.get('client');

	const { resources: resultIndication } = await fetchAll(client, 'Indications');

	let namesA = new Set();
	let namesB = new Set();

	resultIndication.forEach((item) => {
		namesA.add(item.nameA);
		namesB.add(item.nameB);
	});

	//@ts-ignore
	const names: Set<string> = namesA.union(namesB);

	const { resources: resultLocation } = await query(client, 'Locations', {
		query: 'SELECT * FROM r WHERE ARRAY_CONTAINS(@names, r.name)',
		parameters: [
			{
				name: '@names',
				value: Array.from(names),
			},
		],
	});

	const locations = Object.fromEntries(
		resultLocation.map((item) => [
			item.name as string,
			{
				lat: item.lat,
				lng: item.lng,
				alt: item.alt,
			},
		])
	);

	const polylines = resultIndication.map((item) => {
		const fromLoc = locations[item.nameA];
		const toLoc = locations[item.nameB];
		const from: Array<String> = [fromLoc.lat, fromLoc.lng];
		const to: Array<String> = [toLoc.lat, toLoc.lng];
		return [from, to] as Array<Array<String>>;
	});

	res.status(200).json({
		data: polylines,
	});
});

export default router;
