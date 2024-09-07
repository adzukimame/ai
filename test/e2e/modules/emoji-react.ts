process.env.NODE_ENV = 'test';

import { describe, test, expect, beforeAll } from 'vitest';
import { signup, post, api, sleep, generateConfig } from '../../utils';

import 藍 from '../../../src/ai';
import EmojiReactModule from '../../../src/modules/emoji-react/index';

describe('emoji-react モジュール', () => {
	let ai: Awaited<ReturnType<typeof signup>>;
	let user: Awaited<ReturnType<typeof signup>>;

	beforeAll(async () => {
		ai = await signup({});
		user = await signup({});

		await api('following/create', { userId: user.id, withReplies: true }, ai);
		await api('users/followers', { userId: user.id });

		new 藍(ai, [new EmojiReactModule()], generateConfig({ i: ai.token }));
		await sleep(1000);
	});

	describe('条件を満たすノートに反応する', () => {
		test.each([
			{ description: 'Unicode絵文字が一つだけ含まれるノート', text: '🦀', reaction: '🦀' },
			{ description: '✊', text: '✊', reaction: '🖐' },
			{ description: '✌', text: '✌', reaction: '✊' },
			{ description: '🖐', text: '🖐', reaction: '✌' },
			{ description: '✋', text: '✋', reaction: '✌' },
			{ description: 'ピザ', text: 'ピザ', reaction: '🍕' },
			{ description: 'プリン', text: 'プリン', reaction: '🍮' },
			{ description: '寿司', text: '寿司', reaction: '🍣' },
			{ description: '藍', text: '藍', reaction: '🙌' }
		])('$description', async ({ text, reaction }) => {
			const note = await post(user, { text });
			await sleep(500);
			const reactions = await api('notes/reactions', { noteId: note.id, type: reaction });
			expect(reactions.body[0].user.id).toBe(ai.id);
		});
	});

	describe('条件を満たさないノートに反応しない', () => {
		test.each([
			{ description: '本文が空のノート', note: { poll: { choices: ['a', 'b'] } } },
			{ description: 'Unicode絵文字が複数含まれるノート', note: { text: '🦀🦐' } }
		])('$description', async ({ note }) => {
			const createdNote = await post(user, note);
			await sleep(1000);
			const reactions = await api('notes/reactions', { noteId: createdNote.id });
			expect(reactions.body).toStrictEqual([]);
		});
	});

	describe('条件を満たさないノートに反応しない', () => {
		test('\'リプライ\'', async () => {
			const replyTarget = await post(user, { text: 'text' });
			await sleep(500);
			const note = await post(user, { text: 'プリン', replyId: replyTarget.id });
			await sleep(1000);
			const reactions = await api('notes/reactions', { noteId: note.id, type: '🍮' });
			expect(reactions.body).toStrictEqual([]);
		});
	});
});
