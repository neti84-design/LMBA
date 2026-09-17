/* 넛츠 IR 덱 — 내용과 배치를 한 곳에 두고, build.js(PPTX)와 preview.js(PNG)가 같은 걸 읽는다. */
const path = require('path');
const A = (f) => path.join(__dirname, 'assets', f);

const W = 13.333, H = 7.5, M = 0.85;
const CW = W - M * 2;

const C = {
  cream: 'FFFDF8', ink: '26160E', shell: '3B2314', gold: 'F7B32B',
  grey: '7A6353', line: 'EDE2D2', white: 'FFFFFF', card: 'FFFFFF',
  dim: 'F6EFE2', red: 'B02A2A', green: '2E6B3E',
};

/* ---------- 조각 만들기 ---------- */
const rect = (x, y, w, h, o = {}) => ({ t: 'rect', x, y, w, h, fill: o.fill, radius: o.radius || 0, line: o.line, lineW: o.lineW || 1, alpha: o.alpha });
const text = (x, y, w, h, s, o = {}) => ({ t: 'text', x, y, w, h, text: s, size: o.size || 16, bold: !!o.bold, color: o.color || C.ink, align: o.align || 'left', valign: o.valign || 'top', line: o.lineSpacing || 1.35, space: o.space });
const img = (x, y, w, h, file, o = {}) => ({ t: 'image', x, y, w, h, path: A(file), cover: !!o.cover });

function head(eyebrow, title, o = {}) {
  const col = o.color || C.shell, sub = o.eyebrowColor || C.gold;
  const out = [];
  if (eyebrow) out.push(text(M, 0.42, CW, 0.3, eyebrow, { size: 12.5, bold: true, color: sub, space: 2 }));
  out.push(text(M, 0.78, o.tw || CW, 0.75, title, { size: o.size || 30, bold: true, color: col }));
  return out;
}
const footer = (n, o = {}) => [
  text(M, H - 0.52, 3, 0.3, '넛츠  NUTS', { size: 9.5, color: o.color || C.grey, space: 1.5 }),
  text(W - M - 1.4, H - 0.52, 1.4, 0.3, String(n), { size: 9.5, color: o.color || C.grey, align: 'right' }),
];

/* 좌우 2단 카드 */
function card(x, y, w, h, title, lines, o = {}) {
  const out = [rect(x, y, w, h, { fill: o.fill || C.card, radius: 0.08, line: o.line || C.line })];
  out.push(text(x + 0.34, y + 0.3, w - 0.68, 0.4, title, { size: o.titleSize || 17, bold: true, color: o.titleColor || C.shell }));
  out.push(text(x + 0.34, y + 0.86, w - 0.68, h - 1.2, lines.join('\n'), { size: o.size || 13.5, color: o.color || C.grey, lineSpacing: 1.5 }));
  return out;
}

/* 2×2 한 칸 */
function cell(x, y, w, h, title, lines, o = {}) {
  const hot = !!o.hot;
  const out = [rect(x, y, w, h, {
    fill: hot ? C.shell : (o.muted ? C.white : C.card), radius: 0.08,
    line: hot ? C.shell : C.line, lineW: hot ? 2 : 1,
  })];
  out.push(text(x + 0.3, y + 0.32, w - 0.6, 0.42, title, { size: hot ? 20 : 15.5, bold: true, color: hot ? C.gold : (o.muted ? C.grey : C.shell) }));
  out.push(text(x + 0.3, y + (hot ? 0.95 : 0.88), w - 0.6, h - 1.1, lines.join('\n'), { size: 12.5, color: hot ? 'E8DCCB' : C.grey, lineSpacing: 1.45 }));
  return out;
}

/* 작동 3단계 카드 */
function step(x, y, w, num, title, lines) {
  return [
    rect(x, y, w, 2.6, { fill: C.white, radius: 0.08, line: C.line }),
    text(x + 0.34, y + 0.3, w - 0.68, 0.45, num, { size: 24, bold: true, color: C.gold }),
    text(x + 0.34, y + 0.95, w - 0.68, 0.45, title, { size: 18, bold: true, color: C.shell }),
    text(x + 0.34, y + 1.5, w - 0.68, 0.9, lines.join('\n'), { size: 13, color: C.grey, lineSpacing: 1.45 }),
  ];
}

/* 도달 계산 한 줄 */
function row(x, y, mode, time, verdict, ok) {
  const w = CW, h = 0.78;
  return [
    rect(x, y, w, h, { fill: ok ? C.white : 'F4EFE9', radius: 0.06, line: ok ? C.line : 'E3D8CB' }),
    rect(x, y, 0.09, h, { fill: ok ? C.green : 'B9A794' }),
    text(x + 0.45, y + 0.2, 2.2, 0.4, mode, { size: 16, bold: true, color: ok ? C.shell : '8D7A66' }),
    text(x + 2.7, y + 0.22, 4.4, 0.4, time, { size: 14, color: ok ? C.ink : '8D7A66' }),
    text(x + w - 4.3, y + 0.2, 4.0, 0.4, verdict, { size: 15, bold: true, color: ok ? C.green : '9B8873', align: 'right' }),
  ];
}

