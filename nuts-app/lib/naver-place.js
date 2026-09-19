/* ============================================================
   넛츠 — 네이버 플레이스 어댑터
   ------------------------------------------------------------
   매장 정보의 원천은 네이버 플레이스(지역검색 API)입니다.

   · 키가 있으면  : server.js 의 /api/naver/local 을 통해 실제 응답을 받아
                   시드와 같은 형태로 정규화합니다.
   · 키가 없으면  : data/stores.js 의 시드(네이버 응답 형식)를 그대로 씁니다.

   네이버 지역검색 응답 항목 (참고):
     title, link, category, description, telephone,
     address, roadAddress, mapx, mapy   ← mapx/mapy 는 WGS84 × 1e7
   ============================================================ */
(function () {
  const CFG = window.NUTS_CONFIG || {};

  /* 매장 이름으로 네이버 플레이스를 여는 링크 — API 키 없이도 동작 */
  function placeUrl(name, dong) {
    const q = encodeURIComponent(`${name} ${dong || "강남구"}`);
    return `https://map.naver.com/p/search/${q}`;
  }

  /* 네이버 지도 길찾기 (웹) — 도착지 이름·좌표 */
  function directionsUrl(store, mode) {
    const m = { walk:"walk", bike:"bike", car:"car" }[mode] || "walk";
    return `https://map.naver.com/p/directions/-/${store.lng},${store.lat},${encodeURIComponent(store.name)}/-/${m}`;
  }

  /* 네이버 지도 앱 스킴 — 모바일에서 앱이 있으면 바로 열림 */
  function appDirections(store, mode) {
    const m = { walk:"walk", bike:"bicycle", car:"car" }[mode] || "walk";
    return `nmap://route/${m}?dlat=${store.lat}&dlng=${store.lng}&dname=${encodeURIComponent(store.name)}&appname=nuts.app`;
  }

  /* 지역검색 API 항목 → 넛츠 매장 레코드 */
  function normalize(item, cat, idx) {
    const name = String(item.title || "").replace(/<[^>]+>/g, "");
    const dong = (item.address || "").split(" ")[2] || "";
    return {
      id: `n${cat}${idx}`,
      cat,
      name,
      lat: Number(item.mapy) / 1e7,
      lng: Number(item.mapx) / 1e7,
      rating: null, visitor: null, blog: null,        // 지역검색 API는 평점을 주지 않음
      naver: { address:item.address, roadAddress:item.roadAddress, telephone:item.telephone, link:item.link, category:item.category },
      intro: item.description || "",
      tags: [],
      menu: [],           // 메뉴·슬롯은 사장님이 올립니다 (사장님 모드)
      slots: [],
      placeUrl: item.link || placeUrl(name, dong),
    };
  }

  /* 실데이터 로드 시도 — 실패하면 null (호출부가 시드로 폴백) */
  async function fetchLive(categories) {
    if (!CFG.apiBase) return null;
    try {
      const out = [];
      for (const cat of Object.keys(categories)) {
        if (cat === "treasure" || cat === "lotte") continue;
        const q = encodeURIComponent(`강남구 ${categories[cat].short}`);
        const r = await fetch(`${CFG.apiBase}/api/naver/local?query=${q}&display=5`);
        if (!r.ok) throw new Error(`naver ${r.status}`);
        const json = await r.json();
        (json.items || []).forEach((it, i) => out.push(normalize(it, cat, i)));
      }
      return out;
    } catch (e) {
      console.warn("[naver-place] 실데이터 로드 실패, 시드 사용:", e.message);
      return null;
    }
  }

  window.NaverPlace = { placeUrl, directionsUrl, appDirections, normalize, fetchLive };
})();
