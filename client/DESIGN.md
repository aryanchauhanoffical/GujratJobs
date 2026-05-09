# GujaratJobs Design System

> **"Disciplined warmth"** — BMW's confidence + Starbucks' approachability + Gujarat's regional identity.
>
> Synthesized from `DESIGN-bmw.md` and `DESIGN-starbucks.md`. Source of truth for every UI decision in this codebase.

---

## 1. Visual philosophy

GujaratJobs serves freshers and small employers in Gujarat. The product has to feel **trustworthy** (no shadow listings, verified recruiters) and **approachable** (regional, not enterprise-cold). The visual system splits the difference:

- **Discipline (from BMW):** two type weights, decisive sharp-cornered primary CTAs, generous whitespace, dark hero bands, photography-first hierarchy.
- **Warmth (from Starbucks):** cream canvas (not cold white), 12px rounded cards, full-pill secondary buttons, restrained elevation, color-block page rhythm.
- **Regional (custom):** saffron deep `#C44A0F` as the brand anchor, marigold accent for walk-in urgency, occasional Gujarati micro-copy.

The result feels like a confident regional broadsheet — not a generic SaaS template.

---

## 2. Color tokens

### Brand

| Token | Value | Usage |
|---|---|---|
| `--saffron` | `#C44A0F` | Primary brand. All primary CTAs. Anchors the visual identity. |
| `--saffron-active` | `#A23A0A` | Active/pressed state on primary CTAs. |
| `--saffron-disabled` | `#E8C4B0` | Disabled primary CTA fill. |
| `--marigold` | `#F59E0B` | Walk-in urgency, "today" indicators, urgency countdowns. |
| `--marigold-soft` | `#FCD34D` | Light marigold for backgrounds, badges. |

### Surfaces

| Token | Value | Usage |
|---|---|---|
| `--canvas` | `#FFFFFF` | Default page surface, card fills. |
| `--canvas-warm` | `#FBF7F0` | Hero bands, marketing sections, page-level cream wash (Starbucks-derived). |
| `--surface-soft` | `#F7F7F7` | Subtle utility wraps, dropdown menus. |
| `--surface-card` | `#FAFAFA` | Card background on cream pages. |
| `--surface-dark` | `#1A1A1A` | Dark hero bands, footer (BMW-derived). |
| `--surface-dark-elevated` | `#262E38` | Elevated cards on dark surfaces. |

### Text & ink

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#1A1A1A` | Headings on light surfaces. |
| `--body` | `#3C3C3C` | Body text on light surfaces. |
| `--muted` | `#6B6B6B` | Secondary metadata, captions. |
| `--muted-soft` | `#9A9A9A` | Tertiary text, placeholders. |
| `--hairline` | `#E6E6E6` | Default border, divider. |
| `--hairline-strong` | `#CCCCCC` | Stronger divider on cards. |
| `--on-primary` | `#FFFFFF` | Text on saffron CTAs. |
| `--on-dark` | `#FFFFFF` | Text on dark hero bands. |
| `--on-dark-soft` | `rgba(255,255,255,0.70)` | Secondary text on dark. |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `--success` | `#0B7B3F` | Hired, approved, verified states. |
| `--success-soft` | `#D4ECDA` | Success backgrounds. |
| `--warning` | `#F59E0B` | Same as marigold — urgency dual-purpose. |
| `--error` | `#DC2626` | Validation errors, destructive actions. |
| `--error-soft` | `#FCE7E7` | Error backgrounds. |

### Page rhythm

The system uses **color-block surface alternation** rather than gradients:

```
canvas (white) → canvas-warm (cream hero) → canvas (white content)
              → surface-dark (charcoal feature band, white text)
              → canvas-warm (closing CTA strip)
              → surface-dark (footer)
```

No gradients, no glow effects, no glassmorphism. Solid surfaces only.

---

## 3. Typography

### Family

Single primary face: **Inter** (already loaded via system fallback). The discipline of BMW's two-weight system + Starbucks' tight letter-spacing.

```
font-family: 'Inter', system-ui, -apple-system, sans-serif;
font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
letter-spacing: -0.011em;  /* BMW + Starbucks blend */
```

### Two-weight discipline

We use **only two weights**: `700` for display/heading, `400` for body. No 500, no 600. This is BMW's signature constraint — it forces hierarchy through size and color, not weight noise.

