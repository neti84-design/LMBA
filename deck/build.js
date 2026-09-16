const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
pres.author = "LMBA Team";
pres.title = "L.GA - Lotte Growth Analytics (Business Model Canvas)";

const INK="101420", INK2="1B2130", RED="E11D2E", AMBER="F2A33C",
      SLATE="5D6675", LINE="E3E6EB", TINT="F6F7F9", W="FFFFFF", MUTEDW="A7AFBE",
      WARM="FBECEC", COOL="EDF1F6";   // Step 1 / Step 2 tints for the canvas overview
const F = "맑은 고딕";
const sh = () => ({ type:"outer", color:"9AA3B0", blur:14, offset:3, angle:90, opacity:0.20 });

// step: 1 = 가치 전달(red chip), 2 = 효율적 운영(ink chip)
function head(s, n, title, sub, opts){
  const o=opts||{}; const dark=!!o.dark; const step=o.step||0;
  const chip = step===2 ? (dark?AMBER:INK) : RED;
  const cw = String(n).length>2 ? 0.9 : 0.46, tx = 0.6+cw+0.16;
  s.addShape(pres.ShapeType.roundRect,{x:0.6,y:0.5,w:cw,h:0.46,fill:{color:chip},rectRadius:0.08});
  s.addText(String(n),{x:0.6,y:0.5,w:cw,h:0.46,align:"center",valign:"middle",
    fontFace:F,fontSize:String(n).length>2?12:15,bold:true,color:(step===2&&dark)?INK:W,margin:0,isTextBox:true});
  s.addText(title,{x:tx,y:0.44,w:10.82-tx+1.22-1.22,h:0.6,fontFace:F,fontSize:28,bold:true,
    color:dark?W:INK,valign:"middle",margin:0,isTextBox:true});
  if(sub) s.addText(sub,{x:tx,y:1.06,w:11.4,h:0.36,fontFace:F,fontSize:13,
    color:dark?MUTEDW:SLATE,valign:"middle",margin:0,isTextBox:true});
  if(step){
    const lab = step===1 ? "STEP 1 · 가치 전달" : "STEP 2 · 효율적 운영";
    s.addText(lab,{x:10.2,y:0.52,w:2.53,h:0.42,align:"right",fontFace:F,fontSize:11,bold:true,
      color:dark?AMBER:(step===1?RED:SLATE),charSpacing:1,valign:"middle",margin:0,isTextBox:true});
  }
}
function card(s,x,y,w,h,fill){
  s.addShape(pres.ShapeType.roundRect,{x,y,w,h,fill:{color:fill||TINT},rectRadius:0.06,
    line:{color:fill&&fill!==TINT?fill:LINE,width:1},shadow:sh()});
}
function band(s,y,h,text,size){
  s.addShape(pres.ShapeType.roundRect,{x:0.6,y:y,w:12.13,h:h,fill:{color:INK},rectRadius:0.06});
  s.addText(text,{x:1.0,y:y,w:11.4,h:h,fontFace:F,fontSize:size||16,bold:true,color:W,
    valign:"middle",align:"center",margin:0,isTextBox:true});
}
function bullets(arr){ return arr.map((t,i)=>({text:t,options:{bullet:true,breakLine:i<arr.length-1}})); }

/* ============ 1. TITLE ============ */
let s = pres.addSlide();
s.background = { color: INK };
s.addText("롯데그룹 신사업 제안  ·  비즈니스 모델 캔버스",{x:0.9,y:1.35,w:7.0,h:0.34,fontFace:F,fontSize:14,
  bold:true,color:AMBER,charSpacing:2,margin:0,isTextBox:true});
s.addText("L.GA",{x:0.85,y:1.75,w:6.4,h:1.25,fontFace:F,fontSize:68,bold:true,color:W,margin:0,isTextBox:true});
s.addText("Lotte Growth Analytics",{x:0.9,y:3.02,w:6.4,h:0.4,fontFace:F,fontSize:19,color:MUTEDW,margin:0,isTextBox:true});
s.addText("브랜드가 모르는 자기 고객을 알려주는\n오프라인 리테일 데이터 솔루션",
  {x:0.9,y:3.75,w:6.2,h:1.3,fontFace:F,fontSize:21,bold:true,color:W,lineSpacing:34,margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:0.9,y:5.32,w:6.2,h:0.86,fill:{color:INK2},rectRadius:0.06});
s.addText("Lifetime Value Creator",{x:1.25,y:5.45,w:5.6,h:0.3,fontFace:F,fontSize:12.5,bold:true,color:AMBER,margin:0,isTextBox:true});
s.addText("결제한 순간에만 쌓이던 고객 가치를, 사지 않은 순간까지 넓힙니다.",{x:1.25,y:5.76,w:5.6,h:0.3,fontFace:F,fontSize:11.5,color:MUTEDW,margin:0,isTextBox:true});
s.addText("롯데그룹 핵심인재 MBA 과정  |  최종 발표",{x:0.9,y:6.55,w:6.4,h:0.34,fontFace:F,fontSize:12,color:SLATE,margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:7.85,y:1.55,w:4.85,h:4.4,fill:{color:INK2},rectRadius:0.08});
s.addText("매장에 들어오는 100명 중",{x:8.3,y:2.0,w:4.0,h:0.36,fontFace:F,fontSize:15,color:MUTEDW,margin:0,isTextBox:true});
s.addText([{text:"3",options:{fontSize:78,bold:true,color:RED}},{text:"명만 구매합니다.",options:{fontSize:21,bold:true,color:W}}],
  {x:8.3,y:2.45,w:4.1,h:1.3,fontFace:F,valign:"bottom",margin:0,isTextBox:true});
s.addText("나머지 97명이 무엇을 보고 왜 돌아섰는지는\n매일 CCTV에 찍히고, 매일 그냥 삭제됩니다.",
  {x:8.3,y:4.25,w:4.1,h:1.1,fontFace:F,fontSize:14,color:AMBER,lineSpacing:24,valign:"top",margin:0,isTextBox:true});
s.addNotes("백화점 매장에 100명이 들어옵니다. 그중 구매하는 사람은 평균 3명 남짓입니다. 브랜드가 데이터로 알고 있는 고객은 이 3명뿐입니다. 나머지 97명 - 무엇을 보고, 어디서 멈추고, 왜 돌아섰는지. 그 데이터는 매일 CCTV에 찍히고, 매일 그냥 삭제됩니다. 오늘 저희는 브랜드에게 그 97명이 누구였는지 알려주는 사업을, 비즈니스 모델 캔버스 9개 블록 순서로 말씀드리겠습니다. (30초)");

