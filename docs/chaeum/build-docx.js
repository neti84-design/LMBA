const d = require('docx');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
        ShadingType, BorderStyle, AlignmentType, HeadingLevel, PageBreak, LevelFormat,
        convertMillimetersToTwip } = d;

const FONT = '맑은 고딕';
const NAVY = '1F3864';
const BLUE = '2E5C8A';
const GREY = '595959';
const LIGHT = 'F2F5F9';
const RED = 'B02A2A';
const ORANGE = 'B26A00';
const GREEN = '2E6B3E';

const MARGIN = convertMillimetersToTwip(20);
const PAGE_W = 11906;
const TW = PAGE_W - MARGIN * 2;   // usable table width

/* ---------- inline **bold** parser ---------- */
function runs(text, opt = {}) {
  const base = { font: FONT, size: opt.size || 20, color: opt.color || '262626' };
  const out = [];
  text.split(/(\*\*[^*]+\*\*)/g).forEach(part => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**')) {
      out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true,
                             color: opt.boldColor || base.color }));
    } else {
      out.push(new TextRun({ ...base, text: part }));
    }
  });
  return out;
}

/* ---------- block builders ---------- */
const P = (t, o = {}) => new Paragraph({
  children: runs(t, o),
  alignment: o.align,
  spacing: { before: o.before ?? 60, after: o.after ?? 100, line: o.line ?? 276 },
  indent: o.indent,
  border: o.border,
  shading: o.shading,
});

const H1 = t => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 30, bold: true, color: NAVY })],
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 180 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 6 } },
});

const H2 = t => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 24, bold: true, color: BLUE })],
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 120 },
});

const H3 = (t, color) => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 21, bold: true, color: color || '262626' })],
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 220, after: 90 },
});

const LI = (t, lvl = 0) => new Paragraph({
  children: runs(t),
  numbering: { reference: 'bul', level: lvl },
  spacing: { before: 30, after: 60, line: 264 },
});

const NLI = (t, lvl = 0) => new Paragraph({
  children: runs(t),
  numbering: { reference: 'num', level: lvl },
  spacing: { before: 30, after: 60, line: 264 },
});

/* quote / callout box — shading + top/bottom rules (pBdr child order is fragile) */
const BOX = (lines, accent) => {
  const col = accent || BLUE;
  return lines.map((t, i) => new Paragraph({
    children: runs(t, { size: 20, boldColor: col }),
    spacing: { before: i === 0 ? 160 : 30, after: i === lines.length - 1 ? 180 : 30, line: 276 },
    indent: { left: 200, right: 200 },
    shading: { type: ShadingType.CLEAR, fill: LIGHT, color: 'auto' },
    border: {
      top: i === 0 ? { style: BorderStyle.SINGLE, size: 14, color: col, space: 8 } : undefined,
      bottom: i === lines.length - 1 ? { style: BorderStyle.SINGLE, size: 4, color: col, space: 8 } : undefined,
    },
  }));
};

/* table: head = [..], rows = [[..]], w = [dxa..] summing to TW */
function TBL(head, rows, w) {
  const cell = (txt, width, o = {}) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: o.fill || 'FFFFFF', color: 'auto' },
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    verticalAlign: 'center',
    children: [new Paragraph({
      children: runs(String(txt), { size: o.size || 18, color: o.color, boldColor: o.color }),
      alignment: o.align,
      spacing: { before: 0, after: 0, line: 252 },
    })],
  });
  const hdr = new TableRow({
    tableHeader: true,
    children: head.map((h, i) => new TableCell({
      width: { size: w[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: NAVY, color: 'auto' },
      margins: { top: 80, bottom: 80, left: 110, right: 110 },
      verticalAlign: 'center',
      children: [new Paragraph({
        children: [new TextRun({ text: h, font: FONT, size: 18, bold: true, color: 'FFFFFF' })],
        spacing: { before: 0, after: 0 },
      })],
    })),
  });
  const body = rows.map((r, ri) => new TableRow({
    children: r.map((c, i) => {
      const o = (typeof c === 'object' && c !== null) ? c : { t: c };
      return cell(o.t, w[i], { fill: ri % 2 ? 'F7F9FC' : 'FFFFFF', color: o.color, align: o.align });
    }),
  }));
  return new Table({
    columnWidths: w,
    width: { size: TW, type: WidthType.DXA },
    rows: [hdr, ...body],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'BFC9D6' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BFC9D6' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'BFC9D6' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'BFC9D6' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'DCE3EC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'DCE3EC' },
    },
  });
}

const GAP = (n = 120) => new Paragraph({ children: [], spacing: { before: 0, after: n } });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

/* ============================ CONTENT ============================ */
const c = [];

/* ---- cover ---- */
c.push(new Paragraph({ children: [], spacing: { after: 2400 } }));
c.push(new Paragraph({
  children: [new TextRun({ text: '신 사 업 제 안 서', font: FONT, size: 22, color: GREY, characterSpacing: 60 })],
  alignment: AlignmentType.CENTER, spacing: { after: 280 },
}));
c.push(new Paragraph({
  children: [new TextRun({ text: '채움', font: FONT, size: 88, bold: true, color: NAVY })],
  alignment: AlignmentType.CENTER, spacing: { after: 100 },
}));
c.push(new Paragraph({
  children: [new TextRun({ text: 'CHAEUM', font: FONT, size: 22, color: BLUE, characterSpacing: 120 })],
  alignment: AlignmentType.CENTER, spacing: { after: 420 },
}));
c.push(new Paragraph({
  children: [new TextRun({ text: '비어 있는 예약 한 자리를,', font: FONT, size: 26, color: '262626' })],
  alignment: AlignmentType.CENTER, spacing: { after: 60 },
}));
c.push(new Paragraph({
  children: [new TextRun({ text: '지금 갈 수 있는 사람에게', font: FONT, size: 26, bold: true, color: '262626' })],
  alignment: AlignmentType.CENTER, spacing: { after: 2600 },
}));
c.push(new Paragraph({
  children: [new TextRun({ text: '이동수단 기반 실시간 예약 마켓플레이스', font: FONT, size: 20, color: GREY })],
  alignment: AlignmentType.CENTER, spacing: { after: 80 },
}));
c.push(new Paragraph({
  children: [new TextRun({ text: '2026. 09', font: FONT, size: 20, color: GREY })],
  alignment: AlignmentType.CENTER,
}));
c.push(BREAK());

