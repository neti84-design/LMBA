const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
pres.author = "LMBA Team";
pres.title = "L.GA - Lotte Growth Analytics";

const INK="101420", INK2="1B2130", RED="E11D2E", AMBER="F2A33C",
      SLATE="5D6675", LINE="E3E6EB", TINT="F6F7F9", W="FFFFFF",
      TEAL="1F8A7D", MUTEDW="A7AFBE";
const F = "맑은 고딕";
const sh = () => ({ type:"outer", color:"9AA3B0", blur:14, offset:3, angle:90, opacity:0.20 });

function head(s, n, title, sub, dark){
  s.addShape(pres.ShapeType.roundRect,{x:0.6,y:0.5,w:0.46,h:0.46,fill:{color:RED},rectRadius:0.08});
  s.addText(String(n),{x:0.6,y:0.5,w:0.46,h:0.46,align:"center",valign:"middle",
    fontFace:F,fontSize:15,bold:true,color:W,margin:0,isTextBox:true});
  s.addText(title,{x:1.22,y:0.44,w:11.4,h:0.6,fontFace:F,fontSize:29,bold:true,
    color:dark?W:INK,valign:"middle",margin:0,isTextBox:true});
  if(sub) s.addText(sub,{x:1.22,y:1.06,w:11.4,h:0.36,fontFace:F,fontSize:13,
    color:dark?MUTEDW:SLATE,valign:"middle",margin:0,isTextBox:true});
}
function card(s,x,y,w,h,fill){
  s.addShape(pres.ShapeType.roundRect,{x,y,w,h,fill:{color:fill||TINT},rectRadius:0.06,
    line:{color:fill&&fill!==TINT?fill:LINE,width:1},shadow:sh()});
}

/* ---------------- 1. TITLE ---------------- */
let s = pres.addSlide();
s.background = { color: INK };
s.addText("롯데그룹 신사업 제안",{x:0.9,y:1.35,w:6.4,h:0.34,fontFace:F,fontSize:14,
  bold:true,color:AMBER,charSpacing:2,margin:0,isTextBox:true});
s.addText("L.GA",{x:0.85,y:1.75,w:6.4,h:1.25,fontFace:F,fontSize:68,bold:true,color:W,margin:0,isTextBox:true});
s.addText("Lotte Growth Analytics",{x:0.9,y:3.02,w:6.4,h:0.4,fontFace:F,fontSize:19,
  color:MUTEDW,margin:0,isTextBox:true});
s.addText("브랜드가 모르는 자기 고객을 알려주는\n오프라인 리테일 데이터 솔루션",
  {x:0.9,y:3.75,w:6.2,h:1.3,fontFace:F,fontSize:21,bold:true,color:W,lineSpacing:34,margin:0,isTextBox:true});
s.addText("롯데그룹 핵심인재 MBA 과정  |  최종 발표",{x:0.9,y:6.55,w:6.4,h:0.34,
  fontFace:F,fontSize:12,color:SLATE,margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:7.85,y:1.55,w:4.85,h:4.4,fill:{color:INK2},rectRadius:0.08});
s.addText("매장에 들어오는 100명 중",{x:8.3,y:2.0,w:4.0,h:0.36,fontFace:F,fontSize:15,
  color:MUTEDW,margin:0,isTextBox:true});
s.addText([{text:"3",options:{fontSize:78,bold:true,color:RED}},
           {text:"명만 구매합니다.",options:{fontSize:21,bold:true,color:W}}],
  {x:8.3,y:2.45,w:4.1,h:1.3,fontFace:F,valign:"bottom",margin:0,isTextBox:true});
s.addText("나머지 97명이 무엇을 보고 왜 돌아섰는지는\n매일 CCTV에 찍히고, 매일 그냥 삭제됩니다.",
  {x:8.3,y:4.25,w:4.1,h:1.1,fontFace:F,fontSize:14,color:AMBER,lineSpacing:24,valign:"top",margin:0,isTextBox:true});
s.addNotes("백화점 매장에 100명이 들어옵니다. 그중 구매하는 사람은 평균 3명 남짓입니다. 브랜드가 데이터로 알고 있는 고객은 이 3명뿐입니다. 나머지 97명 - 무엇을 보고, 어디서 멈추고, 왜 돌아섰는지. 그 데이터는 매일 CCTV에 찍히고, 매일 그냥 삭제됩니다. 오늘 저희는, 브랜드에게 그 97명이 누구였는지 알려주는 사업을 제안드립니다. (40초)");

