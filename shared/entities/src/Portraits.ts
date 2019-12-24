import { TranslationKey } from './commonTypes';

export type PortraitKeys = Array<string>;
export type Portraits = {
	[K in TranslationKey]: PortraitKeys
};

export function parsePortraits(rawJson: string): Portraits {
	return JSON.parse(rawJson) as Portraits;
}
