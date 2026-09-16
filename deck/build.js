/* ============================================================
   L.GA 발표자료 빌드 — IR 덱 표준 9블록 구성
   First page · Problem · Solution · Market · Business models
   · Traction · Team · Ask · Last page
   디자인 토큰·그리드·자동 높이는 design.js, 대본은 notes.js
   ============================================================ */
const pptxgen = require("pptxgenjs");
const D = require("./design.js");
const NOTES = require("./notes.js");
const { F, C, T, LH, LHt, G, cols, colX, spread, textH, checkFit } = D;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "LMBA Team";
pres.title  = "L.GA - Lotte Growth Analytics (IR Deck)";

let SLIDE = 0;
function newSlide(dark){
  const s = pres.addSlide();
  if (dark) s.background = { color: C.ink };
  SLIDE++;
  s.addNotes(NOTES[SLIDE-1]);
  return s;
}

/* ---------- 텍스트: 높이를 내용에서 계산 ---------- */
function tx(s, text, o){
  const size = o.size || T.body;
  const lh   = o.lh   || LH(size);
  const h    = o.h != null ? o.h : textH(text, o.w, size, lh) + 0.03;
  if (o.h != null && !o.noCheck) checkFit("S"+SLIDE, text, o.w, o.h, size, lh);
  s.addText(text, { x:o.x, y:o.y, w:o.w, h,
    fontFace:F, fontSize:size, lineSpacing:lh, bold:!!o.bold,
    color:o.color || C.ink, align:o.align || "left", valign:o.valign || "top",
    charSpacing:o.cs, margin:0, isTextBox:true });
  return h;
}
/* 불릿 목록의 높이 */
const BGAP = 7;                                    // 항목 사이 간격(pt)
function bulletsH(arr, w, size){
  const iw = w - 0.20;                             // 불릿 들여쓰기 보정
  return arr.reduce((a,t)=>a + textH(t, iw, size), 0) + (arr.length-1)*BGAP/72;
}
function bulletsTx(s, arr, o){
  const size = o.size || T.small;
  const h = o.h != null ? o.h : bulletsH(arr, o.w, size) + 0.03;
  if (o.h != null) checkFit("S"+SLIDE+" list", arr.join("\n"), o.w-0.20, o.h, size, LH(size));
  s.addText(arr.map((t,i)=>({ text:t, options:{ bullet:true, breakLine:i<arr.length-1 }})),
    { x:o.x, y:o.y, w:o.w, h, fontFace:F, fontSize:size, lineSpacing:LH(size),
      color:o.color || C.ink, paraSpaceAfter:BGAP, valign:"top", margin:0, isTextBox:true });
  return h;
}

/* ---------- 도형 ---------- */
const shadow = () => ({ type:"outer", color:"98A2B3", blur:16, offset:2, angle:90, opacity:0.16 });
function box(s, x, y, w, h, fill, opt){
  const o = opt || {};
  s.addShape(pres.ShapeType.roundRect, { x,y,w,h, fill:{color:fill}, rectRadius:0.06,
    line:{ color:o.line || (fill===C.tint ? C.line : fill), width:1 },
    shadow: o.shadow ? shadow() : undefined });
}

/* ---------- 슬라이드 머리 ----------
   n = IR 블록 번호, block = 블록 이름(우측 상단에 표시) */
function head(s, n, title, sub, opt){
  const o = opt || {}, dark = !!o.dark;
  const cw = String(n).length > 2 ? 0.92 : 0.48;
  s.addShape(pres.ShapeType.roundRect, { x:G.M, y:0.44, w:cw, h:0.46,
    fill:{color: dark ? C.red : C.red}, rectRadius:0.08 });
  tx(s, String(n), { x:G.M, y:0.44, w:cw, h:0.46, size:String(n).length>2?12:15, bold:true,
    color:C.white, align:"center", valign:"middle", noCheck:true });
  const tX = G.M + cw + 0.18;
  tx(s, title, { x:tX, y:0.40, w:9.0, h:0.56, size:T.h2, lh:LHt(T.h2), bold:true,
    color: dark ? C.white : C.ink, valign:"middle" });
  if (sub) tx(s, sub, { x:tX, y:1.02, w:G.W-G.M-tX, size:12.5,
    color: dark ? C.muteW : C.slate });
  if (o.block) tx(s, o.block,
    { x:9.9, y:0.50, w:G.W-G.M-9.9, h:0.34, size:T.tag, bold:true, align:"right", cs:1.4,
      color: dark ? C.amber : C.slate, valign:"middle", noCheck:true });
}

/* ---------- 하단 한 줄 ---------- */
function foot(s, text, o){
  const op = o || {};
  tx(s, text, { x:G.M, y:G.foot, w:G.CW, h:0.40, size:op.size || 13, bold:true,
    align:"center", valign:"middle", color:op.color || C.ink, noCheck:true });
}
function band(s, y, text, size){
  const fs = size || T.lead;
  const h = Math.max(0.82, textH(text, G.CW-0.8, fs, LH(fs)) + 0.44);
  s.addShape(pres.ShapeType.roundRect, { x:G.M, y, w:G.CW, h, fill:{color:C.ink}, rectRadius:0.06 });
  tx(s, text, { x:G.M+0.4, y, w:G.CW-0.8, h, size:fs, bold:true, color:C.white,
    align:"center", valign:"middle", noCheck:true });
  return h;
}

/* ---------- 카드: 높이를 내용에서 계산해 한 줄을 같은 높이로 ---------- */
function cardH(it, iw){
  let h = G.padY;
  if (it.tag)   h += textH(it.tag, iw, T.tag) + 0.08;
  if (it.title) h += textH(it.title, iw, it.titleSize || T.h3, LHt(it.titleSize || T.h3)) + 0.12;
  if (it.sub)   h += textH(it.sub, iw, T.micro) + 0.10;
  if (it.list)  h += bulletsH(it.list, iw, it.bodySize || T.small) + 0.04;
  if (it.body)  h += textH(it.body, iw, it.bodySize || T.small) + 0.04;
  if (it.foot)  h += 0.14 + textH(it.foot, iw, T.micro);
  return h + G.padY;
}
function drawCard(s, it, x, y, w, h, off){
  const iw = w - G.padX*2, dark = !!it.dark;
  box(s, x, y, w, h, dark ? C.ink : (it.fill || C.tint), { shadow:!it.flat });
  let cy = y + G.padY + (off || 0);
  if (it.tag)   cy += tx(s, it.tag, { x:x+G.padX, y:cy, w:iw, size:T.tag, bold:true, cs:1,
                    color: dark ? C.amber : C.red }) + 0.08;
  if (it.title) cy += tx(s, it.title, { x:x+G.padX, y:cy, w:iw, size:it.titleSize||T.h3,
                    lh:LHt(it.titleSize||T.h3), bold:true, color: dark ? C.white : C.ink }) + 0.12;
  if (it.sub)   cy += tx(s, it.sub, { x:x+G.padX, y:cy, w:iw, size:T.micro,
                    color: dark ? C.muteW : C.slate }) + 0.10;
  if (it.list)  cy += bulletsTx(s, it.list, { x:x+G.padX, y:cy, w:iw, size:it.bodySize||T.small,
                    color: dark ? C.white : C.ink }) + 0.04;
  if (it.body)  cy += tx(s, it.body, { x:x+G.padX, y:cy, w:iw, size:it.bodySize||T.small,
                    color: dark ? C.muteW : C.ink }) + 0.04;
  if (it.foot)  tx(s, it.foot, { x:x+G.padX, y:y+h-G.padY-textH(it.foot,iw,T.micro), w:iw,
                    size:T.micro, bold:true, color: dark ? C.muteW : C.slate });
}
/* 한 줄에 n개 — 가장 높은 카드에 맞춰 전부 같은 높이 */
function rowNat(items, w){
  return Math.max(...items.map(it => cardH(it, (w || cols(items.length)) - G.padX*2)));
}
function cardRow(s, items, y, opt){
  const o = opt || {}, n = items.length, w = o.w || cols(n);
  const nat = rowNat(items, w);
  const h = o.h || nat;
  const off = Math.max(0, (h - nat) / 2);
  items.forEach((it,i)=> drawCard(s, it, o.x ? o.x(i) : colX(i,n), y, w, h, off));
  return h;
}
/* 근거 등급 칩 — 사실 / 업계 통상치 / 가정 */
function gradeChip(s, x, y, w, h, label, kind){
  const fill = kind==="fact" ? C.ink : (kind==="bench" ? C.red : C.line);
  const col  = kind==="assume" ? C.slate : C.white;
  s.addShape(pres.ShapeType.roundRect, { x, y:y+(h-0.34)/2, w, h:0.34,
    fill:{color:fill}, rectRadius:0.05 });
  tx(s, label, { x, y:y+(h-0.34)/2, w, h:0.34, size:T.micro, bold:true, color:col,
    align:"center", valign:"middle", noCheck:true });
}

