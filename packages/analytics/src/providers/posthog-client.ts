import type { AnalyticsService } from '../types';

interface PostHogConfig {
  apiKey: string;
  apiHost: string;
}

const LOG_PREFIX = '[analytics:posthog]';

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
