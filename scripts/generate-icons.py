#!/usr/bin/env python3
"""Rasterize the CricLab mark at every launcher / favicon size.

Each size is resampled from the 1024 master with LANCZOS — never upscaled from
a smaller derivative. Maskable icons sit on a sampled lime fill with the mark
inset so Android can crop to a circle without clipping the ball.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public"
SRC = ROOT / "icons" / "icon-source.png"
OUT = ROOT / "icons"

# Home-screen, splash, shortcut, and favicon sizes used by the manifest + HTML.
ANY_SIZES = (16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024)
MASKABLE_SIZES = (192, 512, 1024)
# Fraction of the canvas the artwork occupies on a maskable plate (safe zone).
MASKABLE_SCALE = 0.72


def resample(src: Image.Image, size: int) -> Image.Image:
    return src.resize((size, size), Image.Resampling.LANCZOS)


def maskable(src: Image.Image, size: int) -> Image.Image:
    plate = Image.new("RGB", (size, size), src.getpixel((2, 2)))
    inner = max(1, round(size * MASKABLE_SCALE))
    mark = resample(src, inner)
    offset = (size - inner) // 2
    plate.paste(mark, (offset, offset))
    return plate


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    if src.size != (1024, 1024):
        src = resample(src, 1024)
    OUT.mkdir(parents=True, exist_ok=True)

    for n in ANY_SIZES:
        resample(src, n).save(OUT / f"icon-{n}.png", "PNG", optimize=True)

    for n in MASKABLE_SIZES:
        maskable(src, n).save(OUT / f"icon-maskable-{n}.png", "PNG", optimize=True)

    # Apple home screen (180) and a multi-size ICO for older browsers.
    resample(src, 180).save(ROOT / "apple-touch-icon.png", "PNG", optimize=True)
    ico_frames = [resample(src, n) for n in (16, 32, 48)]
    ico_frames[0].save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=ico_frames[1:],
    )
    print(f"Wrote {len(ANY_SIZES)} any + {len(MASKABLE_SIZES)} maskable icons, apple-touch-icon, favicon.ico")


if __name__ == "__main__":
    main()
