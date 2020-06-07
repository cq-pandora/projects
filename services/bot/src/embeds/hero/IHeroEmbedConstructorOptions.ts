import { Message } from 'discord.js';
import { Hero } from '@cquest/entities';

export default interface IHeroEmbedConstructorOptions {
	initialMessage: Message;
	hero: Hero;
	page?: number;
	locales: string[];
}
