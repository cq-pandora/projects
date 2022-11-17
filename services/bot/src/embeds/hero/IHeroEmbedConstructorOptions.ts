import { Hero } from '@cquest/entities';
import { InitialMessageSource } from '../PaginationEmbed';

export default interface IHeroEmbedConstructorOptions {
	initial: InitialMessageSource;
	hero: Hero;
	page?: number;
	locales: string[];
}
