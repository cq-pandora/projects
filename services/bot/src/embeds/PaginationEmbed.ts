/* eslint-disable no-underscore-dangle */ // Because private methods in discord-paginationembed are underscored
import {
	Message, MessageEmbed, TextChannel, MessageReaction, User, NewsChannel, DMChannel
} from 'discord.js';
import { PaginationEmbed as PaginationEmbedOriginal } from 'discord-paginationembed';

import logger from '../logger';
import { translate, locales } from '../cq-data';

import { LocalizableMessageEmbed } from './LocalizableMessageEmbed';

export interface IPaginationEmbedOptions {
	initialMessage?: Message;
	locale?: string;
	showLocales?: boolean;
}

function localeToEmoji(locale: string): string {
	return `:flag_${locale.split('_')[1]}:`;
}

export default class PaginationEmbed extends PaginationEmbedOriginal<LocalizableMessageEmbed> {
	protected locale: string;

	constructor(options: IPaginationEmbedOptions) {
		super();

		const {
			initialMessage,
			locale = 'en_us',
			showLocales = true,
		} = options;

		this.locale = locale;

		this.setNavigationEmojis({
			back: '◀',
			jump: '🅱',
			forward: '▶',
			delete: '🤔'
		});

		this.setDisabledNavigationEmojis(['JUMP', 'DELETE']);
		this.addFunctionEmoji('🗑', (_, self) => {
			logger.verbose('Removing messages...');

			if (self.clientAssets.message) {
				self.clientAssets.message.delete().catch(reason => {
					logger.warn('Error while deleting client message: ', reason);
				});
			}

			if (initialMessage && (initialMessage.channel as TextChannel).guild) {
				initialMessage.delete().catch(reason => {
					logger.warn('Error while deleting initial message: ', reason);
				});
			}
		});

		if (showLocales) {
			// for (const l of locales) {
			// this.addFunctionEmoji(localeToEmoji(l), (_, self) => {
			//
			// });
			// }
		}

		if (initialMessage) {
			this.setAuthorizedUsers([initialMessage.author.id]);
			this.setChannel(initialMessage.channel);
		}
	}

	setChannel(channel: TextChannel | DMChannel | NewsChannel): this {
		if (channel instanceof NewsChannel) {
			throw new TypeError('NewsChannel is not supported!');
		}

		return super.setChannel(channel);
	}

	setArray(arr: LocalizableMessageEmbed[]): this {
		if (arr.length > 1) {
			return super.setArray(arr.map((e: LocalizableMessageEmbed, idx: number) => e.setFooter(`Page ${idx + 1}/${arr.length}`)));
		}

		return super.setArray(arr);
	}

	send(): Promise<void> {
		this.pages = this.array.length;

		return this._loadList();
	}

	showPageIndicator(v: boolean): this {
		return this.setPageIndicator(v);
	}

	translate(key: string): string {
		return translate(key, this.locale);
	}

	// region PaginationEmbed overrides
	async _checkPermissions(): Promise<boolean> {
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

	protected _buildEmbed(): MessageEmbed {
		const embed = this.array[this.page - 1];

		return embed.toEmbed(this.locale);
	}

	async _loadList(callNavigation = true): Promise<void> {
		if (this.clientAssets.message) {
			await this.clientAssets.message.edit({ embed: this._buildEmbed() });
		} else {
			this.clientAssets.message = await this.channel.send({ embed: this._buildEmbed() }) as Message;
		}

		return super._loadList(callNavigation);
	}

	protected async onFunctionEmojiClicked(emoji: string[], user: User, clientMessage: Message): Promise<void> {
		const cb = this.functionEmojis[emoji[0]] || this.functionEmojis[emoji[1]];

		try {
			// @ts-ignore
			await cb(user, this);
		} catch (err) {
			return this._cleanUp(err, clientMessage, false, user);
		}

		return this._loadPage(this.page);
	}

	async _awaitResponse(): Promise<void> {
		const emojis = Object.values(this.navigationEmojis);
		const filter = (r: MessageReaction, u: User): boolean => {
			const enabledEmoji = this._enabled('ALL')
				? !this._disabledNavigationEmojiValues.length
				|| this._disabledNavigationEmojiValues.some(e => ![r.emoji.name, r.emoji.id].includes(e))
				: false;
			const passedEmoji = (enabledEmoji && (emojis.includes(r.emoji.name) || emojis.includes(r.emoji.id)))
				|| r.emoji.name in this.functionEmojis || r.emoji.id! in this.functionEmojis;

			if (this.authorizedUsers.length) {
				return this.authorizedUsers.includes(u.id) && passedEmoji;
			}

			return !u.bot && passedEmoji;
		};

		const clientMessage = this.clientAssets.message as Message;

		try {
			const responses = await clientMessage.awaitReactions(filter, { max: 1, time: this.timeout, errors: ['time'] });
			const response = responses.first() as MessageReaction;
			const users = await response.users.fetch(); // FIXME wrong user selection
			const user = users.last();
			const emoji = [response.emoji.name, response.emoji.id];
			const channel = clientMessage.channel as TextChannel;

			if (this.listenerCount('react')) this.emit('react', user, response.emoji);

			if (clientMessage.guild && channel.permissionsFor(channel.client.user!)?.has('MANAGE_MESSAGES')) {
				await response.users.remove(user);
			}

			switch (emoji[0] || emoji[1]) {
				case this.navigationEmojis.back:
					if (this.page === 1) return this._awaitResponse();

					return this._loadPage('back');

				case this.navigationEmojis.forward:
					if (this.page === this.pages) return this._awaitResponse();

					return this._loadPage('forward');

				default:
					return await this.onFunctionEmojiClicked(emoji as string[], user!, clientMessage);
			}
		} catch (err) {
			return this._cleanUp(err, clientMessage);
		}
	}
	// endregion
}
