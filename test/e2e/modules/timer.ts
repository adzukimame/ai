process.env.NODE_ENV = 'test';

import { describe, test, expect, beforeAll } from 'vitest';
import { signup, post, api, sleep, generateConfig } from '../../utils';

import 藍 from '../../../src/ai';
import TimerModule from '../../../src/modules/timer/index';

describe('timer モジュール', () => {
	let ai: Awaited<ReturnType<typeof signup>>;
	let user: Awaited<ReturnType<typeof signup>>;

	beforeAll(async () => {
		ai = await signup({});
		user = await signup({});

		new 藍(ai, [new TimerModule()], generateConfig({ i: ai.token }));
		await sleep(1000);
	});

	test('メンションに反応し、指定時間経過後にも反応する', async () => {
		const mention = await post(user, { text: `@${ai.username} 10秒` });
		await sleep(500);
		const children = await api('notes/children', { noteId: mention.id });
		expect(children.body[0].text).toBe('わかりました！');
		await sleep(10000 + 1000);
		const children2 = await api('notes/children', { noteId: mention.id });
		expect(children2.body[0].text).toBe('10秒経ちましたよ！');
	});
});
