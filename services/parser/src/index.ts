import decrypt from './decrypt';
import normalize from './normalization';
import split from './split';
import { downloadData, downloadAssets } from './download';

(async (): Promise<void> => {
	await downloadAssets();
	await downloadData();
	await decrypt();
	await normalize();
	await split();
})();