/* ============================================================ 1. First page (20초×2) */
let s = newSlide(true);
tx(s, "롯데그룹 신사업 제안",
  { x:0.9, y:1.28, w:6.6, size:T.tag, bold:true, color:C.amber, cs:2 });
tx(s, "L.GA", { x:0.86, y:1.66, w:6.4, h:1.15, size:T.hero, lh:LHt(T.hero), bold:true,
  color:C.white, noCheck:true });
tx(s, "Lotte Growth Analytics", { x:0.9, y:2.92, w:6.4, size:T.lead, color:C.mute });
tx(s, "브랜드가 모르는 자기 고객을 알려주는\n오프라인 리테일 데이터 솔루션",
  { x:0.9, y:3.60, w:6.2, size:20, lh:34, bold:true, color:C.white });
box(s, 0.9, 5.22, 6.2, 0.92, C.ink2);
tx(s, "Lifetime Value Creator", { x:1.24, y:5.38, w:5.5, size:12.5, bold:true, color:C.amber });
tx(s, "결제한 순간에만 쌓이던 고객 가치를, 사지 않은 순간까지 넓힙니다.",
  { x:1.24, y:5.68, w:5.6, size:T.small, color:C.muteW });
tx(s, "롯데그룹 핵심인재 MBA 과정  |  최종 발표",
  { x:0.9, y:6.62, w:6.4, size:T.micro, color:C.slate });
/* 우측 — CVP */
box(s, 7.85, 1.55, 4.85, 4.59, C.ink2);
tx(s, "CUSTOMER VALUE PROPOSITION", { x:8.28, y:2.00, w:4.0, size:T.micro, bold:true,
  color:C.mute, cs:1.6 });
tx(s, "온라인에 GA가 있다면,\n오프라인 매장에는\nL.GA가 있습니다.",
  { x:8.28, y:2.46, w:4.1, size:23, lh:38, bold:true, color:C.white });
[["측정","안 산 97명을 숫자로"],["처방","그래서 무엇을 바꿔야 하는가"],["증명","POS 결제로 전후 실측"]]
  .forEach((p,i)=>{
    const y = 4.28 + i*0.60;
    s.addShape(pres.ShapeType.roundRect, { x:8.28, y:y, w:0.86, h:0.40,
      fill:{color:C.red}, rectRadius:0.05 });
    tx(s, p[0], { x:8.28, y:y, w:0.86, h:0.40, size:T.small, bold:true, color:C.white,
      align:"center", valign:"middle", noCheck:true });
    tx(s, p[1], { x:9.30, y:y, w:3.1, h:0.40, size:T.small, color:C.muteW, valign:"middle" });
  });

/* ============================================================ 2. Problem ① (60초) */
s = newSlide(true);
head(s, "01", "매일 97명의 데이터가 그냥 삭제됩니다",
  "브랜드가 데이터로 아는 고객은 결제한 사람뿐입니다 — 온라인이라면 전부 로그로 남았을 데이터입니다",
  { dark:true, block:"PROBLEM" });
const pbW = 5.40, pbH = G.bottomF - G.top;
box(s, G.M, G.top, pbW, pbH, C.ink2);
tx(s, "매장에 들어오는 100명 중", { x:G.M+0.40, y:G.top+0.52, w:4.4, size:T.body, color:C.mute });
s.addText([{ text:"3", options:{ fontSize:88, bold:true, color:C.red }},
           { text:"명만 구매합니다.", options:{ fontSize:21, bold:true, color:C.white }}],
  { x:G.M+0.40, y:G.top+0.94, w:4.6, h:1.46, fontFace:F, valign:"bottom", margin:0, isTextBox:true });
tx(s, "나머지 97명이 무엇을 보고, 어디서 멈추고,\n왜 돌아섰는지 —\n매일 CCTV에 찍히고, 매일 그냥 삭제됩니다.",
  { x:G.M+0.40, y:G.top+2.72, w:4.5, size:T.body, lh:25, bold:true, color:C.amber });
tx(s, "업계 통상치 기반 추정 · 롯데 내부 POS·게이트 데이터로 검증 필요",
  { x:G.M+0.40, y:G.top+pbH-0.56, w:4.5, size:T.micro, color:C.mute });
/* 우측 — 팝업 브랜드가 실제로 겪는 것 */
const prX = G.M + pbW + 0.30, prW = G.W - G.M - prX;
tx(s, "그래서 팝업이 끝나면", { x:prX, y:G.top+0.02, w:prW, size:12.5, bold:true, cs:1, color:C.mute });
const PAINS = [
 ["손에 쥐는 건 매출 총액과 인스타 해시태그 개수뿐","팝업 1회 운영비는 수천만원 단위인데, 남는 자료는 A4 한 장입니다"],
 ["온 사람 중 신규가 몇 %인지 모른다","매출이 잘 나와도 기존 고객만 다시 온 것일 수 있습니다"],
 ["안 산 사람이 누구인지 모른다","가격이 문제였는지 타깃이 문제였는지 끝내 알 수 없습니다"],
 ["그래서 다음 팝업도 감으로 연다","같은 실수를 반복하고, 실패의 이유가 기록되지 않습니다"]];
const pnY = G.top + 0.50, pnH = (G.bottomF - pnY - 3*0.14)/4;
PAINS.forEach((p,i)=>{
  const y = pnY + i*(pnH+0.14);
  box(s, prX, y, prW, pnH, C.ink2);
  s.addShape(pres.ShapeType.ellipse, { x:prX+0.28, y:y+(pnH-0.42)/2, w:0.42, h:0.42, fill:{color:C.red}});
  tx(s, String(i+1), { x:prX+0.28, y:y+(pnH-0.42)/2, w:0.42, h:0.42, size:13, bold:true,
    color:C.white, align:"center", valign:"middle", noCheck:true });
  const bx = prX+0.86, bw = prW-0.86-0.30;
  const th = textH(p[0],bw,T.body) + 0.06 + textH(p[1],bw,T.micro);
  tx(s, p[0], { x:bx, y:y+(pnH-th)/2, w:bw, size:T.body, bold:true, color:C.white });
  tx(s, p[1], { x:bx, y:y+(pnH-th)/2+textH(p[0],bw,T.body)+0.06, w:bw, size:T.micro, color:C.muteW });
});
foot(s, "온라인 쇼핑몰이라면 전부 남는 기록입니다.  오프라인에서만 사라집니다.",
  { color:C.amber, size:13 });

/* ============================================================ 3. Problem ② (50초) */
s = newSlide();
head(s, "01", "이 문제를 가진 고객은 누구인가",
  "성과 측정 니즈가 가장 절박한 곳부터, 안에서 밖으로",
  { block:"PROBLEM" });
