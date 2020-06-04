import { FindConditions, IsNull } from 'typeorm';

import { db as logger } from '@pandora/logger';
import { ContextType } from '@pandora/entities';

import { Alias } from './models';

export const submit = async (alias: string, fogh: string, ctx: ContextType): Promise<void> => {
	try {
		const entity = Alias.create({
			alias,
			for: fogh,
			context: ctx,
		});

		await entity.save();
	} catch (err) {
		logger.error(`Error submitting alias: ${ctx}:${alias} => ${fogh}`);

		throw err;
	}
};

export const accept = async (alias: string, ctx: ContextType): Promise<Alias | null> => {
	try {
		const entity = await Alias.findOne({ where: { alias, context: ctx } });

		if (!entity) {
			return null;
		}

		entity.status = true;

		await entity.save();

		return entity;
	} catch (err) {
		logger.error(`Error accepting alias: ${ctx}:${alias}: ${err.message}`);

		throw err;
	}
};

export const decline = async (alias: string, ctx: ContextType): Promise<void> => {
	try {
		await Alias
			.delete({
				alias,
				context: ctx
			});
	} catch (err) {
		logger.error(`Error declining alias: ${ctx}:${alias}`);

		throw err;
	}
};

export const declineAllUnaccepted = async (fogh: string): Promise<void> => {
	try {
		await Alias
			.delete({
				for: fogh,
				status: IsNull(),
			});
	} catch (err) {
		logger.error(`Error declining aliases for key ${fogh}`);

		throw err;
	}
};

export const list = async (fogh: string | null = null): Promise<Alias[]> => {
	try {
		const options: FindConditions<Alias> = {
			status: IsNull()
		};

		if (fogh) {
			options.for = fogh;
		}

		return await Alias.find(options);
	} catch (err) {
		logger.error(`Error getting alias for ${fogh}`);

		throw err;
	}
};

export const listAll = async (): Promise<Alias[]> => {
	try {
		return await Alias.find();
	} catch (err) {
		logger.error('Error getting aliases');

		throw err;
	}
};

export const get = async (fogh: string | null = null): Promise<Alias[]> => {
	try {
		let options: FindConditions<Alias>;

		if (fogh) {
			options = { for: fogh };
		} else {
			options = { status: true };
		}

		return await Alias.find(options);
	} catch (err) {
		logger.error(`Error getting aliases for ${fogh}`);

		throw err;
	}
};
