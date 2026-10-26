import {
	Accessory, AccessoryOption, AccessoryOptionLevel, AccessoryType
} from '@cquest/entities';

import { NormalizationResult } from './common-types';
import { AccessoriesNormalizationInput } from './input';

import { readJSON, groupBy } from '../util';

import {
	AccessoryEarringsRaw, AccessoryNecklacesRaw, AccessoryOptionsRaw, AccessoryRaw
} from './raw-types/accessories';

export async function normalize(input: AccessoriesNormalizationInput): Promise<NormalizationResult<Accessory>> {
	const earringsRaw = await readJSON(input.accessoryEarringsRawPath) as AccessoryEarringsRaw;
	const necklacesRaw = await readJSON(input.accessoryNecklacesRawPath) as AccessoryNecklacesRaw;
	const optionsRaw = await readJSON(input.accessoryOptionsRawPath) as AccessoryOptionsRaw;

	// Every level of an option shares the option id
	const options = Object.fromEntries(
		Object.entries(groupBy(optionsRaw.accessory_option, 'id')).map(([id, levels]) => {
			const sorted = levels.sort((a, b) => a.optionlevel - b.optionlevel);

			return [id, new AccessoryOption({
				id,
				name: sorted[0].namebasic,
				type: sorted[0].optiontype === 'STAT' ? 'stat' : 'effect',
				levels: sorted.map(raw => new AccessoryOptionLevel({
					level: raw.optionlevel,
					value: raw.optionamount,
					description: raw.desc,
					shortDescription: raw.simpledesc,
				})),
			})];
		})
	);

	const toAccessory = (type: AccessoryType) => (raw: AccessoryRaw): Accessory => new Accessory({
		id: raw.id,
		type,
		name: raw.name,
		description: raw.desc,
		image: raw.image,
		grade: raw.grade,
		rarity: raw.raritytype.toLowerCase(),
		maxOptions: raw.maxoption,
		sellPrice: raw.sell_reward_amount,
		extractAntimatter: raw.extract_reward_amount,
		options: raw.optionidjson.map(id => {
			if (!options[id]) throw new Error(`Unknown accessory option ${id} for ${raw.id}`);

			return options[id];
		}),
	});

	const accessories = [
		...earringsRaw.accessory_earring.sort((a, b) => a.priority - b.priority).map(toAccessory('earring')),
		...necklacesRaw.accessory_necklace.sort((a, b) => a.priority - b.priority).map(toAccessory('necklace')),
	];

	return {
		entities: accessories,
		translationIndex: accessories.reduce(
			(r, v, idx) => {
				r[v.name] = idx;

				return r;
			},
			{} as Record<string, number>
		),
	};
}
