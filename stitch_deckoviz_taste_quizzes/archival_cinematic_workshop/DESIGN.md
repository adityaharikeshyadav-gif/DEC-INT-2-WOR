---
name: Archival Cinematic Workshop
colors:
  surface: '#fff8f4'
  surface-dim: '#e3d8d0'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf2e9'
  surface-container: '#f7ece4'
  surface-container-high: '#f1e6de'
  surface-container-highest: '#ebe1d8'
  on-surface: '#201b16'
  on-surface-variant: '#57423b'
  inverse-surface: '#352f2a'
  inverse-on-surface: '#faefe6'
  outline: '#8a726a'
  outline-variant: '#dec0b7'
  surface-tint: '#a23e18'
  primary: '#9f3c16'
  on-primary: '#ffffff'
  primary-container: '#bf542c'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59c'
  secondary: '#7e5713'
  on-secondary: '#ffffff'
  secondary-container: '#fec97b'
  on-secondary-container: '#78520e'
  tertiary: '#416355'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a7c6d'
  on-tertiary-container: '#f5fff8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#822801'
  secondary-fixed: '#ffddb1'
  secondary-fixed-dim: '#f2be71'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#614000'
  tertiary-fixed: '#c6ebd9'
  tertiary-fixed-dim: '#aacfbd'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#2c4d40'
  background: '#fff8f4'
  on-background: '#201b16'
  surface-variant: '#ebe1d8'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Literata
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  label-lg:
    fontFamily: Anton
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system envisions digital creation not as a sterile synthetic process, but as an alchemical literary craft. It evokes the sensory gravitas of rare manuscript archives, 19th-century private printmaking ateliers, and vintage cinematic drafting tables. The aesthetic marries historical book arts with speculative generative technology.

- **Brand Personality:** Scholarly, mystical, tactile, authoritative, and evocative. It speaks to screenwriters, speculative fiction authors, and cinematic world-builders who value narrative weight over generic software interfaces.
- **Aesthetic Movement:** Tactile Bibliophile & Archival Letterpress meets Vintage Editorial. Surfaces emulate archival laid paper, hot-metal typesetting, and leather-bound folios.
- **Emotional Response:** Inspires patience, contemplative creativity, and the tactile romance of hand-crafting moving illuminated manuscripts.

## Colors
The palette derives from physical pigments: aged rag parchment, iron gall ink, burnt sienna, and gold leaf.

- **Primary (`#C85A32` - Burnt Sienna / Terracotta):** Represents the alchemical spark, wax seals, key interactive triggers, and recording states.
- **Secondary (`#D4A359` - Gilded Amber):** Evokes gold leaf gilding, manuscript accents, active curation, and spotlighted prompts.
- **Tertiary (`#2B4C3F` - Antique Verdigris / Bookbinder Cloth):** Utilized for archival tags, operational status indicators, and cinematic timeline chapter markers.
- **Neutral (`#241F1A` - Iron Gall Ink):** Serves as high-contrast body ink in light mode and deep ground in dark mode.

### Tonal Environment Foundations
- **Light Mode (Default - Rag Parchment):**
  - Canvas: `#F4EEDD` (Aged Book Linen)
  - Surface Mid: `#EDE4CC` (Milled Parchment)
  - Surface Border: `#D8CEB5` (Faded Folio Edge)
  - Text Primary: `#241F1A` (Deep Ink)
  - Text Muted: `#6E6254` (Faded Sepia)
- **Dark Mode (Antique Ink Folio):**
  - Canvas: `#1A1714` (Carbon Black Ink)
  - Surface Mid: `#27221C` (Aged Moroccan Leather)
  - Surface Elevated: `#342D25` (Waxed Calfskin)
  - Text Primary: `#EFE6CF` (Bleached Vellum)
  - Text Muted: `#A69886` (Sepia Dust)

## Typography
Typographic scale reflects classical book pagination and manual hot-metal typesetting traditions:

- **Bebas Neue (Display & Headlines):** Used for titles, book chapters, scene headings, and generated narrative headers. It carries bold, condensed proportions with commanding cinematic presence.
- **Literata (Body & Extended Reading):** Optimized for sustained narrative composition, story readouts, and archival metadata descriptions. Its sturdy serifs ensure readability against warm paper textures.
- **Anton (Monospace Linotype Accents):** Deployed for timeline timecodes, seed parameters, prompt tags, token counts, and technical workflow metadata, bringing striking weight to structural accents.

## Layout & Spacing
The layout model adopts classic book page architecture, leveraging asymmetric margin ratios (the van de Graaf canon) where exterior running margins are wider than interior bindings.

