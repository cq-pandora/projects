import { randomUUID } from 'node:crypto';

import { apkVersion } from '../util';

const WS_ADDRESS = 'wss://gslb-gamebase-lh.cloud.toast.com:11443/lh';
const GAMEBASE_APP_ID = 'yFEtSikK';

export interface GameUrls {
	/** Data sheets root (`sha1.json` and `<name>.data` files), with trailing slash */
	dataSheet: string;
	/** Asset bundles root (`Android/bundlelist.zz` and `Android/<bundle>.bytes`), with trailing slash */
	assets: string;
}

interface LaunchInfo {
	Patch_DataSheet: string;
	NPatch_URL: string;
}

function withTrailingSlash(url: string): string {
	return url.endsWith('/') ? url : `${url}/`;
}

function retrieveLaunchURL(clientVersion: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const ws = new WebSocket(WS_ADDRESS);

		ws.addEventListener('error', () => reject(new Error(`Unable to connect to ${WS_ADDRESS}`)));

		ws.addEventListener('open', () => {
			ws.send(JSON.stringify({
				productId: 'launching',
				apiId: 'getLaunching',
				version: 'v1.3.2',
				appId: GAMEBASE_APP_ID,
				parameters: {
					usimCountryCode: 'UA',
					deviceKey: '0000000000000000',
					clientVersion,
					displayLanguage: 'en',
					uuid: randomUUID(),
					deviceCountryCode: 'GB',
					osCode: 'AOS',
					lastCheckedNoticeTime: 0,
					osVersion: '9',
					termsVersion: '53.0.2',
					appId: GAMEBASE_APP_ID,
					deviceLanguage: 'en',
					sdkVersion: '2.26.0',
					deviceModel: 'STF-L09',
					storeCode: 'GG'
				},
				headers: {
					'X-TCGB-Transaction-Id': randomUUID()
				}
			}));
		});

		ws.addEventListener('message', (event) => {
			ws.close();

			try {
				const data = JSON.parse(String(event.data));
				const address: string | undefined = data.launching?.app?.accessInfo?.serverAddress;

				if (!address) {
					reject(new TypeError(`No server address in launching response: ${String(event.data)}`));
					return;
				}

				// Value is `;`-separated list of equivalent addresses
				resolve(address.split(';')[0]);
			} catch (e) {
				reject(e);
			}
		});
	});
}

async function retrieveLaunchInfo(launchUrl: string): Promise<LaunchInfo> {
	const response = await fetch(launchUrl);

	if (!response.ok) {
		throw new Error(`Launch info request to ${launchUrl} failed with ${response.status}`);
	}

	const info = await response.json() as Partial<LaunchInfo>;

	if (!info.Patch_DataSheet || !info.NPatch_URL) {
		throw new TypeError(`Launch info from ${launchUrl} has no patch URLs: ${JSON.stringify(info)}`);
	}

	return info as LaunchInfo;
}

export async function getGameUrls(): Promise<GameUrls> {
	const launchUrl = await retrieveLaunchURL(await apkVersion());
	const info = await retrieveLaunchInfo(launchUrl);

	return {
		dataSheet: withTrailingSlash(info.Patch_DataSheet),
		assets: withTrailingSlash(info.NPatch_URL),
	};
}
