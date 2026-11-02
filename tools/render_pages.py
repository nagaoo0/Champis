# render every pdf page to png, usage: python render_pages.py <file.pdf>
import sys
from pathlib import Path

import pymupdf as fitz

UPSIDE_DOWN = {31}
DPI = 200

out = Path(__file__).parent / "out" / "pages"
out.mkdir(parents=True, exist_ok=True)

doc = fitz.open(sys.argv[1])
for i, page in enumerate(doc, start=1):
    if i in UPSIDE_DOWN:
        page.set_rotation((page.rotation + 180) % 360)
    page.get_pixmap(dpi=DPI).save(out / f"p{i:02d}.png")
print(f"{len(doc)} pages -> {out}")
