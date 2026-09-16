# L.GA 웹사이트 시안

정적 HTML 3종. 빌드 없이 파일을 브라우저로 열면 됩니다 (`site/index.html`).

| 경로 | 무엇 | 참고 |
|---|---|---|
| [`index.html`](index.html) | **L.GA 홈페이지** — 브랜드(입점사) 대상 마케팅 사이트 | 메이아이(may-i.io) 구조를 참고: 히어로 → 핵심 숫자 → 문제 → 솔루션 사다리 → 5가지 인사이트 → 지표 체계 → 효과 검증 → 프라이버시 → 도입 과정 → 요금 → 3사 파트너 → 도입 문의 |
| [`portal/login.html`](portal/login.html) | **파트너 포털** 로그인 | 시안이므로 로그인 버튼은 바로 대시보드로 이동 |
| [`portal/index.html`](portal/index.html) | **파트너 포털** 대시보드 — 리포트 목록·일정·세그먼트 | 예시 브랜드 「글로우랩 GLOWLAB」 |
| [`portal/reports/glowlab-jamsil-2026-08.html`](portal/reports/glowlab-jamsil-2026-08.html) | **예시 리포트** — 잠실점 팝업 Standard + 검증 | 12개 섹션: 요약 · 퍼널/벤치마크 · 일별 · 구역 · 고객 인사이트(L3) · 미구매자 · 집품 미구매 SKU · 동선 · 처방(L4) · POS 검증(L5) · 차기 출점 · 방법론 |

## 디자인 원칙

- 발표자료(`deck/design.js`)와 같은 팔레트: 잉크 `#0E1420`, 롯데 레드 `#E11D2E`, 슬레이트 `#5E6979`. 글꼴은 Pretendard 우선, 없으면 Noto Sans KR(Google Fonts), 라벨·숫자는 IBM Plex Mono.
- 차트 색은 롯데 레드를 쓰지 않습니다. 데이터 계열은 파랑/주황(색각 검증된 조합), 퍼널은 파랑 단색 램프.
- 라이트/다크 모드 모두 지원 (`prefers-color-scheme` + `data-theme`).
- 모든 인사이트 문구는 `docs/02_business-model.md` §2 「브랜드가 모르는 자기 고객」 항목과 1:1로 대응합니다.

## 수치에 대한 경고

홈페이지·포털·리포트의 브랜드, 점포, 통행·전환·매출 수치는 **모두 가상의 예시**입니다. 리포트 안의 숫자는 서로 맞아떨어지도록 설계했지만(퍼널 → 일별 합계 → SKU 합계 → 주차별 검증), 실제 롯데 내부 데이터가 아닙니다. 발표 시 "예시 리포트"임을 반드시 언급하십시오.

## 수정 방법

- 홈페이지 문구·요금: `index.html` 안의 해당 섹션 텍스트를 직접 수정.
- 리포트 일별 차트 데이터: `glowlab-jamsil-2026-08.html` 하단 `<script>`의 `traffic` / `entries` 배열.
- 새 리포트 추가: 예시 리포트를 복사해 `portal/reports/`에 두고, `portal/index.html` 리포트 표에 행 추가.
