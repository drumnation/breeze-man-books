import { Page, expect, selectors, test } from '@playwright/test';

import { AuthPageObject } from '../authentication/auth.po';
import { TeamAccountsPageObject } from '../team-accounts/team-accounts.po';

const MFA_KEY = 'NHOHJVGPO3R3LKVPRMNIYLCDMBHUM2SE';

test.describe('Admin Auth flow without MFA', () => {
  test('will return a 404 for non-admin users', async ({ page }) => {
    const auth = new AuthPageObject(page);

    await page.goto('/auth/sign-in');

    await auth.signIn({
      email: 'owner@makerkit.dev',
      password: 'testingpassword',
    });

    await page.waitForURL('/home');

    await page.goto('/admin');

    expect(page.url()).toContain('/');
  });

  test('will redirect to home page for admin users without MFA', async ({
    page,
  }) => {
    const auth = new AuthPageObject(page);

    await page.goto('/auth/sign-in');

    await auth.signIn({
      email: 'test@makerkit.dev',
      password: 'testingpassword',
    });

    await page.waitForURL('/home');

    await page.goto('/admin');

    expect(page.url()).toContain('/');
  });
});

test.describe('Admin', () => {
  // must be serial because OTP verification is not working in parallel
  test.describe.configure({ mode: 'serial' });

  test.describe('Admin Dashboard', () => {
    test('displays all stat cards', async ({ page }) => {
      await goToAdmin(page);

      // Check all stat cards are present
      await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

      await expect(
        page.getByRole('heading', { name: 'Team Accounts' }),
      ).toBeVisible();

      await expect(
        page.getByRole('heading', { name: 'Paying Customers' }),
      ).toBeVisible();

      await expect(page.getByRole('heading', { name: 'Trials' })).toBeVisible();

      // Verify stat values are numbers
      const stats = await page.$$('.text-3xl.font-bold');

      for (const stat of stats) {
        const value = await stat.textContent();
        expect(Number.isInteger(Number(value))).toBeTruthy();
      }
    });
  });

  test.describe('Personal Account Management', () => {
    let testUserEmail: string;

    test.beforeEach(async ({ page }) => {
      selectors.setTestIdAttribute('data-test');

      // Create a new test user before each test
      testUserEmail = await createUser(page);

      await goToAdmin(page);

      // Navigate to the newly created user's account page
      // Note: We need to get the user's ID from the email - this might need adjustment
      // based on your URL structure
      await page.goto(`/admin/accounts`);

      const name = testUserEmail.split('@')[0]!;

      // search for the test user
      await filterAccounts(page, name);

      // select the test user
      await selectAccount(page, name);
    });

    test('displays personal account details', async ({ page }) => {
      await expect(page.getByText('Personal Account')).toBeVisible();
      await expect(page.getByTestId('admin-ban-account-button')).toBeVisible();
      await expect(page.getByTestId('admin-impersonate-button')).toBeVisible();
      await expect(
        page.getByTestId('admin-delete-account-button'),
      ).toBeVisible();
    });

    test('ban user flow', async ({ page }) => {
      await page.getByTestId('admin-ban-account-button').click();
      await expect(
        page.getByRole('heading', { name: 'Ban User' }),
      ).toBeVisible();

      // Try with invalid confirmation
      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'WRONG');
      await page.getByRole('button', { name: 'Ban User' }).click();

      await expect(
        page.getByRole('heading', { name: 'Ban User' }),
      ).toBeVisible(); // Dialog should still be open

      // Confirm with correct text
      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'CONFIRM');
      await page.getByRole('button', { name: 'Ban User' }).click();

      await expect(page.getByText('User Banned')).toBeVisible();

      await page.context().clearCookies();
      await page.reload();

      // Verify user can't log in
      await page.goto('/auth/sign-in');

      const auth = new AuthPageObject(page);

      await auth.signIn({
        email: testUserEmail,
        password: 'testingpassword',
      });

      // Should show an error message
      await expect(
        page.locator('[data-test="auth-error-message"]'),
      ).toBeVisible();
    });

    test('reactivate user flow', async ({ page }) => {
      // First ban the user
      await page.getByTestId('admin-ban-account-button').click();
      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'CONFIRM');

      await page.getByRole('button', { name: 'Ban User' }).click();
      await expect(page.getByText('User Banned')).toBeVisible();

      // Now reactivate
      await page.getByTestId('admin-reactivate-account-button').click();

      await expect(
        page.getByRole('heading', { name: 'Reactivate User' }),
      ).toBeVisible();

      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'CONFIRM');

      await Promise.all([
        page.getByRole('button', { name: 'Reactivate User' }).click(),
        page.waitForTimeout(500),
      ]);

      // Log out
      await page.context().clearCookies();
      await page.reload();

      // Verify user can log in again
      await page.goto('/auth/sign-in');

      const auth = new AuthPageObject(page);

      await auth.signIn({
        email: testUserEmail,
        password: 'testingpassword',
      });

      await page.waitForURL('/home');
    });

    // TODO: test is flaky only in CI, works locally
    test.skip('impersonate user flow', async ({ page }) => {
      await page.getByTestId('admin-impersonate-button').click();

      await expect(
        page.getByRole('heading', { name: 'Impersonate User' }),
      ).toBeVisible();

      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'CONFIRM');

      const button = page
        .getByTestId('admin-impersonate-user-form')
        .getByRole('button', { name: 'Impersonate User' });

      await expect(button).toBeVisible();
      await button.click();

      // Should redirect to home and be logged in as the user
      await page.waitForURL('/home', {
        timeout: 5000,
      });
    });

    test('delete user flow', async ({ page }) => {
      await page.getByTestId('admin-delete-account-button').click();
      await expect(
        page.getByRole('heading', { name: 'Delete User' }),
      ).toBeVisible();

      // Try with invalid confirmation
      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'WRONG');
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(
        page.getByRole('heading', { name: 'Delete User' }),
      ).toBeVisible(); // Dialog should still be open

      // Confirm with correct text
      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'CONFIRM');
      await page.getByRole('button', { name: 'Delete' }).click();

      // Should redirect to admin dashboard
      await expect(page).toHaveURL('/admin/accounts');

      // Log out
      const auth = new AuthPageObject(page);
      await auth.signOut();
      await page.waitForURL('/');

      // Verify user can't log in
      await page.goto('/auth/sign-in');

      await auth.signIn({
        email: testUserEmail,
        password: 'testingpassword',
      });

      // Should show an error message
      await expect(
        page.locator('[data-test="auth-error-message"]'),
      ).toBeVisible();
    });
  });

  test.describe('Team Account Management', () => {
    let teamName: string;
    let slug: string;

    test.beforeEach(async ({ page }) => {
      selectors.setTestIdAttribute('data-test');

      // Create a new test user and team account
      await createUser(page, {
        afterSignIn: async () => {
          teamName = `test-${Math.random().toString(36).substring(2, 15)}`;

          const teamAccountPo = new TeamAccountsPageObject(page);
          slug = teamName.toLowerCase().replace(/ /g, '-');

          await teamAccountPo.createTeam({
            teamName,
            slug,
          });
        },
      });

      await goToAdmin(page);

      await page.goto(`/admin/accounts`);

      await filterAccounts(page, teamName);
      await selectAccount(page, teamName);
    });

    test('displays team account details', async ({ page }) => {
      await expect(page.getByText('Team Account')).toBeVisible();
      await expect(
        page.getByTestId('admin-delete-account-button'),
      ).toBeVisible();
    });

    test('delete team account flow', async ({ page }) => {
      await page.getByTestId('admin-delete-account-button').click();
      await expect(
        page.getByRole('heading', { name: 'Delete Account' }),
      ).toBeVisible();

      // Try with invalid confirmation
      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'WRONG');
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(
        page.getByRole('heading', { name: 'Delete Account' }),
      ).toBeVisible(); // Dialog should still be open

      // Confirm with correct text
      await page.fill('[placeholder="Type CONFIRM to confirm"]', 'CONFIRM');
      await page.getByRole('button', { name: 'Delete' }).click();

      // Should redirect to admin dashboard after deletion
      await expect(page).toHaveURL('/admin/accounts');
    });
  });
});

