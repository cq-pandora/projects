import decrypt from './decrypt';
import normalize from './normalization';
import split from './split';

(async (): Promise<void> => {
	await decrypt();
	await normalize();
	await split();
})();
