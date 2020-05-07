import { Interaction, InteractionActor } from '@pandora/entities';

import { InteractionsInput } from './input';
import { NormalizationResult } from './common-types';
import { readJSON } from '../util';
import { InteractionsRaw } from './raw-types/interactions';
import { CharacterCostumesRaw, CharacterVisualRaw } from './raw-types/heroes';

type Mapping = Record<string, string>;

export async function normalize(input: InteractionsInput): Promise<NormalizationResult<Interaction>> {
	const interactionsRaw = await readJSON(input.interactionsRawPath) as InteractionsRaw;
	const skinsRaw = await readJSON(input.characterSkinsRawPath) as CharacterCostumesRaw;
	const characterVisualRaw = await readJSON(input.charactersGeneralInfoRawPath) as CharacterVisualRaw;

	const heroesImageKeyMapping = {} as Mapping;

	for (const c of characterVisualRaw.character_visual) {
		heroesImageKeyMapping[c.id] = c.face_tex;
	}

	const skinImageKeysMapping = {} as Mapping;
	const skinToHeroIdMapping = {} as Mapping;

	for (const c of skinsRaw.costume) {
		skinImageKeysMapping[c.id] = c.face_tex;
		[skinToHeroIdMapping[c.id]] = c.wearable_charid;
	}

	const result = [] as Interaction[];

	for (const raw of interactionsRaw.hero_easter_egg) {
		const actors = Object
			.entries(raw.eastereggherotext)
			.map(
				([id, text]) => {
					if (skinImageKeysMapping[id]) {
						return new InteractionActor(
							{
								id: skinToHeroIdMapping[id],
								text,
								imageKey: skinImageKeysMapping[id],
							}
						);
					}

					return new InteractionActor({
						id,
						text,
						imageKey: heroesImageKeyMapping[id],
					});
				}
			);

		result.push(new Interaction({
			id: raw.id,
			actors,
		}));
	}

	return {
		entities: result,
	};
}
