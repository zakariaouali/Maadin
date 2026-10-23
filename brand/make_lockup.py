"""Compact horizontal lockup (M + MARTISANA + مارتيسانا) rendered in Chromium so the
Arabic is shaped correctly. Writes transparent PNGs in gold (dark bg) and ink (light bg)."""
import base64, sys
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
M_BOX = (468, 448, 818, 752)


def m_png(src_name, out_name):
    im = Image.open(HERE / src_name).convert("RGBA")
    px = im.load()
    for y in range(745, 790):                 # dagger tip of the master sits under the M's point
        for x in range(605, 680):
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)
    for y in range(735, 790):
        for x in range(650, 700):
            r, g, b, _ = px[x, y]; px[x, y] = (r, g, b, 0)
    for y in range(440, 480):
        for x in range(808, 830):
            r, g, b, _ = px[x, y]; px[x, y] = (r, g, b, 0)
    im.crop(M_BOX).save(HERE / out_name)
    return HERE / out_name


def b64(p):
    return base64.b64encode(Path(p).read_bytes()).decode()


def build(variant, m_file, text_color, ar_color, out):
    html = f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Cairo:wght@600;700&display=swap" rel="stylesheet">
<style>
 html,body{{margin:0;background:transparent}}
 .wrap{{display:inline-flex;align-items:center;gap:28px;padding:24px 32px}}
 img{{height:150px;display:block}}
 .t{{display:flex;flex-direction:column;align-items:flex-start;gap:6px}}
 .en{{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:92px;letter-spacing:.2em;line-height:1;color:{text_color}}}
 .ar{{font-family:'Cairo',sans-serif;font-weight:700;font-size:56px;line-height:1.1;color:{ar_color};direction:rtl;align-self:center}}
</style></head><body>
<div class="wrap" id="logo"><img src="data:image/png;base64,{b64(m_file)}">
<div class="t"><div class="en">MARTISANA</div><div class="ar">مارتيسانا</div></div></div>
</body></html>"""
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(device_scale_factor=2)
        pg.set_content(html)
        pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready")
        pg.locator("#logo").screenshot(path=str(HERE / out), omit_background=True)
        b.close()
    print("wrote", out)


gold_m = m_png("martisana-logo-gold.png", "_m_gold.png")
ink_m = m_png("martisana-logo-black.png", "_m_ink.png")
build("gold", gold_m, "#D4AF5A", "#D4AF5A", "martisana-lockup-gold.png")
build("ink", ink_m, "#1F1B16", "#1F1B16", "martisana-lockup-ink.png")
