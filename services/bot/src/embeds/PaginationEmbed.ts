import {
	Message, MessageEmbed, TextChannel, MessageReaction, User, NewsChannel, DMChannel, Snowflake
} from 'discord.js';
import logger from '../logger';
import { translate } from '../cq-data';

import { LocalizableMessageEmbed } from './LocalizableMessageEmbed';

export interface IPaginationEmbedOptions {
	initialMessage?: Message;
	locales?: string[];
}

// Based on https://github.com/thekelvinliu/country-code-emoji/blob/master/src/index.js
const OFFSET = 127397;

function localeToEmoji(locale: string): string {
	const chars = [...locale.split('_')[1].toUpperCase()].map(c => c.charCodeAt(0) + OFFSET);
	return String.fromCodePoint(...chars);
}

const EMOJIS = {
	BACK: '◀',
	FORWARD: '▶',
	DELETE: '🗑',
	LANGUAGE_SELECT: '🌐',
};

const EMOJIS_ORDER = [EMOJIS.DELETE, EMOJIS.BACK, EMOJIS.FORWARD, EMOJIS.LANGUAGE_SELECT];

export default class PaginationEmbed {
	protected authorizedUsers: Snowflake[] = [];
	protected channel?: TextChannel | DMChannel;
	protected array: LocalizableMessageEmbed[] = [];
	protected pageIndicator = true;
	protected page = 0;
	protected timeout?: number;
	protected functionEmojis: Record<string, Function> = {};
	protected originalMessage?: Message;
	protected message!: Message;
	protected locale: string;
	protected locales: string[];

	constructor(options: IPaginationEmbedOptions) {
		const {
			initialMessage,
			locales = ['en_us'],
		} = options;

		[this.locale] = this.locales = locales;

		this.originalMessage = initialMessage;

		if (typeof initialMessage !== 'undefined') {
			this.authorizedUsers = [initialMessage.author.id];
			this.setChannel(initialMessage.channel);
		}
	}

	setChannel(channel: TextChannel | DMChannel | NewsChannel): this {
		if (channel instanceof NewsChannel) {
			throw new TypeError('NewsChannel is not supported!');
		}

		this.channel = channel;

		return this;
	}

	setPage(page: number): this {
		this.page = page;

		return this;
	}

	showPageIndicator(pageIndicator: boolean): this {
		this.pageIndicator = pageIndicator;

		return this;
	}

	setArray(arr: LocalizableMessageEmbed[]): this {
		if (arr.length < 1) {
			throw new TypeError('Array should contain embeds');
		}

		if (arr.length > 1 && this.pageIndicator) {
			this.array = arr.map(
				(e: LocalizableMessageEmbed, idx: number) => e.setFooter(`Page ${idx + 1}/${arr.length}`)
			);
		} else {
			this.array = arr;
		}

		return this;
	}

	async send(): Promise<void> {
		if (!await this.checkPermissions()) {
			throw new Error('Not enough required permissions to proceed');
		}

		return this.setMessage();
	}

	translate(key: string): string {
		return translate(key, this.locale);
	}

	protected async checkPermissions(): Promise<boolean> {
		const channel = this.channel as TextChannel;

		if (channel.guild) {
			const missing = channel
				.permissionsFor(channel.client.user!)!
				.missing(['ADD_REACTIONS', 'EMBED_LINKS', 'VIEW_CHANNEL', 'SEND_MESSAGES']);

			if (missing.length) {
				throw new Error(`Cannot invoke PaginationEmbed class without required permissions: ${missing.join(', ')}`);
			}
		}

		return true;
	}

	protected buildEmbed(): MessageEmbed {
		const embed = this.array[this.page - 1];

		return embed.toEmbed(this.locale);
	}

	protected async setMessage(): Promise<void> {
		if (this.message) {
			await this.message.edit({ embed: this.buildEmbed() });
		} else {
			if (typeof this.channel === 'undefined') {
				throw new TypeError('Channel was not set.');
			}

			this.message = await this.channel.send({ embed: this.buildEmbed() }) as Message;
		}
	}

	protected async loadPage(page: number): Promise<void> {
		this.setPage(page);

		await this.setMessage();

		return this.awaitResponse();
	}

	protected emojiFilter(r: MessageReaction, u: User): boolean {
		const passedEmoji = r.emoji.name in this.functionEmojis || r.emoji.id! in this.functionEmojis;

		if (this.authorizedUsers.length) {
			return this.authorizedUsers.includes(u.id) && passedEmoji;
		}

		return !u.bot && passedEmoji;
	}

	protected async awaitResponse(): Promise<void> {
		try {
			const responses = await this.message.awaitReactions(this.emojiFilter, { max: 1, time: this.timeout, errors: ['time'] });
			const response = responses.first() as MessageReaction;
			const user = await response.users.cache.last();
			const emoji = [response.emoji.name, response.emoji.id];
			const channel = this.message.channel as TextChannel;

			if (this.message.guild && channel.permissionsFor(channel.client.user!)?.has('MANAGE_MESSAGES')) {
				await response.users.remove(user);
			}

			switch (emoji[0] || emoji[1]) {
				case EMOJIS.DELETE:
					logger.verbose('Removing messages...');

					if (this.message) {
						this.message.delete().catch(reason => {
							logger.warn('Error while deleting bot message: ', reason);
						});
					}

					if (this.originalMessage && (this.originalMessage.channel as TextChannel).guild) {
						this.originalMessage.delete().catch(reason => {
							logger.warn('Error while deleting initial message: ', reason);
						});
					}

					return Promise.resolve();

				case EMOJIS.BACK:
					if (this.page === 1) return this.awaitResponse();

					return this.loadPage(this.page - 1);

				case EMOJIS.FORWARD:
					if (this.page === this.array.length - 1) return this.awaitResponse();

					return this.loadPage(this.page + 1);

				case EMOJIS.LANGUAGE_SELECT:
					// TODO draw language select menu
					return Promise.resolve();

				default:
					// TODO handle languages selection
					return Promise.resolve();
			}
		} catch (err) {
			return this.cleanUp();
		}
	}

	protected async cleanUp(): Promise<void> {
		if (this.message.guild && !this.message.deleted) await this.message.reactions.removeAll();
	}
}
