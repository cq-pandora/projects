export interface SPSkillsRaw {
	status:   string;
	sp_skill: SPSkill[];
}

export interface SPSkill {
	name:             string;
	desc:             string;
	level:            number;
	class:            Class;
	type:             SPSkillType;
	property:         Property;
	icon:             string;
	bufficon:         Bufficon | null;
	skillhandlerjson: Skillhandlerjson[];
	simpledesc:       string;
	speechpanel:      Speechpanel;
	unlockcond:       Unlockcond;
	costjson:         Costjson[];
	id:               string;
}

export enum Bufficon {
	Atk = "ATK",
	Def = "DEF",
	Spd = "SPD",
}

export enum Class {
	ClaArcher = "CLA_ARCHER",
	ClaHunter = "CLA_HUNTER",
	ClaObject = "CLA_OBJECT",
	ClaPaladin = "CLA_PALADIN",
	ClaPriest = "CLA_PRIEST",
	ClaWarrior = "CLA_WARRIOR",
	ClaWizard = "CLA_WIZARD",
	Briseis = "BRISEIS",
	Kof = "KOF",
	LimitedEr05 = "LIMITED_ER_05",
	LimitedBrsk05 = "LIMITED_BRSK_05",
	LimitedBrsk02 = "LIMITED_BRSK_02",
	LimitedBrsk04 = "LIMITED_BRSK_04",
}

export interface Costjson {
	Cost_Type:   Cost;
	Cost_Value:  Cost;
	Cost_Amount: number;
}

export enum Cost {
	ItemGold = "ITEM_GOLD",
	ItemHonor = "ITEM_HONOR",
}

export enum Property {
	Blue = "BLUE",
	Red = "RED",
	Yellow = "YELLOW",
}

export interface Skillhandlerjson {
	id:              string;
	"skill.name"?:   string;
	"skill.power"?:  number;
	target:          TargetElement[] | PurpleTarget;
	"buff.type"?:    BuffType;
	"value.target"?: ValueTarget;
	value?:          number;
	duration?:       number;
	vfx?:            string;
	"string.value"?: string;
	label?:          string;
	"active.time"?:  number;
	summon_max?:     number;
	"summon.stat"?:  SummonStat[];
	"move.lock"?:    boolean;
	tick?:           number;
	"is.owner"?:     boolean;
	"anti.cleanse"?: boolean;
	"else.string"?:  string;
	"delay.time"?:   number;
	"in.range"?:     string;
}

export enum BuffType {
	Buff = "BUFF",
	None = "NONE",
}

export interface SummonStat {
	base:   string;
	target: string;
	value:  number;
}

export enum TargetElement {
	Ally = "ALLY",
	MinHPRatio = "MIN_HP_RATIO",
}

export enum PurpleTarget {
	Ally = "ALLY",
	AllyDead = "ALLY_DEAD",
	Leader = "LEADER",
	Oneself = "ONESELF",
}

export enum ValueTarget {
	AtkDmg = "AtkDmg",
	AtkSpd = "AtkSpd",
	Def = "Def",
}

export enum Speechpanel {
	Buff = "BUFF",
	Skill = "SKILL",
}

export enum SPSkillType {
	Normal = "NORMAL",
	Ultimate = "ULTIMATE",
}

export interface Unlockcond {
	type:              UnlockcondType;
	type_target?:      string;
	type_value?:       number;
	type_text?:        TypeText;
	next_id:           string;
	type_target_list?: string[];
}

export enum UnlockcondType {
	None = "NONE",
	OnlyHuge = "ONLY_HUGE",
	Separate = "SEPARATE",
	Specific = "SPECIFIC",
}

export enum TypeText {
	TextRuneUnlockCondSeparate = "TEXT_RUNE_UNLOCK_COND_SEPARATE",
	TextRuneUnlockCondSpecific = "TEXT_RUNE_UNLOCK_COND_SPECIFIC",
}