const SEGS = [
  { tag:"1차 · 핵심", title:"롯데 팝업 브랜드", dark:true, bodySize:T.small,
    body:"백화점·몰·아울렛에 팝업을 여는 브랜드. 특히 정규 입점을 노리는 D2C·신생 브랜드.\n연 약 2,000건 (가정 · 검증필요)" },
  { tag:"2차 · 리커링", title:"상설 입점 브랜드 매장", bodySize:T.small,
    body:"팝업에서 검증된 브랜드가 정규 매장을 열 때 월 구독으로 전환" },
  { tag:"0차 · 첫 고객", title:"롯데 내부 MD · 계열사", bodySize:T.small,
    body:"백화점이 자기 매장 최적화를 위해 먼저 쓴다. 매출 0원, 대신 데이터와 레퍼런스" },
];
const UNSOLVED = [
  { title:"롯데백화점", titleSize:13.5, fill:C.cool, flat:true, bodySize:T.micro,
    body:"공간 · 트래픽 · POS는 있는데 — 매장 안을 측정할 수단이 없다" },
  { title:"롯데이노베이트", titleSize:13.5, fill:C.cool, flat:true, bodySize:T.micro,
    body:"비전 AI 기술은 있는데 — 고객 소비 이력과 결제 데이터가 없다" },
  { title:"롯데멤버스", titleSize:13.5, fill:C.cool, flat:true, bodySize:T.micro,
    body:"L.POINT 소비 이력은 있는데 — 매장 안에서 무슨 일이 있었는지 모른다" },
];
const p2BandY = G.bottom - 0.84;
const p2Rows = spread([rowNat(SEGS, cols(3)), rowNat(UNSOLVED, cols(3))],
                      p2BandY - 0.30 - G.top - 0.56, "S3 Problem②");
const segH = cardRow(s, SEGS, G.top, { h:p2Rows[0] });
const unY = G.top + segH + 0.56;
tx(s, "왜 지금까지 아무도 못 풀었나 — 조각이 흩어져 있었습니다",
  { x:G.M, y:unY-0.36, w:G.CW, size:12.5, bold:true, cs:1, color:C.slate });
cardRow(s, UNSOLVED, unY, { h:p2Rows[1] });
band(s, p2BandY, "세 조각이 다 모여야 성립하는 사업입니다.  그래서 지금까지 아무도 못 했습니다.", T.lead);

/* ============================================================ 4. Solution ① (60초) */
s = newSlide(true);
head(s, "02", "브랜드가 모르는 자기 고객을 알려드립니다",
  "팝업이 끝나면 브랜드에게 드리는 다섯 가지 — 스스로는 절대 알 수 없는 답",
  { dark:true, block:"SOLUTION" });
const five = [
 ["이번에 온 사람 중 신규가 몇 %인가","매출만 보면 성공 같지만, 기존 고객만 다시 온 것일 수 있습니다"],
 ["들어왔는데 안 산 사람은 누구였나","가격대가 안 맞았는지, 타깃을 잘못 잡았는지가 여기서 나옵니다"],
 ["우리 방문객이 평소 어디서 무엇을 사는가","\"우리 고객의 38%가 경쟁사 A 구매 이력\" — 포지셔닝과 가격 전략을 바꿉니다"],
 ["집었는데 안 산 상품","온라인의 장바구니 이탈과 같습니다. 그대로 상품기획 피드백이 됩니다"],
 ["다음 팝업은 어디에, 언제, 어느 층에","롯데 전점 트래픽이 있어야만 나오는 처방입니다"]];
const fRowH = Math.max((G.bottomF - G.top - 4*0.12)/5,
  ...five.map(f => Math.max(textH(f[0],5.4,T.lead), textH(f[1],5.1,T.small)) + 0.36));
five.forEach((f,i)=>{
  const y = G.top + i*(fRowH+0.12);
  box(s, G.M, y, G.CW, fRowH, C.ink2);
  s.addShape(pres.ShapeType.ellipse, { x:G.M+0.30, y:y+(fRowH-0.44)/2, w:0.44, h:0.44, fill:{color:C.red}});
  tx(s, String(i+1), { x:G.M+0.30, y:y+(fRowH-0.44)/2, w:0.44, h:0.44, size:14, bold:true,
    color:C.white, align:"center", valign:"middle", noCheck:true });
  tx(s, f[0], { x:1.58, y:y, w:5.4, h:fRowH, size:T.lead, bold:true, color:C.white, valign:"middle" });
  tx(s, f[1], { x:7.20, y:y, w:5.1, h:fRowH, size:T.small, color:C.muteW, valign:"middle" });
});
foot(s, "브랜드는 자기가 판 것만 압니다.  L.POINT 소비 이력과 롯데 전점 트래픽이 동시에 있어야만 나오는 답입니다.",
  { color:C.amber, size:13 });

/* ============================================================ 5. Solution ② (50초) */
s = newSlide();
head(s, "02", "그리고 그 처방이 통했는지 POS로 증명합니다",
  "경쟁사는 결제 데이터가 없어 자기 처방이 통했는지 증명할 수 없습니다",
  { block:"SOLUTION" });
const GA_Y = G.bottomF - 0.92, CH6 = GA_Y - 0.32 - G.top;
s.addChart(pres.ChartType.bar, [
  { name:"개선 전", labels:["유입률","집품률","구매 전환율"], values:[5.2,18.4,8.1] },
  { name:"개선 후", labels:["유입률","집품률","구매 전환율"], values:[6.8,22.1,11.4] }],
  { x:G.M, y:G.top, w:6.55, h:CH6, barDir:"col", chartColors:[C.slate, C.red],
    showTitle:true, title:"개선안 적용 전후 (단위: %)  ※ 실적이 아니라 리포트 형식 예시",
    titleFontFace:F, titleFontSize:12, titleColor:C.slate,
    showValue:true, dataLabelPosition:"outEnd", dataLabelFontFace:F, dataLabelFontSize:11,
    dataLabelColor:C.ink, dataLabelFormatCode:'0.0"%"',
    showLegend:true, legendPos:"b", legendFontFace:F, legendFontSize:11, legendColor:C.slate,
    catAxisLabelFontFace:F, catAxisLabelFontSize:12, catAxisLabelColor:C.ink,
    valAxisLabelFontFace:F, valAxisLabelFontSize:10, valAxisLabelColor:C.slate,
    valGridLine:{color:C.line,size:1}, catGridLine:{style:"none"},
    valAxisMinVal:0, valAxisMaxVal:26, barGapWidthPct:60 });
const rx = G.M + 6.55 + 0.30, rw = G.W - G.M - rx;
const c1i = { tag:"개선 → 적용 → 검증",
  list:["진열·동선·상품 배치 개선안 제시","2~4주 적용 후 POS 결제 데이터로 전후 실측 비교"] };
const c1 = cardH(c1i, rw-G.padX*2);
drawCard(s, c1i, rx, G.top, rw, c1);
const qy = G.top + c1 + 0.22, qh = G.top + CH6 - qy;
box(s, rx, qy, rw, qh, C.ink);
tx(s, "효과를 증명 못 하는 컨설팅은\n한 번 팔리고 끝납니다.",
  { x:rx+G.padX, y:qy+0.28, w:rw-G.padX*2, size:T.body, color:C.muteW });
tx(s, "증명하는 컨설팅은 갱신됩니다.",
  { x:rx+G.padX, y:qy+qh-0.62, w:rw-G.padX*2, size:T.lead, bold:true, color:C.amber });
const gy = GA_Y;
box(s, G.M, gy, G.CW, 0.92, C.tint);
tx(s, "온라인 GA의 오프라인 구현", { x:G.M+0.34, y:gy, w:2.5, h:0.92, size:T.small, bold:true,
  color:C.slate, valign:"middle", noCheck:true });
[["노출","통행 수"],["클릭률","유입률 ★"],["장바구니","집품률"],["구매","전환율"],["이탈률","3초 이탈"]]
  .forEach((p,i)=>{
    s.addText([{ text:p[0]+"  →  ", options:{ color:C.slate }},
               { text:p[1], options:{ bold:true, color:p[1].includes("★") ? C.red : C.ink }}],
      { x:3.50+i*1.82, y:gy, w:1.78, h:0.92, fontFace:F, fontSize:T.small, valign:"middle",
        margin:0, isTextBox:true });
  });
foot(s, "지표 체계는 온라인 GA와 1:1입니다.  다른 점은 결제 데이터로 결과를 증명한다는 것입니다.", { size:12.5 });

