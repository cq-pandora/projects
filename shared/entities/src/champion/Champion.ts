import { autoserializeAs, autoserialize } from 'cerialize';

import ChampionForm from './ChampionForm';

export type ChampionType = 'util' | 'def' | 'atk';

export class Champion {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly illustration: string;
	@autoserialize public readonly image: string;
	@autoserialize public readonly lore: string;
	@autoserialize public readonly type: ChampionType;
	@autoserializeAs(ChampionForm) public readonly forms: Array<ChampionForm>;

	constructor(
		id: string, name: string, illustration: string, image: string, lore: string, type: ChampionType,
		forms: Array<ChampionForm>
	) {
		this.id = id;
		this.name = name;
		this.illustration = illustration;
		this.image = image;
		this.lore = lore;
		this.type = type;
		this.forms = forms;
	}
}

export type Champions = Array<Champion>;