/* ---- TOC ---- */
c.push(H1('목차'));
const toc = [
  ['1', '한 줄 정의'], ['2', '왜 지금인가 — 두 개의 빈칸'],
  ['3', '핵심 차별화 — 도달 가능성을 필터로 쓴다'], ['4', '타겟'],
  ['5', '경쟁 분석'], ['6', '단계별 확장 전략'], ['7', '초기 시장 진입 및 운영 설계'],
  ['8', '수익 모델'], ['9', '사회적 가치 (ESG)'], ['10', '리스크와 대응'], ['11', '로드맵'],
  ['부록 A', '1단계 서비스업 카테고리 정리'],
  ['부록 B', '리스크 자문 의견 (상세)'],
  ['부록 C', '10분 발표 흐름'],
  ['부록 D', '후속 액션'],
];
toc.forEach(([n, t]) => c.push(new Paragraph({
  children: [
    new TextRun({ text: n, font: FONT, size: 20, bold: true, color: BLUE }),
    new TextRun({ text: '   ' + t, font: FONT, size: 20, color: '262626' }),
  ],
  spacing: { before: 70, after: 70 },
})));
c.push(BREAK());

/* ---- 1 ---- */
c.push(H1('1. 한 줄 정의'));
c.push(...BOX([
  '"지금, 내가 갈 수 있는 거리 안에서, 비어 있는 예약 한 자리를 채운다."',
], NAVY));
c.push(P('채움은 소상공인의 **비어버린 예약 슬롯**과 사용자의 **비어버린 시간**을 서로 채워주는, 위치·시간·**이동수단** 기반 실시간 예약 마켓플레이스입니다.'));
c.push(P('기존 예약 서비스가 "내일 몇 시"를 다룬다면, 채움은 **"지금부터 두 시간 안"** 만 다룹니다. 그리고 그 안에서도 **내가 실제로 도착할 수 있는 곳**만 보여줍니다.'));

/* ---- 2 ---- */
c.push(H1('2. 왜 지금인가 — 두 개의 빈칸'));
c.push(H2('2.1 공급자의 빈칸'));
c.push(P('미용실, 네일, 마사지 같은 예약 기반 서비스업의 재고는 **"시간"** 입니다. 팔지 못한 13시~14시는 다음 날로 넘길 수 없고, 그 자리에서 영원히 소멸합니다.'));
c.push(LI('당일 취소 1건 = 그 슬롯 매출의 **100% 손실**'));
c.push(LI('그 사이에도 임대료·인건비는 그대로 발생'));
c.push(LI('같은 동네 같은 업종인데도 손님 수 편차가 극심 → **수요 불균형이 구조적**'));
c.push(H2('2.2 수요자의 빈칸'));
c.push(P('약속 장소에 30분 일찍 도착했다. 친구가 한 시간 늦는다고 한다. 오후 회의가 취소됐다.'));
c.push(P('이 **"떠 있는 시간"** 에, 지금 이 근처에서 무엇을 할 수 있는지 알려주는 서비스가 없습니다.'));
c.push(H2('2.3 기존 시장이 이 둘을 못 잇는 이유'));
c.push(TBL(['서비스', '다루는 시간축', '다루는 재고'], [
  ['네이버예약 · 카카오헤어샵', '미래 (내일, 다음 주)', '정가 슬롯'],
  ['마감히어로 · 라스트오더', '오늘', '음식 물리 재고'],
  ['당근', '상시', '중고 물건'],
  [{ t: '채움', color: NAVY }, { t: '**지금부터 2시간 이내**', color: NAVY }, { t: '**서비스업의 빈 슬롯**', color: NAVY }],
], [3200, 3400, 3038]));
c.push(GAP());
c.push(...BOX(['채움이 노리는 빈칸 = **지금(Now) × 서비스업 × 실제로 갈 수 있는 거리**']));

