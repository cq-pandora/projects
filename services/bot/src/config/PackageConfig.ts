import { deserialize } from 'cerialize';

export default class PackageConfig {
	@deserialize public readonly name: string;
	@deserialize public readonly version: string;

	constructor(name: string, version: string) {
		this.name = name;
		this.version = version;
	}
}