/* ---------------- 2. PROBLEM ---------------- */
s = pres.addSlide();
head(s,"02","측정이 없으니 개선도 없습니다","팝업 브랜드가 종료 후 손에 쥐는 데이터의 현실");
card(s,0.6,1.7,6.0,3.6,TINT);
s.addText("온라인 쇼핑몰",{x:1.0,y:2.0,w:5.2,h:0.36,fontFace:F,fontSize:17,bold:true,color:INK,margin:0,isTextBox:true});
s.addText([
 {text:"어느 상품에서 이탈했는지 초 단위로 안다",options:{bullet:true,breakLine:true}},
 {text:"장바구니에 담고 안 산 상품을 안다",options:{bullet:true,breakLine:true}},
 {text:"신규 방문자와 재방문자를 구분한다",options:{bullet:true,breakLine:true}},
 {text:"이탈 고객에게 리타게팅 광고를 보낸다",options:{bullet:true}}
],{x:1.0,y:2.5,w:5.2,h:2.5,fontFace:F,fontSize:14,color:INK,paraSpaceAfter:10,valign:"top",margin:0,isTextBox:true});
card(s,6.95,1.7,5.78,3.6,TINT);
s.addText("오프라인 팝업스토어",{x:7.35,y:2.0,w:5.0,h:0.36,fontFace:F,fontSize:17,bold:true,color:RED,margin:0,isTextBox:true});
s.addText("매출 총액",{x:7.35,y:2.55,w:5.0,h:0.5,fontFace:F,fontSize:26,bold:true,color:INK,margin:0,isTextBox:true});
s.addText("인스타그램 해시태그 개수",{x:7.35,y:3.1,w:5.0,h:0.5,fontFace:F,fontSize:26,bold:true,color:INK,margin:0,isTextBox:true});
s.addText("끝.",{x:7.35,y:3.7,w:5.0,h:0.5,fontFace:F,fontSize:26,bold:true,color:SLATE,margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:0.6,y:5.55,w:12.13,h:1.05,fill:{color:INK},rectRadius:0.06});
s.addText("그래서 브랜드는 다음 팝업도 감으로 엽니다. 오프라인은 20년 전과 똑같습니다.",
  {x:1.0,y:5.55,w:11.4,h:1.05,fontFace:F,fontSize:18,bold:true,color:W,valign:"middle",margin:0,isTextBox:true});
s.addNotes("지금 팝업스토어 시장은 연간 수만 건 규모로 커졌습니다. 그런데 브랜드가 팝업이 끝나고 손에 쥐는 건 매출 총액과 인스타그램 해시태그 개수가 전부입니다. 온라인 쇼핑몰은 어느 화면에서 이탈했는지까지 초 단위로 압니다. 오프라인은 20년 전과 똑같습니다. 그래서 브랜드는 다음 팝업도 감으로 엽니다. 측정이 없으니 개선도 없습니다. (45초)");

/* ---------------- 3. SOLUTION ---------------- */
s = pres.addSlide();
head(s,"03","온라인의 GA를 오프라인 매장에 구현합니다","이미 달려 있는 CCTV가 센서가 되고, L.POINT가 답을 만듭니다");
s.addText([
 {text:"저희가 브랜드에 드리는 것은\n",options:{fontSize:20,color:SLATE,breakLine:true}},
 {text:"대시보드가 아니라 ",options:{fontSize:28,bold:true,color:INK}},
 {text:"답",options:{fontSize:28,bold:true,color:RED}},
 {text:"입니다.",options:{fontSize:28,bold:true,color:INK}}
],{x:0.62,y:1.75,w:6.0,h:1.5,fontFace:F,lineSpacing:40,margin:0,isTextBox:true});
const step=[["측정","무슨 일이 있었나"],["진단","왜 그랬나"],["인사이트","그 사람은 누구인가"],["처방","무엇을 바꿔야 하나"],["검증","바꿨더니 통했나"]];
step.forEach((it,i)=>{
  const y=3.52+i*0.66;
  const hot = i>=2 && i<=4;
  s.addShape(pres.ShapeType.roundRect,{x:0.62,y:y,w:0.62,h:0.56,fill:{color:hot?RED:LINE},rectRadius:0.08});
  s.addText("L"+(i+1),{x:0.62,y:y,w:0.62,h:0.56,align:"center",valign:"middle",fontFace:F,
    fontSize:13,bold:true,color:hot?W:SLATE,margin:0,isTextBox:true});
  s.addText(it[0],{x:1.4,y:y,w:1.6,h:0.56,fontFace:F,fontSize:15,bold:true,color:INK,valign:"middle",margin:0,isTextBox:true});
  s.addText(it[1],{x:3.0,y:y,w:3.7,h:0.56,fontFace:F,fontSize:13,color:SLATE,valign:"middle",margin:0,isTextBox:true});
});
card(s,7.1,1.72,5.63,4.95,TINT);
s.addText("팝업 종료 리포트  ·  미리보기",{x:7.5,y:2.0,w:4.9,h:0.32,fontFace:F,fontSize:12,
  bold:true,color:SLATE,charSpacing:1,margin:0,isTextBox:true});
const kpi=[["유입률","6.8%","벤치마크 5.2%"],["평균 체류","4분 12초","벤치마크 3분 05초"],
           ["집품률","22.1%","벤치마크 18.4%"],["구매 전환율","11.4%","벤치마크 8.1%"]];
