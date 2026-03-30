import { test, expect } from '@playwright/test'

const routes = [
  { path: '/', title: /automation switch/i },
  { path: '/about', title: /about/i },
  { path: '/contact', title: /contact/i },
  { path: '/articles', title: /articles/i },
  { path: '/tools', title: /tools/i },
  { path: '/skills', title: /skills/i },
  { path: '/privacy', title: /privacy/i },
  { path: '/terms', title: /terms/i },
]

test.describe('Page routing', () => {
  for (const route of routes) {
    test(`${route.path} loads without error`, async ({ page }) => {
      const response = await page.goto(route.path)
      expect(response?.status()).toBeLessThan(400)
      await expect(page).toHaveTitle(route.title)
    })
  }
})

test.describe('Footer links', () => {
  test('Contact link in footer navigates to /contact', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Contact' }).click()
    await expect(page).toHaveURL('/contact')
  })
})
