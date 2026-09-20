const fs = require('fs');
const ot = require('opentype.js');
const OUT = __dirname;
const font = ot.parse(fs.readFileSync(require('path').join(__dirname, 'BlackHanSans-subset.ttf')).buffer);

const C = { gold: '#F7B32B', shell: '#3B2314', cream: '#FFF6E5', ink: '#26160E' };

// 땅콩 껍질 — 윗 로브(작게) · 허리(깊게) · 아랫 로브(크게)
const CX = 256;
const TOP = { cy: 166, r: 82 };
const BOT = { cy: 344, r: 98 };
const WAIST = { y: 256, hw: 40 };

// 오른쪽 윤곽을 위에서 아래로: [c1x,c1y, c2x,c2y, px,py]
const RIGHT = [
  [CX + 46, TOP.cy - TOP.r, CX + TOP.r, TOP.cy - 46, CX + TOP.r, TOP.cy],
  [CX + TOP.r, TOP.cy + 40, CX + WAIST.hw, WAIST.y - 34, CX + WAIST.hw, WAIST.y],
  [CX + WAIST.hw, WAIST.y + 38, CX + BOT.r, BOT.cy - 52, CX + BOT.r, BOT.cy],
  [CX + BOT.r, BOT.cy + 54, CX + 54, BOT.cy + BOT.r, CX, BOT.cy + BOT.r],
];
const START = [CX, TOP.cy - TOP.r];
const mx = (x) => 2 * CX - x;

// 왼쪽 = 오른쪽을 역순으로 되짚으며 좌우 반전 (제어점 순서도 뒤집는다)
const LEFT = [];
for (let i = RIGHT.length - 1; i >= 0; i--) {
  const [c1x, c1y, c2x, c2y] = RIGHT[i];
  const prev = i === 0 ? START : RIGHT[i - 1].slice(4);
  LEFT.push([mx(c2x), c2y, mx(c1x), c1y, mx(prev[0]), prev[1]]);
}
const SEGS = [...RIGHT, ...LEFT];
const PEANUT = `M ${START[0]} ${START[1]} ` + SEGS.map((s) => `C ${s.join(' ')}`).join(' ') + ' Z';

// 회전까지 반영한 실제 외곽 상자 (베지에 샘플링)
function bboxOf(tiltDeg) {
  const t = (tiltDeg * Math.PI) / 180, cos = Math.cos(t), sin = Math.sin(t);
  const rot = (x, y) => {
    const dx = x - CX, dy = y - 256;
    return [CX + dx * cos - dy * sin, 256 + dx * sin + dy * cos];
  };
  let [minX, minY, maxX, maxY] = [1e9, 1e9, -1e9, -1e9];
  let p0 = START;
  const eat = (x, y) => {
    const [rx, ry] = rot(x, y);
    minX = Math.min(minX, rx); maxX = Math.max(maxX, rx);
    minY = Math.min(minY, ry); maxY = Math.max(maxY, ry);
  };
  eat(p0[0], p0[1]);
  for (const s of SEGS) {
    const [x1, y1, x2, y2, x3, y3] = s;
    for (let i = 1; i <= 60; i++) {
      const u = i / 60, v = 1 - u;
      eat(v * v * v * p0[0] + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3,
          v * v * v * p0[1] + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3);
    }
    p0 = [x3, y3];
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// 안 B — 윗 로브를 파낸 시계판 (12시 → 2시, '지금부터 2시간')
const clockFace = (bg, fg) => `<circle cx="${CX}" cy="${TOP.cy}" r="55" fill="${bg}"/>
    <g stroke="${fg}" stroke-width="15" stroke-linecap="round" fill="none">
      <path d="M ${CX} ${TOP.cy} L ${CX} ${TOP.cy - 36}"/>
      <path d="M ${CX} ${TOP.cy} L ${CX + 27} ${TOP.cy + 15}"/>
    </g>`;

const TILT = -12;
function mark({ fill, clock = false, cut = C.gold, ridge = false }) {
  const tilt = clock ? 0 : TILT;
  return {
    svg: `<g transform="rotate(${tilt} ${CX} 256)"><path d="${PEANUT}" fill="${fill}"/>${clock ? clockFace(cut, fill) : ''}</g>`,
    box: bboxOf(tilt),
  };
}

// 마크를 원하는 크기(높이 기준)로 맞춰 배치
function place(m, { cx, cy, h }) {
  const s = h / m.box.h;
  const tx = cx - (m.box.x + m.box.w / 2) * s;
  const ty = cy - (m.box.y + m.box.h / 2) * s;
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)})">${m.svg}</g>`;
}

