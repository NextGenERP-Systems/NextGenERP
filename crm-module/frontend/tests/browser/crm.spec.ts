import { test, expect, type Page } from '@playwright/test';
const unique = () => crypto.randomUUID();
async function save(page: Page) { await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0); }

test('live acquisition, keyboard stage change, conversion intent and guarded deletion', async ({ page, request }) => {
  const name = `Browser ${unique()}`;
  await page.goto('/crm/leads/new');
  await page.getByLabel('First Name').fill(name);
  await page.getByLabel('Company Name').fill('Browser customer');
  await save(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Browser customer');
  await page.getByRole('button', { name: 'Qualify lead' }).click();
  await expect(page).toHaveURL(/\/crm\/prospects\/[0-9a-f-]+$/);
  const prospectId = page.url().split('/').pop()!;
  await page.getByRole('link', { name: 'Open prospect 360' }).click();
  await expect(page.getByRole('heading', { name: 'Sales enrichment' })).toBeVisible();
  const lookups = await (await request.get('/api/v1/crm/lookups')).json();
  const stage = lookups.salesStages[0];
  expect(stage).toBeTruthy();
  await page.goto('/crm/opportunities/new');
  await page.getByLabel('Opportunity Name').fill(name); await page.getByLabel('Prospect Id').fill(prospectId); await page.getByLabel('Amount', { exact: true }).fill('123.45'); await page.getByLabel('Probability').fill('40'); await save(page);
  await expect(page).toHaveURL(/\/crm\/opportunities\/[0-9a-f-]+$/);
  const opportunity = { id: page.url().split('/').pop()! };
  await page.goto('/crm/opportunities/board');
  await page.getByRole('combobox', { name: `Move ${name} to stage` }).selectOption(stage.id);
  await expect(page.getByRole('region', { name: `${stage.name} stage` }).getByRole('link', { name })).toBeVisible();
  const updated = await (await request.get(`/api/v1/crm/opportunities/${opportunity.id}`)).json();
  expect(updated.prospect.id).toBe(prospectId); expect(updated.amount).toBe(123.45);
  await page.getByRole('link', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
  await page.getByRole('combobox', { name: /^Status/ }).selectOption('WON');
  page.once('dialog', dialog => dialog.accept());
  await save(page);
  expect((await (await request.get(`/api/v1/crm/prospects/${prospectId}`)).json()).status).toBe('CONVERTED_TO_CUSTOMER');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
  await expect(page.locator('main').getByRole('alert')).toContainText('conflicts');
});

test('live contacts, preferences, campaign member and offline idempotent queue', async ({ page, request }) => {
  const customerId = unique();
  await page.goto('/crm/contacts'); await page.getByRole('button', { name: 'New contact' }).click();
  await page.getByLabel('First Name').fill('Queue contact'); await page.getByLabel('Email', { exact: true }).fill('review@example.test'); await page.getByLabel('Customer Id', { exact: true }).fill(customerId); await save(page);
  await expect(page).toHaveURL(/\/crm\/contacts\/[0-9a-f-]+$/);
  const contactId = page.url().split('/').pop()!;
  await page.getByRole('button', { name: 'Set EMAIL preference' }).click();
  await page.getByLabel('Consent State').selectOption('OPTED_IN'); await page.getByLabel('Source').fill('Disposable browser fixture'); await save(page);
  const campaign = await (await request.post('/api/v1/crm/campaigns', { data: { name: `Campaign ${unique()}`, channel: 'EMAIL', budget: 100, currency: 'INR' } })).json();
  await request.post(`/api/v1/crm/campaigns/${campaign.id}/status`, { data: { status: 'ACTIVE' } });
  await page.goto(`/crm/campaigns/${campaign.id}`);
  const members = page.locator('section.panel').filter({ has: page.getByRole('heading', { name: 'Members', exact: true }) });
  await members.getByRole('button', { name: 'Add', exact: true }).click(); await page.getByLabel('Contact Id').fill(contactId); await save(page);
  const template = await (await request.post('/api/v1/crm/message-templates', { data: { name: `Template ${unique()}`, channel: 'EMAIL', subject: 'Local review', body: 'Hello {{name}}', active: true } })).json();
  await page.goto('/crm/communications/messages'); await page.getByRole('button', { name: 'New message' }).click();
  await page.getByLabel('Contact Id').fill(contactId); await page.getByLabel('Campaign Id').fill(campaign.id); await page.getByLabel('Template Id').fill(template.id); await page.getByLabel('Variables').fill('{"name":"Review"}'); await save(page);
  await expect(page.getByRole('heading', { name: 'Delivery attempts' })).toBeVisible();
  const messageId = page.url().split('/').pop()!;
  const message = await (await request.get(`/api/v1/crm/messages/${messageId}`)).json();
  expect(message.state ?? message.status).toBe('QUEUED');
  const retried = await request.post('/api/v1/crm/messages', { data: { contactId, campaignId: campaign.id, templateId: template.id, variables: { name: 'Review' }, idempotencyKey: message.idempotency_key } });
  expect(retried.ok()).toBeTruthy(); expect((await retried.json()).id).toBe(messageId);
  await page.getByRole('button', { name: 'Cancel message' }).click();
  await expect(page.getByText('CANCELLED', { exact: true }).first()).toBeVisible();
});

test('live contracts, warranty and maintenance persistence', async ({ page, request }) => {
  const customer = unique();
  await page.goto('/crm/service/contracts'); await page.getByRole('button', { name: 'New contract' }).click();
  await page.getByLabel('Contract Number').fill(`C-${unique()}`); await page.getByLabel(/^Name/).fill('Browser service'); await page.getByLabel('Customer Id').fill(customer); await page.getByLabel('Total Amount').fill('200'); await save(page);
  await expect(page).toHaveURL(/\/crm\/service\/contracts\/[0-9a-f-]+$/);
  const contract = page.url().split('/').pop()!;
  await page.locator('section.panel').filter({ has: page.getByRole('heading', { name: 'Contract item snapshots' }) }).getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByLabel('Description').fill('Pump'); await page.getByLabel('Unit Price').fill('200'); await page.getByLabel('Warranty Starts On').fill('2026-01-01'); await page.getByLabel('Warranty Ends On').fill('2026-12-31'); await save(page);
  const item = (await (await request.get(`/api/v1/crm/contracts/${contract}/items`)).json())[0];
  await page.getByRole('button', { name: 'Change status', exact: true }).click(); await page.getByRole('combobox', { name: /^Status/ }).selectOption('ACTIVE'); await save(page);
  await page.goto('/crm/service/warranty-claims'); await page.getByRole('button', { name: 'New warranty claim' }).click();
  await page.getByLabel('Claim Number').fill(`W-${unique()}`); await page.getByLabel(/^Contract Id/).fill(contract); await page.getByLabel('Contract Item Id').fill(item.id); await page.getByLabel('Issue').fill('Pump repair'); await page.getByLabel('Description').fill('Review repair'); await page.getByLabel('Reported On').fill('2026-06-01'); await save(page);
  await expect(page.getByRole('heading', { name: 'Claim status events' })).toBeVisible();
  await page.goto('/crm/service/maintenance'); await page.getByRole('button', { name: 'New maintenance schedule' }).click();
  await page.getByLabel('Customer Id').fill(customer); await page.getByLabel(/^Name/).fill('Browser maintenance'); await page.getByLabel('Starts On').fill('2026-10-01'); await page.getByLabel('Next Due On').fill('2026-10-01'); await save(page);
  await expect(page).toHaveURL(/\/crm\/service\/maintenance\/[0-9a-f-]+$/);
  const schedule = page.url().split('/').pop()!;
  await page.locator('section.panel').filter({ has: page.getByRole('heading', { name: 'Manually recorded visits' }) }).getByRole('button', { name: 'Add', exact: true }).click(); await page.getByLabel('Due At').fill('2026-10-01T09:00'); await save(page);
  await page.getByRole('button', { name: 'Change status', exact: true }).last().click(); await page.getByRole('combobox', { name: /^Status/ }).selectOption('COMPLETED'); await save(page);
  expect((await (await request.get(`/api/v1/crm/maintenance-schedules/${schedule}`)).json()).next_due_on).toBe('2026-10-31');
});

test('network failures, partial analytics, missing routes and responsive navigation', async ({ page }) => {
  await page.route('**/api/v1/crm/analytics/pipeline*', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"Pipeline unavailable fixture"}' }));
  await page.goto('/crm'); await expect(page.getByRole('heading', { name: 'Overview report' })).toBeVisible(); await expect(page.locator('main').getByRole('alert')).toContainText('Pipeline unavailable fixture');
  await expect(page.getByText('New leads', { exact: true })).toBeVisible();
  await page.goto('/crm/missing-page'); await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.unrouteAll();
  await page.route('**/api/v1/crm/leads', route => route.abort()); await page.goto('/crm/leads'); await expect(page.locator('main').getByRole('alert')).toContainText('CRM is unavailable');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test('live interactions, reports and every workspace route survive direct reload', async ({ page, request }) => {
  const id = (await (await request.post('/api/v1/crm/leads', { data: { firstName: `Interaction ${unique()}` } })).json()).id;
  await page.goto(`/crm/leads/${id}`);
  const notes = page.locator('section.panel').filter({ has: page.getByRole('heading', { name: 'Notes', exact: true }) });
  await notes.getByRole('button', { name: 'Add', exact: true }).click();
  const content = '<img src=x onerror=alert(1)> safe text';
  await page.getByLabel('Content').fill(content); await save(page);
  await expect(notes.getByText(content, { exact: true })).toBeVisible(); expect(await notes.locator('img').count()).toBe(0);
  const activity = page.locator('section.panel').filter({ has: page.getByRole('heading', { name: 'Activities', exact: true }) });
  await activity.getByRole('button', { name: 'Add', exact: true }).click(); await page.getByLabel('Subject').fill('Browser follow up'); await save(page);
  await expect(activity.getByText('Browser follow up', { exact: true })).toBeVisible();
  const appointment = page.locator('section.panel').filter({ has: page.getByRole('heading', { name: 'Appointments', exact: true }) });
  await appointment.getByRole('button', { name: 'Add', exact: true }).click(); await page.getByLabel('Subject').fill('Browser appointment'); await page.getByLabel('Starts At').fill('2026-10-10T09:00'); await page.getByLabel('Ends At').fill('2026-10-10T10:00'); await save(page);
  await expect(appointment.getByText('Browser appointment', { exact: true })).toBeVisible();
  for (const kind of ['overview', 'funnel', 'pipeline', 'campaigns', 'service']) expect((await request.get(`/api/v1/crm/analytics/${kind}`)).status()).toBe(200);
  for (const route of ['leads', 'prospects', 'opportunities', 'contacts', 'campaigns', 'communications/templates', 'communications/messages', 'service/contracts', 'service/fulfilments', 'service/warranty-claims', 'service/maintenance', 'reports']) {
    await page.goto(`/crm/${route}`); await expect(page.locator('main h1')).toBeVisible(); await expect(page.locator('main .error')).toHaveCount(0);
  }
  await page.goto('/crm'); await expect(page.getByText('New leads', { exact: true })).toBeVisible(); await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true });
  await page.goto('/crm/opportunities/board'); await expect(page.locator('.board')).toBeVisible(); await page.screenshot({ path: 'test-results/board.png', fullPage: true });
});

test('Customer 360 keeps CRM content across optional enrichment states', async ({ page }) => {
  const id = unique();
  for (const state of ['AVAILABLE', 'NOT_FOUND', 'UNAVAILABLE', 'NOT_CONFIGURED']) {
    await page.route(`**/api/v1/crm/customers/${id}/360`, route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ customerId: id, contacts: [{ id: unique(), firstName: 'Retained CRM contact', email: 'local@example.test' }], opportunities: [], activities: [], notes: [], appointments: [], competitors: [], prospects: [], opportunityHistory: [], salesStatus: state, salesDashboard: state === 'AVAILABLE' ? { customerName: 'Fixture customer', quotations: [], orders: [] } : null }) }));
    await page.goto(`/crm/customers/${id}/360`); await expect(page.getByText('Retained CRM contact')).toBeVisible(); await expect(page.locator('.badge').filter({ hasText: state.replaceAll('_', ' ') })).toBeVisible();
    if (state === 'AVAILABLE') await expect(page.getByText('Fixture customer')).toBeVisible();
    await page.unrouteAll();
  }
});

