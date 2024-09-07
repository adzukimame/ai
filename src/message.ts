import { bindThis } from '@/decorators.js';
import chalk from 'chalk';

import 藍 from '@/ai.js';
import Friend from '@/friend.js';
import type { Note, UserDetailed, DriveFile } from 'misskey-js/entities.js';
import includes from '@/utils/includes.js';
import or from '@/utils/or.js';
import { sleep } from '@/utils/sleep.js';

export default class Message {
	private ai: 藍;
	private note: Note;

	public get id(): Note['id'] {
		return this.note.id;
	}

	public get user(): Note['user'] {
		return this.note.user;
	}

	public get userId(): Note['userId'] {
		return this.note.userId;
	}

	public get text(): Note['text'] {
		return this.note.text;
	}

	public get quoteId(): Note['renoteId'] {
		return this.note.renoteId;
	}

	public get visibility(): Note['visibility'] {
		return this.note.visibility;
	}

	/**
	 * メンション部分を除いたテキスト本文
	 */
	public get extractedText(): string {
		const host = new URL(this.ai.getConfig('host')).host.replace(/\./g, '\\.');
		return this.text
			? this.text
				.replace(new RegExp(`^@${this.ai.account.username}@${host}\\s`, 'i'), '')
				.replace(new RegExp(`^@${this.ai.account.username}\\s`, 'i'), '')
				.trim()
			: '';
	}

	public get replyId(): Note['replyId'] {
		return this.note.replyId;
	}

	public friend: Friend;

	constructor(ai: 藍, note: Note) {
		this.ai = ai;
		this.note = note;

		this.friend = new Friend(ai, { user: this.user });

		// メッセージなどに付いているユーザー情報は省略されている場合があるので完全なユーザー情報を持ってくる
		this.ai.api('users/show', {
			userId: this.userId
		}).then(user => {
			this.friend.updateUser(user as UserDetailed);
		});
	}

	@bindThis
	public async reply(text: string | null, opts?: {
		file?: DriveFile;
		cw?: string;
		renote?: string;
		immediate?: boolean;
	}) {
		if (text == null) return;

		this.ai.log(`>>> Sending reply to ${chalk.underline(this.id)}`);

		if (!opts?.immediate && process.env.NODE_ENV !== 'test') {
			await sleep(2000);
		}

		return await this.ai.post({
			replyId: this.note.id,
			text: text,
			fileIds: opts?.file ? [opts?.file.id] : undefined,
			cw: opts?.cw,
			renoteId: opts?.renote,
			...(this.note.visibility === 'specified'
				? { visibility: 'specified' }
				: {})
		});
	}

	@bindThis
	public includes(words: string[]): boolean {
		return this.text ? includes(this.text, words) : false;
	}

	@bindThis
	public or(words: (string | RegExp)[]): boolean {
		return this.text ? or(this.extractedText, words) : false;
	}
}
