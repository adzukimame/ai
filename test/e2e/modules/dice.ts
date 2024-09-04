process.env.NODE_ENV = 'test';

import { describe, test, expect, beforeAll } from 'vitest';
import { signup, post, api, sleep, generateConfig } from '../../utils';

import 藍 from '../../../src/ai';
import DiceModule from '../../../src/modules/dice/index';

describe('dice モジュール', () => {
	let ai: Awaited<ReturnType<typeof signup>>;
	let user: Awaited<ReturnType<typeof signup>>;

	beforeAll(async () => {
		ai = await signup({});
		user = await signup({});

		new 藍(ai, [new DiceModule()], generateConfig({ i: ai.token }));
		await sleep(1000);
	});

	describe('メンションに反応する', async () => {
		test.each([
			{ text: '1d6', match: /^\d です！$/ },
			{ text: '3d6', match: /^\d \d \d です！$/ }
		])('$text', async ({ text, match }) => {
			const note = await post(user, { text: `@${ai.username} ${text}` });
			await sleep(500);
			const children = await api('notes/children', { noteId: note.id });
			expect(children.body[0].text).toMatch(match);
		});
	});
});
