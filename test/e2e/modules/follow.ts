process.env.NODE_ENV = 'test';

import { describe, test, expect, beforeAll } from 'vitest';
import { signup, post, api, sleep, generateConfig } from '../../utils';

import 藍 from '../../../src/ai';
import FollowModule from '../../../src/modules/follow/index';

describe('follow モジュール', () => {
	let ai: Awaited<ReturnType<typeof signup>>;
	let user: Awaited<ReturnType<typeof signup>>;

	beforeAll(async () => {
		ai = await signup({});
		user = await signup({});

		new 藍(ai, [new FollowModule()], generateConfig({ i: ai.token }));
		await sleep(1000);
	});

	test('メンションに反応する', async () => {
		await post(user, { text: `@${ai.username} フォローして` });
		await sleep(500);
		const followers = await api('users/followers', { userId: user.id });
		expect(followers.body[0].followerId).toBe(ai.id);
	});
});
