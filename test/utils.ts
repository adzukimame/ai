import type { Endpoints as MisskeyApiEndpoints } from 'misskey-js';
import type { SwitchCaseResponseType } from 'misskey-js/api.types.js';
import type { Note } from 'misskey-js/entities.js';
import type { Config } from '../src/config';

export interface UserToken {
	token: string;
}

/**
 * APIを呼び出します
 */
export async function api<E extends keyof MisskeyApiEndpoints, P extends MisskeyApiEndpoints[E]['req']>(endpoint: E, param: P, me?: UserToken): Promise<{
	status: number;
	headers: Headers;
	body: SwitchCaseResponseType<E, P>;
}> {
	const url = new URL('http://localhost:3000');
	url.pathname = `/api/${endpoint}`;

	const bodyAuth: Record<string, string> = {};

	if (me) {
		bodyAuth.i = me.token;
	}

	const res = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(Object.assign(bodyAuth, param)),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const body = res.ok && res.headers.get('Content-Type') === 'application/json; charset=utf-8'
		? await res.json() as SwitchCaseResponseType<E, P>
		: null;

	if (!res.ok || res.headers.get('Content-Type') !== 'application/json; charset=utf-8') {
		// eslint-disable-next-line no-console
		console.error('Error:', res);
	}

	return {
		status: res.status,
		headers: res.headers,
		body: body!
	};
}

export function randomString(config?: {
	chars?: string;
	length?: number;
}) {
	const chars = config?.chars ?? 'abcdefghijklmnopqrstuvwxyz0123456789';
	const length = config?.length ?? 16;
	let randomString = '';
	for (let i = 0; i < length; i++) {
		randomString += chars[Math.floor(Math.random() * chars.length)];
	}
	return randomString;
}

export const signup = async (param: Partial<MisskeyApiEndpoints['signup']['req']>): Promise<NonNullable<MisskeyApiEndpoints['signup']['res']>> => {
	const q = Object.assign({
		username: randomString(),
		password: 'test'
	}, param);

	const res = await api('signup', q);

	return res.body;
};

export const post = async (user: UserToken, params: MisskeyApiEndpoints['notes/create']['req']): Promise<Note> => {
	const q = params;

	const res = await api('notes/create', q, user);

	return (res.body ? res.body.createdNote : null)!;
};

export function generateConfig(config: Partial<Config>): Config {
	const merged = Object.assign({
		host: 'http://localhost:3000',
		i: 'xxxxxxxx',
		keywordEnabled: true,
		reversiEnabled: true,
		notingEnabled: true,
		chartEnabled: true,
		serverMonitoring: true,
		mecab: '/usr/bin/mecab',
		mecabDic: '/var/lib/mecab/dic/juman-utf8/'
	} as Config, config);

	merged.host = new URL(merged.host).origin;
	merged.apiUrl = merged.host + '/api';
	merged.wsUrl = merged.host.replace('http', 'ws');

	return merged;
}

export async function sleep(msec: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(() => resolve(), msec);
	});
}
