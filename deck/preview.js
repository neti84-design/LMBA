/* 같은 좌표 데이터를 브라우저로 그려서 눈으로 확인한다 (PPTX 렌더러가 없는 환경용). */
// playwright 는 저장소 의존성이 아닙니다. 설치된 곳을 찾아 씁니다.
const { chromium } = (() => {
  for (const m of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
    try { return require(m); } catch (e) { /* 다음 후보 */ }
  }
  throw new Error('playwright 가 없습니다:  npm i -D playwright  후 다시 실행하십시오');
})();
const fs = require('fs');
const path = require('path');
const D = require('./deck.js');

const PX = 96;                       // 1인치 = 96px
const OUT = path.join(__dirname, 'preview');
const cache = {};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function toHtml(sh) {
  const base = (o) => `left:${o.x * PX}px;top:${o.y * PX}px;width:${o.w * PX}px;height:${o.h * PX}px;`;
  if (sh.t === 'rect') {
    const a = sh.alpha != null ? (100 - sh.alpha) / 100 : 1;
    return `<div style="position:absolute;${base(sh)}background:${sh.fill ? '#' + sh.fill : 'transparent'};opacity:${a};`
      + `border-radius:${(sh.radius || 0) * PX}px;${sh.line ? `border:${sh.lineW}px solid #${sh.line};box-sizing:border-box;` : ''}"></div>`;
  }
  if (sh.t === 'image') {
    const b64 = (cache[sh.path] = cache[sh.path] || fs.readFileSync(sh.path).toString('base64'));
    return `<div style="position:absolute;${base(sh)}overflow:hidden"><img src="data:image/png;base64,${b64}" style="width:100%;height:100%;object-fit:${sh.cover ? 'cover' : 'contain'};display:block"></div>`;
  }
  const al = { left: 'flex-start', center: 'center', right: 'flex-end' }[sh.align] || 'flex-start';
  return `<div style="position:absolute;${base(sh)}display:flex;flex-direction:column;justify-content:flex-start;align-items:${al};overflow:visible">`
    + `<div style="font-size:${sh.size}pt;font-weight:${sh.bold ? 800 : 400};color:#${sh.color};line-height:${sh.line};`
    + `text-align:${sh.align};letter-spacing:${(sh.space || 0)}px;white-space:pre-wrap;width:100%">${esc(sh.text)}</div></div>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  // 이 환경에는 playwright 가 기대하는 빌드와 다른 크로미움이 깔려 있을 수 있습니다.
  // CHROMIUM_PATH 로 실행 파일을 직접 지정하면 그걸 씁니다.
  const exe = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: Math.round(D.W * PX), height: Math.round(D.H * PX) }, deviceScaleFactor: 1 });
  for (let i = 0; i < D.S.length; i++) {
    const s = D.S[i];
    const html = `<!doctype html><html><head><meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&display=swap" rel="stylesheet">
      <style>html,body{margin:0;padding:0;width:${Math.round(D.W * PX)}px;height:${Math.round(D.H * PX)}px;overflow:hidden;
        font-family:'Noto Sans KR',sans-serif;background:#${D.C.cream}}</style></head>
      <body>${s.shapes.map(toHtml).join('')}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle' });
    const n = String(i + 1).padStart(2, '0');
    await page.screenshot({ path: path.join(OUT, `${n}.png`) });
    console.log(n, s.title);
  }
  await browser.close();
})();