/* ============ 2. CANVAS OVERVIEW ============ */
s = pres.addSlide();
head(s,"BMC","한 장으로 보는 L.GA 비즈니스 모델","Step 1 가치 전달(01~05)을 먼저 확정하고, Step 2 효율적 운영(06~09)을 채웠습니다 — 다음 장에서 그룹 전략과의 정합성을 먼저 보겠습니다");
function block(x,y,w,h,num,title,lines,step,hi){
  const fill = hi?INK:(step===1?WARM:COOL);
  s.addShape(pres.ShapeType.roundRect,{x,y,w,h,fill:{color:fill},rectRadius:0.05,line:{color:hi?INK:LINE,width:1}});
  s.addShape(pres.ShapeType.roundRect,{x:x+0.15,y:y+0.14,w:0.4,h:0.3,fill:{color:hi?AMBER:(step===1?RED:INK)},rectRadius:0.05});
  s.addText(num,{x:x+0.15,y:y+0.14,w:0.4,h:0.3,align:"center",valign:"middle",fontFace:F,fontSize:10,bold:true,color:hi?INK:W,margin:0,isTextBox:true});
  s.addText(title,{x:x+0.62,y:y+0.12,w:w-0.75,h:0.34,fontFace:F,fontSize:12,bold:true,color:hi?W:INK,valign:"middle",margin:0,isTextBox:true});
  s.addText(bullets(lines),{x:x+0.15,y:y+0.55,w:w-0.3,h:h-0.65,fontFace:F,fontSize:10,color:hi?MUTEDW:INK,
    paraSpaceAfter:4,valign:"top",margin:0,isTextBox:true});
}
const cw=2.34, g=0.1, top=1.6, th=3.45;
block(0.6,top,cw,th,"08","핵심 파트너",["롯데백화점 · 롯데이노베이트 · 롯데멤버스 3사 합작","비전 AI 엔진 벤더 (Build/Buy)","외부 VMD · 법무·DPO"],2);
block(0.6+cw+g,top,cw,(th-g)/2,"07","핵심 활동",["엣지 추론 · 리포트 자동화","인사이트 → 처방 → POS 검증","벤치마크 DB · 리타게팅 운영"],2);
block(0.6+cw+g,top+(th+g)/2,cw,(th-g)/2,"06","핵심 자원",["기존 CCTV · 엣지박스","L.POINT · POS · 전점 트래픽 ★","컨설턴트 14명 · CAPEX 11억"],2);
block(0.6+2*(cw+g),top,cw,th,"02","가치 제안",["브랜드가 모르는 자기 고객 — 신규 비율 · 미구매자 · 교차구매 · 이탈 SKU · 차기 출점","처방이 통했는지 POS로 증명","온라인 GA의 오프라인 구현"],1,true);
block(0.6+3*(cw+g),top,cw,(th-g)/2,"04","고객 관계",["파일럿 무상 → 검증 후 과금","POS 검증 리포트 = 갱신 근거","구독 · 컨설팅 · 리타게팅 업셀"],1);
block(0.6+3*(cw+g),top+(th+g)/2,cw,(th-g)/2,"03","채널",["MD·영업관리 팝업 계약 번들","L.GA 포털 · 리포트 미팅","계열사 → 해외 롯데몰 → 외부"],1);
block(0.6+4*(cw+g),top,cw,th,"01","고객 세그먼트",["롯데 팝업 브랜드 (연 2,000건 가정)","상설 입점 브랜드 매장","롯데 내부 MD · 계열사 (첫 고객)","외부 유통사 · 해외 (Phase 3)"],1);
const by=top+th+0.12, bh=6.95-by;
block(0.6,by,6.0,bh,"09","비용 구조",["고정비: 인건비(컨설턴트) 중심 — Y3 판관비 53.7억","변동비: 팝업 건당 75만 · 엣지로 클라우드 1/10 → GM 77%"],2);
block(0.6+6.0+0.13,by,6.0,bh,"05","수익원",["팝업 패키지 320만 · 구독 월 45만 · 컨설팅 1,500만+성과 · 리타게팅 · 라이선스","Y3 매출 128.6억 · 영업이익 44.9억 (35%) · 리커링 51%"],1);
s.addNotes("전체 구조를 한 장으로 먼저 보여드립니다. 오른쪽 다섯 블록이 가치 전달 - 누구에게 무엇을. 왼쪽 네 블록이 효율적 운영 - 어떻게 만들 것인가. 가운데 가치 제안이 심장입니다. 브랜드가 모르는 자기 고객을 알려주고, 처방이 통했는지 POS로 증명한다. 이제 01번부터 순서대로 가겠습니다. (25초)");

/* ============ 3. 롯데 전략 정합성 ============ */
s = pres.addSlide();
head(s,"FIT","왜 롯데인가  |  그룹 전략과 핵심가치에 맞는 사업입니다","신사업을 먼저 만들고 명분을 붙인 것이 아니라, 그룹이 가려는 방향에서 거꾸로 설계했습니다");
const strat=[
 ["그룹 비전","Lifetime Value Creator","고객의 '평생 가치'는 지금까지 결제한 순간에만 기록됐습니다.\nL.GA는 사지 않은 순간까지 가치로 바꿉니다.",false],
 ["경영 방침","AI 트랜스포메이션","새 인프라를 사는 사업이 아닙니다.\n이미 깔려 있는 CCTV 위에 AI를 얹는 — 기존 자산의 AI 내재화 사례입니다.",true],
 ["신성장 테마","뉴라이프플랫폼","상품을 파는 유통에서 데이터를 파는 플랫폼으로.\n롯데 리테일 자산의 플랫폼화 그 자체입니다.",false]];
strat.forEach((t,i)=>{
  const x=0.6+i*4.07, hi=t[3];
  s.addShape(pres.ShapeType.roundRect,{x:x,y:1.62,w:3.86,h:2.12,fill:{color:hi?INK:TINT},rectRadius:0.07,line:{color:hi?INK:LINE,width:1},shadow:sh()});
  s.addText(t[0],{x:x+0.32,y:1.8,w:3.22,h:0.3,fontFace:F,fontSize:11,bold:true,color:hi?AMBER:RED,charSpacing:1,margin:0,isTextBox:true});
  s.addText(t[1],{x:x+0.32,y:2.12,w:3.22,h:0.44,fontFace:F,fontSize:17,bold:true,color:hi?W:INK,margin:0,isTextBox:true});
  s.addText(t[2],{x:x+0.32,y:2.62,w:3.22,h:1.04,fontFace:F,fontSize:11,color:hi?MUTEDW:INK,lineSpacing:16,valign:"top",margin:0,isTextBox:true});
});
s.addText("그룹 핵심가치 = 이 사업의 설계 원칙",{x:0.6,y:3.9,w:6,h:0.34,fontFace:F,fontSize:13,bold:true,color:SLATE,charSpacing:1,margin:0,isTextBox:true});
s.addText("미션 · 사랑과 신뢰를 받는 제품과 서비스",{x:6.8,y:3.9,w:5.93,h:0.34,align:"right",fontFace:F,fontSize:11.5,color:SLATE,margin:0,isTextBox:true});
const vals=[
 ["Beyond Customer\nExpectation","고객 기대 그 이상","리포트에서 멈추지 않습니다. 처방하고, POS로 증명까지 합니다."],
 ["Challenge","도전","'사지 않은 고객'을 데이터화한 유통사는 아직 없습니다."],
 ["Respect","존중","사람을 추적하지 않고 공간을 측정합니다. 동의 없이 개인을 연결하지 않습니다."],
 ["Originality","독창성","GA를 옮기지 않고, 오프라인 고유 지표로 다시 정의했습니다."]];
vals.forEach((v,i)=>{
  const x=0.6+i*3.07;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:4.3,w:2.92,h:1.78,fill:{color:WARM},rectRadius:0.06,line:{color:WARM,width:1}});
  s.addText(v[0],{x:x+0.26,y:4.44,w:2.4,h:0.56,fontFace:F,fontSize:12.5,bold:true,color:RED,lineSpacing:15,valign:"top",margin:0,isTextBox:true});
  s.addText(v[1],{x:x+0.26,y:5.02,w:2.4,h:0.28,fontFace:F,fontSize:10.5,color:SLATE,margin:0,isTextBox:true});
  s.addText(v[2],{x:x+0.26,y:5.34,w:2.42,h:0.68,fontFace:F,fontSize:10.5,color:INK,lineSpacing:15,valign:"top",margin:0,isTextBox:true});
});
band(s,6.25,0.85,"롯데가 '할 수 있는' 신사업이 아니라,  롯데만 할 수 있고 롯데의 약속에 맞는 신사업입니다.",16);
s.addNotes("본론에 들어가기 전에 한 장만 더 보겠습니다. 이 사업이 왜 롯데의 사업이어야 하는가입니다.\n그룹 비전은 Lifetime Value Creator입니다. 그런데 지금까지 고객의 평생 가치는 결제한 순간에만 기록됐습니다. 저희는 사지 않은 순간까지 가치로 바꿉니다. 비전을 데이터로 실행하는 사업입니다.\n회장님이 강조해 오신 AI 트랜스포메이션 관점에서도, 이건 새 인프라를 사는 사업이 아니라 이미 깔린 CCTV 위에 AI를 얹는 사업입니다. 그리고 4대 신성장 테마 중 뉴라이프플랫폼, 상품을 파는 유통에서 데이터를 파는 플랫폼으로 가는 방향과 정확히 같습니다.\n핵심가치 네 가지는 그대로 이 사업의 설계 원칙이 됐습니다. 고객 기대 그 이상 - 리포트에서 멈추지 않고 증명까지. 도전 - 아무도 못 한 사지 않은 고객의 데이터화. 존중 - 사람을 추적하지 않고 공간을 측정한다. 독창성 - GA를 베끼지 않고 오프라인 지표로 다시 정의했다.\n롯데가 할 수 있는 신사업이 아니라, 롯데만 할 수 있고 롯데의 약속에 맞는 신사업입니다. (45초)");

