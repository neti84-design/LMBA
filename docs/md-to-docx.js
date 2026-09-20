/* 마크다운 한 장을 그대로 Word 로 옮긴다.
   실행:  node docs/md-to-docx.js <입력.md> <출력.docx> "표지 제목" "표지 부제"

   제안서(build-docx.js)는 내용이 JS 안에 박혀 있어 고치기 번거로웠다.
   이 스크립트는 반대로 **내용은 .md 에만 두고** 서식만 여기서 입힌다.
   지원: # ## ### ####  ·  - 목록(2단)  ·  1. 번호목록  ·  > 인용상자  ·  표  ·  ---  ·  **굵게**
        <!-- break --> 는 쪽 나눔. */
const fs = require('fs');
const path = require('path');
const d = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
        ShadingType, BorderStyle, AlignmentType, HeadingLevel, PageBreak, LevelFormat,
        convertMillimetersToTwip, ImageRun } = d;

const FONT = '맑은 고딕';
const SHELL = '3B2314';   // 넛츠 셸 브라운
const GOLDINK = '8A6420'; // 인쇄용으로 내린 넛츠 골드
const BLUE = '2E5C8A';
const GREY = '595959';
const LIGHT = 'FBF5EA';
const RED = 'B02A2A';
const INK = '262626';

const MARGIN = convertMillimetersToTwip(20);
const PAGE_W = 11906;
const TW = PAGE_W - MARGIN * 2;

/* ---------- **굵게** 파서 ---------- */
function runs(t, o = {}) {
  const base = { font: FONT, size: o.size || 20, color: o.color || INK };
  const out = [];
  String(t).split(/(\*\*[^*]+\*\*)/g).forEach((part) => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**')) {
      out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true, color: o.boldColor || base.color }));
    } else {
      out.push(new TextRun({ ...base, text: part }));
    }
  });
  return out.length ? out : [new TextRun({ ...base, text: '' })];
}

const P = (t, o = {}) => new Paragraph({
  children: runs(t, o),
  alignment: o.align,
  spacing: { before: o.before ?? 60, after: o.after ?? 110, line: 288 },
});

const H1 = (t) => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 30, bold: true, color: SHELL })],
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 380, after: 180 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLDINK, space: 6 } },
});
const H2 = (t) => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 24, bold: true, color: BLUE })],
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 120 },
});
const H3 = (t) => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 21, bold: true, color: SHELL })],
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 240, after: 90 },
});
const H4 = (t) => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 20, bold: true, color: GREY })],
  heading: HeadingLevel.HEADING_4,
  spacing: { before: 180, after: 70 },
});

const LI = (t, lvl = 0) => new Paragraph({
  children: runs(t),
  numbering: { reference: 'bul', level: lvl },
  spacing: { before: 30, after: 60, line: 276 },
});
const NLI = (t) => new Paragraph({
  children: runs(t),
  numbering: { reference: 'num', level: 0 },
  spacing: { before: 30, after: 60, line: 276 },
});

/* 인용 상자 — 배경 + 위아래 괘선 */
const BOX = (lines, accent) => {
  const col = accent || GOLDINK;
  return lines.map((t, i) => new Paragraph({
    children: runs(t, { size: 20, boldColor: col }),
    spacing: { before: i === 0 ? 170 : 30, after: i === lines.length - 1 ? 190 : 30, line: 288 },
    indent: { left: 220, right: 220 },
    shading: { type: ShadingType.CLEAR, fill: LIGHT, color: 'auto' },
    border: {
      top: i === 0 ? { style: BorderStyle.SINGLE, size: 14, color: col, space: 8 } : undefined,
      bottom: i === lines.length - 1 ? { style: BorderStyle.SINGLE, size: 4, color: col, space: 8 } : undefined,
    },
  }));
};

