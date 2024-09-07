process.env.NODE_ENV = 'test';

import { describe, test, expect, beforeAll } from 'vitest';
import { signup, post, api, sleep, generateConfig } from '../../utils';

import 藍 from '../../../src/ai';
import TalkModule from '../../../src/modules/talk/index';

describe('talk モジュール', () => {
	let ai: Awaited<ReturnType<typeof signup>>;
	let user: Awaited<ReturnType<typeof signup>>;

	beforeAll(async () => {
		ai = await signup({});
		user = await signup({});

		new 藍(ai, [new TalkModule()], generateConfig({ i: ai.token }));
		await sleep(1000);
	});

	describe('メンションに反応する', () => {
		test.each([
			{ text: 'こんにちは！', toInclude: 'こんにちは' },
			{ text: '挨拶したからほめて', toInclude: 'えらい' },
			{ text: 'おめでとう', toInclude: 'ありがとう' }
		])('$text', async ({ text, toInclude }) => {
			const mention = await post(user, { text: `@${ai.username} ${text}` });
			await sleep(500);
			const children = await api('notes/children', { noteId: mention.id });
			expect(children.body[0].text?.includes(toInclude)).toBe(true);
		});
	});
});
