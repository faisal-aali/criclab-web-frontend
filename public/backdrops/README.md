# Backdrop plates

These are **generated**, not photographed or licensed. They exist so every
section can carry real atmosphere without the site depending on stock imagery,
and so the palette behind content is exactly the CricLab palette rather than
whatever a photograph happened to contain.

| File | Used for |
|------|----------|
| `stadium-night.jpg` | Floodlit night. Default hero plate. |
| `pitch-perspective.jpg` | A pitch receding to a vanishing point, crease lines. |
| `nets.jpg` | Net-session mesh, for feature and FAQ sections. |
| `bokeh.jpg` | Out-of-focus floodlights, for quieter blocks. |
| `turf.jpg` | Mown outfield stripes, for CTA panels. |
| `mesh-light.jpg` | The light-surface equivalent. |
| `grain.png` | 256px tiling grain, stops large gradients banding on wide screens. |

## How they are used

Never bare. Always through `<Backdrop plate="..." scrim="..." />` in
`src/components/site/ui.tsx`, which pairs the plate with a scrim so text
contrast never depends on the image, adds the grain, and applies parallax.

## Replacing them with real photography

The design is built to accept photographs — this is the fallback, not the
ceiling. To swap one in:

1. Drop the photo in this folder.
2. Point the matching `.plate-*` rule in `src/index.css` at it.
3. Keep using the same `scrim` — it is what guarantees the text stays readable.

Prefer dark, low-contrast frames with space where the copy sits. Anything busy
behind a headline will fight it however strong the scrim is.

`PhotoFrame` in `src/components/site/visuals.tsx` is the other photography slot,
for in-content imagery rather than section backgrounds.

## Regenerating

`scripts/generate-backdrops.py` draws all of them. It needs `numpy` and
`opencv-python`, which the frontend does not depend on — run it with the sibling
backend's environment:

```bash
source ../criclab-web-backend/.venv312/bin/activate
python scripts/generate-backdrops.py
```
