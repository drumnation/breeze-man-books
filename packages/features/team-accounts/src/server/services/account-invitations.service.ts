import { redirect } from 'react-router';

import { JwtPayload, SupabaseClient } from '@supabase/supabase-js';

import { addDays, formatISO } from 'date-fns';
import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';
import { requireUser } from '@kit/supabase/require-user';

import {
  DeleteInvitationSchema,
  InvitationsSchema,
  InviteMembersSchema,
} from '../../schema';
import type { UpdateInvitationSchema } from '../../schema';
import { createInvitationContextBuilder } from '../policies/invitation-context-builder';
import { createInvitationsPolicyEvaluator } from '../policies/invitation-policies';
import { createAccountInvitationsDispatchService } from './account-invitations-dispatcher.service';

export function createAccountInvitationsService(
  client: SupabaseClient<Database>,
) {
  return new AccountInvitationsService(client);
}

/**
 * @name AccountInvitationsService
 * @description Service for managing account invitations.
 */
class AccountInvitationsService {
  private readonly namespace = 'invitations';

  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * @name deleteInvitation
   * @description Removes an invitation from the database.
   * @param params
   */
  async deleteInvitation(params: z.infer<typeof DeleteInvitationSchema>) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      ...params,
    };

    logger.info(ctx, 'Removing invitation...');

    const { error } = await this.client.from('invitations').delete().match({
      id: params.payload.invitationId,
    });

    if (error) {
      logger.error(ctx, `Failed to remove invitation`);

      return {
        success: false,
      };
    }

    logger.info(ctx, 'Invitation successfully removed');

    return {
      success: true,
    };
  }

  /**
   * @name updateInvitation
   * @param params
   * @description Updates an invitation in the database.
   */
  async updateInvitation({ payload }: z.infer<typeof UpdateInvitationSchema>) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      ...payload,
    };

    logger.info(ctx, 'Updating invitation...');

    const { error } = await this.client
      .from('invitations')
      .update({
        role: payload.role,
      })
      .match({
        id: payload.invitationId,
      });

    if (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to update invitation',
      );

      return {
        success: false,
      };
    }

    logger.info(ctx, 'Invitation successfully updated');

    return {
      success: true,
    };
  }

  /**
   * @name sendInvitations
   * @description Sends invitations to join a team.
   * @param accountSlug
   * @param invitations
   */
  async sendInvitations({
    accountSlug,
    invitations,
  }: {
    invitations: z.infer<typeof InviteMembersSchema>['payload']['invitations'];
    accountSlug: string;
  }) {
    const logger = await getLogger();

    const ctx = {
      accountSlug,
      name: this.namespace,
    };

    const user = await requireUser(this.client);

    if (user.error) {
      logger.error(ctx, 'User not found');

      return redirect(user.redirectTo);
    }

    // Evaluate invitation policies
    const policiesResult = await this.evaluateInvitationsPolicies(
      { invitations, accountSlug, csrfToken: '' },
      user.data,
    );

    // If the invitations are not allowed, throw an error
    if (!policiesResult.allowed) {
      logger.info(
        { reasons: policiesResult?.reasons, userId: user.data.id },
        'Invitations blocked by policies',
      );

      return {
        success: false,
        reasons: policiesResult?.reasons,
      };
    }

    logger.info(ctx, 'Storing invitations...');

    const accountResponse = await this.client
      .from('accounts')
      .select('name')
      .eq('slug', accountSlug)
      .single();

    if (!accountResponse.data) {
      logger.error(
        ctx,
        'Account not found in database. Cannot send invitations.',
      );

      return {
        success: false,
      };
    }

    try {
      await Promise.all(
        invitations.map((invitation) =>
          this.validateInvitation(invitation, accountSlug),
        ),
      );
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error: (error as Error).message,
        },
        'Error validating invitations',
      );

      return {
        success: false,
      };
    }

    const response = await this.client.rpc('add_invitations_to_account', {
      invitations,
      account_slug: accountSlug,
    });

    if (response.error) {
      logger.error(
        {
          ...ctx,
          error: response.error,
        },
        `Failed to add invitations to account ${accountSlug}`,
      );

      return {
        success: false,
      };
    }

    const responseInvitations = Array.isArray(response.data)
      ? response.data
      : [response.data];

    logger.info(
      {
        ...ctx,
        count: responseInvitations.length,
      },
      'Invitations added to account',
    );

    await this.dispatchInvitationEmails(ctx, responseInvitations);

    return {
      success: true,
    };
  }

  /**
   * @name acceptInvitationToTeam
   * @description Accepts an invitation to join a team.
   */
  async acceptInvitationToTeam(
    adminClient: SupabaseClient<Database>,
    params: {
      userId: string;
      inviteToken: string;
      userEmail: string;
    },
  ) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      ...params,
    };

    logger.info(ctx, 'Accepting invitation to team');

    const invitation = await adminClient
      .from('invitations')
      .select('email')
      .eq('invite_token', params.inviteToken)
      .single();

    // if the invitation email does not match the user email, throw an error
    if (invitation.data?.email !== params.userEmail) {
      logger.error({
        ...ctx,
        error: 'Invitation email does not match user email',
      });

      throw new Error('Invitation email does not match user email');
    }

    const { error, data } = await adminClient.rpc('accept_invitation', {
      token: params.inviteToken,
      user_id: params.userId,
    });

    if (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to accept invitation to team',
      );

      throw error;
    }

    logger.info(ctx, 'Successfully accepted invitation to team');

    return data;
  }

  /**
   * @name renewInvitation
   * @description Renews an invitation to join a team by extending the expiration date by 7 days.
   * @param invitationId
   */
  async renewInvitation(invitationId: number) {
    const logger = await getLogger();

    const ctx = {
      invitationId,
      name: this.namespace,
    };

    logger.info(ctx, 'Renewing invitation...');

    const sevenDaysFromNow = formatISO(addDays(new Date(), 7));

    const { error } = await this.client
      .from('invitations')
      .update({
        expires_at: sevenDaysFromNow,
      })
      .match({
        id: invitationId,
      });

    if (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to renew invitation',
      );

      return {
        success: false,
      };
    }

    logger.info(ctx, 'Invitation successfully renewed');

    return {
      success: true,
    };
  }

  async validateInvitation(
    invitation: z.infer<typeof InvitationsSchema>['invitations'][number],
    accountSlug: string,
  ) {
    const { data: members, error } = await this.client.rpc(
      'get_account_members',
      {
        account_slug: accountSlug,
      },
    );

    if (error) {
      throw error;
    }

    const isUserAlreadyMember = members.find((member) => {
      return member.email === invitation.email;
    });

    if (isUserAlreadyMember) {
      throw new Error('User already member of the team');
    }
  }

  /**
   * @name evaluateInvitationsPolicies
   * @description Evaluates invitation policies with performance optimization.
   * @param params - The invitations to evaluate (emails and roles).
   */
  async evaluateInvitationsPolicies(
    params: z.infer<typeof InviteMembersSchema>['payload'],
    user: JwtPayload,
  ) {
    const evaluator = createInvitationsPolicyEvaluator();
    const hasPolicies = await evaluator.hasPoliciesForStage('submission');

    // No policies to evaluate, skip
    if (!hasPolicies) {
      return {
        allowed: true,
        reasons: [],
      };
    }

    const builder = createInvitationContextBuilder(this.client);
    const context = await builder.buildContext(params, user);

    return evaluator.canInvite(context, 'submission');
  }

  /**
   * @name dispatchInvitationEmails
   * @description Dispatches invitation emails to the invited users.
   * @param ctx
   * @param invitations
   * @returns
   */
  private async dispatchInvitationEmails(
    ctx: { accountSlug: string; name: string },
    invitations: Database['public']['Tables']['invitations']['Row'][],
  ) {
    if (!invitations.length) {
      return;
    }

    const logger = await getLogger();
    const service = createAccountInvitationsDispatchService(this.client);

    const results = await Promise.allSettled(
      invitations.map(async (invitation) => {
        // Generate internal link that will validate and generate auth token on-demand
        const link = service.getAcceptInvitationLink(invitation.invite_token);

        // send the invitation email
        const data = await service.sendInvitationEmail({
          invitation,
          link,
        });

        // return the result
        return {
          id: invitation.id,
          data,
        };
      }),
    );

    for (const result of results) {
      if (result.status !== 'fulfilled' || !result.value.data.success) {
        logger.error(
          {
            ...ctx,
            invitationId:
              result.status === 'fulfilled' ? result.value.id : result.reason,
          },
          'Failed to send invitation email',
        );
      }
    }

    const succeeded = results.filter(
      (result) => result.status === 'fulfilled' && result.value.data.success,
    );

    if (succeeded.length) {
      logger.info(
        {
          ...ctx,
          count: succeeded.length,
        },
        'Invitation emails successfully sent!',
      );
    }
  }
}
