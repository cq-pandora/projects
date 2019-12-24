import { autoserializeAs, autoserialize, Deserialize } from 'cerialize';

export type StageId = string;

export class Stage {
	@autoserialize public readonly id: StageId;
	@autoserialize public readonly name: string;
	@autoserialize public readonly chapter: string;
	@autoserializeAs('big_image') public readonly bigImage: string;
	@autoserializeAs('number') public readonly num: number;
	@autoserializeAs('entry_cost') public readonly entryCost: number;
	@autoserializeAs('entry_currency') public readonly entryCurrency: string;

	constructor(
		id: StageId, name: string, chapter: string, bigImage: string, num: number, entryCost: number,
		entryCurrency: string
	) {
		this.id = id;
		this.name = name;
		this.chapter = chapter;
		this.bigImage = bigImage;
		this.num = num;
		this.entryCost = entryCost;
		this.entryCurrency = entryCurrency;
	}
}

export type Stages = {
	[k in StageId]: Stage;
};

type StagesRaw = {
	[k in StageId]: object;
};

export function parseStages(rawJson: string): Stages {
	const json = JSON.parse(rawJson) as StagesRaw;

	return Object.entries(json).reduce<Stages>((r, [idRaw, stageRaw]) => {
		r[idRaw as StageId] = Deserialize(stageRaw, Stage) as Stage;

		return r;
	}, {} as Stages);
}
