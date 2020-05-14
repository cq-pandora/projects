import { FindOptions } from 'sequelize';

import sequelize, { Translation } from './models';
import { localizations } from '../cq-data';
import config from '../config';
import { db as logger } from '../logger';

const GET_LATEST_VERSION_ACCEPTED_TRANSLATION = `
SELECT t1.* FROM translations t1
INNER JOIN (
    SELECT MAX(INET_ATON(\`version\` + '.0')) AS intv, \`key\`
    FROM translations WHERE \`status\` = 1
    GROUP BY \`key\`
) t2 ON t1.\`key\` = t2.\`key\` AND INET_ATON(t1.version + '.0') = t2.intv
WHERE \`status\` = 1
`;

export async function submit(key: string, translation: string): Promise<void> {
	try {
		await Translation
			.create({
				key,
				text: translation,
				version: config.gameVersion
			});
	} catch (err) {
		logger.error(`Error submitting translation for review: ${key} = ${translation}`);

		throw err;
	}
}

export async function accept(id: string): Promise<void> {
	try {
		await Translation
			.update({
				status: true,
			}, {
				where: { id }
			});

		const one = await Translation.findOne({
			where: { id }
		}) as Translation;

		localizations[one.locale][one.key] = one;
	} catch (err) {
		logger.error(`Error accepting translation: ${id}`);

		throw err;
	}
}

export async function decline(id: string): Promise<void> {
	try {
		await Translation
			.update({
				status: false,
			}, {
				where: { id }
			});
	} catch (err) {
		logger.error(`Error declining translation: ${id}`);

		throw err;
	}
}

export async function declineAllUnaccepted(key: string): Promise<void> {
	try {
		await Translation
			.update({
				status: false,
			}, {
				where: { status: { $eq: null }, key }
			});
	} catch (err) {
		logger.error(`Error declining translations for key ${key}`);

		throw err;
	}
}

export async function list(key: string | null = null): Promise<Translation[]> {
	try {
		const options: FindOptions = {
			where: { status: { $eq: null } }
		};

		if (key) {
			// @ts-ignore
			options.where.key = key;
		}

		return await Translation
			.findAll(options);
	} catch (err) {
		logger.error(`Error getting translations: ${key}`);

		throw err;
	}
}

export async function get(key?: string | null): Promise<Translation[]> {
	try {
		if (key) {
			return await Translation.findAll({
				where: { key },
			});
		}

		const [rows] = await sequelize.query({
			query: GET_LATEST_VERSION_ACCEPTED_TRANSLATION,
			values: [key],
		});

		return rows as Translation[];
	} catch (err) {
		logger.error(`Error getting translations: ${key}`);

		throw err;
	}
}
