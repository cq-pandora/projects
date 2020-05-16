import { Message } from 'discord.js';
import { Hero } from '@pandora/entities';

export default interface IHeroEmbedConstructorOptions {
	initialMessage: Message;
	hero: Hero;
	page?: number;
	locale: string;
}
