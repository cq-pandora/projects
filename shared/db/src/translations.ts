import { FindConditions, getConnection, IsNull } from 'typeorm';

import { db as logger } from '@pandora/logger';

import { Translation } from './models';

const GET_LATEST_VERSION_ACCEPTED_TRANSLATION = `
SELECT t1.* FROM translations t1
INNER JOIN (
    SELECT MAX(string_to_array(version, '.')::int[]) AS intv, key
    FROM translations WHERE status = true
    GROUP BY key
) t2 ON t1.key = t2.key AND string_to_array(version, '.')::int[] = t2.intv
WHERE status = true
`;

export async function submit(key: string, translation: string, version: string): Promise<void> {
	try {
		await Translation
			.create({
				key,
				text: translation,
				version,
				locale: 'en_us', // FIXME locales support
			})
			.save();
	} catch (err) {
		logger.error(`Error submitting translation for review: ${key} = ${translation}`);

		throw err;
	}
}

export async function accept(id: string): Promise<Translation> {
	try {
		await Translation
			.update(id, { status: true });

		return await Translation.findOne(id) as Translation;
	} catch (err) {
		logger.error(`Error accepting translation: ${id}`);

		throw err;
	}
}

export async function decline(id: string): Promise<void> {
	try {
		await Translation
			.update(id, { status: false });
	} catch (err) {
		logger.error(`Error declining translation: ${id}`);

		throw err;
	}
}

export async function declineAllUnaccepted(key: string): Promise<void> {
	try {
		await getConnection()
			.createQueryBuilder()
			.update(Translation)
			.set({ status: false })
			.where({
				status: IsNull(),
				key,
			})
			.execute();
	} catch (err) {
		logger.error(`Error declining translations for key ${key}`);

		throw err;
	}
}

export async function list(key: string | null = null): Promise<Translation[]> {
	try {
		const options: FindConditions<Translation> = {
			status: IsNull(),
		};

		if (key) {
			options.key = key;
		}

		return await Translation
			.find(options);
	} catch (err) {
		logger.error(`Error getting translations: ${key}`);

		throw err;
	}
}

export async function get(key?: string | null): Promise<Translation[]> {
	try {
		if (key) {
			return await Translation.find({
				key
			});
		}

		const rows = await getConnection().query(GET_LATEST_VERSION_ACCEPTED_TRANSLATION);

		return rows as Translation[];
	} catch (err) {
		logger.error(`Error getting translations: ${key}`);

		throw err;
	}
}
