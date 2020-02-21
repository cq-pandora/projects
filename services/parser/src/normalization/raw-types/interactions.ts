export interface InteractionsRaw {
	status:          string;
	hero_easter_egg: HeroEasterEgg[];
}

export interface HeroEasterEgg {
	eastereggherotext: { [key: string]: string };
	id:                string;
}