/* 수익 Phase 카드 */
function phase(x, y, w, tag, period, fee, lines) {
  return [
    rect(x, y, w, 3.1, { fill: C.white, radius: 0.08, line: C.line }),
    rect(x, y, w, 0.08, { fill: C.gold }),
    text(x + 0.32, y + 0.34, w - 0.64, 0.3, tag, { size: 11.5, bold: true, color: C.gold, space: 1.5 }),
    text(x + 0.32, y + 0.68, w - 0.64, 0.3, period, { size: 12.5, color: C.grey }),
    text(x + 0.32, y + 1.1, w - 0.64, 0.5, fee, { size: 17, bold: true, color: C.shell }),
    text(x + 0.32, y + 1.78, w - 0.64, 1.1, lines.join('\n'), { size: 12.5, color: C.grey, lineSpacing: 1.45 }),
  ];
}

/* 4개년 손익 표 */
function fin(x, y) {
  const labelW = 3.0, colW = (CW - labelW) / 4, rowH = 0.56, headH = 0.5;
  const years = ['1년차', '2년차', '3년차', '4년차'];
  const rows = [
    ['거래액 (GMV)', '5', '43', '202', '576'],
    ['매출', '0.3', '4.1', '22.2', '74.9'],
    ['영업손익', '-4.7', '-8.1', '+2.2', '+39.9'],
    ['누적 손익', '-4.7', '-12.8', '-10.6', '+29.3'],
  ];
  const out = [];
  const totalH = headH + rows.length * rowH;
  out.push(rect(x + labelW + colW * 2, y, colW, totalH, { fill: 'FBF3E2' }));           // 3년차 강조 열
  out.push(rect(x, y, CW, headH, { fill: C.shell, radius: 0.04 }));
  out.push(text(x + 0.28, y + 0.13, labelW, 0.3, '단위: 억 원', { size: 11.5, color: 'C9B49A' }));
  years.forEach((yr, i) => out.push(text(x + labelW + colW * i, y + 0.11, colW - 0.28, 0.32,
    yr, { size: 13, bold: true, color: i === 2 ? C.gold : C.white, align: 'right' })));
  rows.forEach((r, ri) => {
    const ry = y + headH + ri * rowH;
    out.push(rect(x, ry + rowH - 0.012, CW, 0.012, { fill: C.line }));
    out.push(text(x + 0.28, ry + 0.15, labelW - 0.3, 0.32, r[0], { size: 13.5, bold: ri >= 2, color: C.shell }));
    r.slice(1).forEach((v, i) => {
      const hot = (ri === 2 && i === 2) || (ri === 3 && i === 3);
      out.push(text(x + labelW + colW * i, ry + 0.13, colW - 0.28, 0.34, v, {
        size: hot ? 16 : 14.5, bold: hot || i === 2,
        color: hot ? C.green : (v.startsWith('-') ? '9B8873' : C.ink), align: 'right',
      }));
    });
  });
  return out;
}

/* 지표 타일 */
function kpi(x, y, w, label, value) {
  return [
    rect(x, y, w, 1.25, { fill: C.white, radius: 0.08, line: C.line }),
    text(x + 0.3, y + 0.24, w - 0.6, 0.3, label, { size: 11.5, color: C.grey }),
    text(x + 0.3, y + 0.62, w - 0.6, 0.45, value, { size: 20, bold: true, color: C.shell }),
  ];
}

/* 확장 4단계 사다리 */
function ladder(x, y) {
  const items = [
    ['1단계', '미용 · 네일 · 마사지', '1:1 슬롯 매칭 · 도달 엔진 · 선결제', false],
    ['2단계', '연극 · 영화 · 방탈출', '수량 재고와 동시성 제어', true],
    ['3단계', '숙박', '분리된 시간 재고 (마감이 자정까지)', true],
    ['4단계', '포장음식', '실시간 물리재고 · 신선도', false],
  ];
  const w = (CW - 0.3 * 3) / 4, out = [];
  items.forEach(([tag, biz, cap, big], i) => {
    const cx = x + (w + 0.3) * i, h = 3.9, top = y + (3 - i) * 0.0;
    out.push(rect(cx, top, w, h, { fill: C.white, radius: 0.08, line: C.line }));
    out.push(rect(cx, top, w, 0.08, { fill: i === 0 ? C.gold : (big ? C.shell : 'D8C6AE') }));
    out.push(text(cx + 0.3, top + 0.35, w - 0.6, 0.3, tag, { size: 11.5, bold: true, color: C.gold, space: 1.5 }));
    out.push(text(cx + 0.3, top + 0.72, w - 0.6, 0.8, biz, { size: 16.5, bold: true, color: C.shell, lineSpacing: 1.3 }));
    out.push(text(cx + 0.3, top + 1.72, w - 0.6, 0.28, '새로 배우는 역량', { size: 11, color: 'A08B77' }));
    out.push(text(cx + 0.3, top + 2.03, w - 0.6, 1.0, cap, { size: 12.5, color: C.grey, lineSpacing: 1.45 }));
    if (big) out.push(text(cx + 0.3, top + 3.35, w - 0.6, 0.3, '체인 본사 1건 = 전국', { size: 11.5, bold: true, color: C.shell }));
  });
  return out;
}

