import { bindThis } from '@/decorators.js';
import Module from '@/module.js';
import serifs from '@/serifs.js';
import type { ServerStats } from 'misskey-js/entities.js';
import { Channels, ChannelConnection } from 'misskey-js';

export default class extends Module {
	public readonly name = 'server';

	private connection?: ChannelConnection<Channels['serverStats']>;
	private recentStat: ServerStats;
	private warned = false;
	private lastWarnedAt: number;

	/**
	 * 1秒毎のログ1分間分
	 */
	private statsLogs: ServerStats[] = [];

	@bindThis
	public install() {
		if (!this.ai.getConfig('serverMonitoring')) return {};

		this.connection = this.ai.connection.useChannel('serverStats');
		this.connection.on('stats', this.onStats);

		setInterval(() => {
			this.statsLogs.unshift(this.recentStat);
			if (this.statsLogs.length > 60) this.statsLogs.pop();
		}, 1000);

		setInterval(() => {
			this.check();
		}, 3000);

		return {};
	}

	@bindThis
	private check() {
		const average = (arr: number[]) => arr.reduce((a, b) => a + b) / arr.length;

		const cpuPercentages = this.statsLogs.map(s => s ? s.cpu * 100 : 0);
		const cpuPercentage = average(cpuPercentages);
		if (cpuPercentage >= 70) {
			this.warn();
		} else if (cpuPercentage <= 30) {
			this.warned = false;
		}
	}

	@bindThis
	private async onStats(stats: ServerStats) {
		this.recentStat = stats;
	}

	@bindThis
	private warn() {
		//#region 前に警告したときから一旦落ち着いた状態を経験していなければ警告しない
		// 常に負荷が高いようなサーバーで無限に警告し続けるのを防ぐため
		if (this.warned) return;
		//#endregion

		//#region 前の警告から1時間経っていない場合は警告しない
		const now = Date.now();

		if (this.lastWarnedAt != null) {
			if (now - this.lastWarnedAt < (1000 * 60 * 60)) return;
		}

		this.lastWarnedAt = now;
		//#endregion

		this.ai.post({
			text: serifs.server.cpu
		});

		this.warned = true;
	}
}
