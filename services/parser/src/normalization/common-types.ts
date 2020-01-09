export type NormalizationResult<T> = {
	entities: T[];
	translationIndex?: Record<string, string | number>;
	translationsKeys?: Record<string, string>;
};
