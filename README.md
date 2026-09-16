# 롯데 신사업 제안 — 오프라인 리테일 행동데이터 플랫폼

롯데그룹 핵심인재 MBA 과정 최종 발표 자료 저장소.

## 제안 개요

**한 줄 정의**: 온라인에 GA(Google Analytics)가 있다면, 오프라인 매장에는 **L.GA**가 있다.
롯데가 이미 보유한 CCTV 인프라 + L.POINT 회원데이터 + POS 결제데이터를 결합해
**"구매하지 않은 고객의 여정"** 을 데이터화해, 입점 브랜드에게
**① 성과 리포트 ② 고객 정체·니즈 인사이트 ③ 실행 가능한 개선 처방 ④ 효과 검증**까지 제공하는 솔루션.

**핵심 주장**: 브랜드는 자기 매장 안만 안다. 롯데는 그 고객의 소비 생애 전체를 안다.
우리는 **브랜드가 절대 스스로 알 수 없는 자기 고객의 정체와 니즈**를 알려주고,
**그 처방이 실제로 통했는지 POS로 증명**한다.

**입구(무상 티저)**: 계약 전에는 **유입률 좋은 스팟 3곳과 그 평균 유입률**만 무상으로 엽니다.
구매 전환율·방문객 정체·미구매자 분석은 **팝업 패키지·구독·해당 매장 L.GA 운영 시** 열립니다.
유입률은 **공간(롯데 자산)의 지표**라 공개할 수 있고, 전환율은 **그 브랜드의 성과**이기 때문입니다.

**그룹 전략 정합성**: 결제한 순간에만 쌓이던 고객 가치를 사지 않은 순간까지 넓히는
**Lifetime Value Creator의 데이터 실행**이자, 이미 깔린 CCTV 위에 AI를 얹는 **AI 트랜스포메이션** 과제,
그리고 상품을 파는 유통에서 데이터를 파는 **뉴라이프플랫폼**으로의 전환입니다.
핵심가치 4개(Beyond Customer Expectation · Challenge · Respect · Originality)는
슬라이드 장식이 아니라 **상품 범위·프라이버시 설계·지표 정의를 실제로 바꾼 설계 원칙**입니다.
→ [docs/08_lotte-strategy-fit.md](docs/08_lotte-strategy-fit.md)

## 문서 구성

| 문서 | 내용 |
|---|---|
| [docs/01_gap-analysis.md](docs/01_gap-analysis.md) | 현재 기획에서 **놓치고 있는 8가지**와 디벨롭 방향 |
| [docs/02_business-model.md](docs/02_business-model.md) | 상품 설계(L0 티저 + 6단 솔루션 사다리) + 5단 수익구조, 단가, 원가 |
| [docs/03_financials.md](docs/03_financials.md) | 3개년 손익 추정, BEP, CAPEX, 민감도 |
| [docs/04_pitch-10min.md](docs/04_pitch-10min.md) | 10분 발표 구성 + 대본 — **IR 덱 표준 9블록 순서**(Problem → Solution → Market → BM → Traction → Team → Ask), 정확히 600초 |
| [docs/05_qna-prep.md](docs/05_qna-prep.md) | 예상 질문 16개와 답변 (Q13·Q14 그룹 전략·핵심가치 / **Q15 비회원 커버리지 · Q16 왜 더 깊게 안 하나 · Q17 유입률 무상 공개**) |
| [docs/06_action-plan.md](docs/06_action-plan.md) | 발표 전까지 확인·제작해야 할 항목 |
| [docs/07_business-model-canvas.md](docs/07_business-model-canvas.md) | 비즈니스 모델 캔버스 9블록 — 사업 구조 정리용 (발표 순서는 IR 표준을 따릅니다) |
| [docs/08_lotte-strategy-fit.md](docs/08_lotte-strategy-fit.md) | **그룹 비전·경영 방침·핵심가치와의 정합성** — Market ②(7번) · 백업 B2 근거 |
| [docs/financial_model.csv](docs/financial_model.csv) | 손익 추정 원본 데이터 |
| **[LGA_롯데신사업_발표.pdf](LGA_롯데신사업_발표.pdf)** | **PDF — 글꼴이 파일 안에 박혀 있어 어느 PC에서나 똑같이 보입니다. 발표는 이걸 쓰는 게 가장 안전합니다** |
| **[LGA_롯데신사업_발표.pptx](LGA_롯데신사업_발표.pptx)** | **발표용 PPT 본편 15장 + 백업 4장 — IR 덱 표준 9블록 순서, 전 슬라이드에 대본 노트 포함.** 글꼴 Pretendard |
| [LGA_롯데신사업_발표_맑은고딕.pptx](LGA_롯데신사업_발표_맑은고딕.pptx) | **같은 내용의 안전 글꼴 버전** — 발표 PC에 Pretendard가 없을 때 이걸 쓰십시오 |
| **[site/index.html](site/index.html)** | **L.GA 홈페이지 시안** (메이아이 구조 참고) + **[파트너 포털](site/portal/index.html)** + **[예시 리포트](site/portal/reports/glowlab-jamsil-2026-08.html)** — 브라우저로 바로 열립니다. 설명: [site/README.md](site/README.md) |
| [deck/build.js](deck/build.js) | 위 PPT를 생성하는 스크립트 (문구·수치 수정 후 재생성 가능) |
| [deck/design.js](deck/design.js) | **디자인 시스템** — 타입 스케일·줄간격·그리드·자동 높이·넘침 검사 |
| [deck/notes.js](deck/notes.js) | 발표 대본 19개 (본편 15장 합계 600초 + 백업 4장) |