/* ============ 4. 01 고객 세그먼트 ============ */
s = pres.addSlide();
head(s,"01","고객 세그먼트  |  우리의 타겟 고객은 누구인가?","성과 측정 니즈가 가장 절박한 곳부터, 안에서 밖으로",{step:1});
const segs=[
 ["1차 · 핵심","롯데 팝업 브랜드","백화점·몰·아울렛에 팝업을 여는 브랜드. 특히 정규 입점을 노리는 D2C·신생 브랜드.\n연 약 2,000건 (가정)",INK,W,AMBER],
 ["2차 · 리커링","상설 입점 브랜드 매장","팝업에서 검증된 브랜드가 정규 매장을 열 때 월 구독으로 전환",TINT,INK,RED],
 ["0차 · 첫 고객","롯데 내부 MD · 계열사","백화점이 자기 매장 최적화를 위해 먼저 쓴다. 매출 0원, 대신 데이터와 레퍼런스",TINT,INK,RED]];
segs.forEach((c,i)=>{
  const x=0.6+i*4.07;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:1.72,w:3.86,h:2.6,fill:{color:c[3]},rectRadius:0.07,line:{color:c[3]===INK?INK:LINE,width:1},shadow:sh()});
  s.addText(c[0],{x:x+0.32,y:1.95,w:3.22,h:0.3,fontFace:F,fontSize:11,bold:true,color:c[5],charSpacing:1,margin:0,isTextBox:true});
  s.addText(c[1],{x:x+0.32,y:2.3,w:3.22,h:0.45,fontFace:F,fontSize:17,bold:true,color:c[4],margin:0,isTextBox:true});
  s.addText(c[2],{x:x+0.32,y:2.85,w:3.22,h:1.6,fontFace:F,fontSize:12,color:c[3]===INK?MUTEDW:INK,lineSpacing:19,valign:"top",margin:0,isTextBox:true});
});
s.addText("이들의 Pain",{x:0.6,y:4.62,w:3,h:0.34,fontFace:F,fontSize:13,bold:true,color:SLATE,charSpacing:1,margin:0,isTextBox:true});
const pains=["팝업이 끝나면 손에 쥐는 건 매출 총액과 인스타 해시태그 개수뿐","온 사람 중 신규가 몇 %인지, 안 산 사람이 누구인지 모른다","그래서 다음 팝업도 감으로 연다"];
pains.forEach((p,i)=>{
  const x=0.6+i*4.07;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:5.02,w:3.86,h:1.3,fill:{color:WARM},rectRadius:0.05,line:{color:WARM,width:1}});
  s.addText(String(i+1),{x:x+0.25,y:5.02,w:0.5,h:1.3,fontFace:F,fontSize:28,bold:true,color:RED,valign:"middle",margin:0,isTextBox:true});
  s.addText(p,{x:x+0.8,y:5.02,w:2.85,h:1.3,fontFace:F,fontSize:12,bold:true,color:INK,valign:"middle",lineSpacing:18,margin:0,isTextBox:true});
});
s.addText([{text:"Beyond Customer Expectation  —  ",options:{bold:true,color:RED}},{text:"브랜드가 기대하는 \u0027리포트\u0027를 넘어, \u0027그래서 무엇을 바꿔야 하는가\u0027까지 드립니다.",options:{color:INK}}],
  {x:0.6,y:6.45,w:12.13,h:0.4,align:"center",fontFace:F,fontSize:12.5,bold:true,margin:0,isTextBox:true});
s.addNotes("첫 번째, 고객 세그먼트. 1차 타겟은 롯데백화점과 몰에 팝업을 여는 브랜드입니다. 연 2천 건 규모로 추정하고 있고, 특히 정규 입점을 노리는 신생 브랜드가 성과 측정에 가장 절박합니다. 2차는 상설 입점 매장 - 여기서 구독 매출이 나옵니다. 그리고 첫 고객은 사실 롯데 자신입니다. 백화점이 먼저 써서 데이터와 레퍼런스를 만듭니다. 이들의 고통은 명확합니다. 팝업이 끝나면 매출 총액과 해시태그 개수가 전부고, 온 사람이 신규인지 기존인지 모르고, 그래서 다음 팝업도 감으로 엽니다. 고객의 기대 그 이상 - 브랜드가 기대하는 건 리포트지만, 저희는 그래서 무엇을 바꿔야 하는가까지 드립니다. (40초)");

/* ============ 5. 02 가치 제안 ① (dark climax) ============ */
s = pres.addSlide();
s.background = { color: INK };
head(s,"02","가치 제안  |  브랜드가 모르는 자기 고객","팝업이 끝나면 브랜드에게 드리는 다섯 가지 — 스스로는 절대 알 수 없는 답",{step:1,dark:true});
const five=[
 ["이번에 온 사람 중 신규가 몇 %인가","매출만 보면 성공 같지만, 기존 고객만 다시 온 것일 수 있습니다"],
 ["들어왔는데 안 산 사람은 누구였나","가격대가 안 맞았는지, 타깃을 잘못 잡았는지가 여기서 나옵니다"],
 ["우리 방문객이 평소 어디서 무엇을 사는가","\"우리 고객의 38%가 경쟁사 A 구매 이력\" — 포지셔닝과 가격 전략을 바꿉니다"],
 ["집었는데 안 산 상품","온라인의 장바구니 이탈과 같습니다. 그대로 상품기획 피드백이 됩니다"],
 ["다음 팝업은 어디에, 언제, 어느 층에","롯데 전점 트래픽이 있어야만 나오는 처방입니다"]];
five.forEach((f,i)=>{
  const y=1.80+i*0.93;
  s.addShape(pres.ShapeType.roundRect,{x:0.62,y:y,w:12.1,h:0.82,fill:{color:INK2},rectRadius:0.05});
  s.addShape(pres.ShapeType.ellipse,{x:0.92,y:y+0.19,w:0.44,h:0.44,fill:{color:RED}});
  s.addText(String(i+1),{x:0.92,y:y+0.19,w:0.44,h:0.44,align:"center",valign:"middle",fontFace:F,fontSize:14,bold:true,color:W,margin:0,isTextBox:true});
  s.addText(f[0],{x:1.6,y:y+0.08,w:5.5,h:0.66,fontFace:F,fontSize:15,bold:true,color:W,valign:"middle",margin:0,isTextBox:true});
  s.addText(f[1],{x:7.25,y:y+0.08,w:5.2,h:0.66,fontFace:F,fontSize:12,color:MUTEDW,valign:"middle",margin:0,isTextBox:true});
});
s.addText("브랜드는 자기가 판 것만 압니다.  L.POINT 소비 이력과 롯데 전점 트래픽이 동시에 있어야만 나오는 답입니다.",
  {x:0.62,y:6.55,w:12.1,h:0.42,align:"center",fontFace:F,fontSize:14,bold:true,color:AMBER,margin:0,isTextBox:true});