/* 지적 · 답 */
function qa(x, y, w, q, a) {
  return [
    rect(x, y, w, 1.85, { fill: C.dim, radius: 0.08, line: C.line }),
    text(x + 0.34, y + 0.26, w - 0.68, 0.75, q, { size: 15, bold: true, color: C.shell, lineSpacing: 1.32 }),
    text(x + 0.34, y + 1.12, w - 0.68, 0.65, a, { size: 12.5, color: C.grey, lineSpacing: 1.45 }),
  ];
}

/* ---------- 슬라이드 ---------- */
const S = [];
const add = (title, secs, shapes, notes) => S.push({ title, secs, shapes, notes });

/* 1 · 표지 */
add('표지', 12, [
  rect(0, 0, W, H, { fill: C.shell }),
  img(W - 5.1, 0, 5.1, H, 'app-mockup.png', { cover: true }),
  rect(W - 5.1, 0, 5.1, H, { fill: C.shell, alpha: 62 }),
  img(M, 1.62, 1.02, 1.66, 'nuts-mark-gold.png'),
  text(M, 3.5, 7.4, 1.1, '넛츠', { size: 60, bold: true, color: C.white }),
  text(M, 4.68, 7.4, 0.4, 'N O W   U N B O O K E D   T I M E   S A V E R', { size: 12, bold: true, color: C.gold, space: 1 }),
  text(M, 5.3, 7.6, 0.9, '지금, 비어 있는 예약 한 자리를\n내가 갈 수 있는 거리 안에서.', { size: 19, color: 'E8DCCB', lineSpacing: 1.45 }),
  text(M, H - 0.85, 7, 0.3, '예약 기반 서비스업 실시간 빈 슬롯 마켓플레이스   ·   2026. 09', { size: 11.5, color: 'A8927B' }),
], [
  '안녕하십니까. 넛츠입니다. /',
  '예약 서비스업에서 **안 팔리면 0원으로 사라지는 시간**을, 지금 거기 갈 수 있는 사람에게 파는 서비스입니다. /',
  '10분 동안 문제부터 숫자까지 보여드리겠습니다.',
]);

/* 2 · 문제 ① 사장님 */
add('문제 ① 사장님', 45, [
  img(0, 0, 7.9, H, 'problem-owner.png', { cover: true }),
  rect(7.9, 0, W - 7.9, H, { fill: C.shell }),
  text(8.45, 0.95, 4.4, 0.3, 'PROBLEM  01', { size: 12.5, bold: true, color: C.gold, space: 2 }),
  text(8.45, 1.42, 4.4, 1.5, '오늘 한 시 예약이\n취소됐습니다', { size: 27, bold: true, color: C.white, lineSpacing: 1.28 }),
  rect(8.45, 3.05, 1.5, 0.045, { fill: C.gold }),
  text(8.45, 3.42, 4.45, 3, [
    '예약 서비스업의 재고는 물건이 아니라 시간입니다.',
    '',
    '· 당일 취소 1건 = 그 슬롯 매출의 100% 손실',
    '· 못 판 한 시간은 내일로 넘어가지 않고 소멸',
    '· 그 사이에도 임대료 · 인건비는 그대로',
  ].join('\n'), { size: 13.5, color: 'E8DCCB', lineSpacing: 1.55 }),
  text(8.45, 6.25, 4.45, 0.6, '“안 팔리면 0원”', { size: 21, bold: true, color: C.gold }),
], [
  '여기 네일샵 사장님이 계십니다. 방금 전화를 받았습니다. **한 시 예약이 취소됐습니다.** /',
  '미용실, 네일, 마사지 같은 예약 기반 서비스업의 재고는 물건이 아니라 **시간**입니다. /',
  '팔지 못한 한 시부터 두 시는 내일로 넘길 수 없습니다. **그 자리에서 영원히 사라집니다.** /',
  '당일 취소 한 건은 그 슬롯 매출의 **100% 손실**이고, 그 시간에도 임대료와 인건비는 그대로 나갑니다. /',
  '이게 첫 번째 빈칸입니다.',
]);

/* 3 · 문제 ② 사용자 */
add('문제 ② 사용자', 35, [
  img(W - 7.9, 0, 7.9, H, 'problem-user.png', { cover: true }),
  rect(0, 0, W - 7.9, H, { fill: C.ink }),
  text(M, 0.95, 4.4, 0.3, 'PROBLEM  02', { size: 12.5, bold: true, color: C.gold, space: 2 }),
  text(M, 1.42, 4.4, 1.5, '회의가 취소돼서\n두 시간이 떴습니다', { size: 27, bold: true, color: C.white, lineSpacing: 1.28 }),
  rect(M, 3.05, 1.5, 0.045, { fill: C.gold }),
  text(M, 3.42, 4.45, 3, [
    '약속 전 30분, 늦는 친구, 취소된 회의.',
    '누구에게나 있는 “떠 있는 시간”입니다.',
    '',
    '· 지금 이 근처에서 뭘 할 수 있는지 알려주는 앱이 없다',
    '· 20~30대 즉흥형은 오늘 저녁을 오늘 오후에 정한다',
  ].join('\n'), { size: 13.5, color: 'E8DCCB', lineSpacing: 1.55 }),
  text(M, 6.25, 4.45, 0.6, '“지금 뭐 하지”', { size: 21, bold: true, color: C.gold }),
], [
  '반대편에는 이런 사람이 있습니다. 강남역, 오후 두 시. **회의가 취소돼서 두 시간이 비었습니다.** /',
  '무심코 손을 내려다봅니다. 손톱 정리를 한 게 언제였더라. /',
  '약속 전 30분, 늦는 친구, 취소된 회의 — 누구에게나 이런 **떠 있는 시간**이 있습니다. /',
  '그런데 지금 이 근처에서 무엇을 할 수 있는지 알려주는 서비스가 없습니다. **이게 두 번째 빈칸입니다.**',
]);

