import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', 'test/e2e/**/*.?(c|m)[jt]s?(x)'],
		globals: true,
		testTimeout: 30000,
		hookTimeout: 15000,
		setupFiles: './test/setup.ts'
	},
	plugins: [tsConfigPaths()]
});
