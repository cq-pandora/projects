import { Translations } from '@pandora/entities';

export type BerriesNormalizationInput = {
	berriesRawPath: string;
};

export type BossesNormalizationInput = {
	charactersGeneralInfoRawPath: string;
	charactersStatsRawPath: string;
};

export type BreadsNormalizationInput = {
	breadsRawPath: string;
};

export type ChampionsNormalizationInput = {
	championsInfoRawPath: string;
	championsSkillRawPath: string;
	championSkillsByLevelInfoRawPath: string;
};

export type FactionsNormalizationInput = {
	factionsRawPath: string;
};

export type FishesNormalizationInput = {
	fishesRawPath: string;
};

export type FishingGearNormalizationInput = {
	fishingGearRawPath: string;
};

export type GoddessesNormalizationInput = {
	goddessesRawPath: string;
};

export type HeroesNormalizationInput = {
	translation: Translations;
	characterBerriesStatsRawPath: string;
	charactersGeneralInfoRawPath: string;
	charactersStatsRawPath: string;
	characterSkinsRawPath: string;
	weaponsRawPath: string;
};

export type InheritanceNormalizationInput = {
	inheritanceRawPath: string;
};

export type PortraitsNormalizationInput = {
	portraitsRawPath: string;
};

export type SigilsNormalizationInput = {
	sigilsRawPath: string;
	sigilsSetsRawPath: string;
	sigilsStatsRawPath: string;
};

export type SpSkillNormalizationInput = {
	spSkillsRawPath: string;
};

export type TranslationsNormalizationInput = {
	textsRawPaths: string[];
};

export type InteractionsInput = {
	interactionsRawPath: string;
	characterSkinsRawPath: string;
};

export type UniversalNormalizationInput =
	BerriesNormalizationInput & BossesNormalizationInput & BreadsNormalizationInput & ChampionsNormalizationInput
	& FactionsNormalizationInput & FishesNormalizationInput & FishingGearNormalizationInput
	& GoddessesNormalizationInput & HeroesNormalizationInput & InheritanceNormalizationInput
	& PortraitsNormalizationInput & SigilsNormalizationInput & SpSkillNormalizationInput
	& InteractionsInput;
