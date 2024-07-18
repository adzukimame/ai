type Config = {
	host: string;
	serverName?: string;
	i: string;
	master?: string;
	wsUrl: string;
	apiUrl: string;
	restrictCommunication?: boolean;
	keywordEnabled: boolean;
	reversiEnabled: boolean;
	notingEnabled: boolean;
	chartEnabled: boolean;
	serverMonitoring: boolean;
	checkEmojisEnabled?: boolean;
	checkEmojisAtOnce?: boolean;
	mazeEnabled?: boolean;
	pollEnabled?: boolean;
	mecab?: string;
	mecabDic?: string;
	memoryDir?: string;
};

import baseConfig from '../config.json' assert { type: 'json' };

baseConfig.host = new URL(baseConfig.host).origin;

const config: Config = {
	...baseConfig,
	wsUrl: baseConfig.host.replace('http', 'ws'),
  apiUrl: baseConfig.host + '/api',
};

export default config as Config;
