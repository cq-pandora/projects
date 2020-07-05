import {
	Deserialize, DeserializeSingle, Berry, Boss, Bread, Champion, Faction, Fish, FishingGear, Goddess,
	Hero, Inheritance, Interaction, Portrait, Sigil, SpSkill, Scarecrow,
} from '@cquest/entities';

import { loadInfo } from '../utils';

import { InteractionsSearchable } from './InteractionsSearchable';
import { arraySearchable, objectSearchable } from './instantiators';
import { HeroKeysDescription } from './common';

export { extractResult } from './common';

export const berries = arraySearchable('berries', Berry);
export const bosses = arraySearchable('bosses', Boss);
export const breads = arraySearchable('breads', Bread);
export const champions = arraySearchable('champions', Champion);
export const goddesses = arraySearchable('goddesses', Goddess);
export const heroes = arraySearchable('heroes', Hero);
export const sigils = arraySearchable('sigils', Sigil);
export const factions = arraySearchable('factions', Faction);
export const spSkills = arraySearchable('sp', SpSkill, 'sp_skills');
export const fishes = arraySearchable('fishes', Fish);
export const fishingGear = arraySearchable('fish-gear', FishingGear, 'fishing_gear');
export const scarecrows = arraySearchable('scarecrows', Scarecrow);
export const interactions = new InteractionsSearchable(Deserialize(loadInfo('interactions'), Interaction));

export const inheritance = DeserializeSingle<Inheritance>(loadInfo('inheritance'), 'Inheritance');

export const portraits = objectSearchable<Portrait>('portraits', 'Portraits');

export const heroKeysDescription = JSON.parse(loadInfo('heroes_translations_indices')) as HeroKeysDescription;
