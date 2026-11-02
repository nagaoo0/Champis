# draws the spines picto (the booklet has no hydnum drawing), usage: python draw_aiguillons.py
from pathlib import Path

from PIL import Image, ImageDraw

S = 4  # draw big, downscale for smooth lines
W, H = 300 * S, 300 * S
INK = (43, 33, 24, 255)
im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
lw = 5 * S

# cap: upper dome and flat underside
d.arc([30 * S, 40 * S, 270 * S, 200 * S], 180, 360, fill=INK, width=lw)
d.line([30 * S, 120 * S, 270 * S, 120 * S], fill=INK, width=lw)
# spines hanging under the cap: tapering cones, staggered lengths
for i, x in enumerate(range(40, 264, 10)):
    if 126 <= x <= 174:
        continue  # leave room for the stem
    length = 34 if i % 2 else 46
    d.polygon([((x - 4) * S, 121 * S), ((x + 4) * S, 121 * S), (x * S, (121 + length) * S)], fill=INK)
# stem
d.line([132 * S, 122 * S, 128 * S, 270 * S], fill=INK, width=lw)
d.line([168 * S, 122 * S, 172 * S, 270 * S], fill=INK, width=lw)
d.arc([128 * S, 250 * S, 172 * S, 285 * S], 0, 180, fill=INK, width=lw)

im = im.resize((300, 300), Image.LANCZOS)
im.save(Path(__file__).parent.parent / "public" / "img" / "picto-aiguillons.webp", quality=90)
