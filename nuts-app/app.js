/* ============================================================
   넛츠 NUTS — 앱 (강남구 프로토타입)
   ------------------------------------------------------------
   코어 메커니즘 (사업정리 3장)
     ① 실시간 가격   — 마감까지 남은 시간 · 수요 밀도로 값을 다시 매긴다   → pricing()
     ② 도달 가능성   — 마감 전에 도착할 수 있는 사람에게만 보여준다        → reachable()
     ③ 즉시 선결제   — 노쇼를 막고 사장님 매출을 확정한다                  → 결제 화면
   운영 3원칙 (7.1장): 강남구 한 곳 · 선결제 의무 · 단골에게는 안 보임 (store.regular)
   ============================================================ */
(function () {
  "use strict";
  const D = window.NUTS_SEED, NP = window.NaverPlace, CATS = D.categories;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const won = n => Math.round(n).toLocaleString("ko-KR") + "원";
  const icon = (id, cls) => `<svg class="i ${cls || ""}" aria-hidden="true"><use href="#ic-${id}"/></svg>`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------- 시간 ---------------- */
  const roundTo5 = d => { const t = new Date(d); t.setSeconds(0, 0); t.setMinutes(Math.ceil(t.getMinutes() / 5) * 5); return t.getTime(); };
  const BOOT = roundTo5(new Date());
  const now = () => Date.now();
  const fmtT = ts => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  const minsLeft = ts => Math.round((ts - now()) / 60000);
  const fmtLeft = m => m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`;

  /* ---------------- 이동수단 (도달 가능성 필터) ----------------
     보수적 이동시간 버퍼 (리스크 R8): 직선거리 × 1.3 우회계수 + 5분 버퍼 */
  const MODES = {
    walk: { name:"도보",   ic:"🚶", kmh:4.2,  extra:0, hint:"걸어서 갈 수 있는 곳만" },
    bike: { name:"자전거", ic:"🚲", kmh:13,   extra:2, hint:"따릉이·킥보드 포함" },
    car:  { name:"차량",   ic:"🚗", kmh:18,   extra:6, hint:"주차 6분 포함 · 급이동 금지" },
  };
  const BUFFER = 5;
  const dist = (a, b) => {
    const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const travel = (store, mode) => { const km = dist(area(), store) * 1.3; const m = MODES[mode]; return { km, min: Math.max(1, Math.ceil(km / m.kmh * 60 + m.extra)) }; };

  /* ---------------- 상태 ---------------- */
  const KEY = "nuts.v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  const S = Object.assign({ mode:null, areaId:"gangnam", saved:[], bookings:[], alerts:[], claimed:[], onboarded:false, ownerPosts:0 }, load() || {});
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 프라이빗 창 등 — 무시 */ } };
  const area = () => D.areas.find(a => a.id === S.areaId) || D.areas[0];

  /* 매장 — 슬롯 시각을 실제 시각으로 펼칩니다 */
  const stores = D.stores.map(s => ({
    ...s,
    dong: (s.naver.address || "").split(" ")[2] || "",
    placeUrl: NP.placeUrl(s.name, (s.naver.address || "").split(" ")[2]),
    slots: s.slots.map((sl, i) => ({ ...sl, id:`${s.id}-${i}`, storeId:s.id, startAt: BOOT + sl.in * 60000 })),
  }));
  const byId = id => stores.find(s => s.id === id);
  const treasures = D.treasures.map(t => ({ ...t, until: BOOT + t.until * 60000 }));
  const isBooked = slot => S.bookings.some(b => b.slotId === slot.id && b.startAt === slot.startAt);

  /* ---------------- 실시간 가격 ----------------
     남은 시간이 0으로 갈수록 할인율이 min → max 로 올라갑니다 (5% 단위).
     수요 밀도(area.demand)가 높으면 덜 내립니다. */
  function pricing(store, slot) {
    const left = clamp(minsLeft(slot.startAt), 0, 120);
    const t = 1 - left / 120;
    let pct = slot.min + (slot.max - slot.min) * t - area().demand * 2.5;
    pct = clamp(Math.round(pct / 5) * 5, slot.min, slot.max);
    const list = store.menu[slot.menu].price;
    const price = Math.round(list * (1 - pct / 100) / 100) * 100;
    return { list, price, pct, saved:list - price };
  }

  /* ---------------- 지금 갈 수 있는 자리 ---------------- */
  function offers(mode) {
    const out = [];
    for (const st of stores) {
      if (st.regular) continue;                      // 단골에게는 안 보임 (7.1장 원칙 3)
      for (const sl of st.slots) {
        if (isBooked(sl)) continue;
        const left = minsLeft(sl.startAt);
        if (left < 0 || left > 130) continue;         // 지금부터 2시간 이내
        const tr = travel(st, mode);
        const reachable = tr.min + BUFFER <= left;
        out.push({ store:st, slot:sl, tr, left, reachable, eta: now() + tr.min * 60000, ...pricing(st, sl) });
      }
    }
    return out.sort((a, b) => a.slot.startAt - b.slot.startAt);
  }
  const modesThatReach = (store, slot) => Object.keys(MODES).filter(m => travel(store, m).min + BUFFER <= minsLeft(slot.startAt));

  /* ---------------- 조건 알림 (리스크 R4) ---------------- */
  function alertMatches(al, list) {
    const a = D.areas.find(x => x.id === al.areaId) || area();
    return list.filter(o => o.reachable && (al.cat === "any" || o.store.cat === al.cat) && o.pct >= al.minPct && dist(a, o.store) <= 2.2);
  }

  /* ============================================================
     일러스트 지도
     ============================================================ */
  const MAP = { lat:0, lng:0, z:95, sel:null, W:0, H:0 };
  const KLAT = 111.32, KLNG = 111.32 * Math.cos(37.51 * Math.PI / 180);
  const proj = (lat, lng) => ({ x: MAP.W / 2 + (lng - MAP.lng) * KLNG * MAP.z, y: MAP.H / 2 - (lat - MAP.lat) * KLAT * MAP.z });
  const pathOf = pts => pts.map((p, i) => { const q = proj(p[1], p[0]); return `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }).join(" ");

  function renderMap() {
    const el = $("#map"); MAP.W = el.clientWidth; MAP.H = el.clientHeight;
    const s = MAP.z / 95;
    let svg = `<rect width="100%" height="100%" fill="#F1EEDF"/>`;
    for (const p of D.map.parks) { const q = proj(p.lat, p.lng); svg += `<circle cx="${q.x}" cy="${q.y}" r="${p.r / 1000 * MAP.z}" fill="#D6E4BE"/>`; }
    for (const w of D.map.water) svg += `<path d="${pathOf(w.pts)}" stroke="#BEDDF0" stroke-width="${w.w * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (const r of D.map.roads) svg += `<path d="${pathOf(r.pts)}" stroke="#DCCFB5" stroke-width="${(r.w + 2) * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (const r of D.map.roads) svg += `<path d="${pathOf(r.pts)}" stroke="${r.w >= 6 ? "#FBE7C6" : "#FFFFFF"}" stroke-width="${r.w * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    /* 15분 안에 갈 수 있는 반경 */
    const me = proj(area().lat, area().lng), reachKm = MODES[S.mode || "walk"].kmh * 15 / 60 / 1.3;
    svg += `<circle cx="${me.x}" cy="${me.y}" r="${reachKm * MAP.z}" fill="rgba(232,98,42,.07)" stroke="rgba(232,98,42,.35)" stroke-dasharray="4 4"/>`;
    $("#map-svg").innerHTML = svg;

    let labels = "";
    if (MAP.z >= 70) for (const st of D.map.stations) { const q = proj(st[1], st[2]); labels += `<div class="station" style="left:${q.x}px;top:${q.y}px">${esc(st[0])}</div>`; }
    if (MAP.z >= 85) for (const r of D.map.roads) { const m = r.pts[Math.floor(r.pts.length / 2)]; const q = proj(m[1], m[0]); labels += `<div class="roadname" style="left:${q.x}px;top:${q.y - 9}px">${esc(r.name)}</div>`; }
    $("#map-labels").innerHTML = labels;

    /* 핀 — 매장당 가장 빠른 자리 하나 */
    const list = offers(S.mode || "walk"), best = new Map();
    for (const o of list) if (!best.has(o.store.id) || (o.reachable && !best.get(o.store.id).reachable)) best.set(o.store.id, o);
    let pins = "";
    for (const o of best.values()) {
      const q = proj(o.store.lat, o.store.lng), c = CATS[o.store.cat];
      pins += `<div class="pin ${o.store.id === MAP.sel ? "sel" : ""} ${o.reachable ? "" : "dim"}" data-store="${o.store.id}" style="left:${q.x}px;top:${q.y}px;--c:${c.color}">
        <div class="marker">${icon(o.store.cat)}</div>
        ${o.reachable ? `<div class="chip-l"><b>${esc(c.short)}</b><span>${o.tr.min}분</span></div>` : ""}</div>`;
    }
    for (const t of treasures) {
      if (S.claimed.includes(t.id) || t.until < now()) continue;
      const q = proj(t.lat, t.lng);
      pins += `<div class="pin treasure" data-treasure="${t.id}" style="left:${q.x}px;top:${q.y}px;--c:#6C8A3A"><div class="marker">${icon("treasure")}</div><div class="chip-l"><b>보물</b><span>${t.left}개 남음</span></div></div>`;
    }
    pins += `<div class="me pulse" style="left:${me.x}px;top:${me.y}px"><img src="assets/mascot.webp" alt="내 위치"><div class="ring"></div></div>`;
    $("#map-pins").innerHTML = pins;
    $("#map-legend").innerHTML = `<span>📍 ${esc(area().name)}</span><span>${MODES[S.mode || "walk"].ic} 15분 반경</span>`;
  }

  function initMap() {
    const el = $("#map"); let drag = null;
    el.addEventListener("pointerdown", e => { if (e.target.closest(".map-ctl")) return; drag = { x:e.clientX, y:e.clientY, lat:MAP.lat, lng:MAP.lng, moved:false }; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", e => {
      if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; el.classList.add("drag"); }
      MAP.lng = drag.lng - dx / (KLNG * MAP.z); MAP.lat = drag.lat + dy / (KLAT * MAP.z); renderMap();
    });
    const end = e => {
      if (!drag) return; const moved = drag.moved; drag = null; el.classList.remove("drag");
      if (moved) return;
      const pin = e.target.closest("[data-store]"), tp = e.target.closest("[data-treasure]");
      if (tp) return openTreasure(tp.dataset.treasure);
      if (pin) { const id = pin.dataset.store; if (MAP.sel === id) return openStore(id); MAP.sel = id; renderMap(); highlightCard(id); }
    };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", () => { drag = null; el.classList.remove("drag"); });
    el.addEventListener("wheel", e => { e.preventDefault(); MAP.z = clamp(MAP.z * (e.deltaY < 0 ? 1.15 : 0.87), 45, 240); renderMap(); }, { passive:false });
    $("#zoom-in").onclick = () => { MAP.z = clamp(MAP.z * 1.3, 45, 240); renderMap(); };
    $("#zoom-out").onclick = () => { MAP.z = clamp(MAP.z / 1.3, 45, 240); renderMap(); };
    $("#recenter").onclick = () => { MAP.lat = area().lat; MAP.lng = area().lng; MAP.z = 95; renderMap(); };
    window.addEventListener("resize", renderMap);
  }
  const centerMap = () => { MAP.lat = area().lat; MAP.lng = area().lng; };

  /* ============================================================
     홈
     ============================================================ */
  let catFilter = "all";
  function renderHome() {
    const mode = S.mode || "walk", list = offers(mode);
    $("#area-name").textContent = area().name;
    $("#mode-ic").textContent = MODES[mode].ic; $("#mode-name").textContent = MODES[mode].name;
    const reach = list.filter(o => o.reachable), miss = list.filter(o => !o.reachable);
    $("#home-sub").textContent = `${fmtT(now())} 기준 · ${area().name}에서 ${MODES[mode].name}로 · 2시간 안 빈자리 ${reach.length}개`;

    const cats = ["all", ...new Set(reach.map(o => o.store.cat))];
    if (!cats.includes(catFilter)) catFilter = "all";
    $("#cat-chips").innerHTML = cats.map(c => `<button class="chip ${catFilter === c ? "on" : ""}" data-cat="${c}">${c === "all" ? "전체" : esc(CATS[c].name)} <span class="muted" style="font-weight:400">${c === "all" ? reach.length : reach.filter(o => o.store.cat === c).length}</span></button>`).join("");

    /* 조건 알림 배너 */
    const hits = S.alerts.filter(a => a.on).map(a => ({ a, n: alertMatches(a, list).length })).filter(x => x.n);
    $("#alert-banner").innerHTML = hits.length ? `<div class="nudge">🔔 <span>조건 알림 <b>${esc(alertLabel(hits[0].a))}</b>에 맞는 자리 ${hits[0].n}개</span><button data-go="search">보기</button></div>` : "";

    const shown = reach.filter(o => catFilter === "all" || o.store.cat === catFilter);
    $("#slot-list").innerHTML = shown.length ? shown.map(cardHtml).join("") :
      `<div class="empty"><img src="assets/mascot.webp" alt=""><b>지금 ${MODES[mode].name}로 갈 수 있는 자리가 없어요</b><span class="small">이동수단을 바꾸거나 조건 알림을 걸어두세요. 자리가 뜨는 순간 알려드릴게요.</span></div>`;

    /* 이동수단 넛지 — 다른 수단이면 더 보이는 곳 */
    const other = Object.keys(MODES).filter(m => m !== mode).map(m => ({ m, n: offers(m).filter(o => o.reachable).length - reach.length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n)[0];
    $("#mode-nudge").innerHTML = other ? `<div class="nudge">${MODES[other.m].ic} <span><b>${esc(MODES[other.m].name)}</b>로 바꾸면 ${other.n}곳 더 갈 수 있어요</span><button data-mode="${other.m}">바꾸기</button></div>` :
      miss.length ? `<div class="nudge">⏱ <span>마감까지 못 가는 자리 ${miss.length}개는 숨겼어요 — 도착률을 지키기 위해서예요</span></div>` : "";

    $("#treasure-row").innerHTML = treasures.filter(t => t.until > now()).map(t => {
      const tr = travel(t, mode), done = S.claimed.includes(t.id);
      return `<div class="tcard" data-treasure="${t.id}"><div class="t">${esc(t.name)}</div><div class="p">${done ? "✅ 받았어요" : "🎁 " + esc(t.prize)}</div><div class="l">${tr.min}분 · ${fmtLeft(Math.max(0, minsLeft(t.until)))} 남음 · ${t.left}/${t.total}</div><div class="bar"><i style="width:${t.left / t.total * 100}%"></i></div></div>`;
    }).join("");
  }
  function cardHtml(o) {
    const c = CATS[o.store.cat], m = o.store.menu[o.slot.menu];
    return `<div class="slot-card ${MAP.sel === o.store.id ? "sel" : ""}" data-open="${o.store.id}" data-slot="${o.slot.id}" style="--c:${c.color}">
      <div class="thumb">${icon(o.store.cat)}</div>
      <div class="grow"><div class="name ellip">${esc(o.store.name)}</div>
        <div class="meta">${o.tr.min}분 · ${o.tr.km.toFixed(1)}km · ${esc(m.name)} ${m.min}분</div>
        <div class="when">오늘 ${fmtT(o.slot.startAt)} <span class="muted" style="font-weight:400">· ${fmtLeft(o.left)} 뒤</span></div></div>
      <div class="pr"><span class="badge">${o.pct}%</span><span class="strike tabular">${won(o.list)}</span><span class="price tabular">${won(o.price)}</span></div></div>`;
  }
  function highlightCard(id) {
    $$("#slot-list .slot-card").forEach(el => el.classList.toggle("sel", el.dataset.open === id));
    const el = $(`#slot-list .slot-card[data-open="${id}"]`); if (el) el.scrollIntoView({ behavior:"smooth", block:"nearest" });
  }

  /* ============================================================
     매장 상세
     ============================================================ */
  function openStore(id, slotId) {
    const st = byId(id), c = CATS[st.cat], mode = S.mode || "walk";
    const tr = travel(st, mode);
    const open = st.slots.filter(s => !isBooked(s) && minsLeft(s.startAt) >= 0 && minsLeft(s.startAt) <= 130);
    let cur = open.find(s => s.id === slotId) || open[0];
    const p = pushPage(`
      <div class="scroll" style="position:relative">
        <div class="hero-cat" style="--c:${c.color}"><div class="pattern"></div><svg class="big i" style="stroke-width:1"><use href="#ic-${st.cat}"/></svg>
          <div class="bar"><button class="iconbtn" data-back>${icon("back")}</button><div class="r"><button class="iconbtn" data-share>${icon("share")}</button><button class="iconbtn ${S.saved.includes(st.id) ? "on" : ""}" data-save>${icon("heart")}</button></div></div>
          <span class="cat">${esc(c.short)} · ${esc(c.tier)}</span></div>
        <div class="detail-body">
          <h1 class="h1 display">${esc(st.name)}</h1>
          <div class="rating" style="margin-top:6px">${st.rating ? `<span class="star">★</span><b>${st.rating}</b><span>· 네이버 방문자 리뷰 ${st.visitor} · 블로그 ${st.blog}</span>` : `<span>네이버 플레이스 정보</span>`}</div>
          <div class="small muted" style="margin-top:4px">📍 ${tr.km.toFixed(1)}km · ${MODES[mode].name} ${tr.min}분 · ${esc(st.naver.roadAddress)}</div>
          <div class="row" style="margin-top:8px;gap:12px"><a class="link" href="${st.placeUrl}" target="_blank" rel="noopener">네이버 플레이스에서 보기 ↗</a><a class="link" href="tel:${esc(st.naver.telephone)}" style="color:var(--ink2)">전화</a></div>
          <div id="slotbox"></div>
          ${st.lotte ? `<div class="note" style="margin-top:12px"><b>롯데 연계 시범</b> — 상영 30분 전·당일 잔여석처럼 계열사의 소멸 임박 재고를 같은 엔진(시간 제한 · 대상 제한 · 수량 제한)에 얹은 예시입니다. L.POINT 회원 한정 노출.</div>` :
            `<div class="note" style="margin-top:12px">🙌 <b>이 매장은 첫 방문이시네요.</b> 넛츠 가격은 첫 방문 고객에게만 보여요. 단골이 되면 정가로 예약하는 대신, 다른 동네 새 매장을 발견하게 돼요.</div>`}
          <div class="section" style="padding-left:0;padding-right:0"><div class="section-title"><h2>이런 분께 추천해요</h2></div>
            <div class="reco">${st.tags.map(t => `<div><span class="ic">${{ "직장인":"💼", "데이트":"💛", "근처 거주자":"🏠", "웨딩 준비":"💍" }[t] || "✨"}</span>${esc(t)}</div>`).join("")}</div></div>
          <div class="section" style="padding-left:0;padding-right:0"><div class="section-title"><h2>매장 소개</h2></div><p class="small" style="margin:0;color:var(--ink2)">${esc(st.intro)}</p>
            <dl class="kv" style="margin-top:10px"><dt>주소</dt><dd>${esc(st.naver.roadAddress)}</dd><dt>지번</dt><dd>${esc(st.naver.address)}</dd><dt>업종 (네이버)</dt><dd>${esc(c.naver)}</dd></dl></div>
        </div>
      </div>
      <div class="cta-bar"><button class="btn" id="cta-book"></button></div>`);

    function drawSlot() {
      const box = $("#slotbox", p);
      if (!cur) { box.innerHTML = `<div class="slotbox"><b>지금 열린 자리가 없어요</b><div class="small muted" style="margin-top:4px">조건 알림을 걸어두면 이 매장에 자리가 뜰 때 알려드려요.</div></div>`; $("#cta-book", p).textContent = "조건 알림 걸어두기"; $("#cta-book", p).onclick = () => { popPage(); switchTab("search"); openAlertForm(st.cat); }; return; }
      const pr = pricing(st, cur), m = st.menu[cur.menu], left = minsLeft(cur.startAt), ok = tr.min + BUFFER <= left, eta = now() + tr.min * 60000;
      const reach = modesThatReach(st, cur);
      box.innerHTML = `<div class="slotbox">
        <div class="row between"><b class="tabular">오늘 ${fmtT(cur.startAt)} ~ ${fmtT(cur.startAt + m.min * 60000)}</b><span class="small muted">예약 마감 ${fmtT(cur.startAt - 10 * 60000)}</span></div>
        <div style="margin-top:8px">${ok ? `<span class="pill ok">✅ 지금 갈 수 있어요! 도착 예정 ${fmtT(eta)}</span>` :
          `<span class="pill warn">⏱ ${MODES[mode].name}로는 ${fmtT(eta)} 도착 — 이 자리는 놓쳐요</span>${reach.length ? `<div class="small" style="margin-top:6px">${reach.map(mm => `<button class="chip" data-setmode="${mm}">${MODES[mm].ic} ${MODES[mm].name}로는 가능</button>`).join(" ")}</div>` : ""}`}</div>
        ${open.length > 1 ? `<div class="small muted" style="margin-top:12px">다른 자리</div>${open.map(s => `<div class="slotrow ${s.id === cur.id ? "on" : ""}" data-pick="${s.id}"><div class="grow"><div class="t tabular">${fmtT(s.startAt)}</div><div class="m">${esc(st.menu[s.menu].name)} · ${st.menu[s.menu].min}분</div></div><span class="badge">${pricing(st, s).pct}%</span></div>`).join("")}` : ""}
      </div>
      <div class="menu-card" style="--c:${c.color}"><div class="thumb">${icon(st.cat)}</div>
        <div class="grow"><b>${esc(m.name)} (${m.min}분)</b><div class="row" style="gap:8px;margin-top:2px"><span class="strike tabular">${won(pr.list)}</span><span class="price tabular">${won(pr.price)}</span><span class="badge">${pr.pct}%</span></div></div></div>
      <div class="card pad" style="margin-top:12px">
        <div class="row between"><b class="small">이 자리의 가격은 시간 따라 움직여요</b><span class="tiny muted">자리는 1개</span></div>
        ${curveSvg(cur, pr)}
        <div class="tiny muted">마감이 가까울수록 값이 내려가지만, 먼저 잡는 사람 것이에요. 수요가 많은 ${esc(area().name)}에선 덜 내려가요.</div>
      </div>`;
      const cta = $("#cta-book", p);
      cta.textContent = ok ? `예약하기 · ${won(pr.price)} 선결제` : `${MODES[mode].name}로는 못 가요`;
      cta.disabled = !ok; cta.onclick = () => openBooking(st, cur);
    }
    drawSlot();
    p.addEventListener("click", e => {
      const b = e.target.closest("[data-back],[data-save],[data-share],[data-pick],[data-setmode]"); if (!b) return;
      if (b.hasAttribute("data-back")) return popPage();
      if (b.hasAttribute("data-save")) { toggleSave(st.id); b.classList.toggle("on", S.saved.includes(st.id)); return; }
      if (b.hasAttribute("data-share")) { const u = st.placeUrl; if (navigator.share) navigator.share({ title:st.name, url:u }).catch(() => {}); else toast("네이버 플레이스 링크를 복사했어요"); return; }
      if (b.dataset.pick) { cur = open.find(s => s.id === b.dataset.pick); drawSlot(); return; }
      if (b.dataset.setmode) { setMode(b.dataset.setmode); popPage(); openStore(id, cur && cur.id); }
    });
  }
  function curveSvg(slot, pr) {
    const W = 300, H = 64, pad = 6, y = v => H - pad - (v - slot.min) / Math.max(1, slot.max - slot.min) * (H - 2 * pad - 10);
    const pts = []; for (let m = 120; m >= 0; m -= 5) { const t = 1 - m / 120; const v = clamp(Math.round((slot.min + (slot.max - slot.min) * t - area().demand * 2.5) / 5) * 5, slot.min, slot.max); pts.push([(120 - m) / 120 * (W - 2 * pad) + pad, y(v)]); }
    const left = clamp(minsLeft(slot.startAt), 0, 120), cx = (120 - left) / 120 * (W - 2 * pad) + pad;
    return `<svg class="curve" viewBox="0 0 ${W} ${H}"><path d="M${pts.map(p => p.join(" ")).join(" L")}" fill="none" stroke="#E8622A" stroke-width="2"/>
      <path d="M${pts.map(p => p.join(" ")).join(" L")} L${W - pad} ${H - pad} L${pad} ${H - pad}Z" fill="rgba(232,98,42,.08)"/>
      <line x1="${cx}" y1="${pad}" x2="${cx}" y2="${H - pad}" stroke="#4A2A12" stroke-dasharray="3 3"/><circle cx="${cx}" cy="${y(pr.pct)}" r="4" fill="#4A2A12"/>
      <text x="${pad}" y="${H - 1}" font-size="9" fill="#9A8471">2시간 전 ${slot.min}%</text><text x="${W - pad}" y="${H - 1}" font-size="9" fill="#9A8471" text-anchor="end">마감 ${slot.max}%</text>
      <text x="${clamp(cx, 40, W - 40)}" y="${pad + 8}" font-size="10" font-weight="700" fill="#4A2A12" text-anchor="middle">지금 ${pr.pct}%</text></svg>`;
  }

  /* ============================================================
     예약 · 즉시 선결제
     ============================================================ */
  function openBooking(st, slot) {
    const mode = S.mode || "walk", tr = travel(st, mode), pr = pricing(st, slot), m = st.menu[slot.menu], eta = now() + tr.min * 60000;
    let method = "nutspay";
    const p = pushPage(`
      <div class="topbar"><button class="iconbtn" data-back>${icon("back")}</button><span class="title">자리 잡기</span><span style="width:38px"></span></div>
      <div class="scroll"><div class="pad">
        <div class="card pad"><div class="row between"><b>${esc(st.name)}</b><span class="badge">${pr.pct}%</span></div>
          <dl class="kv" style="margin-top:8px"><dt>서비스</dt><dd>${esc(m.name)} · ${m.min}분</dd><dt>시간</dt><dd class="tabular">오늘 ${fmtT(slot.startAt)} ~ ${fmtT(slot.startAt + m.min * 60000)}</dd><dt>도착 예정</dt><dd class="tabular">${MODES[mode].ic} ${fmtT(eta)} (${tr.min}분) <button class="link" data-mode-sheet>변경</button></dd><dt>정가</dt><dd class="strike tabular">${won(pr.list)}</dd><dt>넛츠 가격</dt><dd class="price tabular">${won(pr.price)}</dd></dl></div>
        <div class="eyebrow" style="margin:18px 0 6px">결제 수단 — 즉시 선결제</div>
        <div class="pay-opt on" data-pay="nutspay"><div class="lg" style="background:var(--ink)">넛츠<br>페이</div><div class="grow"><b>넛츠페이</b><div class="small muted">롯데멤버스 L.PAY 결제 모듈 · L.POINT ${Math.round(pr.price * 0.01).toLocaleString()}P 적립</div></div><span class="pill ok">추천</span></div>
        <div class="pay-opt" data-pay="card"><div class="lg" style="background:#5B6E8C">CARD</div><div class="grow"><b>신용·체크카드</b><div class="small muted">간편결제 등록 없이 1회 결제</div></div></div>
        <div class="note" style="margin-top:16px"><b>왜 미리 결제하나요?</b> 크게 할인해 준 사장님에게 노쇼는 재앙이에요. 선결제로 사장님 매출을 확정하고, 대신 예약 10분 전까지는 100% 환불돼요.</div>
        <details style="margin-top:12px"><summary class="small muted" style="cursor:pointer">이 결제는 어떻게 나뉘나요</summary>
          <dl class="kv" style="margin-top:8px"><dt>넛츠 판매가</dt><dd class="tabular">${won(pr.price)}</dd><dt>사장님 정산 (97%)</dt><dd class="tabular">${won(pr.price * 0.97)}</dd><dt>넛츠 수수료 (3%)</dt><dd class="tabular">${won(pr.price * 0.03)}</dd><dt>PG 수수료</dt><dd>별도</dd></dl>
          <div class="tiny muted" style="margin-top:6px">사장님이 비교하는 건 정가가 아니라 0원이에요. 안 팔리면 사라질 자리에서 받는 3%는 뺏는 게 아니라 나누는 거예요.</div></details>
        <div class="tiny muted" style="margin:14px 0 110px">넛츠는 통신판매중개자이며 서비스 제공 주체는 각 매장입니다. 이동 시 안전이 우선이에요 — 급하게 움직이지 마세요.</div>
      </div></div>
      <div class="cta-bar"><button class="btn" id="pay-btn">${won(pr.price)} 결제하고 자리 잡기</button></div>`);
    p.addEventListener("click", e => {
      const b = e.target.closest("[data-back],[data-pay],[data-mode-sheet]"); if (!b) return;
      if (b.hasAttribute("data-back")) return popPage();
      if (b.hasAttribute("data-mode-sheet")) return openModeSheet(() => { popPage(); openBooking(st, slot); });
      method = b.dataset.pay; $$(".pay-opt", p).forEach(x => x.classList.toggle("on", x === b));
    });
    $("#pay-btn", p).onclick = () => {
      const btn = $("#pay-btn", p); btn.disabled = true; btn.textContent = "결제 중…";
      setTimeout(() => {
        const bk = { id:"b" + Date.now(), code: "N" + Math.random().toString(36).slice(2, 6).toUpperCase(), storeId:st.id, storeName:st.name, cat:st.cat, slotId:slot.id, startAt:slot.startAt, endAt:slot.startAt + m.min * 60000,
          menu:m.name, min:m.min, list:pr.list, price:pr.price, pct:pr.pct, mode, eta, method, at:now() };
        S.bookings.unshift(bk); save(); popPage(); popPage(); openTicket(bk); renderAll();
      }, 700);
    };
  }

  function openTicket(bk) {
    const st = byId(bk.storeId);
    const p = pushPage(`
      <div class="topbar"><span style="width:38px"></span><span class="title">예약 확정</span><button class="iconbtn" data-home>✕</button></div>
      <div class="scroll">
        <div class="ticket"><div class="check">✓</div>
          <div class="display h2">자리 잡았어요!</div>
          <div class="small muted" style="margin-top:4px">사장님께 결제가 확정됐어요. 이제 천천히 가세요.</div>
          <div class="code">${esc(bk.code)}</div>
          ${qrSvg(bk.code)}
          <div class="divider"></div>
          <dl class="kv" style="text-align:left"><dt>매장</dt><dd>${esc(bk.storeName)}</dd><dt>서비스</dt><dd>${esc(bk.menu)} · ${bk.min}분</dd><dt>시간</dt><dd class="tabular">오늘 ${fmtT(bk.startAt)} ~ ${fmtT(bk.endAt)}</dd><dt>도착 예정</dt><dd class="tabular">${MODES[bk.mode].ic} ${fmtT(bk.eta)}</dd><dt>결제</dt><dd class="tabular">${won(bk.price)} · ${bk.method === "nutspay" ? "넛츠페이" : "카드"}</dd></dl>
        </div>
        <div class="pad stat3" style="margin-bottom:14px"><div><b>+${bk.min}분</b><span>되살린 시간</span></div><div><b>${won(bk.list - bk.price)}</b><span>아낀 금액</span></div><div><b>${bk.method === "nutspay" ? Math.round(bk.price * 0.01) : 0}P</b><span>L.POINT</span></div></div>
        <div class="pad col">
          <a class="btn dark" href="${NP.directionsUrl(st, bk.mode)}" target="_blank" rel="noopener">네이버 지도 길찾기 ↗</a>
          <a class="btn ghost" href="${NP.appDirections(st, bk.mode)}">네이버 지도 앱으로 열기</a>
          <div class="tiny muted" style="text-align:center">${esc(st.naver.roadAddress)}</div>
        </div>
        <div class="note" style="margin:16px 16px 24px">그냥 사라졌을 ${bk.min}분이 매출로 바뀌었어요. 넛츠의 북극성 지표는 <b>채워진 슬롯 수</b> — 되살린 시간의 총량이에요.</div>
      </div>`);
    $("[data-home]", p).onclick = () => { clearPages(); switchTab("home"); };
  }
  function qrSvg(seed) {
    let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
    let cells = ""; const n = 21;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      let on;
      if (finder) { const fx = x < 7 ? x : x - (n - 7), fy = y < 7 ? y : y - (n - 7); on = fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4); }
      else on = rnd() > 0.55;
      if (on) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    return `<svg class="qr" viewBox="-1 -1 ${n + 2} ${n + 2}" fill="#4A2A12" shape-rendering="crispEdges" aria-label="입장 코드"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/>${cells}</svg>`;
  }

  /* ============================================================
     보물찾기
     ============================================================ */
  function openTreasure(id) {
    const t = treasures.find(x => x.id === id), mode = S.mode || "walk", tr = travel(t, mode), done = S.claimed.includes(id);
    const p = pushPage(`
      <div class="topbar"><button class="iconbtn" data-back>${icon("back")}</button><span class="title">동네 보물찾기</span><span style="width:38px"></span></div>
      <div class="scroll"><div class="pad">
        <div class="card pad" style="text-align:center;padding:24px 16px"><div style="font-size:52px;line-height:1">🎁</div>
          <h2 class="display h1" style="margin-top:8px">${esc(t.prize)}</h2><div class="muted">${esc(t.name)} · ${MODES[mode].name} ${tr.min}분</div>
          <div class="small" style="margin-top:10px">${done ? "이미 받았어요 ✅" : `선착순 <b>${t.left}개</b> 남음 · ${fmtLeft(Math.max(0, minsLeft(t.until)))} 뒤 마감`}</div>
          <div class="tiny muted" style="margin-top:4px">${esc(t.naver.roadAddress)}</div></div>
        <div class="note" style="margin-top:14px"><b>어떻게 받나요?</b> 앱을 켜고 카페까지 걸어가서, 카운터의 넛츠 QR을 찍으면 끝. 놀이처럼 동네를 돌다가 첫 예약으로 이어지는 게 넛츠의 모객 방식이에요.</div>
        <div style="margin-top:14px" class="col">
          <a class="btn dark" href="${NP.placeUrl(t.name, "강남구")}" target="_blank" rel="noopener">네이버 플레이스에서 보기 ↗</a>
          <button class="btn" id="claim" ${done ? "disabled" : ""}>${done ? "받기 완료" : "도착했어요 — QR 인증"}</button>
        </div>
      </div></div>`);
    $("[data-back]", p).onclick = popPage;
    $("#claim", p).onclick = () => { S.claimed.push(id); t.left = Math.max(0, t.left - 1); save(); toast(`🎉 ${t.prize} 받았어요! 카운터에서 보여주세요`); popPage(); renderAll(); };
  }

  /* ============================================================
     전체 목록
     ============================================================ */
  function openAllList() {
    const mode = S.mode || "walk";
    const p = pushPage(`
      <div class="topbar"><button class="iconbtn" data-back>${icon("back")}</button><span class="title">지금 갈 수 있는 예약</span><span style="width:38px"></span></div>
      <div class="seg" style="margin:4px 16px 10px" id="sort-seg"><button class="on" data-sort="time">마감 임박순</button><button data-sort="near">가까운순</button><button data-sort="disc">할인 높은순</button></div>
      <div class="scroll" id="all-list"></div>`);
    let sort = "time";
    const draw = () => {
      const list = offers(mode).filter(o => o.reachable);
      list.sort((a, b) => sort === "near" ? a.tr.min - b.tr.min : sort === "disc" ? b.pct - a.pct : a.slot.startAt - b.slot.startAt);
      $("#all-list", p).innerHTML = list.map(cardHtml).join("") + `<div style="height:20px"></div>`;
    };
    draw();
    $("[data-back]", p).onclick = popPage;
    $("#sort-seg", p).onclick = e => { const b = e.target.closest("[data-sort]"); if (!b) return; sort = b.dataset.sort; $$("button", $("#sort-seg", p)).forEach(x => x.classList.toggle("on", x === b)); draw(); };
  }

  /* ============================================================
     검색 · 조건 알림
     ============================================================ */
  const alertLabel = a => `${(D.areas.find(x => x.id === a.areaId) || area()).name} ${a.cat === "any" ? "전체" : CATS[a.cat].name} ${a.minPct}%+`;
  function renderSearch() {
    const q = ($("#search-q").value || "").trim(), mode = S.mode || "walk", list = offers(mode);
    const res = !q ? [] : stores.filter(s => !s.regular && (s.name.includes(q) || CATS[s.cat].name.includes(q) || CATS[s.cat].short.includes(q) || s.dong.includes(q) || s.naver.roadAddress.includes(q)));
    $("#search-results").innerHTML = !q ? "" : res.length ? `<div class="group" style="margin-top:12px">${res.map(s => {
      const n = list.filter(o => o.store.id === s.id && o.reachable).length, c = CATS[s.cat];
      return `<div class="list-item" data-open="${s.id}" style="--c:${c.color}"><div class="thumb">${icon(s.cat)}</div><div class="grow"><div class="name">${esc(s.name)}</div><div class="sub">${esc(c.short)} · ${esc(s.dong)} · ${travel(s, mode).min}분</div></div>${n ? `<span class="pill ok">지금 ${n}자리</span>` : `<span class="pill off">자리 없음</span>`}</div>`; }).join("")}</div>` :
      `<div class="empty"><b>'${esc(q)}'에 맞는 매장이 없어요</b><span class="small">강남구 안에서만 찾고 있어요 — 밀도가 곧 매칭률이라서요.</span></div>`;

    $("#alert-list").innerHTML = S.alerts.length ? `<div class="group">${S.alerts.map((a, i) => {
      const n = alertMatches(a, list).length;
      return `<div class="list-item" data-alert="${i}"><div class="grow"><div class="name">🔔 ${esc(alertLabel(a))}</div><div class="sub">${a.window === 120 ? "지금부터 2시간" : a.window === 300 ? "오늘 오후" : "평일 저녁"} · ${n ? `<b style="color:var(--green)">지금 ${n}자리</b>` : "대기 중"}</div></div><button class="switch ${a.on ? "on" : ""}" data-toggle="${i}" aria-label="알림 켜기/끄기"></button><button class="iconbtn" data-del="${i}" aria-label="삭제" style="box-shadow:none;background:none">🗑</button></div>`; }).join("")}</div>` :
      `<div class="empty" style="padding-top:8px"><span class="small">아직 걸어둔 조건이 없어요. "지금 비었고 네일도 받고 싶은" 순간은 드물어요 — 조건을 걸어두면 그 순간을 놓치지 않아요.</span></div>`;
  }
  function openAlertForm(cat) {
    let a = { areaId:S.areaId, cat:cat || "any", minPct:30, window:120, on:true };
    const sh = openSheet(`<div class="h3" style="margin-bottom:10px">조건 알림 만들기</div>
      <label class="small muted">어디서</label><select class="field" id="al-area" style="margin:4px 0 10px">${D.areas.map(x => `<option value="${x.id}" ${x.id === a.areaId ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select>
      <label class="small muted">무엇을</label><select class="field" id="al-cat" style="margin:4px 0 10px"><option value="any">전체 업종</option>${Object.keys(CATS).filter(k => !["treasure", "lotte"].includes(k)).map(k => `<option value="${k}" ${k === a.cat ? "selected" : ""}>${esc(CATS[k].name)}</option>`).join("")}</select>
      <label class="small muted">언제</label><div class="seg" id="al-win" style="margin:4px 0 10px"><button class="on" data-v="120">지금부터 2시간</button><button data-v="300">오늘 오후</button><button data-v="900">평일 저녁</button></div>
      <label class="small muted">최소 할인율</label><div class="seg" id="al-pct" style="margin:4px 0 16px"><button data-v="20">20%+</button><button class="on" data-v="30">30%+</button><button data-v="40">40%+</button></div>
      <button class="btn" id="al-save">알림 걸어두기</button>`);
    sh.addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (!b) return; const seg = b.parentElement; $$("button", seg).forEach(x => x.classList.toggle("on", x === b)); if (seg.id === "al-win") a.window = +b.dataset.v; else a.minPct = +b.dataset.v; });
    $("#al-save", sh).onclick = () => { a.areaId = $("#al-area", sh).value; a.cat = $("#al-cat", sh).value; S.alerts.unshift(a); save(); closeSheet(); toast("🔔 자리가 뜨면 바로 알려드릴게요"); renderAll(); };
  }

  /* ============================================================
     저장 · 마이 · 사장님 모드
     ============================================================ */
  const toggleSave = id => { const i = S.saved.indexOf(id); i < 0 ? S.saved.push(id) : S.saved.splice(i, 1); save(); renderSaved(); };
  function renderSaved() {
    const mode = S.mode || "walk", list = offers(mode), items = S.saved.map(byId).filter(Boolean);
    $("#saved-scroll").innerHTML = items.length ? `<div class="group" style="margin-top:8px">${items.map(s => { const n = list.filter(o => o.store.id === s.id && o.reachable).length, c = CATS[s.cat];
      return `<div class="list-item" data-open="${s.id}" style="--c:${c.color}"><div class="thumb">${icon(s.cat)}</div><div class="grow"><div class="name">${esc(s.name)}</div><div class="sub">${esc(c.short)} · ${esc(s.dong)} · ★${s.rating}</div></div>${n ? `<span class="pill ok">지금 ${n}자리</span>` : `<span class="pill off">대기</span>`}</div>`; }).join("")}</div>
      <p class="tiny muted" style="padding:12px 20px">저장한 매장에 자리가 뜨면 알려드려요. 단, 결제 이력이 생긴 매장의 넛츠 가격은 더 이상 보이지 않아요.</p>` :
      `<div class="empty"><img src="assets/mascot.webp" alt=""><b>저장한 매장이 없어요</b><span class="small">마음에 드는 매장의 ♥를 눌러 두면, 자리가 뜰 때 먼저 알려드려요.</span></div>`;
  }

  function renderMy() {
    const mins = S.bookings.reduce((a, b) => a + b.min, 0), savedWon = S.bookings.reduce((a, b) => a + (b.list - b.price), 0), pts = S.bookings.reduce((a, b) => a + (b.method === "nutspay" ? Math.round(b.price * 0.01) : 0), 0);
    const regulars = stores.filter(s => s.regular);
    $("#my-scroll").innerHTML = `
      <div class="profile"><img src="assets/mascot.webp" alt=""><div class="grow"><div class="h2 display">넛츠 유저</div><div class="small muted">즉흥형 · ${area().name} 생활권 · 기본 ${MODES[S.mode || "walk"].name}</div></div></div>
      <div class="pad stat3"><div><b>${mins}분</b><span>되살린 시간</span></div><div><b>${won(savedWon)}</b><span>아낀 금액</span></div><div><b>${pts}P</b><span>L.POINT</span></div></div>
      <div class="section"><div class="section-title"><h2>예약 내역</h2></div></div>
      ${S.bookings.length ? `<div class="group">${S.bookings.map(b => `<div class="list-item" data-ticket="${b.id}" style="--c:${CATS[b.cat].color}"><div class="thumb">${icon(b.cat)}</div><div class="grow"><div class="name">${esc(b.storeName)}</div><div class="sub tabular">${esc(b.menu)} · ${fmtT(b.startAt)} · ${won(b.price)}</div></div><span class="pill ${b.endAt > now() ? "ok" : "off"}">${b.endAt > now() ? "예정" : "이용 완료"}</span></div>`).join("")}</div>` :
        `<div class="empty" style="padding-top:4px"><span class="small">아직 잡은 자리가 없어요. 홈에서 지금 갈 수 있는 자리를 찾아보세요.</span></div>`}
      <div class="section"><div class="section-title"><h2>설정</h2></div></div>
      <div class="group">
        <div class="list-item" data-act="area"><div class="grow"><div class="name">내 위치</div><div class="sub">${esc(area().name)} · 기기 안에서만 계산, 서버에 저장하지 않아요</div></div><span class="muted">›</span></div>
        <div class="list-item" data-act="mode"><div class="grow"><div class="name">기본 이동수단</div><div class="sub">${MODES[S.mode || "walk"].ic} ${MODES[S.mode || "walk"].name} · ${esc(MODES[S.mode || "walk"].hint)}</div></div><span class="muted">›</span></div>
        <div class="list-item" data-act="owner"><div class="grow"><div class="name">🏪 사장님 모드</div><div class="sub">빈 자리 올리기 · 입점비 0 · 월 구독료 0 · 수수료 3%</div></div><span class="muted">›</span></div>
      </div>
      <div class="section"><div class="section-title"><h2>단골 매장은 안 보여요</h2></div></div>
      <div class="pad"><div class="note">결제 이력이 있는 <b>${regulars.map(s => esc(s.name)).join(", ")}</b>의 넛츠 가격은 보이지 않아요. 단골이 정가를 안 내는 순간 사장님은 떠나요 — 넛츠는 할인 채널이 아니라 <b>새 손님을 만나는 채널</b>이에요. 정가 예약은 네이버 플레이스에서.</div></div>
      <div class="section"><div class="section-title"><h2>롯데와 함께</h2></div></div>
      <div class="pad col">
        <div class="card pad"><b>넛츠페이 = 롯데멤버스 결제 모듈</b><div class="small muted" style="margin-top:4px">결제·예치금은 L.PAY 인프라를 그대로 씁니다. 중복 투자 없이 L.POINT 적립·회원 연동.</div></div>
        <div class="card pad"><b>계열사 소멸 임박 재고</b><div class="small muted" style="margin-top:4px">시네마 상영 30분 전 · 마트 폐기 2시간 전 · 호텔 당일 18시 이후 — 같은 엔진, 시간·대상·수량 3중 제한.</div></div>
      </div>
      <div class="section"><div class="section-title"><h2>개인정보 · 안전</h2></div></div>
      <div class="pad col" style="padding-bottom:28px">
        <div class="note small">📍 위치는 도달 가능성 계산에만 쓰고 기기 안에서 처리해요. 위치기반서비스사업 신고 · 통신판매중개자 고지 대상.</div>
        <div class="note small">🚶 "빨리 가라"는 안 해요. 이동시간은 보수적으로 계산하고, 도보·대중교통을 먼저 보여드려요.</div>
        <div class="note small">📲 앱 설치 없이 웹에서 바로 써요. 자주 쓰신다면 브라우저 메뉴에서 <b>홈 화면에 추가</b>.</div>
      </div>`;
  }

  function openOwner() {
    const my = byId("s18"), mode = S.mode || "walk";
    let f = { menu:0, in:45, min:25, max:45 };
    const p = pushPage(`
      <div class="topbar"><button class="iconbtn" data-back>${icon("back")}</button><span class="title">사장님 모드</span><span style="width:38px"></span></div>
      <div class="scroll"><div class="pad owner-form">
        <div class="card pad"><div class="row between"><div><b>${esc(my.name)}</b><div class="small muted">${esc(my.naver.roadAddress)}</div></div><span class="pill ok">입점 중</span></div>
          <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><span class="pill off">입점비 0</span><span class="pill off">월 구독료 0</span><span class="pill off">수수료 3%</span><span class="pill off">이번 달 노출 ${12 + S.ownerPosts}/40</span></div></div>
        <div class="note" style="margin-top:12px">오늘 비어버린 자리를 올리면 넛츠가 ① 마감까지 남은 시간으로 값을 다시 매기고 ② 마감 전에 도착할 수 있는 사람에게만 보여주고 ③ 선결제로 매출을 확정해요.</div>
        <label>무슨 서비스가 비었나요</label><div class="seg" id="ow-menu">${my.menu.map((m, i) => `<button class="${i === 0 ? "on" : ""}" data-v="${i}">${esc(m.name)} ${m.min}분</button>`).join("")}</div>
        <label>언제부터</label><div class="seg" id="ow-in"><button data-v="30">30분 뒤</button><button class="on" data-v="45">45분 뒤</button><button data-v="60">1시간 뒤</button><button data-v="90">1시간 반 뒤</button></div>
        <label>시작 할인 <span id="ow-min-v">25%</span> → 마감 할인 <span id="ow-max-v">45%</span></label>
        <input type="range" id="ow-min" min="10" max="40" step="5" value="25"><input type="range" id="ow-max" min="30" max="60" step="5" value="45">
        <div class="card pad" style="margin-top:14px" id="ow-preview"></div>
        <div class="note small" style="margin:12px 0 24px">단골(결제 이력 고객)에게는 이 자리가 보이지 않아요. 상시 할인이 되지 않도록 월 노출 슬롯은 40개까지예요.</div>
        <button class="btn" id="ow-post">빈 자리 올리기</button><div style="height:24px"></div>
      </div></div>`);
    const preview = () => {
      const m = my.menu[f.menu], list = m.price, startPct = clamp(Math.round((f.min - area().demand * 2.5) / 5) * 5, f.min, f.max);
      const price = Math.round(list * (1 - startPct / 100) / 100) * 100;
      const reachUsers = Math.round(30 + D.areas.filter(a => dist(a, my) < 2).reduce((s, a) => s + 25 + a.demand * 20, 0));
      $("#ow-preview", p).innerHTML = `<div class="eyebrow">올리면 이렇게 보여요</div>
        <div class="row between" style="margin-top:8px"><b class="tabular">오늘 ${fmtT(BOOT + f.in * 60000)} · ${esc(m.name)}</b><span class="badge">${startPct}%</span></div>
        <div class="row" style="gap:8px;margin-top:4px"><span class="strike tabular">${won(list)}</span><span class="price tabular">${won(price)}</span><span class="small muted">→ 마감 직전 ${f.max}%까지</span></div>
        <dl class="kv" style="margin-top:10px"><dt>지금 도달 가능한 사용자</dt><dd>약 ${reachUsers}명</dd><dt>팔리면 정산 (97%)</dt><dd class="tabular">${won(price * 0.97)}</dd><dt>안 팔리면</dt><dd>0원 — 그래서 3%는 나누는 것</dd></dl>`;
    };
    preview();
    p.addEventListener("click", e => {
      if (e.target.closest("[data-back]")) return popPage();
      const b = e.target.closest("[data-v]"); if (!b) return;
      $$("button", b.parentElement).forEach(x => x.classList.toggle("on", x === b));
      if (b.parentElement.id === "ow-menu") f.menu = +b.dataset.v; else f.in = +b.dataset.v; preview();
    });
    p.addEventListener("input", e => {
      if (e.target.id === "ow-min") { f.min = +e.target.value; if (f.max < f.min + 5) { f.max = f.min + 5; $("#ow-max", p).value = f.max; } }
      if (e.target.id === "ow-max") { f.max = +e.target.value; if (f.min > f.max - 5) { f.min = f.max - 5; $("#ow-min", p).value = f.min; } }
      $("#ow-min-v", p).textContent = f.min + "%"; $("#ow-max-v", p).textContent = f.max + "%"; preview();
    });
    $("#ow-post", p).onclick = () => {
      my.slots.push({ id:`${my.id}-o${Date.now()}`, storeId:my.id, menu:f.menu, min:f.min, max:f.max, in:f.in, startAt: roundTo5(now() + f.in * 60000) });
      S.ownerPosts++; save(); popPage(); switchTab("home"); MAP.sel = my.id; centerOn(my); toast("🏪 자리를 올렸어요 — 도달 가능한 손님에게만 보여요"); renderAll();
    };
  }
  const centerOn = s => { MAP.lat = s.lat; MAP.lng = s.lng; };

  /* ============================================================
     시트 · 페이지 · 탭 · 토스트
     ============================================================ */
  function openSheet(html) {
    closeSheet();
    const w = document.createElement("div"); w.className = "sheet-wrap"; w.innerHTML = `<div class="sheet"><div class="handle"></div>${html}</div>`;
    w.addEventListener("click", e => { if (e.target === w) closeSheet(); });
    $("#sheet-root").appendChild(w); return $(".sheet", w);
  }
  const closeSheet = () => { $("#sheet-root").innerHTML = ""; };
  function openAreaSheet() {
    const sh = openSheet(`<div class="h3" style="margin-bottom:6px">어디에 계세요?</div><div class="tiny muted" style="margin-bottom:8px">1단계는 강남구 한 곳 — 밀도가 곧 매칭률이에요</div>${D.areas.map(a => `<div class="opt ${a.id === S.areaId ? "on" : ""}" data-area="${a.id}">📍 <span class="grow">${esc(a.name)}</span>${a.demand >= 2 ? `<span class="tiny muted">수요 많음</span>` : ""}</div>`).join("")}`);
    sh.addEventListener("click", e => { const o = e.target.closest("[data-area]"); if (!o) return; S.areaId = o.dataset.area; save(); centerMap(); MAP.sel = null; closeSheet(); renderAll(); });
  }
  function openModeSheet(after) {
    const sh = openSheet(`<div class="h3" style="margin-bottom:8px">어떻게 움직이세요?</div>${Object.entries(MODES).map(([k, m]) => `<div class="opt ${k === S.mode ? "on" : ""}" data-m="${k}"><span style="font-size:20px">${m.ic}</span><span class="grow">${m.name}<div class="tiny muted" style="font-weight:400">${esc(m.hint)}</div></span></div>`).join("")}`);
    sh.addEventListener("click", e => { const o = e.target.closest("[data-m]"); if (!o) return; setMode(o.dataset.m); closeSheet(); if (after) after(); });
  }
  const setMode = m => { S.mode = m; save(); renderAll(); };

  function pushPage(html) { const p = document.createElement("div"); p.className = "page"; p.innerHTML = html; $("#pages").appendChild(p); return p; }
  const popPage = () => { const ps = $$("#pages .page"); if (ps.length) ps[ps.length - 1].remove(); };
  const clearPages = () => { $("#pages").innerHTML = ""; };
  function switchTab(t) {
    clearPages(); closeSheet();
    ["home", "search", "saved", "my"].forEach(k => { $("#tab-" + k).hidden = k !== t; });
    $$("#tabbar button").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
    if (t === "home") renderMap();
    renderAll();
  }
  let toastT;
  function toast(msg) { $("#toast-root").innerHTML = `<div class="toast">${esc(msg)}</div>`; clearTimeout(toastT); toastT = setTimeout(() => { $("#toast-root").innerHTML = ""; }, 2600); }

  function renderAll() {
    if (!$("#tab-home").hidden) { renderHome(); renderMap(); }
    if (!$("#tab-search").hidden) renderSearch();
    if (!$("#tab-saved").hidden) renderSaved();
    if (!$("#tab-my").hidden) renderMy();
  }

  /* ============================================================
     온보딩 · 초기화
     ============================================================ */
  function renderOnboard() {
    $("#ob-modes").innerHTML = Object.entries(MODES).map(([k, m]) => `<button class="mode ${k === (S.mode || "walk") ? "on" : ""}" data-m="${k}"><span class="ic">${m.ic}</span><b>${m.name}</b><span>${k === "walk" ? "15분 · 약 1km" : k === "bike" ? "15분 · 약 3km" : "15분 · 약 4km"}</span></button>`).join("");
  }
  function init() {
    const ob = $("#onboard");
    if (!S.onboarded) { ob.hidden = false; renderOnboard(); if (!S.mode) S.mode = "walk"; }
    $("#ob-modes").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (!b) return; S.mode = b.dataset.m; renderOnboard(); });
    $("#ob-start").onclick = () => { S.onboarded = true; save(); ob.hidden = true; renderAll(); renderMap(); toast(`📍 ${area().name} 기준 · ${MODES[S.mode].name}로 갈 수 있는 자리만 보여드려요`); };

    centerMap(); initMap();
    $("#btn-area").onclick = openAreaSheet; $("#btn-mode").onclick = () => openModeSheet();
    $("#see-all").onclick = openAllList;
    $("#tabbar").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) switchTab(b.dataset.tab); });
    $("#search-q").addEventListener("input", renderSearch);
    $("#btn-new-alert").onclick = () => openAlertForm();

    /* 위임 — 카드 · 리스트 · 칩 · 알림 */
    document.body.addEventListener("click", e => {
      const t = e.target;
      const open = t.closest("[data-open]"); if (open && !t.closest(".page")) return openStore(open.dataset.open, open.dataset.slot);
      const openP = t.closest(".page [data-open]"); if (openP) return openStore(openP.dataset.open, openP.dataset.slot);
      const tr = t.closest(".tcard[data-treasure]"); if (tr) return openTreasure(tr.dataset.treasure);
      const chip = t.closest("#cat-chips [data-cat]"); if (chip) { catFilter = chip.dataset.cat; return renderHome(); }
      const nm = t.closest("[data-mode]"); if (nm && nm.closest(".nudge")) return setMode(nm.dataset.mode);
      const go = t.closest("[data-go]"); if (go) return switchTab(go.dataset.go);
      const tg = t.closest("[data-toggle]"); if (tg) { S.alerts[+tg.dataset.toggle].on = !S.alerts[+tg.dataset.toggle].on; save(); return renderAll(); }
      const del = t.closest("[data-del]"); if (del) { S.alerts.splice(+del.dataset.del, 1); save(); return renderAll(); }
      const tk = t.closest("[data-ticket]"); if (tk) { const b = S.bookings.find(x => x.id === tk.dataset.ticket); if (b && byId(b.storeId)) return openTicket(b); }
      const act = t.closest("[data-act]"); if (act) { if (act.dataset.act === "area") openAreaSheet(); if (act.dataset.act === "mode") openModeSheet(); if (act.dataset.act === "owner") openOwner(); }
    });

    renderAll(); renderMap();
    setInterval(() => { if (!$("#tab-home").hidden && !$$("#pages .page").length && !$(".sheet-wrap")) { renderHome(); renderMap(); } }, 30000);

    /* 네이버 플레이스 실데이터 (키가 있을 때만) */
    NP.fetchLive(CATS).then(live => { if (live && live.length) toast(`네이버 플레이스에서 매장 ${live.length}곳을 불러왔어요`); });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