| Token | Size | Weight | Line height | Letter spacing | Usage |
|---|---|---|---|---|---|
| `display-xl` | 64px | 700 | 1.05 | -0.02em | Homepage hero only |
| `display-lg` | 48px | 700 | 1.10 | -0.02em | Section heroes |
| `display-md` | 32px | 700 | 1.15 | -0.018em | Page titles |
| `display-sm` | 24px | 700 | 1.25 | -0.016em | Card heads, sub-section titles |
| `title-lg` | 20px | 700 | 1.30 | -0.014em | Job title in detail page |
| `title-md` | 18px | 700 | 1.40 | -0.012em | Card titles |
| `title-sm` | 16px | 700 | 1.40 | -0.011em | Inline emphasis |
| `body-lg` | 18px | 400 | 1.55 | -0.011em | Hero body, lead paragraphs |
| `body-md` | 16px | 400 | 1.55 | -0.011em | Default body |
| `body-sm` | 14px | 400 | 1.55 | -0.011em | Compact metadata |
| `caption` | 12px | 400 | 1.40 | 0.5px | Microcopy, captions |
| `label-uppercase` | 13px | 700 | 1.30 | 1.5px | Section eyebrows, BMW-derived |
| `button` | 14px | 700 | 1.0 | 0.5px | All button labels |

### Vernacular accent

For occasional Gujarati micro-copy (e.g., "ગુજરાત", "આપણું"), use:

```
font-family: 'Noto Sans Gujarati', 'Inter', sans-serif;
```

Loaded async, only on pages where used. Keeps default bundle thin.

---

## 4. Geometry

The signature decision: **sharp on action, rounded on content.**

| Surface | Radius | Why |
|---|---|---|
| Primary CTAs ("Apply Now", "Post Job") | `0px` | BMW sharp — these are decisive moments. |
| Secondary CTAs ("Save", "Share", "Filter") | `9999px` (full pill) | Starbucks warm — these are casual actions. |
| Cards | `12px` | Starbucks balance — friendly without being childish. |
| Inputs / textareas | `8px` | Compromise — readable, not aggressive. |
| Modals / sheets | `16px` (top corners only on bottom sheets) | Container clarity. |
| Badges | `4px` (status), `9999px` (count) | Sharp for status, pill for counts. |
| Image masks | `0px` | BMW photography-first. Photos never get rounded. |

This split (sharp-action / rounded-content) is the system's most distinctive move.

---

## 5. Spacing

8-point scale, with a few BMW-borrowed coarser stops for sections:

| Token | Value | Usage |
|---|---|---|
| `space-1` | `4px` | Inline gaps, badge padding |
| `space-2` | `8px` | Tight stacks |
| `space-3` | `12px` | Card internal spacing |
| `space-4` | `16px` | Default content gap |
| `space-5` | `24px` | Card padding, section gap |
| `space-6` | `32px` | Subsection spacing |
| `space-8` | `48px` | Section breaks |
| `space-10` | `64px` | Hero padding (BMW) |
| `space-12` | `80px` | Page-section padding (BMW) |

Don't use `5px`, `10px`, `15px`, `20px`. Stay on the scale.

---

## 6. Elevation

Restrained. Two shadow tiers only:

```css
--shadow-card: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04);
--shadow-modal: 0 8px 16px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.12);
```

Cards lift `2px` on hover via `transform: translateY(-2px)` — no shadow change, just position. Starbucks-style "whisper of lift".

---

## 7. Motion

### Curves

```js
export const easeOutCirc = [0.075, 0.82, 0.165, 1];   // Page transitions
export const easeOutQuart = [0.25, 1, 0.5, 1];        // Card hovers
export const easeStandard = [0.4, 0, 0.2, 1];         // Default
```

### Durations

| Action | Duration | Curve |
|---|---|---|
| Button press | 100ms | `easeStandard` |
| Card hover | 200ms | `easeOutQuart` |
| Modal/sheet open | 250ms | `easeOutCirc` |
| Page transition | 350ms | `easeOutCirc` |
| Hero parallax | scroll-bound | linear |

### Principles

- **No bounces.** No spring physics with overshoot. BMW would never. Jobs is a serious tool, not a toy.
- **Press, don't scale.** Buttons compress to `scale(0.98)`, never `0.95`. Subtle.
- **Stagger sparingly.** Card grids fade in with 60ms stagger max — not the typical 100ms+.
- **No looping animations** outside the walk-in urgency pulse (which has narrative purpose).

---

## 8. Component patterns

### Primary CTA (Apply Now, Post Job, Sign Up)

