export interface ChampionSlotRaw {
	status: string;
	champion_slot: ChampionSlot[];
}

export interface ChampionSlot {
	level: number;
	slot_1: string;
	slot_2: null | string;
	slot_3: null | string;
	id: string;
}
