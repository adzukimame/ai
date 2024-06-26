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
	mecab?: string;
	mecabDic?: string;
	memoryDir?: string;
};

import config from '../config.json' assert { type: 'json' };

config['wsUrl'] = config.host.replace('http', 'ws');
config['apiUrl'] = config.host + '/api';

export default config as Config;
