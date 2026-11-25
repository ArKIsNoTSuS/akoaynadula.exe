import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';
// Relative base ('./') works under any GitHub Pages repo path. To force an absolute base,
// build with VITE_BASE=/your-repo-name/ (see README).
export default defineConfig({plugins:[react()],base:process.env.VITE_BASE||'./'});