/* ---- 3 ---- */
c.push(BREAK());
c.push(H1('3. 핵심 차별화 — 도달 가능성을 정렬이 아니라 필터로 쓴다'));
c.push(P('기존 앱은 **거리순으로 정렬**합니다. "1km, 2km, 3km…"를 보여주고, 내가 저기까지 제시간에 갈 수 있는가는 사용자가 직접 계산해야 합니다.'));
c.push(P('채움은 반대입니다. **갈 수 있는 것만 보여줍니다.**'));
c.push(H2('3.1 작동 3단계'));
c.push(NLI('**위치** — 내 현재 위치 (GPS, "내 주변")'));
c.push(NLI('**이동수단 선택** — 도보 / 자전거 / 차량'));
c.push(NLI('**시스템이 자동 판정** — 마감까지 남은 시간 안에 실제로 도착 가능한 슬롯만 노출'));
c.push(H2('3.2 판정식'));
c.push(...BOX([
  '현재시각 + 이동시간(수단, 거리) + 준비버퍼  ≤  예약 마감시각',
  '→ 참이면 노출 / 거짓이면 화면에서 숨김',
], NAVY));
c.push(H2('3.3 "채움 반경" = 남은 시간 × 이동수단 속도'));
c.push(TBL(['이동수단', '적용 속도', '추가 버퍼'], [
  ['도보', '4 km/h', '5분'],
  ['자전거', '15 km/h', '5분 (대여소 이동)'],
  ['차량', '18 km/h (도심)', '10분 (주차)'],
], [2800, 3400, 3438]));
c.push(GAP());
c.push(P('시간이 흐를수록 남은 시간이 줄고, **내 반경의 원이 실시간으로 수축**합니다. 지도 위의 원이 조여들면서 매물이 하나씩 사라지는 경험 — 이것이 **긴박감이자 "보물찾기"의 재미**입니다.'));
c.push(H2('3.4 작동 예시 — A네일샵'));
c.push(H3('사장님 등록 화면'));
c.push(...BOX([
  '오늘 **13:00 ~ 14:00** 비었습니다 / 예약 마감 **12:30**',
  '기본 케어 30분 · 정가 40,000원 → **24,000원**',
]));
c.push(H3('사용자 화면 (현재 11:52, A네일샵까지 2.5km)'));
c.push(P('화면 상단: **마감까지 38분** — 현재 시각에 맞춰 실시간으로 줄어듦', { color: RED, boldColor: RED }));
c.push(TBL(['내가 고른 이동수단', '소요시간 계산', '남은 38분 안에?', '화면에'], [
  ['도보', '38분 + 버퍼 5분 = **43분**', { t: '초과', color: RED }, { t: '**안 보임**', color: RED }],
  ['자전거', '10분 + 버퍼 5분 = **15분**', { t: '여유 23분', color: GREEN }, { t: '**보임**', color: GREEN }],
  ['차량', '8분 + 주차 10분 = **18분**', { t: '여유 20분', color: GREEN }, { t: '**보임**', color: GREEN }],
], [2000, 3300, 2100, 2238]));
c.push(GAP());
c.push(...BOX(['같은 시각, 같은 자리에 있어도 **이동수단에 따라 완전히 다른 화면을 본다.**', '이것이 채움의 단일 핵심 메커니즘입니다.'], NAVY));
c.push(P('※ 최초 구상의 "1km / 자전거 25분 / 도보 40분"은 실제 속도(1km면 도보 15분, 자전거 4분)로는 발표장에서 바로 지적당합니다. 거리를 2.5km로 두면 의도한 구도 — 자전거는 되고 도보는 안 되는 — 가 실제 숫자 그대로 성립합니다.', { size: 18, color: GREY }));
c.push(H2('3.5 이 메커니즘이 만드는 3가지 효과'));
c.push(H3('① 헛걸음 제로 → 노쇼를 UX로 없앤다'));
c.push(P('"예약했는데 못 갔다"가 구조적으로 발생하지 않습니다. 애초에 **못 오는 사람에게는 보여주지 않기** 때문입니다. 즉 이 필터는 편의 기능이 아니라 **공급자 리스크 관리 장치**입니다.'));
c.push(H3('② 매칭률 상승'));
c.push(P('보이는 항목이 전부 "실행 가능한 것"이므로, 목록이 짧아도 **전환율이 높습니다.** 초기 공급이 적은 플랫폼에 결정적으로 유리한 구조입니다.'));
c.push(H3('③ 광고 수익모델의 근거가 여기서 나온다'));
c.push(P('"도달 가능한 사용자"는 광고주 입장에서 **가장 비싼 트래픽**입니다. 지금·여기·갈 수 있음이 이미 검증된 사람이기 때문입니다. 반경 내 상위 노출권이 자연스럽게 유료 상품이 됩니다.'));
c.push(H2('3.6 사장님이 보는 반대편 화면'));
c.push(...BOX([
  '이 슬롯을 지금 볼 수 있는 사람 **47명**  (도보 6 · 자전거 18 · 차량 23)',
  '마감을 12:30 → 12:45로 늦추면 **도달 인원 47명 → 112명**',
]));
c.push(P('할인율이 아니라 **마감시각과 이동수단 반경으로 노출을 코칭**합니다. 사장님이 무작정 가격을 깎지 않아도 되는 레버를 하나 더 갖게 됩니다.'));
c.push(P('※ 대중교통은 실시간 배차·환승 변수가 커서 1단계에서는 제외하고, 2단계 옵션으로 추가합니다.', { size: 18, color: GREY }));

/* ---- 4 ---- */
c.push(BREAK());
c.push(H1('4. 타겟'));
c.push(H2('4.1 수요자 — "P 성향" 즉흥형'));
c.push(LI('계획을 미리 세우지 않고 그 순간에 정하는 20~30대'));
c.push(LI('오늘 저녁 뭐 할지 오늘 오후에 정하는 사람'));
c.push(LI('**계획형(J)은 우리 고객이 아닙니다.** 그들은 기존 예약앱으로 충분합니다'));
c.push(LI('핵심 정서: 저렴해서가 아니라 **"지금 나만 찾아낸 자리"** 라는 발견의 재미'));
c.push(H2('4.2 공급자 — 예약 기반 소상공인'));
c.push(LI('당일 취소·손님 부족으로 갑자기 생긴 빈 시간을 **"틈새 매출"** 로 바꾸고 싶은 사장님'));
c.push(LI('빈 슬롯의 **한계비용은 0에 가깝다** → 할인 여력이 실제로 존재'));
c.push(LI('신규 고객 획득 비용을 생각하면, 할인 체험은 **광고비를 매출로 받는 셈**'));

/* ---- 5 ---- */
c.push(H1('5. 경쟁 분석'));
c.push(TBL(['서비스', '카테고리', '시간축', '할인', '도달가능성 필터'], [
  ['네이버예약 / 카카오헤어샵', '서비스업', '미래 예약', '없음', '없음'],
  ['마감히어로', '**식품**', '당일 마감', '있음', '없음'],
  ['타임세일 알림이 / COD', '**식품**', '당일', '있음', '없음'],
  ['MainFunc', '뷰티샵', '예약', '없음', '없음'],
  ['당근', '중고거래', '상시', '—', '없음'],
  [{ t: '**채움**', color: NAVY }, { t: '**서비스업**', color: NAVY }, { t: '**지금 (2시간 내)**', color: NAVY }, { t: '**있음**', color: NAVY }, { t: '**핵심 기능**', color: NAVY }],
], [2500, 1650, 1900, 1100, 2488]));
c.push(GAP());
c.push(LI('기존 타임세일 앱은 대부분 **음식에 국한** → 서비스업 중심 타임세일은 공백'));
c.push(LI('**"이동수단 기반 도달 가능성 필터"는 위 어느 서비스에도 없습니다.** 여기가 우리 해자입니다'));
c.push(LI('참고: MainFunc은 뷰티샵 예약 플랫폼으로, 타임세일 모델이 아닙니다'));

