/** Generic currencies (gold, fish coins, ...): keyed by `type`, not by `id` */
export interface ItemsRaw {
	status: string;
	item: Item[];
}

export interface Item {
	type: string;
	value: string | null;
	name: string;
}

export interface MaterialsRaw {
	status: string;
	material: NamedEntry[];
}

export interface RandomBoxesRaw {
	status: string;
	randombox_info: NamedEntry[];
}

export interface NamedEntry {
	id: string;
	name: string;
}
