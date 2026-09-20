/* 넛츠 IR 덱 — 내용과 배치를 한 곳에 두고, build.js(PPTX)와 preview.js(PNG)가 같은 걸 읽는다.
   구성은 IR 표준 템플릿 순서를 따른다:
   First page · Problem · Solution(2) · Market(2) · Business model · Traction · KPI/Roadmap
   · Team · Ask · Last page  (+ 백업 1장)

   2026-09 개정 — 발표본은 10장이다. 트랙션 · 팀 · 요청 · 백업, 그리고 구 비즈니스 모델 한 장은
   지운 게 아니라 `{ off: true }` 로 빼 두었다. 다시 쓰려면 그 한 줄만 지우면 된다.
   쪽번호는 발표본 순서대로 자동으로 다시 매겨진다. */
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

/* 원 (모서리 반지름을 절반으로 준 사각형) */
const disc = (cx, cy, d, fill) => rect(cx - d / 2, cy - d / 2, d, d, { fill, radius: d / 2 });

function head(eyebrow, title, o = {}) {
  const col = o.color || C.shell, sub = o.eyebrowColor || C.gold;
  const out = [];
  if (eyebrow) out.push(text(M, 0.42, CW, 0.3, eyebrow, { size: 12.5, bold: true, color: sub, space: 2 }));
  out.push(text(M, 0.78, o.tw || CW, 0.75, title, { size: o.size || 30, bold: true, color: col }));
  return out;
}
const footer = (o = {}) => [
  text(M, H - 0.52, 4.2, 0.3, '심심할 땐, 넛츠  NUTS', { size: 9.5, color: o.color || C.grey, space: 1.5 }),
  /* pageNum 은 발표본 순서가 확정된 뒤 파일 끝에서 채워 넣는다 */
  { ...text(W - M - 1.4, H - 0.52, 1.4, 0.3, '', { size: 9.5, color: o.color || C.grey, align: 'right' }), pageNum: true },
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

/* 지적 · 답 */
function qa(x, y, w, q, a) {
  return [
    rect(x, y, w, 1.85, { fill: C.dim, radius: 0.08, line: C.line }),
    text(x + 0.34, y + 0.26, w - 0.68, 0.75, q, { size: 15, bold: true, color: C.shell, lineSpacing: 1.32 }),
    text(x + 0.34, y + 1.12, w - 0.68, 0.65, a, { size: 12.5, color: C.grey, lineSpacing: 1.45 }),
  ];
}

/* 지표 타일 */
function kpi(x, y, w, label, value, o = {}) {
  const hot = !!o.hot;
  return [
    rect(x, y, w, 1.25, { fill: hot ? C.dim : C.white, radius: 0.08, line: hot ? C.gold : C.line, lineW: hot ? 2 : 1 }),
    text(x + 0.3, y + 0.24, w - 0.6, 0.3, label, { size: 11.5, color: C.grey }),
    text(x + 0.3, y + 0.6, w - 0.6, 0.5, value, { size: o.size || 18, bold: true, color: C.shell, lineSpacing: 1.25 }),
  ];
}

/* 세로 흐름 도식의 한 칸 */
function node(x, y, w, h, tag, body, o = {}) {
  const dark = !!o.dark;
  return [
    rect(x, y, w, h, { fill: dark ? C.shell : C.white, radius: 0.08, line: dark ? C.shell : C.line }),
    text(x + 0.32, y + 0.2, w - 0.64, 0.3, tag, { size: 12, bold: true, color: C.gold, space: 1 }),
    text(x + 0.32, y + 0.54, w - 0.64, h - 0.7, body, { size: 13, color: dark ? 'E8DCCB' : C.grey, lineSpacing: 1.4 }),
  ];
}
/* 아래로 내려가는 화살표 + 라벨 */
function down(cx, y, h, label) {
  return [
    rect(cx - 0.025, y, 0.05, h, { fill: C.gold }),
    rect(cx - 0.11, y + h - 0.14, 0.22, 0.14, { fill: C.gold, radius: 0.06 }),
    text(cx + 0.24, y + h / 2 - 0.16, 3.4, 0.3, label, { size: 11.5, color: C.grey }),
  ];
}
/* 어두운 판 위의 작은 칩 */
function chip(x, y, w, h, title, body) {
  return [
    rect(x, y, w, h, { fill: '4E3320', radius: 0.06 }),
    text(x + 0.18, y + 0.14, w - 0.36, 0.3, title, { size: 12.5, bold: true, color: C.white }),
    text(x + 0.18, y + 0.45, w - 0.36, h - 0.55, body, { size: 10.5, color: 'C9B49A', lineSpacing: 1.35 }),
  ];
}

/* 코어 메커니즘 6단계 중 한 칸 */
function mech(x, y, w, h, num, title, body) {
  return [
    rect(x, y, w, h, { fill: C.white, radius: 0.08, line: C.line }),
    rect(x, y, w, 0.07, { fill: C.gold }),
    text(x + 0.26, y + 0.3, w - 0.52, 0.34, num, { size: 18, bold: true, color: C.gold }),
    text(x + 0.26, y + 0.74, w - 0.52, 0.62, title, { size: 13.5, bold: true, color: C.shell, lineSpacing: 1.28 }),
    text(x + 0.26, y + 1.42, w - 0.52, h - 1.6, body, { size: 11, color: C.grey, lineSpacing: 1.42 }),
  ];
}

/* 포지셔닝 맵의 점 하나 */
function plot(cx, cy, label, o = {}) {
  const hot = !!o.hot, d = hot ? 0.34 : 0.17;
  const out = [disc(cx, cy, d, hot ? C.gold : 'B9A794')];
  out.push(text(cx - 1.35, cy + (hot ? 0.28 : 0.16), 2.7, 0.3, label, {
    size: hot ? 16 : 11.5, bold: true, color: hot ? C.shell : C.grey, align: 'center',
  }));
  if (o.note) out.push(text(cx - 1.35, cy + 0.58, 2.7, 0.28, o.note, { size: 10.5, color: C.gold, align: 'center' }));
  return out;
}

/* 비교 한 줄 */
function compare(x, y, w, h, name, body, o = {}) {
  const hot = !!o.hot;
  return [
    rect(x, y, w, h, { fill: hot ? C.shell : C.white, radius: 0.08, line: hot ? C.shell : C.line }),
    text(x + 0.28, y + 0.16, w - 0.56, 0.3, name, { size: 13, bold: true, color: hot ? C.gold : C.shell }),
    text(x + 0.28, y + 0.47, w - 0.56, h - 0.6, body, { size: 11, color: hot ? 'E8DCCB' : C.grey, lineSpacing: 1.35 }),
  ];
}

/* 제목 한 줄 + 본문 한 줄짜리 낮은 카드 */
function reason(x, y, w, h, title, body, o = {}) {
  return [
    rect(x, y, w, h, { fill: o.fill || C.white, radius: 0.08, line: o.line || C.line }),
    text(x + 0.3, y + 0.18, w - 0.6, 0.3, title, { size: o.titleSize || 14, bold: true, color: C.shell }),
    text(x + 0.3, y + 0.54, w - 0.6, h - 0.68, body, { size: o.size || 11.5, color: C.grey, lineSpacing: 1.5 }),
  ];
}

/* TAM · SAM · SOM 한 줄 */
function size3(x, y, w, tag, title, value, note, ratio, o = {}) {
  const hot = !!o.hot, h = 1.25;
  return [
    rect(x, y, w, h, { fill: hot ? C.dim : C.white, radius: 0.08, line: hot ? C.gold : C.line, lineW: hot ? 2 : 1 }),
    rect(x + 0.28, y + 0.22, 1.05, 0.3, { fill: hot ? C.gold : C.shell, radius: 0.05 }),
    text(x + 0.28, y + 0.27, 1.05, 0.25, tag, { size: 10.5, bold: true, color: hot ? C.shell : C.white, align: 'center' }),
    text(x + 1.48, y + 0.24, w - 3.4, 0.28, title, { size: 11.5, bold: true, color: C.shell }),
    text(x + w - 1.75, y + 0.16, 1.47, 0.4, value, { size: 17, bold: true, color: hot ? C.shell : C.ink, align: 'right' }),
    text(x + 0.28, y + 0.6, w - 0.56, 0.3, note, { size: 10.5, color: C.grey }),
    rect(x + 0.28, y + 0.94, w - 0.56, 0.14, { fill: C.line }),
    rect(x + 0.28, y + 0.94, (w - 0.56) * ratio, 0.14, { fill: hot ? C.gold : '9B8873' }),
  ];
}

/* 투자금 사용처 막대 */
function useBar(x, y, w, label, amount, ratio) {
  return [
    text(x, y, w - 1.9, 0.3, label, { size: 12.5, bold: true, color: C.shell }),
    text(x + w - 1.9, y, 1.9, 0.3, amount, { size: 12.5, bold: true, color: C.gold, align: 'right' }),
    rect(x, y + 0.33, w, 0.13, { fill: C.line }),
    rect(x, y + 0.33, w * ratio, 0.13, { fill: C.gold }),
  ];
}

/* 수익화 단계 한 칸 */
function phase(x, y, w, h, tag, when, title, lines, o = {}) {
  const hot = !!o.hot;
  return [
    rect(x, y, w, h, { fill: C.white, radius: 0.08, line: hot ? C.gold : C.line, lineW: hot ? 2 : 1 }),
    rect(x, y, w, 0.08, { fill: hot ? C.gold : C.shell }),
    text(x + 0.3, y + 0.3, w - 0.6, 0.28, tag, { size: 11.5, bold: true, color: C.gold, space: 1.5 }),
    text(x + 0.3, y + 0.62, w - 0.6, 0.28, when, { size: 11, color: C.grey }),
    text(x + 0.3, y + 1.0, w - 0.6, 0.45, title, { size: 18, bold: true, color: C.shell }),
    text(x + 0.3, y + 1.62, w - 0.6, h - 1.82, lines.join('\n'), { size: 11.5, color: C.grey, lineSpacing: 1.5 }),
  ];
}

/* 팀 카드 — MBTI 의 P 를 크게 */
function member(x, y, w, h, name, mbtiCode, role) {
  const pre = mbtiCode.slice(0, 3);
  return [
    rect(x, y, w, h, { fill: C.white, radius: 0.08, line: C.line }),
    rect(x + 0.3, y + 0.34, 0.92, 0.92, { fill: C.dim, radius: 0.46, line: C.line }),
    text(x + 0.3, y + 0.71, 0.92, 0.25, '사진', { size: 10, color: 'A08B77', align: 'center' }),
    text(x + 1.42, y + 0.32, w - 1.72, 0.4, name, { size: 18, bold: true, color: C.shell }),
    /* EST / P — 두 상자를 붙여 P 만 크게 */
    text(x + 1.42, y + 0.88, 1.02, 0.4, pre, { size: 20, bold: true, color: '9B8873', align: 'right' }),
    text(x + 2.46, y + 0.72, 0.7, 0.62, 'P', { size: 36, bold: true, color: C.gold }),
    text(x + 0.3, y + h - 0.45, w - 0.6, 0.3, role, { size: 10.5, color: C.grey }),
  ];
}

/* ---------- 슬라이드 ---------- */
const ALL = [];
const add = (title, secs, shapes, notes, o = {}) => ALL.push({ title, secs, shapes, notes, off: !!o.off });

/* 1 · 표지 (First page) */
add('표지', 20, [
  rect(0, 0, W, H, { fill: C.shell }),
  img(W - 5.1, 0, 5.1, H, 'app-mockup.png', { cover: true }),
  rect(W - 5.1, 0, 5.1, H, { fill: C.shell, alpha: 62 }),
  img(M, 1.62, 1.02, 1.66, 'nuts-mark-gold.png'),
  text(M, 3.5, 7.4, 1.1, '넛츠', { size: 60, bold: true, color: C.white }),
  text(M, 4.68, 7.4, 0.4, 'N O W   U N B O O K E D   T I M E   S A V E R', { size: 12, bold: true, color: C.gold, space: 1 }),
  text(M, 5.3, 7.6, 0.9, '지금, 비어 있는 예약 한 자리를\n내가 갈 수 있는 거리 안에서.', { size: 19, color: 'E8DCCB', lineSpacing: 1.45 }),
  text(M, H - 0.85, 7, 0.3, '실시간 빈 자리 마켓플레이스', { size: 11.5, color: 'A8927B' }),
], [
  '안녕하십니까. 넛츠입니다. /',
  '예약 서비스업에서 **안 팔리면 0원으로 사라지는 시간**을, 지금 거기 갈 수 있는 사람에게 파는 서비스입니다. /',
  '문제부터 숫자까지 보여드리겠습니다.',
]);

/* 2 · Problem — 사장님과 사용자를 한 장에 */
add('문제 — 두 개의 빈칸', 60, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('PROBLEM', '두 사람은 걸어서 15분 거리에 있습니다'),
  text(M, 1.42, CW, 0.35, '한쪽엔 팔지 못하면 사라지는 한 시간, 다른 쪽엔 어디로 갈지 모르는 두 시간 — 그런데 서로의 존재를 모릅니다.', { size: 14, color: C.grey }),

  /* 왼쪽 — 사장님 */
  img(M, 1.92, 5.5, 2.5, 'problem-owner.png', { cover: true }),
  text(M, 4.55, 5.5, 0.3, '사장님', { size: 11.5, bold: true, color: C.gold, space: 1.5 }),
  text(M, 4.88, 5.5, 0.45, '“안 팔리면 0원”', { size: 20, bold: true, color: C.shell }),
  text(M, 5.42, 5.5, 0.85, [
    '· 오늘 한 시 예약 취소 = 그 슬롯 매출의 100% 손실',
    '· 못 판 한 시간은 내일로 넘어가지 않고 소멸',
    '· 그 사이에도 임대료 · 인건비는 그대로',
  ].join('\n'), { size: 12, color: C.grey, lineSpacing: 1.5 }),

  /* 오른쪽 — 사용자 */
  img(M + 6.13, 1.92, 5.5, 2.5, 'problem-user.png', { cover: true }),
  text(M + 6.13, 4.55, 5.5, 0.3, '사용자', { size: 11.5, bold: true, color: C.gold, space: 1.5 }),
  text(M + 6.13, 4.88, 5.5, 0.45, '“지금 뭐 하지”', { size: 20, bold: true, color: C.shell }),
  text(M + 6.13, 5.42, 5.5, 0.85, [
    '· 약속 전 30분, 늦는 친구, 취소된 회의 — 떠 있는 시간',
    '· 지금 이 근처에서 뭘 할 수 있는지 알려주는 앱이 없다',
    '· 20~30대 즉흥형은 오늘 저녁을 오늘 오후에 정한다',
  ].join('\n'), { size: 12, color: C.grey, lineSpacing: 1.5 }),

  text(M, 6.42, CW, 0.4, '이 둘을 잇는 서비스가, 지금 없습니다.', { size: 18, bold: true, color: C.shell, align: 'center' }),
  ...footer(),
], [
  '문제는 양쪽에 동시에 있습니다. /',
  '왼쪽, **네일샵 사장님**입니다. 방금 전화를 받았습니다. 오늘 한 시 예약이 취소됐습니다. /',
  '예약 기반 서비스업의 재고는 물건이 아니라 **시간**입니다. 팔지 못한 한 시부터 두 시는 내일로 넘길 수 없습니다. **그 자리에서 영원히 사라집니다.** /',
  '당일 취소 한 건은 그 슬롯 매출의 **100% 손실**이고, 그 시간에도 임대료와 인건비는 그대로 나갑니다. /',
  '오른쪽, **강남역 오후 두 시**입니다. 회의가 취소돼서 시간이 비었습니다. 무심코 손을 내려다봅니다. 손톱 정리를 한 게 언제였더라. /',
  '약속 전 30분, 늦는 친구, 취소된 회의 — 누구에게나 이런 **떠 있는 시간**이 있습니다. 그런데 지금 이 근처에서 무엇을 할 수 있는지 알려주는 서비스가 없습니다. /',
  '두 사람은 걸어서 십오 분 거리에 있습니다. **서로에게 정확히 필요한 사람인데, 서로의 존재를 모릅니다.** /',
  '수요가 없는 게 아닙니다. **이 둘을 잇는 서비스가 없는 겁니다.**',
]);

