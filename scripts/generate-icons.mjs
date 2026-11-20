import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('design/verdant-icon.svg');
const iconsDir = path.resolve('public/icons');
const shortcutsDir = path.resolve('public/icons/shortcuts');
const splashDir = path.resolve('public/splash');
const screenshotsDir = path.resolve('public/screenshots');

// Ensure output directories exist
[iconsDir, shortcutsDir, splashDir, screenshotsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const svgBuffer = fs.readFileSync(svgPath);

// 1. Standard manifest icons (purpose: any)
const standardSizes = [48, 72, 96, 128, 144, 192, 256, 384, 512];

console.log('Generating standard manifest icons...');
for (const size of standardSizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
}

// 2. Maskable icons (purpose: maskable)
// Safe zone: glyph in central 80%, full solid background #1E9A56, no rounded corners or transparency
console.log('Generating maskable icons (192, 512)...');
for (const size of [192, 512]) {
  const glyphSize = Math.round(size * 0.72);
  const glyph = await sharp(svgBuffer)
    .resize(glyphSize, glyphSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 30, g: 154, b: 86, alpha: 1 }, // #1E9A56
    },
  })
    .composite([{ input: glyph, gravity: 'center' }])
    .png()
    .toFile(path.join(iconsDir, `maskable-icon-${size}x${size}.png`));
}

// 3. Apple Touch Icon (180x180, solid background, no transparency)
console.log('Generating apple-touch-icon.png (180x180)...');
await sharp(svgBuffer)
  .resize(180, 180)
  .flatten({ background: { r: 30, g: 154, b: 86 } })
  .png()
  .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

// Also copy to public root for default Apple crawlers
fs.copyFileSync(path.join(iconsDir, 'apple-touch-icon.png'), path.resolve('public/apple-touch-icon.png'));

// 4. Favicon icons
console.log('Generating favicons (16, 32)...');
await sharp(svgBuffer).resize(16, 16).png().toFile(path.resolve('public/favicon-16x16.png'));
await sharp(svgBuffer).resize(32, 32).png().toFile(path.resolve('public/favicon-32x32.png'));
await sharp(svgBuffer).resize(32, 32).png().toFile(path.resolve('public/favicon-32.png'));
// Generate standard 48x48 as favicon.ico
await sharp(svgBuffer).resize(48, 48).png().toFile(path.resolve('public/favicon.ico'));

// 5. Windows Tile icons
console.log('Generating Windows Tile icons...');
for (const size of [144, 150, 310]) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, `ms-tile-${size}x${size}.png`));
}

// 6. Shortcut icons (96x96)
console.log('Generating shortcut icons...');
const shortcutList = [
  'shortcut-jobs.png',
  'shortcut-applications.png',
  'shortcut-saved.png',
  'shortcut-post.png',
];
for (const sName of shortcutList) {
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile(path.join(shortcutsDir, sName));
}

// 7. iOS Startup Splash screens
console.log('Generating iOS splash screens...');
const splashResolutions = [
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796.png' }, // iPhone 14/15 Pro Max
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556.png' }, // iPhone 14/15 Pro
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' }, // iPhone 12/13/14
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone X/XS/11 Pro
  { width: 828, height: 1792, name: 'apple-splash-828-1792.png' },   // iPhone XR/11
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },   // iPhone 8/SE
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' }, // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' }, // iPad Pro 11"
];

for (const splash of splashResolutions) {
  const logoSize = Math.round(Math.min(splash.width, splash.height) * 0.28);
  const logo = await sharp(svgBuffer)
    .resize(logoSize, logoSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: splash.width,
      height: splash.height,
      channels: 4,
      background: { r: 247, g: 251, b: 248, alpha: 1 }, // #F7FBF8 brand background
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(splashDir, splash.name));
}

// 8. Manifest Screenshots (Wide and Narrow for Chrome rich install UI)
console.log('Generating PWA rich install screenshots...');
const screenshots = [
  { width: 1280, height: 720, name: 'screenshot-wide-1.png', label: 'Explore Curated Roles in Tech & Design' },
  { width: 1280, height: 720, name: 'screenshot-wide-2.png', label: 'Employer Dashboard & Candidate Kanban' },
  { width: 750, height: 1334, name: 'screenshot-narrow-1.png', label: 'Verdant Mobile Discovery & 1-Click Apply' },
  { width: 750, height: 1334, name: 'screenshot-narrow-2.png', label: 'Candidate Applications Tracker' },
  { width: 750, height: 1334, name: 'screenshot-narrow-3.png', label: 'Real-time Alerts & Saved Opportunities' },
];

for (const sc of screenshots) {
  const isWide = sc.width > sc.height;
  const badgeSize = isWide ? 140 : 120;
  const logo = await sharp(svgBuffer).resize(badgeSize, badgeSize).png().toBuffer();

  const titleSvg = Buffer.from(`
    <svg width="${sc.width}" height="${sc.height}">
      <text x="50%" y="${isWide ? '62%' : '58%'}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${isWide ? 28 : 24}" font-weight="700" fill="#0B3D24">
        Verdant
      </text>
      <text x="50%" y="${isWide ? '68%' : '63%'}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${isWide ? 20 : 18}" fill="#5E7A6B">
        ${sc.label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
    </svg>
  `);

  await sharp({
    create: {
      width: sc.width,
      height: sc.height,
      channels: 4,
      background: { r: 247, g: 251, b: 248, alpha: 1 },
    },
  })
    .composite([
      { input: logo, top: Math.round(sc.height * 0.35) - Math.round(badgeSize / 2), left: Math.round(sc.width / 2) - Math.round(badgeSize / 2) },
      { input: titleSvg, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(screenshotsDir, sc.name));
}

console.log('All icons, splash screens, and screenshots generated successfully!');
