// 로고 시트 한 장(nuts-logo-sheet.png)을 만듭니다. playwright 필요.
const { chromium } = require('playwright');
const fs = require('fs');
const D = __dirname;
const S = (f) => fs.readFileSync(`${D}/${f}`, 'utf8');

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  :root { --gold:#F7B32B; --shell:#3B2314; --cream:#FFF6E5; --ink:#26160E; }
  * { box-sizing:border-box; }
  body { margin:0; width:1400px; background:#FFFDF8; font-family:'Noto Sans KR',sans-serif; color:var(--shell); padding:64px 72px 72px; }
  h1 { font-size:44px; font-weight:800; margin:0 0 8px; letter-spacing:-0.02em; }
  .sub { font-size:19px; color:#7A6353; margin:0 0 44px; }
  h2 { font-size:15px; font-weight:800; letter-spacing:0.12em; color:#A08B77; margin:44px 0 20px; text-transform:uppercase; }
  .row { display:flex; gap:36px; align-items:flex-start; }
  .cell { text-align:center; }
  .cell svg { width:200px; height:200px; border-radius:44px; display:block; }
  .cap { font-size:15px; margin-top:12px; color:#7A6353; }
  .cap b { color:var(--shell); font-weight:600; }
  .lock { border:1px solid #EDE2D2; border-radius:20px; padding:36px 44px; background:#fff; display:flex; align-items:center; justify-content:center; }
  .lock svg { height:96px; width:auto; }
  .lock.v svg { height:260px; }
  .lock.dark { background:var(--ink); border-color:var(--ink); }
  .pal { display:flex; gap:20px; }
  .sw { width:200px; }
  .chip { height:92px; border-radius:16px; border:1px solid rgba(0,0,0,.06); }
  .nm { font-size:15px; font-weight:600; margin-top:10px; }
  .hex { font-size:14px; color:#7A6353; font-variant-numeric:tabular-nums; }
  .sizes { display:flex; gap:28px; align-items:flex-end; }
  .sizes svg { border-radius:22%; display:block; }
</style></head><body>
  <h1>넛츠 로고</h1>
  <p class="sub">심심풀이 땅콩 한 알을 그대로 마크로. 둥근 사각 배경 + 단색 실루엣 — 앱 아이콘에서 가장 작게 줄여도 형태가 살아남는 구조입니다.</p>

  <h2>안 A · 땅콩 (권고)</h2>
  <div class="row">
    <div class="cell">${S('nuts-appicon.svg')}<div class="cap"><b>기본</b><br>골드 배경 · 셸 브라운</div></div>
    <div class="cell">${S('nuts-appicon-dark.svg')}<div class="cap"><b>다크</b><br>다크모드 · 굿즈</div></div>
    <div class="cell">${S('nuts-appicon-cream.svg')}<div class="cap"><b>크림</b><br>인쇄물 · 문서</div></div>
    <div class="cell">${S('nuts-appicon-clock.svg')}<div class="cap"><b>안 B · 땅콩+시계</b><br>'지금부터 2시간'을 새김</div></div>
  </div>

  <h2>조합 (로고타입)</h2>
  <div class="row">
    <div class="lock">${S('nuts-logo-horizontal.svg')}</div>
    <div class="lock dark">${S('nuts-logo-horizontal-gold.svg')}</div>
  </div>
  <div class="row" style="margin-top:28px">
    <div class="lock v">${S('nuts-logo-vertical.svg')}</div>
    <div style="flex:1">
      <h2 style="margin-top:0">색</h2>
      <div class="pal">
        <div class="sw"><div class="chip" style="background:#F7B32B"></div><div class="nm">넛츠 골드</div><div class="hex">#F7B32B</div></div>
        <div class="sw"><div class="chip" style="background:#3B2314"></div><div class="nm">셸 브라운</div><div class="hex">#3B2314</div></div>
        <div class="sw"><div class="chip" style="background:#FFF6E5"></div><div class="nm">크림</div><div class="hex">#FFF6E5</div></div>
      </div>
      <h2>작게 줄였을 때</h2>
      <div class="sizes">
        <div>${S('nuts-appicon.svg')}</div>
        <div>${S('nuts-appicon.svg')}</div>
        <div>${S('nuts-appicon.svg')}</div>
      </div>
    </div>
  </div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const sz = [96, 64, 40];
    document.querySelectorAll('.sizes svg').forEach((s, i) => { s.style.width = sz[i] + 'px'; s.style.height = sz[i] + 'px'; });
  });
  await page.screenshot({ path: `${D}/nuts-logo-sheet.png`, fullPage: true });
  await browser.close();
  console.log('sheet ok');
})();