/* ============================================================ 6. Market ① (30초) */
s = newSlide();
head(s, "03", "시장 규모  |  TAM · SAM · SOM",
  "모든 수치는 공개정보·업계 통상치 기반 추정입니다 — 산식을 그대로 공개하고, 롯데 내부 데이터로 검증하겠습니다",
  { block:"MARKET" });
const MKT = [
 ["TAM","국내 백화점 · 몰 · 아울렛 입점 브랜드 전체",
  "약 3.3만 매장  ×  연 ARPU 540만원",       "약 1,800억원", "가정", "assume"],
 ["SAM","롯데 유통군 내 팝업 + 상설 입점 브랜드",
  "1.1만 매장 × 540만원  +  팝업 2,000건 × 320만원", "약 660억원", "가정", "assume"],
 ["SOM","3년 내 확보 목표 (Y3)",
  "팝업 1,200건 + 구독 620매장 + 컨설팅 110건 + 리타게팅", "128.6억원", "산출값", "fact"]];
const mkBandY = G.bottom - 0.84;
const mkH = (mkBandY - 0.30 - G.top - 0.62 - 2*0.14)/3;
MKT.forEach((m,i)=>{
  const y = G.top + i*(mkH+0.14), last = i===2;
  box(s, G.M, y, G.CW, mkH, last ? C.ink : (i%2 ? C.white : C.tint), { line: last ? C.ink : C.line });
  tx(s, m[0], { x:G.M+0.34, y:y, w:1.10, h:mkH, size:22, bold:true,
    color: last ? C.amber : C.red, valign:"middle", noCheck:true });
  tx(s, m[1], { x:1.80, y:y, w:3.50, h:mkH, size:T.body, bold:true,
    color: last ? C.white : C.ink, valign:"middle" });
  tx(s, m[2], { x:5.44, y:y, w:4.30, h:mkH, size:T.small,
    color: last ? C.muteW : C.slate, valign:"middle" });
  tx(s, m[3], { x:9.86, y:y, w:2.10, h:mkH, size:T.h3, bold:true, align:"right",
    color: last ? C.amber : C.ink, valign:"middle" });
  gradeChip(s, 12.06, y, 0.65, mkH, m[4]==="가정" ? "가정" : "산출", m[5]);
});
const mnY = G.top + 3*(mkH+0.14);
tx(s, "산식의 입력값 — 3.3만 매장은 롯데 유통군 약 1.1만 매장의 3배로 본 추정, 1.1만 매장은 55개점 × 점당 200브랜드 가정입니다. "
    + "연 ARPU 540만원은 상설 구독 월 45만원 × 12개월. 마트 · 하이마트 · 시네마 · 면세 · 해외 롯데몰과 광고(RMN) 매출은 제외한 보수적 수치입니다.",
  { x:G.M, y:mnY, w:G.CW, h:0.56, size:T.micro, lh:15, color:C.slate });
band(s, mkBandY, "SOM 128.6억원은 SAM의 약 19%.  롯데 유통군 안에서만 달성하는 숫자이고, 계열사·해외는 여기 없습니다.", T.body);

/* ============================================================ 7. Market ② (30초) */
s = newSlide();
head(s, "03", "왜 지금인가, 왜 롯데인가",
  "시장이 열렸고, 기술 원가가 떨어졌고, 그룹 방침이 같은 방향을 가리킵니다",
  { block:"MARKET" });
const WHYNOW = [
  { tag:"시장", title:"팝업은 상시 포맷이 됐다", titleSize:15,
    body:"일회성 행사가 아니라 브랜드 발굴과 MD 검증의 상시 채널이 됐습니다." },
  { tag:"기술", title:"영상분석 원가가 1/10로", titleSize:15, dark:true,
    body:"엣지 추론으로 영상을 클라우드에 올리지 않습니다. 원가의 벽이 낮아졌습니다." },
  { tag:"그룹", title:"AI 트랜스포메이션 방침", titleSize:15,
    body:"새 인프라를 사는 게 아니라 이미 깔린 CCTV 위에 AI를 얹는 과제입니다." },
];
const KSF = [
  { title:"공간 · 트래픽 · POS", titleSize:13.5, fill:C.warm, flat:true, bodySize:T.micro,
    sub:"롯데백화점", body:"측정할 장소와, 결과를 증명할 결제 데이터" },
  { title:"L.POINT 소비 이력", titleSize:13.5, fill:C.warm, flat:true, bodySize:T.micro,
    sub:"롯데멤버스", body:"방문객이 평소 어디서 무엇을 사는지 — 경쟁사가 구조적으로 못 가진 것" },
  { title:"비전 AI · 엣지 인프라", titleSize:13.5, fill:C.warm, flat:true, bodySize:T.micro,
    sub:"롯데이노베이트", body:"영상을 숫자로 바꾸는 엔진. Build/Buy 병행" },
];
const ksfBandY = G.bottom - 0.84;
const whyRows = spread([rowNat(WHYNOW, cols(3)), rowNat(KSF, cols(3))],
                       ksfBandY - 0.30 - G.top - 0.56, "S7 WhyNow");
const wnH = cardRow(s, WHYNOW, G.top, { h:whyRows[0] });
const ksY = G.top + wnH + 0.56;
tx(s, "Key Success Factor — 이 셋을 동시에 가진 곳은 롯데뿐입니다",
  { x:G.M, y:ksY-0.36, w:8.0, size:12.5, bold:true, cs:1, color:C.slate });
tx(s, "그룹 비전 · Lifetime Value Creator",
  { x:8.6, y:ksY-0.36, w:G.CW-8.6+G.M, size:T.small, align:"right", color:C.slate });
cardRow(s, KSF, ksY, { h:whyRows[1] });
band(s, ksfBandY, "기술 경쟁이 아니라 자산 구조의 경쟁입니다.  카메라는 누구나 깔 수 있지만, 세 조각은 살 수 없습니다.", T.lead);

/* ============================================================ 8. Business models ① (50초) */
s = newSlide();
head(s, "04", "수익 모델  |  다섯 단으로 올라갑니다",
  "팝업은 매출 엔진이 아니라 유입 깔때기 — 3년차 매출의 51%가 반복 매출",
  { block:"BUSINESS MODEL" });
const tiers = [
 ["①","팝업 솔루션 패키지","리포트 + 고객 인사이트 + 개선 처방","ASP 320만원 / 건","유입"],
 ["②","상설 매장 구독","월간 처방 리포트 + 대시보드","월 45만원 / 매장","리커링"],
 ["③","성장 컨설팅 + 성과연동","VMD · 상품기획 · 출점전략","1,500만원 + 성과 5~10%","고부가"],
 ["④","L.POINT 리타게팅","안 산 고객에게 앱 쿠폰 발송","CPM / CPA","리커링"],
 ["⑤","벤치마크 라이선스","카테고리 기준치 정기 리포트","연 2,000~5,000만원","리커링"]];
const tGap = 0.11, tH = (G.bottomF - G.top - 4*tGap)/5;
tiers.forEach((t,i)=>{
  const y = G.top + i*(tH+tGap), rec = t[4]==="리커링";
  box(s, G.M, y, G.CW, tH, i%2 ? C.white : C.tint, { line:C.line });
  tx(s, t[0], { x:G.M+0.22, y:y, w:0.56, h:tH, size:20, bold:true, color:C.red,
    align:"center", valign:"middle", noCheck:true });
  tx(s, t[1], { x:1.48, y:y, w:3.20, h:tH, size:T.lead, bold:true, valign:"middle" });
  tx(s, t[2], { x:4.74, y:y, w:3.70, h:tH, size:T.small, color:C.slate, valign:"middle" });
  tx(s, t[3], { x:8.44, y:y, w:3.02, h:tH, size:T.body, bold:true, align:"right", valign:"middle" });
  s.addShape(pres.ShapeType.roundRect, { x:11.68, y:y+(tH-0.36)/2, w:0.88, h:0.36,
    fill:{ color: rec ? C.red : C.line }, rectRadius:0.05 });
  tx(s, t[4], { x:11.68, y:y+(tH-0.36)/2, w:0.88, h:0.36, size:T.micro, bold:true,
    color: rec ? C.white : C.slate, align:"center", valign:"middle", noCheck:true });
});
foot(s, "구글 애널리틱스는 무료입니다. 구글은 측정이 아니라 광고로 법니다. 저희도 같습니다.", { size:T.lead });

