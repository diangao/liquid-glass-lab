# liquid-glass-lab

Private prototype lab for matching a reference transparent liquid glass:
strong edge refraction, subtle chromatic aberration, rounded lens thickness,
and readable foreground content.

This is a small, self-contained frontend style experiment for the glass
material. Use it to tune the effect against a reference frame and an exact or
near-exact background image.

## Run

Open `index.html` in Chrome, or serve it locally:

```bash
python3 -m http.server 8766
```

Then open:

```text
http://127.0.0.1:8766/
```

## Workflow

1. Load the reference frame with **Reference frame**.
2. Load the exact/near-exact background with **Test background**.
3. Tune:
   - displacement = glass bending strength
   - chroma = RGB split / rainbow edge
   - blur = small optical softness
   - radius = lens roundness
   - thickness = inner/outer rim width and shadow
   - tint = transparent scrim strength
4. Compare the reference on the left against the live glass on the right.
5. Copy the CSS variables and filter values out once the side-by-side passes.

## Note

This is a full-surface refraction: it warps whatever sits behind the panel, so
it works best on chrome surfaces (navigation, tabs, card shells) rather than
directly over body text that needs to stay legible.

## Starting Values

The default values are deliberately subtle:

- displacement: `54`
- chroma: `10`
- blur: `0.8`
- radius: `36`
- thickness: `0.58`
- tint: `0.04`

These are closer to a transparent lens than a frosted panel.

## Locked recipe

`locked-recipe.html` is the locked material snapshot. Open it directly in
Chrome; it reuses the lab's Unsplash background, so no extra assets are
required.

### The target effect

A full-surface liquid refraction. The entire panel warps the backdrop into many
small, rounded swirl cells, so the center is refracted rather than left clear.
The glass reads as an even thickness across the whole surface, with only a
subtle chromatic fringe along the swirl ridges. It is neither a clear-center
edge lens nor a frosted blur.

### Filter values

- `feTurbulence` — `type="fractalNoise"`, `baseFrequency="0.019 0.020"`, `numOctaves="1"`
- `feGaussianBlur` on the noise — `stdDeviation="1.4"`
- displacement `scale` per channel — R `64`, G `54`, B `46` (the red–blue spread produces the chromatic fringe)

### What each control does

- **`baseFrequency` sets the swirl size.** Low values give large, soft warps;
  high values give small, busy, jittery cells. The `0.019`–`0.020` range gives
  rounded, distinct cells.
- **`numOctaves` sets the uniformity.** A value of `1` gives even thickness and
  rounder cells; higher values add fine jitter that reads as uneven glass
  thickness.
- **The noise `stdDeviation` smooths the thickness** by evening out the
  displacement-magnitude variance.
- **The per-channel displacement spread sets the chromatic aberration.** A small
  spread keeps the color fringe on the swirl ridges; a large spread floods the
  whole panel with rainbow.

### Harness note

`baseFrequency` and `numOctaves` are the decisive controls for the swirl
character. `index.html` currently derives `baseFrequency` from the thickness
slider and has no octaves control, so exposing both as dedicated sliders would
help the next tuning pass.
