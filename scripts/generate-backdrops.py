"""Draw the CricLab backdrop plates into public/backdrops/.

Generated rather than sourced: the palette is exactly ours, they scale to any
viewport, and there is no licensing question. See public/backdrops/README.md for
how they are used and how to replace them with photography.

Run from the repo root with the sibling backend's environment (numpy + cv2):
    source ../criclab-web-backend/.venv312/bin/activate
    python scripts/generate-backdrops.py
"""
from __future__ import annotations

import os

import cv2
import numpy as np

OUT = "public/backdrops"
rng = np.random.default_rng(23)


def save(name: str, img: np.ndarray, q: int = 84) -> None:
    os.makedirs(OUT, exist_ok=True)
    path = f"{OUT}/{name}"
    cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, q] if name.endswith(".jpg") else [])
    print(f"  {name:24s} {img.shape[1]}x{img.shape[0]}  {os.path.getsize(path) // 1024} KB")


def vgrad(h: int, w: int, top, bottom) -> np.ndarray:
    """Vertical gradient. Colours are given RGB; OpenCV wants BGR."""
    y = np.linspace(0, 1, h)[:, None, None]
    return (np.array(top[::-1], float) * (1 - y) + np.array(bottom[::-1], float) * y) * np.ones((h, w, 1))


def glow(img, cx, cy, rx, ry, colour, strength):
    """Gaussian light pool — no hard edge, unlike a clipped radial falloff."""
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    return img + np.exp(-(d**2) * 1.9)[..., None] * np.array(colour[::-1], float) * strength


def vignette(img, strength=0.30):
    """Darkened corners, so overlaid text always has somewhere to sit."""
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w * 0.72)) ** 2 + ((yy - h / 2) / (h * 0.78)) ** 2)
    return img * (1 - np.clip(d - 0.35, 0, 1)[..., None] * strength)


def noise(img, sigma):
    return img + rng.normal(0, sigma, img.shape[:2])[..., None]


def clamp(img):
    return np.clip(img, 0, 255).astype(np.uint8)


def stadium_night():
    h, w = 900, 1600
    img = vgrad(h, w, (9, 18, 16), (3, 7, 8))
    for cx in (0.10, 0.34, 0.66, 0.90):
        img = glow(img, int(w * cx), int(h * 0.15), 340, 300, (140, 195, 105), 0.40)
        img = glow(img, int(w * cx), int(h * 0.15), 70, 62, (225, 248, 195), 0.75)
    img = glow(img, w // 2, int(h * 1.15), 1000, 620, (28, 96, 64), 1.05)
    # Feathered stand band — a hard slice reads as a bug at full width.
    y = np.arange(h)
    band = (np.clip((y - h * 0.50) / (h * 0.09), 0, 1) * np.clip((h * 0.72 - y) / (h * 0.09), 0, 1))[:, None, None]
    img = img * (1 - band * 0.48)
    ys = rng.integers(int(h * 0.52), int(h * 0.70), 6000)
    xs = rng.integers(0, w, 6000)
    img[ys, xs] += rng.uniform(5, 30, (6000, 1))  # crowd speckle
    img = cv2.GaussianBlur(img, (0, 0), 0.7)
    return clamp(vignette(noise(img, 3.2)))


def pitch_perspective():
    h, w = 900, 1600
    img = vgrad(h, w, (6, 13, 12), (9, 26, 20))
    img = glow(img, w // 2, int(h * 0.04), 1000, 380, (110, 165, 90), 0.18)
    vp = (w // 2, int(h * 0.34))
    # A pitch is narrow: ~22% of the frame at the near edge, not 60%.
    strip = np.array([[int(w * 0.39), h], [int(w * 0.61), h], [vp[0] + 16, vp[1]], [vp[0] - 16, vp[1]]], np.int32)
    ov = img.copy()
    cv2.fillPoly(ov, [strip], (56, 74, 60))
    img = img * 0.90 + ov * 0.10
    for f, halfw in ((0.02, 0.105), (0.36, 0.072), (0.64, 0.042)):
        y = int(h - (h - vp[1]) * f)
        cv2.line(img, (int(w * 0.5 - w * halfw), y), (int(w * 0.5 + w * halfw), y),
                 (120, 150, 128), max(1, int(3 - f * 2)), cv2.LINE_AA)
    img = cv2.GaussianBlur(img, (0, 0), 2.2)
    return clamp(vignette(noise(img, 2.8), 0.34))


def nets():
    h, w = 900, 1600
    img = vgrad(h, w, (10, 20, 18), (5, 14, 12))
    img = glow(img, int(w * 0.25), int(h * 0.2), 420, 380, (130, 180, 100), 0.30)
    img = glow(img, int(w * 0.80), int(h * 0.35), 380, 340, (60, 120, 80), 0.34)
    for x in range(0, w, 26):
        cv2.line(img, (x, 0), (int(x + (x - w / 2) * 0.16), h), (26, 40, 34), 1, cv2.LINE_AA)
    for y in range(0, h, 26):
        cv2.line(img, (0, y), (w, y), (26, 40, 34), 1, cv2.LINE_AA)
    img = cv2.GaussianBlur(img, (0, 0), 1.6)
    return clamp(vignette(noise(img, 2.6)))


def bokeh():
    h, w = 900, 1600
    img = vgrad(h, w, (6, 12, 12), (4, 9, 10))
    for _ in range(46):
        cx, cy = rng.integers(0, w), rng.integers(0, h)
        r = rng.integers(30, 190)
        tint = (150, 200, 110) if rng.random() < 0.65 else (200, 170, 120)
        img = glow(img, cx, cy, r, r, tint, rng.uniform(0.08, 0.30))
    return clamp(vignette(noise(img, 2.5)))


def turf():
    h, w = 800, 1400
    img = vgrad(h, w, (16, 46, 32), (7, 24, 18))
    for i in range(-6, 20):  # mower stripes in perspective
        x0 = int(i * 120)
        x1 = int(w * 0.5 + (i - 7) * 300)
        ov = img.copy()
        cv2.fillPoly(ov, [np.array([[x0, 0], [x0 + 60, 0], [x1 + 150, h], [x1, h]], np.int32)], (10, 26, 18))
        img = img * 0.88 + ov * 0.12
    return clamp(cv2.GaussianBlur(noise(img, 4.5), (0, 0), 1.1))


def mesh_light():
    h, w = 900, 1500
    img = vgrad(h, w, (247, 250, 248), (222, 234, 227))
    img = glow(img, int(w * 0.88), int(h * 0.02), 700, 520, (155, 215, 95), 0.20)
    img = glow(img, int(w * 0.06), int(h * 0.95), 640, 480, (28, 92, 62), 0.13)
    img = glow(img, int(w * 0.42), int(h * 0.38), 560, 420, (255, 255, 255), 0.30)
    return clamp(noise(img, 1.8))


def grain():
    s = 256
    a = np.clip(np.abs(rng.normal(128, 26, (s, s)) - 128) * 2.4, 0, 46)
    png = np.zeros((s, s, 4), np.uint8)
    png[..., :3] = 255
    png[..., 3] = a.astype(np.uint8)
    return png


if __name__ == "__main__":
    print("Generating CricLab backdrop plates…")
    save("stadium-night.jpg", stadium_night())
    save("pitch-perspective.jpg", pitch_perspective())
    save("nets.jpg", nets())
    save("bokeh.jpg", bokeh())
    save("turf.jpg", turf())
    save("mesh-light.jpg", mesh_light())
    save("grain.png", grain())
    print("done")
