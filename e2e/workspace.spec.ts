import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
const password = process.env.E2E_PASSWORD ?? 'local-e2e-password-2026';
const origin = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3210';
async function login(page: Page, email = 'ayse@atlas.demo') {
  await page.goto('/login');
  await page.getByLabel('Demo account').selectOption(email);
  await page.getByLabel('Local demo password').fill(password);
  await page.getByRole('button', { name: 'Open workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Clarity for every purchase.' })).toBeVisible();
}
test('real requester and separate approver complete a persisted workflow', async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await login(page);
  await page.getByRole('link', { name: 'New request', exact: true }).first().click();
  const title = 'E2E design licenses ' + Date.now();
  await page.getByLabel('Request title').fill(title);
  await page.getByLabel('Supplier').fill('Figma');
  await page.getByLabel('Amount (TRY)').fill('1250.29');
  await page
    .getByLabel('Business justification')
    .fill('Additional design seats for our growing product team.');
  await page.getByRole('button', { name: 'Create draft' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  const url = page.url();
  await page.reload();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await page.getByRole('button', { name: 'Submit for approval' }).click();
  await expect(page.getByText('Pending review', { exact: true })).toBeVisible();
  const reviewer = await browser.newContext();
  const other = await reviewer.newPage();
  await login(other, 'mert@atlas.demo');
  await other.goto(url);
  await other.getByRole('button', { name: 'Approve request', exact: true }).click();
  await expect(other.getByText('Approved', { exact: true })).toBeVisible();
  await expect(other.getByText('Approved the request', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Approved', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  await reviewer.close();
});
test('search and status filter report an empty state correctly', async ({ page }) => {
  await login(page);
  await page.getByLabel('Search requests').fill('does-not-exist-unique-title');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No requests found' })).toBeVisible();
  await page.getByLabel('Search requests').fill('');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByLabel('Filter by status').selectOption('approved');
  await expect(page.locator('tbody tr')).toHaveCount(3);
});
test('viewer cannot create through the API or the interface', async ({ page }) => {
  await login(page, 'deniz@atlas.demo');
  await expect(page.getByRole('link', { name: 'New request', exact: true })).toHaveCount(0);
  const response = await page.request.post('/api/requests', {
    headers: { Origin: origin },
    data: {
      title: 'Forbidden',
      supplier: 'Test',
      category: 'Software',
      amountMinor: 100,
      description: 'A blocked write attempt',
    },
  });
  expect(response.status()).toBe(403);
  await page.goto('/requests/new');
  await expect(page.getByRole('heading', { name: 'Read only access' })).toBeVisible();
});
test('separate tenant cannot read or mutate a known Atlas record', async ({ page, browser }) => {
  const context = await browser.newContext();
  const atlas = await context.newPage();
  await login(atlas);
  const atlasList = await (await atlas.request.get('/api/requests')).json();
  const id = atlasList.items[0].id;
  await login(page, 'elif@nova.demo');
  const response = await page.request.get('/api/requests');
  const data = await response.json();
  expect(data.total).toBe(1);
  expect(data.items[0].title).toBe('Nova private equipment');
  expect((await page.request.get('/api/requests/' + id)).status()).toBe(404);
  expect(
    (
      await page.request.patch('/api/requests/' + id, {
        headers: { Origin: origin },
        data: { action: 'approve', version: 1 },
      })
    ).status(),
  ).toBe(404);
  await page.goto('/requests/' + id);
  await expect(page.getByRole('heading', { name: 'Request not found' })).toBeVisible();
  await context.close();
});
test('API validates origin, authentication and body limits', async ({ page }) => {
  expect((await page.request.get('/api/requests')).status()).toBe(401);
  await login(page);
  expect(
    (
      await page.request.post('/api/requests', {
        headers: { Origin: 'https://example.test' },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post('/api/requests', {
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        data: '{oops',
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.post('/api/requests', {
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        data: JSON.stringify({ large: 'x'.repeat(17000) }),
      })
    ).status(),
  ).toBe(413);
});
test('desktop overview passes accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  await expect(page.getByRole('heading', { name: 'Where the investment goes' })).toBeVisible();
  await mkdir('docs/images', { recursive: true });
  await page.screenshot({ path: 'docs/images/dashboard.png', fullPage: true });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
test('mobile stays within viewport and supports the request form', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.screenshot({ path: 'docs/images/mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'docs/images/mobile.png', fullPage: true });
  await page.getByRole('link', { name: 'New request', exact: true }).first().click();
  await expect(page.getByLabel('Business justification')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
test('logout revokes the persisted session', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome to your workspace.' })).toBeVisible();
  expect((await page.request.get('/api/requests')).status()).toBe(401);
});
