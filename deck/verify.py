#!/usr/bin/env python3
"""빌드된 pptx의 '판넬'(색이 채워진 도형)끼리 겹치는지 검사합니다.
   글자가 박스 안에 들어가는지는 build 가 검사하고, 박스끼리 부딪히는지는 여기서 검사합니다."""
import sys, zipfile, re, xml.etree.ElementTree as ET

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
EMU = 914400.0
SW, SH = 13.33, 7.5

def panels(xml):
    out = []
    for sp in ET.fromstring(xml).iter(P+"sp"):
        spPr = sp.find("./"+P+"spPr")
        if spPr is None: continue
        if spPr.find(A+"solidFill") is None: continue      # 채움 없는 텍스트 상자는 제외
        xf = spPr.find(A+"xfrm")
        if xf is None: continue
        o, e = xf.find(A+"off"), xf.find(A+"ext")
        if o is None or e is None: continue
        x, y = int(o.get("x"))/EMU, int(o.get("y"))/EMU
        w, h = int(e.get("cx"))/EMU, int(e.get("cy"))/EMU
        label = "".join(t.text or "" for t in sp.iter(A+"t"))[:24]
        out.append((x, y, w, h, label))
    return out

def overlap(a, b):
    ox = min(a[0]+a[2], b[0]+b[2]) - max(a[0], b[0])
    oy = min(a[1]+a[3], b[1]+b[3]) - max(a[1], b[1])
    return ox, oy

def main(path):
    z = zipfile.ZipFile(path)
    names = sorted([n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)],
                   key=lambda n: int(re.findall(r"\d+", n)[0]))
    bad = 0
    for n in names:
        num = int(re.findall(r"\d+", n)[0])
        ps = panels(z.read(n))
        for i in range(len(ps)):
            x, y, w, h, lab = ps[i]
            if x < -0.01 or y < -0.01 or x+w > SW+0.01 or y+h > SH+0.01:
                print("  슬라이드 %d: 화면 밖 — x=%.2f y=%.2f 우=%.2f 하=%.2f %s"
                      % (num, x, y, x+w, y+h, lab)); bad += 1
            for j in range(i+1, len(ps)):
                # 카드 안에 들어앉은 작은 배지는 정상 — 완전 포함이면 통과
                a, b = ps[i], ps[j]
                inside = (a[0] >= b[0]-.01 and a[1] >= b[1]-.01 and
                          a[0]+a[2] <= b[0]+b[2]+.01 and a[1]+a[3] <= b[1]+b[3]+.01)
                inside |= (b[0] >= a[0]-.01 and b[1] >= a[1]-.01 and
                           b[0]+b[2] <= a[0]+a[2]+.01 and b[1]+b[3] <= a[1]+a[3]+.01)
                if inside: continue
                ox, oy = overlap(a, b)
                if ox > 0.01 and oy > 0.01:
                    print("  슬라이드 %d: 도형 겹침 %.2f\" × %.2f\"  [%s] ↔ [%s]"
                          % (num, ox, oy, a[4] or "(무지)", b[4] or "(무지)")); bad += 1
    print("도형 점검: 문제 없음" if not bad else "도형 경고 %d건" % bad)
    return 0 if not bad else 1

if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "LGA_롯데신사업_발표.pptx"))
