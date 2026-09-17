/* deck.js 의 좌표를 그대로 PPTX 로 옮긴다.  실행:  npm run build:deck */
const Pptx = require('pptxgenjs');
const path = require('path');
const D = require('./deck.js');

const FONT = '맑은 고딕';
const OUT = path.join(__dirname, '..', '넛츠_IR덱.pptx');

const p = new Pptx();
p.defineLayout({ name: 'W16x9', width: D.W, height: D.H });
p.layout = 'W16x9';
p.author = '넛츠 TF';
p.title = '넛츠 (NUTS) — IR 덱';
p.subject = '예약 기반 서비스업 실시간 빈 슬롯 마켓플레이스';

for (const s of D.S) {
  const slide = p.addSlide();
  slide.background = { color: D.C.cream };

  for (const sh of s.shapes) {
    if (sh.t === 'rect') {
      slide.addShape(sh.radius ? p.ShapeType.roundRect : p.ShapeType.rect, {
        x: sh.x, y: sh.y, w: sh.w, h: sh.h,
        fill: sh.fill ? { color: sh.fill, transparency: sh.alpha || 0 } : { type: 'none' },
        line: sh.line ? { color: sh.line, width: sh.lineW } : { type: 'none' },
        rectRadius: sh.radius || 0,
      });
    } else if (sh.t === 'image') {
      slide.addImage({
        path: sh.path, x: sh.x, y: sh.y, w: sh.w, h: sh.h,
        ...(sh.cover ? { sizing: { type: 'cover', w: sh.w, h: sh.h } } : {}),
      });
    } else {
      slide.addText(sh.text, {
        x: sh.x, y: sh.y, w: sh.w, h: sh.h,
        fontFace: FONT, fontSize: sh.size, bold: sh.bold, color: sh.color,
        align: sh.align, valign: 'top', margin: 0,
        lineSpacing: Math.round(sh.size * sh.line * 100) / 100,
        charSpacing: sh.space || 0,
        wrap: true, fit: 'none',
      });
    }
  }

  const secs = s.secs;
  const stamp = `[${s.title} · ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}]`;
  slide.addNotes(`${stamp}\n\n${s.notes.join('\n')}`);
}

const total = D.S.reduce((a, s) => a + s.secs, 0);
p.writeFile({ fileName: OUT }).then((f) => {
  console.log('written', f);
  console.log('슬라이드', D.S.length, '· 합계', `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`);
});
