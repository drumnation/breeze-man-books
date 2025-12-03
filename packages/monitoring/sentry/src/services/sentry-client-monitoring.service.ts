import type { Event, User } from '@sentry/react-router';

import { MonitoringService } from '@kit/monitoring-core';

const DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * @class
 * @implements {MonitoringService}
 * SentryClientMonitoringService is responsible for capturing exceptions and
 * identifying users using the Sentry monitoring service.
 */
export class SentryClientMonitoringService implements MonitoringService {
  private readonly readyPromise: Promise<unknown>;
  private readyResolver?: (value?: unknown) => void;

  constructor() {
    this.readyPromise = new Promise(
      (resolve) => (this.readyResolver = resolve),
    );

    void this.initialize();
  }

  async initialize() {
    await this.initializeSentryBrowserClient();

    this.readyResolver?.();
  }

  async ready() {
    return this.readyPromise;
  }

  async captureException(error: Error | null) {
    await this.initialize();

    const { captureException } = await import('@sentry/react-router').catch();

    return captureException(error);
  }

  async captureEvent<Extra extends Event>(event: string, extra?: Extra) {
    await this.initialize();

    const { captureEvent } = await import('@sentry/react-router').catch();

    return captureEvent({
      message: event,
      ...(extra ?? {}),
    });
  }

  async identifyUser(user: User) {
    await this.initialize();

    const { setUser } = await import('@sentry/react-router').catch();

    setUser(user);
  }

  private async initializeSentryBrowserClient() {
    const { init, browserTracingIntegration } =
      await import('@sentry/react-router').catch();

    const environment =
      import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.VERCEL_ENV;

    init({
      dsn: DSN,
      integrations: [
        browserTracingIntegration(),
        // add integrations here
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // the environment being used
      environment,
    });
  }
}
