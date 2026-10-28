export interface FisheriesRaw {
	status: string;
	fishery: Fishery[];
}

export interface Fishery {
	id: string;
	name: string;
	desc: string;
	fish: string[];
	junk: string[];
	hero: string[];
	boss: string | null;
	/** Fish Tome reward for collecting every fish of the spot */
	bonustype: string | null;
	bonusvalue: string | null;
	bonusamount: number;
}
