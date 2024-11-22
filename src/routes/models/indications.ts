import { Router, type Request } from 'express';
import type { CosmosClient } from '@azure/cosmos';
import {
	modelBodyMiddleware,
	modelQueryMiddleWare,
} from '../../middlewares/request_format';
import {
	createFamilyItem,
	deleteFamilyItem,
	query,
	replaceFamilyItem,
} from '../../database';
import type { ModelType } from '../../types/util';

const router = Router();

/**
 * GET
 */
router.get(
	'/',
	modelQueryMiddleWare('Indications', true),
	async (req: Request, res) => {
		const client: CosmosClient = req.app.get('client');
		const { resources } = await query(client, 'Indications', {
			query: `SELECT * FROM r ${req.querySpec?.query}`,
			parameters: req.querySpec?.parameters,
		});
		res.status(200).json({ data: resources });
	}
);

router.get(
	'/one',
	modelQueryMiddleWare('Indications', false),
	async (req: Request, res) => {
		const client: CosmosClient = req.app.get('client');
		const { resources } = await query(client, 'Indications', {
			query: `SELECT * FROM r ${req.querySpec?.query}`,
			parameters: req.querySpec?.parameters,
		});

		res.status(200).json({ data: resources[0] ?? null });
	}
);

router.get('/one/:id', async (req: Request, res) => {
	if (req.params.id.length < 30) {
		res.status(400).json({
			error: 'bad request',
		});
		return;
	}
	const client: CosmosClient = req.app.get('client');

	const { resources } = await query(client, 'Indications', {
		query: 'SELECT * FROM r WHERE r.id = @id',
		parameters: [
			{
				name: '@id',
				value: req.params.id,
			},
		],
	});

	res.status(200).json({ data: resources[0] ?? null });
});

router.get('/linksof/:name', async (req: Request, res) => {
	if (!req.params.name) {
		res.status(400).json({
			error: 'bad request',
		});
		return;
	}
	const client: CosmosClient = req.app.get('client');

	const { resources } = await query(client, 'Indications', {
		query: 'SELECT * FROM r WHERE r.nameA = @name OR r.nameB = @name',
		parameters: [
			{
				name: '@name',
				value: req.params.name,
			},
		],
	});

	res.status(200).json({
		data: resources,
	});
});

/**
 * POST
 */
router.post(
	'/',
	modelBodyMiddleware('Indications'),
	async (req: Request, res) => {
		const client: CosmosClient = req.app.get('client');

		if (!req.bodySpec) {
			res.status(400).json({
				msg: 'bad request',
			});
			return;
		}

		try {
			let results: Array<{ success: boolean; item: Object }> = [];
			for (const item of req.bodySpec.items as ModelType[]) {
				const result = await createFamilyItem(client, 'Indications', item);
				results.push({
					success: 200 <= result.statusCode && result.statusCode < 300,
					item: item,
				});
			}
			res.status(200).json({
				data: results,
			});
		} catch {
			res.status(500).json({
				msg: 'interal server error',
			});
		}
	}
);

/**
 * DELETE
 */
router.delete(
	'/',
	modelQueryMiddleWare('Indications', false),
	async (req: Request, res) => {
		const client: CosmosClient = req.app.get('client');

		const { resources } = await query(client, 'Indications', {
			query: `SELECT * FROM r ${req.querySpec?.query}`,
			parameters: req.querySpec?.parameters,
		});

		if (resources.length == 0) {
			res.status(400).json({
				msg: 'No items match',
			});
			return;
		}

		const doc = resources[0];

		const { statusCode } = await deleteFamilyItem(
			client,
			'Indications',
			doc.id,
			doc
		);

		if (200 > statusCode || statusCode >= 300) {
			res.status(500).json({
				msg: 'internal server error',
			});
			return;
		}
		res.status(200).json({
			data: doc,
		});
	}
);

router.delete('/:id', async (req: Request, res) => {
	if (req.params.id.length < 30) {
		res.status(400).json({
			error: 'bad request',
		});
		return;
	}

	const client: CosmosClient = req.app.get('client');
	const { resources } = await query(client, 'Indications', {
		query: 'SELECT * FROM r WHERE r.id = @id',
		parameters: [
			{
				name: '@id',
				value: req.params.id,
			},
		],
	});

	if (resources.length == 0) {
		res.status(400).json({
			msg: 'No items match',
		});
		return;
	}

	const doc = resources[0];

	const { statusCode } = await deleteFamilyItem(
		client,
		'Indications',
		doc.id,
		doc
	);

	if (200 > statusCode || statusCode >= 300) {
		res.status(500).json({
			msg: 'internal server error',
		});
		return;
	}

	res.status(200).json({
		data: doc,
	});
});

/**
 * PUT
 */
router.put(
	'/:id',
	modelBodyMiddleware('Indications'),
	async (req: Request, res) => {
		if (
			req.params.id.length < 30 ||
			!req.bodySpec ||
			!req.bodySpec.items.length
		) {
			res.status(400).json({
				error: 'bad request',
			});
			return;
		}

		const client: CosmosClient = req.app.get('client');
		const { resources } = await query(client, 'Indications', {
			query: 'SELECT * FROM r WHERE r.id = @id',
			parameters: [
				{
					name: '@id',
					value: req.params.id,
				},
			],
		});

		if (resources.length == 0) {
			res.status(400).json({
				msg: 'No items match',
			});
			return;
		}

		const doc = resources[0];

		const { statusCode, resource } = await replaceFamilyItem(
			client,
			'Indications',
			doc.id,
			req.bodySpec!.items.at(0)!
		);

		if (200 > statusCode || statusCode >= 300) {
			res.status(500).json({
				msg: 'internal server error',
			});
			return;
		}

		res.status(200).json({
			data: resource,
		});
	}
);

export default router;