import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('demo@urutiq.com')
    await page.getByLabel('Password').fill('demo123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display dashboard correctly', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Financial Overview & Analytics')).toBeVisible()
    await expect(page.getByText('Welcome back, John Doe!')).toBeVisible()
  })

  test('should display quick action buttons', async ({ page }) => {
    await expect(page.getByText('AI Insights')).toBeVisible()
    await expect(page.getByText('Chart of Accounts')).toBeVisible()
    await expect(page.getByText('Journal Entries')).toBeVisible()
    await expect(page.getByText('Bank Reconciliation')).toBeVisible()
  })

  test('should navigate to AI Insights', async ({ page }) => {
    await page.getByText('AI Insights').click()
    await expect(page).toHaveURL('/ai-insights')
    await expect(page.getByText('AI Insights & Predictions')).toBeVisible()
  })

  test('should navigate to Chart of Accounts', async ({ page }) => {
    await page.getByText('Chart of Accounts').click()
    await expect(page).toHaveURL('/accounting')
    await expect(page.getByText('Financial Management')).toBeVisible()
  })

  test('should navigate to Journal Entries', async ({ page }) => {
    await page.getByText('Journal Entries').click()
    await expect(page).toHaveURL('/accounting?tab=journal-entries')
  })

  test('should display export and analytics buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Export Report' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'View Analytics' })).toBeVisible()
  })

  test('should show financial overview component', async ({ page }) => {
    // The financial overview component should be visible
    await expect(page.locator('[data-testid="financial-overview"]')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Dashboard should still be visible on mobile
    await expect(page.getByText('Dashboard')).toBeVisible()
    
    // Quick actions should be accessible
    await expect(page.getByText('AI Insights')).toBeVisible()
  })
})
