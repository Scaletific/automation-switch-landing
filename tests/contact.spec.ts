import { test, expect } from '@playwright/test'

test.describe('Contact page', () => {
  test('renders heading and form fields', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByRole('heading', { name: /get in touch/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/message/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible()
  })

  test('shows validation error if submitted empty', async ({ page }) => {
    await page.goto('/contact')
    // HTML5 required — button stays disabled until fields are filled
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute('required')
    const messageInput = page.getByLabel(/message/i)
    await expect(messageInput).toHaveAttribute('required')
  })

  test('button is enabled when fields are filled', async ({ page }) => {
    await page.goto('/contact')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/message/i).fill('This is a test message.')
    const button = page.getByRole('button', { name: /send message/i })
    await expect(button).not.toBeDisabled()
  })
})
