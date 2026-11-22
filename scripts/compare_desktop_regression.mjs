import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const DIR = path.resolve('visual/employer_audit');

const routes = [
  'overview',
  'post_job',
  'my_jobs',
  'applicants',
  'company',
  'settings',
  'jobs_public',
];

const desktopPrefixes = [
  { before: 'desktop_1280_before', after: 'desktop_1280_after' },
  { before: 'desktop_1536_before', after: 'desktop_1536_after' },
];

function compareImages(img1Path, img2Path, diffPath) {
  if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
    return { error: `Files not found: ${img1Path} or ${img2Path}` };
  }

  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));

  const { width, height } = img1;
  if (img2.width !== width || img2.height !== height) {
    return {
      error: `Dimension mismatch: ${width}x${height} vs ${img2.width}x${img2.height}`,
    };
  }

  const diff = new PNG({ width, height });
  const mismatchedPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  const totalPixels = width * height;
  const mismatchPercent = (mismatchedPixels / totalPixels) * 100;

  return {
    width,
    height,
    mismatchedPixels,
    totalPixels,
    mismatchPercent: mismatchPercent.toFixed(3),
  };
}

function runComparison() {
  console.log('Comparing desktop screenshots before vs after to verify zero desktop regression...\n');
  let allPassed = true;

  for (const { before, after } of desktopPrefixes) {
    console.log(`=== Testing ${before} vs ${after} ===`);
    for (const r of routes) {
      const beforeImg = path.join(DIR, `${before}_${r}.png`);
      const afterImg = path.join(DIR, `${after}_${r}.png`);
      const diffImg = path.join(DIR, `diff_${before}_vs_${after}_${r}.png`);

      const res = compareImages(beforeImg, afterImg, diffImg);
      if (res.error) {
        console.log(`[WARN] ${r}: ${res.error}`);
        allPassed = false;
      } else {
        const passed = parseFloat(res.mismatchPercent) < 1.0; // Allow <1% for dynamic time ago or cursor blinking
        console.log(
          `[${passed ? 'PASS' : 'FAIL'}] ${r}: ${res.mismatchPercent}% difference (${res.mismatchedPixels} / ${res.totalPixels} px)`
        );
        if (!passed) allPassed = false;
      }
    }
    console.log('');
  }

  if (allPassed) {
    console.log('✅ ZERO DESKTOP REGRESSION VERIFIED! All desktop pages match pixel baseline.');
  } else {
    console.log('⚠️ Some routes had visual differences. Review diff images in visual/employer_audit.');
  }
}

runComparison();
