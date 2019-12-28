import { FindOptions } from 'sequelize';

import { Alias } from './models';

import config from '../config';
import { db as logger } from '../logger';
import { ContextType } from '../common-types';

export const submit = async (alias: string, fogh: string, ctx: ContextType): Promise<void> => {
	try {
		const entity = new Alias({
			alias,
			for: fogh,
			context: ctx,
			status: null
		});

		await entity.save();
	} catch (err) {
		logger.error(`Error submitting alias: ${ctx}:${alias} => ${fogh}`);

		throw err;
	}
};

export const accept = async (alias: string, ctx: ContextType): Promise<string | null> => {
	try {
		const entity = await Alias.findOne({ where: { alias, context: ctx } });

		if (!entity) {
			return null;
		}

		entity.status = true;

		await entity.save();

		config.aliases.set(entity.context, entity.alias, entity.for);

		return entity.for;
	} catch (err) {
		logger.error(`Error accepting alias: ${ctx}:${alias}: ${err.message}`);

		throw err;
	}
};

export const decline = async (alias: string, ctx: ContextType): Promise<void> => {
	try {
		await Alias
			.destroy({
				where: { alias, context: ctx }
			});
	} catch (err) {
		logger.error(`Error declining alias: ${ctx}:${alias}`);

		throw err;
	}
};

export const declineAllUnaccepted = async (fogh: string): Promise<void> => {
	try {
		await Alias
			.destroy({
				where: { for: fogh, status: { $eq: null } }
			});
	} catch (err) {
		logger.error(`Error declining aliases for key ${fogh}`);

		throw err;
	}
};

export const list = async (fogh: string | null = null): Promise<Alias[]> => {
	try {
		const options: FindOptions = {
			where: { status: { $eq: null } }
		};

		if (fogh) {
			// @ts-ignore
			options.where.for = fogh;
		}

		return await Alias.findAll(options);
	} catch (err) {
		logger.error(`Error getting alias for ${fogh}`);

		throw err;
	}
};

export const listAll = async (): Promise<Alias[]> => {
	try {
		return await Alias.findAll();
	} catch (err) {
		logger.error('Error getting aliases');

		throw err;
	}
};

export const get = async (fogh: string | null = null): Promise<Alias[]> => {
	try {
		let options: FindOptions;

		if (fogh) {
			options = { where: { for: fogh } };
		} else {
			options = { where: { status: 1 } };
		}

		return await Alias.findAll(options);
	} catch (err) {
		logger.error(`Error getting aliases for ${fogh}`);

		throw err;
	}
};
