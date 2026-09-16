#!/usr/bin/env python3
"""세 페이지를 한 파일로 묶습니다 — 계정도 서버도 없이 전달하기 위한 빌드.

    python3 build-onefile.py

각 페이지는 iframe 안에서 그대로 실행되므로 CSS·스크립트가 서로 간섭하지 않고,
페이지 사이 링크는 파일 안에서 가로채 이동합니다.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "LGA_시안_단일파일.html")
PAGES = {
    "home":   "index.html",
    "portal": "portal/index.html",
    "login":  "portal/login.html",
    "report": "portal/reports/glowlab-jamsil-2026-08.html",
}

SHELL = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>L.GA 홈페이지 · 파트너 포털 · 예시 리포트 (단일 파일)</title>
<style>
  html,body{height:100%%;margin:0;background:#F5F6F8}
  @media (prefers-color-scheme:dark){html,body{background:#0E1420}}
  #view{display:block;width:100%%;height:100%%;border:0}
  #boot{position:fixed;inset:0;display:grid;place-items:center;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Malgun Gothic",sans-serif;color:#5E6979}
  #boot[hidden]{display:none}
</style>
</head>
<body>
<div id="boot">L.GA 시안을 여는 중…</div>
<iframe id="view" title="L.GA 시안"></iframe>
<script id="pagedata" type="application/json">%s</script>
<script>
(function(){
  var PAGES = JSON.parse(document.getElementById('pagedata').textContent);
  var BY_PATH = {};
  Object.keys(PAGES).forEach(function(k){ BY_PATH['/' + PAGES[k].base] = k; });
  var view = document.getElementById('view'), boot = document.getElementById('boot');
  var current = null;

  function resolve(href, base){
    try { return new URL(href, 'https://x/' + base).pathname; } catch(e){ return null; }
  }

  function wire(key){
    var doc = view.contentDocument;
    if(!doc) return;
    var base = PAGES[key].base;
    doc.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href]');
      if(!a) return;
      var href = a.getAttribute('href');
      if(!href || href.charAt(0) === '#') return;
      var hash = '', i = href.indexOf('#');
      if(i >= 0){ hash = href.slice(i); href = href.slice(0, i); }
      if(/^https?:/i.test(href)) return;
      var target = BY_PATH[resolve(href, base)];
      e.preventDefault();
      if(target) go(target, hash);
    });
    var form = doc.querySelector('form');
    if(key === 'login' && form){
      form.addEventListener('submit', function(e){ e.preventDefault(); go('portal', ''); });
    }
  }

  function go(key, hash){
    if(!PAGES[key]) key = 'home';
    location.hash = key + (hash || '');
    if(current === key + (hash || '')) return;
    current = key + (hash || '');
    view.onload = function(){
      wire(key);
      if(hash){
        var el = view.contentDocument.querySelector(hash);
        if(el) el.scrollIntoView();
      }
      boot.hidden = true;
    };
    view.srcdoc = PAGES[key].html;
  }

  function fromHash(){
    var h = (location.hash || '#home').slice(1);
    var i = h.indexOf('#');
    if(i < 0) return { key: h || 'home', hash: '' };
    return { key: h.slice(0, i), hash: h.slice(i) };
  }

  window.addEventListener('hashchange', function(){
    var s = fromHash();
    if(current !== s.key + s.hash) go(s.key, s.hash);
  });

  var start = fromHash();
  go(start.key, start.hash);
})();
</script>
</body>
</html>
"""

data = {k: {"base": v, "html": open(os.path.join(HERE, v), encoding="utf-8").read()}
        for k, v in PAGES.items()}
payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
open(OUT, "w", encoding="utf-8").write(SHELL % payload)
print("wrote", OUT, os.path.getsize(OUT), "bytes")
