"""Builds the transparent / one-color variants of the Martisana master logo.

Run:  python make_variants.py
Reads martisana-logo.jpeg, writes PNGs next to it. The master is never modified.
"""
import numpy as np
from PIL import Image

SRC = "martisana-logo.jpeg"
INK = (31, 27, 22)

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32) / 255.0

# The logo is gold on pure black, so "how bright" a pixel is = "how much logo" it is.
lum = a.max(axis=2)
lo, hi = 0.07, 0.55           # below lo: background, above hi: fully opaque
alpha = np.clip((lum - lo) / (hi - lo), 0, 1)

# Un-premultiply so the gold keeps its real color on any background.
safe = np.maximum(alpha, 1e-3)[..., None]
rgb = np.clip(a / np.maximum(lum[..., None], 1e-3), 0, 1)
rgb = np.where(alpha[..., None] > 0, rgb, 0)

def save(arr_rgb, name):
    out = np.dstack([arr_rgb, alpha])
    Image.fromarray((out * 255).astype(np.uint8), "RGBA").save(name)
    print("wrote", name)

save(rgb, "martisana-logo-gold.png")                       # for dark backgrounds
black = np.broadcast_to(np.array(INK, np.float32) / 255.0, rgb.shape)
save(black, "martisana-logo-black.png")                    # for light backgrounds / email
