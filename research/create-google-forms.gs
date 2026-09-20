/**
 * 넛츠 현장 조사용 구글 폼 생성 스크립트
 * ============================================================
 * script.google.com 에서 "내 계정으로" 한 번 실행하면
 * 아래 두 개가 본인 구글 드라이브에 생성됩니다.
 *
 *   ① 관찰 기록 폼   — 팀원 6명이 매일 3회 네이버 예약 잔여 슬롯을 찍는 폼
 *   ② 사장님 설문 폼 — 인스타 DM 으로 보낼 17문항 설문 (로그인 없이 응답, 1~2분)
 *
 * 두 폼의 응답은 모두 "넛츠 현장조사 응답" 스프레드시트 한 곳에 모입니다.
 * 실행한 계정이 소유자가 되므로, 응답도 그 계정으로 들어옵니다.
 *
 * 실행 방법은 research/README.md 참고.
 */

/* ────────────────────────────────────────────────────────────
   설정 — 여기만 고치면 됩니다
   ──────────────────────────────────────────────────────────── */

var TEAM = ['이강호', '이민호', '손경필', '최종락', '한재익', '조정윤'];

var ROUNDS = ['10:00 회차', '14:00 회차', '17:00 회차'];

/** 관찰 대상 매장 수. 코드는 N01 … N50 으로 자동 생성되고,
 *  실제 매장명은 생성된 스프레드시트의 '매장 마스터' 탭에서 채웁니다. */
var SHOP_COUNT = 50;

var SHEET_NAME = '넛츠 현장조사 응답';
var FORM1_TITLE = '넛츠 · 관찰 기록 (네이버 예약 잔여 슬롯)';
var FORM2_TITLE = '예약 취소 · 공실 시간에 대한 사장님 설문 (1~2분)';

/* ────────────────────────────────────────────────────────────
   실행 — 이 함수 하나만 돌리면 됩니다
   ──────────────────────────────────────────────────────────── */

function 전체생성() {
  var ss = SpreadsheetApp.create(SHEET_NAME);
  매장마스터시트만들기(ss);

  var f1 = 관찰기록폼만들기(ss);
  var f2 = 사장님설문폼만들기(ss);

  var msg = [
    '',
    '===== 생성 완료 =====',
    '',
    '[응답 스프레드시트]',
    ss.getUrl(),
    '',
    '[① 관찰 기록 폼]',
    '  응답용 : ' + f1.form.getPublishedUrl(),
    '  편집용 : ' + f1.form.getEditUrl(),
    '',
    '[② 사장님 설문 폼]',
    '  응답용 : ' + f2.getPublishedUrl(),
    '  편집용 : ' + f2.getEditUrl(),
    '',
    '링크는 스프레드시트의 "안내" 탭에도 적어 두었습니다.',
    '',
  ].join('\n');

  // 링크는 먼저 찍는다. 뒤에서 무슨 일이 생겨도 이건 남는다.
  Logger.log(msg);

  // 안내 시트는 있으면 편한 것일 뿐이라, 실패해도 폼까지 버리지 않는다.
  try {
    안내시트만들기(ss, f1, f2);
  } catch (e) {
    Logger.log('안내 시트를 쓰는 중 문제가 있었습니다. 폼과 스프레드시트는 정상입니다: ' + e);
  }
  return msg;
}

/* ────────────────────────────────────────────────────────────
   ① 관찰 기록 폼
   ──────────────────────────────────────────────────────────── */

