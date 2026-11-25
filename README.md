# Army Dreamers — interactive poetry archive

One-page interactive poem, **HTML and CSS only** (no JavaScript). Built for Google Chrome.

Live: https://jjadeu.github.io/A1-Code/

## Files
- `index.html` — the ten scenes, in poem order. Every poem line is a `<span class="ink">`.
- `style.css` — organised by scene (see the contents list at the top).
- `assets/` — images exported from the Figma prototype.

## Editing the poem
Replace each `[ ... ]` placeholder in `index.html` with your line.
Typewriter (scene 01): find `TYPING TIMING` in `index.html` and set `--line1` / `--line2` to the number of characters in each line (spaces included). Speed, pauses, shaking and paper feed all follow those two numbers. Fine-tune `--char-time`, `--type-start`, `--line-pause` in `style.css` (section 05).

## Preview locally
Open `index.html` in Chrome, or push to `main` and GitHub Pages updates in 1–2 minutes.

