import { createAnalyticsManager } from './analytics-manager';
import { NullAnalyticsService } from './null-analytics-service';
import type { AnalyticsManager } from './types';

export { createPostHogServerService } from './providers/posthog-server';

export const analytics: AnalyticsManager = createAnalyticsManager({
  providers: {
    null: () => NullAnalyticsService,
  },
});
