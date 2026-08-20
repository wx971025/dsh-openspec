import * as esbuild from 'esbuild'
import { mkdirSync } from 'node:fs'

mkdirSync('lib', { recursive: true })

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'lib/index.js',
  packages: 'external',
  logLevel: 'info',
})

await esbuild.build({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  outfile: 'lib/client.js',
  logLevel: 'info',
  jsx: 'automatic',
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'react-dom/client',
    '@deepseek-ai/cordis',
  ],
  banner: {
    js: 'window.__ModuleLoader__.load({ id: "dsh-openspec", factory: (require) => {\nvar module = { exports: {} }; var exports = module.exports;',
  },
  footer: {
    js: 'return module.exports; } });',
  },
})