function 관찰기록폼만들기(ss) {
  var form = FormApp.create(FORM1_TITLE);

  form.setDescription(
    [
      '네이버 예약 화면을 보고 "오늘 남아 있는 예약 가능 슬롯"을 기록합니다.',
      '',
      '· 기록 시각은 10:00 / 14:00 / 17:00, 앞뒤 15분을 넘기면 그 회차는 건너뜁니다.',
      '· 한 번 제출 = 한 매장. 제출 후 "다른 응답 제출"을 눌러 다음 매장으로 넘어가세요.',
      '· 휴무이거나 화면을 못 봤으면 반드시 그렇게 기록하세요. 빈칸을 0으로 세면 안 됩니다.',
    ].join('\n')
  );

  기본설정(form);
  form.setShowLinkToRespondAgain(true);
  form.setConfirmationMessage('기록됐습니다. 아래 "다른 응답 제출"로 다음 매장을 이어서 찍으세요.');

  var 기록자 = form.addListItem().setTitle('기록자').setChoiceValues(TEAM).setRequired(true);

  var 회차 = form
    .addMultipleChoiceItem()
    .setTitle('관찰 회차')
    .setChoiceValues(ROUNDS)
    .setRequired(true);

  form
    .addListItem()
    .setTitle('매장 코드')
    .setHelpText('코드와 실제 매장명은 응답 스프레드시트의 "매장 마스터" 탭에 있습니다.')
    .setChoiceValues(매장코드목록())
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('관찰 상태')
    .setChoiceValues(['정상 관찰', '휴무일', '예약창 없음 / 예약 중단', '접속 불가 · 페이지 오류'])
    .setRequired(true);

  var 숫자만 = FormApp.createTextValidation()
    .setHelpText('숫자만 입력하세요 (0 이상)')
    .requireNumberGreaterThanOrEqualTo(0)
    .build();

  form
    .addTextItem()
    .setTitle('오늘 남아 있는 예약 가능 슬롯 수')
    .setHelpText('지금 시각 이후, 오늘 안에 예약할 수 있는 시간대의 개수. 휴무·관찰 불가면 비워 두세요.')
    .setValidation(숫자만);

  form
    .addTextItem()
    .setTitle('남아 있는 시간대')
    .setHelpText('쉼표로 구분해 적어 주세요. 예) 14:00, 15:30, 17:00 — 당일 취소를 잡아내는 핵심 데이터입니다.');

  form
    .addTextItem()
    .setTitle('특이사항')
    .setHelpText('예) 오전엔 없던 15:00 자리가 새로 열림 / 가격이 바뀜 / 임시 휴무 공지');

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  return { form: form, 기록자: 기록자, 회차: 회차 };
}

/** 기록자·회차가 미리 채워진 링크 18개 (6명 × 3회차).
 *  팀원에게 각자 자기 링크 3개만 주면 매번 고를 필요가 없습니다. */
function 미리채운링크(f1) {
  var rows = [['기록자', '회차', '미리 채워진 링크']];
  TEAM.forEach(function (name) {
    ROUNDS.forEach(function (round) {
      var r = f1.form.createResponse();
      r.withItemResponse(f1.기록자.createResponse(name));
      r.withItemResponse(f1.회차.createResponse(round));
      rows.push([name, round, r.toPrefilledUrl()]);
    });
  });
  return rows;
}

/* ────────────────────────────────────────────────────────────
   ② 사장님 설문 폼 (인스타 DM 발송용)
   ──────────────────────────────────────────────────────────── */

/** 설문을 보내는 사람을 한 줄로 소개합니다.
 *  DM 을 보내는 분이 실제로 그렇게 말할 수 있는 문장이어야 합니다.
 *  다른 팀원이 보낼 때는 그분의 사정에 맞게 이 한 줄만 고치면 됩니다. */
var 소개 = '다니던 회사를 그만두고 개인 사업을 준비하고 있는 워킹맘';

