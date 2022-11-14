import { Message } from 'discord.js';

import { GenericConstructor } from '@cquest/entities';
import {
	berries, bosses, champions, fishes, fishingGear, goddesses, factions, heroes, spSkills, sigils, portraits
} from '@cquest/data-provider';

import { random, stringTuple } from '../util';

import BaseCommand from './abstract/BaseCommand';

import {
	BerriesEmbed, BossesEmbed, ChampionEmbed, FishesEmbed, FishingGearsEmbed, GoddessesEmbed, FactionsEmbed,
	HeroBlockEmbed, HeroFormsEmbed, HeroSBWEmbed, HeroSkinsEmbed, PortraitsEmbed, SigilsEmbed, SPSkillEmbed,
	PaginationEmbed,
} from '../embeds';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';

class Picker<T> {
	private readonly collection: T[];
	private readonly embed: GenericConstructor<PaginationEmbed>;

	constructor(collection: T[], embed: GenericConstructor<PaginationEmbed>) {
		this.collection = collection;
		this.embed = embed;
	}

	pick(message?: Message): PaginationEmbed {
		// eslint-disable-next-line new-cap
		return new this.embed(message, this.collection[random(0, this.collection.length - 1)]);
	}
}

const CollectionValues = stringTuple('berry', 'boss', 'champion', 'fish', 'fishing-gear',
	'rod', 'bait', 'float', 'goddess', 'faction', 'block', 'sbw', 'hero',
	'skin', 'portrait', 'sigil', 'skill');

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

	private pickMapping?: Record<CollectionName, Picker<object>>;

	private initializePickMapping(): void {
		const fishingGearz = fishingGear.list();
		const heroez = heroes.list();

		this.pickMapping = {
			berry: new Picker(berries.list(), BerriesEmbed),
			boss: new Picker(bosses.list(), BossesEmbed),
			champion: new Picker(champions.list(), ChampionEmbed),
			fish: new Picker(fishes.list(), FishesEmbed),
			'fishing-gear': new Picker(fishingGearz, FishingGearsEmbed),
			rod: new Picker(fishingGearz.filter(g => g.type === 'item_rod'), FishingGearsEmbed),
			bait: new Picker(fishingGearz.filter(g => g.type === 'item_bait'), FishingGearsEmbed),
			float: new Picker(fishingGearz.filter(g => g.type === 'item_float'), FishingGearsEmbed),
			goddess: new Picker(goddesses.list(), GoddessesEmbed),
			faction: new Picker(factions.list(), FactionsEmbed),
			block: new Picker(heroez, HeroBlockEmbed),
			sbw: new Picker(heroez.filter(h => h.sbws?.length), HeroSBWEmbed),
			hero: new Picker(heroez, HeroFormsEmbed),
			skin: new Picker(heroez.filter(h => h.skins?.length), HeroSkinsEmbed),
			portrait: new Picker(portraits.list(), PortraitsEmbed),
			sigil: new Picker(sigils.list(), SigilsEmbed),
			skill: new Picker(spSkills.list(), SPSkillEmbed),
		};
	}

	async run({ args, reply }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
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

		await this.pickMapping![collection as CollectionName].pick(undefined).send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'pick',
			args: JSON.stringify({ collection }),
		};
	}
}

export default new PickCommand();