s.addNotes("두 번째, 가치 제안. 이게 이 사업의 심장입니다. 브랜드는 자기가 판 것만 압니다. 자사 POS가 데이터의 끝이니까요. 저희는 팝업이 끝나면 이 다섯 가지를 드립니다.\n첫째, 이번에 온 사람 중 신규가 몇 퍼센트인가. 둘째, 들어왔는데 안 산 사람은 누구였나. 셋째, 우리 방문객이 평소 어디서 무엇을 사는가. 넷째, 집었는데 안 산 상품 - 온라인 장바구니 이탈과 똑같고 그대로 상품기획 피드백이 됩니다. 다섯째, 다음 팝업은 어디에, 언제, 어느 층에.\n(한 박자) 이 다섯 가지는 브랜드가 아무리 돈을 써도 스스로 알 수 없습니다. L.POINT 소비 이력과 롯데 전점 트래픽이 동시에 있어야만 나오는 답이기 때문입니다. (70초 — 손가락으로 꼽으며)");

/* ============ 6. 02 가치 제안 ② 검증 ============ */
s = pres.addSlide();
head(s,"02","가치 제안  |  처방의 효과를 POS로 증명합니다","경쟁사는 결제 데이터가 없어 자기 처방이 통했는지 증명할 수 없습니다",{step:1});
s.addChart(pres.ChartType.bar,[
 {name:"개선 전",labels:["유입률","집품률","구매 전환율"],values:[5.2,18.4,8.1]},
 {name:"개선 후",labels:["유입률","집품률","구매 전환율"],values:[6.8,22.1,11.4]}],
 {x:0.6,y:1.7,w:6.6,h:4.0,barDir:"col",chartColors:[SLATE,RED],
  showTitle:true,title:"개선안 적용 전후 (단위: %)",titleFontFace:F,titleFontSize:12,titleColor:SLATE,
  showValue:true,dataLabelPosition:"outEnd",dataLabelFontFace:F,dataLabelFontSize:11,dataLabelColor:INK,dataLabelFormatCode:'0.0"%"',
  showLegend:true,legendPos:"b",legendFontFace:F,legendFontSize:11,legendColor:SLATE,
  catAxisLabelFontFace:F,catAxisLabelFontSize:12,catAxisLabelColor:INK,
  valAxisLabelFontFace:F,valAxisLabelFontSize:10,valAxisLabelColor:SLATE,
  valGridLine:{color:LINE,size:1},catGridLine:{style:"none"},valAxisMinVal:0,valAxisMaxVal:26,barGapWidthPct:60});
card(s,7.5,1.7,5.23,1.85,TINT);
s.addText("개선 → 적용 → 검증",{x:7.85,y:1.9,w:4.6,h:0.32,fontFace:F,fontSize:13,bold:true,color:SLATE,margin:0,isTextBox:true});
s.addText(bullets(["진열·동선·상품 배치 개선안 제시","2~4주 적용 후 POS 결제 데이터로 전후 실측 비교"]),
  {x:7.85,y:2.3,w:4.6,h:1.1,fontFace:F,fontSize:12,color:INK,paraSpaceAfter:8,valign:"top",margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:7.5,y:3.7,w:5.23,h:2.0,fill:{color:INK},rectRadius:0.06});
s.addText("효과를 증명 못 하는 컨설팅은\n한 번 팔리고 끝납니다.",{x:7.85,y:3.92,w:4.6,h:0.8,fontFace:F,fontSize:14,color:MUTEDW,lineSpacing:22,margin:0,isTextBox:true});
s.addText("증명하는 컨설팅은 갱신됩니다.",{x:7.85,y:4.85,w:4.6,h:0.6,fontFace:F,fontSize:16,bold:true,color:AMBER,margin:0,isTextBox:true});
// GA analogy strip
s.addShape(pres.ShapeType.roundRect,{x:0.6,y:5.95,w:12.13,h:0.95,fill:{color:TINT},rectRadius:0.05,line:{color:LINE,width:1}});
s.addText("온라인 GA의 오프라인 구현",{x:0.95,y:5.95,w:2.6,h:0.95,fontFace:F,fontSize:12,bold:true,color:SLATE,valign:"middle",margin:0,isTextBox:true});
const ga=[["노출","통행 수"],["클릭률","유입률 ★"],["장바구니","집품률"],["구매","전환율"],["이탈률","3초 이탈"]];
ga.forEach((p,i)=>{
  const x=3.55+i*1.84;
  s.addText([{text:p[0]+"  →  ",options:{color:SLATE}},{text:p[1],options:{bold:true,color:p[1].includes("★")?RED:INK}}],
    {x:x,y:5.95,w:1.8,h:0.95,fontFace:F,fontSize:12,valign:"middle",margin:0,isTextBox:true});
});
s.addNotes("가치 제안의 두 번째 축입니다. 인사이트만으로는 부족합니다. 브랜드가 진짜 원하는 건 매출이니까요. 그래서 이렇게 바꾸세요까지 가고, 바꾼 다음 실제로 매출이 올랐는지를 POS로 증명합니다. 집품에서 구매로 가는 전환율이 8.1%에서 11.4%로 올랐습니다 - 이렇게요. 경쟁사는 결제 데이터가 없어서 이걸 못 합니다. 효과를 증명 못 하는 컨설팅은 한 번 팔리고 끝나고, 증명하는 컨설팅은 갱신됩니다. 고객 기대 그 이상이라는 핵심가치를, 증명이라는 방식으로 지키는 구조입니다. 지표 체계는 온라인 GA와 1:1입니다. 노출은 통행 수, 클릭률은 유입률, 장바구니는 집품률. (45초)");

/* ============ 7. 03 채널 ============ */
s = pres.addSlide();
head(s,"03","채널  |  고객에게 어떻게 접근하는가?","외부 영업이 아니라 계약 시점에 팔립니다 — 안에서 밖으로",{step:1});
const chs=[
 ["영업 채널 · 내부","백화점 MD·영업관리팀이 팝업 계약 체결 시 번들 제안","외부 영업비용 ≈ 0.  계약 시점 = 판매 시점",true],
 ["제품 채널","L.GA 브랜드 포털(대시보드) + 팝업 종료 7일 내 컨설턴트 리포트 미팅","리포트를 던지지 않고, 설명합니다",false],
 ["확산 채널","롯데 계열사(마트·하이마트·시네마·면세) → 해외 롯데몰 → 외부 유통사","레퍼런스가 쌓인 뒤에 밖으로",false],
 ["도달 채널 · 고객의 고객","L.POINT 앱 푸시 · 사이니지 · 키오스크","인사이트를 실행(리타게팅)으로 연결",false]];
