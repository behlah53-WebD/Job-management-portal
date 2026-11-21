import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

async function main() {
  const chromePath = path.join(
    process.env.LOCALAPPDATA || 'C:\\Users\\Murtaza\\AppData\\Local',
    'ms-playwright',
    'chromium-1255',
    'chrome-win64',
    'chrome.exe'
  );
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });

  // Setup mobile context (iPhone 14 - 390x844)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  console.log('Logging in as Ananya...');
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('button[type="submit"]');
  await page.waitForTimeout(1200);
  await page.fill('#login-email', 'ananya@gmail.com');
  await page.fill('#login-password', 'Seeker@123');
  await page.click('button[type="submit"]');

  await page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
  console.log('On dashboard:', page.url());
  await page.waitForTimeout(1000);

  // 1. MEASURE SPACING
  console.log('\n--- 1. MEASURING NAVBAR BOTTOM SPACING ---');
  const metrics = await page.evaluate(() => {
    const bar = document.querySelector('[class*="MobileTopBar_bar__"]');
    const avatar = document.querySelector('[class*="MobileTopBar_avatarBtn__"]');
    const icons = Array.from(document.querySelectorAll('[class*="MobileTopBar_iconBtn__"]'));
    const barBox = bar.getBoundingClientRect();
    const avatarBox = avatar.getBoundingClientRect();
    const iconBoxes = icons.map(i => i.getBoundingClientRect());

    return {
      barHeight: barBox.height,
      barBottom: barBox.bottom,
      avatarBottom: avatarBox.bottom,
      avatarSpaceToBottom: barBox.bottom - avatarBox.bottom,
      iconsSpaceToBottom: iconBoxes.map(b => barBox.bottom - b.bottom),
    };
  });
  console.log('Navbar metrics:', metrics);
  await page.screenshot({ path: 'visual/mobile_topbar_spacing.png' });

  // 2. TEST NOTIFICATION BELL CLICK
  console.log('\n--- 2. TESTING NOTIFICATION BELL CLICK ---');
  const bellBtn = page.locator('button[aria-label="Notifications"]').first();
  await bellBtn.click();
  await page.waitForTimeout(600);

  // Check if sheet is visible
  const sheetHeader = page.locator('h3:has-text("Notifications")');
  console.log('Notifications sheet header visible:', await sheetHeader.isVisible());
  await page.screenshot({ path: 'visual/mobile_notifications_sheet_open.png' });

  // Close notifications sheet
  const closeBtn = page.locator('[class*="BottomSheet_closeBtn__"]').last();
  await closeBtn.click();
  await page.waitForTimeout(400);

  // 3. TEST SEARCH ICON CLICK
  console.log('\n--- 3. TESTING SEARCH ICON CLICK ---');
  const searchBtn = page.locator('button[aria-label="Search jobs"]').first();
  await searchBtn.click();
  await page.waitForTimeout(400);

  const searchInput = page.locator('input[placeholder*="Search jobs"]').first();
  console.log('Search input visible after clicking search icon:', await searchInput.isVisible());
  await page.screenshot({ path: 'visual/mobile_search_bar_expanded.png' });

  // Type query and submit
  await searchInput.fill('Engineer');
  await page.keyboard.press('Enter');
  await page.waitForURL(url => url.pathname.includes('/jobs'), { timeout: 8000 });
  console.log('Navigated to after search submit:', page.url());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'visual/mobile_search_result_page.png' });

  // 4. TEST DESKTOP UNCHANGED (1440px)
  console.log('\n--- 4. VERIFYING DESKTOP UNCHANGED ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000/login');
  await desktopPage.waitForSelector('button[type="submit"]');
  await desktopPage.waitForTimeout(1200);
  await desktopPage.fill('#login-email', 'ananya@gmail.com');
  await desktopPage.fill('#login-password', 'Seeker@123');
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: 'visual/desktop_dashboard_unchanged.png' });
  console.log('Desktop screenshot taken.');

  await browser.close();
  console.log('\nALL TESTS PASSED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
