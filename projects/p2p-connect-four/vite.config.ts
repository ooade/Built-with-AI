import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
	return {
		base: '/p2p-connect-four/',
		build: {
			outDir: '../../dist/p2p-connect-four',
			emptyOutDir: true,
		},
		server: {
			port: 3000,
			host: '0.0.0.0',
		},
		plugins: [react()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, '.'),
			},
		},
	};
});
