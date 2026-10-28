import {
	berries, bosses, champions, fishes, fishingGear, goddesses, factions, heroes, spSkills, sigils, portraits
} from '@cquest/data-provider';

import { random, stringTuple } from '../util';

import BaseCommand from './abstract/BaseCommand';

import {
	BerriesEmbed, BossesEmbed, ChampionEmbed, FishesEmbed, FishingGearsEmbed, GoddessesEmbed, FactionsEmbed,
	HeroBlockEmbed, HeroFormsEmbed, HeroSBWEmbed, HeroSkinsEmbed, PortraitsEmbed, SigilsEmbed, SPSkillEmbed,
	PaginationEmbed, InitialMessageSource,
} from '../embeds';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';

// Embeds take differently named options, so every collection supplies its own factory
type EmbedFactory<T> = (initial: InitialMessageSource, entity: T) => PaginationEmbed;

interface IPicker {
	pick(initial: InitialMessageSource): PaginationEmbed;
}

class Picker<T> implements IPicker {
	private readonly collection: T[];
	private readonly factory: EmbedFactory<T>;

	constructor(collection: T[], factory: EmbedFactory<T>) {
		this.collection = collection;
		this.factory = factory;
	}

	pick(initial: InitialMessageSource): PaginationEmbed {
		return this.factory(initial, this.collection[random(0, this.collection.length - 1)]);
	}
}

const locales = ['en_us'];

const CollectionValues = stringTuple('berry', 'boss', 'champion', 'fish', 'fishing-gear',
	'rod', 'bait', 'float', 'goddess', 'faction',
	'block', 'sbw', 'hero', 'skin', 'portrait', 'sigil', 'skill');

type CollectionName = typeof CollectionValues[number];

const cmdArgs = {
	collection: ArgumentType.choice({
		choices: CollectionValues.reduce((r, v) => ({
			...r,
			[v.replace('-', ' ')]: v
		}), {}),
		required: true,
		description: 'Collection to pick from',
	}),
};

type Arguments = typeof cmdArgs;

export class PickCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'pick';
	readonly description = 'Pick random entity from specified collection';
	readonly protected = false;

	private pickMapping?: Record<CollectionName, IPicker>;

	private initializePickMapping(): void {
		const fishingGearz = fishingGear.list();
		const heroez = heroes.list();
		const gearPicker = (gears: typeof fishingGearz) => new Picker(
			gears,
			(initial, gear) => new FishingGearsEmbed({ initial, gears: gear })
		);

		this.pickMapping = {
			berry: new Picker(berries.list(), (initial, berry) => new BerriesEmbed({ initial, entities: berry })),
			boss: new Picker(bosses.list(), (initial, boss) => new BossesEmbed({ initial, bosses: boss })),
			champion: new Picker(champions.list(), (initial, champion) => new ChampionEmbed({ initial, champion })),
			fish: new Picker(fishes.list(), (initial, fish) => new FishesEmbed({ initial, fishes: fish })),
			'fishing-gear': gearPicker(fishingGearz),
			rod: gearPicker(fishingGearz.filter(g => g.type === 'item_rod')),
			bait: gearPicker(fishingGearz.filter(g => g.type === 'item_bait')),
			float: gearPicker(fishingGearz.filter(g => g.type === 'item_float')),
			goddess: new Picker(
				goddesses.list(),
				(initial, goddess) => new GoddessesEmbed({ initial, goddesses: goddess })
			),
			faction: new Picker(
				factions.list(),
				(initial, faction) => new FactionsEmbed({ initial, factions: faction })
			),
			block: new Picker(heroez, (initial, hero) => new HeroBlockEmbed({ initial, hero, locales })),
			sbw: new Picker(
				heroez.filter(h => h.sbws?.length),
				(initial, hero) => new HeroSBWEmbed({ initial, hero, locales })
			),
			hero: new Picker(heroez, (initial, hero) => new HeroFormsEmbed({ initial, hero, locales })),
			skin: new Picker(
				heroez.filter(h => h.skins?.length),
				(initial, hero) => new HeroSkinsEmbed({ initial, hero, locales })
			),
			portrait: new Picker(
				portraits.list(),
				(initial, portrait) => new PortraitsEmbed({ initial, portraits: portrait.keys })
			),
			sigil: new Picker(sigils.list(), (initial, sigil) => new SigilsEmbed({ initial, sigs: sigil })),
			skill: new Picker(
				spSkills.list(),
				(initial, skill) => new SPSkillEmbed({ initial, skill, page: undefined })
			),
		};
	}

	async run({ args, reply, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { collection } = args;

		if (this.pickMapping === undefined) {
			this.initializePickMapping();
		}

		if (!(collection in this.pickMapping!)) {
			await reply('Collection not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'collection'
			};
		}

		await this.pickMapping![collection as CollectionName].pick(initial).send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'pick',
			args: JSON.stringify({ collection }),
		};
	}
}

export default new PickCommand();
