import { LoaderFunctionArgs, data, redirect } from 'react-router';

import { z } from 'zod';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import {
  createInvitationContextBuilder,
  createInvitationsPolicyEvaluator,
} from '@kit/team-accounts/policies';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const client = getSupabaseServerClient(request);
  const user = await requireUser(client);

  if (user.error) {
    return redirect(user.redirectTo);
  }

  const { account } = z.object({ account: z.string() }).parse(params);

  try {
    // Evaluate with standard evaluator
    const evaluator = createInvitationsPolicyEvaluator();
    const hasPolicies = await evaluator.hasPoliciesForStage('preliminary');

    if (!hasPolicies) {
      return data({
        allowed: true,
        reasons: [],
        metadata: {
          policiesEvaluated: 0,
          timestamp: new Date().toISOString(),
          noPoliciesConfigured: true,
        },
      });
    }

    // Build context for policy evaluation (empty invitations for testing)
    const contextBuilder = createInvitationContextBuilder(client);

    const context = await contextBuilder.buildContext(
      {
        invitations: [],
        accountSlug: account,
        csrfToken: '',
      },
      user.data,
    );

    // validate against policies
    const result = await evaluator.canInvite(context, 'preliminary');

    return data(result);
  } catch (error) {
    return data(
      {
        allowed: false,
        reasons: [
          error instanceof Error ? error.message : 'Unknown error occurred',
        ],
        metadata: {
          error: true,
          originalError: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 },
    );
  }
}
