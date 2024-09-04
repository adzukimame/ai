import { readFileSync } from 'node:fs';
import { bindThis } from '@/decorators.js';
import loki from 'lokijs';
import Module from '@/module.js';
import serifs from '@/serifs.js';
import { mecab } from './mecab.js';

function kanaToHira(str: string) {
	return str.replace(/[\u30a1-\u30f6]/g, match => {
		const chr = match.charCodeAt(0) - 0x60;
		return String.fromCharCode(chr);
	});
}

export default class extends Module {
	public readonly name = 'keyword';

	private learnedKeywords: loki.Collection<{
		keyword: string;
		learnedAt: number;
	}>;

	@bindThis
	public install() {
		if (!this.ai.getConfig('keywordEnabled')) return {};

		this.learnedKeywords = this.ai.getCollection('_keyword_learnedKeywords', {
			indices: ['keyword']
		});

		setInterval(this.learn, 1000 * 60 * 60);

		return {};
	}

	@bindThis
	private async learn() {
		const tl = (await Promise.all([
			this.ai.api('notes/local-timeline', {
				limit: 30,
				withRenotes: false
			}),
			this.ai.api('notes/timeline', {
				limit: 30,
				withRenotes: false
			})
		])).flat();

		const interestedNotes = tl.filter(note =>
			note.userId !== this.ai.account.id &&
			note.text != null &&
			note.cw == null &&
			note.visibility != 'followers' &&
			note.visibility != 'specified');

		let keywords: string[][] = [];

		let jaEnDic: string | undefined = undefined;
		try {
			jaEnDic = readFileSync(`${import.meta.dirname}/../../../google-ime-user-dictionary-ja-en.txt`).toString();
		} catch { /* nop */ }

		for (const note of interestedNotes) {
			const tokens = await mecab(note.text as string, this.ai.getConfig('mecab'), this.ai.getConfig('mecabDic'));
			const keywordsInThisNote = tokens.filter(token => token[2] == '固有名詞' && (token[8] != null || (jaEnDic !== undefined && new RegExp(`^([^\\t]+)\\t${token[0]}(?=\\t)`, 'im').test(jaEnDic))));
			keywords = keywords.concat(keywordsInThisNote);
		}

		if (keywords.length === 0) {
			this.log('No keywords found.');
			return;
		}

		const rnd = Math.floor((1 - Math.sqrt(Math.random())) * keywords.length);
		const keyword = keywords.sort((a, b) => a[0].length < b[0].length ? 1 : -1)[rnd];

		const exist = this.learnedKeywords.findOne({
			keyword: keyword[0]
		});

		let text: string;

		this.log(`Picked keyword: ${keyword[0]}`);

		if (exist) {
			this.log(`Already learned.`);
			return;
		} else {
			this.log('Learning...');

			this.learnedKeywords.insertOne({
				keyword: keyword[0],
				learnedAt: Date.now()
			});

			text = serifs.keyword.learned(keyword[0], kanaToHira(
				keyword[8] ?? new RegExp(`^([^\\t]+)\\t${keyword[0]}(?=\\t)`, 'im').exec(jaEnDic!)![1]
			));
		}

		this.ai.post({
			text: text
		});
	}
}
