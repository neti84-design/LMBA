#!/usr/bin/env python3
"""카톡·슬랙 링크 미리보기에 쓸 og.png 의 원본 페이지를 만듭니다.

    python3 build-og.py         # og.html 생성
    (그 다음 1200x630 으로 스크린샷을 찍어 og.png 로 저장)

index.html 의 CCTV 장면 스크립트를 그대로 가져와 쓰므로 장면이 따로 놀지 않습니다.
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "index.html"), encoding="utf-8").read()
scene = re.search(r'<script>\n/\* 가로 띠 CCTV 장면.*?</script>', src, re.S).group(0)
# 미리보기에는 모달이 없으므로 그 부분만 빼고 쓴다
scene = scene.replace("  var box = document.getElementById('lightbox')", "  var box = null; var _unused = document.getElementById('lightbox')")

HTML_TPL = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>L.GA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
  :root{--red:#E11D2E;--mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
        --sans:"Pretendard Variable",Pretendard,"Noto Sans KR",-apple-system,BlinkMacSystemFont,"Malgun Gothic",sans-serif}
  *{box-sizing:border-box}
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0E1420;color:#fff;font-family:var(--sans)}
  .card{position:relative;width:1200px;height:630px;display:flex;flex-direction:column;justify-content:space-between}
  .top{padding:56px 64px 0}
  .logo{display:inline-flex;align-items:baseline;font-weight:900;font-size:34px;letter-spacing:-0.04em}
  .logo .dot{width:11px;height:11px;background:var(--red);border-radius:50%;display:inline-block;margin-inline:3px}
  .logo small{font-family:var(--mono);font-size:14px;font-weight:500;letter-spacing:.14em;color:#AEB8C7;margin-left:14px}
  h1{margin:30px 0 0;font-size:58px;line-height:1.16;font-weight:900;letter-spacing:-0.035em}
  h1 em{font-style:normal;color:#FF3B4E}
  p{margin:20px 0 0;font-size:21px;color:#C9D0DA;max-width:40ch;line-height:1.55}
  .strip{position:relative;height:250px;background:#080D15;border-top:1px solid #2A3446}
  .strip canvas{display:block;width:1200px;height:250px}
  .strip .veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,13,21,.9),transparent 14%,transparent 86%,rgba(8,13,21,.9))}
  .strip .note{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;
               padding:26px 64px 16px;font-family:var(--mono);font-size:13px;letter-spacing:.05em;color:#97A3B4;
               background:linear-gradient(transparent,rgba(8,13,21,.85) 50%)}
  .strip .note b{color:#E4E8EE;font-weight:500}
</style>
</head>
<body>
<div class="card">
  <div class="top">
    <span class="logo">L<span class="dot"></span>GA <small>LOTTE GROWTH ANALYTICS</small></span>
    <h1>온라인에 GA가 있다면,<br>오프라인 매장에는 <em>L.GA</em>가 있습니다.</h1>
    <p>매장에 들어온 100명 중 브랜드가 아는 고객은 결제한 3명뿐입니다. 나머지 97명의 여정을 데이터로 바꿉니다.</p>
  </div>
  <div class="strip">
    <canvas id="scene"></canvas>
    <div class="veil"></div>
    <p class="note"><span><b>CAM 02</b> · 잠실점 2F 팝업존 B</span><span>엣지 추론 · 원본 영상 미전송 · 얼굴 특징값 미사용</span></p>
  </div>
</div>
__SCENE__
</body>
</html>
"""
HTML = HTML_TPL.replace("__SCENE__", scene)

open(os.path.join(HERE, "og.html"), "w", encoding="utf-8").write(HTML)
print("wrote og.html")
