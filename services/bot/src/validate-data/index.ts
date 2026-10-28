// Checks a cq-pandora/assets checkout before it goes live. Every embed the bot can build is rendered
// for every entity, every pull type is drawn, and collection and image counts are compared with a
// base revision so a broken parse cannot silently drop content.
//
// Usage: node lib/validate-data <assets dir> [<base git ref>]

/* eslint-disable no-console -- command line tool, the console is its output */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Client, CommandInteraction, EmbedBuilder } from 'discord.js';

import {
	accessories, championBond, heroes, inheritance, scarecrows,
	init, setAliasProvider, setDataSource, FileDataSource,
} from '@cquest/data-provider';
import { InheritanceLevel } from '@cquest/entities';

// Has to stay above the bot modules: it sets the variables the bot config reads on import
import {
	IMAGES_URL, assetsDir, baseRef, informationDir,
} from './environment';

import {
	AccessoriesEmbed, ChampionBondEmbed, HeroInheritanceEmbed, HeroProfileEmbed, HeroSBWBlockEmbed,
	PaginationEmbed, ScarecrowsEmbed,
} from '../embeds';
import { entityCollections } from '../embeds/entity-embeds';
import pull from '../commands/pull';
import { CommandAuthor, CommandResultCode } from '../common-types';

// A collection or image folder may shrink by this much (content does get removed) before the check fails
const MAX_DROP = 0.1;
const MAX_REPORTED = 50;
const INHERITANCE_LEVELS: InheritanceLevel[] = [0, 5, 10, 15, 20, 25, 30, 35, 40];

