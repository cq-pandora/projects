export interface GoddessesRaw {
	status: string;
	sister: Sister[];
}

export interface Sister {
	name: string;
	priority: number;
	skillname: string;
	skilldesc: string;
	skin_tex: string;
	dsp_tex: string;
	init_vfx: string;
	animation: null;
	bgeffect: null | string;
	bgduration: number;
	skillhandlerjson: Skillhandlerjson;
	fbliketextureid: string;
	fbliketextid: string;
	audiokey: string;
	ui_ingame_face: string;
	id: string;
}

export interface Skillhandlerjson {
	sisSkillHandlers: SisSkillHandler[];
}

export interface SisSkillHandler {
	target: Target;
	value?: number;
	duration?: number;
	stat?: string;
	Ignore_Time_Scale: boolean;
	'string.value'?: string;
	vfx?: string;
	'value.target'?: string;
	ResistCleanse?: boolean;
	condition?: Condition;
	'value.greater'?: number;
}

export enum Condition {
	Finish = 'Finish',
}

export enum Target {
	Ally = 'ALLY',
	Enemy = 'ENEMY',
}
