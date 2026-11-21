import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

process.env.VISUAL_TEST = 'true';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORTS = [1024, 1280, 1440, 1920];
const BASELINE_DIR = path.resolve('visual/baseline');
const CURRENT_DIR = path.resolve('visual/current');
const DIFF_DIR = path.resolve('visual/diff');

// Sample seeded job ID
const SAMPLE_JOB_ID = '6b00a5b7156cd71abd1383db';

// List of routes
const ROUTES = [
  { slug: 'landing', path: '/', role: 'public' },
  { slug: 'jobs', path: '/jobs', role: 'public' },
  { slug: 'job-sample', path: `/jobs/${SAMPLE_JOB_ID}`, role: 'public' },
  { slug: 'companies', path: '/companies', role: 'public' },
  { slug: 'login', path: '/login', role: 'public' },
  { slug: 'register', path: '/register', role: 'public' },
  { slug: 'not-found', path: '/non-existent-sample-page-404', role: 'public' },
  { slug: 'offline', path: '/offline', role: 'public' },
  // Seeker dashboard pages
  { slug: 'seeker-overview', path: '/dashboard/seeker', role: 'seeker' },
  { slug: 'seeker-applications', path: '/dashboard/seeker/applications', role: 'seeker' },
  { slug: 'seeker-saved', path: '/dashboard/seeker/saved', role: 'seeker' },
  { slug: 'seeker-recommended', path: '/dashboard/seeker/recommended', role: 'seeker' },
  { slug: 'seeker-profile', path: '/dashboard/seeker/profile', role: 'seeker' },
  { slug: 'seeker-settings', path: '/dashboard/seeker/settings', role: 'seeker' },
  // Employer dashboard pages
  { slug: 'employer-overview', path: '/dashboard/employer', role: 'employer' },
  { slug: 'employer-post-job', path: '/dashboard/employer/post-job', role: 'employer' },
  { slug: 'employer-my-jobs', path: '/dashboard/employer/my-jobs', role: 'employer' },
  { slug: 'employer-applicants', path: '/dashboard/employer/applicants', role: 'employer' },
  { slug: 'employer-company', path: '/dashboard/employer/company', role: 'employer' },
  { slug: 'employer-settings', path: '/dashboard/employer/settings', role: 'employer' },
  // Admin dashboard pages
  { slug: 'admin-overview', path: '/dashboard/admin', role: 'admin' },
  { slug: 'admin-users', path: '/dashboard/admin/users', role: 'admin' },
  { slug: 'admin-jobs', path: '/dashboard/admin/jobs', role: 'admin' },
  { slug: 'admin-companies', path: '/dashboard/admin/companies', role: 'admin' },
  { slug: 'admin-reports', path: '/dashboard/admin/reports', role: 'admin' },
  { slug: 'admin-categories', path: '/dashboard/admin/categories', role: 'admin' },
  { slug: 'admin-settings', path: '/dashboard/admin/settings', role: 'admin' },
];

const DEMO_CREDENTIALS = {
  seeker: { email: 'ananya@gmail.com', password: 'Seeker@123' },
  employer: { email: 'aarav@floralabs.io', password: 'Employer@123' },
  admin: { email: 'admin@verdant.com', password: 'Admin@123' },
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function prepareContextForRole(browser, role) {
  const context = await browser.newContext();
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
      console.log(`  🔑 Authenticated ${role} context via session token`);
    } else {
      console.warn(`  ⚠️ Could not extract session token for ${role}`);
    }
  } catch (err) {
    console.warn(`Failed to authenticate ${role}: ${err.message}`);
  }
  return context;
}

const DISABLE_ANIMATIONS_CSS = `
  *, *::before, *::after {
    animation: none !important;
    -webkit-animation: none !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition: none !important;
    -webkit-transition: none !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    caret-color: transparent !important;
  }
  #nprogress, .toast, nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog], [class*="nextjs-portal"], #__next-build-watcher {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
`;

function compareImages(baselinePath, currentPath, diffPath) {
  if (!fs.existsSync(baselinePath)) {
    return { error: 'Baseline missing' };
  }
  if (!fs.existsSync(currentPath)) {
    return { error: 'Current screenshot missing' };
  }

  const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
  const img2 = PNG.sync.read(fs.readFileSync(currentPath));

  if (img1.width !== img2.width || img1.height !== img2.height) {
    return {
      error: `Dimensions mismatch: baseline ${img1.width}x${img1.height} vs current ${img2.width}x${img2.height}`,
      diffCount: Math.abs(img1.width * img1.height - img2.width * img2.height),
    };
  }

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.15,
  });

  if (numDiffPixels > 0) {
    ensureDir(path.dirname(diffPath));
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }

  return { diffCount: numDiffPixels };
}