kpi.forEach((k,i)=>{
  const y=2.48+i*1.02;
  s.addShape(pres.ShapeType.roundRect,{x:7.5,y:y,w:4.9,h:0.88,fill:{color:W},rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(k[0],{x:7.75,y:y+0.1,w:2.3,h:0.32,fontFace:F,fontSize:13,color:SLATE,margin:0,isTextBox:true});
  s.addText(k[2],{x:7.75,y:y+0.44,w:2.6,h:0.3,fontFace:F,fontSize:11,color:SLATE,margin:0,isTextBox:true});
  s.addText(k[1],{x:10.2,y:y+0.14,w:1.95,h:0.6,align:"right",fontFace:F,fontSize:24,bold:true,color:RED,margin:0,isTextBox:true});
});
s.addNotes("저희 제안은 L.GA, Lotte Growth Analytics입니다. 한 문장으로, 온라인의 구글 애널리틱스를 오프라인 매장에 구현하는 것입니다. 이미 달려 있는 CCTV가 센서가 됩니다. 누가 앞을 지나갔고, 몇 명이 들어왔고, 어디서 멈췄고, 무엇을 집었다 놓았는지. 그리고 여기에 롯데만 가진 L.POINT 소비 데이터를 붙입니다. 저희가 브랜드에 드리는 건 대시보드가 아니라 답입니다. (40초)");

/* ---------------- 4. GA MAPPING ---------------- */
s = pres.addSlide();
head(s,"04","온라인의 모든 지표는 오프라인에 1:1로 대응됩니다","가장 중요한 지표는 유입률(Capture Rate) — 지금 어떤 브랜드도 이 숫자를 모릅니다");
const rows=[["Impression","통행 수 (Passerby)","매장 전면을 지나간 사람"],
 ["Click / CTR","유입률 (Capture Rate)","통행 대비 진입 비율"],
 ["Session Duration","체류시간 (Dwell Time)","매장 내 평균 체류"],
 ["Scroll Depth","동선 깊이 (Depth)","안쪽까지 도달한 비율"],
 ["Add to Cart","집품률 (Pick-up Rate)","상품을 집어 든 비율"],
 ["Purchase / CVR","구매 전환율","POS 결제 연동"],
 ["Bounce Rate","3초 이탈률","들어와 3초 내 이탈"],
 ["Cohort","L.POINT 세그먼트","회원 소비성향 기반"]];
rows.forEach((r,i)=>{
  const col=i%2, row=Math.floor(i/2);
  const x=0.6+col*6.18, y=1.76+row*1.2;
  const hi=r[1].indexOf("유입률")===0;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:y,w:5.95,h:1.06,fill:{color:hi?INK:TINT},
    rectRadius:0.05,line:{color:hi?INK:LINE,width:1}});
  s.addText(r[0],{x:x+0.3,y:y+0.12,w:2.35,h:0.42,fontFace:F,fontSize:13,
    color:hi?MUTEDW:SLATE,valign:"middle",margin:0,isTextBox:true});
  s.addText("→",{x:x+2.62,y:y+0.12,w:0.4,h:0.42,align:"center",fontFace:F,fontSize:14,
    color:hi?AMBER:SLATE,valign:"middle",margin:0,isTextBox:true});
  s.addText(r[1],{x:x+3.05,y:y+0.12,w:2.65,h:0.42,fontFace:F,fontSize:15,bold:true,
    color:hi?AMBER:INK,valign:"middle",margin:0,isTextBox:true});
  s.addText(r[2],{x:x+0.3,y:y+0.58,w:5.35,h:0.36,fontFace:F,fontSize:11,
    color:hi?MUTEDW:SLATE,valign:"middle",margin:0,isTextBox:true});
});
s.addText("유입률이 쌓이면 카테고리 벤치마크가 됩니다 — 데이터가 쌓인 사업자만 가질 수 있습니다.",
  {x:0.6,y:6.42,w:12.13,h:0.42,align:"center",fontFace:F,fontSize:14,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("온라인의 모든 지표는 오프라인에 1:1로 대응됩니다. 노출은 매장 앞 통행 수, 클릭률은 유입률, 장바구니 담기는 상품을 집어 든 비율, 이탈률은 3초 안에 나간 비율입니다. 가장 중요한 지표는 유입률(Capture Rate)입니다. 지나간 사람 100명 중 몇 명이 들어왔는가. 지금 어떤 브랜드도 이 숫자를 모릅니다. 그리고 이게 쌓이면 카테고리 벤치마크가 됩니다. 이건 데이터가 쌓인 사업자만 가질 수 있습니다. (50초)");

/* ---------------- 5. COMPETITION ---------------- */
s = pres.addSlide();
head(s,"05","기술 격차가 아니라 자산 격차입니다","어디까지 보이는가 — 돈으로 따라잡을 수 없는 차이");
const cols=[
 ["브랜드 자체 데이터","자사 POS가 끝",["산 사람이 산 것만 안다","안 산 사람은 존재조차 모름","매장 밖은 전혀 모름"],TINT,INK,SLATE],
 ["메이아이 등 비전 AI","설치한 매장 안이 끝",["익명 숫자에서 종료","고객이 누구인지 모름","처방 효과를 증명 못 함"],TINT,INK,SLATE],
 ["L.GA (롯데)","고객의 소비 생애 전체",["누가 왔고 왜 안 샀는지","평소 어디서 무엇을 사는지","POS로 효과까지 증명"],INK,W,AMBER]];
cols.forEach((c,i)=>{
  const x=0.6+i*4.07;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:1.72,w:3.86,h:3.2,fill:{color:c[3]},rectRadius:0.07,
    line:{color:c[3]===INK?INK:LINE,width:1},shadow:sh()});
  s.addText(c[0],{x:x+0.32,y:2.0,w:3.22,h:0.4,fontFace:F,fontSize:16,bold:true,color:c[4],margin:0,isTextBox:true});
  s.addText(c[1],{x:x+0.32,y:2.45,w:3.22,h:0.66,fontFace:F,fontSize:14,bold:true,color:c[5],lineSpacing:22,margin:0,isTextBox:true});
  s.addText(c[2].map((t,j)=>({text:t,options:{bullet:true,breakLine:j<c[2].length-1}})),
    {x:x+0.32,y:3.25,w:3.22,h:2.1,fontFace:F,fontSize:13,color:c[3]===INK?MUTEDW:INK,
     paraSpaceAfter:12,valign:"top",margin:0,isTextBox:true});
});
s.addShape(pres.ShapeType.roundRect,{x:0.6,y:5.4,w:12.13,h:1.15,fill:{color:INK},rectRadius:0.06});
s.addText("브랜드는 자기가 판 것만 압니다.   롯데는 그 고객의 하루 전체를 압니다.",
  {x:0.6,y:5.4,w:12.13,h:1.15,align:"center",valign:"middle",fontFace:F,fontSize:18,bold:true,color:W,margin:0,isTextBox:true});
