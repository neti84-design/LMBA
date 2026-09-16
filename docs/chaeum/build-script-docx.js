const d = require('docx');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
        ShadingType, BorderStyle, AlignmentType, HeadingLevel, PageBreak, LevelFormat,
        convertMillimetersToTwip } = d;

const FONT = '맑은 고딕';
const NAVY = '1F3864', BLUE = '2E5C8A', GREY = '595959', LIGHT = 'F2F5F9', RED = 'B02A2A';
const MARGIN = convertMillimetersToTwip(18);
const PAGE_W = 11906;
const TW = PAGE_W - MARGIN * 2;   // 10,886

function runs(text, o = {}) {
  const base = { font: FONT, size: o.size || 22, color: o.color || '1A1A1A' };
  const out = [];
  text.split(/(\*\*[^*]+\*\*)/g).forEach(part => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**'))
      out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true, color: o.boldColor || base.color }));
    else out.push(new TextRun({ ...base, text: part }));
  });
  return out;
}
const P = (t, o = {}) => new Paragraph({
  children: runs(t, o), alignment: o.align,
  spacing: { before: o.before ?? 60, after: o.after ?? 110, line: o.line ?? 300 },
  indent: o.indent,
});
const H1 = t => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 30, bold: true, color: NAVY })],
  heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 180 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 6 } },
});
const SLIDE = (n, title, dur) => new Paragraph({
  children: [
    new TextRun({ text: `S${n}`, font: FONT, size: 30, bold: true, color: 'FFFFFF' }),
    new TextRun({ text: '   ' + title + '   ', font: FONT, size: 26, bold: true, color: 'FFFFFF' }),
    new TextRun({ text: dur, font: FONT, size: 22, color: 'D6E0EC' }),
  ],
  heading: HeadingLevel.HEADING_2,
  shading: { type: ShadingType.CLEAR, fill: NAVY, color: 'auto' },
  spacing: { before: 320, after: 140, line: 300 },
  indent: { left: 140, right: 140 },
});
const SCREEN = t => new Paragraph({
  children: [
    new TextRun({ text: '화면   ', font: FONT, size: 18, bold: true, color: BLUE }),
    ...runs(t, { size: 18, color: GREY }),
  ],
  spacing: { before: 0, after: 200, line: 264 }, indent: { left: 140, right: 140 },
});
const LINE = t => new Paragraph({
  children: runs(t, { size: 23, boldColor: NAVY }),
  spacing: { before: 90, after: 90, line: 340 },
  indent: { left: 340, right: 200 },
});
const CUE = t => new Paragraph({
  children: [
    new TextRun({ text: '▸ 전환   ', font: FONT, size: 18, bold: true, color: BLUE }),
    ...runs(t, { size: 18, color: GREY }),
  ],
  spacing: { before: 170, after: 60, line: 264 }, indent: { left: 140 },
});
const NOTE = (t, col) => new Paragraph({
  children: runs(t, { size: 19, color: col || RED, boldColor: col || RED }),
  spacing: { before: 120, after: 120, line: 276 }, indent: { left: 140, right: 140 },
  shading: { type: ShadingType.CLEAR, fill: LIGHT, color: 'auto' },
});
const LI = t => new Paragraph({
  children: runs(t, { size: 20 }), numbering: { reference: 'bul', level: 0 },
  spacing: { before: 50, after: 80, line: 288 },
});
function TBL(head, rows, w) {
  const mk = (txt, width, o = {}) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: o.fill || 'FFFFFF', color: 'auto' },
    margins: { top: 70, bottom: 70, left: 110, right: 110 }, verticalAlign: 'center',
    children: [new Paragraph({ children: runs(String(txt), { size: 19, color: o.color, boldColor: o.color }),
      spacing: { before: 0, after: 0, line: 264 } })],
  });
  return new Table({
    columnWidths: w, width: { size: TW, type: WidthType.DXA },
    rows: [
      new TableRow({ tableHeader: true, children: head.map((h, i) => new TableCell({
        width: { size: w[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: NAVY, color: 'auto' },
        margins: { top: 80, bottom: 80, left: 110, right: 110 }, verticalAlign: 'center',
        children: [new Paragraph({ children: [new TextRun({ text: h, font: FONT, size: 19, bold: true, color: 'FFFFFF' })], spacing: { before: 0, after: 0 } })],
      })) }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((cc, i) => {
        const o = (typeof cc === 'object' && cc !== null) ? cc : { t: cc };
        return mk(o.t, w[i], { fill: ri % 2 ? 'F7F9FC' : 'FFFFFF', color: o.color });
      }) })),
    ],
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
const GAP = (n = 140) => new Paragraph({ children: [], spacing: { before: 0, after: n } });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

const c = [];

/* 표지 */
c.push(new Paragraph({ children: [], spacing: { after: 2000 } }));
c.push(new Paragraph({ children: [new TextRun({ text: '10분 발표 대본', font: FONT, size: 22, color: GREY, characterSpacing: 60 })], alignment: AlignmentType.CENTER, spacing: { after: 260 } }));
c.push(new Paragraph({ children: [new TextRun({ text: '채움', font: FONT, size: 84, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }));
c.push(new Paragraph({ children: [new TextRun({ text: '비어 있는 예약 한 자리를, 지금 갈 수 있는 사람에게', font: FONT, size: 24, color: '1A1A1A' })], alignment: AlignmentType.CENTER, spacing: { after: 700 } }));
c.push(new Paragraph({ children: [new TextRun({ text: '슬라이드 12장  ·  실측 9:06  ·  10:00까지 여유 53초', font: FONT, size: 22, bold: true, color: BLUE })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
c.push(new Paragraph({ children: [new TextRun({ text: '기준 속도 300자/분 (발표용 호흡 포함)', font: FONT, size: 19, color: GREY })], alignment: AlignmentType.CENTER, spacing: { after: 1400 } }));
c.push(new Paragraph({
  children: [
    new TextRun({ text: '읽는 법      ', font: FONT, size: 20, bold: true, color: NAVY }),
    new TextRun({ text: '  /  = 한 박자 쉼        ', font: FONT, size: 20, color: '1A1A1A' }),
    new TextRun({ text: '굵은 글씨 = 힘주어 말할 곳', font: FONT, size: 20, bold: true, color: '1A1A1A' }),
  ], alignment: AlignmentType.CENTER,
}));
c.push(BREAK());

/* 시간 배분 */
c.push(H1('시간 배분'));
c.push(TBL(['슬라이드', '누적', '분량', '비고'], [
  ['S1 두 사람 → 브리지', '0:00', '1:09', '천천히. 여기서 서두르면 전부 무너집니다'],
  [{ t: '**S2 핵심 데모**', color: RED }, { t: '1:09', color: RED }, { t: '**1:18**', color: RED }, { t: '**발표의 심장. 절대 줄이지 말 것**', color: RED }],
  ['S3 세 가지 효과', '2:28', '0:28', ''],
  ['S4 사장님 화면', '2:56', '0:23', ''],
  ['S5 경쟁 지도', '3:20', '0:32', ''],
  ['S6 확장 4단계', '3:53', '1:28', '두 번째로 중요한 슬라이드'],
  ['S7 소상공인 → 대기업', '5:22', '0:38', ''],
  ['S8 운영 3원칙', '6:00', '0:38', ''],
  ['S9 수익 — 언제, 얼마', '6:39', '0:52', '표를 손으로 짚으며'],
  ['S10 요청', '7:32', '0:20', '또박또박'],
  ['S11 두 가지 지적', '7:53', '0:35', ''],
  ['S12 클로징', '8:28', '0:37', '마지막 2초 침묵'],
  [{ t: '**합계**', color: NAVY }, '', { t: '**9:06**', color: NAVY }, { t: '10:00까지 여유 53초', color: NAVY }],
], [2600, 1200, 1200, 5886]));
c.push(BREAK());

/* 대본 */
c.push(H1('대본'));

const S = (n, title, dur, screen, lines, cue, pre) => {
  if (pre) c.push(NOTE(pre));
  c.push(SLIDE(n, title, dur));
  c.push(SCREEN(screen));
  lines.forEach(l => c.push(LINE(l)));
  if (cue) c.push(CUE(cue));
};

S(1, '두 사람 → 브리지', '1:09',
  '좌우 2분할. 왼쪽은 카페 창가에 혼자 앉은 사람의 손(손톱 클로즈업), 오른쪽은 텅 빈 네일샵 의자 하나. 자막 없음. 마지막에 두 이미지 사이에 "채움" 한 단어만 뜬다.',
  ['여기 두 사람이 있습니다. /',
   '한 사람은 오랜만에 반차를 냈습니다. 오후 두 시, 회사 밖으로 나왔는데 막상 갈 데가 없습니다. 무심코 손을 내려다봅니다. 손톱 정리를 한 게 언제였더라. 바쁘다는 핑계로 나를 이렇게까지 내버려 뒀나, 조금 한심한 기분이 듭니다. /',
   '다른 한 사람은 방금 전화를 받았습니다. 한 시 예약이 취소됐습니다. 가게가 텅 비었습니다. /',
   '두 사람은 서로의 존재를 모릅니다. **걸어서 십오 분 거리에 있는데도요.** /',
   '하지만 두 사람은, **서로에게 정확히 필요한 사람입니다.** /',
   '두 사람 사이에 있는 건 딱 두 가지입니다. **팔지 못하면 그대로 사라지는 한 시간**, 그리고 **어디로 갈지 모르는 두 시간.** 저희는 이 둘을 잇는 앱을 만들려고 합니다. 이름은 **채움**입니다. /',
   '그런데 여기서 진짜 질문이 하나 남습니다. **근처에 자리가 있다고 해서, 내가 정말 갈 수 있을까요.**'],
  '말을 끊지 말고 그대로 데모 화면으로');

c.push(BREAK());
S(2, '핵심 데모 — 이동수단 필터', '1:18',
  '3단 애니메이션. ① 사장님 등록 화면 ② 손님 화면의 마감 카운트다운 ③ 도보/자전거/차량 버튼을 누를 때마다 목록이 바뀌는 장면. 마지막에 한 줄 정의가 뜬다.',
  ['기존 앱들은 거리순으로 보여줍니다. 1킬로, 2킬로. 제시간에 도착할 수 있는지는 사용자가 알아서 계산해야 합니다. 채움은 반대로 합니다. **갈 수 있는 것만 보여줍니다.** /',
   '보시죠. 사장님이 등록합니다. 오늘 한 시부터 두 시, 마감은 열두 시 반. 정가 사만 원짜리 케어를 이만 사천 원에. /',
   '손님 화면에는 이렇게 뜹니다. **마감까지 38분.** 이 숫자는 실시간으로 줄어듭니다. /',
   '그리고 버튼이 세 개 있습니다. 도보, 자전거, 차량. 지금 이 가게까지 2.5킬로입니다. /',
   '**도보**를 누르면 38분, 준비 시간까지 43분. 38분 안에 못 갑니다. **화면에서 사라집니다.** /',
   '**자전거**를 누르면 10분. 여유가 23분 남습니다. **보입니다.** /',
   '차량도 주차 시간까지 18분. 보입니다. /',
   '**같은 시각, 같은 자리에 서 있어도, 이동수단에 따라 완전히 다른 화면을 봅니다.** /',
   '지금, 내가 갈 수 있는 거리 안에서, 비어 있는 예약 한 자리를 채운다. **이게 채움입니다.**'],
  '화면을 그대로 둔 채 "이 작은 장치가 세 가지를 만듭니다"',
  '★ 이 슬라이드가 발표의 심장입니다. 화면을 보고 말하십시오. "사라집니다"라고 할 때 실제로 항목이 사라지는 타이밍에 맞추십시오.');

S(3, '세 가지 효과', '0:28',
  '아이콘 3개 가로 배열. ① 헛걸음 제로 ② 짧은 목록, 높은 전환 ③ 가장 비싼 트래픽.',
  ['첫째, **헛걸음이 사라집니다.** 못 오는 사람에게는 애초에 안 보여주니까요. 노쇼를 정책이 아니라 **화면 설계로** 막는 겁니다.',
   '둘째, 목록은 짧아지는데 **예약 전환율은 올라갑니다.** 보이는 게 전부 진짜 갈 수 있는 것이니까요.',
   '셋째, 광고 상품의 근거가 생깁니다. **지금 여기 올 수 있는 사람**은 광고주에게 가장 비싼 트래픽입니다.'],
  '"사장님 화면도 잠깐 보여드리겠습니다"');

c.push(BREAK());
S(4, '사장님 화면', '0:23',
  '사장님 앱 목업. "이 슬롯을 지금 볼 수 있는 사람 47명 (도보 6·자전거 18·차량 23)" / "마감을 15분 늦추면 → 112명"',
  ['이 슬롯을 지금 볼 수 있는 사람 47명. 도보 6, 자전거 18, 차량 23. /',
   '마감을 15분만 늦추면 47명이 112명이 됩니다. /',
   '**가격을 깎으라고 하지 않습니다. 시간을 조정하라고 합니다.** 사장님에게 할인 말고 다른 레버를 하나 더 드리는 겁니다.'], null);

S(5, '경쟁 지도', '0:32',
  '2축 포지셔닝 맵. X축 = 카테고리(음식 ↔ 서비스업), Y축 = 시간축(미래 예약 ↔ 지금). 우상단만 비어 있고 거기에 채움.',
  ['기존 서비스들은 서로 다른 시간을 다룹니다. 네이버예약과 카카오헤어샵은 내일과 다음 주, 미래의 예약입니다. 마감히어로 같은 타임세일 앱은 오늘을 다루지만 음식만 다룹니다. /',
   '**지금부터 두 시간, 그리고 서비스업.** 이 칸이 비어 있습니다. /',
   '그리고 **이동수단으로 도달 가능성을 거르는 앱은, 저희가 찾아본 한 아직 없습니다.** 여기가 저희 자리입니다.'],
  '"그럼 네일샵 몇 개로 뭘 하겠냐는 질문이 남습니다"');

c.push(BREAK());
S(6, '확장 4단계', '1:28',
  '채움 사다리 4칸(서비스업 → 문화 → 숙박 → 포장음식). 각 칸 아래에 "새로 배우는 역량" 한 줄씩. 맨 마지막에 하단 작게 아마존 사다리가 겹쳐 뜬다.',
  ['확장은 네 단계로 갑니다. 그리고 이 순서에는 이유가 있습니다. /',
   '**1단계는 지금 보신 서비스업.** 재고 수량이 항상 하나고, 썩지 않고, 사장님 한 분이 결정합니다. 시간 재고 중에 가장 다루기 쉬운 형태입니다. 여기서 도달 엔진과 선결제를 완성합니다. /',
   '**2단계는 문화.** 연극, 영화, 방탈출, 보드게임. 전부 예약이고 오늘 지나면 사라집니다. 1단계 엔진을 그대로 쓰고, 새로 배우는 건 좌석이라는 **수량** 하나뿐입니다. /',
   '**3단계는 숙박.** 여기서 처음으로 공급자와 손님의 시간이 분리됩니다. 마감이 "몇 분 안에"에서 "오늘 자정까지"로 바뀝니다. /',
   '**4단계가 포장음식입니다.** 만두, 빵, 동네 과일가게. 사회적 가치는 가장 큰데 순서는 마지막입니다. 여기서 처음으로 시간이 아니라 **물건**을 팔거든요. 앱에 올려둔 사이 매장 손님이 사갑니다. /',
   '정리하면, **단계마다 새로 배우는 건 딱 하나입니다.** 나머지는 앞 단계에서 이미 만든 걸로 해결합니다. /',
   '아마존도 이렇게 갔습니다. 책, 음반, 전자제품, 마지막이 신선식품. **가장 관대한 상품으로 기본기를 익히고 한 칸씩 올라간 겁니다.**'],
  '사다리를 그대로 두고 색을 둘로 나누며',
  '1·2·3·4단계를 같은 억양으로 네 번 반복하면 사다리가 귀로 들립니다. 아마존은 맨 끝에 한 번만, 가볍게. 우리 논리가 먼저고 아마존은 방증입니다.');

c.push(BREAK());
S(7, '소상공인에서 대기업으로', '0:38',
  '같은 사다리에 색 오버레이. 1·4단계 = 소상공인(밀도), 2·3단계 = 대기업(규모). 오른쪽에 화살표: "첫 문 → 롯데시네마 · 롯데호텔"',
  ['여기서 한 가지가 더 보입니다. **1단계와 4단계는 소상공인이고, 2단계와 3단계는 대기업입니다.** /',
   '소상공인은 **밀도**를 만들고, 대기업은 **규모**를 만듭니다. 영화관 체인 한 곳과 계약하면 전국 수백 개 관의 빈 좌석이 한 번에 열립니다. /',
   '다만 순서를 못 바꿉니다. **대형 체인은 트래픽을 증명한 플랫폼에만 재고를 엽니다.** /',
   '그 첫 문을 **롯데시네마와 롯데호텔**에서 열면 됩니다. 레퍼런스 한 건이면 나머지는 따라옵니다.'], null);

S(8, '운영 3원칙', '0:38',
  '원칙 3개. ① 강남구 한 곳 ② 선결제 의무 ③ 단골에게는 안 보임.',
  ['운영은 세 가지 원칙으로 갑니다. /',
   '첫째, **강남구 한 곳에서만** 시작합니다. 밀도가 곧 매칭률입니다. 공급 백 개를 전국에 흩뿌리면 실패하고, 강남구에 몰면 작동합니다. /',
   '둘째, **선결제를 의무화합니다.** 크게 할인해준 사장님에게 노쇼는 재앙이니까요. /',
   '셋째, **그 가게의 단골에게는 할인 슬롯을 보여주지 않습니다.** 단골이 정가를 안 내게 되는 순간 사장님은 떠납니다. 이건 할인 채널이 아니라 **신규 고객 채널**입니다.'],
  '"그래서 언제, 얼마를 버느냐"');

c.push(BREAK());
S(9, '수익 — 언제, 얼마', '0:52',
  '4개년 표(거래액 / 매출 / 영업손익 / 누적)와 꺾은선 하나. 3년차 4분기에 0선을 통과하는 지점을 굵게 표시.',
  ['**1년차는 매출이 0입니다.** 의도한 겁니다. 수수료를 받지 않고, 강남구에서 가맹 400개와 거래액 5억을 만드는 게 전부입니다. /',
   '2년차에 광고를 켭니다. 서울 다섯 개 구로 넓히고 거래액 43억, 매출 2억. /',
   '3년차에 숙박까지 올라가면 거래액 200억, 매출 16억. **여기 4분기에 월 단위 흑자로 돌아섭니다.** /',
   '4년차에 연간 흑자 전환입니다. 매출 52억에 영업이익 17억. 누적 적자 최대치가 19억이니까 **필요한 투자는 약 20억, 회수 시점은 5년차 초입니다.** /',
   '하나만 강조드리면, **수수료는 끝까지 0입니다.** 이 매출은 전부 광고와 결제, 인증에서 나옵니다.'],
  null,
  '숫자를 외워서 읊으면 지어낸 것처럼 들립니다. 표를 손으로 짚으며 말하십시오.');
c.push(GAP());
c.push(TBL(['억 원', '1년차', '2년차', '3년차', '4년차'], [
  ['거래액 (GMV)', '5', '43', '202', '576'],
  ['매출', { t: '**0**', color: NAVY }, '2.2', '16.1', '51.8'],
  ['영업손익', { t: '-5.0', color: RED }, { t: '-10.0', color: RED }, { t: '-3.9', color: RED }, { t: '**+16.8**', color: '2E6B3E' }],
  ['누적 손익', '-5.0', '-15.0', { t: '**-18.9**', color: RED }, '-2.1'],
], [2486, 2100, 2100, 2100, 2100]));

c.push(BREAK());
S(10, '요청', '0:20',
  '큰 글씨로 North Star "채워진 슬롯 수". 아래에 요청 두 줄.',
  ['저희가 보는 지표는 하나입니다. **채워진 슬롯 수.** 그냥 사라졌을 시간 중에 매출로 바뀐 시간의 총량입니다. /',
   '그래서 필요한 것도 두 가지뿐입니다. **강남구에서의 여섯 달**, 그리고 2단계에서 문을 열어줄 **첫 대형 파트너 한 곳.**'], null);

S(11, '정면으로 받는 두 가지 지적', '0:35',
  '질문 두 개는 크게, 답은 아래에 작게.',
  ['가장 많이 받은 지적 두 가지를 미리 말씀드리겠습니다. /',
   '하나, **빈 슬롯을 파는 가게는 안 되는 가게 아니냐.** 그래서 초기 백 개는 저희가 **직접 심사**합니다. 떨이가 아니라 **첫 방문 체험 슬롯**입니다. /',
   '둘, **강남구 안에서는 자전거면 어차피 다 가지 않냐.** 맞습니다. 그래서 이 기능은 거리 제한이 아니라 **도착 보증**입니다. 못 갈 곳을 안 띄워주는 신뢰 장치이고, **서울 전역으로 넓어질수록 강해집니다.**'],
  '화면을 어둡게 하고');

c.push(BREAK());
S(12, '클로징 — 두 사람', '0:37',
  'S1과 같은 두 이미지. 이번에는 가운데 선이 이어져 있다. 마지막에 한 줄만 남는다.',
  ['처음의 두 사람으로 돌아가겠습니다. /',
   '반차를 낸 사람은 오후 두 시에 휴대폰을 엽니다. 자전거를 고릅니다. **12분 거리에 한 자리가 떠 있습니다.** /',
   '그 시간, 취소 전화를 받았던 사장님의 한 시간이 채워집니다. /',
   '두 사람은 여전히 서로를 몰랐습니다. **저희가 그걸 알고 있었을 뿐입니다.** /',
   '채움은 할인 앱이 아닙니다. **버려지는 시간을 거래 가능하게 만드는 인프라입니다.** /',
   '감사합니다.'],
  null,
  '"감사합니다" 전에 2초 멈추십시오. "인프라"라는 단어가 착지할 시간을 주십시오.');

/* 운영 노트 */
c.push(BREAK());
c.push(H1('시간이 밀릴 때 버릴 순서'));
c.push(P('**S2 · S6 · S9 · S12는 어떤 경우에도 건드리지 않습니다.**'));
c.push(TBL(['순서', '버릴 문장', '회수'], [
  ['1', 'S3의 셋째 항목(광고 트래픽) 전체 — S9에서 어차피 다시 나옵니다', '약 10초'],
  ['2', 'S8의 "공급 백 개를 전국에 흩뿌리면 실패하고, 강남구에 몰면 작동합니다."', '약 8초'],
  ['3', 'S5의 "네이버예약과 카카오헤어샵은…음식만 다룹니다." 두 문장', '약 12초'],
  ['4', 'S7의 "영화관 체인 한 곳과 계약하면 전국 수백 개 관의 빈 좌석이 한 번에 열립니다."', '약 10초'],
  ['5', 'S11의 둘째 지적(자전거·강남구) 전체 — Q&A로 넘기면 됩니다', '약 16초'],
], [800, 8286, 1800]));
c.push(GAP());
c.push(P('전부 빼면 **8:10.** 여유가 53초 있으니 실제로는 1~2번만 준비해 두면 충분합니다.'));

c.push(H1('전달 지침'));
c.push(LI('**S1은 낭독이 아니라 묘사입니다.** "손톱 정리를 한 게 언제였더라"에서 실제로 자기 손을 한 번 내려다보십시오. 청중이 같이 봅니다'));
c.push(LI('**"/" 는 한 박자입니다.** "두 사람은 서로의 존재를 모릅니다" 다음의 침묵이 이 발표에서 가장 비싼 2초입니다'));
c.push(LI('**S1 브리지에서 속도를 올리지 마십시오.** 문제 정의 슬라이드를 통째로 뺐기 때문에, "팔지 못하면 그대로 사라지는 한 시간"이라는 한 문장이 문제 정의 전체를 혼자 감당합니다'));
c.push(LI('입으로 말하는 숫자는 **데모에서 4개**(38분 · 2.5킬로 · 47명 · 112명), **재무에서 5개**(5억 · 43억 · 200억 · 52억 · 20억)뿐입니다. 나머지는 슬라이드에만 두십시오'));

c.push(BREAK());
c.push(H1('Q&A 대비'));
const QA = [
  ['Q1. 빈 슬롯을 파는 가게는 결국 안 되는 가게 아닌가요?',
   '맞는 지적입니다. 그래서 초기 백 개는 자동 등록을 열지 않고 저희가 직접 심사합니다. 그리고 프레임을 바꿉니다. 안 팔려서 내놓는 떨이가 아니라, **신규 고객을 위한 첫 방문 체험 슬롯**입니다. 잘 되는 가게도 신규 고객은 필요하고, 그 가게들이 들어와야 플랫폼이 삽니다.'],
  ['Q2. 단골이 할인가를 알게 되면 사장님만 손해 아닌가요?',
   '저희가 가장 크게 본 리스크가 그겁니다. 그래서 **결제 전화번호를 대조해서, 그 가게의 기존 고객에게는 그 가게의 할인 슬롯을 숨깁니다.** 기술적으로 어렵지 않고, 이 한 줄이 이 서비스를 할인 채널이 아니라 신규 고객 획득 채널로 바꿉니다.'],
  ['Q3. 그 재무 숫자의 근거가 뭡니까?',
   '시장 규모에서 역산한 게 아니라 **단위에서 쌓아 올린 숫자**입니다. 변수는 네 개뿐입니다. 가맹 수, 가맹당 월 성사 슬롯, 평균 객단가, 거래액 대비 수익률. 이 중 가장 불확실한 건 **가맹당 월 성사 슬롯**이고, 1년차에 저희가 검증하려는 것도 정확히 그 하나입니다. 월 8건이 안 나오면 나머지 숫자는 전부 다시 써야 한다고 보고 있습니다.'],
  ['Q4. 강남구 안에서 자전거 30분이면 어차피 다 가는데, 그 필터가 왜 필요합니까?',
   '정확합니다. 강남구는 39제곱킬로미터라 자전거 반경이 구 전체를 덮습니다. 그래서 저희는 이 기능을 **거리 제한이 아니라 도착 보증**으로 정의합니다. 못 갈 곳을 안 띄워서 헛걸음을 0으로 만드는 신뢰 장치입니다. 그리고 서울 전역으로 넓어질수록 이 기능은 **강해집니다.**'],
  ['Q5. 지금 시간이 비어 있고 네일을 받고 싶은 사람이 몇 명이나 됩니까?',
   '교집합이 얇다는 것이 이 사업의 진짜 병목이고, 저희도 그렇게 봅니다. 그래서 **조건 예약 알림을 초기 제품에 필수로 넣습니다.** "강남역 네일, 평일 오후, 30퍼센트 이상"을 걸어두면 슬롯이 뜨는 순간 푸시가 갑니다. 앱을 켜고 있는 사람만 상대하면 이 사업은 성립하지 않습니다.'],
  ['Q6. 네이버나 카카오가 그대로 따라 하면요?',
   '그쪽은 미래 예약에 최적화된 구조라, 즉흥 할인 수요는 자기 정가 예약을 갉아먹습니다. 쉽게 안 건드립니다. 그 사이에 저희가 확보해야 하는 건 기술이 아니라 **공급자 관계와 큐레이션 자산**입니다. 강남구 백 개를 직접 심사해서 모으는 6개월이 그 해자입니다.'],
];
QA.forEach(([q, a]) => {
  c.push(new Paragraph({ children: [new TextRun({ text: q, font: FONT, size: 22, bold: true, color: NAVY })], spacing: { before: 240, after: 100 } }));
  c.push(P(a, { indent: { left: 200 } }));
});
c.push(GAP());
c.push(NOTE('**답변 원칙** — 지적을 먼저 인정하고("맞는 지적입니다", "정확합니다"), 그다음 설계로 답하십시오. **방어하면 집니다.**'));

const doc = new Document({
  creator: '채움 TF', title: '채움 — 10분 발표 대본',
  description: '슬라이드 12장 · 실측 9:06',
  styles: { default: { document: { run: { font: FONT, size: 22, color: '1A1A1A' } } } },
  numbering: { config: [{ reference: 'bul', levels: [
    { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 420, hanging: 220 } } } }] }] },
  sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 },
    margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, children: c }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('/home/user/LMBA/채움_발표대본.docx', b); console.log('written', b.length); });
