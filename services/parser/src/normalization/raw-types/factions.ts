export interface FactionsRaw {
	status: string;
	champion_domain: ChampionDomain[];
}

export interface ChampionDomain {
	name: string;
	order: number;
	emblem_image: string;
	championid: string;
	npc: string;
	unlockid: string[];
	levelupinfo: Levelupinfo[];
	maxlevel: number;
	background_image: BackgroundImage;
	championunlockcutscene: string;
	isactive: boolean;
	id: string;
}

export enum BackgroundImage {
	UIBgimageChampion04 = 'ui_bgimage_champion_04',
}

export interface Levelupinfo {
	level: number;
	exp: number;
	cutscene: string;
}
