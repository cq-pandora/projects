import { ChampionBond, DeserializeSingle } from '@cquest/entities';

import { InitializerFunction } from '../lateinit';
import { IDataProvider } from '../common';
import { DataType } from '../../data-source';

export default function generateChampionBondInitializer(provider: IDataProvider): InitializerFunction<ChampionBond> {
	return async function initialize(instance: ChampionBond): Promise<void> {
		const data = await provider.getDataSource()!.get(DataType.CHAMPION_BOND);

		Object.assign(instance, DeserializeSingle<ChampionBond>(data, ChampionBond));
	};
}
