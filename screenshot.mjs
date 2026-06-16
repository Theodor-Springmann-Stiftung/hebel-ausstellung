import { chromium } from 'playwright';
import sharp from 'sharp';

const shots = [
  { path: '/02/illustrationen/', file: '/tmp/opencode/chapter-fixed.png', width: 1200 },
  { path: '/02/illustrationen/werk-2/', file: '/tmp/opencode/detail-fixed.png', width: 1200 },
];

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});

for (const { path, file, width } of shots) {
  await page.goto(`http://localhost:4321${path}`, {
    waitUntil: 'networkidle',
  });
  await page.addStyleTag({
    content: '.astro-dev-toolbar, astro-dev-toolbar, [data-astro-dev-toolbar] { display: none !important; }',
  });
  const buffer = await page.screenshot({ fullPage: true, type: 'png' });
  await sharp(buffer)
    .resize(width, null, { withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`Saved ${file}`);
}

await browser.close();
