import {
	berries, bosses, champions, fishes, fishingGear, goddesses, factions, heroes, spSkills, sigils, portraits
} from '@cquest/data-provider';

import { stringTuple } from '../util';

import BerriesEmbed from './BerriesEmbed';
import BossesEmbed from './BossesEmbed';
import ChampionEmbed from './ChampionEmbed';
import FactionsEmbed from './FactionsEmbed';
import FishesEmbed from './FishesEmbed';
import FishingGearsEmbed from './FishingGearsEmbed';
import GoddessesEmbed from './GoddessesEmbed';
import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PortraitsEmbed from './PortraitsEmbed';
import SigilsEmbed from './SigilsEmbed';
import SPSkillEmbed from './SPSkillEmbed';
import {
	HeroBlockEmbed, HeroFormsEmbed, HeroSBWEmbed, HeroSkinsEmbed
} from './hero';

export const entityCollectionNames = stringTuple('berry', 'boss', 'champion', 'fish', 'fishing-gear',
	'rod', 'bait', 'float', 'goddess', 'faction',
	'block', 'sbw', 'hero', 'skin', 'portrait', 'sigil', 'skill');

export type EntityCollectionName = typeof entityCollectionNames[number];

export interface IEntityCollection {
	readonly size: number;
	embed(initial: InitialMessageSource, index: number): PaginationEmbed;
}

function collection<T>(
	entities: T[],
	// Embeds take differently named options, so every collection supplies its own factory
	factory: (initial: InitialMessageSource, entity: T) => PaginationEmbed
): IEntityCollection {
	return {
		size: entities.length,
		embed: (initial, index) => factory(initial, entities[index]),
	};
}

const locales = ['en_us'];

/** Every entity collection with the embed that shows one of its entities */
export function entityCollections(): Record<EntityCollectionName, IEntityCollection> {
	const gears = fishingGear.list();
	const heroList = heroes.list();
	const gearCollection = (subset: typeof gears) => collection(
		subset,
		(initial, gear) => new FishingGearsEmbed({ initial, gears: gear })
	);

	return {
		berry: collection(berries.list(), (initial, berry) => new BerriesEmbed({ initial, entities: berry })),
		boss: collection(bosses.list(), (initial, boss) => new BossesEmbed({ initial, bosses: boss })),
		champion: collection(champions.list(), (initial, champion) => new ChampionEmbed({ initial, champion })),
		fish: collection(fishes.list(), (initial, fish) => new FishesEmbed({ initial, fishes: fish })),
		'fishing-gear': gearCollection(gears),
		rod: gearCollection(gears.filter(g => g.type === 'item_rod')),
		bait: gearCollection(gears.filter(g => g.type === 'item_bait')),
		float: gearCollection(gears.filter(g => g.type === 'item_float')),
		goddess: collection(
			goddesses.list(),
			(initial, goddess) => new GoddessesEmbed({ initial, goddesses: goddess })
		),
		faction: collection(
			factions.list(),
			(initial, faction) => new FactionsEmbed({ initial, factions: faction })
		),
		block: collection(heroList, (initial, hero) => new HeroBlockEmbed({ initial, hero, locales })),
		sbw: collection(
			heroList.filter(h => h.sbws?.length),
			(initial, hero) => new HeroSBWEmbed({ initial, hero, locales })
		),
		hero: collection(heroList, (initial, hero) => new HeroFormsEmbed({ initial, hero, locales })),
		skin: collection(
			heroList.filter(h => h.skins?.length),
			(initial, hero) => new HeroSkinsEmbed({ initial, hero, locales })
		),
		portrait: collection(
			portraits.list(),
			(initial, portrait) => new PortraitsEmbed({ initial, portraits: portrait.keys })
		),
		sigil: collection(sigils.list(), (initial, sigil) => new SigilsEmbed({ initial, sigs: sigil })),
		skill: collection(
			spSkills.list(),
			(initial, skill) => new SPSkillEmbed({ initial, skill, page: undefined })
		),
	};
}