/* 4 · 두 개의 빈칸 */
add('두 개의 빈칸', 25, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('THE GAP', '두 사람은 걸어서 15분 거리에 있습니다'),
  text(M, 1.62, CW, 0.5, '그리고 서로의 존재를 모릅니다.', { size: 18, color: C.grey }),
  ...card(M, 2.55, 5.5, 3.1, '사장님', [
    '팔지 못하면 사라지는 한 시간',
    '',
    '할인 여력은 실제로 있다 —',
    '빈 슬롯의 한계비용은 0에 가깝다',
  ], { fill: C.white }),
  ...card(M + 5.5 + 0.63, 2.55, 5.5, 3.1, '사용자', [
    '어디로 갈지 모르는 두 시간',
    '',
    '싸서가 아니라 —',
    '“지금 나만 찾아낸 자리”를 원한다',
  ], { fill: C.white }),
  text(M, 6.0, CW, 0.6, '이 둘을 잇는 서비스가, 지금 없습니다.', { size: 20, bold: true, color: C.shell, align: 'center' }),
  ...footer(4),
], [
  '두 사람은 **서로에게 정확히 필요한 사람**입니다. 걸어서 십오 분 거리에 있는데도요. /',
  '한쪽에는 팔지 못하면 사라지는 한 시간이 있고, 다른 쪽에는 어디로 갈지 모르는 두 시간이 있습니다. /',
  '그런데 이 둘을 잇는 서비스가, **지금 없습니다.**',
]);

/* 5 · 시장의 빈칸 (2×2) */
const gx = 3.2, gy = 2.15, gw = 4.4, gh = 1.78, gap = 0.26;
add('시장의 빈칸', 60, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('MARKET GAP', '인접 서비스는 다 있습니다. 합쳐진 자리만 비어 있습니다'),
  // 축 라벨
  text(M, gy - 0.42, 2.2, 0.3, '언제 파나  ↓', { size: 11.5, bold: true, color: C.grey, space: 1 }),
  text(gx, gy - 0.42, gw * 2 + gap, 0.3, '무엇을 파나  →', { size: 11.5, bold: true, color: C.grey, space: 1 }),
  text(gx, gy, gw, 0.3, '음식', { size: 13, bold: true, color: C.grey, align: 'center' }),
  text(gx + gw + gap, gy, gw, 0.3, '서비스업 (미용 · 네일 · 마사지)', { size: 13, bold: true, color: C.shell, align: 'center' }),
  text(M, gy + 0.38 + gh / 2 - 0.34, 2.15, 0.7, '미리\n(내일 · 다음 주)', { size: 13, bold: true, color: C.grey, align: 'right', lineSpacing: 1.35 }),
  text(M, gy + gh + gap + 0.38 + gh / 2 - 0.34, 2.15, 0.7, '지금\n· 내 주변', { size: 13, bold: true, color: C.shell, align: 'right', lineSpacing: 1.35 }),
  // 4칸
  ...cell(gx, gy + 0.38, gw, gh, '배달 · 예약 주문', ['미리 시키는 음식'], { muted: true }),
  ...cell(gx + gw + gap, gy + 0.38, gw, gh, '네이버예약 · 카카오헤어샵', ['정가로 수익을 내므로', '스스로 할인을 걸 수 없다'], { muted: true }),
  ...cell(gx, gy + gh + gap + 0.38, gw, gh, '마감히어로 · 라스트오더', ['물건 재고를 세는 구조라', '예약 슬롯으로 못 넘어온다'], { muted: true }),
  ...cell(gx + gw + gap, gy + gh + gap + 0.38, gw, gh, '넛츠', ['서비스업의 빈 슬롯을', '내 주변에서, 지금'], { hot: true }),
  text(M, H - 1.0, CW, 0.4, '당근은 상시 · 내 주변이지만 거래 대상이 중고 물건이고 사업자 재고가 아닙니다.  옆으로 한 걸음 옮겨서는 아무도 올 수 없는 자리입니다.', { size: 11.5, color: C.grey }),
  ...footer(5),
], [
  '이런 서비스 이미 있지 않냐고 물으실 겁니다. **반은 맞습니다.** /',
  '**음식 떠리는 있습니다.** 마감히어로, 라스트오더. 오늘 못 팔면 버리는 음식을 싸게 넘기죠. 그런데 **음식만** 합니다. /',
  '**미용실 예약도 있습니다.** 네이버예약, 카카오헤어샵. 그런데 **내일과 다음 주**를 팝니다. 오늘 비어버린 한 시간은 아무도 안 팝니다. /',
  '**내 주변도 있습니다.** 당근이죠. 그런데 중고 물건입니다. /',
  '그래서 이 칸이 비어 있습니다. **서비스업의 빈 자리를, 내 주변에서, 지금.** /',
  '왜 비어 있을까요. 우연이 아닙니다. 음식 떠리 앱은 물건 재고를 세는 구조라 1대1 예약 슬롯을 다룰 수 없고, 예약 앱은 **정가로 먹고살아서 스스로 할인을 걸 수 없습니다.** /',
  '각자 자기 수익 구조에 묶여 있어서, **옆으로 한 걸음 옮겨서는 아무도 못 오는 자리**입니다.',
]);

