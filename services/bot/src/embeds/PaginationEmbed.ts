/* eslint-disable no-underscore-dangle */ // Because private methods in discord-paginationembed are underscored
import {
	Message, MessageEmbed, TextChannel, MessageReaction, User
} from 'discord.js';
import { Embeds, Embeds as EmbedsMode, FieldsEmbed } from 'discord-paginationembed';

import logger from '../logger';

export default class PaginationEmbed extends EmbedsMode {
	constructor(initialMessage?: Message) {
		super();

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

		if (initialMessage) {
			this.setAuthorizedUsers([initialMessage.author.id]);
			this.setChannel(initialMessage.channel);
		}
	}

	setArray(arr: MessageEmbed[]): this {
		if (arr.length > 1) {
			return super.setArray(arr.map((e: MessageEmbed, idx: number) => e.setFooter(`Page ${idx + 1}/${arr.length}`)));
		}

		return super.setArray(arr);
	}

	send(): Promise<void> {
		return this.build();
	}

	showPageIndicator(v: boolean): this {
		return this.setPageIndicator(v);
	}


	// eslint-disable-next-line no-underscore-dangle
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

	private async onFunctionEmojiClicked(emoji: string[], user: User, clientMessage: Message): Promise<void> {
		const cb = this.functionEmojis[emoji[0]] || this.functionEmojis[emoji[1]];

		try {
			await cb(user, this as unknown as Embeds | FieldsEmbed<MessageEmbed>);
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
			const user = response.users.last();
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
}
