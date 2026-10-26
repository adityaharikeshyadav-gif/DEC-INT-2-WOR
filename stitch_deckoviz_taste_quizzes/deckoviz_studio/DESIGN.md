---
name: Deckoviz Studio
colors:
  surface: '#11131b'
  surface-dim: '#11131b'
  surface-bright: '#373942'
  surface-container-lowest: '#0c0e16'
  surface-container-low: '#191b23'
  surface-container: '#1d1f28'
  surface-container-high: '#282a32'
  surface-container-highest: '#33343d'
  on-surface: '#e1e1ed'
  on-surface-variant: '#e1bfb8'
  inverse-surface: '#e1e1ed'
  inverse-on-surface: '#2e3039'
  outline: '#a88a83'
  outline-variant: '#59413c'
  surface-tint: '#ffb4a3'
  primary: '#ffb4a3'
  on-primary: '#630f00'
  primary-container: '#ff6b4a'
  on-primary-container: '#661000'
  inverse-primary: '#ae3115'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#00a9c5'
  on-tertiary-container: '#003842'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8c1900'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#11131b'
  on-background: '#e1e1ed'
  surface-variant: '#33343d'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-meta:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system targets cinematic storytellers, generative filmmakers, art directors, and creative technologists operating at the cutting edge of narrative AI. It bridges the precision of non-linear editing software (NLEs like DaVinci Resolve) and developer-grade productivity tools (Linear) with the expressive, atmospheric fidelity of modern generative platforms (Midjourney, Runway).

The aesthetic marries **High-Density Studio Functionalism** with **Cinematic Glassmorphism**:
- Ultra-deep obsidian work areas maximize perceptual color accuracy and visual immersion for video previews and latent frame renders.
- Subtle glassmorphic paneling and low-intensity rim lighting delineate dense toolbars, model parameter racks, and timeline tracks without competing with canvas content.
- Bioluminescent cyber-amber and terracotta signal prompt ignition, rendering pipelines, and critical generation states. Electric violet and cyan highlight generative latent operations, audio channels, and keyframe telemetry.
- Dense, monospaced data structures ground the interface in technical authority, balanced by a refined, contemporary geometric sans for primary workspace navigation.

## Colors

The palette operates in strict dark-mode hierarchy to emulate a color-grading suite:

- **Primary (`#FF6B4A`) — Cyber Terracotta:** Reserved for generation execution triggers, active camera motion paths, playback head indicator, and primary call-to-actions (e.g., "Synthesize Sequence").
- **Secondary (`#8B5CF6`) — Electric Violet:** Represents prompt conditioning parameters, AI model selector badges (e.g., Motion V2, Gen-3), and latent interpolation nodes.
- **Tertiary (`#06B6D4`) — Cyber Cyan:** Denotes audio-reactive waveforms, depth-map indicators, camera axis guides, and active viewport overlays.
- **Neutral Base (`#0B0C10` to `#1E212D`) — Obsidian & Graphite:**
  - `#0B0C10`: Deep Canvas base for preview monitors and viewport staging.
  - `#13151D`: Core surface container for docks, inspector sidebars, and timeline track backgrounds.
  - `#1E212D`: Elevated surface for floating popovers, keyframe panels, active track states, and modal sheets.
  - `#2D3245`: Crisp boundary stroke for subtle rim-lit chrome borders and structural splitters.
  - `#F3F4F6` / `#9CA3AF`: Primary high-contrast text and muted timeline metadata.

## Typography

Typography establishes an intentional dichotomy between cinematic narrative flow and high-precision operational feedback:

- **Plus Jakarta Sans** provides a warm, modern, and geometric structural voice for project titles, modal overlays, storyboard summaries, and workspace panel titles.
- **JetBrains Mono** controls all metadata surfaces: frame rates (`24.00 FPS`), aspect ratios (`2.39:1`), seed parameters (`#81940182`), seed weights, LoRA coefficients, render time-remaining counters, and timeline timecodes (`00:01:24:18`).
- All numeric and data values must render with tabular figures (`font-variant-numeric: tabular-nums`) to prevent layout shifts during generation polling and scrubbing.

## Layout & Spacing

The platform enforces a high-density, multi-panel workspace paradigm configured for desktop canvas focus with responsive collapsed modes for monitoring on smaller viewports.

### Layout Model
- **Studio Desktop (≥ 1280px):** 3-pane responsive workstation consisting of:
  - Collapsible Asset & Scene Tree (260px fixed width).
  - Central Fluid Viewport Canvas & NLE Multi-track Timeline (variable width, priority render).
  - Generation Inspector & Node Parameter Rack (340px fixed width).
