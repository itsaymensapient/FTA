const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

(async () => {
  const slugs = [
    'meet-01-two-files',
    'meet-02-scenario-journey',
    'meet-03-data-model',
    'meet-04-who-does-what',
    'meet-05-yasmeen',
    'meet-06-waha',
  ];
  const edge = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ].find((p) => fs.existsSync(p));
  const browser = await chromium.launch({
    headless: true,
    ...(edge ? { executablePath: edge } : {}),
  });
  const reports = [];
  for (const slug of slugs) {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(pathToFileURL(path.join(__dirname, slug + '.html')).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.evaluate(() => document.fonts.ready);
    const audit = await page.locator('svg').evaluate((svg) => {
      const b = svg.viewBox.baseVal;
      const texts = [...svg.querySelectorAll('text')].map((t) => {
        const box = t.getBBox();
        return { text: t.textContent, x: box.x, y: box.y, w: box.width, h: box.height };
      });
      const outside = texts
        .filter((t) => t.x < 0 || t.y < 0 || t.x + t.w > b.width || t.y + t.h > b.height)
        .map((t) => t.text);
      const overlaps = [];
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i],
            c = texts[j];
          if (a.x < c.x + c.w - 1 && a.x + a.w > c.x + 1 && a.y < c.y + c.h - 1 && a.y + a.h > c.y + 1) {
            overlaps.push([a.text, c.text]);
          }
        }
      }
      return { width: b.width, height: b.height, textCount: texts.length, outside, textOverlaps: overlaps };
    });
    await page.locator('svg').evaluate((el) => {
      const b = el.viewBox.baseVal;
      for (const [a, s] of [
        ['width', b.width],
        ['height', b.height],
      ])
        for (const p of ['', 'min-', 'max-']) el.style.setProperty(p + a, s + 'px', 'important');
      for (let a = el.parentElement; a; a = a.parentElement) a.style.overflow = 'visible';
    });
    await page.locator('svg').screenshot({ path: path.join(__dirname, slug + '.png') });
    await context.close();
    reports.push({ slug, ...audit });
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'meeting-charts-render-checks.json'), JSON.stringify(reports, null, 2));
  console.log(JSON.stringify(reports, null, 2));
  if (reports.some((r) => r.outside.length || r.textOverlaps.length)) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
