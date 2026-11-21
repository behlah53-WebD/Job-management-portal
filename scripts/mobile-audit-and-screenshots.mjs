import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const MOBILE_VIEWPORTS = [
  { name: '360px', width: 360, height: 780 },
  { name: '390px (iPhone 14/15)', width: 390, height: 844 },
  { name: '412px (Pixel 7)', width: 412, height: 915 },
  { name: '430px (iPhone Pro Max)', width: 430, height: 932 },
  { name: '768px (iPad Mini)', width: 768, height: 1024 },
];

const OUTPUT_DIR = path.resolve('visual/mobile');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const DEMO_CREDENTIALS = {
  seeker: { email: 'ananya@gmail.com', password: 'Seeker@123' },
  employer: { email: 'aarav@floralabs.io', password: 'Employer@123' },
  admin: { email: 'admin@verdant.com', password: 'Admin@123' },
};

async function prepareContextForRole(browser, role) {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  if (role === 'public') return context;

  const creds = DEMO_CREDENTIALS[role];
  if (!creds) return context;

  try {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const { csrfToken } = await csrfRes.json();
    const csrfCookie = csrfRes.headers.get('set-cookie') || '';

    const body = new URLSearchParams({
      csrfToken,
      email: creds.email,
      password: creds.password,
      json: 'true',
    });

    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: csrfCookie,
      },
      body: body.toString(),
    });

    const rawCookies = loginRes.headers.get('set-cookie') || '';
    const tokenMatch = rawCookies.match(/next-auth\.session-token=([^;]+)/);
    if (tokenMatch) {
      await context.addCookies([
        {
          name: 'next-auth.session-token',
          value: tokenMatch[1],
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);
    }
  } catch (err) {
    console.warn(`Failed to authenticate ${role}: ${err.message}`);
  }
  return context;
}

const TEST_PAGES = [
  { slug: 'home', path: '/', role: 'public', name: 'Public Landing / Home' },
  { slug: 'jobs', path: '/jobs', role: 'seeker', name: 'Jobs Listing' },
  { slug: 'seeker-overview', path: '/dashboard/seeker', role: 'seeker', name: 'Seeker Overview' },
  { slug: 'seeker-applications', path: '/dashboard/seeker/applications', role: 'seeker', name: 'Seeker Applications' },
  { slug: 'seeker-saved', path: '/dashboard/seeker/saved', role: 'seeker', name: 'Seeker Saved Jobs' },
  { slug: 'seeker-recommended', path: '/dashboard/seeker/recommended', role: 'seeker', name: 'Seeker Recommended ("For You")' },
  { slug: 'seeker-profile', path: '/dashboard/seeker/profile', role: 'seeker', name: 'Seeker Profile' },
  { slug: 'seeker-settings', path: '/dashboard/seeker/settings', role: 'seeker', name: 'Seeker Settings' },
  { slug: 'employer-overview', path: '/dashboard/employer', role: 'employer', name: 'Employer Overview' },
  { slug: 'employer-applicants', path: '/dashboard/employer/applicants', role: 'employer', name: 'Employer Pipeline' },
  { slug: 'admin-overview', path: '/dashboard/admin', role: 'admin', name: 'Admin Console' },
];

async function runAudit() {
  ensureDir(OUTPUT_DIR);

  const defaultChromePath = path.join(
    process.env.LOCALAPPDATA || 'C:\\Users\\Murtaza\\AppData\\Local',
    'ms-playwright',
    'chromium-1255',
    'chrome-win64',
    'chrome.exe'
  );

  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  };
  if (fs.existsSync(defaultChromePath)) {
    launchOptions.executablePath = defaultChromePath;
  }

  const browser = await chromium.launch(launchOptions);
  console.log('Browser launched. Authenticating contexts...');

  const contexts = {
    public: await browser.newContext({ viewport: { width: 390, height: 844 } }),
    seeker: await prepareContextForRole(browser, 'seeker'),
    employer: await prepareContextForRole(browser, 'employer'),
    admin: await prepareContextForRole(browser, 'admin'),
  };

  console.log('\n--- STARTING MOBILE OVERFLOW & RESPONSIVENESS AUDIT ---');
  let totalChecks = 0;
  let overflowViolations = 0;

  for (const pageConfig of TEST_PAGES) {
    const context = contexts[pageConfig.role] || contexts.public;
    const page = await context.newPage();

    // Navigate once per route at standard mobile width
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}${pageConfig.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(1000);

    // Verify across all mobile viewports
    for (const vp of MOBILE_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);

      // Check horizontal overflow
      const overflowInfo = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const hasOverflow = scrollWidth > docWidth || bodyScrollWidth > docWidth;

        // Find offending element if any
        let offending = null;
        if (hasOverflow) {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 2) {
              offending = {
                tag: el.tagName,
                className: el.className,
                right: rect.right,
                docWidth,
              };
              break;
            }
          }
        }
        return { hasOverflow, docWidth, scrollWidth, bodyScrollWidth, offending };
      });

      totalChecks++;
      if (overflowInfo.hasOverflow) {
        overflowViolations++;
        console.error(
          `❌ [OVERFLOW VIOLATION] ${pageConfig.name} at ${vp.name}: doc=${overflowInfo.docWidth}px, scroll=${overflowInfo.scrollWidth}px`,
          overflowInfo.offending
        );
      } else {
        console.log(`✅ [NO OVERFLOW] ${pageConfig.name} at ${vp.name} (w: ${vp.width}px)`);
      }
    }

    // Take polished reference screenshot at 390px (standard iPhone)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const screenshotPath = path.join(OUTPUT_DIR, `${pageConfig.slug}-390px.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Saved screenshot: ${screenshotPath}`);

    // If Jobs page, also capture bottom sheet filters open
    if (pageConfig.slug === 'jobs') {
      try {
        const filterBtn = page.locator('button[aria-label="Filter jobs"]').first();
        if (await filterBtn.count() > 0) {
          await filterBtn.click();
          await page.waitForTimeout(500);
          const filterSheetPath = path.join(OUTPUT_DIR, 'jobs-filters-sheet-390px.png');
          await page.screenshot({ path: filterSheetPath });
          console.log(`📸 Saved screenshot: ${filterSheetPath}`);
        }
      } catch (err) {
        console.warn('Could not capture filters sheet:', err.message);
      }
    }

    // If Overview, also capture AccountSheet open
    if (pageConfig.slug === 'seeker-overview') {
      try {
        const avatarBtn = page.locator('button[aria-label="Open account menu"]');
        if (await avatarBtn.count() > 0) {
          await avatarBtn.click();
          await page.waitForTimeout(400);
          const accountSheetPath = path.join(OUTPUT_DIR, 'account-sheet-390px.png');
          await page.screenshot({ path: accountSheetPath });
          console.log(`📸 Saved screenshot: ${accountSheetPath}`);
        }
      } catch (err) {
        console.warn('Could not capture account sheet:', err.message);
      }
    }

    await page.close();
  }

  await browser.close();

  console.log(`\n======================================================`);
  console.log(`AUDIT COMPLETE:`);
  console.log(`Total Viewport Checks: ${totalChecks}`);
  console.log(`Overflow Violations: ${overflowViolations}`);
  console.log(`======================================================\n`);

  if (overflowViolations > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
