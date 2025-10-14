import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*auth\/login/)
    await expect(page.getByText('Sign in to your account')).toBeVisible()
  })

  test('should display login form correctly', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should show validation errors
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should show error message
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByLabel('Email').fill('demo@urutiq.com')
    await page.getByLabel('Password').fill('demo123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should display user information after login', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByLabel('Email').fill('demo@urutiq.com')
    await page.getByLabel('Password').fill('demo123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should show user info in sidebar
    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('Senior Accountant')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('demo@urutiq.com')
    await page.getByLabel('Password').fill('demo123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page).toHaveURL('/dashboard')
    
    // Logout
    await page.getByRole('button', { name: 'User settings' }).click()
    await page.getByText('Sign Out').click()
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*auth\/login/)
  })
})
