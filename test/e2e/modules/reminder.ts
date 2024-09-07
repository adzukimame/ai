process.env.NODE_ENV = 'test';

import { describe, test, expect, beforeAll } from 'vitest';
import { signup, post, api, sleep, generateConfig } from '../../utils';

import 藍 from '../../../src/ai';
import ReminderModule from '../../../src/modules/reminder/index';

describe('reminder モジュール', () => {
	let ai: Awaited<ReturnType<typeof signup>>;
	let user: Awaited<ReturnType<typeof signup>>;

	beforeAll(async () => {
		ai = await signup({});
		user = await signup({});

		new 藍(ai, [new ReminderModule()], generateConfig({ i: ai.token }));
		await sleep(1000);
	});

	test('メンションに反応する', async () => {
		const remind = await post(user, { text: `@${ai.username} remind あああああ` });
		await sleep(500);
		const reactions = await api('notes/reactions', { noteId: remind.id, type: '🆗' });
		expect(reactions.body[0].user.id).toBe(ai.id);

		await post(user, { text: `@${ai.username} remind おおおおお` });

		const reminds = await post(user, { text: `@${ai.username} reminds` });
		await sleep(500);
		const children = await api('notes/children', { noteId: reminds.id });
		expect(children.body[0].text).toBe('やること一覧です！\n・おおおおお\n・あああああ');
	});
});
