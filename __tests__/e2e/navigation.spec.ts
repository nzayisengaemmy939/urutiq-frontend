import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('demo@urutiq.com')
    await page.getByLabel('Password').fill('demo123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display sidebar navigation', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Sales & Invoicing')).toBeVisible()
    await expect(page.getByText('Purchases & Expenses')).toBeVisible()
    await expect(page.getByText('Banking & Cash')).toBeVisible()
    await expect(page.getByText('Inventory & Products')).toBeVisible()
    await expect(page.getByText('Tax Management')).toBeVisible()
    await expect(page.getByText('Accounting')).toBeVisible()
    await expect(page.getByText('Reports & Analytics')).toBeVisible()
    await expect(page.getByText('AI Insights')).toBeVisible()
  })

  test('should navigate to Sales & Invoicing', async ({ page }) => {
    await page.getByText('Sales & Invoicing').click()
    await page.getByText('Invoices').click()
    await expect(page).toHaveURL('/sales')
    await expect(page.getByText('Sales & Invoicing')).toBeVisible()
  })

  test('should navigate to Banking & Cash', async ({ page }) => {
    await page.getByText('Banking & Cash').click()
    await page.getByText('Bank Accounts & Reconciliation').click()
    await expect(page).toHaveURL('/banking')
    await expect(page.getByText('Banking & Cash Management')).toBeVisible()
  })

  test('should navigate to Inventory & Products', async ({ page }) => {
    await page.getByText('Inventory & Products').click()
    await page.getByText('Inventory Management').click()
    await expect(page).toHaveURL('/inventory')
    await expect(page.getByText('Inventory Management')).toBeVisible()
  })

  test('should navigate to Tax Management', async ({ page }) => {
    await page.getByText('Tax Management').click()
    await page.getByText('Tax Dashboard').click()
    await expect(page).toHaveURL('/tax')
    await expect(page.getByText('Tax Management')).toBeVisible()
  })

  test('should navigate to AI Insights', async ({ page }) => {
    await page.getByText('AI Insights').click()
    await page.getByText('AI Dashboard').click()
    await expect(page).toHaveURL('/ai-insights')
    await expect(page.getByText('AI Insights & Predictions')).toBeVisible()
  })

  test('should navigate to Auto-Bookkeeper', async ({ page }) => {
    await page.getByText('AI-Powered Features').click()
    await page.getByText('Auto-Bookkeeper Dashboard').click()
    await expect(page).toHaveURL('/auto-bookkeeper')
    await expect(page.getByText('Auto-Bookkeeper Dashboard')).toBeVisible()
  })

  test('should navigate to Voice-Enabled Accounting', async ({ page }) => {
    await page.getByText('AI-Powered Features').click()
    await page.getByText('Voice-Enabled Accounting').click()
    await expect(page).toHaveURL('/voice-enabled-accounting')
    await expect(page.getByText('Voice-Enabled Accounting')).toBeVisible()
  })

  test('should navigate to Gamification Dashboard', async ({ page }) => {
    await page.getByText('AI-Powered Features').click()
    await page.getByText('Gamification Dashboard').click()
    await expect(page).toHaveURL('/gamification')
    await expect(page.getByText('Gamification Dashboard')).toBeVisible()
  })

  test('should search navigation menu', async ({ page }) => {
    const searchInput = page.getByPlaceholderText('Search menu... (Ctrl+/)')
    await searchInput.fill('banking')
    
    // Should show banking-related items
    await expect(page.getByText('Banking & Cash')).toBeVisible()
  })

  test('should collapse and expand sidebar', async ({ page }) => {
    // Find the collapse button
    const collapseButton = page.getByRole('button', { name: 'Collapse sidebar' })
    await collapseButton.click()
    
    // Sidebar should be collapsed
    await expect(page.locator('[data-sidebar]')).toHaveClass(/w-16/)
    
    // Expand again
    const expandButton = page.getByRole('button', { name: 'Expand sidebar' })
    await expandButton.click()
    
    // Sidebar should be expanded
    await expect(page.locator('[data-sidebar]')).toHaveClass(/w-64/)
  })

  test('should show quick access items', async ({ page }) => {
    await expect(page.getByText('Quick Access')).toBeVisible()
    await expect(page.getByText('Invoices')).toBeVisible()
    await expect(page.getByText('Expenses')).toBeVisible()
  })

})