s.addNotes("이 영역엔 이미 메이아이 같은 선점 기업이 있습니다. 기술도 좋습니다. 그런데 중요한 건 기술이 아니라 어디까지 보이느냐입니다. 브랜드는 자기가 판 것만 압니다. 자사 POS가 데이터의 끝입니다. 메이아이는 자기가 카메라를 설치한 매장 안만 압니다. 익명 숫자에서 끝납니다. 롯데는 그 고객의 하루 전체, 지난 몇 년의 소비 생애를 압니다. 이건 기술 격차가 아니라 자산 격차입니다. 돈으로 따라잡을 수 없습니다. (45초)");

/* ---------------- 6. CLIMAX (dark) ---------------- */
s = pres.addSlide();
s.background = { color: INK };
head(s,"06","브랜드가 모르는 자기 고객","팝업이 끝나면 브랜드에게 드리는 다섯 가지 — 스스로는 절대 알 수 없는 답",true);
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
  s.addText(String(i+1),{x:0.92,y:y+0.19,w:0.44,h:0.44,align:"center",valign:"middle",
    fontFace:F,fontSize:14,bold:true,color:W,margin:0,isTextBox:true});
  s.addText(f[0],{x:1.6,y:y+0.08,w:5.5,h:0.66,fontFace:F,fontSize:15,bold:true,color:W,valign:"middle",margin:0,isTextBox:true});
  s.addText(f[1],{x:7.25,y:y+0.08,w:5.2,h:0.66,fontFace:F,fontSize:12,color:MUTEDW,valign:"middle",margin:0,isTextBox:true});
});
s.addText("L.POINT 소비 이력과 롯데 전점 트래픽이 동시에 있어야만 나오는 답입니다.",
  {x:0.62,y:6.55,w:12.1,h:0.42,align:"center",fontFace:F,fontSize:15,bold:true,color:AMBER,margin:0,isTextBox:true});
s.addNotes("저희가 파는 솔루션의 본체는 이겁니다. 팝업이 끝나면 브랜드에게 이런 걸 드립니다.\n첫째, 이번에 온 사람 중 신규 고객이 몇 퍼센트인가. 브랜드는 이걸 절대 모릅니다.\n둘째, 들어왔는데 안 산 사람들은 누구였나.\n셋째, 우리 방문객이 평소 어떤 브랜드에서 무엇을 사는가. 우리 고객의 38%가 경쟁사 A 구매 이력이 있다 - 이건 포지셔닝과 가격 전략을 바꾸는 정보입니다.\n넷째, 집었는데 안 산 상품. 온라인의 장바구니 이탈과 똑같습니다. 그대로 상품기획 피드백이 됩니다.\n다섯째, 다음 팝업은 어디에, 언제, 어느 층에 여는 게 최적인가.\n(한 박자 쉬고) 이 다섯 가지는 브랜드가 아무리 돈을 써도 스스로 알 수 없습니다. L.POINT 소비 이력과 롯데 전점 트래픽이 동시에 있어야만 나오는 답이기 때문입니다. (70초 — 다섯 가지를 손가락으로 꼽으며)");

/* ---------------- 7. PROOF ---------------- */
s = pres.addSlide();
head(s,"07","처방의 효과를 POS로 증명합니다","경쟁사는 결제 데이터가 없어 자기 처방이 통했는지 증명할 수 없습니다");
s.addChart(pres.ChartType.bar,[
 {name:"개선 전",labels:["유입률","집품률","구매 전환율"],values:[5.2,18.4,8.1]},
 {name:"개선 후",labels:["유입률","집품률","구매 전환율"],values:[6.8,22.1,11.4]}],
 {x:0.6,y:1.75,w:7.1,h:4.5,barDir:"col",chartColors:[SLATE,RED],
  showTitle:true,title:"개선안 적용 전후 (단위: %)",titleFontFace:F,titleFontSize:13,titleColor:SLATE,
  showValue:true,dataLabelPosition:"outEnd",dataLabelFontFace:F,dataLabelFontSize:12,
  dataLabelColor:INK,dataLabelFormatCode:'0.0"%"',
  showLegend:true,legendPos:"b",legendFontFace:F,legendFontSize:12,legendColor:SLATE,
  catAxisLabelFontFace:F,catAxisLabelFontSize:13,catAxisLabelColor:INK,
  valAxisLabelFontFace:F,valAxisLabelFontSize:11,valAxisLabelColor:SLATE,
  valGridLine:{color:LINE,size:1},catGridLine:{style:"none"},valAxisMinVal:0,valAxisMaxVal:26,barGapWidthPct:60});
card(s,8.0,1.75,4.73,2.35,TINT);
s.addText("개선 → 적용 → 검증",{x:8.35,y:2.0,w:4.0,h:0.34,fontFace:F,fontSize:13,bold:true,color:SLATE,margin:0,isTextBox:true});
s.addText([
 {text:"진열·동선·상품 배치 개선안 제시",options:{bullet:true,breakLine:true}},
 {text:"2~4주 적용",options:{bullet:true,breakLine:true}},
 {text:"POS 결제 데이터로 전후 실측 비교",options:{bullet:true}}
],{x:8.35,y:2.45,w:4.0,h:1.5,fontFace:F,fontSize:13,color:INK,paraSpaceAfter:10,valign:"top",margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:8.0,y:4.3,w:4.73,h:1.95,fill:{color:INK},rectRadius:0.06});
s.addText("효과를 증명 못 하는 컨설팅은\n한 번 팔리고 끝납니다.",{x:8.35,y:4.55,w:4.05,h:0.8,
  fontFace:F,fontSize:14,color:MUTEDW,lineSpacing:22,margin:0,isTextBox:true});