/* 6 · 솔루션 */
add('솔루션', 30, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('SOLUTION', '넛츠 — 지금부터 2시간, 갈 수 있는 거리 안의 빈 자리'),
  rect(M, 1.72, CW, 0.95, { fill: C.shell, radius: 0.08 }),
  text(M + 0.4, 1.95, CW - 0.8, 0.5, '“지금, 내가 갈 수 있는 거리 안에서, 비어 있는 예약 한 자리를 채운다.”', { size: 19, bold: true, color: C.white }),
  ...step(M, 3.1, 3.63, '01', '내 위치', ['GPS로 지금 서 있는 자리']),
  ...step(M + 3.99, 3.1, 3.63, '02', '이동수단 선택', ['도보 · 자전거 · 차량']),
  ...step(M + 7.98, 3.1, 3.63, '03', '도착 가능한 것만', ['마감까지 갈 수 있는', '슬롯만 화면에 남는다']),
  text(M, 6.15, CW, 0.5, '사장님은 오늘 비어버린 한 시간을 올리고, 사용자는 지금 갈 수 있는 자리만 봅니다.', { size: 15, color: C.grey, align: 'center' }),
  ...footer(6),
], [
  '그 자리를 저희가 만들려고 합니다. 이름은 **넛츠**입니다. /',
  '**심심풀이 땅콩**이라는 말이 있죠. 심심한 시간에, 한 줌, 가볍게. 저희가 파는 게 정확히 그겁니다. /',
  '사장님은 오늘 비어버린 한 시간을 올립니다. 정가 사만 원짜리 네일 케어를 이만 사천 원에. /',
  '저는 지금 강남역에 있고 두 시간이 비었습니다. 앱을 열면 **내 주변에서 지금 바로 받을 수 있는 자리들**이 뜹니다. /',
  '그리고 이 네 글자에 저희가 하는 일이 다 들어 있습니다. Now, Unbooked, Time, Saver. **지금, 예약되지 않은 시간을 살린다.**',
]);

/* 7 · 도달 가능성 필터 ★ */
add('도달 가능성 필터', 65, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('CORE MECHANISM', '거리순 정렬이 아니라, 도착 가능성 필터'),
  text(M, 1.7, CW, 0.4, '기존 앱은 1km · 2km를 보여주고 도착 여부는 사용자가 계산합니다. 넛츠는 갈 수 있는 것만 남깁니다.', { size: 14, color: C.grey }),
  rect(M, 2.25, CW, 0.82, { fill: C.dim, radius: 0.08, line: C.line }),
  text(M, 2.47, CW, 0.4, '현재시각  +  이동시간(수단, 거리)  +  준비버퍼    ≤    예약 마감시각', { size: 17, bold: true, color: C.shell, align: 'center' }),
  text(M, 3.35, CW, 0.35, '같은 가게 · 같은 시각 — 마감까지 38분, 거리 2.5km', { size: 13, bold: true, color: C.grey }),
  ...row(M, 3.78, '도보', '43분  (이동 38 + 준비 5)', '화면에서 사라짐', false),
  ...row(M, 4.66, '자전거', '10분', '여유 23분 — 노출', true),
  ...row(M, 5.54, '차량', '18분  (주차 포함)', '노출', true),
  text(M, 6.55, CW, 0.45, '같은 자리에 서 있어도, 이동수단에 따라 완전히 다른 화면을 봅니다.', { size: 17, bold: true, color: C.shell, align: 'center' }),
  ...footer(7),
], [
  '**내 주변에 있다고 해서, 내가 정말 갈 수 있을까요.** /',
  '마감이 38분 남았는데 걸어서 40분이면, 그건 내 주변에 있어도 **없는 겁니다.** /',
  '기존 앱들은 거리순으로만 보여줍니다. 제시간에 도착할 수 있는지는 사용자가 알아서 계산해야 합니다. **넛츠는 갈 수 있는 것만 보여줍니다.** /',
  '보시죠. 마감까지 **38분**, 이 가게까지 2.5킬로입니다. /',
  '**도보**를 누르면 38분, 준비 시간까지 43분. 못 갑니다. **화면에서 사라집니다.** /',
  '**자전거**를 누르면 10분. 여유가 23분 남습니다. **보입니다.** 차량도 주차까지 18분, 보입니다. /',
  '**같은 시각, 같은 자리에 서 있어도 이동수단에 따라 완전히 다른 화면을 봅니다.** 내 주변을, 진짜 갈 수 있는 곳으로 좁혀주는 겁니다.',
]);

