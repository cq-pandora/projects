import { InitializerFunction } from '../lateinit';
import { HeroKeysDescription } from '../../searchable';
import { DataType } from '../../data-source';

import { IDataProvider } from '../common';

export default function generateLocalesInitializer(provider: IDataProvider): InitializerFunction<HeroKeysDescription> {
	return async function initialize(instance: HeroKeysDescription): Promise<void> {
		const dataSource = provider.getDataSource();

		const data = await dataSource!.get(DataType.HEROES_KEYS_DESCRIPTION);

		Object.assign(instance, JSON.parse(data));
	};
}
