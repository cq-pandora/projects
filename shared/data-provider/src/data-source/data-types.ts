export class BasicDataType {
	private readonly type: string;

	constructor(type: string) {
		this.type = type;
	}

	toString(): string {
		return this.type;
	}
}

export class TranslationsDataType extends BasicDataType {
	private readonly locale: string;

	constructor(locale: string) {
		super('translations');
		this.locale = locale;
	}

	getLocale(): string {
		return this.locale;
	}

	toString(): string {
		return `translations/${this.locale}`;
	}
}
