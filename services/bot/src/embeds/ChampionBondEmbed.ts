import { ChampionBond, ChampionBondLevel } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { imageUrl, statsToString, toClearNumber } from '../util/functions';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

const MILESTONES = [1, 10, 25, 50, 75, 100];

interface IChampionBondEmbedOptions {
	initial: InitialMessageSource;
	bond: ChampionBond;
	// Specific bond level to show stats for, all milestones otherwise
	level?: ChampionBondLevel;
}

function levelStats(level: ChampionBondLevel): string {
	return statsToString({
		hp: level.hp,
		atkPower: level.atkPower,
		critChance: level.critChance,
		critDmg: level.critDmg,
	});
}

export default class ChampionBondEmbed extends PaginationEmbed {
	constructor({ initial, bond, level }: IChampionBondEmbedOptions) {
		super({ initial });

		const shownLevels = level
			? [level]
			: bond.levels.filter(bondLevel => MILESTONES.includes(bondLevel.level));

		const statsPage = new PandoraEmbed()
			.setTitle(l('TEXT_CHAMPION_LINK_BUFF'))
			.setDescription(`${l('TEXT_CHAMPION_LINK_STAT_BONUS_DESC_1')}\n${l('TEXT_CHAMPION_LINK_STAT_BONUS_DESC_2')}`);

		for (const shown of shownLevels) {
			const toNext = shown.exp ? `\nNext level: ${toClearNumber(shown.exp)} bond exp` : '';

			statsPage.addField(`Bond Lv. ${shown.level}`, `${levelStats(shown)}${toNext}`, true);
		}

		const skillPages = bond.skills.map(skill => {
			const learned = skill.level > 1 ? `at bond Lv. ${skill.level}` : 'when the bond is formed';
			const heroes = `${skill.requiredHeroes} ${skill.requiredHeroType} hero${skill.requiredHeroes > 1 ? 'es' : ''}`;

			return new PandoraEmbed()
				.setTitle(`${l(skill.name)} (${l('TEXT_CHAMPION_SKILL_TYPE_LINK')})`)
				.setThumbnail(imageUrl(`skills/${skill.image}`))
				.setDescription(l(skill.description))
				.addField('Learned', learned, true)
				.addField('Requires', `Send ${heroes} of the faction at inheritance Lv. ${skill.requiredInheritance}+`, true)
				.toEmbed();
		});

		this.setArray([statsPage.toEmbed(), ...skillPages]);
	}
}