/* ============================================================ 9. Business models ② 무상 티저 (40초) */
s = newSlide();
head(s, "04", "입구  |  유입률 좋은 자리는 먼저 열어드립니다",
  "브랜드가 가장 먼저 묻는 질문은 \"어디에 열어야 하나\"입니다. 계약 전에 그 답의 앞 세 줄을 무상으로 엽니다  ※ 스팟명·수치는 설명용 예시",
  { block:"BUSINESS MODEL" });
const SPOTS = [
  ["TOP 1", "본점 2F · 에스컬레이터 정면", "9.4", "카테고리 평균 5.2% 대비 1.8배",
   "주중 14~17시 통행 집중"],
  ["TOP 2", "잠실 에비뉴엘 1F · 정문 리드존", "8.6", "카테고리 평균 5.2% 대비 1.7배",
   "주말 통행량 전점 1위"],
  ["TOP 3", "인천점 3F · 식음 동선 접점", "7.9", "카테고리 평균 5.2% 대비 1.5배",
   "체류가 긴 동선 · 신규 방문 비중 높음"],
];
const spW = cols(3), spIn = spW - G.padX*2;
const spH = 2.24;
tx(s, "이번 달 유입률 상위 스팟  ·  샘플 3곳 무상 공개",
  { x:G.M, y:G.top-0.30, w:7.0, size:12.5, bold:true, cs:1, color:C.red });
tx(s, "유입률 = 앞을 지나간 사람 중 매장에 들어온 비율",
  { x:7.2, y:G.top-0.30, w:G.CW-7.2+G.M, size:T.small, align:"right", color:C.slate });
SPOTS.forEach((sp,i)=>{
  const x = colX(i,3);
  box(s, x, G.top, spW, spH, C.tint, { shadow:true });
  s.addShape(pres.ShapeType.roundRect, { x:x+G.padX, y:G.top+0.22, w:0.80, h:0.32,
    fill:{color:C.red}, rectRadius:0.05 });
  tx(s, sp[0], { x:x+G.padX, y:G.top+0.22, w:0.80, h:0.32, size:T.micro, bold:true,
    color:C.white, align:"center", valign:"middle", noCheck:true });
  tx(s, sp[1], { x:x+G.padX, y:G.top+0.64, w:spIn, h:0.34, size:T.body, bold:true, valign:"middle" });
  s.addText([{ text:sp[2], options:{ fontSize:34, bold:true, color:C.red }},
             { text:"%", options:{ fontSize:17, bold:true, color:C.red }},
             { text:"   유입률", options:{ fontSize:T.small, color:C.slate }}],
    { x:x+G.padX, y:G.top+1.00, w:spIn, h:0.56, fontFace:F, valign:"bottom",
      margin:0, isTextBox:true });
  tx(s, sp[3], { x:x+G.padX, y:G.top+1.58, w:spIn, h:0.26, size:T.small, bold:true, valign:"middle" });
  tx(s, sp[4], { x:x+G.padX, y:G.top+1.84, w:spIn, h:0.24, size:T.micro, color:C.slate, valign:"middle" });
});
const tzY = G.top + spH + 0.30, tzH = G.bottomF - tzY;
const freeW = 4.46, lockX = G.M + freeW + 0.22, lockW = G.W - G.M - lockX;
box(s, G.M, tzY, freeW, tzH, C.warm, { line:C.line });
tx(s, "여기까지는 무상", { x:G.M+G.padX, y:tzY+G.padY, w:freeW-G.padX*2, size:12.5, bold:true, cs:1, color:C.red });
bulletsTx(s, ["유입률 상위 스팟과 그 평균 유입률","스팟별 통행량 · 시간대 · 요일 패턴","카테고리 평균 대비 몇 배인지"],
  { x:G.M+G.padX, y:tzY+0.62, w:freeW-G.padX*2, size:T.small });
tx(s, "공간의 지표 — 롯데가 가진 자산이라 열 수 있습니다",
  { x:G.M+G.padX, y:tzY+tzH-0.46, w:freeW-G.padX*2, h:0.26, size:T.micro, bold:true, color:C.slate });
box(s, lockX, tzY, lockW, tzH, C.ink);
tx(s, "여기부터는 L.GA 안에서", { x:lockX+G.padX, y:tzY+G.padY, w:2.60, size:12.5, bold:true, cs:1, color:C.amber });
tx(s, "팝업 패키지 · 월 구독 · 해당 매장 L.GA 운영 시 공개",
  { x:lockX+2.90, y:tzY+G.padY, w:lockW-2.90-G.padX, h:0.26, size:T.small, align:"right",
    color:C.muteW, valign:"middle" });
const LOCKED = [["그 스팟의 구매 전환율","■ ■ %"],["내 매장 방문객의 신규 비율","■ ■ %"],
                ["들어왔는데 안 산 사람의 정체","■ ■ ■"],["집품률 · 체류시간 · 이탈 지점","■ ■ ■"]];
const lkY = tzY + 0.62, lkH = (tzH - 0.62 - G.padY - 3*0.08)/4;
LOCKED.forEach((l,i)=>{
  const y = lkY + i*(lkH+0.08);
  box(s, lockX+G.padX, y, lockW-G.padX*2, lkH, C.ink2);
  tx(s, l[0], { x:lockX+G.padX+0.22, y:y, w:4.4, h:lkH, size:T.small, color:C.white, valign:"middle" });
  tx(s, l[1], { x:lockX+lockW-G.padX-1.5, y:y, w:1.28, h:lkH, size:T.small, bold:true,
    color:C.amber, align:"right", valign:"middle", noCheck:true });
});
foot(s, [{ text:"유입률은 공간의 지표라 공개할 수 있고,  ", options:{ color:C.ink }},
         { text:"전환율은 그 브랜드의 성과라 계약 안에서만 열립니다.", options:{ bold:true, color:C.red }}],
     { size:12.5 });

/* ============================================================ 10. Business models ③ (50초) */
s = newSlide();
head(s, "04", "이해관계자 구조와 채널",
  "외부 영업이 아니라 팝업 계약 시점에 팔립니다 — 계약 시점 = 판매 시점",
  { block:"BUSINESS MODEL" });
const FLOW = [
  { tag:"공급 — 롯데 3사", title:"자산을 낸다", titleSize:14, bodySize:T.small,
    list:["백화점 — 공간·트래픽·POS","이노베이트 — 비전 AI·엣지","멤버스 — L.POINT 이력·도달 채널"] },
  { tag:"플랫폼 — L.GA", title:"답으로 바꾼다", titleSize:14, dark:true, bodySize:T.small,
    list:["측정 → 인사이트 → 처방 → POS 검증","카테고리 벤치마크 DB 축적","3사 데이터 결합 거버넌스"] },
  { tag:"고객 — 입점 브랜드", title:"답을 받고 이용료를 낸다", titleSize:14, bodySize:T.small,
    list:["팝업 패키지 · 구독 · 컨설팅","성과가 오르면 상위 단계로","소비자는 맞춤 쿠폰으로 돌아온다"] },
];
const bm2BandY = G.bottom - 0.84;
const chs = [
 ["영업 · 내부","MD·영업관리팀이 팝업 계약 시 번들 제안"],
 ["제품","L.GA 포털 + 컨설턴트 리포트 미팅"],
 ["확산","계열사 → 해외 롯데몰 → 외부 유통사"],
 ["도달","L.POINT 앱 푸시 · 사이니지 · 키오스크"]];
const chCards = chs.map(c => ({ title:c[0], titleSize:13, fill:C.cool, flat:true,
  bodySize:T.micro, body:c[1] }));
const bm2Rows = spread([rowNat(FLOW, cols(3)), rowNat(chCards, cols(4))],
                       bm2BandY - 0.30 - G.top - 0.56, "S9 BM②");