/* ---- 6 ---- */
c.push(BREAK());
c.push(H1('6. 단계별 확장 전략 — "시간 재고의 구조"로 나눈다'));
c.push(TBL(['단계', '업종', '시간 구조', '필요 핵심역량'], [
  ['**1단계**', '미용실·네일·마사지·피부관리·PT', '제공자와 사용자의 시간이 **1:1 동시 소비**', '1:1 슬롯 매칭'],
  ['**2단계**', '연극·소극장·전시·원데이클래스', '소수 공급자 : 다수 소비자 (**1:다수**)', '좌석 재고 관리'],
  ['**3단계**', '숙박 (당일 공실)', '공급자와 사용자의 시간이 **분리**', '체크인/아웃 분리 처리'],
  ['**4단계**', '만두·빵 등 포장 음식', '**물리 재고 + 유통기한**', '신선도·수량 관리'],
], [1100, 2900, 3300, 2338]));
c.push(GAP());
c.push(P('**2·3단계 진입 전략**: 공연·숙박은 개별 소상공인보다 **체인 사업자 1곳과의 제휴가 공급 100개보다 빠릅니다.** 영화관·호텔 체인처럼 당일 공석·공실이 상시 발생하는 대형 사업자를 우선 접촉하는 것이 현실적인 진입로입니다.'));
c.push(P('**왜 순차인가**: 각 단계의 핵심 역량이 완전히 다릅니다. 동시에 하면 전부 어설퍼집니다.'));
c.push(P('**왜 식품이 마지막인가**: 역량 문제이기도 하지만 **포지셔닝 문제**가 더 큽니다. "음식 마감 앱"으로 한 번 인식되면, 그 뒤에 서비스업으로 올라가는 길이 막힙니다.'));

/* ---- 7 ---- */
c.push(H1('7. 초기 시장 진입 및 운영 설계'));
c.push(H2('7.1 런칭 지역 — 강남구 단일'));
c.push(P('전국이 아니라 한 개 구입니다. 이유는 하나, **밀도가 곧 매칭률**이기 때문입니다. 반경 안에 볼 게 없는 플랫폼은 한 번 쓰고 지웁니다. 공급 100개를 전국에 흩뿌리면 실패하고, 강남구에 몰면 작동합니다.'));
c.push(P('확장은 **밀도 지표가 검증된 뒤** 서초·송파 순으로.'));
c.push(H2('7.2 예약 방식 — 2단계로'));
c.push(LI('**1기**: 당근처럼 **메시지 기반 소통**으로 예약 확정 (개발 부담 최소, 빠른 검증)'));
c.push(LI('**2기**: 예약 솔루션 **API 연동**으로 빈 슬롯 실시간 자동 동기화 → 사장님이 아무것도 입력하지 않아도 취소가 발생하는 순간 자동 등록'));
c.push(H2('7.3 결제 방식 — 선결제 의무'));
c.push(P('큰 폭으로 할인해준 사장님에게 노쇼는 재앙입니다. 선결제는 공급자가 이 플랫폼을 믿고 슬롯을 여는 **최소 전제 조건**입니다.'));
c.push(P('여기에 **도달 가능성 필터**가 더해지면 "못 가서 취소"라는 사유 자체가 거의 사라지므로, **엄격한 환불 정책을 정당하게 운영할 근거**가 생깁니다. 두 장치가 서로를 보강합니다.'));
c.push(H2('7.4 공급자 보호 원칙 — 신규 고객 한정 노출'));
c.push(P('결제 전화번호 대조로, 해당 매장의 **기존 고객에게는 그 매장의 할인 슬롯을 숨깁니다.** 단골이 할인가를 학습해 정가를 내지 않게 되는 것이 사장님 이탈의 1순위 원인이기 때문입니다. (부록 B, R-B 참조)'));

/* ---- 8 ---- */
c.push(BREAK());
c.push(H1('8. 수익 모델'));
c.push(TBL(['단계', '시점', '모델', '설명'], [
  ['**Phase 1**', '0~12개월', '**수수료 0%**', '당근 모델. 공급·수요 밀도 확보가 **유일한 KPI**. 돈은 벌지 않는다'],
  ['**Phase 2**', '네트워크 효과 이후', '**광고**', '도달반경 내 상위 노출권, 카테고리 스폰서 (3.5-③이 근거)'],
  ['**Phase 3**', '거래량 확보 후', '**채움페이**', '결제 수수료 + 예치금 운용 수익 + **락인(lock-in) 효과**'],
  ['**Phase 3**', '동시', '**프리미엄 인증**', '당근 인증 모델. 위생·자격 배지 구독 (신뢰 = 유료 상품)'],
], [1300, 2000, 1900, 4438]));

/* ---- 9 ---- */
c.push(H1('9. 사회적 가치 (ESG)'));
c.push(LI('**소상공인 상생** — 그냥 사라졌을 시간을 매출로 되살립니다. 숫자로 증명 가능한 상생입니다'));
c.push(LI('**온누리상품권 결제 연동** — 전통시장·지역 상권과 직접 연결되는 ESG 스토리'));
c.push(LI('**지역 상권 데이터** — 어느 시간대 어느 업종이 비는지 = 지자체·상권 정책에 쓰이는 공공적 가치'));

