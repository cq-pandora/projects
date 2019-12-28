import { ContextType } from '../common-types';

type Aliases = {
	[T in ContextType]?: {
		[k: string]: string;
	}
};

type ReverseAliases = {
	[T in ContextType]?: {
		[k: string]: string[];
	}
};

export default class AliasesConfig {
	private aliases: Aliases = {};
	private reverseAliases: ReverseAliases = {};

	set(ctx: ContextType, aliasRaw = '', f = ''): AliasesConfig {
		const ctxAliases = this.aliases[ctx] = this.aliases[ctx] || {};
		const ctxReverseAliases = this.reverseAliases[ctx] = this.reverseAliases[ctx] || {};

		const reverseAliasEntry = ctxReverseAliases[f] = ctxReverseAliases[f] || [];

		const alias = aliasRaw.toLowerCase();

		ctxAliases[alias] = f;

		if (!reverseAliasEntry.includes(alias)) {
			reverseAliasEntry.push(alias);
		}

		return this;
	}

	get = (ctx: ContextType, alias: string): string | undefined => (this.aliases[ctx] || {})[alias];

	getCommandAliases = (command: string): string[] | undefined => (this.reverseAliases.commands || {})[command];

	remove(ctx: ContextType, aliasRaw: string): boolean {
		const ctxAliases = this.aliases[ctx] = this.aliases[ctx] || {};
		const ctxReverseAliases = this.reverseAliases[ctx] = this.reverseAliases[ctx] || {};

		const alias = aliasRaw.toLowerCase();
		const target = ctxAliases[alias];

		if (!target) { return false; }

		delete ctxAliases[alias];

		ctxReverseAliases[target] = (ctxReverseAliases[target] || []).filter(a => a !== alias);

		return true;
	}
}