async function run() {
  const mode = process.argv[2] || 'check'; // 'baseline' or 'check'
  console.log(`\n======================================================`);
  console.log(`Running Visual Protocol: [${mode.toUpperCase()}]`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Viewports: ${VIEWPORTS.join(', ')} px`);
  console.log(`======================================================\n`);

  ensureDir(BASELINE_DIR);
  ensureDir(CURRENT_DIR);
  ensureDir(DIFF_DIR);

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

  const contexts = {
    public: await browser.newContext(),
    seeker: null,
    employer: null,
    admin: null,
  };

  try {
    console.log('Authenticating role contexts...');
    contexts.seeker = await prepareContextForRole(browser, 'seeker');
    contexts.employer = await prepareContextForRole(browser, 'employer');
    contexts.admin = await prepareContextForRole(browser, 'admin');
    console.log('Role contexts ready!\n');

    const targetDir = mode === 'baseline' ? BASELINE_DIR : CURRENT_DIR;
    let totalComparisons = 0;
    let failedComparisons = 0;
    const diffResults = [];

    for (const route of ROUTES) {
      console.log(`Capturing route: ${route.slug} (${route.path}) [role: ${route.role}]`);
      const context = contexts[route.role] || contexts.public;
      const page = await context.newPage();

      await page.addInitScript(() => {
        // Freeze Date to ensure deterministic rendering
        const fixedTime = 1732147200000;
        const OriginalDate = Date;
        class MockDate extends OriginalDate {
          constructor(...args) {
            if (args.length === 0) super(fixedTime);
            else super(...args);
          }
          static now() {
            return fixedTime;
          }
        }
        window.Date = MockDate;

        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation: none !important;
            -webkit-animation: none !important;
            transition: none !important;
            -webkit-transition: none !important;
            caret-color: transparent !important;
          }
          #nprogress, .toast {
            display: none !important;
          }
        `;
        document.documentElement.appendChild(style);
      });

      // Navigate once per route with domcontentloaded + networkidle
      await page.setViewportSize({ width: 1280, height: 900 });
      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(600);
      } catch (e) {
        console.warn(`Warning loading ${route.path}: ${e.message}`);
      }

      try {
        await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });
      } catch {}

      // Capture all viewports
      for (const width of VIEWPORTS) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(400);

        const filename = `${route.slug}_${width}.png`;
        const filepath = path.join(targetDir, filename);
        await page.screenshot({ path: filepath, fullPage: true });

        if (mode === 'check') {
          totalComparisons++;
          const baselineFile = path.join(BASELINE_DIR, filename);
          const diffFile = path.join(DIFF_DIR, filename);
          const result = compareImages(baselineFile, filepath, diffFile);

          if (result.error || result.diffCount > 0) {
            failedComparisons++;
            diffResults.push({
              route: route.slug,
              width,
              diffCount: result.diffCount,
              error: result.error,
              diffPath: diffFile,
            });
            console.log(`  ❌ ${width}px: DIFF DETECTED! (${result.error || result.diffCount + ' pixels'})`);
          } else {
            console.log(`  ✅ ${width}px: 0 pixel diff`);
          }
        } else {
          console.log(`  📸 Saved baseline at ${width}px`);
        }
      }
      await page.close();
    }

    console.log(`\n======================================================`);
    if (mode === 'baseline') {
      console.log(`🎉 Visual baseline captured successfully in ${BASELINE_DIR}!`);
    } else {
      if (failedComparisons === 0) {
        console.log(`🎉 VISUAL CHECK PASSED: ZERO pixel differences across all ${totalComparisons} checks!`);
        console.log(`Desktop UI is pixel-for-pixel IDENTICAL.`);
      } else {
        console.error(`❌ VISUAL CHECK FAILED: ${failedComparisons} / ${totalComparisons} checks had differences.`);
        diffResults.forEach((r) => {
          console.error(`   - ${r.route} @ ${r.width}px: ${r.error || r.diffCount + ' diff pixels'} -> ${r.diffPath}`);
        });
        process.exitCode = 1;
      }
    }
    console.log(`======================================================\n`);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Fatal visual runner error:', err);
  process.exit(1);
});
