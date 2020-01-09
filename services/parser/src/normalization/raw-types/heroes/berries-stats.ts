export interface CharacterBerriesRaw {
	status: string;
	character_add_stat_max: CharacterAddStatMax[];
}

export interface CharacterAddStatMax {
	attackpower: number;
	hp: number;
	criticalchance: number;
	armor: number;
	resistance: number;
	criticaldamage: number;
	accuracy: number;
	dodge: number;
	id: string;
}
