import re, pathlib, json

md = pathlib.Path(__file__.rsplit('/',1)[0] + '/04_presentation-script.md').read_text()
blocks = re.findall(r'## (S(\d+) · [^\n`]+)`\[(\d+:\d\d)\]`\n\n\*\*화면\*\* — (.*?)\n\n\*\*대본\*\*\n(.*?)(?=\n\*\*전환\*\*|\n---)(?:\n\*\*전환\*\* — (.*?)\n)?', md, re.S)
def esc(t): return t.replace('\\', '\\\\').replace("'", "\\'").strip()
dur = {}
out_full, out_script = [], []
for title, num, cum, screen, lines, cue in blocks:
    n = int(num)
    name = title.strip().split(' · ', 1)[1].replace('★', '').strip()
    txt = lines
    sec = len(re.sub(r'\s+', '', txt.replace('**', '').replace('/', ''))) / 5.0 + txt.count('/') * 0.8 + 1.5
    d = f"{int(sec)//60}:{int(sec)%60:02d}"
    dur[n] = (cum, d)
    ls = [esc(l) for l in txt.strip().split('\n') if l.strip()]
    arr = "[" + ",\n   ".join(f"'{l}'" for l in ls) + "]"
    cu = f"'{esc(cue)}'" if cue and cue.strip() else 'null'
    out_full.append(f"SC({n}, '{esc(name)}  ({d})',\n  '{esc(screen)}',\n  {arr},\n  {cu});\n")
    out_script.append(f"S({n}, '{esc(name)}', '{d}',\n  '{esc(screen)}',\n  {arr},\n  {cu});\n")
pathlib.Path('/tmp/sc_full.txt').write_text("\n".join(out_full))
pathlib.Path('/tmp/sc_script.txt').write_text("\n".join(out_script))
# 시간 배분 행
notes = {1:'천천히. 여기서 서두르면 전부 무너집니다', 2:'**가장 중요한 주장. "왜 아직 없나"까지 답할 것**',
         4:'**작동 원리. 애니메이션 타이밍에 맞춰**', 9:'표를 손으로 짚으며', 10:'또박또박', 12:'마지막 2초 침묵'}
rows=[]
for title, num, cum, *_ in blocks:
    n=int(num); name=title.strip().split(' · ',1)[1].replace('★','').strip()
    c_, d_ = dur[n]
    star = n in (2,4)
    if star:
        rows.append(f"  [{{ t: '**S{n} {name}**', color: RED }}, {{ t: '{c_}', color: RED }}, {{ t: '**{d_}**', color: RED }}, {{ t: '{notes.get(n,'')}', color: RED }}],")
    else:
        rows.append(f"  ['S{n} {name}', '{c_}', '{d_}', '{notes.get(n,'')}'],")
tot = 0
for title, num, cum, screen, lines, cue in blocks:
    tot += len(re.sub(r'\s+','',lines.replace('**','').replace('/','')))/5.0 + lines.count('/')*0.8 + 1.5
rows.append(f"  [{{ t: '**합계**', color: NAVY }}, '', {{ t: '**{int(tot)//60}:{int(tot)%60:02d}**', color: NAVY }}, {{ t: '10:00까지 여유 {int(600-tot)}초', color: NAVY }}],")
pathlib.Path('/tmp/timerows.txt').write_text("\n".join(rows))
print("슬라이드", len(blocks), "장 / 합계", f"{int(tot)//60}:{int(tot)%60:02d}")