/* ---- 10 ---- */
c.push(H1('10. 리스크와 대응'));
c.push(TBL(['#', '리스크', '대응'], [
  ['R1', '**역선택** — "빈 슬롯 파는 가게 = 안 되는 가게"로 읽힘', '초기 100개 직접 심사 큐레이션 + "떨이"가 아닌 **"신규 고객용 첫 방문 체험 슬롯"** 프레이밍'],
  ['R2', '**단골 카니발라이제이션** — 기존 고객이 정가를 안 냄', '**신규 고객 한정 노출** (전화번호 대조) + 월 노출 슬롯 상한 + 재방문 전환 리포트'],
  ['R3', '**도달 필터가 강남구에서 약함** — 자전거 30분이면 구 전체 커버', '필터를 "거리 제한"이 아니라 **"도착 보증"** 으로 정의. 확장할수록 강해지는 기능'],
  ['R4', '**수요 모수의 얇음** — 교집합이 작음', '**조건 예약 알림(위시리스트) + 푸시**를 초기 제품에 필수 탑재'],
  ['R5', '**상시 할인화** — 할인가가 "상수"가 됨', '슬롯 구조상 상시 광고가 어려움 + **월 노출 슬롯 수 상한** + 정가 검증'],
  ['R6', '**노쇼**', '선결제 의무 + 도달 가능성 필터 (이중 방어)'],
  ['R7', '**의료법 저촉** (뷰티 확장 시)', '의료기관 1단계 전면 제외 + 온보딩 시 **영업신고증 업태 확인**'],
  ['R8', '**대형 플랫폼의 모방**', '네이버·카카오는 "미래 예약" 최적화 구조. 공급자 관계·큐레이션 자산 선점'],
], [700, 3400, 5538]));
c.push(GAP());
c.push(P('상세 분석은 **부록 B. 리스크 자문 의견**을 참조하십시오.'));

/* ---- 11 ---- */
c.push(H1('11. 로드맵'));
c.push(TBL(['기간', '목표'], [
  ['M1~M3', '강남구 미용·네일 **가맹 100개** 확보 / MVP 출시 (메시지 예약 + 도달 필터 + 선결제 + 푸시 알림)'],
  ['M4~M6', '핵심 지표 검증 — **슬롯 성사율**, 노출 대비 예약 전환율, 재방문율'],
  ['M7~M12', '2단계(공연·문화) 카테고리 추가 / 서초·송파 확장'],
  ['Y2', '광고 모델 전환, 예약 API 연동, 채움페이 검토'],
], [1700, 7938]));
c.push(GAP());
c.push(...BOX([
  '**핵심 검증 지표 (North Star) — "채워진 슬롯 수"**',
  '그냥 사라졌을 시간 중 매출로 전환된 시간의 총량',
], NAVY));

/* ---- 부록 A ---- */
c.push(BREAK());
c.push(H1('부록 A. 1단계 서비스업 카테고리 정리'));
c.push(H2('A-1. 편입 기준 — 6개 조건'));
c.push(P('1단계에 넣을지 말지는 취향이 아니라 아래 6개로 기계적으로 판정합니다.'));
c.push(TBL(['#', '기준', '왜 필요한가'], [
  ['C1', '**시간이 곧 재고** (슬롯 예약제)', '안 팔리면 소멸해야 할인 동기가 생김'],
  ['C2', '**1:1 동시 소비**', '1단계 핵심역량이 1:1 매칭이므로'],
  ['C3', '**소요시간 30~90분**', '2시간 넘으면 "즉흥 소비"가 성립하지 않음'],
  ['C4', '**한계비용이 낮음** (재료·준비 부담 小)', '높으면 사장님이 반값에 못 품'],
  ['C5', '**당일 취소가 실제로 자주 발생**', '공급의 원천이 여기서 나옴'],
  ['C6', '**초면 고객을 즉시 받을 수 있음**', '사전 상담·진단이 필요하면 즉시 예약 불가'],
], [700, 4100, 4838]));
c.push(GAP());
c.push(P('**C7 (탈락 조건)**: 의료행위에 해당하면 **무조건 제외** — A-3 참조.', { color: RED, boldColor: RED }));

c.push(H2('A-2. Tier 1 — Day 1 진입 (강남구 런칭 대상)'));
c.push(TBL(['업종', '소요', '한계비용', '당일취소', '판정'], [
  ['**네일아트 / 페디큐어**', '60~90분', '낮음 (재료 소액)', '높음', { t: '최우선', color: GREEN }],
  ['**속눈썹 연장·펌**', '60~90분', '낮음', '높음', { t: '최우선', color: GREEN }],
  ['**헤어 — 커트·드라이·스타일링**', '20~40분', '거의 0', '높음', { t: '최우선', color: GREEN }],
  ['**마사지·스파**', '60~90분', '거의 0', '높음', { t: '최우선', color: GREEN }],
  ['**피부관리샵** (비의료 에스테틱)', '60~90분', '낮음', '높음', { t: '최우선', color: GREEN }],
  ['왁싱', '20~40분', '낮음', '높음', '가능'],
  ['두피·헤어 클리닉', '40~60분', '낮음', '중간', '가능'],
  ['발관리·족욕', '40~60분', '낮음', '중간', '가능'],
  ['태닝', '20~30분', '거의 0', '중간', '가능'],
], [3000, 1500, 2100, 1400, 1638]));
c.push(GAP());
c.push(...BOX(['**런칭 앵커 5종**: 네일 · 속눈썹 · 헤어(커트/드라이) · 마사지 · 피부관리',
               '이 5개가 6개 조건을 모두 충족하고, 강남구 밀도도 가장 높습니다.']));

