# poster — 전지 시안과 인쇄본

| 파일 | 용도 |
|---|---|
| `전지_롯데마트_해외점포망.html` | 화면 시안 (전지 실물 비율 1091:788). 브라우저에서 열고 **인쇄 → PDF로 저장** |
| `전지_롯데마트_해외점포망_A4.pdf` | A4 가로 2쪽 — 1쪽 전지, 2쪽 작성 순서·대사·확인 목록 |
| `전지_롯데마트_해외점포망_A3.pdf` | A3 가로 2쪽 (같은 내용, 더 크게) |

원고와 대본은 `../docs/08_전지_롯데마트_해외점포망.md`.

## PDF 다시 만들기

HTML을 고친 뒤:

```bash
NODE_PATH=/opt/node22/lib/node_modules node -e '
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.emulateMedia({ colorScheme: "light" });
  await p.goto("file://" + process.cwd() + "/poster/전지_롯데마트_해외점포망.html", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  for (const [n, o] of [["A4", { format: "A4" }], ["A3", { format: "A3" }]]) {
    await p.pdf({ path: `poster/전지_롯데마트_해외점포망_${n}.pdf`, landscape: true, printBackground: true,
      margin: { top: "8mm", bottom: "8mm", left: "8mm", right: "8mm" }, ...o });
  }
  await b.close();
})();'
```

## 주의

- 인쇄 시 **용지 방향 가로**, **배경 그래픽 켜기**. 배경을 끄면 형광 밑줄과 빨강 결론선이 사라집니다.
- 전지 비율 1.385와 A4·A3 가로 비율 1.414가 거의 같아 그대로 확대해 옮기면 됩니다.
- 손글씨 크기는 제목 약 2.2cm · 본문 약 1.2cm가 한계입니다. 더 크게 쓰려면 **좌/우를 전지 2장으로 분리**하십시오.
