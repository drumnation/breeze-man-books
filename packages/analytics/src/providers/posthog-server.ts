import { PostHog as PostHogNode } from 'posthog-node';

import type { AnalyticsService } from '../types';

interface PostHogConfig {
  apiKey: string;
  apiHost: string;
}

const LOG_PREFIX = '[analytics:posthog]';

// ---------------------------------------------------------------------------
// Server service — posthog-node statically imported, client constructed eagerly.
// This file must ONLY be imported from the `@kit/analytics/server` entry,
// never from the client `index.ts` — it pulls in Node-only modules.
// ---------------------------------------------------------------------------

export const createPostHogServerService = (config: PostHogConfig): AnalyticsService => {
  const isEnabled = Boolean(config.apiKey && config.apiHost);

  let client: InstanceType<typeof PostHogNode> | null = null;

  if (isEnabled) {
    try {
      client = new PostHogNode(config.apiKey, {
        host: config.apiHost,
        flushAt: 1,
      });
    } catch (err) {
      console.warn(LOG_PREFIX, 'Failed to construct posthog-node client', err);
    }
  }

  const initialize = async (): Promise<void> => {
    // Server client constructed synchronously in factory; nothing to await.
  };

  const trackEvent = async (
    eventName: string,
    eventProperties?: Record<string, string | string[]>,
  ): Promise<void> => {
    if (!client) return;
    try {
      client.capture({
        distinctId: 'server',
        event: eventName,
        properties: eventProperties,
      });
    } catch (err) {
      console.warn(LOG_PREFIX, 'trackEvent failed', err);
    }
  };

  const identify = async (
    userId: string,
    traits?: Record<string, string>,
  ): Promise<void> => {
    if (!client) return;
    try {
      client.identify({ distinctId: userId, properties: traits });
    } catch (err) {
      console.warn(LOG_PREFIX, 'identify failed', err);
    }
  };

  const trackPageView = async (path: string): Promise<void> => {
    if (!client) return;
    try {
      client.capture({
        distinctId: 'server',
        event: '$pageview',
        properties: { $current_url: path },
      });
    } catch (err) {
      console.warn(LOG_PREFIX, 'trackPageView failed', err);
    }
  };

  return { initialize, trackEvent, identify, trackPageView };
};
