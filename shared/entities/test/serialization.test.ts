import { Serialize } from 'cerialize';

import {
	Champion, ChampionForm, ChampionSkill, InheritanceStats, Deserialize, Inheritance, DeserializeSingle
} from '..';

describe('Champion test', (): void => {
	it('serializes and deserializes successfully', (): void => {
		const c = new Champion(
			'test_id',
			'test',
			'test',
			'test',
			'test',
			'util',
			[
				new ChampionForm(
					new ChampionSkill(
						'test_id',
						'test',
						'test',
						'test',
						1
					),
					undefined,
					undefined,
					2,
				),
			],
		);

		const string = JSON.stringify(Serialize(c));
		const pojso = JSON.parse(string);

		const dc = Deserialize(pojso, Champion);

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
