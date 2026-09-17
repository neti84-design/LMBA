/* deck.js 의 노트를 대본으로 뽑는다 — 마크다운 + Word.  실행:  npm run build:deck-script */
const fs = require('fs');
const path = require('path');
const d = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
        ShadingType, BorderStyle, AlignmentType, PageBreak, convertMillimetersToTwip } = d;
const D = require('./deck.js');

const FONT = '맑은 고딕';
const SHELL = '3B2314', GOLD = '8A6420', GREY = '595959', LIGHT = 'FBF5EA';
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const TOTAL = D.S.reduce((a, s) => a + s.secs, 0);

/* 누적 시간 */
let acc = 0;
const rows = D.S.map((s, i) => {
  const at = acc; acc += s.secs;
  return { n: i + 1, title: s.title, at, secs: s.secs, notes: s.notes };
});

/* ---------- 마크다운 ---------- */
const md = [];
md.push('# 넛츠 IR 덱 — 10분 발표 대본\n');
md.push(`> 슬라이드 **${D.S.length}장** · 실측 **${mmss(TOTAL)}** · 10:00까지 여유 **${600 - TOTAL}초**`);
md.push('> 기준 속도 300자/분(발표용 호흡 포함). **/** 는 한 박자 쉬는 지점, **굵은 글씨**는 힘주어 말할 지점입니다.');
md.push('> 같은 대본이 PPT 슬라이드 노트에도 그대로 들어 있습니다.\n');
md.push('| # | 슬라이드 | 누적 | 분량 |');
md.push('|---|---|---|---|');
rows.forEach(r => md.push(`| ${r.n} | ${r.title} | ${mmss(r.at)} | ${mmss(r.secs)} |`));
md.push(`| | **합계** | | **${mmss(TOTAL)}** |\n`);
md.push('---\n');
rows.forEach(r => {
  md.push(`## S${r.n} · ${r.title}  \`[${mmss(r.at)} · ${mmss(r.secs)}]\`\n`);
  r.notes.forEach(line => md.push(line + '  '));
  md.push('');
});
md.push('---\n');
md.push('## 시간이 밀릴 때 버릴 순서\n');
md.push('**S5(시장의 빈칸) · S7(도달 필터) · S11(재무) · S15(요청)는 어떤 경우에도 건드리지 않습니다.**\n');
md.push('| 순서 | 버릴 것 | 회수 |');
md.push('|---|---|---|');
md.push('| 1 | S8의 셋째 항목(광고 트래픽) — S10에서 어차피 다시 나옵니다 | 약 8초 |');
md.push('| 2 | S9(타깃) 전체 — 질문으로 받아도 됩니다 | 약 30초 |');
md.push('| 3 | S12(확장)의 3·4단계 설명 한 문장 | 약 12초 |');
md.push('| 4 | S13의 지적 둘 중 두 번째(자전거) | 약 12초 |');
md.push(`\n전부 빼면 약 **${mmss(TOTAL - 62)}**.\n`);
md.push('## 전달 지침\n');
md.push('- **S2·S3은 사진을 먼저 3초 보여주고** 말을 시작하십시오. 두 사람의 표정이 곧 문제 정의입니다.');
md.push('- **S5에서 서두르지 마십시오.** 이 발표의 주장은 "합쳐진 칸만 비어 있다"입니다.');
md.push('- **S7은 숫자를 손으로 짚으며.** 38분 · 43분 · 10분 세 숫자만 또렷하면 됩니다.');
md.push('- **S11은 3년차 열 하나만** 짚으십시오. 나머지는 질문으로 받습니다.');
md.push('- 마지막 문장 뒤에는 **2초 침묵**.');
fs.writeFileSync(path.join(__dirname, '..', 'docs', '06_ir-pitch-10min.md'), md.join('\n') + '\n');

/* ---------- Word ---------- */
const P = (t, o = {}) => new Paragraph({
  children: runs(t, o), alignment: o.align,
  spacing: { before: o.before ?? 60, after: o.after ?? 60, line: 300 },
});
function runs(text, o = {}) {
  const base = { font: FONT, size: o.size || 22, color: o.color || '1A1A1A' };
  const out = [];
  String(text).split(/(\*\*[^*]+\*\*)/g).forEach(part => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**')) out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true, color: o.boldColor || SHELL }));
    else out.push(new TextRun({ ...base, text: part }));
  });
  return out;
}
const cell = (t, w, o = {}) => new TableCell({
  width: { size: w, type: WidthType.DXA },
  shading: { type: ShadingType.CLEAR, fill: o.fill || 'FFFFFF', color: 'auto' },
  margins: { top: 70, bottom: 70, left: 110, right: 110 },
  children: [new Paragraph({ children: runs(t, { size: o.size || 19, color: o.color }), alignment: o.align, spacing: { before: 0, after: 0 } })],
});
const W1 = 1200, W2 = 5200, W3 = 1500, W4 = 1500;

