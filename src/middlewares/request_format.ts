import type { NextFunction, Response, Request } from 'express';
import type { ContainerType, ModelType, ServerINameType } from '../types/util';

type FieldType = {
	name: string;
	type: Object;
	required: boolean;
	contains?: boolean;
};


export function getModelFields(
	model: ContainerType,
	array: boolean
): Array<FieldType> {
	switch (model) {
		case 'Groups':
			return [
				{ name: 'name', required: true, type: String, contains: array },
				{ name: 'of', required: true, type: String, contains: array },
			];
		case 'Places':
			return [
				{ name: 'name', required: true, type: String, contains: array },
				{ name: 'type', required: true, type: String },
				{ name: 'level', required: true, type: Number },
				{ name: 'img', required: false, type: String },
				{ name: 'ref', required: false, type: String },
			];
		case 'Buildings':
			return [
				{ name: 'name', required: true, type: String, contains: array },
				{ name: 'inside', required: true, type: Boolean },
				{ name: 'lowestF', required: true, type: Number },
				{ name: 'highestF', required: true, type: Number },
			];
		case 'Locations':
			return [
				{ name: 'name', required: true, type: String, contains: array },
				{ name: 'lat', required: true, type: String },
				{ name: 'lng', required: true, type: String },
				{ name: 'alt', required: true, type: String },
				{ name: 'rad', required: true, type: String },
			];
		case 'Indications':
			return [
				{
					name: 'nameA',
					required: true,
					type: String,
					contains: true && array,
				},
				{
					name: 'nameB',
					required: true,
					type: String,
					contains: array,
				},
				{
					name: 'forwardInfo',
					required: true,
					type: String,
					contains: array,
				},
				{
					name: 'backwardInfo',
					required: true,
					type: String,
					contains: array,
				},
			];

		default:
			return [];
	}
}

export function modelQueryMiddleWare(model: ContainerType, array: boolean) {
	const modelFields = getModelFields(model, array);
	return (
		req: Request<any, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction
	): void | Promise<void> => {
		const queryFields = Object.keys(req.query);
		const matchQueryFields = modelFields.filter((field) =>
			queryFields.some((name) => name == field.name)
		);
		if (!matchQueryFields.length && array) {
			req.querySpec = {
				length: 0,
				query: '',
			};
			next();
			return;
		} else if (!matchQueryFields.length) {
			res.status(400).json({
				error: 'bad request',
			});
			return;
		}
		const queryObj = new Map<string, any>();
		for (const field of matchQueryFields) {
			queryObj.set(field.name, req.query[field.name]);
		}
		req.querySpec = {
			length: matchQueryFields.length,
			fields: Object.fromEntries(queryObj.entries()),
			query: matchQueryFields
				.map((field, index) => {
					let leading = index == 0 ? 'WHERE ' : 'AND ';
					return field.contains && array
						? `${leading}CONTAINS(r.${field.name}, @${field.name})`
						: `${leading}r.${field.name} = @${field.name}`;
				})
				.join(' '),
			parameters: [
				...matchQueryFields.map((field) => {
					return {
						name: `@${field.name}`,
						value: queryObj.get(field.name),
					};
				}),
			],
		};
		next();
	};
}

export function modelBodyMiddleware(model: ContainerType) {
	const modelFields = getModelFields(model, false);
	return (
		req: Request<any, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction
	): void | Promise<void> => {
		if (!req.body['data']) {
			res.status(400).json({
				msg: "'data' field is needed on body",
			});
			return;
		}
		try {
			const data = req.body['data'] as Array<ModelType>;
			if (data.length == 0) {
				res.status(400).json({
					msg: "'data' must contain at least 1 item",
				});
				return;
			}
			const matchBodyFieldsVerified = objectsSameKeys(data, modelFields);
			if (matchBodyFieldsVerified.length == 0) {
				res.status(400).json({
					msg: 'The items in data field does not match the type: ' + model,
				});
				return;
			}
			const items = getObjectsFromKeys(data, matchBodyFieldsVerified);
			req.bodySpec = {
				items: items,
			};
			next();
		} catch {
			res.status(400).json({
				msg: 'data field in body needs to be an array',
			});
		}
	};
}

function objectsSameKeys(arr: Array<Object>, arrField: Array<FieldType>) {
	let mutableArray: Array<FieldType> = [];
	for (const obj of arr) {
		const objFields = Object.keys(obj);
		for (const field of arrField) {
			const includes = objFields.includes(field.name);
			if (field.required && !includes) {
				return [];
			} else if (includes) {
				mutableArray.push(field);
			}
		}
	}
	return mutableArray;
}
function getObjectsFromKeys(arr: Array<Object>, arrField: Array<FieldType>) {
	return arr.map((item) => {
		const map = new Map<string, any>();
		for (const field of arrField) {
			//@ts-ignore
			map.set(field.name, item[field.name]);
		}
		return Object.fromEntries(map.entries());
	});
}
