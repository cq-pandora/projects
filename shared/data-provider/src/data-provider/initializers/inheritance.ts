import { DeserializeSingle, Inheritance } from '@cquest/entities';

import { InitializerFunction } from '../lateinit';
import { IDataProvider } from '../common';
import { DataType } from '../../data-source';

export default function generateLocalesInitializer(provider: IDataProvider): InitializerFunction<Inheritance> {
	return async function initialize(instance: Inheritance): Promise<void> {
		const dataSource = provider.getDataSource();

		const data = await dataSource!.get(DataType.INHERITANCE);

		const newInheritance = DeserializeSingle<Inheritance>(data, 'Inheritance');

		Object.assign(instance, newInheritance);
	};
}
