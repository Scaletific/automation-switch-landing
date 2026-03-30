import { test, expect } from '@playwright/test'

test.describe('Newsletter subscribe form', () => {
  test('subscribe form is present on homepage', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('.subscribe-form input[type="email"]').first()
    await expect(emailInput).toBeVisible()
  })

  test('subscribe button is visible', async ({ page }) => {
    await page.goto('/')
    const button = page.locator('.subscribe-form button').first()
    await expect(button).toBeVisible()
  })

  test('email input accepts a valid email', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('.subscribe-form input[type="email"]').first()
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })
})
