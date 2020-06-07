import { Message } from 'discord.js';

import { GenericConstructor } from '@cquest/entities';

import { random } from '../util';

import BaseCommand from './abstract/BaseCommand';

import {
	BerriesEmbed, BossesEmbed, ChampionEmbed, FishesEmbed, FishingGearsEmbed, GoddessesEmbed, FactionsEmbed,
	HeroBlockEmbed, HeroFormsEmbed, HeroSBWEmbed, HeroSkinsEmbed, PortraitsEmbed, SigilsEmbed, SPSkillEmbed,
	PaginationEmbed,
} from '../embeds';

import {
	berries, bosses, champions, fishes, fishingGear, goddesses, factions, heroes, spSkills, sigils, portraits
} from '../cq-data';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';


class Picker<T> {
	private readonly collection: T[];
	private readonly embed: GenericConstructor<PaginationEmbed>;

	constructor(collection: T[], embed: GenericConstructor<PaginationEmbed>) {
		this.collection = collection;
		this.embed = embed;
	}

	pick(message: Message): PaginationEmbed {
		// @ts-ignore
		// eslint-disable-next-line new-cap
		return new this.embed(message, this.collection[random(0, this.collection.length - 1)]);
	}
}

const fishingGearz = fishingGear.list();
const heroez = heroes.list();

const pickMapping: Record<string, Picker<object>> = {
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

const cmdArgs: CommandArguments = {
	collection: {
		required: true,
		description: `Collection to pick from.\nCan be one of ${Object.keys(pickMapping).join(', ')}`,
	}
};

export class PickCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'pick';
	readonly description = 'Pick random entity from specified collection';
	readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const collection = args[0].toLowerCase();

		const picker = pickMapping[collection];

		if (!picker) {
			await message.channel.send('Collection not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'collection'
			};
		}

		await picker.pick(message).send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'pick',
			args: JSON.stringify({ collection }),
		};
	}
}

export default new PickCommand();