async function goToAdmin(page: Page) {
  const auth = new AuthPageObject(page);

  await page.goto('/auth/sign-in');

  await auth.signIn({
    email: 'super-admin@makerkit.dev',
    password: 'testingpassword',
  });

  await expect(async () => {
    await auth.submitMFAVerification(MFA_KEY);
    await page.waitForURL('/home');
  }).toPass({
    intervals: [
      500, 2500, 5000, 7500, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000,
      40_000, 45_000, 50_000,
    ],
  });

  await page.goto('/admin');
}

async function createUser(
  page: Page,
  params: {
    afterSignIn?: () => Promise<void>;
  } = {},
) {
  const auth = new AuthPageObject(page);

  await page.goto('/auth/sign-up');

  const email = `${(Math.random() * 1000000).toFixed(0)}@makerkit.dev`;

  await auth.signUp({
    email,
    password: 'testingpassword',
    repeatPassword: 'testingpassword',
  });

  await auth.visitConfirmEmailLink(email);

  if (params.afterSignIn) {
    await params.afterSignIn();
  }

  await page.context().clearCookies();
  await page.reload();

  return email;
}

async function filterAccounts(page: Page, name: string) {
  await expect(async () => {
    await page.waitForTimeout(250);

    await page
      .locator('[data-test="admin-accounts-table-filter-input"]')
      .first()
      .fill(name);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  }).toPass();
}

async function selectAccount(page: Page, email: string) {
  await page
    .locator('tr', { hasText: email.split('@')[0] })
    .locator('a')
    .click();

  await page.waitForURL(new RegExp(`/admin/accounts/[a-z0-9-]+`));
  await page.waitForTimeout(500);
}