/* 8 · 세 가지 효과 */
add('세 가지 효과', 28, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('WHY IT WORKS', '이 작은 장치가 세 가지를 만듭니다'),
  ...card(M, 2.1, 3.63, 3.5, '헛걸음 제로', ['못 오는 사람에게는', '애초에 보여주지 않습니다.', '', '노쇼를 정책이 아니라', '화면 설계로 막습니다.']),
  ...card(M + 3.99, 2.1, 3.63, 3.5, '짧은 목록, 높은 전환', ['보이는 게 전부', '진짜 갈 수 있는 자리입니다.', '', '목록은 짧아지는데', '예약 전환율은 올라갑니다.']),
  ...card(M + 7.98, 2.1, 3.63, 3.5, '가장 비싼 트래픽', ['“지금 여기 올 수 있는 사람”', '', '광고주에게 가장 비싼', '트래픽이고, 광고 상품의', '근거가 됩니다.']),
  text(M, 6.05, CW, 0.5, '사장님 화면에서는 “마감을 15분 늦추면 47명 → 112명”. 가격이 아니라 시간을 조정하는 레버를 드립니다.', { size: 14, color: C.grey, align: 'center' }),
  ...footer(8),
], [
  '첫째, **헛걸음이 사라집니다.** 못 오는 사람에게는 애초에 안 보여주니까요. 노쇼를 정책이 아니라 **화면 설계로** 막는 겁니다. /',
  '둘째, 목록은 짧아지는데 **예약 전환율은 올라갑니다.** 보이는 게 전부 진짜 갈 수 있는 것이니까요. /',
  '셋째, **지금 여기 올 수 있는 사람**은 광고주에게 가장 비싼 트래픽입니다. 광고 상품의 근거가 여기서 생깁니다. /',
  '사장님 화면에는 이렇게 뜹니다. 이 슬롯을 지금 볼 수 있는 사람 47명. **마감을 15분만 늦추면 112명.** 가격을 깎으라고 하지 않고 시간을 조정하라고 합니다.',
]);

/* 9 · 타깃 */
add('타깃', 30, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('TARGET', '누구의 시간을 다루는가'),
  ...card(M, 2.0, 5.5, 3.6, '수요자 — 20~30대 즉흥형', [
    '· 오늘 저녁을 오늘 오후에 정하는 사람',
    '· 계획형은 우리 고객이 아닙니다.',
    '  그들에겐 기존 예약앱으로 충분합니다',
    '',
    '핵심 정서는 가격이 아니라',
    '“지금 나만 찾아낸 자리”라는 발견의 재미',
  ]),
  ...card(M + 6.13, 2.0, 5.5, 3.6, '공급자 — 예약 기반 소상공인', [
    '· 당일 취소로 생긴 빈 시간을',
    '  틈새 매출로 바꾸고 싶은 사장님',
    '· 빈 슬롯의 한계비용은 0에 가깝다',
    '  → 할인 여력이 실제로 존재',
    '',
    '할인 체험은 광고비를 매출로 받는 셈',
  ]),
  text(M, 6.0, CW, 0.5, '1단계는 미용실 · 네일 · 마사지. 재고가 항상 하나고 썩지 않아, 시간 재고 중 가장 다루기 쉽습니다.', { size: 14, color: C.grey, align: 'center' }),
  ...footer(9),
], [
  '저희 고객은 **계획을 미리 세우지 않는 20~30대**입니다. 오늘 저녁을 오늘 오후에 정하는 사람들이죠. /',
  '계획형은 우리 고객이 아닙니다. 그분들은 기존 예약앱으로 충분합니다. /',
  '이 고객이 반응하는 건 가격이 아니라 **“지금 나만 찾아낸 자리”라는 발견의 재미**입니다. /',
  '공급자는 예약 기반 소상공인입니다. 빈 슬롯의 한계비용은 0에 가까워서 **할인 여력이 실제로 존재**하고, 할인 체험은 결국 **광고비를 매출로 받는 셈**입니다.',
]);

