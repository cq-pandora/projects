export interface ChampionBondLevelRaw {
	levelupexp: number;
	maxhp: number;
	atkpower: number;
	critrate: number;
	critpowerrate: number;
	unlocktargetrarity: string | null;
	unlocktargetepiclevel: number;
	unlocktargetamount: number;
	unlockskill: string | null;
	// bond level
	id: number;
}

export interface ChampionBondRaw {
	status: string;
	champion_link_level_stat_unlock: ChampionBondLevelRaw[];
}