function 사장님설문폼만들기(ss) {
  var form = FormApp.create(FORM2_TITLE);

  form.setDescription(
    [
      '안녕하세요, 원장님. 귀한 시간 내어 주셔서 감사합니다.',
      '',
      '예약을 받아 운영하시는 가게의 노쇼와 당일 취소, 그리고 비는 시간에 대해 여쭙습니다.',
      '1~2분이면 되고, 대부분 고르기만 하시면 됩니다.',
      '',
      '답변은 익명으로 처리되며 통계 목적 외에는 사용하지 않습니다.',
      '끝까지 답해 주신 분께는 작은 기프티콘을 보내드립니다.',
    ].join('\n')
  );

  기본설정(form);
  form.setConfirmationMessage(
    [
      '소중한 답변 감사드립니다.',
      '',
      '기프티콘은 영업일 기준 3일 안에 보내드리겠습니다.',
      '남겨 주신 연락처는 발송 후 폐기합니다.',
      '',
      '원장님의 답변이 제게 정말 큰 도움이 됩니다. 감사합니다.',
    ].join('\n')
  );

  /* ── 1. 매장에 대해 ─────────────────────────────── */
  form
    .addSectionHeaderItem()
    .setTitle('1. 매장에 대해 여쭙겠습니다')
    .setHelpText('통계를 나누는 데만 씁니다. 매장을 특정하지 않습니다.');

  form
    .addMultipleChoiceItem()
    .setTitle('Q1. 운영하시는 업종은 무엇인가요?')
    .setChoiceValues(['네일 · 페디큐어', '속눈썹 · 왁싱', '헤어', '마사지 · 스파', '피부관리 · 에스테틱'])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Q2. 매장 규모는 어떻게 되시나요?')
    .setChoiceValues(['원장님 혼자 (1인샵)', '2~3인', '4인 이상'])
    .setRequired(true);

  form
    .addCheckboxItem()
    .setTitle('Q3. 예약은 주로 어디로 받으시나요? (복수 선택 가능)')
    .setChoiceValues([
      '전화',
      '인스타그램 DM',
      '네이버 예약',
      '카카오톡 채널',
      '캐치테이블 등 예약 앱',
      '따로 예약 없이 방문 순서대로',
    ])
    .showOtherOption(true)
    .setRequired(true);

  /* ── 2. 노쇼와 당일 취소 (핵심) ───────────────────── */
  form
    .addSectionHeaderItem()
    .setTitle('2. 노쇼와 당일 취소에 대해 여쭙겠습니다')
    .setHelpText(
      [
        '제가 가장 궁금해하는 부분입니다.',
        '정확한 숫자가 아니어도 괜찮습니다. 대략의 감으로 적어 주시면 충분합니다.',
        '',
        '예) 일주일에 30건쯤 받는데 노쇼가 2건, 당일 취소가 4건 정도 → 30 / 2 / 4',
      ].join('\n')
    );

  var 숫자만 = FormApp.createTextValidation()
    .setHelpText('숫자만 적어 주세요 (0 도 괜찮습니다)')
    .requireNumberGreaterThanOrEqualTo(0)
    .build();

  form
    .addTextItem()
    .setTitle('Q4. 일주일에 예약을 대략 몇 건쯤 받으시나요?')
    .setHelpText('숫자만 적어 주세요. 예) 30')
    .setValidation(숫자만)
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('Q5. 그중 노쇼 — 예약해 놓고 연락 없이 안 오시는 경우는 몇 건인가요?')
    .setHelpText('일주일 기준입니다. 없으시면 0 을 적어 주세요.')
    .setValidation(숫자만)
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('Q6. 그중 당일 취소 — 당일에 연락 주고 취소하시는 경우는 몇 건인가요?')
    .setHelpText('일주일 기준입니다. 없으시면 0 을 적어 주세요.')
    .setValidation(숫자만)
    .setRequired(true);

  form
    .addCheckboxItem()
    .setTitle('Q7. 예약이 잘 차지 않는 시간대는 언제인가요? (복수 선택 가능)')
    .setChoiceValues([
      '평일 오전',
      '평일 점심~오후',
      '평일 저녁',
      '주말 오전',
      '주말 오후~저녁',
      '특별히 비는 시간대는 없습니다',
    ])
    .setRequired(true);

  form
    .addCheckboxItem()
    .setTitle('Q8. 지금은 자리가 갑자기 비면 어떻게 하시나요? (복수 선택 가능)')
    .setChoiceValues([
      '그냥 비워 둡니다',
      '인스타그램 · SNS 에 올립니다',
      '단골 손님께 직접 연락드립니다',
      '워크인(예약 없이 오시는 손님)을 기다립니다',
      '다른 업무나 휴식 시간으로 씁니다',
    ])
    .showOtherOption(true)
    .setRequired(true);

  /* ── 3. 서비스 이용 의향 ─────────────────────────── */
  form
    .addSectionHeaderItem()
    .setTitle('3. 이런 서비스라면 어떠실지 여쭙겠습니다')
    .setHelpText(
      [
        '제가 만들어 보려는 것은 이런 서비스입니다.',
        '',
        '비어버린 자리를 올려 두시면 → 30분 안에 도착할 수 있는 손님에게만 보이고',
        '→ 정가보다 낮은 가격으로, 그 자리에서 바로 예약과 결제가 이뤄집니다.',
        '',
        '편하신 대로 솔직하게 답해 주시는 것이 제게 가장 도움이 됩니다.',
      ].join('\n')
    );

  form
    .addMultipleChoiceItem()
    .setTitle('Q9. 그냥 두면 0원이 될 자리를, 정가보다 조금 낮은 가격에라도 채우실 의향이 있으신가요?')
    .setChoiceValues([
      '네, 채우고 싶습니다',
      '조건이 맞으면 해보겠습니다',
      '아니요, 생각이 없습니다',
    ])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Q10. 가능하시다면, 할인은 어느 정도까지 생각해 보실 수 있을까요?')
    .setChoiceValues([
      '할인 없이 정가만',
      '10% 정도',
      '20% 정도',
      '30% 정도',
      '40% 이상도 가능',
    ])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Q11. 자리가 비었을 때, 최소 몇 분 뒤에 오시는 손님부터 받으실 수 있나요?')
    .setHelpText('정리·세팅에 걸리는 시간을 포함해서요.')
    .setChoiceValues(['바로 가능합니다', '30분 뒤부터', '1시간 뒤부터', '2시간 이상은 필요합니다'])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Q12. 기존 단골 손님께는 그 할인 자리가 보이지 않는다면, 결정이 달라지실까요?')
    .setHelpText('단골 손님이 정가를 내지 않게 되는 일은 저도 막고 싶습니다.')
    .setChoiceValues([
      '네, 그게 꼭 필요한 조건입니다',
      '조금 낫지만 결정적이지는 않습니다',
      '상관없습니다',
    ])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle('Q13. Q9에서 "조건부" 또는 "아니요"를 고르셨다면, 그 이유나 조건을 알려주실 수 있을까요?')
    .setHelpText('이 답변이 제게 가장 큰 도움이 됩니다. 한 줄이면 충분합니다.');

  /* ── 4. 입점 조건 ───────────────────────────────── */
  form
    .addSectionHeaderItem()
    .setTitle('4. 입점 조건에 대해 여쭙겠습니다')
    .setHelpText(
      [
        '입점비와 월 구독료는 받지 않을 생각입니다.',
        '실제로 매출이 일어났을 때만 매출의 3%를 수수료로 받으려 합니다.',
        '리뷰가 좋은 우수 사업자께는 앱이 쿠폰을 지원해 드릴 계획입니다.',
      ].join('\n')
    );

  form
    .addMultipleChoiceItem()
    .setTitle('Q14. 입점비 0원, 매출의 3% 수수료 조건이라면 사업자로 등록해 보실 의향이 있으신가요?')
    .setChoiceValues([
      '네, 등록하겠습니다',
      '조건을 좀 더 보고 정하겠습니다',
      '아니요, 등록하지 않겠습니다',
    ])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Q15. 솔직히 여쭙습니다. 수수료가 몇 %까지면 받아들일 만하신가요?')
    .setChoiceValues(['3%', '5%', '7%', '10%', '수수료를 받는다면 쓰지 않겠습니다'])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Q16. 입점을 정하실 때 가장 크게 영향을 주는 것 하나를 고른다면 무엇일까요?')
    .setChoiceValues([
      '수수료가 얼마인가',
      '새로운 손님이 실제로 오는가',
      '단골에게 안 보이는 것이 보장되는가',
      '쿠폰 · 프로모션을 지원해 주는가',
      '정산이 편한가',
    ])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Q17. 앱을 새로 설치하지 않고, 문자 한 줄로 빈 자리를 올릴 수 있다면 어떠실까요?')
    .setHelpText('예) "오늘 3시 비었어요" 라고 회신하시면 등록되는 방식입니다.')
    .setChoiceValues(['그 방식이면 해보겠습니다', '잘 모르겠습니다', '그래도 하지 않겠습니다'])
    .setRequired(true);

  /* ── 5. 마무리 ──────────────────────────────────── */
  form
    .addSectionHeaderItem()
    .setTitle('5. 마지막입니다. 감사합니다')
    .setHelpText('아래 세 문항은 모두 선택이며, 적지 않으셔도 응답은 제출됩니다.');

  form
    .addParagraphTextItem()
    .setTitle('혹시 제게 더 해주고 싶으신 말씀이 있으실까요?')
    .setHelpText('쓴소리도 감사히 듣겠습니다.');

  form
    .addMultipleChoiceItem()
    .setTitle('추후 10분 정도 통화로 조금 더 여쭤봐도 괜찮으실까요?')
    .setChoiceValues(['네, 괜찮습니다', '아니요, 어렵습니다'])
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('기프티콘 받으실 휴대폰 번호 (선택)')
    .setHelpText('기프티콘 발송에만 사용하고 발송 후 폐기합니다.');

  form
    .addTextItem()
    .setTitle('결과 요약본 받으실 이메일 (선택)')
    .setHelpText('강남 지역 동종 업계 응답을 정리해 보내드립니다.');

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  return form;
}

