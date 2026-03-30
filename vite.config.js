import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const https = fs.existsSync('cert/localhost-key.pem')
  ? { key: fs.readFileSync('cert/localhost-key.pem'), cert: fs.readFileSync('cert/localhost.pem') }
  : undefined;

export default defineConfig({
  plugins: [react()],
  base: '/fantasy-baseball/',
  server: {
    port: 3000,
    https,
  },
});
