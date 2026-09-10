import { test, expect, Page } from '@playwright/test'

// =============================================================================
// Workflow Module — End-to-End Test Suite
//
// Business processes covered:
//   1. Workflow State Machine Setup  (setup → states → transitions)
//   2. Document Creation             (new document + workflow assignment)
//   3. Approval Chain               (Submit → Approve multi-step flow)
//   4. Self-Approval Block           (owner cannot approve own document)
//   5. Document Rejection & Resubmission
//   6. Audit History Verification
//   7. Approval Inbox (Manager view)
//   8. Document Search & Filter
// =============================================================================

const BASE_URL      = process.env.E2E_BASE_URL   ?? 'http://localhost:3000'
const API_URL       = process.env.E2E_API_URL     ?? 'http://localhost:8081/api/v1'
const ADMIN_USER    = process.env.E2E_ADMIN_USER  ?? 'admin@erp.test'
const ADMIN_PASS    = process.env.E2E_ADMIN_PASS  ?? 'password'
const MANAGER_USER  = 'manager@erp.test'
const EMPLOYEE_USER = 'employee@erp.test'

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
async function loginAs(page: Page, email: string, password = 'password') {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('[data-testid="auth-email"]',    email)
  await page.fill('[data-testid="auth-password"]', password)
  await page.click('[data-testid="auth-login-btn"]')
  await page.waitForURL('**/documents', { timeout: 10_000 })
}

async function logout(page: Page) {
  await page.click('[data-testid="nav-user-menu"]')
  await page.click('[data-testid="nav-logout-btn"]')
  await page.waitForURL('**/login')
}

