/* ============================================================
   L.GA 발표자료 빌드
   디자인 토큰·그리드·자동 높이는 design.js, 대본은 notes.js
   ============================================================ */
const pptxgen = require("pptxgenjs");
const D = require("./design.js");
const NOTES = require("./notes.js");
const { F, C, T, LH, LHt, G, cols, colX, spread, textH, checkFit } = D;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "LMBA Team";
pres.title  = "L.GA - Lotte Growth Analytics (Business Model Canvas)";

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

/* ---------- 슬라이드 머리 ---------- */
function head(s, n, title, sub, opt){
  const o = opt || {}, dark = !!o.dark, step = o.step || 0;
  const chipColor = step===2 ? (dark ? C.amber : C.ink) : C.red;
  const cw = String(n).length > 2 ? 0.92 : 0.48;
  s.addShape(pres.ShapeType.roundRect, { x:G.M, y:0.44, w:cw, h:0.46,
    fill:{color:chipColor}, rectRadius:0.08 });
  tx(s, String(n), { x:G.M, y:0.44, w:cw, h:0.46, size:String(n).length>2?12:15, bold:true,
    color:(step===2 && dark) ? C.ink : C.white, align:"center", valign:"middle", noCheck:true });
  const tX = G.M + cw + 0.18;
  tx(s, title, { x:tX, y:0.40, w:9.4, h:0.56, size:T.h2, lh:LHt(T.h2), bold:true,
    color: dark ? C.white : C.ink, valign:"middle" });
  if (sub) tx(s, sub, { x:tX, y:1.02, w:G.W-G.M-tX, size:12.5,
    color: dark ? C.muteW : C.slate });
  if (step) tx(s, step===1 ? "STEP 1 · 가치 전달" : "STEP 2 · 효율적 운영",
    { x:10.1, y:0.50, w:G.W-G.M-10.1, h:0.34, size:T.tag, bold:true, align:"right", cs:1,
      color: dark ? C.amber : (step===1 ? C.red : C.slate), valign:"middle", noCheck:true });
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
/* 가로 목록 행 — 모든 행 같은 높이 */
function listRows(s, rows, y, draw, opt){
  const o = opt || {}, gap = o.gap != null ? o.gap : 0.12;
  const h = o.h || Math.max(...rows.map(r => o.measure(r)));
  rows.forEach((r,i)=>{ const ry = y + i*(h+gap); draw(r, i, ry, h); });
  return rows.length*(h+gap) - gap;
}

/* ============================================================ 1. 타이틀 */
let s = newSlide(true);
tx(s, "롯데그룹 신사업 제안  ·  비즈니스 모델 캔버스",
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
box(s, 7.85, 1.55, 4.85, 4.59, C.ink2);
tx(s, "매장에 들어오는 100명 중", { x:8.28, y:2.54, w:4.0, size:T.small, color:C.mute });
s.addText([{ text:"3", options:{ fontSize:76, bold:true, color:C.red }},
           { text:"명만 구매합니다.", options:{ fontSize:20, bold:true, color:C.white }}],
  { x:8.28, y:2.94, w:4.14, h:1.30, fontFace:F, valign:"bottom", margin:0, isTextBox:true });
tx(s, "나머지 97명이 무엇을 보고 왜 돌아섰는지는\n매일 CCTV에 찍히고, 매일 그냥 삭제됩니다.",
  { x:8.28, y:4.54, w:4.0, size:T.small, lh:22, color:C.amber });

/* ============================================================ 2. BMC 개요 */
s = newSlide();
head(s, "BMC", "한 장으로 보는 L.GA 비즈니스 모델",
  "Step 1 가치 전달(01~05)을 먼저 확정하고, Step 2 효율적 운영(06~09)을 채웠습니다 — 다음 장에서 그룹 전략과의 정합성을 먼저 보겠습니다");
function bmc(x,y,w,h,num,title,lines,step,hi){
  const fill = hi ? C.ink : (step===1 ? C.warm : C.cool);
  box(s, x, y, w, h, fill, { line: hi ? C.ink : C.line });
  s.addShape(pres.ShapeType.roundRect, { x:x+0.14, y:y+0.13, w:0.40, h:0.30,
    fill:{color: hi ? C.amber : (step===1 ? C.red : C.ink)}, rectRadius:0.05 });
  tx(s, num, { x:x+0.14, y:y+0.13, w:0.40, h:0.30, size:T.micro, bold:true,
    color: hi ? C.ink : C.white, align:"center", valign:"middle", noCheck:true });
  tx(s, title, { x:x+0.60, y:y+0.13, w:w-0.74, h:0.30, size:12, bold:true,
    color: hi ? C.white : C.ink, valign:"middle", noCheck:true });
  bulletsTx(s, lines, { x:x+0.14, y:y+0.54, w:w-0.28, h:h-0.66, size:T.micro,
    color: hi ? C.muteW : C.ink });
}
const bw = cols(5), by1 = 1.66, bh1 = 3.58, half = (bh1-0.10)/2;
bmc(colX(0,5),by1,bw,bh1,"08","핵심 파트너",["롯데백화점 · 롯데이노베이트 · 롯데멤버스 3사 합작","비전 AI 엔진 벤더 (Build/Buy)","외부 VMD · 법무·DPO"],2);
bmc(colX(1,5),by1,bw,half,"07","핵심 활동",["엣지 추론 · 리포트 자동화","인사이트 → 처방 → POS 검증","벤치마크 DB · 리타게팅 운영"],2);
bmc(colX(1,5),by1+half+0.10,bw,half,"06","핵심 자원",["기존 CCTV · 엣지박스","L.POINT · POS · 전점 트래픽 ★","컨설턴트 14명 · CAPEX 11억"],2);
bmc(colX(2,5),by1,bw,bh1,"02","가치 제안",["브랜드가 모르는 자기 고객 — 신규 비율 · 미구매자 · 교차구매 · 이탈 SKU · 차기 출점","처방이 통했는지 POS로 증명","온라인 GA의 오프라인 구현"],1,true);
bmc(colX(3,5),by1,bw,half,"04","고객 관계",["파일럿 무상 → 검증 후 과금","POS 검증 리포트 = 갱신 근거","구독 · 컨설팅 · 리타게팅 업셀"],1);
bmc(colX(3,5),by1+half+0.10,bw,half,"03","채널",["MD·영업관리 팝업 계약 번들","L.GA 포털 · 리포트 미팅","계열사 → 해외 롯데몰 → 외부"],1);
bmc(colX(4,5),by1,bw,bh1,"01","고객 세그먼트",["롯데 팝업 브랜드 (연 2,000건 가정)","상설 입점 브랜드 매장","롯데 내부 MD · 계열사 (첫 고객)","외부 유통사 · 해외 (Phase 3)"],1);
const by2 = by1+bh1+0.14, bh2 = G.bottom-by2, bw2 = cols(2);
bmc(colX(0,2),by2,bw2,bh2,"09","비용 구조",["고정비: 인건비(컨설턴트) 중심 — Y3 판관비 53.7억","변동비: 팝업 건당 75만 · 엣지로 클라우드 1/10 → GM 77%"],2);
bmc(colX(1,2),by2,bw2,bh2,"05","수익원",["팝업 패키지 320만 · 구독 월 45만 · 컨설팅 1,500만+성과 · 리타게팅 · 라이선스","Y3 매출 128.6억 · 영업이익 44.9억 (35%) · 리커링 51%"],1);

/* ============================================================ 3. 롯데 전략 정합성 */
s = newSlide();
head(s, "FIT", "왜 롯데인가  |  그룹 전략과 핵심가치에 맞는 사업입니다",
  "신사업을 먼저 만들고 명분을 붙인 것이 아니라, 그룹이 가려는 방향에서 거꾸로 설계했습니다");
const FIT_STRAT = [
  { tag:"그룹 비전", title:"Lifetime Value Creator",
    body:"고객의 '평생 가치'가 결제 순간에만 기록돼 왔습니다. 사지 않은 순간까지 넓힙니다." },
  { tag:"경영 방침", title:"AI 트랜스포메이션", dark:true,
    body:"새 인프라를 사는 사업이 아닙니다. 이미 깔린 CCTV 위에 AI를 얹습니다." },
  { tag:"신성장 테마", title:"뉴라이프플랫폼",
    body:"상품을 파는 유통에서 데이터를 파는 플랫폼으로. 롯데 리테일 자산의 플랫폼화입니다." },
];
const FIT_VALS = [
  { title:"고객 기대 그 이상", titleSize:13.5, sub:"Beyond Customer Expectation", fill:C.warm, flat:true,
    body:"리포트에서 멈추지 않습니다. 처방하고, POS로 증명까지 합니다.", bodySize:T.micro },
  { title:"도전", titleSize:13.5, sub:"Challenge", fill:C.warm, flat:true,
    body:"'사지 않은 고객'을 데이터화한 유통사는 아직 없습니다.", bodySize:T.micro },
  { title:"존중", titleSize:13.5, sub:"Respect", fill:C.warm, flat:true,
    body:"사람을 추적하지 않고 공간을 측정합니다. 개인 연결은 동의 시에만.", bodySize:T.micro },
  { title:"독창성", titleSize:13.5, sub:"Originality", fill:C.warm, flat:true,
    body:"GA를 옮기지 않고, 오프라인 고유 지표로 다시 정의했습니다.", bodySize:T.micro },
];
const fitBandY = G.bottom - 0.84;
const fitRows  = spread([rowNat(FIT_STRAT, cols(3)), rowNat(FIT_VALS, cols(4))],
                        fitBandY - 0.30 - G.top - 0.56, "S3 FIT");
cardRow(s, FIT_STRAT, G.top, { h:fitRows[0] });
const fitVY = G.top + fitRows[0] + 0.56;
tx(s, "그룹 핵심가치 = 이 사업의 설계 원칙",
  { x:G.M, y:fitVY-0.36, w:6.0, size:12.5, bold:true, cs:1, color:C.slate });
tx(s, "미션 · 사랑과 신뢰를 받는 제품과 서비스",
  { x:6.8, y:fitVY-0.36, w:G.CW-6.8+G.M, size:T.small, align:"right", color:C.slate });
cardRow(s, FIT_VALS, fitVY, { h:fitRows[1] });
band(s, fitBandY, "롯데가 '할 수 있는' 신사업이 아니라,  롯데만 할 수 있고 롯데의 약속에 맞는 신사업입니다.", T.lead);

/* ============================================================ 4. 01 고객 세그먼트 */
s = newSlide();
head(s, "01", "고객 세그먼트  |  우리의 타겟 고객은 누구인가?",
  "성과 측정 니즈가 가장 절박한 곳부터, 안에서 밖으로", { step:1 });
const SEGS = [
  { tag:"1차 · 핵심", title:"롯데 팝업 브랜드", dark:true, bodySize:T.body,
    body:"백화점·몰·아울렛에 팝업을 여는 브랜드. 특히 정규 입점을 노리는 D2C·신생 브랜드.\n연 약 2,000건 (가정)" },
  { tag:"2차 · 리커링", title:"상설 입점 브랜드 매장", bodySize:T.body,
    body:"팝업에서 검증된 브랜드가 정규 매장을 열 때 월 구독으로 전환" },
  { tag:"0차 · 첫 고객", title:"롯데 내부 MD · 계열사", bodySize:T.body,
    body:"백화점이 자기 매장 최적화를 위해 먼저 쓴다. 매출 0원, 대신 데이터와 레퍼런스" },
];
const pains = ["팝업이 끝나면 손에 쥐는 건 매출 총액과 인스타 해시태그 개수뿐",
               "온 사람 중 신규가 몇 %인지, 안 산 사람이 누구인지 모른다",
               "그래서 다음 팝업도 감으로 연다"];
const pw = cols(3), pIn = pw - 0.30 - 0.80;
const segRows = spread([rowNat(SEGS, cols(3)),
                        Math.max(...pains.map(p => textH(p, pIn, T.small) + 0.44), 1.10)],
                       G.bottomF - G.top - 0.56, "S4 세그먼트");
const segH = cardRow(s, SEGS, G.top, { h:segRows[0] }), ph = segRows[1];
const py = G.top + segH + 0.56;
tx(s, "이들의 Pain", { x:G.M, y:py-0.36, w:3.0, size:12.5, bold:true, cs:1, color:C.slate });
pains.forEach((p,i)=>{
  const x = colX(i,3);
  box(s, x, py, pw, ph, C.warm, { flat:true });
  tx(s, String(i+1), { x:x+0.24, y:py, w:0.50, h:ph, size:26, bold:true, color:C.red,
    valign:"middle", noCheck:true });
  tx(s, p, { x:x+0.80, y:py, w:pIn, h:ph, size:T.small, bold:true, valign:"middle", noCheck:true });
});
foot(s, [{ text:"Beyond Customer Expectation  —  ", options:{ bold:true, color:C.red }},
         { text:"브랜드가 기대하는 '리포트'를 넘어, '그래서 무엇을 바꿔야 하는가'까지 드립니다.", options:{ color:C.ink }}],
     { size:12.5 });

/* ============================================================ 5. 02 가치 제안 ① */
s = newSlide(true);
head(s, "02", "가치 제안  |  브랜드가 모르는 자기 고객",
  "팝업이 끝나면 브랜드에게 드리는 다섯 가지 — 스스로는 절대 알 수 없는 답", { step:1, dark:true });
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

/* ============================================================ 6. 02 가치 제안 ② */
s = newSlide();
head(s, "02", "가치 제안  |  처방의 효과를 POS로 증명합니다",
  "경쟁사는 결제 데이터가 없어 자기 처방이 통했는지 증명할 수 없습니다", { step:1 });
const GA_Y = G.bottomF - 0.92, CH6 = GA_Y - 0.32 - G.top;
s.addChart(pres.ChartType.bar, [
  { name:"개선 전", labels:["유입률","집품률","구매 전환율"], values:[5.2,18.4,8.1] },
  { name:"개선 후", labels:["유입률","집품률","구매 전환율"], values:[6.8,22.1,11.4] }],
  { x:G.M, y:G.top, w:6.55, h:CH6, barDir:"col", chartColors:[C.slate, C.red],
    showTitle:true, title:"개선안 적용 전후 (단위: %)", titleFontFace:F, titleFontSize:12, titleColor:C.slate,
    showValue:true, dataLabelPosition:"outEnd", dataLabelFontFace:F, dataLabelFontSize:11,
    dataLabelColor:C.ink, dataLabelFormatCode:'0.0"%"',
    showLegend:true, legendPos:"b", legendFontFace:F, legendFontSize:11, legendColor:C.slate,
    catAxisLabelFontFace:F, catAxisLabelFontSize:12, catAxisLabelColor:C.ink,
    valAxisLabelFontFace:F, valAxisLabelFontSize:10, valAxisLabelColor:C.slate,
    valGridLine:{color:C.line,size:1}, catGridLine:{style:"none"},
    valAxisMinVal:0, valAxisMaxVal:26, barGapWidthPct:60 });
const rx = G.M + 6.55 + 0.30, rw = G.W - G.M - rx;
const c1 = cardH({ tag:"개선 → 적용 → 검증", list:["진열·동선·상품 배치 개선안 제시","2~4주 적용 후 POS 결제 데이터로 전후 실측 비교"] }, rw-G.padX*2);
drawCard(s, { tag:"개선 → 적용 → 검증",
  list:["진열·동선·상품 배치 개선안 제시","2~4주 적용 후 POS 결제 데이터로 전후 실측 비교"] }, rx, G.top, rw, c1);
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

/* ============================================================ 7. 02 가치 제안 ③ 맛보기 */
s = newSlide();
head(s, "02", "가치 제안  |  유입률 좋은 자리는 먼저 열어드립니다",
  "브랜드가 가장 먼저 묻는 질문은 \"어디에 열어야 하나\"입니다. 계약 전에 그 답의 앞 세 줄을 무상으로 엽니다  ※ 스팟명·수치는 설명용 예시", { step:1 });
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

/* ============================================================ 8. 03 채널 */
s = newSlide();
head(s, "03", "채널  |  고객에게 어떻게 접근하는가?",
  "외부 영업이 아니라 계약 시점에 팔립니다 — 안에서 밖으로", { step:1 });
const chs = [
 ["영업 채널 · 내부","백화점 MD·영업관리팀이 팝업 계약 체결 시 번들 제안","외부 영업비용 ≈ 0.  계약 시점 = 판매 시점",true],
 ["제품 채널","L.GA 브랜드 포털(대시보드) + 팝업 종료 7일 내 컨설턴트 리포트 미팅","리포트를 던지지 않고, 설명합니다",false],
 ["확산 채널","롯데 계열사(마트·하이마트·시네마·면세) → 해외 롯데몰 → 외부 유통사","레퍼런스가 쌓인 뒤에 밖으로",false],
 ["도달 채널 · 고객의 고객","L.POINT 앱 푸시 · 사이니지 · 키오스크","인사이트를 실행(리타게팅)으로 연결",false]];
const chLabelW = 2.9, chBodyX = G.M + 0.34 + chLabelW + 0.34, chBodyW = G.W-G.M-chBodyX;
const chH = Math.max((G.bottomF - G.top - 3*0.12)/4,
  ...chs.map(c => textH(c[1],chBodyW,T.body) + textH(c[2],chBodyW,T.tag) + 0.50));
chs.forEach((c,i)=>{
  const y = G.top + i*(chH+0.12), hi = c[3];
  box(s, G.M, y, G.CW, chH, hi ? C.ink : (i%2 ? C.white : C.tint), { line: hi ? C.ink : C.line });
  tx(s, c[0], { x:G.M+0.34, y:y, w:chLabelW, h:chH, size:T.body, bold:true,
    color: hi ? C.amber : C.red, valign:"middle" });
  const bh = textH(c[1],chBodyW,T.body) + 0.08 + textH(c[2],chBodyW,T.tag);
  tx(s, c[1], { x:chBodyX, y:y+(chH-bh)/2, w:chBodyW, size:T.body, bold:true, color: hi ? C.white : C.ink });
  tx(s, c[2], { x:chBodyX, y:y+(chH-bh)/2+textH(c[1],chBodyW,T.body)+0.08, w:chBodyW, size:T.tag,
    color: hi ? C.muteW : C.slate });
});
foot(s, "첫 고객은 외부 브랜드가 아니라 롯데 자신입니다.  그룹 안에서 검증하고, 그룹 시너지로 확산합니다.");

/* ============================================================ 9. 04 고객 관계 */
s = newSlide();
head(s, "04", "고객 관계  |  어떻게 확보·유지·성장시킬 것인가?",
  "증명이 갱신의 근거입니다 — 리텐션 엔진", { step:1 });
const relBandY = G.bottomF - 0.84;
const REL = [
  { title:"확보  Acquire", titleSize:T.h3, foot:"지불 의사를 가정하지 않는다", bodySize:T.body,
    list:["Phase 0: 롯데 내부 도입 (매출 0, 데이터 확보)","파일럿 3건 무상 제공","팝업 계약 시 번들 → 검증 후 과금"] },
  { title:"유지  Retain", titleSize:T.h3, dark:true, foot:"증명하는 컨설팅은 갱신된다", bodySize:T.body,
    list:["POS 전후 효과 검증 리포트","월간 처방 리포트 (구독)","전담 컨설턴트 리포트 미팅"] },
  { title:"성장  Grow", titleSize:T.h3, foot:"깔때기 업셀 — 3년차 리커링 51%", bodySize:T.body,
    list:["팝업 → 상설 구독 (정규 매장 첫 3개월 무료)","→ 성장 컨설팅 + 성과연동 수수료","→ L.POINT 리타게팅"] },
];
const relH = cardRow(s, REL, G.top, { h: Math.max(rowNat(REL,cols(3)), relBandY - 0.30 - G.top) });
[0,1].forEach(i => tx(s, "→", { x:colX(i,3)+cols(3), y:G.top+relH/2-0.26, w:G.gap, h:0.52,
  size:16, bold:true, color:C.slate, align:"center", valign:"middle", noCheck:true }));
band(s, relBandY, "\"바꿨더니 전환율이 8.1% → 11.4%\"  —  이 문장이 다음 계약서입니다.", T.lead);
foot(s, [{ text:"사랑과 신뢰를 받는 서비스  —  ", options:{ bold:true, color:C.red }},
         { text:"증명하기 전에는 청구하지 않습니다. 신뢰가 먼저 쌓이고, 갱신은 그 결과입니다.", options:{ color:C.ink }}],
     { size:12.5 });

/* ============================================================ 10. 05 수익원 ① */
s = newSlide();
head(s, "05", "수익원  |  고객은 무엇에 기꺼이 돈을 지불하는가?",
  "팝업은 매출 엔진이 아니라 유입 깔때기 — 3년차 매출의 51%가 반복 매출", { step:1 });
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

/* ============================================================ 11. 05 수익원 ② 손익 */
s = newSlide();
head(s, "05", "수익원  |  3개년 손익 — 24개월에 손익분기",
  "※ 내부 검증 전 추정치 — 롯데 내부 데이터로 재검증 필요", { step:1 });
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

/* ============================================================ 12. 06 핵심 자원 */
s = newSlide();
head(s, "06", "핵심 자원  |  반드시 필요한 자산은?",
  "새로 사는 자산이 거의 없습니다 — 이미 가진 그룹 자산 위에 AI를 얹는 AI 트랜스포메이션 과제입니다", { step:2 });
const res = [
  { title:"물리적", bodySize:T.body, list:["기존 CCTV · 전원 · 네트워크 · 보안망 재활용","팝업존 보완 카메라 (대당 약 25만원)","엣지박스 점포당 1식 (약 300만원)"] },
  { title:"지적 · 데이터  ★", dark:true, bodySize:T.body, list:["L.POINT 소비 이력 · POS 결제 · 전점 트래픽","카테고리 벤치마크 DB — 시간으로만 쌓임","엣지 추론 모델 · 리포트 자동화 템플릿"] },
  { title:"인적", bodySize:T.body, list:["리테일 컨설턴트 14 · DS/ML 8 · 애널리스트 8","개발 6 · 영업/CS 4 · PO 2  (Y3 42명)","컨설턴트 비중이 높은 이유: 처방·검증이 상품의 본체"] },
  { title:"금융", bodySize:T.body, list:["3년 CAPEX 11억 · 최대 현금소진 10억","10개 점포 파일럿 1.5억","CCTV가 이미 있어 가볍게 시작하는 사업"] },
];
const rw2 = cols(2);
const resH = Math.max(rowNat(res, rw2), (G.bottomF - G.top - 0.18)/2);
const resOff = Math.max(0, (resH - rowNat(res, rw2))/2);
res.forEach((r,i)=> drawCard(s, r, colX(i%2,2), G.top + Math.floor(i/2)*(resH+0.18), rw2, resH, resOff));
foot(s, "카메라는 누구나 깔 수 있습니다.  L.POINT와 POS와 전점 트래픽을 한 번에 가진 곳은 롯데뿐입니다.");

/* ============================================================ 13. 07 핵심 활동 */
s = newSlide();
head(s, "07", "핵심 활동  |  반드시 수행해야 하는 활동은?",
  "생산은 기계가, 문제해결은 사람이, 플랫폼은 시간이 합니다", { step:2 });
const ACTS = [
  { title:"생산", titleSize:T.h3, sub:"시스템이 한다", bodySize:T.small,
    list:["엣지 추론 — 영상을 클라우드로 올리지 않고 카메라 단에서 숫자로 변환","리포트 90% 자동 생성"] },
  { title:"문제해결", titleSize:T.h3, sub:"사람이 한다 — 상품의 본체", dark:true, bodySize:T.small,
    list:["고객 인사이트 분석 (신규 비율·미구매자·교차구매)","개선 처방 → 2~4주 적용 → POS 전후 검증"] },
  { title:"플랫폼", titleSize:T.h3, sub:"시간이 한다", bodySize:T.small,
    list:["카테고리 벤치마크 DB 축적","L.POINT 리타게팅 운영 · 3사 데이터 결합 거버넌스"] },
];
const LAYERS = [
  { title:"Layer 1 · 공간", titleSize:12, fill:C.cool, flat:true, bodySize:T.micro,
    body:"완전 익명 — 원본 미저장, 카메라 안에서 좌표·숫자로 변환. 연령대·성별은 특징값 없이 속성값만 추출",
    foot:"커버리지 = 방문자 100% (비회원 포함)" },
  { title:"Layer 2 · 고객", titleSize:12, fill:C.cool, flat:true, bodySize:T.micro,
    body:"동의 기반 — L.POINT 앱 체크인·QR·결제 적립 시에만 연결. 여기서만 소비 이력·교차구매가 붙습니다",
    foot:"커버리지 = 동의 회원" },
  { title:"연결", titleSize:12, fill:C.cool, flat:true, bodySize:T.micro,
    body:"개인 단위가 아니라 시간대 × 구역 × 세그먼트 집계 단위로만",
    foot:"최소 집계 5명 미만 셀은 미표시" },
];
const actRows = spread([rowNat(ACTS,cols(3)), rowNat(LAYERS,cols(3))], G.bottom - G.top - 0.56, "S12 핵심활동");
const actH = cardRow(s, ACTS, G.top, { h:actRows[0] });
const ly = G.top + actH + 0.56;
tx(s, "운영 원칙 · 핵심가치 Respect(존중) — 사람을 추적하지 않습니다. 공간을 측정합니다.",
  { x:G.M, y:ly-0.36, w:G.CW, size:12.5, bold:true, cs:1, color:C.slate });
cardRow(s, LAYERS, ly, { h:actRows[1] });

/* ============================================================ 14. 08 핵심 파트너 */
s = newSlide();
head(s, "08", "핵심 파트너  |  외부 파트너나 공급업체는 누구인가?",
  "세 조각이 다 모여야 성립하는 사업입니다 — 그래서 지금까지 아무도 못 했습니다", { step:2 });
tx(s, "내부 3사 합작 · 그룹 시너지", { x:G.M, y:G.top, w:5.0, size:12.5, bold:true, cs:1, color:C.slate });
const ORG = [
  { title:"롯데백화점", dark:true, sub:"공간 · 트래픽 · POS · MD 지식", foot:"첫 고객이자 판매 채널" },
  { title:"롯데이노베이트", dark:true, sub:"비전 AI 엔진 · 엣지 인프라", foot:"생산 담당" },
  { title:"롯데멤버스", dark:true, sub:"L.POINT 소비 이력 · 도달 채널", foot:"인사이트와 실행 담당" },
];
const EXT = [
  { title:"비전 AI 엔진 벤더", titleSize:T.body, bodySize:T.micro,
    body:"라이선스 또는 M&A — Build/Buy 병행 검토. 엔진은 사고, 데이터 결합과 검증 루프는 직접 만든다" },
  { title:"외부 VMD 디자이너", titleSize:T.body, bodySize:T.micro,
    body:"컨설팅 건당 변동비(400만원)로 유연하게 조달" },
  { title:"법무 · DPO · 개인정보 영향평가", titleSize:T.body, bodySize:T.micro,
    body:"착수 전 마일스톤 1번. 2계층 설계의 법적 검토" },
];
const orgY = G.top + 0.34;
const parRows = spread([rowNat(ORG,cols(3)), rowNat(EXT,cols(3))], G.bottomF - orgY - 0.56, "S13 파트너");
const orgH = cardRow(s, ORG, orgY, { h:parRows[0] });
[0,1].forEach(i => tx(s, "+", { x:colX(i,3)+cols(3), y:orgY+orgH/2-0.28, w:G.gap, h:0.56,
  size:20, bold:true, color:C.red, align:"center", valign:"middle", noCheck:true }));
const exY = orgY + orgH + 0.56;
tx(s, "외부 파트너", { x:G.M, y:exY-0.36, w:5.0, size:12.5, bold:true, cs:1, color:C.slate });
cardRow(s, EXT, exY, { h:parRows[1] });
foot(s, "조직: 3사 합작 TF → 성과 검증 후 분사(Spin-off) 옵션   ·   한 사만으로는 만들 수 없는, 그룹이어야 가능한 사업입니다",
  { size:12.5 });

/* ============================================================ 15. 09 비용 구조 */
s = newSlide();
head(s, "09", "비용 구조  |  가장 큰 비용 항목은?",
  "가장 큰 항목은 인건비 — 의도된 구조입니다. 클라우드 비용은 엣지로 1/10", { step:2 });
const COST_BAND_Y = G.bottom - 0.84, CH15 = COST_BAND_Y - 0.30 - G.top;
s.addChart(pres.ChartType.line, [
  { name:"클라우드 방식 (경쟁사)", labels:["10개점","50개점","100개점","300개점"], values:[0.8,4.0,8.0,24.0] },
  { name:"엣지 방식 (L.GA)", labels:["10개점","50개점","100개점","300개점"], values:[0.3,0.7,1.2,3.0] }],
  { x:G.M, y:G.top, w:6.40, h:CH15, chartColors:[C.slate, C.red], lineSize:3, lineDataSymbolSize:8,
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
const costH = spread([cardH(fixed, cwR-G.padX*2), cardH(varc, cwR-G.padX*2)], CH15 - 0.18, "S15 비용");
drawCard(s, fixed, cx, G.top, cwR, costH[0]);
drawCard(s, varc, cx, G.top+costH[0]+0.18, cwR, costH[1]);
band(s, COST_BAND_Y, "경쟁사가 못 넘은 벽은 원가 구조였습니다.  매장이 10배 늘어도 비용은 10배 늘지 않습니다.", T.body);

/* ============================================================ 16. 클로징 */
s = newSlide(true);
tx(s, "실행 로드맵", { x:0.9, y:0.68, w:6.0, size:T.tag, bold:true, color:C.amber, cs:2 });
const phases = [["Phase 0","0~3개월","롯데 내부 도입 · 10개점 파일럿"],
                ["Phase 1","4~12개월","팝업 유료 판매 · 검증 케이스 3건"],
                ["Phase 2","13~24개월","전점 확산 · 구독 · 리타게팅"],
                ["Phase 3","25~36개월","계열사 · 해외 롯데몰 · 외부"]];
const phW = 2.86, phH = 1.42;
phases.forEach((p,i)=>{
  const x = 0.9 + i*(phW+0.14);
  box(s, x, 1.10, phW, phH, C.ink2);
  tx(s, p[0], { x:x+0.26, y:1.24, w:phW-0.5, size:T.body, bold:true, color: i===0 ? C.amber : C.white });
  tx(s, p[1], { x:x+0.26, y:1.53, w:phW-0.5, size:T.micro, color:C.mute });
  tx(s, p[2], { x:x+0.26, y:1.82, w:phW-0.46, size:T.tag, lh:15, color:C.white });
});
tx(s, "브랜드는 자기가 판 것만 압니다.",
  { x:0.9, y:3.08, w:11.5, size:34, lh:LHt(34), bold:true, color:C.mute });
tx(s, "저희는 놓친 사람이 누구였는지 알려줍니다.",
  { x:0.9, y:3.86, w:11.5, size:34, lh:LHt(34), bold:true, color:C.white });
tx(s, "매일 삭제되던 97명의 데이터를 — 브랜드에게는 성장의 답으로 · 고객에게는 더 나은 매장 경험으로 · 롯데에게는 새로운 수익으로",
  { x:0.9, y:4.86, w:11.5, size:T.body, color:C.muteW });
box(s, 0.9, 5.62, 8.3, 0.98, C.ink2);
tx(s, "온라인에 GA가 있다면,  오프라인에는 L.GA가 있습니다.",
  { x:1.28, y:5.62, w:7.6, h:0.98, size:T.h3, bold:true, color:C.amber, valign:"middle" });
box(s, 9.46, 5.62, 2.97, 0.98, C.ink2);
tx(s, "Lifetime\nValue Creator", { x:9.46, y:5.62, w:2.97, h:0.98, size:12.5, lh:17, bold:true,
  color:C.muteW, align:"center", valign:"middle" });

/* ============================================================ 17. 백업 · 리스크 */
s = newSlide();
head(s, "Q&A", "리스크와 대응", "백업 슬라이드 — Q&A 대응용");
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

/* ============================================================ 저장 */
const ok = D.report();
pres.writeFile({ fileName: process.env.OUT || "LGA_롯데신사업_발표.pptx" })
  .then(f => console.log((ok ? "OK " : "경고 있음 ") + f + "  (글꼴: " + F + ")"));
