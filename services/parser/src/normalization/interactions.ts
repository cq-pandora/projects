import { Interaction, InteractionActor } from '@pandora/entities';

import { InteractionsInput } from './input';
import { NormalizationResult } from './common-types';
import { readJSON } from '../util';
import { InteractionsRaw } from './raw-types/interactions';
import { CharacterCostumesRaw } from './raw-types/heroes';
import { Costume } from './raw-types/heroes/skins';

type SkinMapping = Record<string, string>;

export async function normalize(input: InteractionsInput): Promise<NormalizationResult<Interaction>> {
	const interactionsRaw = await readJSON(input.interactionsRawPath) as InteractionsRaw;
	const skinsRaw = await readJSON(input.characterSkinsRawPath) as CharacterCostumesRaw;

	const skinToHeroIds = skinsRaw.costume.reduce((r: SkinMapping, c: Costume) => {
		[r[c.id]] = c.wearable_charid;

		return r;
	}, {} as SkinMapping);

	const result = [] as Interaction[];

	for (const raw of interactionsRaw.hero_easter_egg) {
		const actors = Object
			.entries(raw.eastereggherotext)
			.map(
				([id, text]) => (skinToHeroIds[id]
					? new InteractionActor(skinToHeroIds[id], text, id)
					: new InteractionActor(id, text))
			);

		result.push(new Interaction(raw.id, actors));
	}

	return {
		entities: result,
	};
}
