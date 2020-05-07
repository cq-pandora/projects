import decrypt from './decrypt';
import normalize from './normalization';
import split from './split';
import { downloadData } from './download';

(async (): Promise<void> => {
	await downloadData();
	await decrypt();
	await normalize();
	await split();
})();
