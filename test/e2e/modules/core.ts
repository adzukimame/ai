process.env.NODE_ENV = 'test';

import { describe, test, expect, beforeAll } from 'vitest';
import { signup, post, api, sleep, generateConfig } from '../../utils';

import 藍 from '../../../src/ai';
import CoreModule from '../../../src/modules/core/index';
import TalkModule from '../../../src/modules/talk/index';

describe('core モジュール', () => {
	let ai: Awaited<ReturnType<typeof signup>>;
	let user: Awaited<ReturnType<typeof signup>>;
	let user2: Awaited<ReturnType<typeof signup>>;
	let Ai: 藍;

	beforeAll(async () => {
		ai = await signup({});
		user = await signup({});
		user2 = await signup({});

		Ai = new 藍(ai, [new CoreModule(), new TalkModule()], generateConfig({ i: ai.token }));
		await sleep(1000);
	});

	test('引っ越し', async () => {
		const res = await post(user, { text: `@${ai.username} 引っ越し` });
		await sleep(500);
		const children = await api('notes/children', { noteId: res.id });
		expect(children.body[0].text).toMatch(/^わかりました。\n合言葉は「(.+)」です！$/);

		const code = children.body[0].text!.match(/^わかりました。\n合言葉は「(.+)」です！$/)![1];

		const transferRes = await post(user2, { text: `@${ai.username} 「${code}」` });
		await sleep(500);
		const transferChildren = await api('notes/children', { noteId: transferRes.id });
		expect(transferChildren.body[0].text?.includes('おかえりなさい')).toBe(true);
	});

	test('setName', async () => {
		const res = await post(user, { text: `@${ai.username} あああああって呼んで` });
		await sleep(500);
		const children = await api('notes/children', { noteId: res.id });
		expect(children.body[0].text).toBe('さん付けした方がいいですか？');

		const yesNo = await post(user, { replyId: children.body[0].id, text: 'はい' });
		await sleep(500);
		const yesNoChildren = await api('notes/children', { noteId: yesNo.id });
		expect(yesNoChildren.body[0].text).toBe('わかりました。これからはあああああさんとお呼びしますね！');

		const greet = await post(user, { text: `@${ai.username} こんにちは` });
		await sleep(500);
		const greetChildren = await api('notes/children', { noteId: greet.id });
		expect(greetChildren.body[0].text?.includes('こんにちは')).toBe(true);
		expect(greetChildren.body[0].text?.includes('あああああさん')).toBe(true);
	});

	test('modules', async () => {
		const res = await post(user, { text: `@${ai.username} modules` });
		await sleep(500);
		const children = await api('notes/children', { noteId: res.id });
		expect(children.body[0].text).toBe('```\n' + Ai.modules.map(m => m.name).join('\n') + '\n```');
	});

	test('version', async () => {
		const res = await post(user, { text: `@${ai.username} version` });
		await sleep(500);
		const children = await api('notes/children', { noteId: res.id });
		expect(children.body[0].text).toBe(`\`\`\`\nv${Ai.version}\n\`\`\``);
	});
});
