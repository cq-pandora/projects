export type PromiseFailed = {
	status: 'rejected';
	reason: any;
};

export type PromiseSucceeded<T> = {
	status: 'fulfilled';
	value: T;
};

export type PromiseSettledResult<T> = PromiseSucceeded<T> | PromiseFailed;

export default function allSettled<T>(promises: Promise<T>[]): Promise<PromiseSettledResult<T>[]> {
	return Promise.all(promises.map(async p => {
		try {
			return {
				status: 'fulfilled',
				value: await p,
			} as PromiseSucceeded<T>;
		} catch (e) {
			return {
				status: 'rejected',
				reason: e,
			} as PromiseFailed;
		}
	}));
}
