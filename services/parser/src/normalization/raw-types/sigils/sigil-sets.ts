export interface SigilsSetsRaw {
	status: string;
	carve_stone_set: CarveStoneSet[];
}

export interface CarveStoneSet {
	paircarvestoneid: string;
	name: string;
	desc: string;
	effect: string;
	id: string;
}
