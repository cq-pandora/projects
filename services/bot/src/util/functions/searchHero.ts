import { Hero, HeroClass, HeroType } from '@cquest/entities';
import { heroes, ISearchResult } from '@cquest/data-provider';

const HERO_QUALIFIERS: readonly string[] = [
	...['archer', 'hunter', 'paladin', 'priest', 'warrior', 'wizard'] satisfies HeroClass[],
	...['promotable', 'legendary', 'contract', 'collab', 'support', 'secret'] satisfies HeroType[],
];

function pickAmongTies(results: ISearchResult<Hero>[], star?: number): ISearchResult<Hero> | undefined {
	const [top] = results;

	if (!top) return undefined;

	// Several heroes can share a display name (e.g. contract Beatrice and Re:Zero Beatrice), which gives them
	// identical scores. Prefer the one that has the requested grade, then the one that goes the highest.
	const tied = results.filter(r => r.score === top.score && r.locales[0] === top.locales[0]);

	if (tied.length === 1) return top;

	const withStar = star ? tied.filter(r => r.result.forms.some(f => f.star === star)) : tied;
	const candidates = withStar.length ? withStar : tied;

	// Forms are sorted by grade, so the last one is the highest
	return candidates.reduce((best, r) => (
		r.result.forms[r.result.forms.length - 1].star > best.result.forms[best.result.forms.length - 1].star
			? r
			: best
	));
}

/**
 * Hero lookup shared by hero-based commands. Trailing class or type words narrow the search, so heroes with the
 * same name stay reachable: `beatrice wizard`, `little girl collab`, `southern guard hunter`.
 */
export default function searchHero(rawQuery: string, star?: number): ISearchResult<Hero> | undefined {
	const words = rawQuery.trim().split(/\s+/);
	const qualifiers = [] as string[];

	while (words.length > 1 && HERO_QUALIFIERS.includes(words[words.length - 1].toLowerCase())) {
		qualifiers.unshift(words.pop()!.toLowerCase());
	}

	const full = pickAmongTies(heroes.searchAll(rawQuery), star);

	if (!qualifiers.length) return full;

	const qualified = pickAmongTies(
		heroes.searchAll(words.join(' '))
			.filter(r => qualifiers.every(q => r.result.clazz === q || r.result.type === q)),
		star
	);

	// Hero names may end with a class word themselves ("Mecha Archer"), so the qualified search only wins when it
	// matches better than the query taken literally
	return qualified && (!full || (qualified.score ?? 0) > (full.score ?? 0)) ? qualified : full;
}
