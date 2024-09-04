import { beforeAll } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = async (endpoint: string, param: Record<string, any>, token?: string) => {
	const url = new URL('http://localhost:3000');
	url.pathname = `/api/${endpoint}`;

	return await fetch(url, {
		method: 'POST',
		body: param ? JSON.stringify(param) : undefined,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {})
		}
	}).then(res => {
		if (res.status === 204) {
			return null;
		} else if (res.ok) {
			return res.json();
		} else {
			// eslint-disable-next-line no-console
			console.error('Error:', res);
			return null;
		}
	});
};

beforeAll(async () => {
	const meta = await api('meta', { detail: true });
	const requireSetup: boolean = meta.requireSetup;

	const res = await api(requireSetup ? 'admin/accounts/create' : 'signin', {
		username: 'test',
		password: 'test'
	});

	const adminToken: string = requireSetup ? res.token : res.i;

	await api('admin/update-meta', {
		disableRegistration: false
	}, adminToken);

	await api('admin/roles/update-default-policies', {
		policies: {
			rateLimitFactor: 0
		}
	}, adminToken);
});