c.push(H2('A-3. Tier 2 — 3~6개월 후, 별도 검증 필요'));
c.push(TBL(['업종', '판정', '걸리는 조건'], [
  ['**골프 타석 · 스크린골프**', { t: '적합', color: GREEN }, '사실상 순수 시간재고. 1:다수 성격 혼재 → 2단계와 경계'],
  ['**세차 · 디테일링**', { t: '적합', color: GREEN }, '"차량" 이동수단과 궁합이 좋음'],
  ['사진 스튜디오 (프로필·증명)', '가능', 'C6 (컨셉 협의가 필요할 수 있음)'],
  ['메이크업 · 헤어 스타일링', '가능', 'C5 (당일 취소 빈도 확인 필요)'],
  ['PT · 필라테스 · 요가 드롭인', { t: '보류', color: ORANGE }, '**회원제 장기계약 구조와 충돌.** 기존 회원 반발'],
  ['반려동물 미용', { t: '보류', color: ORANGE }, '**C6 위반** — 반려동물을 데리러 가야 하므로 "즉흥" 불가'],
  ['헤어 — 펌 · 염색', { t: '보류', color: ORANGE }, '**C3·C4 위반** — 2~3시간 + 약제 재료비 큼'],
  ['실내클라이밍 · 볼링 · 당구', { t: '보류', color: ORANGE }, '1:다수 구조 → **2단계로 이관 권고**'],
], [3000, 1300, 5338]));

c.push(H2('A-4. Tier 3 — 1단계에서 명시적 제외'));
c.push(TBL(['업종', '제외 사유'], [
  [{ t: '**피부과 · 성형외과 · 치과 · 한의원 등 의료기관**', color: RED },
   { t: '**의료법 제27조 제3항 — 영리 목적 환자 유인·알선 금지.** 할인 쿠폰·타임세일 형태의 환자 유치는 저촉 소지가 크고 **형사처벌 대상**입니다. 플랫폼 운영자도 "알선" 주체가 될 수 있습니다. **1단계에서 절대 열지 않습니다.**', color: RED }],
  ['의원 부설 피부·비만 프로그램', '위와 동일'],
  ['학원 · 과외', 'C1·C3 위반 (장기 계약 구조)'],
  ['법률 · 세무 · 노무 상담', '신뢰재(credence good). 할인 자체가 품질 부정 신호'],
  ['숙박', '3단계'],
  ['음식', '4단계'],
], [3200, 6438]));

c.push(H2('A-5. 가장 위험한 경계선 — "미용업"과 "의료행위"'));
c.push(P('뷰티 카테고리는 겉보기에 붙어 있지만 **법적으로 완전히 다른 두 영역**입니다.'));
c.push(TBL(['구분', '근거 법령', '채움'], [
  ['네일·속눈썹·왁싱·에스테틱·헤어', '공중위생관리법상 **미용업**', { t: '**허용**', color: GREEN }],
  ['레이저·필러·보톡스·리프팅 시술', '**의료행위**', { t: '**금지**', color: RED }],
], [3600, 3600, 2438]));
c.push(GAP());
c.push(P('**온보딩 필수 절차**: 가맹 심사 시 **영업신고증의 업태를 육안 확인**하고, 미용업 신고가 없는 곳은 등록을 차단합니다. 이 절차 하나가 형사 리스크를 막습니다.'));
c.push(P('**마사지업 주의**: 안마·지압 표방 시 의료법상 안마사 자격 이슈가 있으므로, 등록 상품명을 **"스포츠·아로마 테라피"** 등으로 제한합니다.'));
c.push(GAP());
c.push(...BOX(['**확장 원칙 한 줄**', '"시간이 재고인가, 그리고 초면인 사람을 지금 받을 수 있는가."',
               '두 질문에 모두 "예"면 채움에 들어오고, 하나라도 "아니오"면 다음 단계로 미룹니다.'], NAVY));

/* ---- 부록 B ---- */
c.push(BREAK());
c.push(H1('부록 B. 리스크 자문 의견 (상세)'));
c.push(P('회의에서 이미 다룬 "상시 할인화"·"초기 공급 확보"는 B-3으로 내리고, **회의에서 나오지 않았는데 더 치명적인 것**부터 올립니다.', { size: 19, color: GREY }));

c.push(H2('B-1. Critical — 이게 안 풀리면 발표든 사업이든 막힙니다'));

c.push(H3('R-A. 역선택(Adverse Selection) — "여긴 왜 비어 있지?"', RED));
c.push(P('당근의 중고 물건과 마감히어로의 빵은 **누가 팔든 물건이 같습니다.** 서비스는 다릅니다. 빈 슬롯을 파는 가게는 정의상 **손님이 없는 가게**이고, 사용자는 그 사실을 압니다.'));
c.push(P('할인이 곧 **"실력이 없다"는 신호**로 읽히는 순간 플랫폼 전체의 품질 인식이 무너집니다. 이건 가격 문제가 아니라 **신호(signal) 문제**라서 할인폭을 조절해도 풀리지 않습니다.'));
c.push(P('**대응**'));
c.push(NLI('**초기 100개는 직접 심사해서 큐레이션.** 자동 등록을 열지 않습니다'));
c.push(NLI('프레이밍을 바꾼다 — "안 팔려서 떨이"가 아니라 **"신규 고객용 첫 방문 체험 슬롯"**. 잘 되는 가게도 신규 고객은 필요합니다'));
c.push(NLI('인기 매장이 **일부러** 슬롯을 여는 구조를 만든다 (R-B의 "신규 고객 한정"과 결합)'));

c.push(H3('R-B. 단골 카니발라이제이션 — 사장님 이탈의 1순위 원인', RED));
c.push(P('단골이 앱에서 반값 슬롯을 발견하는 순간, **그 단골은 다시는 정가를 내지 않습니다.** 사장님 입장에서 이건 "틈새 매출"이 아니라 **기존 매출의 파괴**입니다. 한 번 겪으면 즉시 탈퇴합니다.'));
c.push(P('**대응**'));
c.push(NLI('**신규 고객 한정 노출** — 결제 전화번호 대조로 해당 매장의 기존 고객에게는 숨김. 기술적으로 어렵지 않고, **사장님 설득의 결정적 카드**입니다'));
c.push(NLI('월 노출 슬롯 수 상한 (상시 할인화 방지와 같은 장치로 동시 해결)'));
c.push(NLI('사장님에게 **"체험 → 정가 재방문 전환율" 리포트**를 제공해 ROI를 증명'));

