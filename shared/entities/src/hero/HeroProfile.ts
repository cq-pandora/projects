import { autoserialize } from 'cerialize';

export interface IHeroProfileOptions {
	age: string;
	birthday: string;
	hobby: string;
	likes: string;
	hates: string;
	notes: string;
	oztalk: boolean;
}

// Hero Tome "Profile" tab (added Mar 2022). Text fields are translation keys
export class HeroProfile {
	@autoserialize public readonly age!: string;
	@autoserialize public readonly birthday!: string;
	@autoserialize public readonly hobby!: string;
	@autoserialize public readonly likes!: string;
	@autoserialize public readonly hates!: string;
	@autoserialize public readonly notes!: string;
	// Hero has an Oztalk (1:1 messenger, added May 2023) chat room
	@autoserialize public readonly oztalk!: boolean;

	constructor(options: IHeroProfileOptions) {
		if (!options) return; // only for tests

		this.age = options.age;
		this.birthday = options.birthday;
		this.hobby = options.hobby;
		this.likes = options.likes;
		this.hates = options.hates;
		this.notes = options.notes;
		this.oztalk = options.oztalk;
	}
}
