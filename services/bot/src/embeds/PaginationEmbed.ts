import { Message, MessageEmbed } from 'discord.js';
import { Embeds as EmbedsMode } from 'discord-paginationembed';

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
			if (self.clientAssets.message) {
				self.clientAssets.message.delete().catch(reason => {
					logger.warn('Error while deleting client message: ', reason);
				});
			}

			if (initialMessage) {
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
}