c.push(H3('R-C. 도달가능성 필터의 양날 — 강남구에서는 절반만 작동합니다', RED));
c.push(P('핵심 기능이니 숫자로 검증해야 합니다. 강남구 면적은 **39.5km²**, 최장 직선거리 약 9km입니다.'));
c.push(TBL(['이동수단', '마감 30분 전 기준 반경', '강남구 커버율'], [
  ['도보 (4km/h)', '2.0km', { t: '**약 32%** — 필터가 실제로 작동', color: GREEN }],
  ['자전거 (15km/h)', '7.5km', { t: '**사실상 100%** — 아무것도 거르지 않음', color: RED }],
  ['차량 (18km/h)', '9.0km', { t: '**사실상 100%** — 동일', color: RED }],
], [2400, 2900, 4338]));
c.push(GAP());
c.push(P('**즉, 강남구 단일 런칭에서는 자전거·차량 사용자에게 이 필터가 거의 무의미합니다.** 자전거 기준으로 필터가 의미를 가지려면 **마감까지 20분 이하**여야 합니다.'));
c.push(P('**그래서 어떻게 할 것인가 — 프레이밍을 바꾸는 게 정답입니다**'));
c.push(LI('필터를 **"거리 제한"이 아니라 "도착 보증(Arrival Guarantee)"** 으로 정의하십시오. "반경을 좁혀주는 기능"이 아니라 **"못 갈 곳은 아예 안 띄워서 헛걸음을 0으로 만드는 신뢰 장치"** 입니다. 이러면 커버율이 100%여도 가치가 유효합니다'));
c.push(LI('필터의 진짜 변별력은 **반경이 아니라 "마감 임박도"** 에서 나옵니다. 마감 임박 슬롯 비중을 늘리는 운영이 곧 필터의 가치를 높이는 운영입니다'));
c.push(LI('서울 전역으로 확장하면 필터가 강하게 작동합니다 — **확장할수록 강해지는 기능**이라는 점은 오히려 좋은 스토리입니다'));
c.push(LI('발표 때 "1km인데 자전거 25분"류의 숫자는 절대 쓰지 마십시오. 검증 가능한 숫자만 씁니다'));

c.push(H3('R-D. 수요 모수의 얇음 — 교집합이 너무 작다', RED));
c.push(P('"지금 시간이 비었고 × 강남에 있고 × 네일을 받고 싶고 × 앱을 켰다"의 교집합은 극히 작습니다. 초기 MAU 1만 명이어도 특정 순간 특정 슬롯을 보는 사람은 **수십 명 수준**입니다.'));
c.push(P('이것이 이 사업의 **진짜 병목**입니다. 공급이 아니라 수요입니다.'));
c.push(...BOX([
  '**대응 — 초기 제품에 반드시 들어가야 할 기능 하나**',
  '**조건 예약 알림(위시리스트)**: "강남역 근처 네일, 평일 오후, 30% 이상"을 미리 걸어두면 슬롯이 뜨는 순간 푸시.',
  '앱을 켜고 있는 사람만 상대하면 이 사업은 성립하지 않습니다. **푸시가 사실상의 본체입니다.**',
], RED));

c.push(H2('B-2. 중대 — 지금 설계에 반영해야 하는 것'));
c.push(H3('R-E. 의료법 리스크 (뷰티 확장 시)', ORANGE));
c.push(P('피부과·성형외과 등 의료기관 대상 할인 중개는 **의료법 제27조 제3항(영리 목적 환자 유인·알선)** 저촉 소지가 크고 형사처벌 대상입니다. 플랫폼도 "알선" 주체가 될 수 있습니다. 1단계에서 의료기관 **전면 제외**, 온보딩 시 **영업신고증 업태 확인 절차 필수**. (부록 A-4·A-5 참조)'));
c.push(H3('R-F. 위치기반서비스 규제', ORANGE));
c.push(P('위치정보법상 **위치기반서비스사업 신고** 대상입니다. 설계 원칙으로 **상시 추적이 아니라 검색 요청 시점 1회 수집**으로 제한하고, 이를 오히려 신뢰 마케팅 포인트로 씁니다.'));
c.push(H3('R-G. "빨리 가라"가 만드는 안전 리스크', ORANGE));
c.push(P('"20분 남음 + 차량" 조합은 구조적으로 **과속을 유도**합니다. 배달 플랫폼이 라이더 안전 이슈로 겪은 문제와 같은 구조이고, 사고 1건이 브랜드를 죽입니다. 버퍼를 넉넉히, **잔여 15분 이하에서는 차량 옵션을 자동 숨김**, 이동 중 알림 최소화.'));
c.push(H3('R-H. P성향 타겟의 LTV', ORANGE));
c.push(P('즉흥형 사용자는 **재방문 주기가 불규칙하고 앱 충성도가 낮습니다.** 광고 모델이 성립하려면 필요한 MAU 규모가 예상보다 큽니다. 무수수료 기간이 길어질 각오를 하고, Phase 1 종료 조건을 "기간"이 아니라 **"슬롯 성사율 지표"** 로 잡아야 합니다.'));

