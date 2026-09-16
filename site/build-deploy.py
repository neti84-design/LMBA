#!/usr/bin/env python3
"""공개용 배포 트리를 만듭니다 — site/ 내용을 저장소 루트에 놓고 Pages 워크플로를 붙입니다.

    python3 build-deploy.py <대상폴더>
"""
import os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DST = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "_deploy")
SKIP = {"build-onefile.py", "build-og.py", "build-deploy.py", "og.html"}

if os.path.isdir(DST):
    shutil.rmtree(DST)
os.makedirs(DST)

for name in os.listdir(HERE):
    if name in SKIP or name.startswith('.'):
        continue
    src, dst = os.path.join(HERE, name), os.path.join(DST, name)
    shutil.copytree(src, dst) if os.path.isdir(src) else shutil.copy2(src, dst)

os.makedirs(os.path.join(DST, ".github", "workflows"), exist_ok=True)
open(os.path.join(DST, ".github", "workflows", "pages.yml"), "w", encoding="utf-8").write("""name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
        with:
          enablement: true
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
""")
open(os.path.join(DST, ".nojekyll"), "w").write("")
print("deploy tree ready:", os.path.abspath(DST))
