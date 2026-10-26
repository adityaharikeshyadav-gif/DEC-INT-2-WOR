---
name: Kinfolk Noir & Gallerist Precision
colors:
  surface: '#121316'
  surface-dim: '#121316'
  surface-bright: '#38393c'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1b1b1f'
  surface-container: '#1f1f23'
  surface-container-high: '#292a2d'
  surface-container-highest: '#343538'
  on-surface: '#e3e2e6'
  on-surface-variant: '#ddc0b7'
  inverse-surface: '#e3e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#a58b83'
  outline-variant: '#56423c'
  surface-tint: '#ffb59c'
  primary: '#ffb59c'
  on-primary: '#5c1900'
  primary-container: '#e07148'
  on-primary-container: '#511500'
  inverse-primary: '#a0401c'
  secondary: '#b9cbb9'
  on-secondary: '#253427'
  secondary-container: '#3b4b3d'
  on-secondary-container: '#a8baa8'
  tertiary: '#d8c596'
  on-tertiary: '#3a2f0d'
  tertiary-container: '#bbaa7d'
  on-tertiary-container: '#4a3e1b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#802a05'
  secondary-fixed: '#d5e7d5'
  secondary-fixed-dim: '#b9cbb9'
  on-secondary-fixed: '#101f13'
  on-secondary-fixed-variant: '#3b4b3d'
  tertiary-fixed: '#f5e1b0'
  tertiary-fixed-dim: '#d8c596'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#524621'
  background: '#121316'
  on-background: '#e3e2e6'
  surface-variant: '#343538'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies the intersection of high-culture editorial publishing, contemporary fine art curation, and the pinpoint interaction precision of modern digital craft. Designed for discerning art collectors, aesthetic explorers, and culturally curious individuals, the interface balances intellectual gravitas with tactile playfulness. 

The aesthetic is driven by a hybrid movement: **Editorial Minimalism meets Atmospheric Glassmorphism**. Layouts evoke heavyweight printed journals through generous negative space, intentional typographic drama, and disciplined framing, while micro-interactions deliver fluid digital luxury. Every screen must evoke the calm, quiet authority of an exclusive private gallery after hours—warm, tactile, luminous, and effortless.

## Colors

The palette establishes an interplay between subterranean depth and warm paper craft. The system operates primarily in an immersive dark mode with an equally refined light counterpart:

- **Neutral Foundation (`#121316`)**: Deep charcoal velvet canvas for dark mode; the inverse uses `#FBF9F5` (warm archival cream). Intermediate surfaces use charcoal stone scales (`#181A1E`, `#212328`, `#2C2F36`) or cream parchment layers (`#F4F0E8`, `#EAE4D8`).
- **Primary Accent (`#D96B43` - Terracotta)**: A sun-baked earthen red-orange used for primary actions, active selection rings, expressive typographic callouts, and conversational sparks.
- **Secondary Accent (`#7A8B7B` - Herbarium Sage)**: A balanced, botanical green providing natural serenity, secondary curation flags, and verified status marks.
- **Tertiary Accent (`#E6D3A3` - Champagne Gold)**: A soft, radiant metallic accent applied to delicate halos, rare quiz result personas, ribbons, and key focal highlights.

Translucent border treatments are standardized at `rgba(255, 255, 255, 0.08)` in dark mode and `rgba(18, 19, 22, 0.06)` in light mode, ensuring cards appear crisp without visual heaviness.

## Typography

The typographic strategy pairs the romantic, high-contrast strokes of an editorial display serif with the precision and structural clarity of a modern geometric sans.

- **Display & Headlines (`Playfair Display`)**: Used strictly for hero framing, introspective quiz inquiries, persona taxonomy titles, and pull quotes. Italicize key single-word descriptors within titles to invoke print magazine tradition.
- **Body & Controls (`Plus Jakarta Sans`)**: Delivers pristine legibility across questions, curation essays, metadata chips, and control labels. Wide tracking (`letter-spacing: 0.04em - 0.08em`) is reserved for micro-labels and uppercase section tags to establish gallery-grade informational hierarchy.

## Layout & Spacing

The layout follows a responsive 12-column grid anchored inside a maximum container width of `1280px` for discovery feeds and `840px` for focused quiz experiences. 