- **Tablet Landscape & Compact (768px – 1279px):** Inspector and Scene panels convert into tabbed sliding drawer sheets with a persistent central canvas and compressed 4-track timeline.
- **Mobile (≤ 767px):** Single-column stacked mode. Video preview locks to top 16:9 ratio; timeline collapses to a horizontal story-beat scrubber with prompt input and generation badges pinned at viewport bottom.

### Spacing Density
- Toolbars and timeline elements use compact, condensed scales (`space-xs` and `space-sm`) to maximize spatial efficiency.
- High-level project views, storyboards, and modal settings employ `space-lg` and `space-xl` to maintain editorial breathing room.

## Elevation & Depth

Visual depth is achieved through layered obsidian surfaces, frosted glass filters, and emissive neon ambient glows rather than standard black drop shadows:

- **Base Layer (0B0C10):** Recessed canvas stage and inactive timeline grid.
- **Tier 1 Container (`#13151D`, 85% opacity, backdrop blur 16px):** Primary tool docks, side panels, and timeline headers with a 1px border of `rgba(255, 255, 255, 0.08)`.
- **Tier 2 Floating Surfaces (`#1E212D`, 92% opacity, backdrop blur 20px):** Floating prompt bars, node parameters, context menus, and tooltips. Trimmed with a 1px top-lit rim highlight (`rgba(255, 255, 255, 0.14)` on top edge, `rgba(255, 255, 255, 0.04)` on side and bottom edges).
- **Active State Illumination:** Elements actively processing or selected cast an atmospheric directional glow:
  - Synthesis execution: `0 0 20px rgba(255, 107, 74, 0.25)`.
  - Latent/AI nodes: `0 0 16px rgba(139, 92, 246, 0.25)`.
  - Audio/camera anchors: `0 0 14px rgba(6, 182, 212, 0.22)`.

## Shapes

The interface balances sleek hardware instrumentation with refined software polish:

- Standard structural panels, card wrappers, and inspector racks use `0.5rem` (8px) corner radii.
- Modals, media preview frames, and floating prompt panels step up to `1rem` (16px) using `rounded-lg`.
- Status indicators, parameter pills, and timeline chips leverage full cylindrical rounding (`pill-shaped` / `9999px`) to contrast against rectilinear tracks and video monitors.

## Components

### Buttons
- **Synthesis Primary:** High-visibility `#FF6B4A` background with `#0B0C10` bold text, subtle inner top shadow for bevel effect, and an emissive outer glow on hover. Displays inline JetBrains Mono shortcut badge (`⌘ + Enter`).
- **Studio Secondary:** Deep graphite surface (`#1E212D`) with frosted glass stroke (`rgba(255, 255, 255, 0.12)`) and light text (`#F3F4F6`). Subtle lift and brighten on hover.
- **Ghost/Icon Action:** Transparent background with `#9CA3AF` icons; gains `rgba(255, 255, 255, 0.06)` background fill and white icon on focus or active state.

### Input Fields & Prompt Bars
- **Multi-Modal Prompt Bar:** Centralized floating command bar with obsidian dark surface, 1px frosted glass border, inline model switcher dropdown, aspect ratio toggle pill, and direct audio/image upload hotzones. Focus shifts border to `#FF6B4A` with subtle ambient glow.
- **Parameter Scrubbers:** Compact numeric drag fields styled with `JetBrains Mono`, featuring interactive horizontal fill bars showing current range (e.g., CFG scale 1.0 - 20.0).

### Pipeline Badges & Status Chips
- Pill-shaped tags displaying real-time generation states:
  - `Queued`: Translucent neutral background with pulsing amber border dot.
  - `Denoising / Rendering`: Gradient shift from `#8B5CF6` to `#FF6B4A` with active shimmer animation and step counter (`42/50`).
  - `Complete`: Solid translucent cyan tint with check glyph and generation latency tag (`1.4s`).

### Cards & Storyboard Frames
- Generative asset cards feature an edge-to-edge 16:9 or 2.39:1 video thumbnail container with a bottom gradient scrim. Hover exposes a floating scrub-scrubber, frame interpolation settings, and direct seed extraction shortcuts.

### Checkboxes, Toggles & Radios
- Micro switches built with 8px pill geometry. Active track toggles glow with their respective channel colors (Terracotta for video, Cyan for audio, Violet for metadata markers).

### Timeline & Keyframe Tracks
- Deep, low-contrast obsidian lanes with micro 1px subdivision lines. Keyframe diamonds in `#FF6B4A` and motion curves rendered in vector `#06B6D4` with anti-aliased path smoothing.