function icon({ bg, fg, clock = false, ridge = false, size = 1024 }) {
  const m = mark({ fill: fg, clock, ridge, cut: bg });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2246)}" fill="${bg}"/>
  ${place(m, { cx: size / 2, cy: size / 2, h: size * 0.62 })}
</svg>
`;
}

function markOnly(fill) {
  const m = mark({ fill });
  const pad = 8, h = 512 - pad * 2;
  const w = Math.round((m.box.w / m.box.h) * h + pad * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 512" width="${w}" height="512">
  ${place(m, { cx: w / 2, cy: 256, h })}
</svg>
`;
}

function word(text, size) {
  const p = font.getPath(text, 0, 0, size);
  const b = p.getBoundingBox();
  return { d: p.toPathData(2), w: b.x2 - b.x1, h: b.y2 - b.y1, x1: b.x1, y1: b.y1 };
}

function lockupH({ fg, wordFill }) {
  const W = word('넛츠', 200);
  const m = mark({ fill: fg });
  const mh = W.h * 1.34, mw = (m.box.w / m.box.h) * mh;
  const gap = W.h * 0.36, pad = 10;
  const w = pad * 2 + mw + gap + W.w, h = pad * 2 + mh;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(w)} ${Math.round(h)}" width="${Math.round(w)}" height="${Math.round(h)}">
  ${place(m, { cx: pad + mw / 2, cy: h / 2, h: mh })}
  <g transform="translate(${(pad + mw + gap - W.x1).toFixed(1)} ${(h / 2 + W.h / 2 - (W.y1 + W.h)).toFixed(1)})"><path d="${W.d}" fill="${wordFill}"/></g>
</svg>
`;
}

function lockupV({ fg, wordFill, tagFill }) {
  const W = word('넛츠', 190);
  const T = word('심심할 땐, 넛츠.', 62);
  const m = mark({ fill: fg });
  const mh = 258, mw = (m.box.w / m.box.h) * mh;
  const gap1 = 54, gap2 = 38, pad = 10;
  const w = Math.max(mw, W.w, T.w) + pad * 2;
  const h = pad * 2 + mh + gap1 + W.h + gap2 + T.h;
  const yW = pad + mh + gap1 + W.h - (W.y1 + W.h);
  const yT = pad + mh + gap1 + W.h + gap2 + T.h - (T.y1 + T.h);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(w)} ${Math.round(h)}" width="${Math.round(w)}" height="${Math.round(h)}">
  ${place(m, { cx: w / 2, cy: pad + mh / 2, h: mh })}
  <g transform="translate(${(w / 2 - W.w / 2 - W.x1).toFixed(1)} ${yW.toFixed(1)})"><path d="${W.d}" fill="${wordFill}"/></g>
  <g transform="translate(${(w / 2 - T.w / 2 - T.x1).toFixed(1)} ${yT.toFixed(1)})"><path d="${T.d}" fill="${tagFill}"/></g>
</svg>
`;
}

const files = {
  'nuts-appicon.svg': icon({ bg: C.gold, fg: C.shell }),
  'nuts-appicon-dark.svg': icon({ bg: C.ink, fg: C.gold }),
  'nuts-appicon-cream.svg': icon({ bg: C.cream, fg: C.shell }),
  'nuts-appicon-clock.svg': icon({ bg: C.gold, fg: C.shell, clock: true }),
  'nuts-mark.svg': markOnly(C.shell),
  'nuts-mark-gold.svg': markOnly(C.gold),
  'nuts-mark-mono-black.svg': markOnly('#000000'),
  'nuts-mark-mono-white.svg': markOnly('#FFFFFF'),
  'nuts-logo-horizontal.svg': lockupH({ fg: C.shell, wordFill: C.shell }),
  'nuts-logo-horizontal-gold.svg': lockupH({ fg: C.gold, wordFill: C.cream }),
  'nuts-logo-vertical.svg': lockupV({ fg: C.shell, wordFill: C.shell, tagFill: C.shell }),
};
for (const [name, svg] of Object.entries(files)) fs.writeFileSync(`${OUT}/${name}`, svg);
console.log('bbox tilt', JSON.stringify(bboxOf(TILT)));
