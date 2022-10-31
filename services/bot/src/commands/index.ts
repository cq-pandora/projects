import { ICommand } from '../common-types';

import about from './about';
import alias from './alias';
import bait from './bait';
import berry from './berry';
import block from './block';
import boss from './boss';
import champion from './champion';
import faction from './faction';
import fish from './fish';
import float from './float';
import goddess from './goddess';
import hero from './hero';
import inherit from './inherit';
import lenny from './lenny';
import links from './links';
import manageAliases from './manage-aliases';
import manageTranslations from './manage-translations';
import math from './math';
import pick from './pick';
import ping from './ping';
import portrait from './portrait';
import print from './print';
import pull from './pull';
import rod from './rod';
import sbwBlock from './sbw-block';
import sbw from './sbw';
import sigil from './sigil';
import skin from './skin';
import spSkill from './sp-skill';
import translate from './translate';
import waifu from './waifu';
import interactions from './interactions';
import scarecrows from './scarecrows';

const commands: ICommand<any>[] = [
	about, alias, bait, berry, block, boss, champion, faction, fish, float, goddess, hero, inherit,
	lenny, links, manageAliases, manageTranslations, math, pick, ping, portrait, print, pull, rod,
	sbwBlock, sbw, sigil, skin, spSkill, translate, waifu, interactions, scarecrows
];

export default commands;