```
bg-saffron text-white font-bold tracking-wide uppercase text-sm
px-8 py-3 h-12 rounded-none
hover:bg-saffron-active active:scale-98 transition-all duration-100
```

### Secondary CTA (Save, Share, Filter)

```
bg-white text-ink border border-hairline-strong font-bold text-sm
px-6 h-10 rounded-full
hover:border-ink transition-colors duration-200
```

### Job card

```
bg-white rounded-xl border border-hairline p-6
hover:-translate-y-0.5 hover:shadow-card transition-all duration-200
```

Title: `title-md` ink, company: `body-sm` muted, location pill, salary range, walk-in badge if applicable, posted-time `caption` muted-soft.

### Walk-in countdown card

Distinct treatment — saffron left border, marigold pulse on countdown:

```
bg-white rounded-xl border border-hairline border-l-4 border-l-saffron p-6
```

Time-remaining circle widget top-right, urgency tier color (today=marigold, this-week=saffron, later=muted).

### Hero band (homepage, recruiter landing)

```
bg-canvas-warm py-20 lg:py-32 px-6
```

Display-xl headline (left), supporting body-lg (60ch max), primary CTA, optional photography (BMW-style — no rounded corners, no overlay).

### Dark feature band (alternating page rhythm)

```
bg-surface-dark text-on-dark py-20 px-6
```

Display-lg headline white, body-lg `on-dark-soft`, supporting metric or photo grid.

### Footer

```
bg-surface-dark text-on-dark-soft py-12
```

Three columns max. Brand mark + tagline left, link groups right. Social icons hairline-thin.

---

## 9. Iconography

- **Set:** Heroicons (already installed). Outline variant by default; solid only when state requires (`bookmark` saved, etc).
- **Size scale:** 16px (inline), 20px (button-adjacent), 24px (default), 32px (feature).
- **Stroke:** 1.5px (Heroicons default). Don't override.
- **Color:** Inherit from parent text color. No colored icons except in feature illustrations.

---

## 10. Photography

Following BMW: **photography is hero, not decoration.** When used:

- Real Gujarat-context photos (Ahmedabad street, Surat office, Vadodara campus). Reject stock smiles.
- No filters, no overlays. Photos crop sharp into 0px-radius containers.
- Aspect ratios: `16:9` for hero, `4:5` for cards, `1:1` for avatars.
- File format: `.webp` with `.jpg` fallback. Lazy-loaded below the fold.
- Photo CTAs sit *under* the photo, never overlaid.

---

## 11. What's banned

These look generic-AI-template. Don't use:

- ❌ Glassmorphism / `backdrop-blur` cards
- ❌ Gradient text on headlines (`bg-gradient-to-r from-X to-Y bg-clip-text`)
- ❌ Neon/glow effects
- ❌ Floating gradient blobs in hero (the existing HomePage uses these — to be removed)
- ❌ Lottie/animated illustrations as primary visual content
- ❌ "AI sparkle" iconography
- ❌ Generic 3D illustrations of people pointing at laptops
- ❌ Multi-color brand palettes (we have ONE primary — saffron)
- ❌ Bouncy spring animations
- ❌ More than two type weights on a page

---

## 12. Vernacular voice

Microcopy guidelines:

| Don't | Do |
|---|---|
| "Sign up for free" | "Get started — no spam" |
| "Discover amazing opportunities" | "Find walk-in interviews near you" |
| "Trusted by 2,400+ companies" | "12 verified recruiters in Ahmedabad today" (real data only) |
| "Apply now!" | "Apply" (no exclamation) |
| "Welcome back, friend!" | "Welcome back" |
| Generic "Loading..." | "Finding walk-ins in your city..." |

The voice is **direct, regional, fact-led.** No hype.

---

## 13. Coding conventions

When implementing components:

1. **Reference DESIGN.md tokens, not hex codes.** `bg-saffron` not `bg-[#C44A0F]`.
2. **Never invent radii.** Use the four scale stops (0, 8, 12, full) only.
3. **Two weights.** If you reach for `font-medium` or `font-semibold`, you're wrong. Use 400 or 700.
4. **Limit colors per page.** Saffron + ink + muted + one neutral surface. That's it.
5. **Reject "improvements" that add visual noise.** Ask: "Does this feel like BMW × Starbucks × Gujarat, or like a Vercel template?"

---

## Sources

- `DESIGN-bmw.md` — BMW corporate design system reference
- `DESIGN-starbucks.md` — Starbucks design system reference
- Both pulled via `npx getdesign@latest`
