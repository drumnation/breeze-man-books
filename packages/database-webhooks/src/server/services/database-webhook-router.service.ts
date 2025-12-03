import { RecordChange, Tables } from '../record-change.type';

export function createDatabaseWebhookRouterService() {
  return new DatabaseWebhookRouterService();
}

/**
 * @name DatabaseWebhookRouterService
 * @description Service that routes the webhook event to the appropriate service
 */
class DatabaseWebhookRouterService {
  /**
   * @name handleWebhook
   * @description Handle the webhook event
   * @param body
   */
  async handleWebhook(body: RecordChange<keyof Tables>) {
    switch (body.table) {
      case 'subscriptions': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleSubscriptionsWebhook(payload);
      }

      default: {
        return;
      }
    }
  }

  private async handleSubscriptionsWebhook(
    body: RecordChange<'subscriptions'>,
  ) {
    if (body.type === 'DELETE' && body.old_record) {
      const { createBillingWebhooksService } =
        await import('@kit/billing-gateway');

      const service = createBillingWebhooksService();

      return service.handleSubscriptionDeletedWebhook(body.old_record);
    }
  }
}