## ⚠️ 숫자에 대한 경고

본 문서의 모든 재무 수치는 **공개정보와 업계 통상치를 근거로 한 가정값**입니다.
롯데 내부 실제 데이터(연간 팝업 건수, L.POINT 결합 가능 범위, POS 연동 범위, CCTV 사양)로
**반드시 검증 후 발표**하십시오. 검증 필요 항목은 각 문서에 `[검증필요]` 로 표시했습니다.

**Market ①(6번)의 TAM·SAM·SOM 입력값은 특히 확인이 필요합니다.** 롯데 유통군 약 55개점 × 점당 200브랜드 ≈ 1.1만 매장, 국내 전체는 그 3배 — 이 두 개는 공개 자료 없이 세운 가정입니다.
산식은 슬라이드에 그대로 노출돼 있으니 입력값만 바꾸면 됩니다 (`deck/build.js` 6번 슬라이드 `MKT` 배열과 각주).

같은 이유로, Market ②(7번)와 백업 B2의 **그룹 비전·핵심가치·경영 방침 문구도 사내 최신 공식 표현과 대조**하십시오.
표현이 다르면 `deck/build.js`의 해당 슬라이드 문구만 고치고 다시 빌드하면 됩니다.

## 발표 구성 — IR 덱 표준 9블록

| # | 블록 | 슬라이드 | 초 |
|---|---|---|---:|
| 1 | First page | CVP — 온라인 GA ↔ 오프라인 L.GA | 40 |
| 2~3 | Problem | 97명 소멸 · 타겟 고객 · 왜 못 풀었나 | 110 |
| 4~5 | Solution | 브랜드가 모르는 자기 고객 5가지 · POS 검증 | 110 |
| 6~7 | Market | TAM·SAM·SOM · Why Now / KSF | 60 |
| 8~10 | Business models | 5단 수익 · **무상 티저 입구** · 이해관계자 도식 + 채널 | 140 |
| 11~12 | Traction | 3개년 손익 · 로드맵 + 판정 기준 | 60 |
| 13 | Team | 3사 합작 TF · 42명 | 20 |
| 14 | Ask | 파일럿 1.5억 · 3사 협약 · 법무 검토 | 40 |
| 15 | Last page | 미션 | 20 |
| B1~B4 | 백업 | 숫자의 근거 · 프라이버시 · 리스크 · 원가 | – |

표준의 300초 배분을 10분에 맞춰 2배로 늘린 값이며, Traction은 실적이 없는 신사업이라 표준이 허용하는 **"목표점"** 으로 채웠습니다.
