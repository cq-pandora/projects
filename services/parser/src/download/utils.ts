import axios from 'axios';
import { apkVersion } from '../util';

const launchingInfosUrl = (v: string) => `http://lnc.cc.nhnst.com:10080/hsp/lnc/getLaunchingInfos.json?gameNo=10329&gameClientVersion=${v}&platformSdkVersion=2.86&osType=2&osVersion=9&udid=00000000000000000000`

export async function getRootDownloadPath() {
	const currentApkVersion = await apkVersion();
	const { data: launchingInfos } = await axios.get(launchingInfosUrl(currentApkVersion));
	const gameUrls = launchingInfos.serverInfos.GAMESVR.split(';');

	return gameUrls[0];
}
