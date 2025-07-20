import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const isGitHubPages = process.env.DEPLOY_TARGET === 'GH_PAGES';

export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react()];

  if (mode === 'development') {
    const injectChefDev = {
      name: 'inject-chef-dev',
      transform(code: string, id: string) {
        if (id.includes('main.tsx')) {
          return {
            code: `${code}

window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});`,
            map: null,
          };
        }
        return null;
      },
    };
    plugins.push(injectChefDev);
  }

  return {
    base: isGitHubPages ? '/GameBuddyv2/' : '/', // GitHub Pages for GH, / for Vercel
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