const flowH = cardRow(s, FLOW, G.top, { h:bm2Rows[0] });
[0,1].forEach(i => tx(s, "→", { x:colX(i,3)+cols(3), y:G.top+flowH/2-0.26, w:G.gap, h:0.52,
  size:16, bold:true, color:C.red, align:"center", valign:"middle", noCheck:true }));
const chY = G.top + flowH + 0.56;
tx(s, "채널 — 어떻게 도달하는가", { x:G.M, y:chY-0.36, w:6.0, size:12.5, bold:true, cs:1, color:C.slate });
cardRow(s, chCards, chY, { h:bm2Rows[1] });
band(s, bm2BandY, "첫 고객은 외부 브랜드가 아니라 롯데 자신입니다.  그룹 안에서 검증하고, 그룹 시너지로 확산합니다.", T.body);

/* ============================================================ 11. Traction ① (30초) */
s = newSlide();
head(s, "05", "핵심 지표  |  3개년 손익 — 24개월에 손익분기",
  "아직 매출이 없는 신사업이라 실적 대신 목표점을 말씀드립니다  ※ 내부 검증 전 추정치",
  { block:"TRACTION" });
s.addChart(pres.ChartType.bar, [
  { name:"매출", labels:["Y1 파일럿","Y2 전점 확산","Y3 계열·외부 확장"], values:[13.2,54.2,128.6] },
  { name:"영업이익", labels:["Y1 파일럿","Y2 전점 확산","Y3 계열·외부 확장"], values:[-8.2,8.8,44.9] }],
  { x:G.M, y:G.top, w:7.95, h:4.78, barDir:"col", chartColors:[C.ink2, C.red],
    showTitle:true, title:"3개년 손익 추정 (단위: 억원)", titleFontFace:F, titleFontSize:13, titleColor:C.slate,
    showValue:true, dataLabelPosition:"outEnd", dataLabelFontFace:F, dataLabelFontSize:12,
    dataLabelColor:C.ink, dataLabelFormatCode:"0.0",
    showLegend:true, legendPos:"b", legendFontFace:F, legendFontSize:12, legendColor:C.slate,
    catAxisLabelFontFace:F, catAxisLabelFontSize:12, catAxisLabelColor:C.ink,
    valAxisLabelFontFace:F, valAxisLabelFontSize:11, valAxisLabelColor:C.slate,
    valGridLine:{color:C.line,size:1}, catGridLine:{style:"none"}, barGapWidthPct:70 });
const sx = G.M + 7.95 + 0.30, sw = G.W - G.M - sx;
[["누적 손익분기","24개월"],["매출총이익률","77%"],["3년 설비투자","11억원"],["파일럿 시작 비용","1.5억원"]]
  .forEach((t,i)=>{
    const y = G.top + i*0.94;
    box(s, sx, y, sw, 0.82, C.tint);
    tx(s, t[0], { x:sx+G.padX, y:y, w:2.0, h:0.82, size:T.small, color:C.slate, valign:"middle" });
    tx(s, t[1], { x:sx+sw-G.padX-1.6, y:y, w:1.6, h:0.82, size:T.h3, bold:true, color:C.red,
      align:"right", valign:"middle" });
  });
const senY = G.top + 3*0.94 + 0.82 + 0.18, senH = G.top + 4.78 - senY;
box(s, sx, senY, sw, senH, C.ink);
tx(s, "침투율 저조 + 구독 저조 + 광고 미실행이 동시에 일어나도 Y3는 흑자 (+5.1억)",
  { x:sx+G.padX, y:senY, w:sw-G.padX*2, h:senH, size:T.small, bold:true,
    color:C.amber, valign:"middle" });
foot(s, "파일럿 1.5억으로 시작해 24개월에 손익분기를 넘습니다.", { size:T.body });

/* ============================================================ 12. Traction ② (30초) */
s = newSlide();
head(s, "05", "실행 로드맵과 판정 기준",
  "각 단계마다 통과 조건을 미리 걸어두었습니다 — 하나라도 안 되면 다음 단계로 가지 않습니다",
  { block:"TRACTION" });
const PHASES = [
  { tag:"Phase 0 · 0~3개월", title:"내부 도입 · 파일럿", titleSize:14, dark:true, bodySize:T.small,
    list:["롯데 내부 10개점 파일럿","팝업 브랜드 3곳 무상 제공"] },
  { tag:"Phase 1 · 4~12개월", title:"팝업 유료 판매", titleSize:14, bodySize:T.small,
    list:["검증 케이스 3건 확보","MD 계약 번들 개시"] },
  { tag:"Phase 2 · 13~24개월", title:"전점 확산", titleSize:14, bodySize:T.small,
    list:["상설 구독 · 리타게팅 개시","누적 손익분기 통과"] },
  { tag:"Phase 3 · 25~36개월", title:"계열 · 해외 확장", titleSize:14, bodySize:T.small,
    list:["마트·하이마트·시네마·면세","베트남·인도네시아 롯데몰"] },
];
const GATES = [
  { title:"파일럿 3건에서 전환율 개선이 통계적으로 유의미할 것", titleSize:13, fill:C.warm, flat:true,
    bodySize:T.micro, body:"아니면 → 처방 방법론을 다시 설계" },
  { title:"무상 파일럿의 유료 전환율 30% 이상", titleSize:13, fill:C.warm, flat:true,
    bodySize:T.micro, body:"아니면 → 가격과 상품 범위 재설계" },
  { title:"24개월에 누적 손익분기 통과", titleSize:13, fill:C.warm, flat:true,
    bodySize:T.micro, body:"아니면 → 확산 중단, 내부 도구로 축소" },
];
const trBandY = G.bottom - 0.84;
const trRows = spread([rowNat(PHASES, cols(4)), rowNat(GATES, cols(3))],
                      trBandY - 0.30 - G.top - 0.56, "S11 Traction②");
const phH = cardRow(s, PHASES, G.top, { h:trRows[0] });
const gtY = G.top + phH + 0.56;
tx(s, "판정 기준 — 무엇으로 성공을 확인하는가",
  { x:G.M, y:gtY-0.36, w:8.0, size:12.5, bold:true, cs:1, color:C.slate });
cardRow(s, GATES, gtY, { h:trRows[1] });
band(s, trBandY, "지불 의사를 가정하지 않습니다.  롯데가 먼저 쓰고, 무상으로 검증한 뒤에 과금합니다.", T.lead);

/* ============================================================ 13. Team (20초) */
s = newSlide();
head(s, "06", "팀  |  3사 합작 구조 자체가 사업입니다",
  "각자 조각만 가지고 있었고, 합쳐본 적이 없습니다 — 그 조각을 한 팀으로 묶습니다",
  { block:"TEAM" });
const ORG = [
  { title:"롯데백화점", dark:true, sub:"공간 · 트래픽 · POS · MD 지식", foot:"첫 고객이자 판매 채널" },
  { title:"롯데이노베이트", dark:true, sub:"비전 AI 엔진 · 엣지 인프라", foot:"생산 담당" },
  { title:"롯데멤버스", dark:true, sub:"L.POINT 소비 이력 · 도달 채널", foot:"인사이트와 실행 담당" },
];
const HR = [
 ["리테일 컨설턴트","14명","처방·검증이 상품의 본체 — 그래서 가장 많습니다"],
 ["데이터 사이언스 · 애널리스트","16명","엣지 추론 모델 · 인사이트 분석"],
 ["개발 · 영업/CS · PO","12명","포털·리포트 자동화 · 브랜드 대응"]];
const teamBandY = G.bottom - 0.84;
const hrCards = HR.map(h => ({ title:h[0], titleSize:13.5, fill:C.cool, flat:true,
  sub:"Y3 기준 "+h[1], bodySize:T.micro, body:h[2] }));
const tmRows = spread([rowNat(ORG, cols(3)), rowNat(hrCards, cols(3))],
                      teamBandY - 0.30 - G.top - 0.56, "S12 Team");