const c = [];
c.push(new Paragraph({ children: [], spacing: { after: 1200 } }));
c.push(new Paragraph({ children: [new TextRun({ text: 'IR 덱 발표 대본', font: FONT, size: 22, color: GREY, characterSpacing: 60 })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
c.push(new Paragraph({ children: [new TextRun({ text: '넛츠', font: FONT, size: 80, bold: true, color: SHELL })], alignment: AlignmentType.CENTER, spacing: { after: 160 } }));
c.push(new Paragraph({ children: [new TextRun({ text: `슬라이드 ${D.S.length}장  ·  실측 ${mmss(TOTAL)}  ·  10:00까지 여유 ${600 - TOTAL}초`, font: FONT, size: 22, bold: true, color: GOLD })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
c.push(new Paragraph({ children: [new TextRun({ text: '기준 속도 300자/분 (발표용 호흡 포함)  ·  / 는 한 박자 쉬는 지점', font: FONT, size: 19, color: GREY })], alignment: AlignmentType.CENTER, spacing: { after: 1400 } }));
c.push(new Paragraph({ children: [new PageBreak()] }));

c.push(P('시간 배분', { size: 30, boldColor: SHELL, after: 160 }));
c.push(new Table({
  width: { size: W1 + W2 + W3 + W4, type: WidthType.DXA },
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell('#', W1, { fill: SHELL, color: 'FFFFFF' }), cell('슬라이드', W2, { fill: SHELL, color: 'FFFFFF' }),
      cell('누적', W3, { fill: SHELL, color: 'FFFFFF', align: AlignmentType.RIGHT }), cell('분량', W4, { fill: SHELL, color: 'FFFFFF', align: AlignmentType.RIGHT })] }),
    ...rows.map(r => new TableRow({ children: [
      cell(`S${r.n}`, W1), cell(r.title, W2),
      cell(mmss(r.at), W3, { align: AlignmentType.RIGHT }), cell(mmss(r.secs), W4, { align: AlignmentType.RIGHT })] })),
    new TableRow({ children: [
      cell('', W1, { fill: LIGHT }), cell('**합계**', W2, { fill: LIGHT }),
      cell('', W3, { fill: LIGHT }), cell(`**${mmss(TOTAL)}**`, W4, { fill: LIGHT, align: AlignmentType.RIGHT })] }),
  ],
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'D8C6AE' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D8C6AE' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'D8C6AE' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'D8C6AE' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'EDE2D2' }, insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'EDE2D2' },
  },
}));
c.push(new Paragraph({ children: [new PageBreak()] }));

rows.forEach((r, i) => {
  c.push(P(`S${r.n} · ${r.title}`, { size: 28, boldColor: SHELL, before: i === 0 ? 0 : 320, after: 40 }));
  c.push(P(`누적 ${mmss(r.at)}  ·  분량 ${mmss(r.secs)}`, { size: 18, color: GOLD, after: 140 }));
  r.notes.forEach(line => c.push(new Paragraph({
    children: runs(line, { size: 24 }),
    spacing: { before: 60, after: 60, line: 340 },
    indent: { left: 200 },
  })));
});

const doc = new Document({
  creator: '넛츠 TF', title: '넛츠 IR 덱 — 10분 발표 대본', description: `슬라이드 ${D.S.length}장 · 실측 ${mmss(TOTAL)}`,
  styles: { default: { document: { run: { font: FONT, size: 22, color: '1A1A1A' } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: {
    top: convertMillimetersToTwip(22), bottom: convertMillimetersToTwip(22),
    left: convertMillimetersToTwip(22), right: convertMillimetersToTwip(22) } } }, children: c }],
});
Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(path.join(__dirname, '..', '넛츠_IR덱_대본.docx'), b);
  console.log('written docs/06_ir-pitch-10min.md, 넛츠_IR덱_대본.docx', b.length, 'bytes');
});
