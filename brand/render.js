// SVG → PNG. playwright 가 있어야 돕니다:  npx playwright@1.56 ...  또는  npm i -D playwright
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;

const jobs = [
  ['nuts-appicon.svg', 'nuts-appicon-1024.png', 1024, 1024, false],
  ['nuts-appicon-dark.svg', 'nuts-appicon-dark-1024.png', 1024, 1024, false],
  ['nuts-appicon-cream.svg', 'nuts-appicon-cream-1024.png', 1024, 1024, false],
  ['nuts-appicon-clock.svg', 'nuts-appicon-clock-1024.png', 1024, 1024, false],
  ['nuts-mark.svg', 'nuts-mark-1024.png', 1024, 1024, true],
  ['nuts-logo-horizontal.svg', 'nuts-logo-horizontal.png', null, 320, true],
  ['nuts-logo-vertical.svg', 'nuts-logo-vertical.png', null, 900, true],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [src, out, w, h, transparent] of jobs) {
    const svg = fs.readFileSync(`${DIR}/${src}`, 'utf8');
    const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const ratio = parseFloat(vb[1]) / parseFloat(vb[2]);
    const width = w || Math.round(h * ratio);
    const height = h;
    await page.setViewportSize({ width, height });
    await page.setContent(`<style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:${width}px;height:${height}px}</style>${svg}`);
    await page.screenshot({ path: `${DIR}/${out}`, omitBackground: transparent });
    console.log(out, width + 'x' + height);
  }
  await browser.close();
})();
