"""Favicon / app icon set.

* 512 / 180 / 96 : the filigree M cut from the master (looks exactly like the logo)
* 48 / 32 / 16   : a solid serif M in the same gold. The filigree turns to mud below
                   ~64px, so small sizes use a simplified letterform (normal practice).
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont

INK = (31, 27, 22, 255)
GOLD = (212, 175, 90, 255)

gold = Image.open("martisana-logo-gold.png").copy()

# Remove the dagger tip that sits just under the M's lower point in the master.
a = np.asarray(gold).copy()
a[745:790, 605:680, 3] = 0
a[735:790, 650:700, 3] = 0   # dagger tip, right of the V point
a[440:480, 808:830, 3] = 0   # stray dot at the M's top-right corner
gold = Image.fromarray(a, "RGBA")
m = gold.crop((468, 448, 818, 752))

def base(size, radius=0.22):
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(bg).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * radius), fill=INK)
    return bg

def filigree(size, pad=0.17):
    bg = base(size)
    inner = int(size * (1 - 2 * pad))
    s = inner / max(m.size)
    mm = m.resize((max(1, int(m.width * s)), max(1, int(m.height * s))), Image.LANCZOS)
    bg.alpha_composite(mm, ((size - mm.width) // 2, (size - mm.height) // 2))
    return bg

FONT = "C:/Windows/Fonts/cambriab.ttf"
def solid(size, pad=0.14):
    # draw big then downscale = smoother edges at tiny sizes
    big = size * 8
    bg = base(big)
    d = ImageDraw.Draw(bg)
    f = ImageFont.truetype(FONT, int(big * (1 - 2 * pad) * 1.12))
    bbox = d.textbbox((0, 0), "M", font=f)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((big - w) / 2 - bbox[0], (big - h) / 2 - bbox[1]), "M", font=f, fill=GOLD)
    return bg.resize((size, size), Image.LANCZOS)

for s in (512, 180, 96):
    filigree(s).save(f"martisana-icon-{s}.png")
for s in (48, 32, 16):
    solid(s).save(f"martisana-icon-{s}.png")
filigree(512).save("martisana-icon.png")

# .ico with the three small sizes
imgs = [Image.open(f"martisana-icon-{s}.png") for s in (48, 32, 16)]
imgs[0].save("favicon.ico", sizes=[(48, 48), (32, 32), (16, 16)], append_images=imgs[1:])

# preview sheet at real sizes on light and dark tab bars, zoomed 3x for viewing
sheet = Image.new("RGB", (330, 100), (240, 240, 240))
sheet.paste(Image.new("RGB", (165, 100), (40, 40, 40)), (165, 0))
x = 8
for off in (0, 165):
    x = off + 8
    for s in (96, 48, 32, 16):
        ic = Image.open(f"martisana-icon-{s}.png")
        sheet.paste(ic, (x, 8), ic)
        x += s + 8 if s != 96 else 0
        if s == 96:
            x += 0
sheet = sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST)
sheet.save("_icon_sizes.png")
print("ok")
