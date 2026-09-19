#!/usr/bin/env node
/* ============================================================
   넛츠 — 로컬 서버 (정적 파일 + 네이버 지역검색 프록시)
   ------------------------------------------------------------
   node server.js                       → http://localhost:8787 (시드 데이터)
   NAVER_CLIENT_ID=… NAVER_CLIENT_SECRET=… node server.js
                                        → /api/naver/local 이 실제 네이버 응답을 돌려줌

   키 발급: https://developers.naver.com  → 애플리케이션 등록 → "검색" API
   의존성 없음 (Node 18+).
   ============================================================ */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const ID = process.env.NAVER_CLIENT_ID;
const SECRET = process.env.NAVER_CLIENT_SECRET;

const MIME = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8",
  ".webp":"image/webp", ".png":"image/png", ".svg":"image/svg+xml", ".json":"application/json; charset=utf-8", ".md":"text/plain; charset=utf-8" };

async function naverLocal(query, display) {
  if (!ID || !SECRET) return { status:503, body:{ error:"NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수가 없습니다. 시드 데이터로 동작합니다." } };
  const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=${display || 5}&sort=comment`;
  const r = await fetch(url, { headers:{ "X-Naver-Client-Id":ID, "X-Naver-Client-Secret":SECRET } });
  return { status:r.status, body:await r.json() };
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);

  if (u.pathname === "/api/naver/local") {
    const { status, body } = await naverLocal(u.searchParams.get("query") || "강남구 네일샵", u.searchParams.get("display"));
    res.writeHead(status, { "Content-Type":"application/json; charset=utf-8", "Access-Control-Allow-Origin":"*" });
    return res.end(JSON.stringify(body));
  }
  if (u.pathname === "/config.js") {
    /* 키가 있을 때만 앱이 프록시를 쓰도록 알려 줍니다 */
    res.writeHead(200, { "Content-Type":MIME[".js"] });
    return res.end(`window.NUTS_CONFIG=${JSON.stringify({ apiBase: ID && SECRET ? "" : null })};`);
  }

  let file = path.normalize(path.join(ROOT, u.pathname === "/" ? "index.html" : u.pathname));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`넛츠 → http://localhost:${PORT}  (네이버 API: ${ID && SECRET ? "연결됨" : "키 없음 · 시드 데이터"})`);
});