- **Grid Discipline:** A 12-column adaptive grid on desktop with generous bilateral gutters simulating a double-page spread. On tablet devices, it compresses to 8 columns; on mobile, a single folio column (4-column base) takes precedence.
- **Rhythm & Gutters:** Horizontal flow maintains strict leading baselines. Element gaps emulate editorial lead spacers (`space-xs` through `space-xl`).
- **Breakpoints:**
  - Mobile: `< 640px` (Margins collapse to `margin-mobile`, toolbars pin to bottom deckle edge).
  - Tablet: `640px - 1024px` (Two-pane illuminated manuscript layout: prompt slate on the left, storyboard reel on the right).
  - Desktop: `> 1024px` (Full studio scriptorium: three-pane drafting suite with archival bin, main illuminated canvas, and generative parameter margin).

## Elevation & Depth
Depth eschews harsh modern drop shadows in favor of paper stacking, letterpress debossing, and warm sepia ambient diffusions.

- **Stacking Tiers (Papier-Collé Layers):**
  - Ground Tier: Underlying desk surface or aged desk matting.
  - Page Tier: Surface parchment sheets, delineated by `1px solid rgba(110, 98, 84, 0.22)`.
  - Floating Folio Tier: Modals and context menus evoke leafed manuscript slips resting on top of bound books, rendered with a tinted sepia ambient falloff: `0 8px 24px -4px rgba(36, 31, 26, 0.14), 0 2px 6px -1px rgba(36, 31, 26, 0.08)`.
- **Intaglio & Letterpress (Debossed Sinks):** Input fields, prompt canvases, and scrub tracks use inward cast shadows (`inset 0 1px 3px rgba(36, 31, 26, 0.16)`) mimicking type pressed into heavyweight damp rag paper.
- **Deckle Edging:** Container divides and chapter breaks utilize micro-dithered borders or fine double-hairline rules (a thick 1px line parallel to an ultra-fine 0.5px line) instead of standard flat outlines.

## Shapes
Geometry reflects bookmaking craftsmanship: crisp paper cuts, hand-bound leather corners, and wax seals.

- **Corner Radius:** Strict adherence to level `1` (Soft - `0.25rem` / `4px`). Elements avoid modern bubble radii to preserve the cut-paper profile of bound folios.
- **Card Contours:** Subtle chamfers or 4px corner softening simulate the natural rounding of worn leather-bound spine tips.
- **Gilded Borders & Accents:** Frames feature deliberate double rules and archival brackets (`「 ... 」`) around prompt blocks and visual viewports.

## Components

### Buttons & Seals
- **Primary Action (Wax Stamp):** Burnt Sienna background (`#C85A32`), cream typography (`#F4EEDD`), and a fine border (`1px solid #9C3E1E`). Hover triggers a gilded amber halo (`box-shadow: 0 0 0 2px #D4A359`). Active states trigger an engraved inward shift (`transform: translateY(1px)`).
- **Secondary Action (Vellum Leaf):** Parchment-toned background with iron gall ink borders (`1px solid #D8CEB5`), Literata font, subtly shifting to gilded parchment (`#EDE4CC`) on pointer interaction.
- **Monastic Icon Triggers:** Raw unbordered buttons accented with heavy glyphs (`Anton`) that darken on contact.

### Input Fields & Story Scrips
- **Prompt Codex (Prompt Input):** Styled like an author's work-desk blotting pad. Features debossed parchment surface, indented margins, line numbers in `Anton` muted sepia, and body input in `Literata`.
- **Focus State:** Border transitions from faded sepia to burnt sienna with an interior golden glow (`0 0 0 1px #D4A359`).

### Archival Cards & Film Folios
- **Storyboard Frame Cards:** Emulate archival photo mountings with thin sepia double borders, a gilded scene index (`Act I, Scene IV`), and heavy timestamp footnotes.
- **Generative Reel Strip:** Horizontal sequence of frames contained within a dark Moroccan-leather tray (`#27221C` in dark mode, `#EDE4CC` in light mode) stitched together with dashed deckle dividers.

### Chips & Linotype Tags
- **Seed & Style Chips:** Rendered in `Anton`, styled like heavy hot-metal tags with brackets (`[ 35mm-grain ]`, `[ sepia-wash ]`). Encased in faded parchment borders with antique verdigris (`#2B4C3F`) text on activation.

### Checkboxes, Toggles & Radios
- **Checkboxes:** Square bookbinder checkbox (`14px x 14px`) with a hand-inked crossmark (`✕`) using burnt sienna ink upon selection.
- **Alchemical Toggles:** Styled as an authentic brass switch; sliding pill housing containing a gilded circular pip (`#D4A359`).

### Manuscript Timeline & Scrubber
- **Playhead & Scrubber:** Styled as a brass archival needle gliding across a rule-marked parchment scale, featuring frame-by-frame bold numbering.