/* ────────────────────────────────────────────────────────────
   공통
   ──────────────────────────────────────────────────────────── */

/** 로그인 없이 누구나 응답할 수 있게 하는 설정. */
function 기본설정(form) {
  form.setCollectEmail(false);          // 이메일 자동 수집 안 함
  form.setLimitOneResponsePerUser(false); // 한 사람이 여러 번 제출 가능
  form.setAllowResponseEdits(false);
  form.setProgressBar(false);

  // 회사(Workspace) 계정일 때만 있는 설정. 개인 계정에서는 예외가 나므로 그냥 넘어갑니다.
  try {
    form.setRequireLogin(false);
  } catch (e) {
    Logger.log('setRequireLogin 생략 (개인 계정에서는 원래 로그인이 필요 없습니다)');
  }
}

function 매장코드목록() {
  var out = [];
  for (var i = 1; i <= SHOP_COUNT; i++) {
    out.push('N' + (i < 10 ? '0' + i : '' + i));
  }
  return out;
}

function 매장마스터시트만들기(ss) {
  var sh = ss.insertSheet('매장 마스터');
  var head = [
    '코드', '매장명', '업종', '담당자', '등급', '하루 총 슬롯 수', '네이버 예약 링크', '메모',
  ];
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');

  var codes = 매장코드목록();
  var rows = codes.map(function (c) {
    return [c, '', '', '', '', '', '', ''];
  });
  sh.getRange(2, 1, rows.length, head.length).setValues(rows);

  // 등급은 "잘되는 집 / 보통" 으로만 나눕니다. 표본이 한쪽으로 쏠렸는지 볼 때 씁니다.
  var 등급 = SpreadsheetApp.newDataValidation()
    .requireValueInList(['잘되는 집', '보통'], true)
    .build();
  sh.getRange(2, 5, rows.length, 1).setDataValidation(등급);

  var 담당 = SpreadsheetApp.newDataValidation().requireValueInList(TEAM, true).build();
  sh.getRange(2, 4, rows.length, 1).setDataValidation(담당);

  sh.setFrozenRows(1);
  sh.setColumnWidth(2, 200);
  sh.setColumnWidth(7, 260);
  return sh;
}