const orgH = cardRow(s, ORG, G.top, { h:tmRows[0] });
[0,1].forEach(i => tx(s, "+", { x:colX(i,3)+cols(3), y:G.top+orgH/2-0.28, w:G.gap, h:0.56,
  size:20, bold:true, color:C.red, align:"center", valign:"middle", noCheck:true }));
const hrY = G.top + orgH + 0.56;
tx(s, "인력 구성 — 3년차 42명", { x:G.M, y:hrY-0.36, w:5.0, size:12.5, bold:true, cs:1, color:C.slate });
tx(s, "조직 형태 · 3사 합작 TF → 성과 검증 후 분사(Spin-off) 옵션",
  { x:6.0, y:hrY-0.36, w:G.CW-6.0+G.M, size:T.small, align:"right", color:C.slate });
cardRow(s, hrCards, hrY, { h:tmRows[1] });
band(s, teamBandY, "한 사만으로는 만들 수 없습니다.  그룹이어야 가능한 사업이고, 그래서 지금까지 비어 있었습니다.", T.lead);

/* ============================================================ 14. Ask (40초) */
s = newSlide();
head(s, "07", "요청 사항  |  파일럿 1.5억으로 판단하십시오",
  "큰 투자를 요청드리는 것이 아닙니다 — 3개월 뒤 데이터로 계속할지 말지 결정하십시오",
  { block:"ASK" });
const ASKS = [
  { tag:"요청 ①", title:"파일럿 예산 1.5억원 승인", titleSize:15, dark:true, bodySize:T.small,
    list:["10개점 · 팝업 브랜드 3곳 무상","3개월 뒤 지불 의사 검증"] },
  { tag:"요청 ②", title:"3사 데이터 제공 협약", titleSize:15, bodySize:T.small,
    list:["POS·트래픽·L.POINT 결합 범위","수익 배분 사전 합의"] },
  { tag:"요청 ③", title:"법무 · DPO 검토 착수", titleSize:15, bodySize:T.small,
    list:["영향평가 · CCTV 설치 목적 갱신","착수 전 마일스톤 1번"] },
];
const USE = [
  { tag:"파일럿 3개월", title:"1.5억원", fill:C.cool, flat:true, bodySize:T.micro,
    body:"엣지박스 10식 · 보완 카메라 · 법무 검토" },
  { tag:"3년 누적 설비투자", title:"11억원", fill:C.cool, flat:true, bodySize:T.micro,
    body:"전점 확산용 엣지박스 · 보완 카메라" },
  { tag:"최대 현금소진", title:"10억원", fill:C.cool, flat:true, bodySize:T.micro,
    body:"Y2 중 흑자 전환 · 24개월에 누적 손익분기" },
];
const askBandY = G.bottom - 0.84;
const askRows = spread([rowNat(ASKS, cols(3)), rowNat(USE, cols(3))],
                       askBandY - 0.30 - G.top - 0.56, "S13 Ask");
const askH = cardRow(s, ASKS, G.top, { h:askRows[0] });
const useY = G.top + askH + 0.56;
tx(s, "자금 사용처", { x:G.M, y:useY-0.36, w:5.0, size:12.5, bold:true, cs:1, color:C.slate });
cardRow(s, USE, useY, { h:askRows[1] });
band(s, askBandY, "CCTV가 이미 깔려 있어 가볍게 시작합니다.  실패해도 잃는 것이 작고, 성공하면 그룹 전체로 확장됩니다.", T.lead);

/* ============================================================ 15. Last page (20초) */
s = newSlide(true);
tx(s, "MISSION", { x:0.9, y:1.30, w:6.0, size:T.tag, bold:true, color:C.amber, cs:2 });
tx(s, "브랜드는 자기가 판 것만 압니다.",
  { x:0.9, y:1.86, w:11.5, size:36, lh:LHt(36), bold:true, color:C.mute });
tx(s, "저희는 놓친 사람이 누구였는지 알려줍니다.",
  { x:0.9, y:2.72, w:11.5, size:36, lh:LHt(36), bold:true, color:C.white });
tx(s, "매일 삭제되던 97명의 데이터를 — 브랜드에게는 성장의 답으로 · 고객에게는 더 나은 매장 경험으로 · 롯데에게는 새로운 수익으로",
  { x:0.9, y:3.86, w:11.5, size:T.lead, color:C.muteW });
box(s, 0.9, 4.86, 8.3, 1.06, C.ink2);
tx(s, "온라인에 GA가 있다면,  오프라인에는 L.GA가 있습니다.",
  { x:1.28, y:4.86, w:7.6, h:1.06, size:T.h3, bold:true, color:C.amber, valign:"middle" });
box(s, 9.46, 4.86, 2.97, 1.06, C.ink2);
tx(s, "Lifetime\nValue Creator", { x:9.46, y:4.86, w:2.97, h:1.06, size:12.5, lh:17, bold:true,
  color:C.muteW, align:"center", valign:"middle" });
tx(s, "감사합니다.", { x:0.9, y:6.22, w:6.0, size:T.lead, bold:true, color:C.white });

/* ============================================================ 백업 1. 숫자의 근거 */
s = newSlide();
head(s, "B1", "숫자의 근거  |  무엇이 사실이고 무엇이 가정인가",
  "백업 슬라이드 — \"그 숫자 어디서 나왔습니까\" 질문이 나오면 이 장입니다");
const BASIS = [
 ["100명 중 3명","bench","업계 통상 전환율을 보수적으로 잡은 값","도입부 메시지용. 사업성 계산에는 쓰지 않습니다"],
 ["연간 팝업 2,000건","assume","롯데 전점 추정 [검증필요]","1,000건이어도 Y3는 흑자입니다"],
 ["상설 입점 1.1만 매장","assume","55개점 × 200브랜드 [검증필요]","SAM만 변합니다. SOM 128.6억은 그대로"],
 ["팝업 ASP 320만원","assume","팝업 1회 운영비의 약 5% 수준","무상 파일럿으로 지불 의사를 먼저 검증"],
 ["전환율 8.1% → 11.4%","assume","실적 아님 — 리포트 형식 예시","실측값은 파일럿 3건에서 나옵니다"],
 ["카운팅 정확도 95%","bench","업계 통상치. 파일럿에서 실측 대조 예정","KPI는 개인 정확도가 아니라 집계 정확도입니다"],
 ["매출총이익률 77%","fact","단위원가에서 계산된 산출값","단가·원가가 바뀌면 같이 움직입니다"]];
const bLabelW = 2.20, bGradeX = G.M+0.30+bLabelW+0.20, bSrcX = bGradeX+0.72+0.24;
const bSrcW = 3.60, bImpX = bSrcX+bSrcW+0.24, bImpW = G.W-G.M-bImpX-0.20;
const bH = Math.max((G.bottom - G.top - 6*0.10)/7,
  ...BASIS.map(b => Math.max(textH(b[2],bSrcW,T.small), textH(b[3],bImpW,T.small)) + 0.30));
BASIS.forEach((b,i)=>{
  const y = G.top + i*(bH+0.10);
  box(s, G.M, y, G.CW, bH, i%2 ? C.tint : C.white, { line:C.line });
  tx(s, b[0], { x:G.M+0.30, y:y, w:bLabelW, h:bH, size:T.body, bold:true, color:C.ink, valign:"middle" });
  gradeChip(s, bGradeX, y, 0.72, bH,
    b[1]==="fact" ? "산출값" : (b[1]==="bench" ? "통상치" : "가정"), b[1]);
  tx(s, b[2], { x:bSrcX, y:y, w:bSrcW, h:bH, size:T.small, color:C.slate, valign:"middle" });
  tx(s, b[3], { x:bImpX, y:y, w:bImpW, h:bH, size:T.small, color:C.ink, valign:"middle" });
});
tx(s, "근거 등급",   { x:bGradeX, y:G.top-0.30, w:0.90, size:T.micro, bold:true, color:C.slate });
tx(s, "어디서 나온 숫자인가", { x:bSrcX, y:G.top-0.30, w:3.0, size:T.micro, bold:true, color:C.slate });
tx(s, "틀리면 결론이 어떻게 바뀌나", { x:bImpX, y:G.top-0.30, w:3.4, size:T.micro, bold:true, color:C.slate });

