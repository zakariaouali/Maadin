"""Exports the web-ready files into frontend/public, frontend/app and backend/public.
Run:  python export_web.py      (after make_variants.py / make_drop_set.py)"""
from pathlib import Path
from PIL import Image
import make_drop_set as b

ROOT = b.HERE.parent
PUB = ROOT / "frontend" / "public"
APP = ROOT / "frontend" / "app"


def resized(src, width, dst):
    im = Image.open(b.HERE / src)
    im = im.crop(im.getchannel("A").getbbox())      # drop the transparent padding so the logo fills its box
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, optimize=True)
    print("wrote", dst.relative_to(ROOT), im.size)


# header / auth / footer lockups (transparent). 900px wide is crisp up to ~4x of the 220px displays
resized("martisana-lockup-ink.png", 900, PUB / "logo-lockup-ink.png")
resized("martisana-lockup-gold.png", 900, PUB / "logo-lockup-gold.png")

# gold for LIGHT backgrounds (the header): the pale gold used on dark is only 2:1 on white, so
# recolour the one-colour ink lockup in a deeper gold (3.7:1 on white, still clearly gold)
def deep_gold(src, dst, rgb=(168, 127, 16), width=900):
    im = Image.open(b.HERE / src).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    solid = Image.new("RGBA", im.size, rgb + (255,))
    solid.putalpha(im.getchannel("A"))
    solid = solid.resize((width, round(solid.height * width / solid.width)), Image.LANCZOS)
    solid.save(dst, optimize=True)
    print("wrote", dst.relative_to(ROOT), solid.size)


deep_gold("martisana-lockup-ink.png", PUB / "logo-lockup-gold-deep.png")

# square logo (structured data / generic uses) = the real drop on the dark tile
Image.open(b.HERE / "martisana-icon-512.png").save(PUB / "logo.png", optimize=True)
Image.open(b.HERE / "martisana-icon-512.png").save(ROOT / "backend" / "public" / "logo.png", optimize=True)

# tab icon: the SIMPLIFIED drop (the filigree is unreadable in a 16px tab); iOS home-screen icon: the real drop
b.drawn_drop_icon(192).save(APP / "icon.png", optimize=True)
b.real_drop_icon(180).save(APP / "apple-icon.png", optimize=True)
small = [b.drawn_drop_icon(s) for s in (48, 32, 16)]
small[0].save(APP / "favicon.ico", sizes=[(48, 48), (32, 32), (16, 16)], append_images=small[1:])

# social share card 1200x630: the approved emblem, centred, on the brand black
card = Image.new("RGB", (1200, 630), (31, 27, 22))
emblem = Image.open(b.HERE / "martisana-logo-gold.png").convert("RGBA")
emblem = emblem.resize((630, 630), Image.LANCZOS)
card.paste(emblem, ((1200 - 630) // 2, 0), emblem)
card.save(PUB / "og-image.png", optimize=True)
print("wrote og-image.png")
