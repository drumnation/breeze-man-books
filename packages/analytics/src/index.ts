import { createAnalyticsManager } from './analytics-manager';
import { NullAnalyticsService } from './null-analytics-service';
import type { AnalyticsManager } from './types';

export { createPostHogClientService } from './providers/posthog-client';

export const analytics: AnalyticsManager = createAnalyticsManager({
  providers: {
    null: () => NullAnalyticsService,
  },
});
