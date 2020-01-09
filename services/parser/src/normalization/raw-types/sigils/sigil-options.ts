export interface SigilsStatsRaw {
	status: string;
	carve_stone_option: CarveStoneOption[];
}

export interface CarveStoneOption {
	desc: string;
	addstateid: null;
	atkpower: number;
	maxhp: number;
	def: number;
	rst: number;
	critrate: number;
	critpowerrate: number;
	accuracyrate: number;
	dodgerate: number;
	penetratedef: number;
	penetraterst: number;
	receivedmgrate: number;
	vamprate: number;
	atkspd: number;
	critdodgerate: number;
	id: string;
}
