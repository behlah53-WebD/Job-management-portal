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

  // ========================================================
  // TEST 1: DESKTOP SIGN OUT (No Page Reload, Smooth Client Nav)
  // ========================================================
  console.log('\n--- TEST 1: DESKTOP SIGN OUT ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();

  console.log('Logging in on desktop...');
  await desktopPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await desktopPage.fill('#login-email', 'ananya@gmail.com');
  await desktopPage.fill('#login-password', 'Seeker@123');
  await desktopPage.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await desktopPage.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
  console.log('Successfully on dashboard:', desktopPage.url());

  let desktopReloadCount = 0;
  desktopPage.on('load', () => {
    desktopReloadCount++;
    console.log('NOTICE: Page load event fired');
  });

  const desktopLogoutBtn = desktopPage.locator('button:has-text("Sign out")').first();
  console.log('Desktop Sign out button text:', await desktopLogoutBtn.textContent());
  console.log('Clicking desktop Sign out...');
  await desktopLogoutBtn.click();

  // Wait for soft navigation to home page
  await desktopPage.waitForURL('http://localhost:3000/', { timeout: 8000 });
  await desktopPage.waitForTimeout(1000);
  console.log('Current URL after Sign Out:', desktopPage.url());
  console.log('Total full browser reloads after clicking Sign out:', desktopReloadCount);

  // Take screenshot of home page after signout
  await desktopPage.screenshot({ path: 'visual/test1_desktop_signout_done.png' });

  // Verify Navbar shows unauthenticated state (Log in / Sign up)
  const loginBtnCount = await desktopPage.locator('header a:has-text("Log in"), header button:has-text("Log in")').count();
  console.log('Unauthenticated "Log in" button present:', loginBtnCount > 0);
  await desktopContext.close();

  // ========================================================
  // TEST 2: MOBILE SIGN OUT VIA ACCOUNTSHEET (No Page Reload)
  // ========================================================
  console.log('\n--- TEST 2: MOBILE SIGN OUT VIA ACCOUNTSHEET ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileContext.newPage();

  console.log('Logging in on mobile...');
  await mobilePage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await mobilePage.fill('#login-email', 'ananya@gmail.com');
  await mobilePage.fill('#login-password', 'Seeker@123');
  await mobilePage.click('button[type="submit"]');

  await mobilePage.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
  console.log('Successfully on mobile dashboard:', mobilePage.url());

  let mobileReloadCount = 0;
  mobilePage.on('load', () => {
    mobileReloadCount++;
    console.log('NOTICE: Mobile page load event fired');
  });

  // Tap avatar trigger in MobileTopBar
  console.log('Opening AccountSheet on mobile...');
  const avatarBtn = mobilePage.locator('[class*="MobileTopBar"] button').first();
  await avatarBtn.click();
  await mobilePage.waitForTimeout(600);

  // Tap Sign Out button inside AccountSheet
  const mobileLogoutBtn = mobilePage.locator('[class*="AccountSheet"] button[class*="logoutBtn"]');
  console.log('Mobile sheet Sign Out button count:', await mobileLogoutBtn.count());
  console.log('Tapping Sign Out in mobile AccountSheet...');
  await mobileLogoutBtn.click();

  // Wait for soft navigation to home page
  await mobilePage.waitForURL('http://localhost:3000/', { timeout: 8000 });
  await mobilePage.waitForTimeout(1000);
  console.log('Current URL on mobile after Sign Out:', mobilePage.url());
  console.log('Total full browser reloads after mobile Sign out:', mobileReloadCount);

  // Take screenshot of mobile home page after signout
  await mobilePage.screenshot({ path: 'visual/test2_mobile_signout_done.png' });

  const mobileSignupCount = await mobilePage.locator('a:has-text("Sign up"), button:has-text("Sign up")').count();
  console.log('Unauthenticated "Sign up" button present on mobile:', mobileSignupCount > 0);
  await mobileContext.close();

  console.log('\n==========================================');
  console.log('ALL SIGN OUT VERIFICATION TESTS COMPLETED!');
  console.log(`Desktop Dashboard reloads: ${desktopReloadCount} (EXPECTED: 0)`);
  console.log(`Mobile Dashboard reloads: ${mobileReloadCount} (EXPECTED: 0)`);
  console.log('==========================================');

  await browser.close();
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
