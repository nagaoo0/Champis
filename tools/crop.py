# cuts every figure out of the page renders and drops the paper background
# usage: python crop.py   (reads source/figures.json, writes public/img/*.webp)
import json
from html import escape
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).parent.parent
PAGES = ROOT / "tools" / "out" / "pages"
OUT = ROOT / "public" / "img"
INK = (43, 33, 24)  # dark brown, matches the css --ink
PAPER, LINE = 225, 90  # grey levels: lighter than PAPER is background, darker than LINE is full ink
MAX_SIDE = 700

OUT.mkdir(parents=True, exist_ok=True)
figures = json.loads((ROOT / "source" / "figures.json").read_text(encoding="utf8"))
cache = {}

for fig in figures:
    if "box" not in fig:
        continue  # hand drawn picto, see draw_aiguillons.py
    page = cache.get(fig["page"]) or Image.open(PAGES / f"p{fig['page']:02d}.png")
    cache[fig["page"]] = page
    w, h = page.size
    x0, y0, x1, y1 = fig["box"]
    gray = ImageOps.grayscale(page.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))))

    # darkness becomes opacity, so lines keep their soft edges
    alpha = gray.point(lambda v: 0 if v >= PAPER else 255 if v <= LINE else int((PAPER - v) * 255 / (PAPER - LINE)))
    img = Image.new("RGBA", gray.size, INK + (0,))
    img.putalpha(alpha)
    img.thumbnail((MAX_SIDE, MAX_SIDE))
    img.save(OUT / f"{fig['name']}.webp", quality=85)

cards = "".join(
    f'<figure><img src="../../public/img/{escape(f["name"])}.webp"><figcaption>{escape(f["name"])}<br>{escape(f.get("species", ""))}</figcaption></figure>'
    for f in figures
)
(ROOT / "tools" / "out" / "contact.html").write_text(
    "<style>body{background:#f6f0e1;font:12px sans-serif;display:flex;flex-wrap:wrap;gap:12px}"
    "figure{margin:0;width:220px}img{max-width:220px;max-height:220px;border:1px dashed #bbb}</style>" + cards,
    encoding="utf8",
)
print(f"{len(figures)} figures -> {OUT}")
