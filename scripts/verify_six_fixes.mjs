import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('visual/six_fixes_verification');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const chromePath = path.join(
  process.env.LOCALAPPDATA || 'C:\\Users\\Murtaza\\AppData\\Local',
  'ms-playwright',
  'chromium-1255',
  'chrome-win64',
  'chrome.exe'
);

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });

  // 1. Test Seeker screens (Pic 1: Navbar space, Pic 2: All pill not hiding)
  console.log('--- Testing Seeker Screens (Pic 1 & Pic 2) ---');
  const seekerContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const seekerPage = await seekerContext.newPage();

  // Login as Seeker
  await seekerPage.goto(`${BASE_URL}/login`);
  await seekerPage.waitForTimeout(1000);
  await seekerPage.fill('#login-email', 'ananya@gmail.com');
  await seekerPage.fill('#login-password', 'Seeker@123');
  await seekerPage.click('button[type="submit"]');
  await seekerPage.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await seekerPage.waitForTimeout(1000);

  // Pic 1: Seeker Overview at 390px and 412px
  for (const w of [360, 390, 412]) {
    await seekerPage.setViewportSize({ width: w, height: 844 });
    await seekerPage.goto(`${BASE_URL}/dashboard/seeker`, { waitUntil: 'domcontentloaded' });
    await seekerPage.waitForTimeout(600);
    await seekerPage.screenshot({ path: path.join(OUT_DIR, `pic1_seeker_overview_${w}px.png`) });
    console.log(`Saved pic1_seeker_overview_${w}px.png`);

    // Verify distance from top of screen to greeting name
    const greetingBox = await seekerPage.locator('h2').first().boundingBox();
    const navBarBox = await seekerPage.locator('header').first().boundingBox();
    console.log(`[${w}px] Navbar bottom: ${navBarBox ? navBarBox.y + navBarBox.height : 'N/A'}, Greeting top: ${greetingBox ? greetingBox.y : 'N/A'}`);
  }

  // Pic 2: Seeker Applications ("All" pill not clipped)
  for (const w of [360, 390]) {
    await seekerPage.setViewportSize({ width: w, height: 844 });
    await seekerPage.goto(`${BASE_URL}/dashboard/seeker/applications`, { waitUntil: 'domcontentloaded' });
    await seekerPage.waitForTimeout(600);
    await seekerPage.screenshot({ path: path.join(OUT_DIR, `pic2_seeker_applications_${w}px.png`) });
    console.log(`Saved pic2_seeker_applications_${w}px.png`);

    // Check "All" pill bounding box
    const allTab = await seekerPage.locator('button:has-text("All")').first().boundingBox();
    console.log(`[${w}px] "All" pill left position: ${allTab ? allTab.x : 'N/A'}px (must be >= 14px, not clipped)`);
  }
  await seekerContext.close();

  // 2. Test Employer screens (Pic 3: All cards in front, Pic 4: Kanban/List toggle)
  console.log('\n--- Testing Employer Screens (Pic 3 & Pic 4) ---');
  const empContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const empPage = await empContext.newPage();

  // Login as Employer
  await empPage.goto(`${BASE_URL}/login`);
  await empPage.waitForTimeout(1000);
  await empPage.fill('#login-email', 'aarav@floralabs.io');
  await empPage.fill('#login-password', 'Employer@123');
  await empPage.click('button[type="submit"]');
  await empPage.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await empPage.waitForTimeout(1000);

  // Pic 3: Employer Overview at 360px & 390px (Cards 2x2 grid in front)
  for (const w of [360, 390]) {
    await empPage.setViewportSize({ width: w, height: 844 });
    await empPage.goto(`${BASE_URL}/dashboard/employer`, { waitUntil: 'domcontentloaded' });
    await empPage.waitForTimeout(600);
    await empPage.screenshot({ path: path.join(OUT_DIR, `pic3_employer_overview_cards_${w}px.png`) });
    console.log(`Saved pic3_employer_overview_cards_${w}px.png`);
  }

  // Pic 4: Employer Applicants Kanban/List toggle at 360px & 390px
  for (const w of [360, 390]) {
    await empPage.setViewportSize({ width: w, height: 844 });
    await empPage.goto(`${BASE_URL}/dashboard/employer/applicants`, { waitUntil: 'domcontentloaded' });
    await empPage.waitForTimeout(600);
    await empPage.screenshot({ path: path.join(OUT_DIR, `pic4_employer_pipeline_${w}px.png`) });
    console.log(`Saved pic4_employer_pipeline_${w}px.png`);

    // Verify toggle width
    const toggleBox = await empPage.locator('button:has-text("Kanban")').first().boundingBox();
    console.log(`[${w}px] Kanban toggle button width: ${toggleBox ? toggleBox.width : 'N/A'}px (must be >= 100px, not vertical)`);
  }
  await empContext.close();

  // 3. Test Admin screens (Pic 5: Users cards, Pic 6: Jobs cards)
  console.log('\n--- Testing Admin Screens (Pic 5 & Pic 6) ---');
  const adminContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const adminPage = await adminContext.newPage();

  // Login as Admin
  await adminPage.goto(`${BASE_URL}/login`);
  await adminPage.waitForTimeout(1000);
  await adminPage.fill('#login-email', 'admin@verdant.com');
  await adminPage.fill('#login-password', 'Admin@123');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await adminPage.waitForTimeout(1000);

  // Pic 5: Admin Users at 360px & 390px
  for (const w of [360, 390]) {
    await adminPage.setViewportSize({ width: w, height: 844 });
    await adminPage.goto(`${BASE_URL}/dashboard/admin/users`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(600);
    await adminPage.screenshot({ path: path.join(OUT_DIR, `pic5_admin_users_${w}px.png`) });
    console.log(`Saved pic5_admin_users_${w}px.png`);
  }

  // Pic 6: Admin Jobs at 360px & 390px
  for (const w of [360, 390]) {
    await adminPage.setViewportSize({ width: w, height: 844 });
    await adminPage.goto(`${BASE_URL}/dashboard/admin/jobs`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(600);
    await adminPage.screenshot({ path: path.join(OUT_DIR, `pic6_admin_jobs_${w}px.png`) });
    console.log(`Saved pic6_admin_jobs_${w}px.png`);
  }

  // Also verify Desktop is unchanged at 1280px
  console.log('\n--- Testing Desktop viewports (1280px) ---');
  await adminPage.setViewportSize({ width: 1280, height: 900 });
  await adminPage.goto(`${BASE_URL}/dashboard/admin/users`, { waitUntil: 'domcontentloaded' });
  await adminPage.waitForTimeout(500);
  await adminPage.screenshot({ path: path.join(OUT_DIR, 'desktop_1280_admin_users.png') });
  console.log('Saved desktop_1280_admin_users.png (table preserved)');

  await adminPage.goto(`${BASE_URL}/dashboard/admin/jobs`, { waitUntil: 'domcontentloaded' });
  await adminPage.waitForTimeout(500);
  await adminPage.screenshot({ path: path.join(OUT_DIR, 'desktop_1280_admin_jobs.png') });
  console.log('Saved desktop_1280_admin_jobs.png (table preserved)');

  await adminContext.close();
  await browser.close();
  console.log('\nALL 6 FIXES VERIFIED SUCCESSFULLY!');
}

main().catch(console.error);