function 안내시트만들기(ss, f1, f2) {
  var sh = ss.insertSheet('안내', 0);
  var rows = [
    ['넛츠 현장조사 — 링크와 규칙'],
    [''],
    ['① 관찰 기록 폼 (팀원용)'],
    ['응답', f1.form.getPublishedUrl()],
    ['편집', f1.form.getEditUrl()],
    [''],
    ['② 사장님 설문 폼 (DM 발송용)'],
    ['응답', f2.getPublishedUrl()],
    ['편집', f2.getEditUrl()],
    [''],
    ['관찰 규칙'],
    ['1', '기록 시각은 10:00 / 14:00 / 17:00. 앞뒤 15분을 넘기면 그 회차는 건너뛴다.'],
    ['2', '한 번 제출 = 한 매장. 제출 후 "다른 응답 제출"로 이어서 찍는다.'],
    ['3', '휴무 · 접속 불가는 반드시 그렇게 기록한다. 빈칸을 0으로 세지 않는다.'],
    ['4', '오전에 막혀 있던 시간대가 오후에 다시 열리면 = 당일 취소 1건으로 본다 (추정).'],
    ['5', '매장을 도중에 바꾸지 않는다. 표본이 흔들리면 2주가 통째로 날아간다.'],
    [''],
    ['미리 채워진 링크 (기록자 · 회차가 채워진 상태로 열립니다)'],
  ];
  sh.getRange(1, 1, rows.length, 2).setValues(
    rows.map(function (r) {
      return [r[0] || '', r[1] || ''];
    })
  );
  sh.getRange(1, 1).setFontSize(14).setFontWeight('bold');

  var links = 미리채운링크(f1);
  sh.getRange(rows.length + 1, 1, links.length, 3).setValues(links);
  sh.getRange(rows.length + 1, 1, 1, 3).setFontWeight('bold');

  sh.setColumnWidth(1, 120);
  sh.setColumnWidth(2, 420);
  sh.setColumnWidth(3, 520);

  var 기본 = ss.getSheetByName('시트1') || ss.getSheetByName('Sheet1');
  if (기본) ss.deleteSheet(기본);
  return sh;
}
