import {
	ColorResolvable, EmbedBuilder,
	EmbedField as OriginalEmbedField,
	EmbedAuthorData as OriginalMessageEmbedAuthor,
	EmbedFooterData as OriginalMessageEmbedFooter,
} from 'discord.js';

import { translate } from '@cquest/data-provider';

import { splitText } from '../util/functions';

type Identity<T> = { [P in keyof T]: T[P] };
type Replace<T, K extends keyof T, TReplace> = Identity<Pick<T, Exclude<keyof T, K>> & {
	[P in K]: TReplace
}>;

type MessageEmbedAuthor = Replace<OriginalMessageEmbedAuthor, 'name', StringResolvable>;
type MessageEmbedFooter = Replace<OriginalMessageEmbedFooter, 'text', StringResolvable>;
type EmbedField = Replace<Replace<OriginalEmbedField, 'value', StringResolvable>, 'name', StringResolvable>;

type Localizable = {
	strings: ReadonlyArray<string>;
	keys: any[];
};

type StringResolvable = string | number | Localizable;

export function l(str: string): Localizable;
export function l(strings: ReadonlyArray<string>, ...keys: any[]): Localizable;
export function l(strings: TemplateStringsArray, ...keys: any[]): Localizable;
export function l(strings: TemplateStringsArray | ReadonlyArray<string> | string, ...keys: any[]): Localizable {
	if (typeof strings === 'string') {
		return {
			strings: ['', ''],
			keys: [strings],
		};
	}

	return {
		strings,
		keys,
	};
}

function localize(resolvable: StringResolvable, locale: string): string {
	if (typeof resolvable === 'string') {
		return resolvable;
	}

	if (typeof resolvable === 'number') {
		return resolvable.toString();
	}

	const { strings, keys } = resolvable;

	return strings.reduce(
		(prevString, nextString, index) => {
			if (index === 0) {
				return prevString + nextString;
			}

			return prevString + translate(`${keys[index - 1]}`, locale) + nextString;
		},
		''
	);
}

export class LocalizableMessageEmbed {
	private fields: EmbedField[] = [];
	// private files: (MessageAttachment | string | FileOptions)[] = [];
	private author: MessageEmbedAuthor | null = null;
	private title?: StringResolvable;
	private color?: ColorResolvable;
	private description?: StringResolvable;
	private image: string | null = null;
	private thumbnail: string | null = null;
	private timestamp: number | null = null;
	private url?: string;
	private footer: MessageEmbedFooter | null = null;

	public addBlankField(inline?: boolean): this {
		return this.addField('\u200B', '\u200B', inline);
	}

	public addNoNameField(value: StringResolvable, inline = false): this {
		return this.addField('\u200B', value, inline);
	}

	public addField(name: StringResolvable, value: StringResolvable, inline = false): this {
		this.fields.push({ name, value, inline });

		return this;
	}

	// public attachFiles(files: (MessageAttachment | FileOptions | string)[]): this {
	// this.files = this.files.concat(files);

	// return this;
	// }

	public setAuthor(name: StringResolvable, iconURL?: string, url?: string): this {
		this.author = { name, iconURL, url };

		return this;
	}

	public setColor(color: ColorResolvable): this {
		this.color = color;

		return this;
	}

	public setDescription(description: StringResolvable): this {
		this.description = description;

		return this;
	}

	public setFooter(text: StringResolvable, iconURL?: string): this {
		this.footer = {
			text,
			iconURL,
			proxyIconURL: undefined
		};

		return this;
	}

	public setImage(url: string): this {
		this.image = url;

		return this;
	}

	public setThumbnail(url: string): this {
		this.thumbnail = url;

		return this;
	}

	public setTimestamp(timestamp?: Date | number): this {
		this.timestamp = timestamp instanceof Date
			? timestamp.getTime()
			: timestamp ?? null;

		return this;
	}

	public setTitle(title: StringResolvable): this {
		this.title = title;

		return this;
	}

	public setURL(url: string): this {
		this.url = url;

		return this;
	}

	public toEmbed(locale = 'en_us'): EmbedBuilder {
		const me = new EmbedBuilder();

		if (this.author) {
			me.setAuthor(this.author as OriginalMessageEmbedAuthor);
		}

		if (this.title) {
			me.setTitle(localize(this.title, locale));
		}

		if (this.color) {
			me.setColor(this.color);
		}

		if (this.description) {
			const translation = localize(this.description, locale);

			if (translation.length > 2048) {
				me.addFields(splitText(translation).map(chunk => ({ name: '\u200b', value: chunk })));
			} else {
				me.setDescription(localize(this.description, locale));
			}
		}

		if (this.image) {
			me.setImage(this.image);
		}

		if (this.thumbnail) {
			me.setThumbnail(this.thumbnail);
		}

		if (this.timestamp) {
			me.setTimestamp(this.timestamp);
		}

		if (this.url) {
			me.setURL(this.url);
		}

		// if (this.files.length > 0) {
		// me.attachFiles(this.files);
		// }

		if (this.footer) {
			me.setFooter(
				{
					text: localize(this.footer.text, locale),
					iconURL: this.footer.iconURL,
				}
			);
		}

		if (this.fields.length > 0) {
			for (const field of this.fields) {
				const name = localize(field.name, locale);
				const value = localize(field.value, locale);

				const chunks = splitText(value);

				me.addFields([
					{ name, value: chunks.shift()! },
					...chunks.map(chunk => ({
						name: '\u200b',
						value: chunk,
					})),
				]);
			}
		}

		return me;
	}
}
