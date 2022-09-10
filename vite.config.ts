import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/my-tr-bible/',
  plugins: [
    react(),
    svgrPlugin({
      // https://react-svgr.com/docs/options/
      svgrOptions: {},
    }),
    tsconfigPaths(),
  ],
});