chs.forEach((c,i)=>{
  const y=1.74+i*1.2;
  s.addShape(pres.ShapeType.roundRect,{x:0.6,y:y,w:12.13,h:1.06,fill:{color:c[3]?INK:(i%2?W:TINT)},rectRadius:0.05,line:{color:c[3]?INK:LINE,width:1}});
  s.addText(c[0],{x:0.95,y:y,w:2.9,h:1.06,fontFace:F,fontSize:14,bold:true,color:c[3]?AMBER:RED,valign:"middle",margin:0,isTextBox:true});
  s.addText(c[1],{x:3.95,y:y+0.12,w:8.5,h:0.5,fontFace:F,fontSize:14,bold:true,color:c[3]?W:INK,valign:"middle",margin:0,isTextBox:true});
  s.addText(c[2],{x:3.95,y:y+0.6,w:8.5,h:0.36,fontFace:F,fontSize:11,color:c[3]?MUTEDW:SLATE,valign:"middle",margin:0,isTextBox:true});
});
s.addText("첫 고객은 외부 브랜드가 아니라 롯데 자신입니다.  그룹 안에서 검증하고, 그룹 시너지로 확산합니다.",
  {x:0.6,y:6.6,w:12.13,h:0.4,align:"center",fontFace:F,fontSize:14,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("세 번째, 채널. 이 사업은 외부 영업을 하지 않습니다. 백화점 MD와 영업관리팀이 팝업 계약을 맺는 그 자리에서 번들로 제안합니다. 계약 시점이 곧 판매 시점이라 영업비용이 거의 없습니다. 제품은 포털 대시보드와, 팝업 종료 후 컨설턴트가 직접 리포트를 설명하는 미팅으로 전달됩니다. 확산은 안에서 밖으로 - 계열사, 해외 롯데몰, 그다음 외부 유통사입니다. 그리고 도달 채널, L.POINT 앱 푸시는 인사이트를 실행으로 연결하는 통로입니다. (30초)");

/* ============ 8. 04 고객 관계 ============ */
s = pres.addSlide();
head(s,"04","고객 관계  |  어떻게 확보·유지·성장시킬 것인가?","증명이 갱신의 근거입니다 — 리텐션 엔진",{step:1});
const rel=[
 ["확보  Acquire",["Phase 0: 롯데 내부 도입 (매출 0, 데이터 확보)","파일럿 3건 무상 제공","팝업 계약 시 번들 → 검증 후 과금"],"지불 의사를 가정하지 않는다"],
 ["유지  Retain",["POS 전후 효과 검증 리포트","월간 처방 리포트 (구독)","전담 컨설턴트 리포트 미팅"],"증명하는 컨설팅은 갱신된다"],
 ["성장  Grow",["팝업 → 상설 구독 (정규 매장 첫 3개월 무료)","→ 성장 컨설팅 + 성과연동 수수료","→ L.POINT 리타게팅"],"깔때기 업셀 — 3년차 리커링 51%"]];
rel.forEach((r,i)=>{
  const x=0.6+i*4.07, hi=i===1;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:1.72,w:3.86,h:3.35,fill:{color:hi?INK:TINT},rectRadius:0.07,line:{color:hi?INK:LINE,width:1},shadow:sh()});
  s.addText(r[0],{x:x+0.32,y:1.98,w:3.22,h:0.42,fontFace:F,fontSize:17,bold:true,color:hi?AMBER:RED,margin:0,isTextBox:true});
  s.addText(bullets(r[1]),{x:x+0.32,y:2.55,w:3.22,h:2.2,fontFace:F,fontSize:12.5,color:hi?W:INK,paraSpaceAfter:10,valign:"top",margin:0,isTextBox:true});
  s.addText(r[2],{x:x+0.32,y:4.3,w:3.22,h:0.6,fontFace:F,fontSize:12,bold:true,color:hi?MUTEDW:SLATE,valign:"bottom",margin:0,isTextBox:true});
  if(i<2) s.addText("→",{x:x+3.86,y:3.1,w:0.21,h:0.5,align:"center",fontFace:F,fontSize:16,bold:true,color:SLATE,valign:"middle",margin:0,isTextBox:true});
});
band(s,5.45,1.0,"\"바꿨더니 전환율이 8.1% → 11.4%\"  —  이 문장이 다음 계약서입니다.",16);
s.addText([{text:"사랑과 신뢰를 받는 서비스  —  ",options:{bold:true,color:RED}},{text:"증명하기 전에는 청구하지 않습니다. 신뢰가 먼저 쌓이고, 갱신은 그 결과입니다.",options:{color:INK}}],
  {x:0.6,y:6.6,w:12.13,h:0.4,align:"center",fontFace:F,fontSize:12.5,bold:true,margin:0,isTextBox:true});
s.addNotes("네 번째, 고객 관계. 확보는 지불 의사를 가정하지 않습니다. 롯데가 먼저 쓰고, 파일럿 3건을 무상으로 하고, 검증된 뒤에 과금합니다. 유지가 핵심입니다. 바꿨더니 전환율이 8.1에서 11.4로 올랐다 - 이 POS 검증 리포트가 다음 계약의 근거가 됩니다. 성장은 깔때기입니다. 팝업에서 검증된 브랜드가 정규 매장을 열면 구독으로, 심층 니즈가 생기면 컨설팅과 성과연동으로, 그리고 리타게팅으로 올라갑니다. 사랑과 신뢰를 받는 서비스라는 그룹 미션 그대로, 증명하기 전에는 청구하지 않습니다. (45초)");

/* ============ 9. 05 수익원 ① ============ */
s = pres.addSlide();
head(s,"05","수익원  |  고객은 무엇에 기꺼이 돈을 지불하는가?","팝업은 매출 엔진이 아니라 유입 깔때기 — 3년차 매출의 51%가 반복 매출",{step:1});
const tiers=[
 ["①","팝업 솔루션 패키지","리포트 + 고객 인사이트 + 개선 처방","ASP 320만원 / 건","유입"],
 ["②","상설 매장 구독","월간 처방 리포트 + 대시보드","월 45만원 / 매장","리커링"],
 ["③","성장 컨설팅 + 성과연동","VMD · 상품기획 · 출점전략","1,500만원 + 성과 5~10%","고부가"],
 ["④","L.POINT 리타게팅","안 산 고객에게 앱 쿠폰 발송","CPM / CPA","리커링"],
 ["⑤","벤치마크 라이선스","카테고리 기준치 정기 리포트","연 2,000~5,000만원","리커링"]];
