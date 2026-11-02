# render every pdf page to png, plus a light web copy for the "livret" page
# usage: python render_pages.py <file.pdf>
import sys
from pathlib import Path

import pymupdf as fitz
from PIL import Image, ImageOps

UPSIDE_DOWN = {31}
BLANK = {42}
DPI = 200
WEB_WIDTH = 1100

root = Path(__file__).parent.parent
out = root / "tools" / "out" / "pages"
web = root / "public" / "livret"
out.mkdir(parents=True, exist_ok=True)
web.mkdir(parents=True, exist_ok=True)

doc = fitz.open(sys.argv[1])
for i, page in enumerate(doc, start=1):
    if i in UPSIDE_DOWN:
        page.set_rotation((page.rotation + 180) % 360)
    png = out / f"p{i:02d}.png"
    page.get_pixmap(dpi=DPI).save(png)
    if i not in BLANK:
        img = ImageOps.grayscale(Image.open(png))
        img.thumbnail((WEB_WIDTH, WEB_WIDTH * 2))
        img.save(web / f"p{i:02d}.webp", quality=70)
print(f"{len(doc)} pages -> {out} and {web}")