/* ============================================================ 백업 2. 프라이버시 2계층 */
s = newSlide();
head(s, "B2", "프라이버시 설계  |  공간을 측정합니다",
  "백업 슬라이드 — 개인정보 질문이 나오면 이 장입니다");
const LAYERS = [
  { tag:"Layer 1 · 공간", title:"완전 익명", titleSize:15, bodySize:T.small,
    list:["원본 영상 미저장 — 엣지에서 좌표·숫자로 변환","얼굴 특징값(생체정보) 저장하지 않음"],
    foot:"커버리지 = 방문자 100% (비회원 포함)" },
  { tag:"Layer 2 · 고객", title:"동의 기반", titleSize:15, dark:true, bodySize:T.small,
    list:["L.POINT 앱 체크인·QR·결제 적립 시에만 연결","여기서만 소비 이력·교차구매가 붙습니다"],
    foot:"커버리지 = 동의 회원" },
  { tag:"연결 규칙", title:"집계 단위로만", titleSize:15, bodySize:T.small,
    list:["개인 단위 결합 없음 — 시간대 × 구역 × 세그먼트","최소 집계 5명 미만 셀은 미표시"],
    foot:"착수 전 법무·DPO 검토 및 영향평가" },
];
const VALS = [
  { title:"고객 기대 그 이상", titleSize:13, sub:"Beyond Customer Expectation", fill:C.warm, flat:true,
    body:"리포트에서 멈추지 않습니다. 처방하고, POS로 증명까지 합니다.", bodySize:T.micro },
  { title:"도전", titleSize:13, sub:"Challenge", fill:C.warm, flat:true,
    body:"'사지 않은 고객'을 데이터화한 유통사는 아직 없습니다.", bodySize:T.micro },
  { title:"존중", titleSize:13, sub:"Respect", fill:C.warm, flat:true,
    body:"사람을 추적하지 않고 공간을 측정합니다. 개인 연결은 동의 시에만.", bodySize:T.micro },
  { title:"독창성", titleSize:13, sub:"Originality", fill:C.warm, flat:true,
    body:"GA를 옮기지 않고, 오프라인 고유 지표로 다시 정의했습니다.", bodySize:T.micro },
];
const pvRows = spread([rowNat(LAYERS, cols(3)), rowNat(VALS, cols(4))],
                      G.bottom - G.top - 0.56, "B2 Privacy");
const lyH = cardRow(s, LAYERS, G.top, { h:pvRows[0] });
const vlY = G.top + lyH + 0.56;
tx(s, "그룹 핵심가치 = 이 사업의 설계 원칙",
  { x:G.M, y:vlY-0.36, w:6.0, size:12.5, bold:true, cs:1, color:C.slate });
cardRow(s, VALS, vlY, { h:pvRows[1] });

/* ============================================================ 백업 3. 리스크 */
s = newSlide();
head(s, "B3", "리스크와 대응", "백업 슬라이드 — Q&A 대응용");
const risks = [
 ["개인정보 규제","엣지 추론 · 원본 미저장 · 동의 기반 2계층 설계. 착수 전 법무·DPO 검토 및 영향평가"],
 ["CCTV 목적 외 이용","설치 목적에 '고객 분석' 추가 · 안내판 및 운영관리방침 갱신 (착수 전 A7)"],
 ["기존 CCTV 사양 부적합","팝업존 한정 저가 보완 카메라(대당 약 25만원) 설치를 CAPEX에 반영"],
 ["브랜드 지불 의사 부족","1년차 파일럿 무상 제공 → 가치 검증 후 과금. 지불 의사를 가정하지 않음"],
 ["인식 정확도 논란","개인 정확도가 아닌 집계 정확도로 KPI 정의. 핵심 인사이트는 L.POINT·POS 실데이터 기반"],
 ["계열사 데이터 거버넌스","3사 데이터 제공 협약·수익 배분 사전 합의 (마일스톤 1번)"],
 ["경쟁사 선점","벤치마크 DB는 시간으로만 축적. 인수(M&A)도 옵션으로 병행 검토"]];
const rLabelW = 3.0, rBodyX = G.M + 0.34 + rLabelW + 0.30, rBodyW = G.W - G.M - rBodyX;
const rH = Math.max((G.bottom - G.top - 6*0.10)/7,
  ...risks.map(r => textH(r[1], rBodyW, T.small) + 0.34));
risks.forEach((r,i)=>{
  const y = G.top + i*(rH+0.10);
  box(s, G.M, y, G.CW, rH, i%2 ? C.tint : C.white, { line:C.line });
  tx(s, r[0], { x:G.M+0.34, y:y, w:rLabelW, h:rH, size:T.body, bold:true, color:C.red, valign:"middle" });
  tx(s, r[1], { x:rBodyX, y:y, w:rBodyW, h:rH, size:T.small, valign:"middle" });
});

/* ============================================================ 백업 4. 원가 구조 */
s = newSlide();
head(s, "B4", "원가 구조  |  매장 10배, 비용은 10배가 아닙니다",
  "백업 슬라이드 — 원가·확장성 질문이 나오면 이 장입니다");
const COST_BAND_Y = G.bottom - 0.84, CH14 = COST_BAND_Y - 0.30 - G.top;
s.addChart(pres.ChartType.line, [
  { name:"클라우드 방식 (경쟁사)", labels:["10개점","50개점","100개점","300개점"], values:[0.8,4.0,8.0,24.0] },
  { name:"엣지 방식 (L.GA)", labels:["10개점","50개점","100개점","300개점"], values:[0.3,0.7,1.2,3.0] }],
  { x:G.M, y:G.top, w:6.40, h:CH14, chartColors:[C.slate, C.red], lineSize:3, lineDataSymbolSize:8,
    showTitle:true, title:"매장 확산에 따른 연간 인프라 비용 (억원, 추정)", titleFontFace:F,
    titleFontSize:12, titleColor:C.slate,
    showLegend:true, legendPos:"b", legendFontFace:F, legendFontSize:11, legendColor:C.slate,
    catAxisLabelFontFace:F, catAxisLabelFontSize:11, catAxisLabelColor:C.ink,
    valAxisLabelFontFace:F, valAxisLabelFontSize:10, valAxisLabelColor:C.slate,
    valGridLine:{color:C.line,size:1}, catGridLine:{style:"none"} });
const cx = G.M + 6.40 + 0.30, cwR = G.W - G.M - cx;
const fixed = { tag:"고정비  (Y1 → Y3, 억원)", bodySize:T.small,
  list:["인건비 15.0 → 42.0  (컨설턴트 14명 포함) ★ 최대 항목",
        "인프라·솔루션 1.5 → 4.0 / 마케팅·감가·법무 1.8 → 7.7","판관비 합계 18.3 → 53.7"] };
const varc = { tag:"변동비  (단위 원가)", bodySize:T.small,
  list:["팝업 건당 75만 (설치 35 · 인사이트 분석 25 · 추론 3 …)",
        "구독 매장당 월 7만 / 컨설팅 건당 400만 / RMN 매체 40%","→ 매출총이익률 77%  (Y1~Y3 동일)"] };
const costH = spread([cardH(fixed, cwR-G.padX*2), cardH(varc, cwR-G.padX*2)], CH14 - 0.18, "B4 비용");
drawCard(s, fixed, cx, G.top, cwR, costH[0]);
drawCard(s, varc, cx, G.top+costH[0]+0.18, cwR, costH[1]);
band(s, COST_BAND_Y, "경쟁사가 못 넘은 벽은 원가 구조였습니다.  가장 큰 비용이 인건비인 것은 의도된 설계입니다.", T.body);

/* ============================================================ 저장 */
const ok = D.report();
pres.writeFile({ fileName: process.env.OUT || "LGA_롯데신사업_발표.pptx" })
  .then(f => console.log((ok ? "OK " : "경고 있음 ") + f + "  (글꼴: " + F + ")"));
