import { client as WebSocket } from 'websocket';
import { v4 as uuidv4 } from 'uuid';
import { apkVersion } from '../util';

const WS_ADDRESS = 'wss://gslb-gamebase-lh.cloud.toast.com:11443/lh';

function retrieveURLFromWS(clientVersion: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const ws = new WebSocket({
			webSocketVersion: 13,
			tlsOptions: {
				headers: {
					'User-Agent': 'okhttp/3.12.3',
				},
			},
		});

		ws.on('connectFailed', reject);

		ws.on('connect', (wsc) => {
			wsc.send(JSON.stringify({
				productId: 'launching',
				apiId: 'getLaunching',
				version: 'v1.3.2',
				appId: 'yFEtSikK',
				parameters: {
					usimCountryCode: 'UA',
					deviceKey: '0000000000000000',
					clientVersion,
					displayLanguage: 'en',
					uuid: uuidv4(),
					deviceCountryCode: 'GB',
					osCode: 'AOS',
					lastCheckedNoticeTime: 0,
					osVersion: '9',
					termsVersion: '53.0.2',
					appId: 'yFEtSikK',
					deviceLanguage: 'en',
					sdkVersion: '2.26.0',
					deviceModel: 'STF-L09',
					storeCode: 'GG'
				},
				headers: {
					'X-TCGB-Transaction-Id': uuidv4()
				}
			}));

			wsc.on('message', message => {
				if (message.type === 'utf8') {
					const data = JSON.parse(message.utf8Data);

					wsc.close();
					resolve(data.launching.app.accessInfo.serverAddress);
				} else {
					wsc.close();
					reject(new TypeError(`Bad response ${JSON.stringify(message)}`));
				}
			});
		});

		ws.connect(WS_ADDRESS);
	});
}

export async function getRootDownloadPath(): Promise<string> {
	const currentApkVersion = await apkVersion();
	const serverAddresses = await retrieveURLFromWS(currentApkVersion);
	const gameUrls = serverAddresses.split(';');

	return gameUrls[0];
}
