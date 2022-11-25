import {
	CommandInteraction, Channel, TextChannel, User,
	GuildMember, EmbedBuilder, ButtonBuilder, ActionRowBuilder,
	InteractionReplyOptions, Message, ComponentType,
	InteractionCollector, Snowflake, ButtonStyle,
} from 'discord.js';

export type InitialMessageSource = CommandInteraction | TextChannel | User | GuildMember;
export type EmbedSource = EmbedBuilder;

export interface IPaginationEmbedOptions {
	initial: InitialMessageSource;
	components?: ActionRowBuilder<any>[];
}

type MessageReply = {
	embeds: EmbedBuilder[],
	components: ActionRowBuilder<any>[],
};

const BUTTONS = {
	DELETE: 'delete_button',
	NEXT: 'next_button',
	PREV: 'previous_button',
};

// Highly inspired by https://github.com/larrrssss/discord-message-pagination
export default class PaginationEmbed {
	protected authorizedUsers: Snowflake[] = [];
	protected channel?: TextChannel;
	protected array: EmbedSource[] = [];
	protected pageIndicator = true;
	protected page = 1;
	protected timeout = 5 * 60 * 1000; // 5 minutes
	protected buttonStyle = ButtonStyle.Secondary;
	protected components: ActionRowBuilder<any>[];
	protected initial: InitialMessageSource;
	protected message!: Message;

	constructor({ initial, components }: IPaginationEmbedOptions) {
		this.initial = initial;
		this.components = components || [];
		this.authorizedUsers = [
			initial instanceof CommandInteraction
				? initial.user.id
				: initial.id
		];
	}

	setChannel(channel: Channel): this {
		if (!(channel instanceof TextChannel)) {
			throw new TypeError('NewsChannel is not supported!');
		}

		this.channel = channel;

		return this;
	}

	setPage(page: number): this {
		this.page = page;

		return this;
	}

	protected isLastPage(): boolean {
		return this.page === this.array.length;
	}

	protected isFirstPage(): boolean {
		return this.page === 1;
	}

	protected currentPateEmbed(): EmbedSource {
		return this.array[this.page - 1];
	}

	showPageIndicator(pageIndicator: boolean): this {
		this.pageIndicator = pageIndicator;

		return this;
	}

	protected async setMessage(): Promise<void> {
		const target = this.initial;

		const messageOptions = {
			...this.buildMessageOptions(this.currentPateEmbed()),
			fetchReply: true,
		} as InteractionReplyOptions;

		if (target instanceof CommandInteraction) {
			this.message = (target.deferred
				? await target.editReply(messageOptions) as Message
				: await target.reply(messageOptions)) as Message;
		} else {
			throw Error('Unimplemented yet :(');
			// message = await target.send(messageOptions);
		}
	}

	setArray(arr: EmbedSource[] | EmbedSource): this {
		if (Array.isArray(arr)) {
			if (arr.length < 1) {
				throw new TypeError('Array should contain embeds');
			} else {
				this.array = arr;
			}
		} else {
			this.array = [arr];
		}

		if (this.array.length > 1 && this.pageIndicator) {
			this.array = this.array.map(
				(e: EmbedSource, idx: number) => e.setFooter({
					text: `Page ${idx + 1}/${this.array.length}`,
				})
			);
		}

		return this;
	}

	async send(): Promise<void> {
		await this.setMessage();

		const collector = new InteractionCollector(this.initial.client, {
			message: this.message,
			componentType: ComponentType.Button,
			time: this.timeout,
		});

		collector.on('collect', async (collectedInteraction) => {
			if (
				!collectedInteraction.isButton()
			) { return; }

			if (!this.authorizedUsers.includes(collectedInteraction.user.id)) {
				return;
			}

			await collectedInteraction.deferUpdate();

			switch (collectedInteraction.customId) {
				case BUTTONS.NEXT:
					this.page++;
					break;
				case BUTTONS.PREV:
					this.page--;
					break;
				case BUTTONS.DELETE:
					await collectedInteraction.deleteReply();
					return;
				default:
					return;
			}

			await collectedInteraction.editReply(this.buildMessageOptions(this.currentPateEmbed()));
		});

		collector.on('end', async () => {
			if (this.initial instanceof CommandInteraction) {
				await this.initial.editReply({ components: [] })
				// eslint-disable-next-line @typescript-eslint/no-empty-function
					.catch(() => {});
			} else {
				await this.message.edit({ components: [] })
				// eslint-disable-next-line @typescript-eslint/no-empty-function
					.catch(() => {});
			}
		});
	}

	protected buildMessageOptions(embed: EmbedSource): MessageReply {
		const buttons:ButtonBuilder[] = [];

		if (this.array.length > 1) {
			const nextButton = new ButtonBuilder()
				.setLabel('Next')
				.setCustomId(BUTTONS.NEXT)
				.setStyle(this.buttonStyle);

			if (this.isLastPage()) { nextButton.setDisabled(true); }

			const previousButton = new ButtonBuilder()
				.setLabel('Previous')
				.setCustomId(BUTTONS.PREV)
				.setStyle(this.buttonStyle);

			if (this.isFirstPage()) { previousButton.setDisabled(true); }

			buttons.push(nextButton, previousButton);
		}

		const deleteButton = new ButtonBuilder()
			.setLabel('🗑')
			.setCustomId(BUTTONS.DELETE)
			.setStyle(this.buttonStyle);

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents([...buttons, deleteButton]);

		return {
			embeds: [embed],
			components: [...(this.components || []), row],
		};
	}
}
