/**
 * 넛츠 현장 조사용 구글 폼 생성 스크립트
 * ============================================================
 * script.google.com 에서 "내 계정으로" 한 번 실행하면
 * 아래 두 개가 본인 구글 드라이브에 생성됩니다.
 *
 *   ① 관찰 기록 폼   — 팀원 6명이 매일 3회 네이버 예약 잔여 슬롯을 찍는 폼
 *   ② 사장님 설문 폼 — 인스타 DM 으로 보낼 3분 설문 (로그인 없이 응답)
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
var FORM2_TITLE = '넛츠 · 예약 공실 관련 설문 (사장님용)';

/* ────────────────────────────────────────────────────────────
   실행 — 이 함수 하나만 돌리면 됩니다
   ──────────────────────────────────────────────────────────── */

function 전체생성() {
  var ss = SpreadsheetApp.create(SHEET_NAME);
  매장마스터시트만들기(ss);

  var f1 = 관찰기록폼만들기(ss);
  var f2 = 사장님설문폼만들기(ss);

  안내시트만들기(ss, f1, f2);

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
  Logger.log(msg);
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
      r.withItemResponse(f1.기록자.asListItem().createResponse(name));
      r.withItemResponse(f1.회차.asMultipleChoiceItem().createResponse(round));
      rows.push([name, round, r.toPrefilledUrl()]);
    });
  });
  return rows;
}

/* ────────────────────────────────────────────────────────────
   ② 사장님 설문 폼 (인스타 DM 발송용)
   ──────────────────────────────────────────────────────────── */

function 사장님설문폼만들기(ss) {
  var form = FormApp.create(FORM2_TITLE);

  form.setDescription(
    [
      '안녕하세요 원장님. 롯데 MBA 과정에서 "예약 서비스업의 비는 시간"을 주제로 연구 중인 학생입니다.',
      '',
      '영업이나 홍보 목적이 전혀 아니며, 답변은 익명으로 처리해 과제 발표에만 사용합니다.',
      '문항은 8개, 1~2분이면 끝납니다. 로그인 없이 바로 응답하실 수 있습니다.',
      '',
      '끝까지 답해 주신 분께는 작은 기프티콘을 보내드리고, 원하시면 결과 요약본도 보내드립니다.',
    ].join('\n')
  );

  기본설정(form);
  form.setConfirmationMessage(
    '답변 감사합니다. 기프티콘은 영업일 기준 3일 안에 보내드리겠습니다.\n연락처는 발송 후 폐기합니다.'
  );

  form
    .addMultipleChoiceItem()
    .setTitle('1. 운영하시는 업종은 무엇인가요?')
    .setChoiceValues(['네일 · 페디큐어', '속눈썹 · 왁싱', '헤어', '마사지 · 스파', '피부관리 · 에스테틱'])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('2. 지난 한 달, 당일 예약 취소가 대략 몇 건이었나요?')
    .setHelpText('정확하지 않아도 괜찮습니다. 감으로 답해 주세요.')
    .setChoiceValues(['0건', '1~3건', '4~10건', '11~20건', '21건 이상'])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('3. 하루 평균, 예약이 차지 않아 비는 시간이 얼마나 되나요?')
    .setChoiceValues(['거의 없음', '1시간 이하', '1~3시간', '3~5시간', '5시간 이상'])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('4. 그렇게 비어버린 자리를 30~40% 할인해서라도 채울 생각이 있으신가요?')
    .setChoiceValues(['예, 채우고 싶습니다', '조건이 맞으면 가능합니다', '아니요, 생각 없습니다'])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle('5. 4번에서 "조건부" 또는 "아니요"를 고르셨다면, 이유나 조건을 알려주세요.')
    .setHelpText('이 답이 저희에게 가장 도움이 됩니다. 한 줄이면 충분합니다.');

  form
    .addMultipleChoiceItem()
    .setTitle('6. "기존 단골에게는 그 할인 자리가 보이지 않는다"면, 결정이 달라지시나요?')
    .setChoiceValues([
      '네, 그게 조건입니다',
      '조금 낫지만 결정적이진 않습니다',
      '상관없습니다',
    ])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('7. 지금 매장에서 쓰시는 예약 · 결제 · 정산 앱은 몇 개인가요?')
    .setChoiceValues(['없음', '1~2개', '3~4개', '5개 이상'])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('8. 앱을 새로 설치하지 않고, 문자 한 줄로 빈 자리를 올릴 수 있다면 해보실 의향이 있나요?')
    .setHelpText('예) "오늘 3시 비었음" 이라고 회신하면 등록되는 방식')
    .setChoiceValues(['해보겠습니다', '잘 모르겠습니다', '하지 않겠습니다'])
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('기프티콘 받으실 휴대폰 번호 (선택)')
    .setHelpText('기프티콘 발송에만 쓰고 발송 후 폐기합니다. 적지 않으셔도 응답은 제출됩니다.');

  form
    .addTextItem()
    .setTitle('결과 요약본을 받으실 이메일 (선택)')
    .setHelpText('동종 업계 응답을 정리해 보내드립니다.');

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
