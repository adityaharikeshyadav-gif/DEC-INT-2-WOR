# Elinity UI Registry

This file documents the visual patterns, class structures, and styles used across Elinity UI components to maintain strict visual consistency.

## Play Palace Components

### Game Card (Play Catalog Dashboard)

File: [Play.tsx](file:///Volumes/SanDisk/freelancing/elinity_web/src/pages/Play.tsx)
Last updated: 2026-07-09

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | `bg-white/5 backdrop-blur-md` |
| Border           | `border border-white/10 hover:border-purple-500/30` |
| Border radius    | `rounded-3xl` |
| Text — primary   | `text-white` |
| Text — secondary | `text-neutral-400` |
| Spacing          | `p-8` |
| Hover state      | `hover:shadow-2xl hover:shadow-purple-500/5` |
| Shadow           | `shadow-2xl` |
| Accent usage     | `bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500` |

**Pattern notes:**
Play Palace game catalog cards follow a dark-premium theme using a standard blur overlay (`backdrop-blur-md`) over radial ambient background glows. Buttons use a purple-to-indigo gradient with subtle pulse/hover effects.

---

### Lobby Panel & List Item

File: [GameLobby.tsx](file:///Volumes/SanDisk/freelancing/elinity_web/src/pages/GameLobby.tsx)
Last updated: 2026-07-09

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | `bg-white/5` |
| Border           | `border border-white/5 hover:border-white/10` |
| Border radius    | `rounded-2xl` for list items, `rounded-3xl` for main container |
| Text — primary   | `text-neutral-200` |
| Text — secondary | `text-neutral-500` |
| Spacing          | `p-5` for items, `p-8` for container |
| Hover state      | `hover:bg-white/10 border-white/20` |
| Shadow           | `shadow-lg` |
| Accent usage     | `text-purple-400 font-bold uppercase tracking-widest` |

---

### Central Game Stage & Timeline (Split-Pane)

File: [GameSession.tsx](file:///Volumes/SanDisk/freelancing/elinity_web/src/pages/GameSession.tsx)
Last updated: 2026-07-13

| Property         | Class / Style |
| ---------------- | ------------- |
| Background (Stage)| `bg-white/[0.02] border border-white/5 backdrop-blur-sm` |
| Background (Timeline)| `bg-white/[0.02] border border-white/5` (Desktop sidebar) |
| Border radius    | `rounded-3xl` for main containers, `rounded-2xl` for inputs/bubbles/voting/accolades |
| Text — Prompt    | `text-lg md:text-xl font-medium leading-relaxed text-purple-100 text-center` |
| Text — Meta      | `text-[9px] font-bold text-neutral-500 uppercase tracking-widest` |
| Spacing          | `p-6` for Stage containers, `p-5` for Timeline sidebar |
| Host Orb         | `w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400` |
| Orb Glowing Pulse | `box-shadow` pulses from `20px` to `50px` depending on typing state |
| Input Bar        | `bg-black/40 border border-white/15 focus:border-purple-500/50 rounded-2xl` |
| Voting Button    | `w-full text-left px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-950/20 text-xs font-bold transition-all` |
| Accolade Card    | `bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:border-purple-500/20 transition-all` |

**Pattern notes:**
Active game sessions utilize a custom **split-pane** layout rather than a full-page chat feed:
- **Left Panel (Timeline / Scoreboard)**: A secondary log of past messages or a sorted live scoreboard panel, styled with subtle border rectangles.
- **Center Stage**: The main focus. Shows a custom-gradient glowing **Host Orb** at the top representing Lumi, a large centered italic statement display card, and a dedicated turn-based action card.
- **Responsiveness**: The timeline and scoreboard hide on mobile screen widths and slide out via a custom Framer Motion sliding panel, keeping the mobile interface clean and focused.
- **Veto Prompt**: Styled as an amber button `bg-amber-500/10 border border-amber-500/20 text-amber-400` to indicate high-importance alternative actions.

---

### The Unsaid Lobby Configuration

File: `src/components/games/UnsaidLobbyConfig.tsx`
Last updated: 2026-07-21

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | `bg-black/30` for choices, `bg-purple-500/15` when selected |
| Border           | `border border-white/10`, selected `border-purple-500/40` |
| Border radius    | `rounded-2xl` for mode cards, `rounded-xl` for terrain controls |
| Text — primary   | `text-neutral-300`, selected `text-purple-100` |
| Text — secondary | `text-neutral-500` |
| Spacing          | `p-4` for mode cards, `px-3 py-2.5` for terrain controls |
| Hover state      | `hover:border-white/20 hover:bg-white/5` |
| Shadow           | Selected `shadow-lg shadow-purple-500/10` |
| Accent usage     | `bg-purple-600 border-purple-500 text-white` |

**Pattern notes:**
Configuration choices use the established dark glass-panel language. Selected options gain a restrained purple surface and border; player requirements remain muted metadata rather than competitive scoring.

---

### The Unsaid Session and Map

File: `src/components/games/UnsaidSession.tsx`
Last updated: 2026-07-21

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | `bg-white/[0.025] backdrop-blur-sm`, map `bg-white/[0.04] backdrop-blur-md` |
| Border           | `border border-white/5`, map `border-purple-500/20` |
| Border radius    | `rounded-3xl` for stages and maps, `rounded-2xl` for actions and messages |
| Text — primary   | `text-purple-100` for Lumi and map content, `text-white` for titles |
| Text — secondary | `text-neutral-400`, muted metadata `text-neutral-500` |
| Spacing          | `p-5` or `p-6` for controls, `p-8` for the central stage |
| Hover state      | `hover:border-white/20 hover:bg-white/10` for neutral actions |
| Shadow           | `shadow-2xl shadow-purple-950/20` on generated maps |
| Accent usage     | Primary `from-purple-600 to-indigo-600`; Pause amber; Stop red |

**Pattern notes:**
The Unsaid keeps the Play Palace split-stage structure but removes competitive UI. Purple communicates guided reflection, amber is reserved for pausing, red only for stopping, and green only confirms completed actions. Private maps use the same panel geometry with stronger purple borders and explicit copy/download controls.

---

### Turncoat Lobby Configuration

File: `src/components/games/TurncoatLobbyConfig.tsx`
Last updated: 2026-07-21

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | `bg-black/30`; selected `bg-rose-600`; summary `bg-rose-500/10` |
| Border           | `border border-white/10`; selected `border-rose-500` |
| Border radius    | `rounded-xl` for controls, `rounded-2xl` for the read-only summary |
| Text — primary   | `text-neutral-200`; selected `text-white` |
| Text — secondary | `text-neutral-400` and `text-neutral-500` |
| Spacing          | `px-3 py-3` for option buttons, `p-4` for the summary |
| Hover state      | `hover:border-white/20` |
| Accent usage     | Rose indicates active debate configuration; icons use `text-rose-400` |

**Pattern notes:**
Turncoat retains the compact lobby configuration geometry established by The Unsaid, but uses rose instead of purple to signal an adversarial game. Hosts receive direct controls; non-hosts see a single read-only format summary so configuration ownership remains clear.

---

### Turncoat Debate Stage and Score Reveal

File: `src/components/games/TurncoatSession.tsx`
Last updated: 2026-07-21

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | Page `bg-[#080609]`; panels `bg-white/[0.025]`; actions `bg-black/40` |
| Border           | `border border-white/5`; active debate `border-rose-500/30` |
| Border radius    | `rounded-3xl` for stage panels, `rounded-2xl` for scorecards and actions |
| Text — primary   | `text-rose-50` for Lumi, `text-white` for motions and results |
| Text — secondary | `text-neutral-400`; metadata `text-neutral-500` |
| Spacing          | `p-5` or `p-6` for controls, `p-8 md:p-10` for the Lumi stage |
| Host orb         | `from-rose-700 via-red-600 to-orange-500` with `shadow-rose-950/30` |
| Primary action   | `from-rose-700 to-orange-600`, full-width, `rounded-xl` |
| Semantic accents | Amber for assigned side/bonus, green/red only for private stance choices |

**Pattern notes:**
Turncoat specializes the Play Palace split-stage layout as a competitive debate room. The left panel is a live standings and assignment rail; the center keeps the shared motion and current action dominant. Private stances and peer scores use explicit sealed/waiting confirmations. Score reveals always show Lumi, peer average, final blended value, any bonus, and expandable attributed peer scorecards—never rankings without their calculation context.

---

### Long Table Lobby Configuration

File: `src/components/games/LongTableLobbyConfig.tsx`
Last updated: 2026-07-21

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | Options `bg-black/30`; selected `bg-violet-500/15`; history `bg-violet-500/[0.06]` |
| Border           | `border border-white/10`; selected `border-violet-500/50` |
| Border radius    | `rounded-2xl` for mode cards and history, `rounded-xl` for age controls |
| Text — primary   | Selected `text-violet-100`; neutral `text-neutral-300` |
| Text — secondary | `text-neutral-500`; metadata `text-neutral-600` |
| Spacing          | `p-4` for choices and history, `p-2` for age rows |
| Hover state      | `hover:border-white/20 hover:bg-white/5`; destructive hover uses restrained red |
| Shadow           | Selected `shadow-lg shadow-violet-950/20` |
| Accent usage     | Violet marks ceremony and selection; destructive history clearing alone uses red |

**Pattern notes:**
Long Table configuration uses the established dark glass-panel language with quieter, more ceremonial violet accents. Exact ages appear as editable rows beneath mode selection. Local-history status is visually distinct from game configuration and must always explain browser-only storage while keeping export and destructive clear actions explicit.

---

### Long Table Session and Table Log

File: `src/components/games/LongTableSession.tsx`
Last updated: 2026-07-21

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | Page `bg-[#08070b]`; panels `bg-white/[0.025]`; document `bg-[#0d0b11]` |
| Border           | `border border-white/5`; archival emphasis `border-violet-500/20` |
| Border radius    | `rounded-3xl` for stage/documents, `rounded-2xl` for prompts and log sections |
| Text — primary   | `text-violet-50` for Lumi, `text-neutral-200` for player-authored documents |
| Text — secondary | `text-neutral-400`; metadata `text-neutral-500` and `text-neutral-600` |
| Spacing          | `p-5` or `p-6` for controls, `p-8 md:p-10` for ceremonial stage/document panels |
| Host orb         | `from-violet-700 via-indigo-600 to-amber-500` with `shadow-violet-950/30` |
| Primary action   | `from-violet-700 to-indigo-600`, full-width, `rounded-xl` |
| Semantic accents | Violet for reflection/archives, amber for Returns and unresolved tension, red only for errors |

**Pattern notes:**
The Long Table retains the split-stage system while replacing competitive sidebars with seated age-selves and a private transcript. Player-authored letters use a restrained serif document surface and preserve whitespace. Completed Table Logs separate summary, shift, open question, and Lumi observation into equally weighted archival cards. Browser save status, copy, download, and full-log export remain visible together so sensitive work is never assumed to be safely stored.

---

### Game of Games Lobby Configuration

File: `src/components/games/GameOfGamesLobbyConfig.tsx`
Last updated: 2026-07-21

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | `bg-black/30`; selected `bg-cyan-600/20`; summary `bg-cyan-500/10` |
| Border           | `border border-white/10`; selected `border-cyan-500` or `border-cyan-500/70` |
| Border radius    | `rounded-xl` for compact controls, `rounded-2xl` for read-only summary |
| Text — primary   | `text-neutral-400`; selected `text-white` |
| Text — secondary | `text-neutral-500` |
| Spacing          | `px-3 py-3` for controls, `p-4` for summary |
| Hover state      | `hover:border-white/20` |
| Shadow           | none |
| Accent usage     | Cyan marks strategic configuration and theory-mode controls |

**Pattern notes:**
Game of Games lobby controls follow the compact flagship configuration pattern from Turncoat and Long Table, but use cyan to distinguish strategic analysis from debate rose and reflection violet. Hosts can choose mode, scenario pack, and session length; non-hosts see one concise read-only summary.

---

### Game of Games Strategic Stage

File: `src/components/games/GameOfGamesSession.tsx`
Last updated: 2026-07-21

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | Page `bg-[#050708]`; panels `bg-white/[0.03]`; action panels `bg-black/30` |
| Border           | `border border-white/10`; reveal emphasis `border-amber-500/20`; profile `border-cyan-500/20` |
| Border radius    | `rounded-2xl` for panels, choices, metric cards, and reveals |
| Text — primary   | `text-white`; scenario body `text-neutral-200`; reveal body `text-amber-50/90` |
| Text — secondary | `text-neutral-400`; metadata `text-neutral-500` |
| Spacing          | `p-5` or `p-6` for panels, `p-6 md:p-8` for scenario stage |
| Hover state      | `hover:border-cyan-400/50 hover:bg-cyan-500/10` for strategic choices |
| Shadow           | none |
| Accent usage     | Cyan for live strategy/profile, amber for payoff reveal, green for confirmed/Nash states |

**Pattern notes:**
The Game of Games uses the flagship split-stage layout without a chat-first center. The sidebar is payoff tally, Decision Profile, and choice status; the main stage is scenario, choice grid, and reveal. Choices are large enough for decision text, sealed states use lock/check icons, and reveal cards always show outcome, choices, payoff deltas, equilibrium status, theory, and host advancement.

---

### Game Lobby Action Buttons

File: `src/pages/GameLobby.tsx`
Last updated: 2026-07-22

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | Ready primary `bg-gradient-to-r from-purple-600 to-indigo-600`; ready-active `bg-yellow-600`; start `bg-green-600` |
| Border           | none on primary lobby actions |
| Border radius    | `rounded-xl` |
| Text — primary   | `text-white` |
| Text — secondary | Helper copy `text-neutral-400` |
| Spacing          | `py-4` full-width buttons; surrounding section spacing `pt-6` on bordered groups |
| Hover state      | `hover:from-purple-500 hover:to-indigo-500`, `hover:bg-yellow-500`, `hover:bg-green-500` |
| Disabled state   | `disabled:opacity-40`; non-clickable cursor/pointer behavior; copy changes to `Connecting...` while socket is unavailable |
| Error recovery   | Duplicate-name alert uses `bg-red-500/10 border-red-500/20 text-red-400`; recovery action uses compact red outline button |
| Shadow           | Ready `shadow-lg shadow-purple-500/15`; start `shadow-lg shadow-green-500/10` |
| Accent usage     | Purple/indigo for readiness, yellow for unready toggle, green for host launch |

**Pattern notes:**
Lobby actions must not fire WebSocket commands unless the live connection is open. Disabled states should preserve the existing flagship button styling while clearly preventing dead clicks. When disconnected, action copy should explain the transient state (`Connecting...`) and the hook should preserve the original connection error instead of replacing it with a generic action failure. Duplicate display-name conflicts should offer a direct “choose a different name” recovery path in the same red alert block rather than trapping the user in a disconnected lobby.

---

### Game Help Button and Full-Screen Guide

File: `src/components/games/GameHelpButton.tsx`
Last updated: 2026-07-22

| Property         | Class / Style |
| ---------------- | ------------- |
| Background       | Button default `bg-purple-500/10`; full-screen guide `bg-[#05050a]`; ambient glows `bg-purple-600/[0.08]` and `bg-indigo-500/[0.06]`; mission card gradient `from-purple-500/15 to-indigo-500/5`; guide cards `bg-white/[0.035]`, `bg-amber-500/10`, `bg-black/25` |
| Border           | Button `border` with accent-specific low-opacity border; sticky header `border-b border-white/10`; mission card `border-purple-500/20`; win card `border-amber-500/20` |
| Border radius    | Button `rounded-xl`; close button `rounded-2xl`; mission card `rounded-[1.75rem]`; guide sections `rounded-[1.5rem]` |
| Text — primary   | Full-screen guide `text-white`; win card `text-amber-50/90` |
| Text — secondary | Body `text-neutral-300`; metadata `text-purple-300`, `text-neutral-300` |
| Spacing          | Button `px-3 py-2`; guide header `px-5 py-4 md:px-8`; guide content `px-5 py-8 md:px-8 md:py-10`; sections `p-5 md:p-6`; step list `space-y-4` |
| Hover state      | Button `hover:bg-*-500/15`; close button `hover:bg-white/10 hover:text-white` |
| Shadow           | Mission card `shadow-2xl shadow-purple-950/20` |
| Accent usage     | Purple for default guide/help, amber for win condition; individual game headers may pass rose/violet/cyan accent variants |

**Pattern notes:**
Every game help entry should be short and gamified: one mission line, five practical steps, one “How you win” sentence, and three quick tips. The header affordance must say `How to play` even in compact layouts. Avoid theory-heavy content here; it is an in-game aid, not documentation. The guide must render through a React portal into `document.body` so it cannot be trapped inside game cards or transformed parent containers. It opens as a true full-screen overlay above the site nav (`z-[1000]`), locks body scroll, and closes with the top-right `X` or Esc.
