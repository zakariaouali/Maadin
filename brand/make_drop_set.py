"""Martisana asset set built on the DROP emblem (instead of the lone M).

1. the drop, cut from the master with the arched name removed (palms and icons kept, as in the master)
2. horizontal lockups: drop + MARTISANA + مارتيسانا   (gold for dark bg, ink for light bg)
3. icons: >=180px use the real drop from the master; 96/48/32/16 use a simplified drawn drop + solid M
4. brand preview sheet

Run:  python make_drop_set.py   (needs make_variants.py to have run first)
"""
import base64
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
INK = (31, 27, 22, 255)
GOLD = (212, 175, 90, 255)
BOX = (262, 55, 1020, 1088)          # the drop, in master pixels


# ---------------------------------------------------------------- 1. the drop
def erase(a, x0, y0, x1, y1):
    a[y0:y1, x0:x1, 3] = 0


def cut_drop(src):
    a = np.asarray(Image.open(HERE / src).convert("RGBA")).copy()
    # the arched MARTISANA: letter by letter, leaving the palm leaves and their crossed stems
    erase(a, 395, 995, 462, 1072)     # M
    erase(a, 455, 1052, 512, 1116)    # A
    erase(a, 505, 1068, 592, 1130)    # R
    erase(a, 560, 1086, 725, 1140)    # T I
    erase(a, 700, 1070, 770, 1140)    # S
    erase(a, 765, 1056, 836, 1110)    # N
    erase(a, 832, 1000, 900, 1072)    # A
    a[1088:, :, 3] = 0
    return Image.fromarray(a, "RGBA").crop(BOX)


gold_drop = cut_drop("martisana-logo-gold.png")
ink_drop = cut_drop("martisana-logo-black.png")
gold_drop.save(HERE / "martisana-drop-gold.png")
ink_drop.save(HERE / "martisana-drop-ink.png")


# ---------------------------------------------------------------- 2. lockups
def b64(p):
    return base64.b64encode(Path(p).read_bytes()).decode()


def lockup(drop_file, color, out):
    html = f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Cairo:wght@700&display=swap" rel="stylesheet">
<style>
 html,body{{margin:0;background:transparent}}
 .wrap{{display:inline-flex;align-items:center;gap:36px;padding:24px 32px}}
 img{{height:260px;display:block}}
 .t{{display:flex;flex-direction:column;align-items:flex-start;gap:8px}}
 .en{{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:96px;letter-spacing:.2em;line-height:1;color:{color}}}
 .ar{{font-family:'Cairo',sans-serif;font-weight:700;font-size:60px;line-height:1.1;color:{color};direction:rtl;align-self:center}}
</style></head><body>
<div class="wrap" id="logo"><img src="data:image/png;base64,{b64(HERE / drop_file)}">
<div class="t"><div class="en">MARTISANA</div><div class="ar">مارتيسانا</div></div></div></body></html>"""
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(device_scale_factor=2)
        pg.set_content(html)
        pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready")
        pg.locator("#logo").screenshot(path=str(HERE / out), omit_background=True)
        b.close()


lockup("martisana-drop-gold.png", "#D4AF5A", "martisana-lockup-gold.png")
lockup("martisana-drop-ink.png", "#1F1B16", "martisana-lockup-ink.png")


# ---------------------------------------------------------------- 3. icons
def tile(size, radius=0.22):
    t = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(t).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * radius), fill=INK)
    return t


def real_drop_icon(size, pad=0.09):
    t = tile(size)
    inner = int(size * (1 - 2 * pad))
    s = inner / max(gold_drop.size)
    d = gold_drop.resize((int(gold_drop.width * s), int(gold_drop.height * s)), Image.LANCZOS)
    t.alpha_composite(d, ((size - d.width) // 2, (size - d.height) // 2))
    return t


FONT = "C:/Windows/Fonts/cambriab.ttf"


def drawn_drop_icon(size):
    """Simplified drop (outline + solid M) for <=96px, drawn big then scaled down."""
    big = size * 10
    t = tile(big)
    d = ImageDraw.Draw(t)
    cx, cy, r = big * 0.5, big * 0.63, big * 0.30        # round belly
    apex = (big * 0.5, big * 0.07)
    g = math.acos(r / (cy - apex[1]))                      # angle at the centre between the apex and a tangent point
    # belly arc (y grows downward): from the left tangent point (up-left), round the left side,
    # the bottom and the right side, to the right tangent point (up-right)
    a0, a1 = 1.5 * math.pi - g, -0.5 * math.pi + g
    steps = 120
    arc = []
    for i in range(steps + 1):
        ph = a0 + (a1 - a0) * i / steps
        arc.append((cx + r * math.cos(ph), cy + r * math.sin(ph)))
    w = max(2, int(big * 0.05))
    d.line([apex] + arc + [apex], fill=GOLD, width=w, joint="curve")
    f = ImageFont.truetype(FONT, int(big * 0.36))
    bb = d.textbbox((0, 0), "M", font=f)
    d.text((cx - (bb[0] + bb[2]) / 2, cy - (bb[1] + bb[3]) / 2 + big * 0.005), "M", font=f, fill=GOLD)
    return t.resize((size, size), Image.LANCZOS)


for s in (512, 180):
    real_drop_icon(s).save(HERE / f"martisana-icon-{s}.png")
for s in (96, 48, 32, 16):
    drawn_drop_icon(s).save(HERE / f"martisana-icon-{s}.png")
real_drop_icon(512).save(HERE / "martisana-icon.png")
small = [Image.open(HERE / f"martisana-icon-{s}.png") for s in (48, 32, 16)]
small[0].save(HERE / "favicon.ico", sizes=[(48, 48), (32, 32), (16, 16)], append_images=small[1:])


# ---------------------------------------------------------------- 4. preview sheet
def preview():
    m = Image.open(HERE / "martisana-logo-gold.png").resize((600, 600), Image.LANCZOS)
    lg = Image.open(HERE / "martisana-lockup-gold.png")
    lg = lg.resize((760, int(lg.height * 760 / lg.width)), Image.LANCZOS)
    lk = Image.open(HERE / "martisana-lockup-ink.png")
    lk = lk.resize((760, int(lk.height * 760 / lk.width)), Image.LANCZOS)
    W = 1500
    H = max(860, 50 + lg.height + 30 + lk.height + 40 + 40 + 230 + 40)
    sh = Image.new("RGB", (W, H), (31, 27, 22))
    sh.paste(m, (40, 120), m)
    sh.paste(lg, (680, 40), lg)
    y2 = 40 + lg.height + 30
    sh.paste(Image.new("RGB", (W - 640, lk.height + 40), (251, 249, 244)), (640, y2))
    sh.paste(lk, (680, y2 + 20), lk)
    y3 = y2 + lk.height + 40 + 30
    sh.paste(Image.new("RGB", (W - 640, 230), (230, 226, 216)), (640, y3))
    x = 680
    for s in (180, 96, 48, 32, 16):
        i = Image.open(HERE / f"martisana-icon-{s}.png")
        sh.paste(i, (x, y3 + 25 + (180 - i.height) // 2), i)
        x += i.width + 40
    sh.save(HERE / "martisana-brand-preview.png")


preview()
print("ok")
