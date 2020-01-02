export type HeroClass = 'priest' | 'archer' | 'hunter'| 'paladin' | 'warrior' | 'wizard';

export type HeroGender = 'male' | 'female' | 'none';

export type HeroType = 'promotable' | 'legendary' | 'contract' | 'collab' | 'support' | 'secret';

export type HeroStats =
	'all' | 'accuracy' | 'armor' |
	'atk_power' | 'crit_dmg' | 'crit_chance' |
	'evasion' | 'great' | 'hp' | 'resistance';

export type WeaponType = 'bow' | 'gun' | 'hammer' | 'orb' | 'sword' | 'staff';

export const HeroClassColors: Record<HeroClass, number> = {
	archer: 0x79B21D,
	hunter: 0xDAA628,
	paladin: 0x24A2BF,
	priest: 0xF163B3,
	warrior: 0xB43026,
	wizard: 0x985ED5
};
