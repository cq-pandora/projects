import decrypt from './decrypt';
import normalize from './normalization';
import split from './split';
import { downloadData, downloadAssets, initData } from './download';

(async (): Promise<void> => {
	await initData();
	await downloadData();
	await downloadAssets();
	await decrypt();
	await normalize();
	await split();
})();
