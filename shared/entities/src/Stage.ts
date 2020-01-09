import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

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

function parseStages(rawJson: string): Stages {
	const json = JSON.parse(rawJson) as StagesRaw;

	return Object.entries(json).reduce<Stages>((r, [idRaw, stageRaw]) => {
		r[idRaw as StageId] = Deserialize(stageRaw, Stage) as Stage;

		return r;
	}, {} as Stages);
}

function serializeStages(input: Stages | Stages[]): object {
	const stages = Array.isArray(input) ? input[0] : input;

	return Object.entries(stages).reduce(
		(res, current) => {
			const [key, stage] = current;

			res[key] = Serialize(stage, Stage);

			return res;
		},
		{} as Record<string, object>
	);
}

registerDeserializer<Stages>('Stages', parseStages);
registerSerializer('Stages', serializeStages);