/* 10 · 비즈니스 모델 */
add('비즈니스 모델', 45, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('BUSINESS MODEL', '수수료는 첫날부터 받습니다'),
  rect(M, 1.72, CW, 0.78, { fill: C.dim, radius: 0.08, line: C.line }),
  text(M + 0.35, 1.9, CW - 0.7, 0.45, '사장님이 비교하는 건 정가가 아니라 0원입니다. 안 팔리면 0원인 슬롯에서 받는 10%는 뺏는 게 아니라 나누는 겁니다.', { size: 14.5, bold: true, color: C.shell }),
  ...phase(M, 2.75, 3.63, 'PHASE 1', '0~12개월', '거래 수수료 10%', ['첫 3개월 0% 프로모션', '빈 슬롯의 대안은 0원이라', '저항이 구조적으로 낮다']),
  ...phase(M + 3.99, 2.75, 3.63, 'PHASE 2', '13~24개월', '수수료 12% + 광고', ['밀도 확보 후', '도달반경 내 상위 노출권 판매']),
  ...phase(M + 7.98, 2.75, 3.63, 'PHASE 3', '25개월~', '+ 넛츠페이', ['결제 수수료 · 예치금 운용', '그리고 락인 효과']),
  text(M, 6.15, CW, 0.5, 'PG 수수료 2.5%p를 뺀 실질 수익률 — 1년차 6% · 2년차 9.5% · 3년차 11% · 4년차 13%', { size: 13.5, color: C.grey, align: 'center' }),
  ...footer(10),
], [
  '**수수료는 첫날부터 받습니다.** 당근은 못 받았죠. 중고 직거래에는 우리를 지나가는 돈이 없으니까요. 넛츠는 선결제라 돈이 지나갑니다. /',
  '그리고 더 중요한 게 있습니다. **사장님이 비교하는 건 정가가 아니라 0원입니다.** 안 팔리면 0원인 슬롯에서 받는 10%는 뺏는 게 아니라 나누는 겁니다. /',
  '1년차는 수수료 10%, 첫 3개월은 0%로 공급을 모읍니다. /',
  '2년차에 밀도가 붙으면 12%에 **광고**를 얹습니다. 도달반경 안의 상위 노출권이라 근거가 분명합니다. /',
  '3년차부터는 **넛츠페이**로 결제 수수료와 예치금, 그리고 락인까지 가져갑니다.',
]);

/* 11 · 재무 */
add('재무', 50, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('FINANCIALS', '3년차에 흑자로 돌아섭니다'),
  text(M, 1.68, CW, 0.32, '가정값입니다. 롯데 내부 데이터로 검증 후 확정합니다', { size: 11.5, color: C.grey }),
  ...fin(M, 2.12),
  ...kpi(M, 5.5, 3.63, '연 단위 흑자 전환', '3년차'),
  ...kpi(M + 3.99, 5.5, 3.63, '필요 투자액 (최대 누적 적자)', '약 13억'),
  ...kpi(M + 7.98, 5.5, 3.63, '누적 회수', '4년차 상반기'),
  ...footer(11),
], [
  '숫자를 보시겠습니다. /',
  '1년차는 강남구에서 입점 400개, 거래액 5억, 매출 3천만 원. 거의 없는 거나 마찬가지입니다. /',
  '2년차에 서울 다섯 개 구로 넓히면 거래액 43억, 매출 4억. /',
  '**3년차에 흑자로 돌아섭니다.** 숙박까지 올라가 거래액 200억, 매출 22억, 영업이익 2억. /',
  '4년차는 매출 75억에 영업이익 40억입니다. /',
  '**최대 누적 적자가 13억이니 필요한 투자도 그 정도고, 4년차 상반기에 회수됩니다.** 모두 가정값이고, 내부 데이터로 검증할 항목은 따로 표시해 두었습니다.',
]);

/* 12 · 확장 */
add('확장', 40, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('EXPANSION', '한 번에 한 가지 역량만 더합니다'),
  ...ladder(M, 1.95),
  text(M, 6.15, CW, 0.5, '2단계부터는 상대가 대기업입니다. 영화관 체인 한 곳이면 전국 수백 개 관의 빈 좌석이 한 번에 열립니다.', { size: 14.5, bold: true, color: C.shell, align: 'center' }),
  ...footer(12),
], [
  '확장은 네 단계입니다. /',
  '지금은 **예약 기반 서비스업**입니다. 재고가 항상 하나고 썩지 않아서, 시간 재고 중에 가장 다루기 쉽습니다. 여기서 엔진을 완성합니다. /',
  '다음이 **문화** — 연극, 영화, 방탈출. 전부 예약이고 오늘 지나면 사라집니다. 새로 배우는 건 좌석이라는 **수량** 하나뿐입니다. /',
  '그다음 **숙박**, 마지막이 **포장음식**입니다. 사회적 가치는 가장 큰데 실시간 재고 관리가 가장 어려워서 맨 뒤입니다. /',
  '그리고 **2단계부터는 상대가 대기업입니다.** 체인 한 곳이면 전국 수백 개 관의 빈 좌석이 한 번에 열립니다.',
]);