c.push(H2('B-3. 관리 가능 — 회의에서 이미 다룬 것'));
c.push(TBL(['리스크', '현재 대응의 평가'], [
  ['**상시 할인화 ("상수가 된다")**', '회의 논리(슬롯 구조상 상시 광고가 어렵다)는 **맞지만 약합니다.** 마음먹으면 매일 올릴 수 있습니다. **월 노출 슬롯 수 상한**이라는 수치 장치를 반드시 같이 제시하십시오'],
  ['**초기 공급 확보**', '강남구 한정 + 무수수료로 통제 가능. 다만 진짜 병목은 공급이 아니라 **수요**입니다(R-D). 초기 사용자 확보 채널을 공급 영업보다 먼저 설계하십시오'],
  ['**노쇼**', '선결제 + 도달 필터 이중 방어. **이 부분은 설계가 잘 되어 있습니다**'],
  ['**대형 플랫폼의 모방**', '네이버·카카오는 "미래 예약" 최적화 구조라 즉흥 수요는 카니발라이제이션 우려로 잘 건드리지 않습니다. 그 사이 **공급자 관계와 큐레이션 자산**을 선점하는 것이 유일한 방어입니다'],
], [2700, 6938]));

c.push(H2('B-4. 예상 질문 Top 5 (이 순서로 들어옵니다)'));
c.push(TBL(['#', '질문', '답변 근거'], [
  ['1', '"빈 슬롯을 파는 가게는 결국 안 되는 가게 아닌가요?"', 'R-A'],
  ['2', '"단골이 할인가를 알게 되면 사장님이 손해 아닌가요?"', 'R-B'],
  ['3', '"강남구 안에서 자전거 30분이면 어차피 다 가는데, 그 필터가 왜 필요합니까?"', 'R-C'],
  ['4', '"지금 시간이 비어 있고 네일을 받고 싶은 사람이 몇 명이나 됩니까?"', 'R-D'],
  ['5', '"네이버나 카카오가 그대로 따라 하면 어떻게 합니까?"', 'B-3'],
], [600, 7500, 1538]));
c.push(GAP());
c.push(P('**1·2번에 답이 준비되면 이 발표는 통과합니다. 3·4번은 숫자를 들고 가야 합니다.**'));

c.push(H2('B-5. 결론'));
c.push(P('**아이디어 자체는 유효합니다.** "시간 재고"라는 정의와 "선결제"는 설계가 단단하고, 서비스업 × 즉시성이라는 공백도 실재합니다.'));
c.push(P('다만 **지금 기획안이 가장 자신 있어 하는 부분(도달가능성 필터)이 초기 조건에서는 가장 약하고(R-C), 아직 손대지 않은 부분(역선택·단골 카니발라이제이션)이 가장 치명적입니다.** 발표 준비 시간을 여기에 배분하시길 권합니다.'));
c.push(...BOX([
  '가장 시급한 한 가지를 꼽자면 — **R-B (단골 카니발라이제이션)** 입니다.',
  '"신규 고객 한정 노출" 한 줄이 들어가는 순간, 이 서비스는 사장님에게 **"기존 매출을 깎아먹는 할인 채널"에서 "광고비를 매출로 받는 신규 고객 획득 채널"** 로 바뀝니다. 공급자 설득 논리 전체가 여기에 걸려 있습니다.',
], NAVY));

/* ---- 부록 C ---- */
c.push(BREAK());
c.push(H1('부록 C. 10분 발표 흐름 (초안)'));
c.push(TBL(['순서', '내용', '시간'], [
  ['1', '빈 의자 사진 한 장 — "이 1시간은 다시 팔 수 없습니다"', '0:40'],
  ['2', '두 개의 빈칸 (사장님 / 나)', '1:00'],
  ['3', '채움 = 두 빈칸을 잇는다 (한 줄 정의)', '0:40'],
  [{ t: '**4**', color: NAVY }, { t: '**핵심 데모 — 도보/자전거/차량에 따라 화면이 달라진다**', color: NAVY }, { t: '**2:00**', color: NAVY }],
  ['5', '왜 아무도 못 했나 (경쟁 지도)', '1:00'],
  ['6', '단계별 확장 4단계', '1:00'],
  ['7', '강남구 · 선결제 · 무수수료 (운영 3원칙)', '1:00'],
  ['8', '수익 모델 3단계 + ESG', '1:20'],
  ['9', '리스크(역선택·카니발라이제이션)와 대응', '0:40'],
  ['10', '로드맵 · Ask', '0:40'],
], [900, 7200, 1538]));
c.push(GAP());
c.push(...BOX([
  '**발표 전체를 관통하는 한 문장**',
  '"채움은 할인 앱이 아닙니다. **버려지는 시간을 거래 가능하게 만드는 인프라**입니다."',
], NAVY));

/* ---- 부록 D ---- */
c.push(H1('부록 D. 후속 액션'));
c.push(TBL(['담당', '할 일', '상태'], [
  ['Speaker 3', '리스크 자문 결과(부록 B)를 발표 자료에 반영', '진행'],
  ['Speaker 1', '유사 서비스 추가 리서치', '진행'],
  ['공통', '1단계 서비스업 카테고리 확정 (부록 A 기준 적용)', '완료'],
  ['공통', '강남구 미용·네일 업장 밀도 실측 (가맹 후보 리스트업)', '예정'],
  ['공통', '"신규 고객 한정 노출" 기능을 MVP 범위에 포함할지 결정', '예정'],
  ['Speaker 3', '발표용 PPT 제작', '예정'],
], [1500, 6600, 1538]));

/* ============================ DOC ============================ */
const doc = new Document({
  creator: '채움 TF',
  title: '채움 (Chaeum) — 신사업 제안서',
  description: '이동수단 기반 실시간 예약 마켓플레이스 제안',
  styles: {
    default: {
      document: { run: { font: FONT, size: 20, color: '262626' } },
    },
  },
  numbering: {
    config: [
      { reference: 'bul', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 420, hanging: 220 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 840, hanging: 220 } } } },
      ] },
      { reference: 'num', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 420, hanging: 260 } } } },
      ] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: 16838 },
        margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      },
    },
    children: c,
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync('/home/user/LMBA/채움_신사업_제안서.docx', b);
  console.log('written', b.length, 'bytes');
});