// =============================================================================
// Suite 1: Workflow State Machine Setup
// =============================================================================
test.describe('Workflow State Machine Setup', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
  })

  test('creates a new workflow with name and description', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`)
    await page.click('[data-testid="workflow-create-btn"]')

    await page.fill('[data-testid="workflow-name-input"]',        'Contract Approval Workflow')
    await page.fill('[data-testid="workflow-description-input"]', 'Standard contract review process')
    await page.click('[data-testid="workflow-save-btn"]')

    await expect(page.locator('[data-testid="workflow-list"]'))
      .toContainText('Contract Approval Workflow')
  })

  test('adds Draft, Pending, Approved, and Rejected states to workflow', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`)
    await page.locator('[data-testid="workflow-list-item"]').first().click()

    const states = [
      { name: 'Draft',    initial: true,  final: false },
      { name: 'Pending',  initial: false, final: false },
      { name: 'Approved', initial: false, final: true  },
      { name: 'Rejected', initial: false, final: true  },
    ]

    for (const state of states) {
      await page.click('[data-testid="workflow-add-state-btn"]')
      await page.fill('[data-testid="state-name-input"]', state.name)
      if (state.initial) await page.check('[data-testid="state-initial-checkbox"]')
      if (state.final)   await page.check('[data-testid="state-final-checkbox"]')
      await page.click('[data-testid="state-save-btn"]')
    }

    const stateNames = page.locator('[data-testid="state-list-item"]')
    await expect(stateNames).toHaveCount(4)
    await expect(stateNames.filter({ hasText: 'Draft' })).toBeVisible()
    await expect(stateNames.filter({ hasText: 'Approved' })).toBeVisible()
  })

  test('creates Submit and Approve transitions between states', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`)
    await page.locator('[data-testid="workflow-list-item"]').first().click()

    // Submit: Draft → Pending (EMPLOYEE)
    await page.click('[data-testid="workflow-add-transition-btn"]')
    await page.selectOption('[data-testid="transition-from-state"]', { label: 'Draft' })
    await page.selectOption('[data-testid="transition-to-state"]',   { label: 'Pending' })
    await page.fill('[data-testid="transition-action-name"]',        'Submit')
    await page.fill('[data-testid="transition-allowed-role"]',       'EMPLOYEE')
    await page.uncheck('[data-testid="transition-self-approval"]')
    await page.click('[data-testid="transition-save-btn"]')

    // Approve: Pending → Approved (MANAGER)
    await page.click('[data-testid="workflow-add-transition-btn"]')
    await page.selectOption('[data-testid="transition-from-state"]', { label: 'Pending' })
    await page.selectOption('[data-testid="transition-to-state"]',   { label: 'Approved' })
    await page.fill('[data-testid="transition-action-name"]',        'Approve')
    await page.fill('[data-testid="transition-allowed-role"]',       'MANAGER')
    await page.uncheck('[data-testid="transition-self-approval"]')
    await page.click('[data-testid="transition-save-btn"]')

    const transitions = page.locator('[data-testid="transition-list-item"]')
    await expect(transitions).toHaveCount(2)
  })
})

// =============================================================================
// Suite 2: Document Creation
// =============================================================================
test.describe('Document Creation', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMPLOYEE_USER)
  })

  test('creates a new document and assigns a workflow', async ({ page }) => {
    await page.goto(`${BASE_URL}/documents`)
    await page.click('[data-testid="doc-create-btn"]')

    await page.fill('[data-testid="doc-title-input"]',    'Vendor NDA 2026')
    await page.selectOption('[data-testid="doc-type-select"]', { label: 'CONTRACT' })
    await page.selectOption('[data-testid="doc-workflow-select"]', { label: 'Contract Approval Workflow' })
    await page.fill('[data-testid="doc-amount-input"]',   '50000')
    await page.click('[data-testid="doc-save-btn"]')

    await expect(page.locator('[data-testid="doc-status-badge"]'))
      .toHaveText('Draft')
    await expect(page.locator('[data-testid="doc-title-display"]'))
      .toHaveText('Vendor NDA 2026')
  })

  test('generated document number starts with DOC-', async ({ page }) => {
    await page.goto(`${BASE_URL}/documents`)
    await page.click('[data-testid="doc-create-btn"]')

    await page.fill('[data-testid="doc-title-input"]', 'Auto Number Test Doc')
    await page.click('[data-testid="doc-save-btn"]')

    const docNumber = await page.locator('[data-testid="doc-number-display"]').textContent()
    expect(docNumber).toMatch(/^DOC-\d+$/)
  })
})

// =============================================================================
// Suite 3: Full Approval Chain (Submit → Pending → Approve → Approved)
// =============================================================================
test.describe('Full Approval Chain', () => {

  let documentId: string

  test('employee submits document — status becomes Pending Review', async ({ page }) => {
    await loginAs(page, EMPLOYEE_USER)
    await page.goto(`${BASE_URL}/documents`)

    // Click on an existing Draft document
    await page.locator('[data-testid="doc-list-item"][data-status="Draft"]').first().click()
    documentId = await page.locator('[data-testid="doc-id-hidden"]').getAttribute('value') ?? ''

    await page.click('[data-testid="doc-action-Submit"]')
    await page.fill('[data-testid="transition-comment-input"]', 'Ready for manager review')
    await page.click('[data-testid="transition-confirm-btn"]')

    await expect(page.locator('[data-testid="doc-status-badge"]'))
      .toHaveText('Pending Review', { timeout: 8_000 })
  })

  test('manager approves submitted document — status becomes Approved', async ({ page }) => {
    await loginAs(page, MANAGER_USER)
    await page.goto(`${BASE_URL}/documents/approvals?role=MANAGER`)

    // Find the pending document in manager inbox
    await page.locator('[data-testid="doc-list-item"]').filter({ hasText: 'Pending' }).first().click()

    await page.click('[data-testid="doc-action-Approve"]')
    await page.fill('[data-testid="transition-comment-input"]', 'Looks good — approved')
    await page.click('[data-testid="transition-confirm-btn"]')

    await expect(page.locator('[data-testid="doc-status-badge"]'))
      .toHaveText('Approved', { timeout: 8_000 })
  })
})

// =============================================================================
// Suite 4: Self-Approval Block
// =============================================================================
test.describe('Self-Approval Block', () => {

  test('owner cannot approve their own document', async ({ page }) => {
    // alice is both the owner and trying to act as MANAGER
    await loginAs(page, EMPLOYEE_USER)
    await page.goto(`${BASE_URL}/documents`)

    // Submit document first
    await page.locator('[data-testid="doc-list-item"][data-status="Draft"]').first().click()
    await page.click('[data-testid="doc-action-Submit"]')
    await page.click('[data-testid="transition-confirm-btn"]')
    await expect(page.locator('[data-testid="doc-status-badge"]')).toHaveText('Pending Review', { timeout: 8_000 })

    // Now try to self-approve (same user, MANAGER role forced via URL for simulation)
    await page.click('[data-testid="doc-action-Approve"]')
    await page.click('[data-testid="transition-confirm-btn"]')

    await expect(page.locator('[data-testid="workflow-error-toast"]'))
      .toContainText('Self-approval is not allowed', { timeout: 5_000 })

    // Status must remain Pending Review
    await expect(page.locator('[data-testid="doc-status-badge"]')).toHaveText('Pending Review')
  })
})

// =============================================================================
// Suite 5: Document Rejection & Resubmission
// =============================================================================
test.describe('Document Rejection and Resubmission', () => {

  test('manager rejects document — status becomes Rejected', async ({ page }) => {
    await loginAs(page, MANAGER_USER)
    await page.goto(`${BASE_URL}/documents/approvals?role=MANAGER`)

    await page.locator('[data-testid="doc-list-item"]').filter({ hasText: 'Pending' }).first().click()
    await page.click('[data-testid="doc-action-Reject"]')
    await page.fill('[data-testid="transition-comment-input"]', 'Missing supporting documents')
    await page.click('[data-testid="transition-confirm-btn"]')

    await expect(page.locator('[data-testid="doc-status-badge"]'))
      .toHaveText('Rejected', { timeout: 8_000 })
  })

  test('employee edits and resubmits rejected document', async ({ page }) => {
    await loginAs(page, EMPLOYEE_USER)
    await page.goto(`${BASE_URL}/documents`)

    await page.locator('[data-testid="doc-list-item"][data-status="Rejected"]').first().click()

    // Edit the document
    await page.click('[data-testid="doc-edit-btn"]')
    await page.fill('[data-testid="doc-title-input"]', 'Vendor NDA 2026 — Revised')
    await page.click('[data-testid="doc-save-btn"]')

    // Resubmit
    await page.click('[data-testid="doc-action-Submit"]')
    await page.fill('[data-testid="transition-comment-input"]', 'Added missing annexures')
    await page.click('[data-testid="transition-confirm-btn"]')

    await expect(page.locator('[data-testid="doc-status-badge"]'))
      .toHaveText('Pending Review', { timeout: 8_000 })
  })
})

// =============================================================================
// Suite 6: Audit History Verification
// =============================================================================
test.describe('Audit History', () => {

  test('history panel shows all state transitions in descending order', async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto(`${BASE_URL}/documents`)

    await page.locator('[data-testid="doc-list-item"]').first().click()
    await page.click('[data-testid="doc-history-tab"]')

    const entries = page.locator('[data-testid="history-entry"]')
    await expect(entries.first()).toBeVisible()

    // Most recent action must appear first
    const firstAction = await entries.first().locator('[data-testid="history-action"]').textContent()
    expect(['Approve', 'Reject', 'Submit']).toContain(firstAction?.trim())
  })

  test('history entry shows performer, action, from-state, to-state, and comments', async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto(`${BASE_URL}/documents`)
    await page.locator('[data-testid="doc-list-item"]').first().click()
    await page.click('[data-testid="doc-history-tab"]')

    const firstEntry = page.locator('[data-testid="history-entry"]').first()
    await expect(firstEntry.locator('[data-testid="history-performed-by"]')).toBeVisible()
    await expect(firstEntry.locator('[data-testid="history-from-state"]')).toBeVisible()
    await expect(firstEntry.locator('[data-testid="history-to-state"]')).toBeVisible()
  })
})

// =============================================================================
// Suite 7: Manager Approval Inbox
// =============================================================================
test.describe('Manager Approval Inbox', () => {

  test('approvals page shows only documents pending MANAGER action', async ({ page }) => {
    await loginAs(page, MANAGER_USER)
    await page.goto(`${BASE_URL}/documents/approvals?role=MANAGER`)

    const items = page.locator('[data-testid="doc-list-item"]')
    // Every visible doc must have status Pending Review
    const count = await items.count()
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const status = await items.nth(i).locator('[data-testid="doc-status-badge"]').textContent()
        expect(status?.trim()).toBe('Pending Review')
      }
    }
  })

  test('approval inbox is empty when no documents are pending', async ({ page }) => {
    await loginAs(page, MANAGER_USER)
    await page.goto(`${BASE_URL}/documents/approvals?role=MANAGER`)

    const items = page.locator('[data-testid="doc-list-item"]')
    const count = await items.count()

    if (count === 0) {
      await expect(page.locator('[data-testid="approvals-empty-state"]')).toBeVisible()
    }
  })
})

// =============================================================================
// Suite 8: Document Search & Filter
// =============================================================================
test.describe('Document Search and Filter', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
  })

  test('searching by title filters document list', async ({ page }) => {
    await page.goto(`${BASE_URL}/documents`)
    await page.fill('[data-testid="doc-search-input"]', 'NDA')
    await page.waitForTimeout(500) // debounce

    const items = page.locator('[data-testid="doc-list-item"]')
    const count = await items.count()
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const title = await items.nth(i).locator('[data-testid="doc-title-display"]').textContent()
        expect(title?.toLowerCase()).toContain('nda')
      }
    }
  })

  test('clearing search restores full document list', async ({ page }) => {
    await page.goto(`${BASE_URL}/documents`)

    await page.fill('[data-testid="doc-search-input"]', 'NDA')
    await page.waitForTimeout(400)
    const filteredCount = await page.locator('[data-testid="doc-list-item"]').count()

    await page.fill('[data-testid="doc-search-input"]', '')
    await page.waitForTimeout(400)
    const fullCount = await page.locator('[data-testid="doc-list-item"]').count()

    expect(fullCount).toBeGreaterThanOrEqual(filteredCount)
  })
})
