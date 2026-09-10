#!/usr/bin/env python3
"""Draw the 1024 px CricLab icon master from the same geometry as
src/components/site/Brand.tsx, then hand it to generate-icons.py.

Rendered at 4x and downsampled so every edge is anti-aliased.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "public" / "icons"
S = 4  # supersample
N = 1024 * S
U = N / 64  # one SVG unit


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def plate() -> Image.Image:
    """Diagonal gradient (#cfff6a → #b6f24a → #8fd12b) clipped to a rounded square."""
    img = Image.new("RGB", (N, N))
    px = img.load()
    c0, c1, c2 = (0xCF, 0xFF, 0x6A), (0xB6, 0xF2, 0x4A), (0x8F, 0xD1, 0x2B)
    # Column-wise fill along the diagonal keeps this fast enough at 4096².
    for x in range(N):
        for y in range(0, N, 1):
            t = (x + y) / (2 * N)
            px[x, y] = lerp(c0, c1, t / 0.55) if t < 0.55 else lerp(c1, c2, (t - 0.55) / 0.45)
    mask = Image.new("L", (N, N), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, N - 1, N - 1], radius=15 * U, fill=255)
    out = Image.new("RGB", (N, N), (0xB6, 0xF2, 0x4A))
    out.paste(img, mask=mask)
    return out


def bezier(p0, p1, p2, t):
    x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
    y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
    dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0])
    dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])
    return x, y, dx, dy


def main() -> None:
    img = plate()
    d = ImageDraw.Draw(img)
    lime = (0xB6, 0xF2, 0x4A)
    cx = cy = 32 * U
    r = 19 * U
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(0x05, 0x09, 0x0A))

    # Highlight on the leather.
    hi = Image.new("L", (N, N), 0)
    hd = ImageDraw.Draw(hi)
    hd.ellipse([cx - r * 0.95, cy - r * 1.05, cx + r * 0.35, cy + r * 0.1], fill=40)
    hi = hi.filter(ImageFilter.GaussianBlur(r * 0.35))
    ball_mask = Image.new("L", (N, N), 0)
    ImageDraw.Draw(ball_mask).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    hi = Image.composite(hi, Image.new("L", (N, N), 0), ball_mask)
    img.paste(Image.new("RGB", (N, N), (255, 255, 255)), mask=hi)
    d = ImageDraw.Draw(img)

    seams = [((22, 19.5), (35, 32), (22, 44.5)), ((42, 19.5), (29, 32), (42, 44.5))]
    for p0, p1, p2 in seams:
        pts = [bezier(p0, p1, p2, i / 80)[:2] for i in range(81)]
        d.line([(x * U, y * U) for x, y in pts], fill=lime, width=round(2.4 * U), joint="curve")
        for end in (pts[0], pts[-1]):
            d.ellipse([end[0] * U - 1.2 * U, end[1] * U - 1.2 * U, end[0] * U + 1.2 * U, end[1] * U + 1.2 * U], fill=lime)
        for t in (0.2, 0.4, 0.6, 0.8):
            x, y, dx, dy = bezier(p0, p1, p2, t)
            ln = (dx * dx + dy * dy) ** 0.5 or 1
            nx, ny = -dy / ln, dx / ln
            s = 1.9
            d.line(
                [((x - nx * s) * U, (y - ny * s) * U), ((x + nx * s) * U, (y + ny * s) * U)],
                fill=lime,
                width=round(1.5 * U),
            )

    master = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    ROOT.mkdir(parents=True, exist_ok=True)
    master.save(ROOT / "icon-source.png", "PNG", optimize=True)
    print("Wrote icon-source.png (1024)")


if __name__ == "__main__":
    main()
