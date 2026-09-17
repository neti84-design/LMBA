# 넛츠 IR 덱

`deck.js` 한 곳에 **내용과 좌표**가 들어 있고, 세 스크립트가 그걸 읽어 각각 다른 걸 뽑습니다.

| 파일 | 하는 일 |
|---|---|
| `deck.js` | 슬라이드 15장의 도형·글·사진 좌표 + 슬라이드별 대본과 분량(초) |
| `build.js` | → `넛츠_IR덱.pptx` (16:9, 전 슬라이드 발표자 노트 포함) — `npm run build:deck` |
| `build-script.js` | → `docs/06_ir-pitch-10min.md` · `넛츠_IR덱_대본.docx` — `npm run build:deck-script` |
| `preview.js` | → `deck/preview/*.png` 슬라이드 미리보기 — `npm run preview:deck` |

## 왜 미리보기가 따로 있나

이 저장소를 만든 환경에는 PowerPoint도 LibreOffice도 없습니다. 그래서 **PPTX와 똑같은 좌표를
브라우저로 그려서** 글자가 넘치거나 겹치는지 눈으로 확인합니다. 글꼴은 PPT가 맑은 고딕,
미리보기가 Noto Sans KR이라 폭이 미세하게 다릅니다 — 여백을 넉넉히 둔 이유입니다.

`preview.js` 는 playwright 가 필요합니다: `npm i -D playwright` 후 실행하십시오.

## 고칠 때

문구·수치는 `deck.js` 안 `add(...)` 블록에서 고치고 `npm run build:deck && npm run build:deck-script`.
대본과 PPT 노트가 같은 원본에서 나오므로 **둘이 어긋날 수 없습니다.**

사진 3장은 `assets/` 에 있습니다 (사장님 · 사용자 · 앱 목업).
