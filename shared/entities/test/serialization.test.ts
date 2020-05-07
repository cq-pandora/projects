import { Serialize } from 'cerialize';

import {
	Champion, ChampionForm, ChampionSkill, InheritanceStats, Deserialize, Inheritance, DeserializeSingle
} from '..';

describe('Champion test', (): void => {
	it('serializes and deserializes successfully', (): void => {
		const c = new Champion({
			id: 'test_id',
			name: 'test',
			illustration: 'test',
			image: 'test',
			lore: 'test',
			type: 'util',
			forms: [
				new ChampionForm({
					active: new ChampionSkill({
						id: 'test_id',
						name: 'test',
						description: 'test',
						image: 'test',
						grade: 1
					}),
					grade: 2,
				}),
			],
		});

		const string = JSON.stringify(Serialize(c));

		const dc = Deserialize(string, Champion);

		expect(dc[0] instanceof Champion).toBe(true);
		expect(dc[0].id).toEqual('test_id');
		expect(dc[0].type).toEqual('util');
	});

	it('deserializes and serializes complex type', (): void => {
		const inheritance = DeserializeSingle<Inheritance>(`
			{
				"archer": {
					"1": {
						"atk_power": 0,
						"hp": 8000,
						"crit_chance": 0,
						"armor": 0,
						"resistance": 0,
						"crit_dmg": 0,
						"accuracy": 0,
						"evasion": 0,
						"armor_pen": 0,
						"resistance_pen": 0,
						"dmg_reduction": 0,
						"lifesteal": 0,
						"crit_chance_reduction": 0
					}
				}
			}
		`, 'Inheritance');

		expect(inheritance.archer[1] instanceof InheritanceStats).toBe(true);
	});
});
