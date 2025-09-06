import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

export function createAdminAccountsService(client: SupabaseClient<Database>) {
  return new AdminAccountsService(client);
}

class AdminAccountsService {
  constructor(private adminClient: SupabaseClient<Database>) {}

  async deleteAccount(accountId: string) {
    return this.adminClient.from('accounts').delete().eq('id', accountId);
  }
}
