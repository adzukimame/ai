import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', 'test/e2e/**/*.?(c|m)[jt]s?(x)'],
		testTimeout: 30000,
		hookTimeout: 15000,
		globalSetup: ['./test/globalSetup.ts']
	},
	plugins: [tsConfigPaths()]
});
