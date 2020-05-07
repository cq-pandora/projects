import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { HeroClass } from '../hero';

import { SpSkillForm } from './SpSkillForm';
import { registerSerializer } from '../Serializer';

export type SpSkillType = 'normal' | 'ultimate';

export interface ISpSkillOptions {
	id: string;
	name: string;
	clazz: HeroClass;
	type: SpSkillType;
	forms: Array<SpSkillForm>;
}

export class SpSkill {
	@autoserialize public readonly id!: string;
	@autoserialize public readonly name!: string;
	@autoserializeAs('class') public readonly clazz!: HeroClass;
	@autoserialize public readonly type!: SpSkillType;
	@autoserializeAs(SpSkillForm) public readonly forms!: Array<SpSkillForm>;

	constructor(options: ISpSkillOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.name = options.name;
		this.clazz = options.clazz;
		this.type = options.type;
		this.forms = options.forms;
	}
}

registerDeserializer(SpSkill, (input: string) => Deserialize(JSON.parse(input), SpSkill));
registerSerializer(SpSkill, (input: SpSkill | SpSkill[]) => Serialize(input, SpSkill));