// Values that leaked from a missing field. Game texts use "undefined" as a word ("an undefined
// mineral"), so the word only counts where a value is rendered: alone, after a label or a count,
// or before a unit
const BROKEN_VALUE = [
	/\bNaN\b/,
	/\[object Object\]/,
	/^\s*(?:[\d,.]+\s+)?(?:undefined|null)\s*$/m,
	/(?::|\*\*)\s*(?:undefined|null)\b/,
	/\b(?:undefined|null)\s*(?:%|★|\()/,
];

const failures: string[] = [];
const warnings: string[] = [];

function git(...args: string[]): string {
	return execFileSync('git', ['-C', assetsDir, ...args], { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 1024 });
}

function entryCount(json: unknown): number {
	if (Array.isArray(json)) return json.length;

	return json && typeof json === 'object' ? Object.keys(json).length : 0;
}

function compareCounts(kind: string, base: Map<string, number>, head: Map<string, number>): void {
	for (const [name, before] of base) {
		const after = head.get(name) ?? 0;

		if (after < before * (1 - MAX_DROP)) {
			failures.push(`${kind} ${name}: ${before} -> ${after}`);
		} else if (after !== before) {
			console.log(`${kind} ${name}: ${before} -> ${after}`);
		}
	}
}

function compareWithBase(ref: string): void {
	const baseFiles = git('ls-tree', '-r', '--name-only', ref).split('\n').filter(Boolean);
	const headFiles = git('ls-files').split('\n').filter(Boolean);

	const imageCounts = (files: string[]) => files
		.filter(f => f.endsWith('.png'))
		.reduce((r, f) => r.set(f.split('/')[0], (r.get(f.split('/')[0]) ?? 0) + 1), new Map<string, number>());

	compareCounts('images in', imageCounts(baseFiles), imageCounts(headFiles));

	const baseInformation = new Map<string, number>();
	const headInformation = new Map<string, number>();

	for (const file of baseFiles.filter(f => /^information\/[^/]+\.json$/.test(f))) {
		const name = file.slice('information/'.length);

		baseInformation.set(name, entryCount(JSON.parse(git('show', `${ref}:${file}`))));

		if (existsSync(join(informationDir, name))) {
			headInformation.set(name, entryCount(JSON.parse(readFileSync(join(informationDir, name), 'utf-8'))));
		}
	}

	compareCounts('entries in', baseInformation, headInformation);
}

function checkPage(where: string, page: EmbedBuilder): void {
	const json = page.toJSON();
	const fields = json.fields ?? [];
	const texts = [
		json.title, json.description, json.footer?.text, json.author?.name,
		...fields.flatMap(f => [f.name, f.value]),
	].filter((t): t is string => typeof t === 'string');

	// Discord rejects the message outright above these limits
	const length = texts.reduce((sum, t) => sum + t.length, 0);

	if (length > 6000) failures.push(`${where}: ${length} characters, over the 6000 limit`);
	if (fields.length > 25) failures.push(`${where}: ${fields.length} fields, over the 25 limit`);
	if (fields.some(f => f.value.length > 1024)) failures.push(`${where}: a field value is over 1024 characters`);

	const broken = texts.find(t => BROKEN_VALUE.some(pattern => pattern.test(t)));

	if (broken) failures.push(`${where}: ${JSON.stringify(broken.slice(0, 120))}`);

	const untranslated = /\bTEXT_[A-Z0-9_]+/.exec(texts.join('\n'));

	if (untranslated) warnings.push(`${where}: untranslated ${untranslated[0]}`);

	for (const url of [json.thumbnail?.url, json.image?.url]) {
		if (url?.startsWith(IMAGES_URL) && !existsSync(join(assetsDir, url.slice(IMAGES_URL.length)))) {
			warnings.push(`${where}: missing image ${url.slice(IMAGES_URL.length)}`);
		}
	}
}

// Stand-ins for the discord.js objects: embeds only read the requesting user's id, pulls read the
// author's tag and avatar, and nothing touches the client
const initial = { id: 'validate', user: { id: 'validate' } } as unknown as CommandInteraction;
const author = { tag: 'validate', avatarURL: () => null } as unknown as CommandAuthor;
const client = {} as Client;

let rendered = 0;
let pages: readonly EmbedBuilder[] = [];

// Keep the rendered pages instead of posting them
PaginationEmbed.prototype.send = async function send(this: PaginationEmbed): Promise<void> {
	({ pages } = this);
};

async function render(where: string, build: () => PaginationEmbed): Promise<void> {
	try {
		pages = [];
		await build().send();
		pages.forEach((page, i) => checkPage(`${where} page ${i + 1}`, page));
		rendered += 1;
	} catch (e) {
		failures.push(`${where}: ${(e as Error).message}`);
	}
}

async function renderEverything(): Promise<void> {
	for (const [name, collection] of Object.entries(entityCollections())) {
		if (collection.size === 0) failures.push(`${name}: collection is empty`);

		for (let i = 0; i < collection.size; i++) {
			await render(`${name} #${i}`, () => collection.embed(initial, i));
		}
	}

	for (const hero of heroes.list()) {
		const locales = ['en_us'];

		if (hero.profile) {
			await render(`profile ${hero.id}`, () => new HeroProfileEmbed({ initial, hero, locales }));
		}

		if (hero.sbws?.length) {
			await render(`sbw-block ${hero.id}`, () => new HeroSBWBlockEmbed({ initial, hero, locales }));
		}

		if (hero.forms.some(f => f.star === 6)) {
			const maxLevel = Object.keys(inheritance[hero.clazz]).length;
			const inherits = INHERITANCE_LEVELS.filter(l => l <= maxLevel);

			await render(`inherit ${hero.id}`, () => new HeroInheritanceEmbed({ initial, hero, inherits }));
		}
	}

	await render('accessory list', () => new AccessoriesEmbed({ initial, accessories: accessories.list() }));
	await render('scarecrows', () => new ScarecrowsEmbed({ initial, scarecrows: scarecrows.list() }));
	await render('bond', () => new ChampionBondEmbed({ initial, bond: championBond }));

	for (const level of championBond.levels) {
		await render(`bond level ${level.level}`, () => new ChampionBondEmbed({ initial, bond: championBond, level }));
	}

	// Pulls draw heroes from the data and compose an image from the local hero sprites
	for (const type of Object.values(pull.args.type.choices)) {
		try {
			const result = await pull.run({
				args: { type, count: 10 },
				reply: async () => undefined,
				deleteOriginal: async () => undefined,
				author,
				initial,
				client,
			});

			if (result.statusCode !== CommandResultCode.SUCCESS) failures.push(`pull ${type}: status ${result.statusCode}`);

			rendered += 1;
		} catch (e) {
			failures.push(`pull ${type}: ${(e as Error).message}`);
		}
	}
}

function report(kind: string, list: string[]): void {
	if (list.length === 0) return;

	console.log(`\n${kind} (${list.length}):`);
	list.slice(0, MAX_REPORTED).forEach(line => console.log(`  ${line}`));

	if (list.length > MAX_REPORTED) console.log(`  ... and ${list.length - MAX_REPORTED} more`);
}

async function main(): Promise<void> {
	if (baseRef) compareWithBase(baseRef);

	setAliasProvider({ get: () => undefined });
	setDataSource(new FileDataSource(informationDir));
	await init();

	await renderEverything();

	console.log(`Rendered ${rendered} embeds and pulls from ${informationDir}`);
	report('Warnings', warnings);
	report('Failures', failures);

	process.exitCode = failures.length ? 1 : 0;
}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
