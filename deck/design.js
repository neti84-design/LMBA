/* ============================================================
   L.GA 발표자료 — 디자인 시스템
   글꼴 · 타입 스케일 · 줄간격 · 그리드 · 자동 높이 텍스트
   ============================================================ */

/* ---- 글꼴 ------------------------------------------------
   FONT=malgun node build.js  → 어느 PC에서나 안전한 맑은 고딕
   FONT=nanum  node build.js  → 나눔스퀘어
   기본값 Pretendard 는 발표 PC에 설치돼 있어야 합니다.        */
const FONT_SETS = { pretendard:"Pretendard", malgun:"맑은 고딕", nanum:"나눔스퀘어" };
const F = FONT_SETS[process.env.FONT] || FONT_SETS.pretendard;

/* ---- 색 -------------------------------------------------- */
const C = {
  ink:"0E1420", ink2:"1A2233", ink3:"2A3446",
  red:"E11D2E", amber:"F5A623",
  slate:"5E6979", mute:"8C97A8", muteW:"AEB8C7",
  line:"E4E8EE", tint:"F7F8FA", white:"FFFFFF",
  warm:"FCEDEE", cool:"EFF3F8",
};

/* ---- 타입 스케일 (pt) — 8단계로 고정 ---------------------- */
const T = { micro:10, tag:11, small:11.5, body:13, lead:15, h3:18, h2:26, h1:40, hero:62 };

/* 줄간격: 한글 본문은 1.5배가 기준. 큰 글자는 1.2배로 좁힙니다. */
const LH  = s => Math.round(s * 1.5);
const LHt = s => Math.round(s * 1.2);

/* ---- 그리드 ---------------------------------------------- */
const G = {
  W:13.33, H:7.5,
  M:0.62,                       // 좌우 여백
  get CW(){ return this.W - this.M*2; },   // 12.09
  top:1.62,                     // 본문 시작
  bottom:6.70,                  // 본문 끝 (하단 문장 없을 때)
  bottomF:6.50,                 // 본문 끝 (하단 문장 있을 때)
  foot:6.74,                    // 하단 문장 y
  gap:0.16,                     // 카드 사이
  padX:0.30, padY:0.24,         // 카드 안쪽 여백
};
const cols = n => (G.CW - G.gap*(n-1)) / n;
const colX = (i,n) => G.M + i*(cols(n)+G.gap);

/* ---- 글자폭 추정 → 줄 수 계산 ----------------------------
   한글 1em, 영문 소문자 0.52em … 실제 렌더링과 ±1줄 이내로 맞습니다. */
function emWidth(t){
  let w = 0;
  for (const ch of String(t)) {
    const c = ch.codePointAt(0);
    if ((c>=0x1100&&c<=0x11FF)||(c>=0x3130&&c<=0x318F)||(c>=0xAC00&&c<=0xD7A3)||
        (c>=0x4E00&&c<=0x9FFF)||(c>=0xFF01&&c<=0xFF60)) w += 1.0;
    else if (ch===" ") w += 0.28;
    else if (/[0-9]/.test(ch)) w += 0.55;
    else if (/[A-Z]/.test(ch)) w += 0.66;
    else if (/[a-z]/.test(ch)) w += 0.52;
    else if (/[·—–…★|]/.test(ch)) w += 0.62;
    else w += 0.40;
  }
  return w;
}
function plain(text){
  return Array.isArray(text) ? text.map(r=>r.text==null?"":r.text).join("") : String(text);
}
/* 폭 wIn(인치), 크기 size(pt)로 감쌌을 때의 줄 수 */
function lineCount(text, wIn, size){
  const maxEm = (wIn / (size/72)) * 0.97;          // 3% 안전 여유
  let total = 0;
  for (const para of plain(text).split("\n")) {
    if (!para.trim()) { total += 1; continue; }
    const tokens = para.match(/[A-Za-z][A-Za-z.'’-]*|[0-9][0-9.,%]*|\s+|[\s\S]/g) || [];
    let cur = 0, lines = 1;
    for (const tk of tokens) {
      const w = emWidth(tk);
      if (cur + w > maxEm && cur > 0) { lines++; cur = /^\s+$/.test(tk) ? 0 : w; }
      else cur += w;
    }
    total += lines;
  }
  return total;
}
/* 텍스트가 실제로 차지하는 높이(인치) */
function textH(text, wIn, size, lhPt){
  return lineCount(text, wIn, size) * ((lhPt || LH(size)) / 72);
}

/* ---- 세로 분배: 블록들이 남는 공간을 나눠 가져 캔버스를 채웁니다 ---- */
function spread(natural, avail){
  const sum = natural.reduce((a,b)=>a+b,0);
  if (sum >= avail || sum <= 0) return natural.slice();
  const k = avail / sum;
  return natural.map(n => n*k);
}

/* ---- 넘침 감시 ------------------------------------------- */
const OVERFLOW = [];
function checkFit(tag, text, wIn, hIn, size, lhPt){
  const need = textH(text, wIn, size, lhPt);
  if (need > hIn + 0.005) OVERFLOW.push({ tag, need:+need.toFixed(2), box:+hIn.toFixed(2),
    lines:lineCount(text,wIn,size), size, text:plain(text).slice(0,44) });
}
function report(){
  if (!OVERFLOW.length) { console.log("레이아웃 점검: 넘치는 텍스트 없음"); return true; }
  console.log("레이아웃 경고 " + OVERFLOW.length + "건");
  for (const o of OVERFLOW)
    console.log("  [" + o.tag + "] " + o.size + "pt " + o.lines + "줄  필요 " + o.need + '" > 박스 ' + o.box + '"  | ' + o.text);
  return false;
}

module.exports = { F, C, T, LH, LHt, G, cols, colX, spread,
                   emWidth, plain, lineCount, textH, checkFit, report, OVERFLOW };
