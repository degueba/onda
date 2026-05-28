import { Config } from '@remotion/cli/config';
import { resolve } from 'node:path';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');

// Mirror the tsconfig.json path aliases so Remotion's webpack bundler
// can resolve `@onda/registry/*`, `@onda/lib/*`, and `@onda/showcase/*`
// the same way TypeScript does. Remotion's bundler doesn't read
// tsconfig paths automatically — these have to be repeated here.
// `process.cwd()` is the repo root because Remotion is invoked from there.
const ROOT = process.cwd();

Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: {
      ...(current.resolve?.alias ?? {}),
      '@onda/registry': resolve(ROOT, 'registry'),
      '@onda/lib': resolve(ROOT, 'lib'),
      '@onda/showcase': resolve(ROOT, 'www/src/showcase'),
    },
  },
}));
