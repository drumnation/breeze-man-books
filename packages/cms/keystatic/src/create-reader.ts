import process from 'node:process';
import { z } from 'zod';

import { KeystaticStorage } from './keystatic-storage';
import { keyStaticConfig } from './keystatic.config';

/**
 * Create a KeyStatic reader based on the storage kind.
 */
export async function createKeystaticReader() {
  switch (KeystaticStorage.kind) {
    case 'local': {
      const { createReader } = await import('@keystatic/core/reader').catch();

      return createReader(process.cwd(), keyStaticConfig);
    }

    case 'github':
    case 'cloud': {
      const { createGitHubReader } =
        await import('@keystatic/core/reader/github').catch();

      return createGitHubReader(
        keyStaticConfig,
        getKeystaticGithubConfiguration(),
      );
    }

    default:
      throw new Error(`Unknown storage kind`);
  }
}

function getKeystaticGithubConfiguration() {
  const repo =
    import.meta.env.VITE_KEYSTATIC_STORAGE_REPO ??
    process.env.KEYSTATIC_STORAGE_REPO;
  const token = process.env.KEYSTATIC_GITHUB_TOKEN;
  const pathPrefix = process.env.KEYSTATIC_PATH_PREFIX;

  return z
    .object({
      token: z.string({
        description:
          'The GitHub token to use for authentication. Please provide the value through the "KEYSTATIC_GITHUB_TOKEN" environment variable.',
      }),
      repo: z.custom<`${string}/${string}`>(),
      pathPrefix: z.string().optional(),
    })
    .parse({
      token,
      repo,
      pathPrefix,
    });
}
