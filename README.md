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
| [docs/02_business-model.md](docs/02_business-model.md) | 상품 설계(6단 솔루션 사다리) + 5단 수익구조, 단가, 원가 |
| [docs/03_financials.md](docs/03_financials.md) | 3개년 손익 추정, BEP, CAPEX, 민감도 |
| [docs/04_pitch-10min.md](docs/04_pitch-10min.md) | 10분 발표 구성 + 대본 — **비즈니스 모델 캔버스 9블록 순서**, 정확히 600초 |
| [docs/05_qna-prep.md](docs/05_qna-prep.md) | 예상 질문 16개와 답변 (Q13·Q14 그룹 전략·핵심가치 / **Q15 비회원 커버리지 · Q16 왜 더 깊게 안 하나**) |
| [docs/06_action-plan.md](docs/06_action-plan.md) | 발표 전까지 확인·제작해야 할 항목 |
| [docs/07_business-model-canvas.md](docs/07_business-model-canvas.md) | **비즈니스 모델 캔버스 9블록** — Step 1 가치 전달(01~05) → Step 2 효율적 운영(06~09) |
| [docs/08_lotte-strategy-fit.md](docs/08_lotte-strategy-fit.md) | **그룹 비전·경영 방침·핵심가치와의 정합성** — 발표 3번 슬라이드 근거 |
| [docs/financial_model.csv](docs/financial_model.csv) | 손익 추정 원본 데이터 |
| **[LGA_롯데신사업_발표.pdf](LGA_롯데신사업_발표.pdf)** | **PDF — 글꼴이 파일 안에 박혀 있어 어느 PC에서나 똑같이 보입니다. 발표는 이걸 쓰는 게 가장 안전합니다** |
| **[LGA_롯데신사업_발표.pptx](LGA_롯데신사업_발표.pptx)** | **발표용 PPT 15장 + 백업 1장 — BMC 9블록 순서 + 그룹 전략 정합성 1장, 전 슬라이드에 대본 노트 포함.** 글꼴 Pretendard |
| [LGA_롯데신사업_발표_맑은고딕.pptx](LGA_롯데신사업_발표_맑은고딕.pptx) | **같은 내용의 안전 글꼴 버전** — 발표 PC에 Pretendard가 없을 때 이걸 쓰십시오 |
| [deck/build.js](deck/build.js) | 위 PPT를 생성하는 스크립트 (문구·수치 수정 후 재생성 가능) |
| [deck/design.js](deck/design.js) | **디자인 시스템** — 타입 스케일·줄간격·그리드·자동 높이·넘침 검사 |
| [deck/notes.js](deck/notes.js) | 발표 대본 16개 (합계 600초) |

## ⚠️ 숫자에 대한 경고

본 문서의 모든 재무 수치는 **공개정보와 업계 통상치를 근거로 한 가정값**입니다.
롯데 내부 실제 데이터(연간 팝업 건수, L.POINT 결합 가능 범위, POS 연동 범위, CCTV 사양)로
**반드시 검증 후 발표**하십시오. 검증 필요 항목은 각 문서에 `[검증필요]` 로 표시했습니다.

같은 이유로, 발표 3번 슬라이드의 **그룹 비전·핵심가치·경영 방침 문구도 사내 최신 공식 표현과 대조**하십시오.
표현이 다르면 `deck/build.js`의 3번 슬라이드 문구만 고치고 다시 빌드하면 됩니다.