/* 13 · 운영 원칙과 리스크 */
add('운영 · 리스크', 40, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('EXECUTION', '운영 3원칙, 그리고 가장 많이 받은 지적 둘'),
  ...card(M, 1.95, 3.63, 2.55, '① 강남구 한 곳', ['밀도가 곧 매칭률입니다.', '백 개를 전국에 흩뿌리면 실패하고,', '강남구에 몰면 작동합니다.']),
  ...card(M + 3.99, 1.95, 3.63, 2.55, '② 선결제 의무', ['크게 할인해준 사장님에게', '노쇼는 재앙이니까요.', '필터와 함께 이중 방어입니다.']),
  ...card(M + 7.98, 1.95, 3.63, 2.55, '③ 단골에게는 안 보임', ['단골이 정가를 안 내는 순간', '사장님은 떠납니다.', '할인 채널이 아니라 신규 채널.']),
  ...qa(M, 4.85, 5.5, '“빈 슬롯 파는 가게면\n안 되는 가게 아닌가?”', '초기 100개는 직접 심사합니다. 떨이가 아니라 첫 방문 체험 슬롯입니다.'),
  ...qa(M + 6.13, 4.85, 5.5, '“강남구 안이면 자전거로\n어차피 다 가지 않나?”', '맞습니다. 그래서 이건 거리 제한이 아니라 도착 보증이고, 넓어질수록 강해집니다.'),
  ...footer(13),
], [
  '운영은 세 가지 원칙으로 갑니다. **강남구 한 곳**에서만 시작하고, **선결제를 의무화**하고, **그 가게의 단골에게는 할인 슬롯을 보여주지 않습니다.** /',
  '밀도가 곧 매칭률이고, 단골이 정가를 안 내게 되는 순간 사장님은 떠나니까요. 이건 할인 채널이 아니라 **신규 고객 채널**입니다. /',
  '가장 많이 받은 지적 두 가지도 미리 말씀드리겠습니다. /',
  '하나, 빈 슬롯을 파는 가게는 안 되는 가게 아니냐. 그래서 초기 백 개는 저희가 **직접 심사**합니다. **첫 방문 체험 슬롯**입니다. /',
  '둘, 강남구 안에서는 자전거면 다 가지 않냐. 맞습니다. 그래서 이 기능은 거리 제한이 아니라 **도착 보증**이고, **서울 전역으로 넓어질수록 강해집니다.**',
]);

/* 14 · 앱 화면 */
add('앱 화면', 35, [
  rect(0, 0, W, H, { fill: C.shell }),
  img(W - 7.35, 0.62, 6.26, 6.26, 'app-mockup.png'),
  text(M, 0.95, 4.9, 0.3, 'PRODUCT', { size: 12.5, bold: true, color: C.gold, space: 2 }),
  text(M, 1.4, 4.9, 1.0, '만들고 있는 화면', { size: 30, bold: true, color: C.white }),
  text(M, 2.55, 4.9, 3.6, [
    '· 홈 — 지금 갈 수 있는 예약만 뜹니다',
    '',
    '· 지도 — 도보 · 자전거 · 차량 토글이',
    '  결과를 그대로 바꿉니다',
    '',
    '· 상세 — 마감 시각, 정가 대비 할인,',
    '  그리고 “지금 갈 수 있어요”',
  ].join('\n'), { size: 14, color: 'E8DCCB', lineSpacing: 1.5 }),
  text(M, 6.15, 4.9, 0.5, '심심할 땐, 넛츠.', { size: 21, bold: true, color: C.gold }),
], [
  '실제 화면입니다. /',
  '홈에는 **지금 갈 수 있는 예약만** 뜹니다. 지도에서 도보, 자전거, 차량을 바꾸면 결과가 그대로 바뀝니다. /',
  '상세 화면에는 마감 시각과 정가 대비 할인, 그리고 **“지금 갈 수 있어요”** 한 줄이 붙습니다. /',
  '사용자가 보는 건 목록이 아니라 **갈 수 있다는 확신**입니다.',
]);

/* 15 · 요청과 클로징 */
add('요청 · 클로징', 40, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('ASK', '저희가 보는 지표는 하나입니다'),
  rect(M, 1.75, CW, 1.35, { fill: C.shell, radius: 0.08 }),
  text(M + 0.45, 1.98, CW - 0.9, 0.45, 'NORTH STAR', { size: 12, bold: true, color: C.gold, space: 2 }),
  text(M + 0.45, 2.38, CW - 0.9, 0.6, '채워진 슬롯 수  —  그냥 사라졌을 시간 중 매출로 바뀐 시간의 총량', { size: 19, bold: true, color: C.white }),
  ...card(M, 3.4, 5.5, 1.85, '강남구에서의 여섯 달', ['밀도가 만들어지는지 확인하는 기간']),
  ...card(M + 6.13, 3.4, 5.5, 1.85, '첫 대형 파트너 한 곳', ['2단계의 문을 열어줄 체인']),
  rect(M, 5.65, CW, 1.1, { fill: C.dim, radius: 0.08, line: C.line }),
  text(M, 5.93, CW, 0.55, '넛츠는 할인 앱이 아닙니다. 버려지는 시간을 거래 가능하게 만드는 인프라입니다.', { size: 18, bold: true, color: C.shell, align: 'center' }),
  ...footer(15),
], [
  '저희가 보는 지표는 하나입니다. **채워진 슬롯 수.** 그냥 사라졌을 시간 중에 매출로 바뀐 시간의 총량입니다. /',
  '그래서 필요한 것도 두 가지뿐입니다. **강남구에서의 여섯 달**, 그리고 2단계에서 문을 열어줄 **첫 대형 파트너 한 곳.** /',
  '처음의 두 사람으로 돌아가겠습니다. 반차를 낸 사람은 자전거를 고르고, **12분 거리에 뜬 한 자리**를 예약합니다. 그 시간, 취소 전화를 받았던 사장님의 한 시간이 채워집니다. /',
  '두 사람은 여전히 서로를 몰랐습니다. **저희가 그걸 알고 있었을 뿐입니다.** /',
  '넛츠는 할인 앱이 아닙니다. **버려지는 시간을 거래 가능하게 만드는 인프라입니다.** 감사합니다.',
]);

module.exports = { W, H, M, CW, C, S, rect, text, img, head, footer, card };