/* 3 · Solution — 도식 + 앱 화면 한 장 */
add('솔루션', 45, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('SOLUTION', '넛츠 — 지금부터 1시간, 갈 수 있는 거리 안의 빈 자리'),
  text(M, 1.42, CW, 0.35, '사장님과 사용자 사이에 넛츠가 섭니다. 오른쪽이 사용자가 보는 화면입니다.', { size: 14, color: C.grey }),

  ...node(M, 1.82, 6.6, 0.88, '사장님', '오늘 비어버린 한 시간을 올립니다  ·  정가 4만 원 → 2만 4천 원'),
  ...down(M + 3.3, 2.78, 0.44, '빈 자리 등록'),

  ...node(M, 3.28, 6.6, 2.18, '넛츠  —  두 사람 사이', '', { dark: true }),
  ...chip(M + 0.3, 3.76, 1.86, 1.16, '실시간 가격', '마감까지 남은\n시간과 수요 밀도로\n값을 다시 매깁니다'),
  ...chip(M + 2.37, 3.76, 1.86, 1.16, '도달 가능성 필터', '1시간 안에 갈 수\n있는 사람에게만\n보입니다'),
  ...chip(M + 4.44, 3.76, 1.86, 1.16, '즉시 선결제', '노쇼를 막고\n사장님 매출을\n확정합니다'),
  text(M + 0.3, 5.04, 6.0, 0.28, '도달 가능성 필터 — 도보 · 자전거 · 차량 소요시간에 따라 계산', { size: 10.5, color: C.gold }),

  ...down(M + 3.3, 5.54, 0.42, '갈 수 있는 사람에게만 노출'),
  ...node(M, 6.02, 6.6, 0.86, '사용자', '지금 한 시간이 빈 사람 — 싸게, 바로 갑니다'),

  img(8.0, 1.9, 4.48, 4.48, 'app-mockup.png'),
  text(8.0, 6.46, 4.48, 0.32, '홈 · 지도 · 상세 — 지금 갈 수 있는 자리만 남습니다', { size: 11.5, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '그 사이에 저희가 섭니다. 이름은 **넛츠**입니다. 심심풀이 땅콩 — 심심한 시간에, 한 줌, 가볍게. /',
  '사장님은 오늘 비어버린 한 시간을 올립니다. 정가 사만 원짜리 네일 케어를 이만 사천 원에. /',
  '가운데에서 저희가 세 가지를 합니다. **마감까지 남은 시간으로 값을 다시 매기고, 지금 갈 수 있는 사람만 걸러내고, 즉시 결제를 받습니다.** /',
  '가운데 필터는 짧게만 말씀드리겠습니다. 현재시각에 이동시간과 준비 시간을 더해서 **마감 전에 도착 가능한 것만** 남깁니다. 도보냐 자전거냐에 따라 같은 자리에 서 있어도 다른 화면을 봅니다. 중요한 장치지만 **저희 코어는 아닙니다.** /',
  '**코어는 비어 있는 시간을 지금 예약하게 만드는 것**이고, 그 구조는 다음 장입니다. /',
  '오른쪽이 사용자가 보는 화면입니다. 홈에는 지금 갈 수 있는 예약만 뜨고, 상세에는 마감 시각과 정가 대비 할인, 그리고 “지금 갈 수 있어요” 한 줄이 붙습니다.',
]);

/* 4 · Solution ② — 코어 메커니즘 */
add('코어 메커니즘', 20, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('CORE MECHANISM', '빈 시간을 지.금. 예약하게 만드는 것입니다'),
  text(M, 1.42, CW, 0.35, '중심 엔진은 다이나믹 프라이싱이고, 도달 가능성은 값이 붙은 슬롯을 실제로 살 수 있는 사람에게 잇는 필터입니다.', { size: 14, color: C.grey }),

  ...mech(M + 0 * 1.9755, 1.95, 1.7555, 2.35, '01', '빈 자리 발생', '당일 취소 · 비수요 시간대 · 예약 공백'),
  ...mech(M + 1 * 1.9755, 1.95, 1.7555, 2.35, '02', '플랫폼 노출', '시간이 지나면 이 슬롯은 0원이 된다'),
  ...mech(M + 2 * 1.9755, 1.95, 1.7555, 2.35, '03', '가격 조정', '남은 시간 · 수요 밀도 · 할인율로 재설정'),
  ...mech(M + 3 * 1.9755, 1.95, 1.7555, 2.35, '04', '고객이 탐색', '실제 갈 수 있는 사람에게만 보여줌'),
  ...mech(M + 4 * 1.9755, 1.95, 1.7555, 2.35, '05', '즉시 선결제', '노쇼를 줄이고 사장님 매출 확정'),
  ...mech(M + 5 * 1.9755, 1.95, 1.7555, 2.35, '06', '재방문 전환', '할인 체험을\n정가 고객으로 전환'),

  rect(M, 4.62, CW, 1.18, { fill: C.shell, radius: 0.08 }),
  text(M + 0.5, 4.86, CW - 1.0, 0.75, '넛츠는 서비스업의 버려질 수 있는 시간을 실시간으로 가격화하고,\n즉시 구매 가능한 고객에게 연결하는 서비스형 다이나믹 프라이싱 플랫폼입니다.', { size: 15.5, bold: true, color: C.white, align: 'center', lineSpacing: 1.45 }),

  text(M, 6.15, CW, 0.4, '빈 시간은 재고가 아닙니다. 마감이 정해져 있고, 지나가면 0원이 되는 상품입니다.', { size: 15, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '코어 메커니즘은 여섯 단계입니다. /',
  '빈 슬롯이 생기고, 소멸이 임박했다고 판단하고, **가격을 다시 매기고**, 갈 수 있는 사람에게만 노출하고, 즉시 선결제를 받고, 재방문으로 전환합니다. /',
  '중심 엔진은 **다이나믹 프라이싱**이고, 도달 가능성은 그 값이 붙은 슬롯을 **실제로 살 수 있는 사람에게 잇는 필터**입니다. /',
  '한 문장으로 하면 이겁니다. **비어 있는 시간 슬롯을 실시간으로 가격화해서, 지금 살 수 있는 고객에게 연결하는 서비스형 다이나믹 프라이싱 플랫폼.**',
]);

/* 5 · Market ① — 포지셔닝 맵 */
add('포지셔닝 맵', 20, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('MARKET · POSITIONING', '위치 기반 앱은 다 있습니다. 합쳐진 자리만 비어 있습니다'),
  text(M, 1.42, CW, 0.35, '가로축: 무엇을 파는가 (물건·음식 ↔ 서비스업의 시간)   ·   세로축: 언제 파는가 (미리 ↔ 지금·내 주변)', { size: 12.5, color: C.grey }),

  /* 맵 판 */
  rect(M, 1.95, 7.55, 4.35, { fill: C.white, radius: 0.08, line: C.line }),
  rect(4.625, 2.05, 3.72, 2.02, { fill: 'FBF3E2' }),
  text(4.78, 2.16, 3.4, 0.28, '아무도 없는 칸', { size: 11, bold: true, color: C.gold }),
  rect(M + 0.15, 4.115, 7.25, 0.02, { fill: 'E3D8CB' }),
  rect(4.625, 2.05, 0.02, 4.15, { fill: 'E3D8CB' }),
  text(2.75, 2.06, 1.75, 0.26, '↑  지금 · 내 주변', { size: 10.5, bold: true, color: '9B8873', align: 'right' }),
  text(2.75, 5.98, 1.75, 0.26, '↓  미리 · 내일 이후', { size: 10.5, bold: true, color: '9B8873', align: 'right' }),
  text(M + 0.18, 4.2, 1.7, 0.26, '←  유형', { size: 10.5, bold: true, color: '9B8873' }),
  text(6.55, 4.2, 1.7, 0.26, '무형  →', { size: 10.5, bold: true, color: '9B8873' }),

  ...plot(2.15, 2.78, '마감히어로 · 라스트오더'),
  ...plot(3.45, 3.45, '당근마켓'),
  ...plot(2.40, 5.30, '온라인커머스'),
  ...plot(5.95, 5.42, '네이버예약'),
  ...plot(7.35, 4.80, '캐치테이블'),
  ...plot(6.60, 2.95, '넛츠', { hot: true, note: '오늘 비어버린 시간 · 지금' }),

  /* 오른쪽 비교 */
  ...compare(8.75, 1.95, 3.733, 0.82, '네이버예약', '내일과 다음 주를 정가로 팝니다'),
  ...compare(8.75, 2.87, 3.733, 0.82, '캐치테이블', '예약 관리 · 가격은 가게가 고정'),
  ...compare(8.75, 3.79, 3.733, 0.82, '마감히어로 · 라스트오더', '오늘이지만 음식 — 물건 재고 구조'),
  ...compare(8.75, 4.71, 3.733, 0.82, '당근마켓', '지금 · 내 주변이지만 중고 물건'),
  ...compare(8.75, 5.63, 3.733, 0.82, '넛츠', '오늘 비어버린 서비스 시간을, 지금', { hot: true }),

  text(M, 6.52, CW, 0.35, '각자 자기 수익 구조에 묶여 있어서, 옆으로 한 걸음 옮겨서는 아무도 올 수 없는 자리입니다.', { size: 13, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '이런 서비스 이미 있지 않냐고 물으실 겁니다. **반은 맞습니다.** /',
  '**음식 떠리는 있습니다.** 마감히어로, 라스트오더. 그런데 음식만 하고, 물건 재고를 세는 구조라 1대1 예약 슬롯을 못 다룹니다. /',
  '**미용실 예약도 있습니다.** 네이버예약이죠. 그런데 내일과 다음 주를 팝니다. **정가로 먹고살아서 스스로 할인을 걸 수 없습니다.** /',
  '**내 주변도 있습니다.** 당근이죠. 그런데 중고 물건이고 사업자 재고가 아닙니다. /',
  '그래서 오른쪽 위 칸이 비어 있습니다. **서비스업의 빈 자리를, 내 주변에서, 지금.**',
]);

/* 6 · Market ② — 타깃과 시장 규모 */
add('타깃 · 시장 규모', 20, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('TARGET & MARKET SIZE', '누구의 시간을, 얼마나 되는 시장에서'),
  text(M, 1.42, CW, 0.35, '시장 수치는 공개 통계와 업계 통상치를 근거로 한 가정값입니다.', { size: 12.5, color: C.grey }),

  ...card(M, 1.95, 5.5, 2.05, '수요자 — 20~30대 즉흥형', [
    '· 오늘 할 일을 오늘 정하는 사람',
    '· 계획형은 우리 고객이 아닙니다 — 기존 예약앱으로 충분',
    '· 움직이는 건 가격이 아니라 “지금 나만 찾아낸 자리”',
  ], { size: 12.5 }),
  ...card(M, 4.15, 5.5, 2.05, '공급자 — 예약 기반 소상공인', [
    '· 당일 취소로 생긴 빈 시간을 틈새 매출로 바꾸고 싶은 사장님',
    '· 빈 슬롯의 한계비용은 0에 가깝다 → 할인 여력이 실제로 존재',
    '· 할인 체험은 광고비를 매출로 받는 셈',
  ], { size: 12.5 }),

  ...size3(M + 6.13, 1.95, 5.5, '시장규모', '예약 기반 서비스업', '약 12조', '뷰티 · 네일 · 마사지 · 에스테틱 · 골프연습장 등 국내 연간 거래액', 1.0),
  ...size3(M + 6.13, 3.35, 5.5, '타겟시장', '소멸하는 빈 슬롯', '약 3조', '예약 가동률 갭 25~30% 가정 — 매일 0원으로 사라지는 공급', 0.25),
  ...size3(M + 6.13, 4.75, 5.5, '초기시장', '3년 내 서울 5개 구', '약 1,800억', '타겟시장의 6% · 강남구에서 시작해 서울 주요 5개 구까지', 0.06, { hot: true }),

  text(M, 6.45, CW, 0.35, '1단계는 미용실 · 네일 · 마사지. 재고가 항상 하나고 썩지 않아, 시간 재고 중 가장 다루기 쉽습니다.', { size: 13, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '고객은 **계획을 미리 세우지 않는 20~30대**입니다. 이 고객이 반응하는 건 가격이 아니라 **“지금 나만 찾아낸 자리”라는 발견의 재미**입니다. /',
  '공급자는 예약 기반 소상공인입니다. 빈 슬롯의 한계비용은 0에 가까워서 **할인 여력이 실제로 존재**합니다. /',
  '시장은 국내 예약 기반 서비스업 거래액 **약 12조**, 그중 안 팔려서 사라지는 빈 자리가 **약 3조**입니다. /',
  '저희가 3년 안에 들어갈 서울 다섯 개 구가 **약 1,800억**, 타겟시장의 **6%**입니다. 여기부터 시작합니다.',
]);

/* 7 · Business model ① — 모으는 단계 */
add('비즈니스 모델 ① · 모으는 단계', 50, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('BUSINESS MODEL  ①', '첫 12개월은 모으는 단계 — 강남구에서'),
  text(M, 1.42, CW, 0.35, '수익은 거래 수수료 3% 하나입니다. 이 단계의 목표는 수익이 아니라 밀도입니다.', { size: 14, color: C.grey }),

  ...card(M, 1.95, 5.5, 2.3, '공급자 모객 — 쿠폰으로 빠르게', [
    '· 거래 수수료 3% · 입점비 0 · 월 구독료 0',
    '· 입점 쿠폰(첫 슬롯 할인분)을 넛츠가 부담합니다',
    '· 강남구 한 곳에만 몰아서 밀도를 만듭니다',
  ], { size: 12.5 }),
  ...card(M + 6.13, 1.95, 5.5, 2.3, '고객 모객 — 동네 보물찾기', [
    '· 주변 매장에 보물을 걸어둡니다 (예: 커피 10만 원어치)',
    '· 앱에서 찾아가면 선착순으로 받습니다',
    '· 놀이처럼 참여 → 첫 예약 → 재방문',
  ], { size: 12.5 }),

  ...kpi(M, 4.55, 3.678, '사용자가 결제하는 금액', '24,000원'),
  ...kpi(M + 3.978, 4.55, 3.678, '사장님 정산  (97%)', '23,280원'),
  ...kpi(M + 7.956, 4.55, 3.678, '넛츠 수수료  (3%)', '720원', { hot: true }),
  text(M, 5.95, CW, 0.28, 'PG 결제 수수료는 별도입니다 — 3%는 넛츠가 받는 순수수료 기준. 사장님이 비교하는 건 정가가 아니라 0원입니다.', { size: 11, color: C.grey }),

  rect(M, 6.3, CW, 0.6, { fill: C.shell, radius: 0.08 }),
  text(M + 0.4, 6.44, CW - 0.8, 0.35, '12개월 KPI — 강남구 입점 400곳 · 채워진 슬롯 수', { size: 14, bold: true, color: C.gold, align: 'center' }),
  ...footer(),
], [
  '수익 모델입니다. **첫 12개월은 버는 단계가 아니라 모으는 단계입니다.** /',
  '수익원은 **거래 수수료 3%, 하나뿐입니다.** 입점비도 월 구독료도 받지 않습니다. /',
  '사장님이 비교하는 건 정가가 아니라 **0원**입니다. 안 팔리면 0원인 자리에서 받는 3%는 뺏는 게 아니라 나누는 겁니다. /',
  '공급은 **입점 쿠폰**으로 모읍니다. 새로 들어온 매장의 첫 할인분은 저희가 부담합니다. **매장이 내는 돈은 0원입니다.** /',
  '수요는 **동네 보물찾기**로 모읍니다. 주변 매장에 커피 십만 원어치를 걸어두고, 앱에서 찾아오면 선착순으로 드립니다. **앱을 여는 습관을 저희 돈으로 사는 겁니다.** /',
  '그래서 12개월 뒤에 남아야 하는 건 매출이 아니라 **강남구 입점 사백 곳, 그리고 채워진 슬롯 수**입니다.',
]);

/* 8 · Business model ② — 수익화 */
add('비즈니스 모델 ② · 수익화', 30, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('BUSINESS MODEL  ②', '수익화는 광고와 결제에서 나옵니다'),
  text(M, 1.42, CW, 0.35, '거래 수수료 3%는 2단계 이후에도 그대로 둡니다. 밀도가 붙은 다음에 광고와 결제가 열립니다.', { size: 14, color: C.grey }),

  ...phase(M, 2.0, 3.678, 3.4, 'PHASE 2', '13~24개월', '광고 — 깃발 꽂기', [
    '· 도달 반경 안 우선 노출권을 판매합니다',
    '· 지도 위 자기 자리에 깃발을 꽂는 방식',
    '· 밀도가 붙을수록 광고 단가가 올라갑니다',
  ], { hot: true }),
  ...phase(M + 3.978, 2.0, 3.678, 3.4, 'PHASE 3', '25개월~', '넛츠페이', [
    '· 예약금과 결제를 넛츠페이로 받습니다',
    '· 결제 수수료 + 예치금 운용',
    '· 결제가 묶이면 양쪽 다 남습니다 — 락인',
  ]),
  ...phase(M + 7.956, 2.0, 3.678, 3.4, 'NEXT', '그다음', '지역 커뮤니티', [
    '· 예약으로 만난 이웃이 다시 만납니다',
    '· 지역 기반 커뮤니티 앱으로 확장',
    '· 거래가 아니라 관계가 남는 단계',
  ]),

  rect(M, 5.65, CW, 0.95, { fill: C.dim, radius: 0.08, line: C.line }),
  text(M + 0.35, 5.82, CW - 0.7, 0.6, '광고는 “순서”만 삽니다 — 지금 갈 수 없는 자리는 광고를 사도 뜨지 않습니다.\n도달 가능성 필터 안에서만 경쟁시키기 때문에, “지금 갈 수 있는 곳”이라는 약속은 깨지지 않습니다.', { size: 12.5, color: C.shell, lineSpacing: 1.45 }),

  text(M, 6.68, CW, 0.3, '수수료는 매출이 일어났을 때만, 광고는 밀도가 생긴 뒤에만 — 사장님이 먼저 손해 보는 구간이 없습니다.', { size: 12.5, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '2단계부터가 수익화입니다. 수수료 3%는 **그대로 둡니다.** /',
  '**주 수익은 광고입니다.** 매장이 지도 위 자기 자리에 깃발을 꽂는 방식으로, 도달 반경 안에서의 우선 노출권을 삽니다. 밀도가 붙을수록 단가가 올라갑니다. /',
  '한 가지는 분명히 하겠습니다. **갈 수 없는 자리는 광고를 사도 뜨지 않습니다.** 순서는 살 수 있어도, 약속은 못 삽니다. /',
  '3단계는 **넛츠페이**입니다. 예약금과 결제를 직접 받으면 결제 수수료와 예치금, 그리고 락인이 따라옵니다. /',
  '그다음은 지역 커뮤니티입니다. **예약으로 만난 이웃이 동네에서 다시 만납니다.**',
]);

/* 7-B · [보관] 구 비즈니스 모델 한 장 — 수수료 흐름과 “광고 안 받는다” 원칙 */
add('[보관] 비즈니스 모델 · 수수료 흐름', 60, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('BUSINESS MODEL', '수익은 결제 수수료 3% 하나입니다'),
  text(M, 1.42, CW, 0.35, '입점비 0 · 월 구독료 0 · 광고비 0 · 상위노출비 0 — 수익원을 하나로 둔 것은 의도된 설계입니다.', { size: 14, color: C.grey }),

  ...node(M, 1.95, 5.5, 0.92, '사용자 결제', '정가 4만 원짜리 네일 케어를 2만 4천 원에'),
  ...down(M + 2.75, 2.95, 0.45, ''),
  rect(M, 3.48, 3.3, 1.1, { fill: C.white, radius: 0.08, line: C.line }),
  text(M + 0.28, 3.66, 2.8, 0.28, '사장님 정산', { size: 12, bold: true, color: C.green }),
  text(M + 0.28, 3.98, 2.8, 0.42, '23,280원  (97%)', { size: 18, bold: true, color: C.shell }),
  rect(M + 3.5, 3.48, 2.0, 1.1, { fill: C.shell, radius: 0.08 }),
  text(M + 3.76, 3.66, 1.5, 0.28, '넛츠 수수료', { size: 12, bold: true, color: C.gold }),
  text(M + 3.76, 3.98, 1.6, 0.42, '720원  (3%)', { size: 18, bold: true, color: C.white }),
  text(M, 4.68, 5.5, 0.28, 'PG 결제 수수료는 별도입니다 — 3%는 넛츠가 받는 순수수료 기준 [검증필요]', { size: 10.5, color: C.grey }),

  rect(M, 5.05, 5.5, 1.3, { fill: C.dim, radius: 0.08, line: C.line }),
  text(M + 0.3, 5.22, 5.0, 0.28, '유닛 이코노믹스 (가정)', { size: 12, bold: true, color: C.gold }),
  text(M + 0.3, 5.54, 5.0, 0.7, '평균 객단가 24,000원 → 건당 720원\n월 10만 건 → 월 7,200만 원 · 한계비용은 서버비뿐', { size: 11.5, color: C.grey, lineSpacing: 1.45 }),

  ...reason(M + 6.13, 1.95, 5.5, 1.16, '① 사장님이 비교하는 건 정가가 아니라 0원입니다',
    '안 팔리면 0원인 슬롯에서 받는 3%는 뺏는 게 아니라 나누는 겁니다.'),
  ...reason(M + 6.13, 3.23, 5.5, 1.16, '② 이 사업은 공급 밀도 싸움입니다',
    '내 주변에 지금 살 수 있는 슬롯이 몇 개냐가 곧 상품력입니다. 진입 마찰은 0이어야 합니다.'),
  ...reason(M + 6.13, 4.51, 5.5, 1.16, '③ 노출 순서를 돈으로 못 사게 합니다',
    '광고를 받는 순간 “지금 갈 수 있는 곳”이라는 약속이 깨집니다. 그래서 광고비를 안 받습니다.'),
  rect(M + 6.13, 5.79, 5.5, 0.62, { fill: C.shell, radius: 0.08 }),
  text(M + 6.43, 5.94, 4.9, 0.35, '입점비 0   ·   월 구독료 0   ·   광고비 0   ·   상위노출비 0', { size: 13, bold: true, color: C.gold }),

  text(M, 6.48, CW, 0.35, '수수료는 매출이 실제로 일어났을 때만 발생합니다. 사장님이 손해 볼 구간이 없습니다.', { size: 13, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '수익 모델은 한 줄입니다. **결제 수수료 3%, 그게 전부입니다.** /',
  '입점비도, 월 구독료도, 광고비도 받지 않습니다. /',
  '이유는 분명합니다. 저희가 파는 건 **그냥 두면 0원이 될 시간**입니다. 0원짜리를 매출로 바꿔주는데 사장님에게 선불을 요구하면 **공급이 안 붙습니다.** /',
  '이 사업은 **공급 밀도가 곧 경쟁력**이라, 진입 마찰을 0으로 두는 게 맞습니다. /',
  '숫자로 보면, 사용자가 이만 사천 원을 결제하면 사장님에게 이만 삼천이백팔십 원, 저희가 **칠백이십 원**입니다. 월 십만 건이면 월 **칠천이백만 원**입니다. /',
  '광고를 붙이면 단기 매출은 늘지만, 노출 순서가 돈으로 정해지는 순간 **“지금 갈 수 있는 곳”이라는 약속이 깨집니다.** 그래서 안 받습니다.',
], { off: true });

/* [보관] Traction — 설치·재방문 장치. 내용은 비즈니스 모델 ① 로 옮겼다 */
add('[보관] 트랙션', 30, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('TRACTION', '설치보다 중요한 건, 자주 여는 것입니다'),
  text(M, 1.42, CW, 0.35, '빈 시간은 갑자기 생깁니다. 그래서 앱을 습관적으로 열게 만드는 장치를 둘 씁니다.', { size: 14, color: C.grey }),

  ...card(M, 1.95, 5.5, 2.9, '장치 ① 특정 매장에 커피 10잔을 미리 달아둡니다', [
    '“지금 이 근처에 계신 10분, 선착순으로 드시러 오세요”',
    '',
    '· 공짜로 한 번 받아 본 사람은 그 앱을 계속 열어봅니다',
    '· ‘열어보는 습관’을 우리 돈으로 사는 것입니다',
    '· 위치 기반이라 그 동네 사람만 반응합니다 — 공급 밀도와 같은 지역에 씁니다',
    '',
    '비용 가정 — 잔당 3,000원 × 10잔 = 회당 3만 원',
  ], { titleSize: 15, size: 11.5 }),
  ...card(M + 6.13, 1.95, 5.5, 2.9, '장치 ② 등록 업체에 할인 쿠폰을 붙입니다', [
    '넛츠 투자 — 신규 등록 매장의 첫 슬롯 할인분을 넛츠가 부담합니다',
    '',
    '· 초기 공급이 매력적이어야 사용자가 옵니다',
    '· 사용자가 와야 다음 사장님이 들어옵니다 — 닭과 달걀을 우리 돈으로 끊습니다',
    '· 매장이 부담하는 돈은 0원, 리스크도 0입니다',
    '',
    '비용 가정 — 매장당 5만 원 · 첫 10슬롯 한정',
  ], { titleSize: 15, size: 11.5 }),

  ...kpi(M, 5.05, 2.75, '핵심 지표 — 습관이 곧 전환', '주 5회 이상 앱 열람', { size: 15 }),
  ...kpi(M + 2.96, 5.05, 2.75, '첫 주 안에 한 번은 사게', '설치 → 첫 구매 25%', { size: 15 }),
  ...kpi(M + 5.92, 5.05, 2.75, '할인 체험 → 정가 고객', '30일 재방문 30%', { size: 15 }),
  ...kpi(M + 8.88, 5.05, 2.75, '사라질 뻔한 슬롯 중 채운 비율', '슬롯 Fill Rate 60%', { size: 15, hot: true }),

  text(M, 6.48, CW, 0.35, '네 지표는 모두 목표치입니다 — 강남구 파일럿에서 먼저 증명합니다. 다운로드 수가 아니라 “몇 번 열었나”를 성과로 보고합니다.', { size: 13, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '이 서비스는 설치보다 **자주 여는 것**이 훨씬 중요합니다. 빈 시간은 갑자기 생기니까요. /',
  '그래서 두 가지를 씁니다. /',
  '첫째, **특정 매장에 커피 열 잔을 미리 달아둡니다.** 지금 이 근처에 계신 열 분, 선착순입니다. 공짜로 한 번 받아 본 사람은 **그 앱을 계속 열어봅니다.** /',
  '둘째, **새로 등록한 업체에는 저희가 할인 쿠폰을 붙여 드립니다.** 저희 비용, 즉 투자입니다. /',
  '초기 공급이 매력적이어야 사용자가 오고, 사용자가 와야 다음 사장님이 들어옵니다. **닭과 달걀을 저희 돈으로 끊는 겁니다.** /',
  '보시는 네 지표는 모두 목표치이고, 강남구에서 먼저 증명합니다.',
], { off: true });

/* 9 · KPI · 로드맵 */
add('KPI · 로드맵', 25, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('KPI · ROADMAP', '북극성 지표 하나와, 확장 마일스톤'),

  rect(M, 1.72, CW, 1.05, { fill: C.shell, radius: 0.08 }),
  text(M + 0.45, 1.9, CW - 0.9, 0.3, 'NORTH STAR', { size: 11.5, bold: true, color: C.gold, space: 2 }),
  text(M + 0.45, 2.24, CW - 0.9, 0.4, '채워진 슬롯 수  —  그냥 사라졌을 시간 중 매출로 바뀐 시간의 총량', { size: 17, bold: true, color: C.white }),

  rect(M, 3.0, 3.678, 3.1, { fill: C.white, radius: 0.08, line: C.gold, lineW: 2 }),
  rect(M, 3.0, 3.678, 0.08, { fill: C.gold }),
  text(M + 0.3, 3.28, 3.08, 0.28, '1단계  ·  0~12개월', { size: 11.5, bold: true, color: C.gold, space: 1.5 }),
  text(M + 0.3, 3.62, 3.08, 0.4, '강남구 한 곳', { size: 18, bold: true, color: C.shell }),
  text(M + 0.3, 4.14, 3.08, 1.6, [
    '· 미용 · 네일 · 마사지 입점 400곳',
    '· 주간 채운 슬롯 1,000개',
    '· Fill Rate 40% · 재방문 30%',
    '· 밀도가 곧 매칭률 — 넓히지 않습니다',
    '· 수익 — 매출의 3%',
  ].join('\n'), { size: 11.5, color: C.grey, lineSpacing: 1.5 }),
  text(M + 0.3, 5.72, 3.08, 0.28, '증명할 것 — 한 동네에서 “열면 살 게 있다”', { size: 10.5, bold: true, color: C.shell }),

  rect(M + 3.978, 3.0, 3.678, 3.1, { fill: C.white, radius: 0.08, line: C.line }),
  rect(M + 3.978, 3.0, 3.678, 0.08, { fill: C.shell }),
  text(M + 4.278, 3.28, 3.08, 0.28, '2단계  ·  13~24개월', { size: 11.5, bold: true, color: C.gold, space: 1.5 }),
  text(M + 4.278, 3.62, 3.08, 0.4, '서울 5개 구 복제', { size: 18, bold: true, color: C.shell }),
  text(M + 4.278, 4.14, 3.08, 1.6, [
    '· 입점 3,000곳 · 월 거래 5만 건',
    '· Fill Rate 55%',
    '· 생활권 1곳당 운영 1명 구조 확립',
    '· 첫 대형 파트너 한 곳 확보',
    '· 광고 시작',
  ].join('\n'), { size: 11.5, color: C.grey, lineSpacing: 1.5 }),
  text(M + 4.278, 5.72, 3.08, 0.28, '증명할 것 — 생활권 단위 흑자 공식', { size: 10.5, bold: true, color: C.shell }),

  rect(M + 7.956, 3.0, 3.678, 3.1, { fill: C.white, radius: 0.08, line: C.line }),
  rect(M + 7.956, 3.0, 3.678, 0.08, { fill: C.shell }),
  text(M + 8.256, 3.28, 3.08, 0.28, '3단계  ·  25개월~', { size: 11.5, bold: true, color: C.gold, space: 1.5 }),
  text(M + 8.256, 3.62, 3.08, 0.4, '카테고리 확장', { size: 18, bold: true, color: C.shell }),
  text(M + 8.256, 4.14, 3.08, 1.6, [
    '· 문화(연극 · 영화 · 방탈출) → 숙박',
    '· 새로 배우는 역량은 한 번에 하나',
    '· 체인 본사 1건 = 전국이 한 번에',
    '· 가격 엔진 자동화',
    '· 광고 · 넛츠페이',
  ].join('\n'), { size: 11.5, color: C.grey, lineSpacing: 1.5 }),
  text(M + 8.256, 5.72, 3.08, 0.28, '증명할 것 — 업종이 달라도 같은 엔진이 돈다', { size: 10.5, bold: true, color: C.shell }),

  text(M, 6.35, CW, 0.35, '1단계에서 “한 동네가 된다”를 증명하면, 그다음은 복제 문제입니다. 2단계부터는 상대가 대기업입니다.', { size: 13, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '지표는 하나만 봅니다. **채워진 슬롯 수** — 그냥 사라졌을 시간 중에 매출로 바뀐 시간의 총량입니다. /',
  '1단계는 **강남구 한 곳**입니다. 넓히지 않고 밀도를 만듭니다. 입점 사백 곳, 주간 채운 슬롯 천 개. /',
  '2단계에서 **서울 다섯 개 구**로 같은 공식을 복제하고, 여기서 2단계의 문을 열어줄 **첫 대형 파트너 한 곳**을 확보합니다. /',
  '3단계는 **카테고리 확장**입니다. 문화, 그다음 숙박. 새로 배우는 역량은 한 번에 하나씩만 더합니다. /',
  '수익은 1단계부터 **매출의 3%**로 받고, **광고는 2단계부터** 붙습니다. /',
  '**체인 본사 한 곳이면 전국 수백 개가 한 번에 열립니다.**',
]);

/* [보관] Team — 학력·경력·사진이 채워지면 다시 켠다 */
add('[보관] 팀', 10, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('TEAM', '여섯 명 전원 P입니다'),
  text(M, 1.42, CW, 0.35, '계획을 세우기보다 지금 눈앞에 열린 기회를 잡는 사람들 — 저희가 만드는 서비스가 정확히 그것입니다.', { size: 14, color: C.grey }),

  ...member(M, 1.95, 3.678, 1.95, '이강호', 'ESTP', '학력 · 경력 한 줄  [발표 전 입력]'),
  ...member(M + 3.978, 1.95, 3.678, 1.95, '이민호', 'ISTP', '학력 · 경력 한 줄  [발표 전 입력]'),
  ...member(M + 7.956, 1.95, 3.678, 1.95, '손경필', 'INTP', '학력 · 경력 한 줄  [발표 전 입력]'),
  ...member(M, 4.1, 3.678, 1.95, '최종락', 'ENFP', '학력 · 경력 한 줄  [발표 전 입력]'),
  ...member(M + 3.978, 4.1, 3.678, 1.95, '한재익', 'ESTP', '학력 · 경력 한 줄  [발표 전 입력]'),
  ...member(M + 7.956, 4.1, 3.678, 1.95, '조정윤', 'ISTP', '학력 · 경력 한 줄  [발표 전 입력]'),

  rect(M, 6.2, CW, 0.62, { fill: C.shell, radius: 0.08 }),
  text(M + 0.4, 6.35, CW - 0.8, 0.35, '여섯 명 모두 J가 아니라 P입니다. 즉흥적으로 지금 갈 곳을 찾는 사용자를, 저희가 가장 잘 압니다.', { size: 14, bold: true, color: C.white, align: 'center' }),
  ...footer({ color: 'A08B77' }),
], [
  '팀입니다. **여섯 명 전원 MBTI가 P입니다.** /',
  '계획을 세우기보다 지금 눈앞에 열린 기회를 잡는 사람들입니다. **저희가 만드는 서비스가 정확히 그겁니다.**',
], { off: true });

/* [보관] Ask — 수수료 3% 기준으로 금액 재산정 후 다시 켠다 */
add('[보관] 요청', 20, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('ASK', '저희가 요청드리는 것'),
  text(M, 1.42, CW, 0.35, '금액과 비중은 확정 전 가정값입니다. 수수료를 3%로 낮춘 기준으로 재산정이 필요합니다 [검증필요]', { size: 12.5, color: C.grey }),

  rect(M, 1.95, 5.5, 4.35, { fill: C.white, radius: 0.08, line: C.line }),
  text(M + 0.35, 2.2, 4.8, 0.3, '투자 요청', { size: 12, bold: true, color: C.gold, space: 1.5 }),
  text(M + 0.35, 2.52, 4.8, 0.65, '약 13억 원', { size: 40, bold: true, color: C.shell }),
  text(M + 0.35, 3.24, 4.8, 0.3, '강남구 여섯 달을 버티고 2단계 문을 여는 데까지', { size: 11.5, color: C.grey }),
  ...useBar(M + 0.35, 3.7, 4.8, '등록 업체 쿠폰 투자 (공급)', '5.2억  ·  40%', 0.40),
  ...useBar(M + 0.35, 4.32, 4.8, '커피 캠페인 등 수요 습관화', '2.6억  ·  20%', 0.20),
  ...useBar(M + 0.35, 4.94, 4.8, '가격 엔진 · 앱 개발', '3.25억  ·  25%', 0.25),
  ...useBar(M + 0.35, 5.56, 4.8, '생활권 운영 인력', '1.95억  ·  15%', 0.15),

  text(M + 6.13, 1.95, 5.5, 0.3, '파트너십 제안  ·  시너지', { size: 12, bold: true, color: C.gold, space: 1.5 }),
  ...reason(M + 6.13, 2.3, 5.5, 1.34, '첫 대형 파트너 한 곳',
    '영화관 · 방탈출 체인 본사 한 곳이면 전국 수백 개 관의 빈 좌석이 한 번에 열립니다. 2단계의 문입니다.', { titleSize: 15 }),
  ...reason(M + 6.13, 3.78, 5.5, 1.34, 'PG · 결제사',
    '즉시 선결제와 자동 정산이 상품의 핵심입니다. 거래량 기반 수수료 구조를 함께 설계합니다.', { titleSize: 15 }),
  ...reason(M + 6.13, 5.26, 5.5, 1.14, '지역 상인회 · 프랜차이즈 본부',
    '가맹점을 한 번에 온보딩해 공급 밀도를 단숨에 만듭니다.', { titleSize: 15 }),

  text(M, 6.45, CW, 0.35, '투자금의 60%는 사람과 매장을 모으는 데 씁니다 — 이 사업은 밀도 싸움입니다.', { size: 13, color: C.grey, align: 'center' }),
  ...footer(),
], [
  '요청은 두 가지입니다. /',
  '하나, **강남구에서의 여섯 달**을 버틸 자금 약 13억입니다. 절반 넘게는 **공급과 수요를 붙이는 데** 씁니다. 등록 업체 쿠폰과 커피 캠페인입니다. /',
  '둘, 2단계의 문을 열어줄 **첫 대형 파트너 한 곳**입니다. 체인 본사 한 곳이면 전국이 한 번에 열립니다. /',
  '금액은 수수료를 3%로 낮춘 기준으로 **재산정 중**이고, 사용처 비중은 그대로입니다.',
], { off: true });

/* 12 · Last page */
add('클로징', 10, [
  rect(0, 0, W, H, { fill: C.shell }),
  img(W - 5.1, 0, 5.1, H, 'app-mockup.png', { cover: true }),
  rect(W - 5.1, 0, 5.1, H, { fill: C.shell, alpha: 66 }),
  text(M, 1.5, 6.9, 0.3, 'MISSION', { size: 12, bold: true, color: C.gold, space: 2 }),
  text(M, 1.92, 6.9, 1.5, '사라질 시간을,\n누군가의 오늘로.', { size: 38, bold: true, color: C.white, lineSpacing: 1.25 }),
  rect(M, 3.82, 6.9, 0.045, { fill: C.gold }),
  text(M, 4.16, 6.9, 0.3, 'VISION', { size: 12, bold: true, color: C.gold, space: 2 }),
  text(M, 4.56, 6.9, 0.8, '모든 로컬 서비스의 남는 시간이\n실시간으로 거래되는 시장을 만듭니다.', { size: 17, color: 'E8DCCB', lineSpacing: 1.45 }),
  text(M, 5.72, 6.9, 0.8, '넛츠는 할인 앱이 아닙니다.\n버려지는 시간을 거래 가능하게 만드는 인프라입니다.', { size: 15.5, bold: true, color: C.gold, lineSpacing: 1.45 }),
  text(M, H - 0.85, 7, 0.3, '심심할 땐, 넛츠  NUTS', { size: 11.5, color: 'A8927B', space: 1.5 }),
], [
  '처음의 두 사람으로 돌아가겠습니다. 회의가 취소된 사람은 자전거를 고르고, **12분 거리에 뜬 한 자리**를 예약합니다. 그 시간, 취소 전화를 받았던 사장님의 한 시간이 채워집니다. /',
  '두 사람은 여전히 서로를 몰랐습니다. **저희가 그걸 알고 있었을 뿐입니다.** /',
  '넛츠는 할인 앱이 아닙니다. **버려지는 시간을 거래 가능하게 만드는 인프라입니다.** 감사합니다.',
]);

/* [보관] 백업 — 운영 원칙과 예상 지적 */
add('[보관] 백업 · 운영 · 리스크', 0, [
  rect(0, 0, W, H, { fill: C.cream }),
  ...head('BACKUP', '운영 3원칙, 그리고 가장 많이 받은 지적 둘'),
  ...card(M, 1.95, 3.63, 2.55, '① 강남구 한 곳', ['밀도가 곧 매칭률입니다.', '백 개를 전국에 흩뿌리면 실패하고,', '강남구에 몰면 작동합니다.']),
  ...card(M + 3.99, 1.95, 3.63, 2.55, '② 선결제 의무', ['크게 할인해준 사장님에게', '노쇼는 재앙이니까요.', '필터와 함께 이중 방어입니다.']),
  ...card(M + 7.98, 1.95, 3.63, 2.55, '③ 단골에게는 안 보임', ['단골이 정가를 안 내는 순간', '사장님은 떠납니다.', '할인 채널이 아니라 신규 채널.']),
  ...qa(M, 4.85, 5.5, '“빈 슬롯 파는 가게면\n안 되는 가게 아닌가?”', '초기 100개는 직접 심사합니다. 떨이가 아니라 첫 방문 체험 슬롯입니다.'),
  ...qa(M + 6.13, 4.85, 5.5, '“강남구 안이면 자전거로\n어차피 다 가지 않나?”', '맞습니다. 그래서 이건 거리 제한이 아니라 도착 보증이고, 넓어질수록 강해집니다.'),
  ...footer(),
], [
  '(백업 슬라이드 — 질문을 받으면 엽니다) /',
  '운영은 세 가지 원칙입니다. **강남구 한 곳**에서만 시작하고, **선결제를 의무화**하고, **그 가게의 단골에게는 할인 슬롯을 보여주지 않습니다.** /',
  '가장 많이 받은 지적 둘. 빈 슬롯을 파는 가게는 안 되는 가게 아니냐 — 초기 백 개는 **직접 심사**합니다. /',
  '강남구 안에서는 자전거면 다 가지 않냐 — 맞습니다. 그래서 이건 거리 제한이 아니라 **도착 보증**이고, 넓어질수록 강해집니다.',
], { off: true });

/* ---------- 발표본 추리기 ----------
   off: true 인 슬라이드는 이번 발표에서 뺀 것이다. 내용은 위에 그대로 남아 있고,
   { off: true } 한 조각만 지우면 다시 발표본으로 들어온다. */
const S = ALL.filter((s) => !s.off);
const OFF = ALL.filter((s) => s.off);

/* 쪽번호는 발표본 순서대로 다시 매긴다 (표지 1장 포함) */
S.forEach((s, i) => s.shapes.forEach((sh) => { if (sh.pageNum) sh.text = String(i + 1); }));
OFF.forEach((s) => s.shapes.forEach((sh) => { if (sh.pageNum) sh.text = ''; }));

module.exports = { W, H, M, CW, C, S, ALL, OFF, rect, text, img, head, footer, card };
