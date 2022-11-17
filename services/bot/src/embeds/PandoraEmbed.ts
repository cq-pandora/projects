import {
	ColorResolvable, EmbedAuthorData, EmbedBuilder, EmbedField, EmbedFooterData,
} from 'discord.js';

import { splitText } from '../util/functions/index';

export default class PandoraEmbed {
	private fields: EmbedField[] = [];
	// private files: (MessageAttachment | string | FileOptions)[] = [];
	private author: EmbedAuthorData | null = null;
	private title?: string;
	private color?: ColorResolvable;
	private description?: string;
	private image: string | null = null;
	private thumbnail: string | null = null;
	private timestamp: number | null = null;
	private url?: string;
	private footer: EmbedFooterData | null = null;

	public addBlankField(inline?: boolean): this {
		return this.addField('\u200B', '\u200B', inline);
	}

	public addNoNameField(value: string | number, inline = false): this {
		return this.addField('\u200B', value, inline);
	}

	public addField(name: string, value: string | number, inline = false): this {
		this.fields.push({ name, value: String(value), inline });

		return this;
	}

	// public attachFiles(files: (MessageAttachment | FileOptions | string)[]): this {
	// this.files = this.files.concat(files);

	// return this;
	// }

	public setAuthor(name: string, iconURL?: string, url?: string): this {
		this.author = { name, iconURL, url };

		return this;
	}

	public setColor(color: ColorResolvable): this {
		this.color = color;

		return this;
	}

	public setDescription(description: string): this {
		this.description = description;

		return this;
	}

	public setFooter(text: string, iconURL?: string): this {
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

	public setTitle(title: string): this {
		this.title = title;

		return this;
	}

	public setURL(url: string): this {
		this.url = url;

		return this;
	}

	public toEmbed(): EmbedBuilder {
		const me = new EmbedBuilder();

		if (this.author) {
			me.setAuthor(this.author);
		}

		if (this.title) {
			me.setTitle(this.title);
		}

		if (this.color) {
			me.setColor(this.color);
		}

		if (this.description) {
			const translation = this.description;

			if (translation.length > 2048) {
				me.addFields(splitText(translation).map(chunk => ({ name: '\u200b', value: chunk })));
			} else {
				me.setDescription(this.description);
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
					text: this.footer.text,
					iconURL: this.footer.iconURL,
				}
			);
		}

		if (this.fields.length > 0) {
			for (const field of this.fields) {
				const { name, value } = field;

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