test('stale board moves roll back and preserve typed form input on conflicts', async ({ page, request }) => {
  const id = (await (await request.post('/api/v1/crm/opportunities', { data: { opportunityName: `Conflict ${unique()}`, customerId: unique(), amount: 30 } })).json()).id;
  const lookups = await (await request.get('/api/v1/crm/lookups')).json();
  await page.goto('/crm/opportunities/board');
  const card = page.locator('.deal-card').filter({ has: page.locator(`a[href="/crm/opportunities/${id}"]`) });
  await page.route(`**/api/v1/crm/opportunities/${id}`, async route => {
    if (route.request().method() === 'PUT') return route.fulfill({ status: 409, contentType: 'application/json', body: '{"message":"Opportunity changed. Reload and review."}' });
    await route.continue();
  });
  await card.getByRole('combobox').selectOption(lookups.salesStages[0].id);
  await expect(page.locator('main').getByRole('alert')).toContainText('Reload and review');
  await expect(card.getByRole('combobox')).toHaveValue('');
  await page.goto(`/crm/opportunities/${id}`); await page.getByRole('button', { name: 'Edit', exact: true }).first().click(); await page.getByLabel('Opportunity Name').fill('Retain these edits'); await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Reload and review'); await expect(page.getByLabel('Opportunity Name')).toHaveValue('Retain these edits');
});
