/* ============================================================
   넛츠 NUTS — 시드 데이터 (강남구)
   ------------------------------------------------------------
   매장 레코드의 `naver` 블록은 네이버 지역검색(Local Search) API의
   응답 항목과 같은 필드 이름을 씁니다 (title · category · address ·
   roadAddress · telephone · mapx · mapy · link).
   → 실제 API 키를 넣으면 server.js 가 같은 형태로 채워 줍니다.

   ⚠ 아래 매장·가격·리뷰 수는 프로토타입용 샘플입니다.
   위치(동·도로명)는 실제 강남구 지리를 따르지만 상호는 가상입니다.
   슬롯 시각은 `in` (지금부터 n분 뒤) 으로 적어 두고 앱이 실시간으로 계산합니다.
   ============================================================ */
window.NUTS_SEED = {

  /* 내 위치 프리셋 — 강남구 생활권 */
  areas: [
    { id:"gangnam",   name:"강남역",          lat:37.4979, lng:127.0276, demand:2 },
    { id:"yeoksam",   name:"역삼역",          lat:37.5006, lng:127.0366, demand:1 },
    { id:"seolleung", name:"선릉역",          lat:37.5045, lng:127.0490, demand:1 },
    { id:"samseong",  name:"삼성역 · 코엑스",  lat:37.5088, lng:127.0631, demand:1 },
    { id:"sinsa",     name:"신사역 · 가로수길", lat:37.5169, lng:127.0203, demand:2 },
    { id:"nonhyeon",  name:"논현역",          lat:37.5110, lng:127.0214, demand:0 },
    { id:"hakdong",   name:"학동역",          lat:37.5145, lng:127.0316, demand:0 },
    { id:"apgujeong", name:"압구정로데오",     lat:37.5273, lng:127.0402, demand:1 },
    { id:"cheongdam", name:"청담역",          lat:37.5194, lng:127.0533, demand:0 },
    { id:"daechi",    name:"대치동",          lat:37.4946, lng:127.0627, demand:0 },
  ],

  /* 업종 — 사업정리 7.2장 1단계 카테고리 (Tier 1 + Tier 1 보조) */
  categories: {
    nail:    { name:"네일",     short:"네일샵",  color:"#E4487F", tier:"Tier 1",      naver:"생활,편의>네일샵" },
    hair:    { name:"헤어",     short:"헤어샵",  color:"#E8622A", tier:"Tier 1",      naver:"생활,편의>미용실" },
    massage: { name:"마사지",   short:"마사지",  color:"#D9539B", tier:"Tier 1",      naver:"생활,편의>마사지,지압" },
    skin:    { name:"피부관리", short:"에스테틱", color:"#8E6BC4", tier:"Tier 1",      naver:"생활,편의>피부관리" },
    lash:    { name:"속눈썹",   short:"속눈썹",  color:"#7A4E9E", tier:"Tier 1",      naver:"생활,편의>속눈썹" },
    wax:     { name:"왁싱",     short:"왁싱",    color:"#2E9C8F", tier:"Tier 1 보조", naver:"생활,편의>왁싱" },
    scalp:   { name:"두피",     short:"두피클리닉", color:"#B5742C", tier:"Tier 1 보조", naver:"생활,편의>두피관리" },
    foot:    { name:"발관리",   short:"발관리",  color:"#3D8B5A", tier:"Tier 1 보조", naver:"생활,편의>발관리" },
    lotte:   { name:"롯데",     short:"롯데 파트너", color:"#DA291C", tier:"확장 시범", naver:"문화,예술>영화관" },
    treasure:{ name:"보물",     short:"보물찾기", color:"#6C8A3A", tier:"모객",        naver:"음식점>카페" },
  },

  /* 매장 — 오늘 비어 버린 자리를 올린 곳들 */
  stores: [
    { id:"s01", cat:"nail", name:"네일바이선", lat:37.4992, lng:127.0300, rating:4.8, visitor:124, blog:38,
      naver:{ address:"서울특별시 강남구 역삼동 823-12", roadAddress:"서울특별시 강남구 테헤란로8길 21 2층", telephone:"02-555-0101" },
      intro:"테헤란로 이면, 예약제로만 운영하는 1인 네일숍. 손 관리 위주.",
      tags:["직장인","데이트","근처 거주자"],
      menu:[ {name:"기본 케어", min:30, price:40000}, {name:"젤 원컬러", min:60, price:55000}, {name:"젤 제거 + 케어", min:45, price:45000} ],
      slots:[ {in:25, menu:0, min:20, max:45}, {in:85, menu:1, min:20, max:40} ] },

    { id:"s02", cat:"nail", name:"라운지네일 청담", lat:37.5238, lng:127.0470, rating:4.7, visitor:212, blog:91,
      naver:{ address:"서울특별시 강남구 청담동 88-7", roadAddress:"서울특별시 강남구 도산대로57길 14 3층", telephone:"02-511-0202" },
      intro:"청담 사거리 안쪽. 4석 운영, 당일 취소가 잦은 오후 슬롯을 올립니다.",
      tags:["데이트","웨딩 준비"],
      menu:[ {name:"젤 원컬러", min:60, price:60000}, {name:"아트 (2손가락)", min:80, price:80000} ],
      slots:[ {in:55, menu:0, min:25, max:45} ] },

    { id:"s03", cat:"nail", name:"소소네일", lat:37.5122, lng:127.0255, rating:4.6, visitor:88, blog:22,
      naver:{ address:"서울특별시 강남구 논현동 101-3", roadAddress:"서울특별시 강남구 학동로4길 9 1층", telephone:"02-544-0303" },
      intro:"논현역 뒷골목 동네 네일숍. 첫 방문 손님 환영.",
      tags:["근처 거주자","직장인"],
      menu:[ {name:"기본 케어", min:30, price:35000}, {name:"젤 원컬러", min:60, price:50000} ],
      slots:[ {in:40, menu:0, min:20, max:40}, {in:110, menu:1, min:20, max:40} ] },

    { id:"s04", cat:"hair", name:"살롱드포레", lat:37.5210, lng:127.0225, rating:4.9, visitor:341, blog:150, regular:true,
      naver:{ address:"서울특별시 강남구 신사동 534-9", roadAddress:"서울특별시 강남구 압구정로12길 33 2층", telephone:"02-542-0404" },
      intro:"가로수길 디자이너 4명 살롱. 커트·드라이 위주 슬롯.",
      tags:["데이트","직장인"],
      menu:[ {name:"커트", min:45, price:35000}, {name:"드라이", min:30, price:25000}, {name:"두피 클리닉", min:60, price:70000} ],
      slots:[ {in:30, menu:1, min:20, max:40}, {in:70, menu:0, min:20, max:40} ] },

    { id:"s05", cat:"hair", name:"헤어라운지 모노", lat:37.4968, lng:127.0345, rating:4.7, visitor:156, blog:47,
      naver:{ address:"서울특별시 강남구 역삼동 736-24", roadAddress:"서울특별시 강남구 역삼로17길 12 지하1층", telephone:"02-566-0505" },
      intro:"역삼동 직장인 단골이 많은 곳. 점심 직후 빈 슬롯이 자주 생깁니다.",
      tags:["직장인"],
      menu:[ {name:"남성 커트", min:30, price:28000}, {name:"여성 커트", min:45, price:38000}, {name:"드라이", min:25, price:22000} ],
      slots:[ {in:20, menu:0, min:25, max:50}, {in:65, menu:2, min:20, max:45} ] },

    { id:"s06", cat:"hair", name:"브릭헤어 삼성", lat:37.5115, lng:127.0600, rating:4.6, visitor:97, blog:31,
      naver:{ address:"서울특별시 강남구 삼성동 159-8", roadAddress:"서울특별시 강남구 봉은사로86길 6 2층", telephone:"02-568-0606" },
      intro:"코엑스 북쪽, 오피스 상권. 저녁 6시 이후 취소 슬롯 다수.",
      tags:["직장인","근처 거주자"],
      menu:[ {name:"커트", min:40, price:32000}, {name:"클리닉", min:60, price:65000} ],
      slots:[ {in:95, menu:0, min:20, max:40} ] },

    { id:"s07", cat:"massage", name:"힐링스파", lat:37.5020, lng:127.0395, rating:4.8, visitor:203, blog:77,
      naver:{ address:"서울특별시 강남구 역삼동 702-2", roadAddress:"서울특별시 강남구 테헤란로25길 20 4층", telephone:"02-501-0707" },
      intro:"역삼역 3번 출구. 1인실 6개, 당일 노쇼가 생기면 바로 올립니다.",
      tags:["직장인","데이트"],
      menu:[ {name:"전신 아로마", min:60, price:90000}, {name:"발 마사지", min:40, price:50000}, {name:"등·어깨 집중", min:30, price:40000} ],
      slots:[ {in:32, menu:1, min:25, max:45}, {in:75, menu:0, min:20, max:40} ] },

    { id:"s08", cat:"massage", name:"청담 타이테라피", lat:37.5262, lng:127.0430, rating:4.7, visitor:178, blog:64,
      naver:{ address:"서울특별시 강남구 청담동 21-4", roadAddress:"서울특별시 강남구 선릉로152길 27 2층", telephone:"02-517-0808" },
      intro:"압구정로데오 옆. 타이 전통 마사지, 60·90분 코스.",
      tags:["데이트","근처 거주자"],
      menu:[ {name:"타이 마사지 60분", min:60, price:80000}, {name:"타이 마사지 90분", min:90, price:110000} ],
      slots:[ {in:50, menu:0, min:25, max:45} ] },

    { id:"s09", cat:"massage", name:"몸편한집 강남", lat:37.4965, lng:127.0262, rating:4.5, visitor:64, blog:19,
      naver:{ address:"서울특별시 강남구 역삼동 819-3", roadAddress:"서울특별시 강남구 강남대로96길 12 5층", telephone:"02-558-0909" },
      intro:"강남역 10번 출구. 경락·스포츠 마사지.",
      tags:["직장인"],
      menu:[ {name:"경락 50분", min:50, price:70000}, {name:"스포츠 30분", min:30, price:45000} ],
      slots:[ {in:22, menu:1, min:30, max:50}, {in:100, menu:0, min:20, max:40} ] },

    { id:"s10", cat:"skin", name:"스킨랩 에스테틱", lat:37.5000, lng:127.0580, rating:4.8, visitor:143, blog:58,
      naver:{ address:"서울특별시 강남구 대치동 891-10", roadAddress:"서울특별시 강남구 삼성로64길 8 3층", telephone:"02-565-1010" },
      intro:"비의료 피부관리 전문. 수분·진정 관리 위주. (시술 없음)",
      tags:["데이트","근처 거주자"],
      menu:[ {name:"수분 관리", min:60, price:80000}, {name:"진정 관리", min:50, price:70000} ],
      slots:[ {in:60, menu:0, min:25, max:45} ] },

    { id:"s11", cat:"skin", name:"글로우룸 신사", lat:37.5185, lng:127.0250, rating:4.7, visitor:110, blog:40,
      naver:{ address:"서울특별시 강남구 신사동 520-6", roadAddress:"서울특별시 강남구 도산대로15길 22 2층", telephone:"02-540-1111" },
      intro:"가로수길 뒷편 에스테틱. 첫 방문 체험 관리 슬롯을 자주 올립니다.",
      tags:["데이트","웨딩 준비"],
      menu:[ {name:"기본 관리", min:50, price:65000}, {name:"백 관리", min:40, price:55000} ],
      slots:[ {in:38, menu:0, min:25, max:50}, {in:120, menu:1, min:20, max:40} ] },

    { id:"s12", cat:"lash", name:"래쉬온", lat:37.5268, lng:127.0380, rating:4.9, visitor:267, blog:120,
      naver:{ address:"서울특별시 강남구 압구정동 452-1", roadAddress:"서울특별시 강남구 압구정로46길 5 4층", telephone:"02-548-1212" },
      intro:"압구정로데오역 도보 3분. 속눈썹 연장 · 펌.",
      tags:["데이트","웨딩 준비"],
      menu:[ {name:"속눈썹 연장", min:80, price:70000}, {name:"속눈썹 펌", min:50, price:45000} ],
      slots:[ {in:45, menu:1, min:20, max:45} ] },

    { id:"s13", cat:"lash", name:"에이블래쉬 선릉", lat:37.5060, lng:127.0500, rating:4.6, visitor:72, blog:25,
      naver:{ address:"서울특별시 강남구 삼성동 143-6", roadAddress:"서울특별시 강남구 선릉로86길 40 2층", telephone:"02-569-1313" },
      intro:"선릉역 1번 출구 앞. 1인샵.",
      tags:["직장인"],
      menu:[ {name:"속눈썹 펌", min:45, price:40000}, {name:"속눈썹 연장", min:80, price:65000} ],
      slots:[ {in:28, menu:0, min:25, max:50} ] },

    { id:"s14", cat:"wax", name:"스무스왁싱 강남", lat:37.4948, lng:127.0295, rating:4.7, visitor:96, blog:33,
      naver:{ address:"서울특별시 강남구 역삼동 828-4", roadAddress:"서울특별시 강남구 강남대로84길 8 6층", telephone:"02-557-1414" },
      intro:"강남역 4번 출구. 여성 전용 왁싱.",
      tags:["직장인","근처 거주자"],
      menu:[ {name:"브라질리언", min:40, price:60000}, {name:"팔·다리", min:30, price:40000} ],
      slots:[ {in:70, menu:1, min:20, max:40} ] },

    { id:"s15", cat:"scalp", name:"헤드스파 논현", lat:37.5138, lng:127.0275, rating:4.8, visitor:130, blog:49,
      naver:{ address:"서울특별시 강남구 논현동 63-2", roadAddress:"서울특별시 강남구 논현로131길 15 3층", telephone:"02-546-1515" },
      intro:"두피 스케일링 · 헤드 마사지 전문. 1인 1실.",
      tags:["직장인","데이트"],
      menu:[ {name:"두피 스케일링", min:50, price:65000}, {name:"헤드 스파 30분", min:30, price:40000} ],
      slots:[ {in:35, menu:1, min:25, max:45} ] },

    { id:"s16", cat:"foot", name:"풋앤바디 대치", lat:37.4935, lng:127.0600, rating:4.5, visitor:58, blog:14,
      naver:{ address:"서울특별시 강남구 대치동 950-3", roadAddress:"서울특별시 강남구 도곡로 424 2층", telephone:"02-562-1616" },
      intro:"대치동 학원가. 발 관리 · 각질 케어.",
      tags:["근처 거주자"],
      menu:[ {name:"발 관리", min:40, price:45000}, {name:"발 각질 케어", min:30, price:35000} ],
      slots:[ {in:48, menu:0, min:20, max:40} ] },

    { id:"s17", cat:"nail", name:"코엑스 네일스튜디오", lat:37.5100, lng:127.0605, rating:4.6, visitor:141, blog:52,
      naver:{ address:"서울특별시 강남구 삼성동 159-1", roadAddress:"서울특별시 강남구 영동대로 513 지하1층", telephone:"02-551-1717" },
      intro:"코엑스몰 안. 회의 사이 30분 케어.",
      tags:["직장인","데이트"],
      menu:[ {name:"기본 케어", min:30, price:38000}, {name:"젤 원컬러", min:60, price:52000} ],
      slots:[ {in:26, menu:0, min:25, max:50}, {in:90, menu:1, min:20, max:40} ] },

    { id:"s18", cat:"hair", name:"헤어샵 오늘", lat:37.4980, lng:127.0520, rating:4.4, visitor:45, blog:9,
      naver:{ address:"서울특별시 강남구 대치동 1011-2", roadAddress:"서울특별시 강남구 선릉로 320 1층", telephone:"02-563-1818" },
      intro:"동네 미용실. 사장님 혼자 운영, 당일 취소는 바로 올립니다.",
      tags:["근처 거주자"],
      menu:[ {name:"커트", min:30, price:22000}, {name:"드라이", min:25, price:18000} ],
      slots:[ {in:42, menu:0, min:30, max:50} ] },

    { id:"s19", cat:"massage", name:"선정릉 스파", lat:37.5095, lng:127.0470, rating:4.7, visitor:189, blog:70,
      naver:{ address:"서울특별시 강남구 삼성동 27-4", roadAddress:"서울특별시 강남구 봉은사로 418 2층", telephone:"02-567-1919" },
      intro:"선정릉 맞은편. 아로마 · 스톤 테라피.",
      tags:["데이트","직장인"],
      menu:[ {name:"아로마 60분", min:60, price:95000}, {name:"핫스톤 30분", min:30, price:55000} ],
      slots:[ {in:80, menu:1, min:20, max:45} ] },

    { id:"s20", cat:"skin", name:"뷰티룸 로데오", lat:37.5265, lng:127.0415, rating:4.8, visitor:201, blog:88,
      naver:{ address:"서울특별시 강남구 청담동 84-16", roadAddress:"서울특별시 강남구 압구정로 410 3층", telephone:"02-512-2020" },
      intro:"압구정로데오 메인 스트리트. 브라이덜 관리로 유명.",
      tags:["웨딩 준비","데이트"],
      menu:[ {name:"기본 관리", min:60, price:90000}, {name:"등 관리", min:40, price:60000} ],
      slots:[ {in:105, menu:1, min:20, max:40} ] },

    { id:"s21", cat:"hair", name:"압구정 헤어 아뜰리에", lat:37.5250, lng:127.0320, rating:4.8, visitor:288, blog:131,
      naver:{ address:"서울특별시 강남구 압구정동 431-2", roadAddress:"서울특별시 강남구 언주로 872 2층", telephone:"02-541-2121" },
      intro:"압구정역 3번 출구. 디자이너 6명.",
      tags:["데이트","직장인"],
      menu:[ {name:"커트", min:45, price:45000}, {name:"드라이", min:30, price:30000} ],
      slots:[ {in:36, menu:1, min:20, max:45}, {in:115, menu:0, min:20, max:40} ] },

    { id:"s22", cat:"wax", name:"논현 태닝앤왁스", lat:37.5085, lng:127.0235, rating:4.5, visitor:40, blog:11,
      naver:{ address:"서울특별시 강남구 논현동 202-7", roadAddress:"서울특별시 강남구 강남대로 578 4층", telephone:"02-543-2222" },
      intro:"논현역 6번 출구. 왁싱 · 태닝.",
      tags:["직장인"],
      menu:[ {name:"팔·다리 왁싱", min:30, price:38000}, {name:"태닝 20분", min:20, price:25000} ],
      slots:[ {in:58, menu:0, min:25, max:45} ] },

    /* 롯데 연계 시범 (사업정리 10장) — 계열사 소멸 임박 재고를 같은 엔진에 얹는 예시.
       상영·좌석 정보는 예시값입니다. */
    { id:"l01", cat:"lotte", name:"롯데시네마 브로드웨이(신사)", lat:37.5162, lng:127.0247, rating:4.3, visitor:1250, blog:410, lotte:true,
      naver:{ address:"서울특별시 강남구 논현동 6", roadAddress:"서울특별시 강남구 도산대로 114", telephone:"1544-8855" },
      intro:"상영 30분 전 잔여 좌석 — 롯데시네마 회원 한정 노출 (시범).",
      tags:["데이트","직장인"],
      menu:[ {name:"일반 상영 잔여석 (예시)", min:120, price:15000} ],
      slots:[ {in:34, menu:0, min:30, max:50} ] },

    { id:"l02", cat:"lotte", name:"롯데백화점 강남점 문화센터", lat:37.4969, lng:127.0530, rating:4.4, visitor:980, blog:260, lotte:true,
      naver:{ address:"서울특별시 강남구 대치동 936", roadAddress:"서울특별시 강남구 도곡로 401", telephone:"02-531-2500" },
      intro:"당일 강좌 잔여석 — 지점 단위 소량 노출 (시범).",
      tags:["근처 거주자"],
      menu:[ {name:"원데이 클래스 잔여석 (예시)", min:90, price:30000} ],
      slots:[ {in:66, menu:0, min:30, max:50} ] },
  ],

  /* 동네 보물찾기 — 고객 모객 장치 (사업정리 5.1장).
     카페에 보물(커피 10만 원어치)을 걸어두고 앱에서 찾아가면 선착순으로 받습니다. */
  treasures: [
    { id:"t01", name:"카페 봉봉",        lat:37.4985, lng:127.0315, prize:"아메리카노 1잔", left:7,  total:10, until:75,
      naver:{ roadAddress:"서울특별시 강남구 테헤란로10길 12 1층" } },
    { id:"t02", name:"가로수길 커피랩",   lat:37.5195, lng:127.0235, prize:"라떼 1잔",       left:3,  total:10, until:40,
      naver:{ roadAddress:"서울특별시 강남구 압구정로10길 24" } },
    { id:"t03", name:"선릉 브루어스",     lat:37.5050, lng:127.0475, prize:"아메리카노 1잔", left:10, total:10, until:110,
      naver:{ roadAddress:"서울특별시 강남구 선릉로 433" } },
    { id:"t04", name:"청담 티하우스",     lat:37.5225, lng:127.0450, prize:"밀크티 1잔",     left:5,  total:10, until:60,
      naver:{ roadAddress:"서울특별시 강남구 도산대로 457" } },
    { id:"t05", name:"카페 도토리 코엑스", lat:37.5105, lng:127.0625, prize:"아메리카노 1잔", left:9,  total:10, until:95,
      naver:{ roadAddress:"서울특별시 강남구 영동대로 513" } },
  ],

  /* 일러스트 지도 — 강남구 주요 도로·역·녹지 (근사 좌표) */
  map: {
    water: [
      { name:"한강", w:34, pts:[[127.000,37.5215],[127.015,37.5262],[127.030,37.5320],[127.048,37.5352],[127.065,37.5340],[127.080,37.5300],[127.100,37.5210]] },
      { name:"양재천", w:10, pts:[[127.025,37.4760],[127.040,37.4835],[127.052,37.4880],[127.066,37.4935],[127.082,37.4985]] },
    ],
    roads: [
      { name:"강남대로", w:7, pts:[[127.0203,37.5169],[127.0214,37.5110],[127.0250,37.5045],[127.0276,37.4979],[127.0320,37.4870]] },
      { name:"테헤란로", w:7, pts:[[127.0276,37.4979],[127.0366,37.5006],[127.0490,37.5045],[127.0631,37.5088],[127.0700,37.5105]] },
      { name:"도산대로", w:6, pts:[[127.0203,37.5169],[127.0355,37.5235],[127.0525,37.5245],[127.0620,37.5270]] },
      { name:"봉은사로", w:5, pts:[[127.0240,37.5075],[127.0330,37.5100],[127.0430,37.5118],[127.0575,37.5140],[127.0640,37.5125]] },
      { name:"압구정로", w:5, pts:[[127.0230,37.5265],[127.0284,37.5273],[127.0402,37.5273],[127.0520,37.5250]] },
      { name:"학동로",   w:4, pts:[[127.0214,37.5110],[127.0316,37.5145],[127.0413,37.5172],[127.0533,37.5194],[127.0640,37.5215]] },
      { name:"언주로",   w:5, pts:[[127.0320,37.5300],[127.0316,37.5145],[127.0340,37.5060],[127.0366,37.5006],[127.0400,37.4890]] },
      { name:"선릉로",   w:5, pts:[[127.0402,37.5273],[127.0413,37.5172],[127.0440,37.5100],[127.0490,37.5045],[127.0520,37.4920]] },
      { name:"삼성로",   w:4, pts:[[127.0555,37.5245],[127.0575,37.5140],[127.0590,37.5060],[127.0610,37.4960],[127.0627,37.4880]] },
      { name:"영동대로", w:6, pts:[[127.0650,37.5290],[127.0640,37.5215],[127.0631,37.5088],[127.0640,37.4960]] },
      { name:"논현로",   w:4, pts:[[127.0250,37.5300],[127.0275,37.5140],[127.0290,37.5040],[127.0300,37.4930]] },
      { name:"역삼로",   w:3, pts:[[127.0250,37.4930],[127.0345,37.4968],[127.0450,37.5000],[127.0560,37.5030]] },
      { name:"도곡로",   w:4, pts:[[127.0330,37.4870],[127.0450,37.4915],[127.0530,37.4969],[127.0620,37.4935]] },
    ],
    parks: [
      { name:"선정릉", lat:37.5090, lng:127.0455, r:150 },
      { name:"도산공원", lat:37.5235, lng:127.0355, r:90 },
      { name:"봉은사", lat:37.5148, lng:127.0575, r:110 },
    ],
    stations: [
      ["강남",37.4979,127.0276],["역삼",37.5006,127.0366],["선릉",37.5045,127.0490],["삼성",37.5088,127.0631],
      ["신사",37.5169,127.0203],["논현",37.5110,127.0214],["학동",37.5145,127.0316],["강남구청",37.5172,127.0413],
      ["압구정",37.5273,127.0284],["압구정로데오",37.5273,127.0402],["청담",37.5194,127.0533],["신논현",37.5045,127.0250],
      ["언주",37.5060,127.0340],["선정릉",37.5100,127.0440],["봉은사",37.5140,127.0575],["한티",37.4964,127.0530],["대치",37.4946,127.0627],
    ],
  },
};