tiers.forEach((t,i)=>{
  const y=1.78+i*0.96, rec=t[4]==="리커링";
  s.addShape(pres.ShapeType.roundRect,{x:0.6,y:y,w:12.13,h:0.84,fill:{color:i%2?W:TINT},rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(t[0],{x:0.85,y:y,w:0.55,h:0.84,align:"center",valign:"middle",fontFace:F,fontSize:20,bold:true,color:RED,margin:0,isTextBox:true});
  s.addText(t[1],{x:1.5,y:y,w:3.2,h:0.84,fontFace:F,fontSize:15,bold:true,color:INK,valign:"middle",margin:0,isTextBox:true});
  s.addText(t[2],{x:4.75,y:y,w:3.7,h:0.84,fontFace:F,fontSize:12,color:SLATE,valign:"middle",margin:0,isTextBox:true});
  s.addText(t[3],{x:8.45,y:y,w:3.05,h:0.84,align:"right",fontFace:F,fontSize:14,bold:true,color:INK,valign:"middle",margin:0,isTextBox:true});
  s.addShape(pres.ShapeType.roundRect,{x:11.72,y:y+0.24,w:0.85,h:0.36,fill:{color:rec?RED:LINE},rectRadius:0.05});
  s.addText(t[4],{x:11.72,y:y+0.24,w:0.85,h:0.36,align:"center",valign:"middle",fontFace:F,fontSize:10,bold:true,color:rec?W:SLATE,margin:0,isTextBox:true});
});
s.addText("구글 애널리틱스는 무료입니다. 구글은 측정이 아니라 광고로 법니다. 저희도 같습니다.",
  {x:0.6,y:6.62,w:12.13,h:0.42,align:"center",fontFace:F,fontSize:15,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("다섯 번째, 수익원. 다섯 단계로 쌓입니다. 1단 팝업 패키지, 평균 320만원. 돈을 버는 상품이 아니라 브랜드를 데려오는 깔때기입니다. 2단 상설 구독 월 45만원 - 여기서 반복 매출이 생깁니다. 3단 성장 컨설팅 1,500만원에, 검증이 되니까 늘어난 매출의 5에서 10퍼센트를 성과 수수료로 받습니다. 4단 L.POINT 리타게팅 - 안 산 고객에게 앱으로 쿠폰을 보내 다시 부릅니다. 구글 애널리틱스는 무료입니다. 구글은 광고로 법니다. 저희도 같습니다. 5단 벤치마크 리포트 판매. 3년차 매출의 51%가 반복 매출입니다. (40초)");

/* ============ 10. 05 수익원 ② 손익 ============ */
s = pres.addSlide();
head(s,"05","수익원  |  3개년 손익 — 24개월에 손익분기","※ 내부 검증 전 추정치 — 롯데 내부 데이터로 재검증 필요",{step:1});
s.addChart(pres.ChartType.bar,[
 {name:"매출",labels:["Y1 파일럿","Y2 전점 확산","Y3 계열·외부 확장"],values:[13.2,54.2,128.6]},
 {name:"영업이익",labels:["Y1 파일럿","Y2 전점 확산","Y3 계열·외부 확장"],values:[-8.2,8.8,44.9]}],
 {x:0.6,y:1.75,w:8.0,h:4.05,barDir:"col",chartColors:[INK2,RED],
  showTitle:true,title:"3개년 손익 추정 (단위: 억원)",titleFontFace:F,titleFontSize:13,titleColor:SLATE,
  showValue:true,dataLabelPosition:"outEnd",dataLabelFontFace:F,dataLabelFontSize:12,dataLabelColor:INK,dataLabelFormatCode:"0.0",
  showLegend:true,legendPos:"b",legendFontFace:F,legendFontSize:12,legendColor:SLATE,
  catAxisLabelFontFace:F,catAxisLabelFontSize:12,catAxisLabelColor:INK,
  valAxisLabelFontFace:F,valAxisLabelFontSize:11,valAxisLabelColor:SLATE,
  valGridLine:{color:LINE,size:1},catGridLine:{style:"none"},barGapWidthPct:70});
const stats=[["누적 손익분기","24개월"],["매출총이익률","77%"],["3년 설비투자","11억원"],["파일럿 시작 비용","1.5억원"]];
stats.forEach((t,i)=>{
  const y=1.85+i*1.0;
  s.addShape(pres.ShapeType.roundRect,{x:8.85,y:y,w:3.88,h:0.88,fill:{color:TINT},rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(t[0],{x:9.15,y:y,w:2.0,h:0.88,fontFace:F,fontSize:12,color:SLATE,valign:"middle",margin:0,isTextBox:true});
  s.addText(t[1],{x:11.0,y:y,w:1.5,h:0.88,align:"right",fontFace:F,fontSize:19,bold:true,color:RED,valign:"middle",margin:0,isTextBox:true});
});
s.addShape(pres.ShapeType.roundRect,{x:8.85,y:5.85,w:3.88,h:0.95,fill:{color:INK},rectRadius:0.05});
s.addText("침투율 저조 + 구독 저조 + 광고 미실행이\n동시에 일어나도 Y3는 흑자 (+5.1억)",
  {x:9.1,y:5.85,w:3.4,h:0.95,fontFace:F,fontSize:11,color:AMBER,bold:true,valign:"middle",lineSpacing:17,margin:0,isTextBox:true});
s.addText("파일럿 1.5억으로 시작해 24개월에 손익분기를 넘습니다.",{x:0.6,y:5.95,w:8.0,h:0.42,align:"center",fontFace:F,fontSize:14,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("숫자로 보면 이렇습니다. 먼저, 이 수치는 내부 검증 전 추정치입니다. 1년차 10개 점포 파일럿, 매출 13억, 영업손실 8억. 2년차 전점 확산, 매출 54억, 영업이익 9억 - 여기서 흑자 전환하고 누적 손익분기도 24개월에 넘습니다. 3년차 매출 129억, 영업이익 45억, 영업이익률 35%. 민감도도 돌렸습니다. 침투율이 떨어지고 구독이 반으로 줄고 광고를 못 해도 3년차는 흑자입니다. 수익원이 다섯 개로 분산돼 있기 때문입니다. 설비투자는 3년 11억, 파일럿은 1억 5천이면 시작합니다. (50초)");

/* ============ 11. 06 핵심 자원 ============ */
s = pres.addSlide();
head(s,"06","핵심 자원  |  반드시 필요한 자산은?","새로 사는 자산이 거의 없습니다 — 이미 가진 그룹 자산 위에 AI를 얹는 AI 트랜스포메이션 과제입니다",{step:2});
const res=[
 ["물리적",["기존 CCTV · 전원 · 네트워크 · 보안망 재활용","팝업존 보완 카메라 (대당 약 25만원)","엣지박스 점포당 1식 (약 300만원)"],false],
 ["지적 · 데이터  ★",["L.POINT 소비 이력 · POS 결제 · 전점 트래픽","카테고리 벤치마크 DB — 시간으로만 쌓임","엣지 추론 모델 · 리포트 자동화 템플릿"],true],
 ["인적",["리테일 컨설턴트 14 · DS/ML 8 · 애널리스트 8","개발 6 · 영업/CS 4 · PO 2  (Y3 42명)","컨설턴트 비중이 높은 이유: 처방·검증이 상품의 본체"],false],
 ["금융",["3년 CAPEX 11억 · 최대 현금소진 10억","10개 점포 파일럿 1.5억","CCTV가 이미 있어 가볍게 시작하는 사업"],false]];
res.forEach((r,i)=>{
  const col=i%2,row=Math.floor(i/2), x=0.6+col*6.18, y=1.74+row*2.45, hi=r[2];
  s.addShape(pres.ShapeType.roundRect,{x:x,y:y,w:5.95,h:2.3,fill:{color:hi?INK:TINT},rectRadius:0.06,line:{color:hi?INK:LINE,width:1},shadow:sh()});
  s.addText(r[0],{x:x+0.35,y:y+0.22,w:5.2,h:0.4,fontFace:F,fontSize:16,bold:true,color:hi?AMBER:INK,margin:0,isTextBox:true});
  s.addText(bullets(r[1]),{x:x+0.35,y:y+0.72,w:5.25,h:1.5,fontFace:F,fontSize:12.5,color:hi?W:INK,paraSpaceAfter:8,valign:"top",margin:0,isTextBox:true});
});
s.addText("카메라는 누구나 깔 수 있습니다.  L.POINT와 POS와 전점 트래픽을 한 번에 가진 곳은 롯데뿐입니다.",
  {x:0.6,y:6.68,w:12.13,h:0.4,align:"center",fontFace:F,fontSize:14,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("이제 효율적 운영 영역입니다. 여섯 번째, 핵심 자원. 먼저 강조하고 싶은 건, 새로 사는 자산이 거의 없다는 점입니다. 이미 가진 그룹 자산 위에 AI를 얹는 AI 트랜스포메이션 과제입니다. 물리적 자원은 이미 있습니다. CCTV, 전원, 네트워크, 보안망. 팝업존에 보완 카메라와 점포당 엣지박스 하나만 더하면 됩니다. 지적 자원, 이게 해자입니다. L.POINT 소비 이력, POS, 전점 트래픽, 그리고 시간으로만 쌓이는 벤치마크 DB. 카메라는 누구나 깔 수 있지만 이 세 데이터를 한 번에 가진 곳은 롯데뿐입니다. 인적 자원은 42명 중 컨설턴트가 14명 - 처방과 검증이 상품이기 때문입니다. 금융은 3년 11억, 파일럿 1.5억으로 가볍습니다. (35초)");

/* ============ 12. 07 핵심 활동 ============ */
s = pres.addSlide();
head(s,"07","핵심 활동  |  반드시 수행해야 하는 활동은?","생산은 기계가, 문제해결은 사람이, 플랫폼은 시간이 합니다",{step:2});
const acts=[
 ["생산","시스템이 한다",["엣지 추론 — 영상을 클라우드로 올리지 않고 카메라 단에서 숫자로 변환","리포트 90% 자동 생성"],false],
 ["문제해결","사람이 한다 — 상품의 본체",["고객 인사이트 분석 (신규 비율·미구매자·교차구매)","개선 처방 → 2~4주 적용 → POS 전후 검증"],true],
 ["플랫폼","시간이 한다",["카테고리 벤치마크 DB 축적","L.POINT 리타게팅 운영 · 3사 데이터 결합 거버넌스"],false]];
acts.forEach((a,i)=>{
  const x=0.6+i*4.07, hi=a[3];
  s.addShape(pres.ShapeType.roundRect,{x:x,y:1.72,w:3.86,h:3.05,fill:{color:hi?INK:TINT},rectRadius:0.07,line:{color:hi?INK:LINE,width:1},shadow:sh()});
  s.addText(a[0],{x:x+0.32,y:1.95,w:3.22,h:0.42,fontFace:F,fontSize:18,bold:true,color:hi?AMBER:RED,margin:0,isTextBox:true});
  s.addText(a[1],{x:x+0.32,y:2.38,w:3.22,h:0.32,fontFace:F,fontSize:11,bold:true,color:hi?MUTEDW:SLATE,margin:0,isTextBox:true});
  s.addText(bullets(a[2]),{x:x+0.32,y:2.85,w:3.22,h:1.8,fontFace:F,fontSize:12,color:hi?W:INK,paraSpaceAfter:8,valign:"top",margin:0,isTextBox:true});
});
s.addText("운영 원칙 · 핵심가치 Respect(존중) — 사람을 추적하지 않습니다. 공간을 측정합니다.",{x:0.6,y:5.0,w:12.13,h:0.34,fontFace:F,fontSize:13,bold:true,color:SLATE,charSpacing:1,margin:0,isTextBox:true});
const lay=[["Layer 1 · 공간","완전 익명 — 영상은 카메라 안에서 좌표·숫자로 변환, 원본 미저장"],["Layer 2 · 고객","동의 기반 — L.POINT 앱 체크인·QR·결제 적립 시에만 연결"],["연결","개인 단위가 아니라 시간대 × 구역 × 세그먼트 집계 단위로만"]];
lay.forEach((l,i)=>{
  const x=0.6+i*4.07;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:5.42,w:3.86,h:1.3,fill:{color:COOL},rectRadius:0.05,line:{color:COOL,width:1}});
  s.addText(l[0],{x:x+0.28,y:5.52,w:3.3,h:0.32,fontFace:F,fontSize:12,bold:true,color:INK,margin:0,isTextBox:true});
  s.addText(l[1],{x:x+0.28,y:5.86,w:3.3,h:0.8,fontFace:F,fontSize:11,color:INK,lineSpacing:16,valign:"top",margin:0,isTextBox:true});
});
s.addNotes("일곱 번째, 핵심 활동. 세 가지로 나뉩니다. 생산은 시스템이 합니다. 영상을 클라우드로 올리지 않고 카메라 단에서 숫자로 바꾸고, 리포트의 90%는 자동 생성됩니다. 문제해결은 사람이 합니다. 이게 상품의 본체입니다 - 인사이트 분석, 처방, 그리고 POS 검증. 플랫폼은 시간이 합니다. 벤치마크 DB는 쌓일수록 강해집니다. 그리고 운영 원칙 하나. 저희는 사람을 추적하지 않습니다. 영상은 카메라 안에서 익명 숫자로 바뀌고, 개인 연결은 고객이 앱에서 동의한 경우에만, 그 사이는 세그먼트 집계 단위로만 연결합니다. 이건 규제 대응이 아니라 핵심가치 존중을 설계에 넣은 것입니다. 법적으로 안전하고, 무엇보다 고객 신뢰를 잃지 않는 구조입니다. (45초)");

/* ============ 13. 08 핵심 파트너 ============ */
s = pres.addSlide();
head(s,"08","핵심 파트너  |  외부 파트너나 공급업체는 누구인가?","세 조각이 다 모여야 성립하는 사업입니다 — 그래서 지금까지 아무도 못 했습니다",{step:2});
s.addText("내부 3사 합작 · 그룹 시너지",{x:0.6,y:1.68,w:5,h:0.34,fontFace:F,fontSize:13,bold:true,color:SLATE,charSpacing:1,margin:0,isTextBox:true});
const org=[["롯데백화점","공간 · 트래픽 · POS · MD 지식","첫 고객이자 판매 채널"],["롯데이노베이트","비전 AI 엔진 · 엣지 인프라","생산 담당"],["롯데멤버스","L.POINT 소비 이력 · 도달 채널","인사이트와 실행 담당"]];
org.forEach((o,i)=>{
  const x=0.6+i*4.07;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:2.08,w:3.86,h:1.9,fill:{color:INK},rectRadius:0.07,shadow:sh()});
  s.addText(o[0],{x:x+0.32,y:2.3,w:3.22,h:0.42,fontFace:F,fontSize:17,bold:true,color:W,margin:0,isTextBox:true});
  s.addText(o[1],{x:x+0.32,y:2.78,w:3.22,h:0.5,fontFace:F,fontSize:13,bold:true,color:AMBER,margin:0,isTextBox:true});
  s.addText(o[2],{x:x+0.32,y:3.3,w:3.22,h:0.4,fontFace:F,fontSize:11,color:MUTEDW,margin:0,isTextBox:true});
  if(i<2) s.addText("+",{x:x+3.86,y:2.7,w:0.21,h:0.6,align:"center",fontFace:F,fontSize:20,bold:true,color:RED,valign:"middle",margin:0,isTextBox:true});
});
s.addText("외부 파트너",{x:0.6,y:4.25,w:4,h:0.34,fontFace:F,fontSize:13,bold:true,color:SLATE,charSpacing:1,margin:0,isTextBox:true});
const ext=[["비전 AI 엔진 벤더","라이선스 또는 M&A — Build/Buy 병행 검토. 엔진은 사고, 데이터 결합과 검증 루프는 직접 만든다"],["외부 VMD 디자이너","컨설팅 건당 변동비(400만원)로 유연하게 조달"],["법무 · DPO · 개인정보 영향평가","착수 전 마일스톤 1번. 2계층 설계의 법적 검토"]];
ext.forEach((e,i)=>{
  const x=0.6+i*4.07;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:4.65,w:3.86,h:1.5,fill:{color:TINT},rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(e[0],{x:x+0.3,y:4.78,w:3.3,h:0.34,fontFace:F,fontSize:13,bold:true,color:RED,margin:0,isTextBox:true});
  s.addText(e[1],{x:x+0.3,y:5.15,w:3.3,h:0.9,fontFace:F,fontSize:11,color:INK,lineSpacing:16,valign:"top",margin:0,isTextBox:true});
});
s.addText("조직: 3사 합작 TF → 성과 검증 후 분사(Spin-off) 옵션   ·   한 사만으로는 만들 수 없는, 그룹이어야 가능한 사업입니다",{x:0.6,y:6.4,w:12.13,h:0.4,align:"center",fontFace:F,fontSize:14,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("여덟 번째, 핵심 파트너. 이 사업은 롯데 안의 세 회사가 각자 조각을 가지고 있습니다. 백화점은 공간과 트래픽과 POS, 이노베이트는 비전 AI 엔진, 멤버스는 L.POINT 소비 이력. 세 조각이 다 모여야 성립하고, 그래서 지금까지 아무도 못 했습니다. 한 사만으로는 만들 수 없는, 그룹이어야 가능한 사업입니다. 외부로는 비전 AI 엔진을 라이선스하거나 인수하는 옵션을 열어두고 있습니다 - 엔진은 사고, 데이터 결합과 검증 루프는 직접 만든다는 원칙입니다. 그리고 착수 전 법무와 개인정보 영향평가가 마일스톤 1번입니다. (30초)");

/* ============ 14. 09 비용 구조 ============ */
s = pres.addSlide();
head(s,"09","비용 구조  |  가장 큰 비용 항목은?","가장 큰 항목은 인건비 — 의도된 구조입니다. 클라우드 비용은 엣지로 1/10",{step:2});
s.addChart(pres.ChartType.line,[
 {name:"클라우드 방식 (경쟁사)",labels:["10개점","50개점","100개점","300개점"],values:[0.8,4.0,8.0,24.0]},
 {name:"엣지 방식 (L.GA)",labels:["10개점","50개점","100개점","300개점"],values:[0.3,0.7,1.2,3.0]}],
 {x:0.6,y:1.7,w:6.4,h:4.1,chartColors:[SLATE,RED],lineSize:3,lineDataSymbolSize:8,
  showTitle:true,title:"매장 확산에 따른 연간 인프라 비용 (억원, 추정)",titleFontFace:F,titleFontSize:12,titleColor:SLATE,
  showLegend:true,legendPos:"b",legendFontFace:F,legendFontSize:11,legendColor:SLATE,
  catAxisLabelFontFace:F,catAxisLabelFontSize:11,catAxisLabelColor:INK,
  valAxisLabelFontFace:F,valAxisLabelFontSize:10,valAxisLabelColor:SLATE,
  valGridLine:{color:LINE,size:1},catGridLine:{style:"none"}});
card(s,7.3,1.7,5.43,1.95,TINT);
s.addText("고정비  (Y1 → Y3, 억원)",{x:7.65,y:1.88,w:4.8,h:0.32,fontFace:F,fontSize:12,bold:true,color:SLATE,margin:0,isTextBox:true});
s.addText(bullets(["인건비 15.0 → 42.0  (컨설턴트 14명 포함) ★ 최대 항목","인프라·솔루션 1.5 → 4.0 / 마케팅·감가·법무 1.8 → 7.7","판관비 합계 18.3 → 53.7"]),
  {x:7.65,y:2.25,w:4.85,h:1.35,fontFace:F,fontSize:11.5,color:INK,paraSpaceAfter:5,valign:"top",margin:0,isTextBox:true});
card(s,7.3,3.8,5.43,2.0,TINT);
s.addText("변동비  (단위 원가)",{x:7.65,y:3.98,w:4.8,h:0.32,fontFace:F,fontSize:12,bold:true,color:SLATE,margin:0,isTextBox:true});
s.addText(bullets(["팝업 건당 75만 (설치 35 · 인사이트 분석 25 · 추론 3 …)","구독 매장당 월 7만 / 컨설팅 건당 400만 / RMN 매체 40%","→ 매출총이익률 77%  (Y1~Y3 동일)"]),
  {x:7.65,y:4.35,w:4.85,h:1.4,fontFace:F,fontSize:11.5,color:INK,paraSpaceAfter:5,valign:"top",margin:0,isTextBox:true});
band(s,6.05,0.85,"경쟁사가 못 넘은 벽은 원가 구조였습니다.  매장이 10배 늘어도 비용은 10배 늘지 않습니다.",15);
s.addNotes("아홉 번째, 비용 구조. 가장 큰 항목은 인건비입니다. 그리고 이건 의도된 구조입니다 - 처방과 검증이 상품이니 컨설턴트에 씁니다. 반대로 경쟁사의 가장 큰 비용은 클라우드입니다. 영상을 전부 올리니 매장이 늘수록 비용이 그대로 따라 올라갑니다. 저희는 카메라 단에서 분석을 끝내고 숫자만 보냅니다. 클라우드 비용이 10분의 1이 되고, 매장이 10배 늘어도 비용은 10배 늘지 않습니다. 변동비는 팝업 건당 75만원 수준이라 매출총이익률 77%가 나옵니다. (40초)");

/* ============ 15. CLOSING (roadmap + line) ============ */
s = pres.addSlide();
s.background = { color: INK };
s.addText("실행 로드맵",{x:0.9,y:0.7,w:6,h:0.34,fontFace:F,fontSize:12,bold:true,color:AMBER,charSpacing:2,margin:0,isTextBox:true});
const ph=[["Phase 0","0~3개월","롯데 내부 도입 · 10개점 파일럿"],["Phase 1","4~12개월","팝업 유료 판매 · 검증 케이스 3건"],["Phase 2","13~24개월","전점 확산 · 구독 · 리타게팅"],["Phase 3","25~36개월","계열사 · 해외 롯데몰 · 외부"]];
ph.forEach((p,i)=>{
  const x=0.9+i*3.0;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:1.15,w:2.8,h:1.35,fill:{color:INK2},rectRadius:0.06});
  s.addText(p[0],{x:x+0.25,y:1.28,w:2.3,h:0.34,fontFace:F,fontSize:14,bold:true,color:i===0?AMBER:W,margin:0,isTextBox:true});
  s.addText(p[1],{x:x+0.25,y:1.62,w:2.3,h:0.28,fontFace:F,fontSize:10,color:MUTEDW,margin:0,isTextBox:true});
  s.addText(p[2],{x:x+0.25,y:1.95,w:2.35,h:0.45,fontFace:F,fontSize:11,color:W,valign:"top",margin:0,isTextBox:true});
});
s.addText("브랜드는 자기가 판 것만 압니다.",{x:0.9,y:3.2,w:11.5,h:0.8,fontFace:F,fontSize:36,bold:true,color:MUTEDW,margin:0,isTextBox:true});
s.addText("저희는 놓친 사람이 누구였는지 알려줍니다.",{x:0.9,y:4.0,w:11.5,h:0.9,fontFace:F,fontSize:36,bold:true,color:W,margin:0,isTextBox:true});
s.addText("매일 삭제되던 97명의 데이터를 — 브랜드에게는 성장의 답으로 · 고객에게는 더 나은 매장 경험으로 · 롯데에게는 새로운 수익으로",
  {x:0.9,y:5.05,w:11.5,h:0.42,fontFace:F,fontSize:15,color:MUTEDW,margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:0.9,y:5.8,w:8.4,h:0.95,fill:{color:INK2},rectRadius:0.06});
s.addText("온라인에 GA가 있다면,  오프라인에는 L.GA가 있습니다.",{x:1.3,y:5.8,w:7.7,h:0.95,fontFace:F,fontSize:19,bold:true,color:AMBER,valign:"middle",margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:9.55,y:5.8,w:2.85,h:0.95,fill:{color:INK2},rectRadius:0.06});
s.addText("Lifetime\nValue Creator",{x:9.55,y:5.8,w:2.85,h:0.95,align:"center",fontFace:F,fontSize:12.5,bold:true,color:MUTEDW,lineSpacing:17,valign:"middle",margin:0,isTextBox:true});
s.addNotes("실행은 안에서 시작합니다. 롯데가 먼저 쓰고, 유료 판매, 전점 확산, 그리고 계열사와 해외로. 매일 삭제되던 97명의 데이터를 브랜드에게는 성장의 답으로, 고객에게는 더 나은 매장 경험으로, 롯데에게는 새로운 수익으로 바꾸는 일입니다. 결제한 순간에만 쌓이던 고객 가치를 사지 않은 순간까지 넓히는 것 - 저희가 이해한 Lifetime Value Creator입니다. 온라인에 GA가 있다면, 오프라인에는 L.GA가 있습니다. 감사합니다. (30초)");

/* ============ 16. BACKUP: RISK ============ */
s = pres.addSlide();
head(s,"Q&A","리스크와 대응","백업 슬라이드 — Q&A 대응용");
const risk=[["개인정보 규제","엣지 추론 · 원본 미저장 · 동의 기반 2계층 설계. 착수 전 법무·DPO 검토 및 영향평가"],
 ["기존 CCTV 사양 부적합","팝업존 한정 저가 보완 카메라(대당 약 25만원) 설치를 CAPEX에 반영"],
 ["브랜드 지불 의사 부족","1년차 파일럿 무상 제공 → 가치 검증 후 과금. 지불 의사를 가정하지 않음"],
 ["인식 정확도 논란","개인 정확도가 아닌 집계 정확도로 KPI 정의. 핵심 인사이트는 L.POINT·POS 실데이터 기반"],
 ["계열사 데이터 거버넌스","3사 데이터 제공 협약·수익 배분 사전 합의 (마일스톤 1번)"],
 ["경쟁사 선점","벤치마크 DB는 시간으로만 축적. 인수(M&A)도 옵션으로 병행 검토"]];
risk.forEach((r,i)=>{
  const y=1.74+i*0.82;
  s.addShape(pres.ShapeType.roundRect,{x:0.6,y:y,w:12.13,h:0.72,fill:{color:i%2?TINT:W},rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(r[0],{x:0.92,y:y,w:3.05,h:0.72,fontFace:F,fontSize:14,bold:true,color:RED,valign:"middle",margin:0,isTextBox:true});
  s.addText(r[1],{x:4.15,y:y,w:8.3,h:0.72,fontFace:F,fontSize:12,color:INK,valign:"middle",margin:0,isTextBox:true});
});
s.addNotes("백업 슬라이드입니다. Q&A에서 개인정보, CCTV 사양, 지불 의사, 인식 정확도, 데이터 거버넌스 질문이 나오면 꺼내십시오.");

pres.writeFile({ fileName: "LGA_롯데신사업_발표.pptx" }).then(f=>console.log("WROTE",f));