s.addText("증명하는 컨설팅은 갱신됩니다.",{x:8.35,y:5.45,w:4.05,h:0.6,fontFace:F,fontSize:16,
  bold:true,color:AMBER,margin:0,isTextBox:true});
s.addText("이것이 재구매 엔진이자, 성과 연동 과금(증분 매출의 5~10%)이 가능한 근거입니다.",
  {x:0.6,y:6.5,w:12.13,h:0.42,align:"center",fontFace:F,fontSize:14,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("인사이트만으로는 부족합니다. 브랜드가 진짜 원하는 건 매출입니다. 그래서 저희는 이렇게 바꾸세요까지 갑니다. 진열을 어떻게 바꿀지, 동선을 어떻게 틀지, 어떤 상품을 앞으로 뺄지. 그리고 여기가 결정적입니다. 바꾼 다음, 실제로 매출이 올랐는지를 POS 데이터로 증명합니다. 집품에서 구매로 가는 전환율이 8.1%에서 11.4%로 올랐습니다 - 이렇게요. 경쟁사는 못 합니다. 결제 데이터가 없어서 자기 처방이 통했는지 증명할 방법이 없습니다. 효과를 증명하지 못하는 컨설팅은 한 번 팔리고 끝납니다. 증명하는 컨설팅은 계약이 갱신됩니다. (55초)");

/* ---------------- 8. PRIVACY ---------------- */
s = pres.addSlide();
head(s,"08","사람을 추적하지 않습니다. 공간을 측정합니다","설계를 두 층으로 완전히 분리했습니다");
card(s,0.6,1.75,6.0,2.35,TINT);
s.addText("LAYER 1  ·  공간",{x:0.95,y:2.0,w:5.3,h:0.32,fontFace:F,fontSize:12,bold:true,color:SLATE,charSpacing:1,margin:0,isTextBox:true});
s.addText("완전 익명",{x:0.95,y:2.38,w:5.3,h:0.45,fontFace:F,fontSize:22,bold:true,color:INK,margin:0,isTextBox:true});
s.addText("영상은 카메라 안에서 즉시 좌표·세그먼트 숫자로 변환.\n원본은 밖으로 나가지 않고, 얼굴 특징값은 저장하지 않습니다.",
  {x:0.95,y:2.95,w:5.3,h:0.95,fontFace:F,fontSize:13,color:INK,lineSpacing:22,margin:0,isTextBox:true});
card(s,6.73,1.75,6.0,2.35,TINT);
s.addText("LAYER 2  ·  고객",{x:7.08,y:2.0,w:5.3,h:0.32,fontFace:F,fontSize:12,bold:true,color:SLATE,charSpacing:1,margin:0,isTextBox:true});
s.addText("동의 기반 식별",{x:7.08,y:2.38,w:5.3,h:0.45,fontFace:F,fontSize:22,bold:true,color:RED,margin:0,isTextBox:true});
s.addText("L.POINT 앱 체크인·QR·결제 적립 등\n고객이 직접 동의한 경우에만 연결됩니다.",
  {x:7.08,y:2.95,w:5.3,h:0.95,fontFace:F,fontSize:13,color:INK,lineSpacing:22,margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:0.6,y:4.35,w:12.13,h:0.85,fill:{color:TINT},rectRadius:0.05,line:{color:LINE,width:1}});
s.addText("두 층의 연결은 개인 단위가 아니라  ·  시간대 × 구역 × 세그먼트 집계 단위로만",
  {x:0.95,y:4.35,w:11.4,h:0.85,fontFace:F,fontSize:15,bold:true,color:INK,valign:"middle",margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:0.6,y:5.45,w:12.13,h:1.45,fill:{color:INK},rectRadius:0.06});
s.addText("리포트에 적히는 문장",{x:1.0,y:5.62,w:5.0,h:0.3,fontFace:F,fontSize:12,color:MUTEDW,margin:0,isTextBox:true});
s.addText([{text:'"김OO씨가 왔다"  ',options:{color:"6E7686",strike:true}},
           {text:'→  "20대 후반 · 뷰티 고관여 · 객단가 상위 30% 세그먼트가 42%"',options:{color:AMBER,bold:true}}],
  {x:1.0,y:5.98,w:11.2,h:0.55,fontFace:F,fontSize:16,valign:"middle",margin:0,isTextBox:true});
s.addNotes("여기서 반드시 말씀드릴 게 있습니다. 저희는 사람을 추적하지 않습니다. 설계를 두 층으로 완전히 분리했습니다. 영상은 카메라 안에서 즉시 좌표와 숫자로 바뀌고, 원본은 밖으로 나가지 않습니다. 개인을 식별하는 연결은 고객이 앱에서 직접 동의한 경우에만 일어납니다. 그 사이는 개인 단위가 아니라 세그먼트와 시간대 집계로만 연결합니다. 리포트에도 김OO씨가 왔다가 아니라, 20대 후반 뷰티 고관여 객단가 상위 30% 세그먼트가 42%라고 적힙니다. 법적으로 안전하고, 고객 신뢰를 잃지 않는 구조입니다. (45초)");

/* ---------------- 9. REVENUE ---------------- */
s = pres.addSlide();
head(s,"09","수익은 다섯 단계로 쌓입니다","팝업은 매출 엔진이 아니라 유입 깔때기 — 3년차 매출의 51%가 반복 매출");
const tiers=[
 ["①","팝업 솔루션 패키지","리포트 + 고객 인사이트 + 개선 처방","ASP 320만원 / 건","유입"],
 ["②","상설 매장 구독","월간 처방 리포트 + 대시보드","월 45만원 / 매장","리커링"],
 ["③","성장 컨설팅 + 성과연동","VMD · 상품기획 · 출점전략","1,500만원 + 성과 5~10%","고부가"],
 ["④","L.POINT 리타게팅","안 산 고객에게 앱 쿠폰 발송","CPM / CPA","리커링"],
 ["⑤","벤치마크 라이선스","카테고리 기준치 정기 리포트","연 2,000~5,000만원","리커링"]];
tiers.forEach((t,i)=>{
  const y=1.78+i*0.96, rec=t[4]==="리커링";
  s.addShape(pres.ShapeType.roundRect,{x:0.6,y:y,w:12.13,h:0.84,fill:{color:i%2?W:TINT},
    rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(t[0],{x:0.85,y:y,w:0.55,h:0.84,align:"center",valign:"middle",fontFace:F,fontSize:20,bold:true,color:RED,margin:0,isTextBox:true});
  s.addText(t[1],{x:1.5,y:y,w:3.2,h:0.84,fontFace:F,fontSize:15,bold:true,color:INK,valign:"middle",margin:0,isTextBox:true});
  s.addText(t[2],{x:4.75,y:y,w:3.7,h:0.84,fontFace:F,fontSize:12,color:SLATE,valign:"middle",margin:0,isTextBox:true});
  s.addText(t[3],{x:8.45,y:y,w:3.05,h:0.84,align:"right",fontFace:F,fontSize:14,bold:true,color:INK,valign:"middle",margin:0,isTextBox:true});
  s.addShape(pres.ShapeType.roundRect,{x:11.72,y:y+0.24,w:0.85,h:0.36,fill:{color:rec?RED:LINE},rectRadius:0.05});
  s.addText(t[4],{x:11.72,y:y+0.24,w:0.85,h:0.36,align:"center",valign:"middle",fontFace:F,
    fontSize:10,bold:true,color:rec?W:SLATE,margin:0,isTextBox:true});
});
s.addText("구글 애널리틱스는 무료입니다. 구글은 측정이 아니라 광고로 법니다. 저희도 같습니다.",
  {x:0.6,y:6.62,w:12.13,h:0.42,align:"center",fontFace:F,fontSize:15,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("수익은 다섯 단계로 쌓입니다. 1단, 팝업 솔루션 패키지. 180에서 600만원, 평균 320만원입니다. 이건 돈을 버는 상품이 아니라 브랜드를 데려오는 깔때기입니다. 2단, 상설 매장 구독. 월 45만원. 매달 처방 리포트가 나갑니다. 여기서 반복 매출이 생깁니다. 3단, 성장 컨설팅. 건당 1,500만원. 효과 검증 덕분에 늘어난 매출의 5에서 10퍼센트를 성과 수수료로 받을 수 있습니다. 4단, L.POINT 리타게팅. 안 산 고객에게 앱으로 쿠폰을 보내 다시 부릅니다. 구글 애널리틱스는 무료입니다. 구글은 측정이 아니라 광고로 법니다. 저희도 같습니다. 5단, 카테고리 벤치마크 리포트 판매. 3년차 기준 매출의 51%가 반복 매출입니다. (55초)");

/* ---------------- 10. EDGE AI ---------------- */
s = pres.addSlide();
head(s,"10","영상을 클라우드로 올리지 않습니다","경쟁사 이익률이 낮은 이유는 기술이 아니라 원가 구조였습니다");
s.addChart(pres.ChartType.line,[
 {name:"클라우드 방식 (경쟁사)",labels:["10개점","50개점","100개점","300개점"],values:[0.8,4.0,8.0,24.0]},
 {name:"엣지 방식 (L.GA)",labels:["10개점","50개점","100개점","300개점"],values:[0.3,0.7,1.2,3.0]}],
 {x:0.6,y:1.75,w:7.1,h:4.5,chartColors:[SLATE,RED],lineSize:3,lineDataSymbolSize:8,
  showTitle:true,title:"매장 확산에 따른 연간 인프라 비용 (억원, 추정)",titleFontFace:F,titleFontSize:13,titleColor:SLATE,
  showLegend:true,legendPos:"b",legendFontFace:F,legendFontSize:12,legendColor:SLATE,
  catAxisLabelFontFace:F,catAxisLabelFontSize:12,catAxisLabelColor:INK,
  valAxisLabelFontFace:F,valAxisLabelFontSize:11,valAxisLabelColor:SLATE,
  valGridLine:{color:LINE,size:1},catGridLine:{style:"none"}});
const edge=[["영상 전송 없음","카메라·NVR 단에서 추론을 끝내고 결과 숫자만 전송"],
 ["클라우드 비용 1/10","매장이 10배 늘어도 비용은 10배 늘지 않습니다"],
 ["개인정보 문제 동시 해결","원본이 밖으로 나가지 않으므로 Layer 1이 성립"],
 ["리포트 자동화","사람은 처방과 검증에만 투입"]];
edge.forEach((e,i)=>{
  const y=1.82+i*1.18;
  s.addShape(pres.ShapeType.roundRect,{x:8.0,y:y,w:4.73,h:0.88,fill:{color:TINT},rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(e[0],{x:8.32,y:y+0.08,w:4.1,h:0.33,fontFace:F,fontSize:14,bold:true,color:RED,margin:0,isTextBox:true});
  s.addText(e[1],{x:8.32,y:y+0.42,w:4.1,h:0.42,fontFace:F,fontSize:11,color:INK,lineSpacing:16,margin:0,isTextBox:true});
});
s.addText("그래서 매출총이익률 77%가 나옵니다.",{x:0.6,y:6.5,w:12.13,h:0.42,align:"center",
  fontFace:F,fontSize:16,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("경쟁사 재무를 뜯어봤습니다. 이익률이 낮은 이유는 기술이 아니라 원가 구조였습니다. 영상을 전부 클라우드로 올리니 매장이 늘수록 비용이 그대로 따라 올라갑니다. 저희는 카메라 단에서 분석을 끝내고 결과 숫자만 보냅니다. 영상은 전송하지 않습니다. 클라우드 비용이 10분의 1 수준이 되고, 앞서 말씀드린 개인정보 문제까지 동시에 해결됩니다. 리포트 생성은 자동화하고, 사람은 처방과 검증에만 투입합니다. 그래서 매출총이익률 77%가 나옵니다. (40초)");

/* ---------------- 11. FINANCIALS ---------------- */
s = pres.addSlide();
head(s,"11","24개월에 손익분기, 3년차 영업이익률 35%","※ 내부 검증 전 추정치 — 롯데 내부 데이터로 재검증 필요");
s.addChart(pres.ChartType.bar,[
 {name:"매출",labels:["Y1 파일럿","Y2 전점 확산","Y3 계열·외부 확장"],values:[13.2,54.2,128.6]},
 {name:"영업이익",labels:["Y1 파일럿","Y2 전점 확산","Y3 계열·외부 확장"],values:[-8.2,8.8,44.9]}],
 {x:0.6,y:1.75,w:8.0,h:4.05,barDir:"col",chartColors:[INK2,RED],
  showTitle:true,title:"3개년 손익 추정 (단위: 억원)",titleFontFace:F,titleFontSize:13,titleColor:SLATE,
  showValue:true,dataLabelPosition:"outEnd",dataLabelFontFace:F,dataLabelFontSize:12,dataLabelColor:INK,
  dataLabelFormatCode:"0.0",
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
s.addText("파일럿 1.5억으로 시작해 24개월에 손익분기를 넘습니다.",{x:0.6,y:5.95,w:8.0,h:0.42,
  align:"center",fontFace:F,fontSize:14,bold:true,color:INK,margin:0,isTextBox:true});
s.addNotes("숫자로 말씀드리겠습니다. 먼저 이 수치는 내부 검증 전 추정치임을 말씀드립니다. 1년차, 10개 점포 파일럿, 팝업 300건. 매출 13억, 영업손실 8억입니다. 2년차, 전점 확산. 구독과 광고가 붙습니다. 매출 54억, 영업이익 9억. 여기서 흑자 전환하고 누적 손익분기도 24개월에 넘습니다. 3년차, 계열사와 해외 롯데몰까지. 매출 129억, 영업이익 45억, 영업이익률 35%입니다. 민감도도 돌려봤습니다. 팝업 침투율이 목표의 3분의 2로 떨어지고, 구독이 절반으로 줄고, 광고 사업을 아예 못 해도 3년차는 여전히 흑자입니다. 수익원이 다섯 개로 분산돼 있기 때문입니다. 그리고 이 사업은 가볍습니다. CCTV가 이미 있어서 3년간 설비투자가 총 11억, 10개 점포 파일럿은 1억 5천이면 시작합니다. (55초)");

/* ---------------- 12. ROADMAP ---------------- */
s = pres.addSlide();
head(s,"12","밖이 아니라 안에서 시작합니다","롯데가 먼저 쓰고, 데이터와 벤치마크를 확보한 다음 판매합니다");
const ph=[["Phase 0","0~3개월","롯데백화점 내부 도입\n10개점 파일럿 · 매출 0원"],
 ["Phase 1","4~12개월","팝업 브랜드 유료 판매\n검증된 개선 케이스 3건 확보"],
 ["Phase 2","13~24개월","전점 확산 · 상설 구독\nL.POINT 리타게팅 출시"],
 ["Phase 3","25~36개월","계열사 · 외부 유통사\n베트남 · 인도네시아 롯데몰"]];
ph.forEach((p,i)=>{
  const x=0.6+i*3.06;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:1.78,w:2.86,h:2.5,fill:{color:i===0?INK:TINT},
    rectRadius:0.06,line:{color:i===0?INK:LINE,width:1},shadow:sh()});
  s.addText(p[0],{x:x+0.28,y:2.0,w:2.3,h:0.35,fontFace:F,fontSize:15,bold:true,color:i===0?AMBER:RED,margin:0,isTextBox:true});
  s.addText(p[1],{x:x+0.28,y:2.38,w:2.3,h:0.3,fontFace:F,fontSize:11,color:i===0?MUTEDW:SLATE,margin:0,isTextBox:true});
  s.addText(p[2],{x:x+0.28,y:2.78,w:2.3,h:1.25,fontFace:F,fontSize:12,color:i===0?W:INK,lineSpacing:19,margin:0,isTextBox:true});
});
s.addText("3사 합작 — 세 조각이 다 모여야 성립하는 사업입니다",{x:0.6,y:4.55,w:12.13,h:0.38,
  fontFace:F,fontSize:15,bold:true,color:INK,margin:0,isTextBox:true});
const org=[["롯데백화점","공간 · 트래픽 · POS · MD 지식"],["롯데이노베이트","비전 AI 엔진 · 엣지 인프라"],["롯데멤버스","L.POINT 소비 이력 · 도달 채널"]];
org.forEach((o,i)=>{
  const x=0.6+i*4.07;
  s.addShape(pres.ShapeType.roundRect,{x:x,y:5.05,w:3.86,h:1.15,fill:{color:TINT},rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(o[0],{x:x+0.3,y:5.18,w:3.3,h:0.35,fontFace:F,fontSize:14,bold:true,color:INK,margin:0,isTextBox:true});
  s.addText(o[1],{x:x+0.3,y:5.58,w:3.3,h:0.5,fontFace:F,fontSize:11,color:SLATE,lineSpacing:16,margin:0,isTextBox:true});
});
s.addText("그래서 지금까지 아무도 못 했습니다.",{x:0.6,y:6.45,w:12.13,h:0.4,align:"center",
  fontFace:F,fontSize:15,bold:true,color:RED,margin:0,isTextBox:true});
s.addNotes("실행은 밖이 아니라 안에서 시작합니다. 먼저 롯데백화점이 자기 매장 최적화를 위해 직접 씁니다. 매출 0원, 대신 데이터와 벤치마크를 확보합니다. 그다음 팝업 브랜드에 유료 판매, 계열사 확산, 마지막에 외부 유통사와 해외 롯데몰입니다. 조직은 3사 합작입니다. 백화점이 공간과 트래픽과 POS를, 롯데이노베이트가 비전 AI 엔진을, 롯데멤버스가 L.POINT 소비 이력을 댑니다. 세 조각이 다 모여야 성립하는 사업이고, 그래서 지금까지 아무도 못 했습니다. (40초)");

/* ---------------- 13. RISK (backup) ---------------- */
s = pres.addSlide();
head(s,"13","리스크와 대응","백업 슬라이드 — Q&A 대응용");
const risk=[["개인정보 규제","엣지 추론 · 원본 미저장 · 동의 기반 2계층 설계. 착수 전 법무·DPO 검토 및 영향평가"],
 ["기존 CCTV 사양 부적합","팝업존 한정 저가 보완 카메라(대당 약 25만원) 설치를 CAPEX에 반영"],
 ["브랜드 지불 의사 부족","1년차 파일럿 무상 제공 → 가치 검증 후 과금. 지불 의사를 가정하지 않음"],
 ["인식 정확도 논란","개인 정확도가 아닌 집계 정확도로 KPI 정의. 핵심 인사이트는 L.POINT·POS 실데이터 기반"],
 ["계열사 데이터 거버넌스","3사 데이터 제공 협약·수익 배분 사전 합의 (마일스톤 1번)"],
 ["경쟁사 선점","벤치마크 DB는 시간으로만 축적. 인수(M&A)도 옵션으로 병행 검토"]];
risk.forEach((r,i)=>{
  const y=1.74+i*0.82;
  s.addShape(pres.ShapeType.roundRect,{x:0.6,y:y,w:12.13,h:0.72,fill:{color:i%2?TINT:W},
    rectRadius:0.05,line:{color:LINE,width:1}});
  s.addText(r[0],{x:0.92,y:y,w:3.05,h:0.72,fontFace:F,fontSize:14,bold:true,color:RED,
    valign:"middle",margin:0,isTextBox:true});
  s.addText(r[1],{x:4.15,y:y,w:8.3,h:0.72,fontFace:F,fontSize:12,color:INK,
    valign:"middle",margin:0,isTextBox:true});
});
s.addNotes("백업 슬라이드입니다. Q&A에서 개인정보, CCTV 사양, 지불 의사, 인식 정확도, 데이터 거버넌스 질문이 나오면 꺼내십시오.");

/* ---------------- 14. CLOSING ---------------- */
s = pres.addSlide();
s.background = { color: INK };
s.addText("브랜드는 자기가 판 것만 압니다.",{x:1.1,y:2.15,w:11.1,h:0.85,fontFace:F,fontSize:38,
  bold:true,color:MUTEDW,margin:0,isTextBox:true});
s.addText("저희는 놓친 사람이 누구였는지 알려줍니다.",{x:1.1,y:3.0,w:11.1,h:0.95,fontFace:F,
  fontSize:38,bold:true,color:W,margin:0,isTextBox:true});
s.addText("매일 삭제되던 97명의 데이터를, 브랜드에게는 성장의 답으로 · 롯데에게는 새로운 수익으로",
  {x:1.1,y:4.15,w:11.1,h:0.45,fontFace:F,fontSize:16,color:MUTEDW,margin:0,isTextBox:true});
s.addShape(pres.ShapeType.roundRect,{x:1.1,y:5.0,w:8.4,h:1.0,fill:{color:INK2},rectRadius:0.06});
s.addText("온라인에 GA가 있다면,  오프라인에는 L.GA가 있습니다.",
  {x:1.5,y:5.0,w:7.7,h:1.0,fontFace:F,fontSize:20,bold:true,color:AMBER,valign:"middle",margin:0,isTextBox:true});
s.addNotes("매일 삭제되던 97명의 데이터를, 브랜드에게는 성장의 답으로, 롯데에게는 새로운 수익으로 바꾸는 일입니다. 온라인에 GA가 있다면, 오프라인에는 L.GA가 있습니다. 감사합니다. (20초)");

pres.writeFile({ fileName: "LGA_롯데신사업_발표.pptx" }).then(f=>console.log("WROTE",f));
