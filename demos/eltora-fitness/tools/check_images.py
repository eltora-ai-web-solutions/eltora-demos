#!/usr/bin/env python3
"""
ELTORA FITNESS - image checker.   Run:  python3 tools/check_images.py
Checks every <img> in index.html: file exists, is a real image, is at least 1100px
on its long edge, and reports files in assets/images/ that nothing uses.
Needs Pillow for the size checks:  pip install pillow
Exit code 0 = all good, 1 = something needs attention.
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    from PIL import Image
except ImportError:
    Image = None
html = re.sub(r"<!--.*?-->", "", open(os.path.join(ROOT, "index.html"), encoding="utf-8").read(), flags=re.S)
srcs = re.findall(r'<img[^>]*\ssrc="(assets/images/[^"]+)"', html)
used, problems = {}, []
for s in srcs:
    used.setdefault(s, 0); used[s] += 1
for s in sorted(used):
    p = os.path.join(ROOT, s)
    if not os.path.exists(p):
        problems.append("MISSING  " + s); continue
    if Image:
        w, h = Image.open(p).size
        if max(w, h) < 1100:
            problems.append("SMALL    %s (%dx%d)" % (s, w, h))
on_disk = {"assets/images/" + f for f in os.listdir(os.path.join(ROOT, "assets", "images")) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))}
unused = sorted(on_disk - set(used))
print("<img> tags: %d   distinct files used: %d   files in assets/images: %d" % (len(srcs), len(used), len(on_disk)))
for s in sorted(used): print("  %2dx  %s" % (used[s], s))
for u in unused: problems.append("UNUSED   " + u)
print("\n" + ("Needs attention:\n  " + "\n  ".join(problems) if problems else "All image checks passed."))
sys.exit(1 if problems else 0)
