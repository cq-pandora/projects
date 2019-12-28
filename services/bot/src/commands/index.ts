import { ICommand } from '../common-types';

import about from './about';
import alias from './alias';
import bait from './bait';
import berry from './berry';
import block from './block';
import boss from './boss';
import champion from './champion';
import eval from './eval';
import faction from './faction';
import fish from './fish';
import float from './float';
import goddess from './goddess';
import help from './help';
import hero from './hero';
import inherit from './inherit';
import lenny from './lenny';
import links from './links';
import manageAliases from './manage-aliases';
import manageTranslations from './manage-translations';
import math from './math';
import permissions from './permissions';
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

const commands: ICommand[] = [
	about, alias, bait, berry, block, boss, champion, eval, faction, fish, float, goddess, help, hero, inherit,
	lenny, links, manageAliases, manageTranslations, math, permissions, pick, ping, portrait, print, pull, rod,
	sbwBlock, sbw, sigil, skin, spSkill, translate, waifu,
];

export default commands;
