# National Energy Centre — Landing Page

Static build of the NEC landing page. No build step, no dependencies — open `index.html`
or drop the folder on any static host.

## Structure

```
index.html
css/styles.css        all styles + tokens
js/main.js            interactions
assets/
  video/v1 NEC hero.mp4          1600px  (desktop hero)
  video/hero-energy-mobile.mp4    960px  (served under 900px viewport)
  img/fa1–fa6.jpg                 6 focus-area illustrations
  img/*.jpg                       section photography
```

## Changing the look

Every colour, font and spacing value lives in the `:root` token block at the top of
`css/styles.css`. Swap `--ff-display` if you have a licensed display face — the layout
is tuned for a tight geometric grotesque.

```css
--blue:      #003791;   /* pillar tile / impact card */
--blue-head: #052d8f;   /* section headings          */
--red:       #c2272d;   /* accent + CTA panel        */
--ink:       #071323;   /* dark sections             */
```

## Hero mosaic

The overlay is a real 8 × 3 CSS grid. The three pillar tiles occupy exact cells,
set inline on each `<article>`:

```html
<article class="pillar-tile pillar-tile--blue" style="--col:3;--row:1">
```

Cells are generated in `buildGrid()` (`js/main.js`), fade in on a diagonal stagger,
and a slow ambient loop shifts the lit cells every 2.2s. Change the starting lit
cells with the index array in `buildGrid()`, or the pace with the `setInterval`
delay in `startShimmer()`.

## Replacing images

The photography is currently sampled from the hero video as stand-ins. Drop real
files over the same names in `assets/img/` and nothing else needs to change —
aspect ratios are enforced in CSS.

## Breakpoints

| Width   | Change                                                        |
|---------|---------------------------------------------------------------|
| 1180px  | Strategic section stacks; offer grid → 3 columns               |
| 1040px  | Focus areas → 2 columns; events move below news                |
| 900px   | Hamburger nav; hero tiles leave the grid into a 3-across strip |
| 640px   | Everything single column                                       |

## Accessibility

Skip link, visible focus rings, `aria-expanded` on the nav and the pillar tiles,
keyboard support (Enter / Space / Escape) on the tiles, and full
`prefers-reduced-motion` handling — animation and parallax both stand down.