/* 표 — 글자 수 비율로 열 너비를 나눈다 */
function TBL(head, rows) {
  const n = head.length;
  const len = head.map((h, i) => Math.max(h.replace(/\*\*/g, '').length,
    ...rows.map((r) => Math.max(...String(r[i] || '').replace(/\*\*/g, '').split('<br>').map((x) => x.length)))));
  const clamped = len.map((l) => Math.min(Math.max(l, 6), 42));
  const sum = clamped.reduce((a, b) => a + b, 0);
  const w = clamped.map((l) => Math.round(TW * l / sum));
  w[n - 1] = TW - w.slice(0, n - 1).reduce((a, b) => a + b, 0);

  const para = (txt, o = {}) => String(txt).split('<br>').map((line, i, arr) => new Paragraph({
    children: runs(line, { size: o.size || 18, color: o.color, boldColor: o.color || SHELL }),
    spacing: { before: i ? 20 : 0, after: i === arr.length - 1 ? 0 : 20, line: 264 },
  }));

  const hdr = new TableRow({
    tableHeader: true,
    children: head.map((h, i) => new TableCell({
      width: { size: w[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: SHELL, color: 'auto' },
      margins: { top: 80, bottom: 80, left: 110, right: 110 },
      verticalAlign: 'center',
      children: [new Paragraph({
        children: [new TextRun({ text: h.replace(/\*\*/g, ''), font: FONT, size: 18, bold: true, color: 'FFFFFF' })],
        spacing: { before: 0, after: 0 },
      })],
    })),
  });
  const body = rows.map((r, ri) => new TableRow({
    children: r.map((c, i) => new TableCell({
      width: { size: w[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: ri % 2 ? 'FBF8F2' : 'FFFFFF', color: 'auto' },
      margins: { top: 70, bottom: 70, left: 110, right: 110 },
      verticalAlign: 'center',
      children: para(c),
    })),
  }));
  return new Table({
    columnWidths: w,
    width: { size: TW, type: WidthType.DXA },
    rows: [hdr, ...body],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'D8CCBB' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D8CCBB' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'D8CCBB' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'D8CCBB' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E9DFD1' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E9DFD1' },
    },
  });
}

const RULE = () => new Paragraph({
  children: [],
  spacing: { before: 140, after: 140 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E0D5C6', space: 4 } },
});

/* ---------- 마크다운 → 블록 ---------- */
function convert(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  const splitRow = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

  while (i < lines.length) {
    const l = lines[i];

    if (/^<!--\s*break\s*-->/.test(l)) { out.push(new Paragraph({ children: [new PageBreak()] })); i++; continue; }
    if (!l.trim()) { i++; continue; }

    if (/^####\s+/.test(l)) { out.push(H4(l.replace(/^####\s+/, ''))); i++; continue; }
    if (/^###\s+/.test(l)) { out.push(H3(l.replace(/^###\s+/, ''))); i++; continue; }
    if (/^##\s+/.test(l)) { out.push(H2(l.replace(/^##\s+/, ''))); i++; continue; }
    if (/^#\s+/.test(l)) { out.push(H1(l.replace(/^#\s+/, ''))); i++; continue; }
    if (/^---+$/.test(l.trim())) { out.push(RULE()); i++; continue; }

    /* 인용 상자 — 연속된 > 를 한 상자로 */
    if (/^>\s?/.test(l)) {
      const buf = [];
      let accent = GOLDINK;
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        let t = lines[i].replace(/^>\s?/, '');
        if (/^!\s*/.test(t)) { accent = RED; t = t.replace(/^!\s*/, ''); }
        buf.push(t);
        i++;
      }
      out.push(...BOX(buf, accent));
      continue;
    }

    /* 표 */
    if (/^\|/.test(l) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const head = splitRow(l);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
      out.push(TBL(head, rows));
      out.push(new Paragraph({ children: [], spacing: { after: 140 } }));
      continue;
    }

    /* 목록 */
    if (/^(\s*)[-·]\s+/.test(l)) {
      const lvl = /^\s{2,}/.test(l) ? 1 : 0;
      out.push(LI(l.replace(/^\s*[-·]\s+/, ''), lvl));
      i++; continue;
    }
    if (/^\d+\.\s+/.test(l)) { out.push(NLI(l.replace(/^\d+\.\s+/, ''))); i++; continue; }

    out.push(P(l));
    i++;
  }
  return out;
}

/* ---------- 표지 ---------- */
function cover(title, subtitle) {
  const LOGO = path.join(__dirname, '..', 'brand', 'nuts-mark-1024.png');
  const c = [new Paragraph({ children: [], spacing: { after: 1900 } })];
  if (fs.existsSync(LOGO)) {
    c.push(new Paragraph({
      children: [new ImageRun({ type: 'png', data: fs.readFileSync(LOGO), transformation: { width: 72, height: 117 } })],
      alignment: AlignmentType.CENTER, spacing: { after: 400 },
    }));
  }
  c.push(new Paragraph({
    children: [new TextRun({ text: '넛츠', font: FONT, size: 64, bold: true, color: SHELL })],
    alignment: AlignmentType.CENTER, spacing: { after: 80 },
  }));
  c.push(new Paragraph({
    children: [new TextRun({ text: 'NUTS', font: FONT, size: 20, color: GOLDINK, characterSpacing: 120 })],
    alignment: AlignmentType.CENTER, spacing: { after: 520 },
  }));
  c.push(new Paragraph({
    children: [new TextRun({ text: title, font: FONT, size: 36, bold: true, color: INK })],
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
  }));
  if (subtitle) {
    c.push(new Paragraph({
      children: [new TextRun({ text: subtitle, font: FONT, size: 20, color: GREY })],
      alignment: AlignmentType.CENTER, spacing: { after: 2400 },
    }));
  }
  c.push(new Paragraph({
    children: [new TextRun({ text: '심심할 땐, 넛츠', font: FONT, size: 20, color: GOLDINK })],
    alignment: AlignmentType.CENTER,
  }));
  c.push(new Paragraph({ children: [new PageBreak()] }));
  return c;
}

/* ---------- 실행 ---------- */
const [src, out, title, subtitle] = process.argv.slice(2);
if (!src || !out) {
  console.error('사용법: node docs/md-to-docx.js <입력.md> <출력.docx> "표지 제목" "표지 부제"');
  process.exit(1);
}
const md = fs.readFileSync(src, 'utf8');
const doc = new Document({
  creator: '넛츠 TF',
  title: title || path.basename(out, '.docx'),
  styles: { default: { document: { run: { font: FONT, size: 20, color: INK } } } },
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
    properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    children: [...(title ? cover(title, subtitle) : []), ...convert(md)],
  }],
});
Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(out, b);
  console.log('written', path.basename(out), b.length, 'bytes');
});