- **Desktop (≥1024px)**: 12-column grid, `1.5rem` (24px) gutters, generous `3rem` (48px) margins. Editorial content breathes through asymmetric multi-column placements (e.g., 5-column artwork preview paired with 7-column interaction panel).
- **Tablet (768px – 1023px)**: 8-column grid, `1.25rem` (20px) gutters, `2rem` (32px) margins. Dual-pane flows collapse into stacked vertical narratives.
- **Mobile (<768px)**: 4-column grid, `1rem` (16px) gutters, `1.25rem` (20px) margins. Action sheets and card carousels span edge-to-edge with negative margin offsets for continuous discovery.
- **Rhythm**: Spacing enforces deliberate pacing. Dense components use `space-xs` and `space-sm`, while editorial separation utilizes `space-xl` and higher multiples to maintain gallery gallery-like spaciousness.

## Elevation & Depth

Visual depth is expressed through luminous, translucent materiality rather than heavy opaque shadows:

- **Frosted Glassmorphism**: Primary interactive surfaces leverage semi-transparent stone fills (`rgba(24, 26, 30, 0.72)` in dark mode, `rgba(251, 249, 245, 0.8)` in light mode) paired with `backdrop-filter: blur(16px)` and subtle webkit hardware acceleration.
- **Low-Contrast Perimeter Lines**: Glass panels are demarcated by a 1px inner or perimeter boundary of `rgba(255, 255, 255, 0.08)` to reflect light without creating visual clutter.
- **Ambient Diffusion Shadows**: Elevations use deep, feather-light drop shadows tinted by canvas undertones:
  - Resting Card: `0 8px 32px -4px rgba(0, 0, 0, 0.35)`
  - Active / Floating Modal: `0 24px 64px -12px rgba(0, 0, 0, 0.55)`
- **Atmospheric Halos**: Floating indicators, interactive result orbs, and focal art nodes cast delicate radial glow fields (e.g., `radial-gradient(circle, rgba(217, 107, 67, 0.15) 0%, transparent 70%)`).
- **Tactile Grain**: Overlays incorporate an ambient 3% monochromatic SVG film grain overlay set to `mix-blend-mode: overlay` to emulate fine art print stock.

## Shapes

The design system employs a **Rounded** shape model (`0.5rem` base, scaling to `1rem` for medium cards and `1.5rem` for prominent gallery surfaces), pairing architectural poise with human touch.

- **Micro Controls & Chips**: Utilize complete roundness (`rounded-full` / `9999px`) to create organic, tactile stones that contrast against structured media rectangles.
- **Editorial Cards & Panels**: Fixed at `1rem` (`rounded-lg`) to `1.5rem` (`rounded-xl`), creating soft windowing for artwork without cropping focal details.
- **Image Framing**: Artwork containers utilize inner corner smoothing to ensure visual harmony against outer card hulls.

## Components

### Buttons
- **Primary**: Solid Terracotta (`#D96B43`) background with crisp white typography. Hover states elevate with an ambient terracotta aura (`0 8px 24px -4px rgba(217,107,67,0.4)`) and a subtle `transform: translateY(-1px)`.
- **Secondary (Ghost Glass)**: Translucent surface (`rgba(255,255,255,0.04)`), 1px border (`rgba(255,255,255,0.12)`), text tinted in Champagne Gold or bone white. Hover deepens background opacity to `0.08`.
- **Editorial Text Button**: Pure typographic link with an animated underline starting at width 0 and animating outward on hover, styled in Sage Green or Terracotta.

### Curation Chips & Badges
- Fully pill-shaped interactive filters and attributes.
- Inactive state: Bordered in `rgba(255,255,255,0.1)` with muted text.
- Active state: Background infused with Sage Green (`rgba(122, 139, 123, 0.18)`), border in `#7A8B7B`, accompanied by a pulsing 6px glowing status bead.

### Quiz Choice Cards
- Glassmorphic panels displaying artwork or aesthetic propositions.
- Integrated aspect-ratio containers showcasing high-resolution art with lazy-loaded blur-up placeholders.
- Selection behavior: Multi-layer transition featuring a 1.5px border glow in Terracotta, soft scale lift (`1.015`), and a discreet check glyph set in Champagne Gold.

### Input Fields
- Understated architectural inputs: Background tinted `rgba(255,255,255,0.03)` with a soft bottom border transitioning to a full perimeter ring on focus.
- Floating serif placeholders that shrink into sans-serif uppercase tracking labels.

### Checkboxes & Radio Controls
- Circular, jewel-inspired radio indicators. Unselected appears as an airy 1px neutral ring; selected reveals an inner bead glowing with Terracotta against a champagne backdrop.

### Result Personas (Custom Editorial Dossier)
- Architectural split-screen dossier featuring a prominent Playfair Display headline, stylized gallery badge, percentage compatibility matrix, and a dedicated palette swatch generator based on quiz outcomes.