export interface AccessoryRaw {
	name: string;
	desc: string;
	image: string;
	grade: number;
	maxoption: number;
	raritytype: string;
	settype: string;
	setid: string | null;
	priority: number;
	sell_reward_type: string;
	sell_reward_value: string;
	sell_reward_amount: number;
	extract_reward_type: string;
	extract_reward_value: string;
	extract_reward_amount: number;
	optionidjson: string[];
	id: string;
}

export interface AccessoryEarringsRaw {
	status: string;
	accessory_earring: AccessoryRaw[];
}

export interface AccessoryNecklacesRaw {
	status: string;
	accessory_necklace: AccessoryRaw[];
}

export interface AccessoryOptionRaw {
	// shared by all levels of the option
	id: string;
	optioncategory: string;
	optionlevel: number;
	desc: string;
	optiontype: 'STAT' | 'ADDSTATE';
	optionvalue: string;
	optionamount: number;
	simpledesc: string;
	namebasic: string;
}

export interface AccessoryOptionsRaw {
	status: string;
	accessory_option: AccessoryOptionRaw[];
}
