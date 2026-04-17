import type { AnalyticsService } from '../types';

interface PostHogConfig {
  apiKey: string;
  apiHost: string;
}

const LOG_PREFIX = '[analytics:posthog]';

// posthog-node is only dynamically imported inside the server factory to keep
// Node-only modules (path, fs) out of the client bundle. See
// <https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility>.
type PostHogNodeClient = {
  capture(payload: {
    distinctId: string;
    event: string;
    properties?: Record<string, unknown>;
  }): void;
  identify(payload: { distinctId: string; properties?: Record<string, unknown> }): void;
};

// ---------------------------------------------------------------------------
// Client service — posthog-js lazy-loaded to minimize bundle impact
// ---------------------------------------------------------------------------

export const createPostHogClientService = (config: PostHogConfig): AnalyticsService => {
  const isEnabled = Boolean(config.apiKey && config.apiHost);
  let initialized = false;

  const initialize = async (): Promise<void> => {
    if (!isEnabled) return;
    try {
      const posthog = (await import('posthog-js')).default;
      posthog.init(config.apiKey, { api_host: config.apiHost });
      initialized = true;
    } catch (err) {
      console.warn(LOG_PREFIX, 'Failed to initialize posthog-js', err);
    }
  };

  const trackEvent = async (
    eventName: string,
    eventProperties?: Record<string, string | string[]>,
  ): Promise<void> => {
    if (!isEnabled || !initialized) return;
    try {
      const posthog = (await import('posthog-js')).default;
      posthog.capture(eventName, eventProperties ?? {});
    } catch (err) {
      console.warn(LOG_PREFIX, 'trackEvent failed', err);
    }
  };

  const identify = async (
    userId: string,
    traits?: Record<string, string>,
  ): Promise<void> => {
    if (!isEnabled || !initialized) return;
    try {
      const posthog = (await import('posthog-js')).default;
      posthog.identify(userId, traits ?? {});
    } catch (err) {
      console.warn(LOG_PREFIX, 'identify failed', err);
    }
  };

  const trackPageView = async (path: string): Promise<void> => {
    if (!isEnabled || !initialized) return;
    try {
      const posthog = (await import('posthog-js')).default;
      posthog.capture('$pageview', { $current_url: path });
    } catch (err) {
      console.warn(LOG_PREFIX, 'trackPageView failed', err);
    }
  };

  return { initialize, trackEvent, identify, trackPageView };
};

// ---------------------------------------------------------------------------
// Server service — posthog-node dynamically imported during initialize()
// ---------------------------------------------------------------------------

export const createPostHogServerService = (config: PostHogConfig): AnalyticsService => {
  const isEnabled = Boolean(config.apiKey && config.apiHost);

  let client: PostHogNodeClient | null = null;

  const initialize = async (): Promise<void> => {
    if (!isEnabled || client) return;
    try {
      const mod = await import('posthog-node');
      const Ctor = mod.PostHog;
      client = new Ctor(config.apiKey, {
        host: config.apiHost,
        flushAt: 1,
      }) as unknown as PostHogNodeClient;
    } catch (err) {
      console.warn(LOG_PREFIX, 'Failed to construct posthog-node client', err);
    }
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
