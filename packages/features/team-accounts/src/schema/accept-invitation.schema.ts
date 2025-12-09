import { z } from 'zod';

import { CsrfTokenSchema } from '@kit/csrf/schema';
import { isSafeRedirectPath } from '@kit/shared/utils';

export const AcceptInvitationSchema = CsrfTokenSchema.extend({
  inviteToken: z.string().uuid(),
  nextPath: z.string().min(1).refine(isSafeRedirectPath, {
    message: 'Invalid redirect path',
  }),
});
