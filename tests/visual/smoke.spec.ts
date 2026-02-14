import { test, expect } from '@playwright/test'

test.describe('Smoke Visual Tests', () => {
  test('home page loads and renders', async ({ page }) => {
    await page.goto('/')
    
    // For unauthenticated users, we should see the login form OR the main dashboard
    // Let's check if we can see Mission Control title or login form
    await expect(page).toHaveTitle(/Mission Control/)
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: `screenshots/${test.info().project.name}-home.png`, 
      fullPage: true 
    })
  })

  test('sidebar visible and contains Mission Control on desktop', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Desktop only test')
    
    await page.goto('/')
    
    // Wait for the sidebar to be rendered
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
    
    // Check that sidebar contains Mission Control text
    await expect(sidebar).toContainText('Mission Control')
    
    // Check that navigation items are present
    await expect(sidebar.locator('a[href="/"]')).toContainText('Home')
    await expect(sidebar.locator('a[href="/brain"]')).toContainText('Second Brain')
  })

  test('mobile hamburger button present', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test')
    
    await page.goto('/')
    
    // Look for the mobile menu button
    const menuBtn = page.locator('button[aria-label="Abrir menu"]')
    await expect(menuBtn).toBeVisible()
    
    // Test that clicking opens the sidebar
    await menuBtn.click()
    
    // Now sidebar should be visible on mobile
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: `screenshots/${test.info().project.name}-mobile-menu.png`, 
      fullPage: true 
    })
  })

  test('navigation to Second Brain works', async ({ page, isMobile }) => {
    await page.goto('/')
    
    // On mobile, we need to open the sidebar first
    if (isMobile) {
      const menuBtn = page.locator('button[aria-label="Abrir menu"]')
      await expect(menuBtn).toBeVisible()
      await menuBtn.click()
      
      // Wait for sidebar to appear
      await page.waitForSelector('aside', { state: 'visible' })
    }
    
    // Find and click the brain link
    const brainLink = page.locator('a[href="/brain"]')
    await expect(brainLink).toBeVisible()
    await brainLink.click()
    
    // Wait for navigation
    await page.waitForURL('/brain')
    
    // Check that we're on the brain page and it has expected content
    await expect(page.locator('text=Second Brain').first()).toBeVisible()
    
    // Take screenshot
    await page.screenshot({ 
      path: `screenshots/${test.info().project.name}-brain.png`, 
      fullPage: true 
    })
  })

  test('navigation back to Home works from Brain', async ({ page, isMobile }) => {
    await page.goto('/brain')
    
    // On mobile, we need to open the sidebar first
    if (isMobile) {
      const menuBtn = page.locator('button[aria-label="Abrir menu"]')
      await expect(menuBtn).toBeVisible()
      await menuBtn.click()
      
      // Wait for sidebar to appear
      await page.waitForSelector('aside', { state: 'visible' })
    }
    
    // Find and click the home link
    const homeLink = page.locator('a[href="/"]')
    await expect(homeLink).toBeVisible()
    await homeLink.click()
    
    // Wait for navigation
    await page.waitForURL('/')
    
    // Check that we're back on the home page
    // Either we see the login form or the Mission Control dashboard
    const hasLoginForm = await page.locator('text=Login').first().isVisible().catch(() => false)
    const hasDashboard = await page.locator('text=Mission Control').first().isVisible().catch(() => false)
    
    expect(hasLoginForm || hasDashboard).toBeTruthy()
  })

  test('app loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/')
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000)
    
    // Filter out known acceptable errors (like auth-related ones in test environment)
    const criticalErrors = consoleErrors.filter(error => {
      return !error.includes('supabase') && 
             !error.includes('auth') && 
             !error.includes('network') &&
             !error.includes('fetch')
    })
    
    expect(criticalErrors).toHaveLength(0)
  })
})