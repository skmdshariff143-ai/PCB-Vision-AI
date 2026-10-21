# PCB Vision AI — Premium UI/UX Design System Specification

**Version:** 2.0.0  
**Target Atmosphere:** Industrial Computer Vision, High-Precision Automated Optical Inspection (AOI), Academic Research Laboratory  
**Theme:** Dark Precision Mode (Primary) with high-contrast data visualization tokens  
**Compliance Target:** WCAG 2.2 Level AA

---

## 1. Design Philosophy

The PCB Vision AI interface bridges two distinct disciplines:
1. **Physical Surface Electronics Engineering:** The visual language of bare FR-4 substrate, etched copper traces, solder pads, silkscreen markings, and manufacturing anomalies.
2. **Precision Analytical Computing:** Real-time client-side neural tensor inference, deterministic morphological pixel filters, and microsecond latency measurement.

The UI avoids generic marketing gradients, whimsical animations, and non-functional decorative clutter. Every visual element serves diagnostic clarity.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Background & Neutral Scale (Dark Precision Canvas)
- **Canvas Base:** `#090d16` (Ultra-deep slate with subtle cool undertone, reduces eye strain during prolonged defect inspection)
- **Panel Surface / Card:** `#0f172a` (Slate 900, elevated surfaces, cards, and modal backdrops)
- **Panel Elevated:** `#1e293b` (Slate 800, active toolbars, hover backgrounds, and nested containers)
- **Border Default:** `#334155` (Slate 700, crisp 1px borders delineating analytical panels)
- **Border Subtle:** `rgba(51, 65, 85, 0.4)` (Sub-dividers between tabular rows)
- **Border Focus:** `#10b981` (Emerald 500, accessible focus rings)

### 2.2 Brand & Accent Colors
- **Emerald Pulse (Primary Brand):** `#10b981` (Signifies system operational readiness, verified benchmarks, and normal operation)
- **Teal / Cyan (Data & Deep Learning):** `#06b6d4` / `#14b8a6` (Used for neural network layers, latency counters, and AI inference badges)
- **Amber / Copper (Substrate & Traces):** `#f59e0b` / `#d97706` (Represents physical copper traces and moderate defect classifications)
- **Indigo / Academic (Research & Citations):** `#6366f1` (Used for mathematical formulas, viva voce documentation, and university references)

### 2.3 Six Defect Category Color Taxonomy (Normalized & Colorblind-Accessible)
Every defect category has a standardized, immutable hex code used consistently across PyTorch training visualizations, ONNX inference bounding boxes, and tabular metrics:

| Class ID | Defect Category | Hex Code | Swatch Name | Semantic Contrast Ratio against `#090d16` |
|---|---|---|---|---|
| **0** | **Open Circuit** | `#ef4444` | Crimson Red | 5.2 : 1 (WCAG AA Pass) |
| **1** | **Short Circuit** | `#f97316` | Industrial Orange | 7.4 : 1 (WCAG AA Pass) |
| **2** | **Mouse Bite** | `#eab308` | Amber Yellow | 10.8 : 1 (WCAG AAA Pass) |
| **3** | **Spur** | `#a855f7` | Electric Purple | 5.8 : 1 (WCAG AA Pass) |
| **4** | **Spurious Copper** | `#06b6d4` | Clean Cyan | 8.9 : 1 (WCAG AAA Pass) |
| **5** | **Pin Hole** | `#22c55e` | Emerald Green | 8.4 : 1 (WCAG AAA Pass) |

---

## 3. Typography Hierarchy

| Role | Font Family | Size / Leading | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| **Display Hero** | System Sans / Inter | 36px / 44px (`text-4xl sm:text-5xl`) | 800 (Extrabold) | `-0.025em` | Hero section main headline |
| **H1 Section** | System Sans / Inter | 24px / 32px (`text-2xl`) | 700 (Bold) | `-0.02em` | View titles, primary modal headers |
| **H2 Subhead** | System Sans / Inter | 18px / 26px (`text-lg`) | 600 (Semibold) | `-0.01em` | Panel titles, table headers |
| **H3 Card** | System Sans / Inter | 15px / 22px (`text-base`) | 600 (Semibold) | Normal | Card titles, category headings |
| **Body Default** | System Sans / Inter | 14px / 20px (`text-sm`) | 400 (Regular) | Normal | Descriptive text, tooltips |
| **Body Small** | System Sans / Inter | 12px / 16px (`text-xs`) | 400 (Regular) | Normal | Secondary annotations, helper labels |
| **Data & Code** | JetBrains Mono / SF Mono | 12px / 16px (`text-xs font-mono`) | 500 (Medium) | Normal | Coordinates, confidence scores, latencies |

---

## 4. Spacing & Elevation System

- **Layout Container:** Max width `80rem` (`max-w-7xl`), centered with responsive horizontal padding (`px-4 sm:px-6 lg:px-8`).
- **Section Gap:** 24px (`space-y-6`) between major functional cards.
- **Card Padding:** 20px (`p-5`) on desktop, 16px (`p-4`) on mobile.
- **Border Radii:** `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons and inputs, `rounded` (4px) for micro-badges.
- **Box Shadows:** Clean, tight ambient occlusion (`shadow-sm`, `shadow-md shadow-black/40`) with 1px border outlines to define depth on OLED/LCD dark screens.

---

## 5. Interactive Components & States

### 5.1 Buttons & Controls
- **Primary Action (Inspect / Run):** Gradient from `emerald-600` to `teal-600` with emerald border hover highlight; active state slightly scale-depressed (`active:scale-[0.99]`).
- **Secondary Action (Samples / Export):** `slate-800` background with `slate-700` border, transitions to `slate-700` on hover.
- **Focus Rings:** All buttons, links, inputs, and sliders explicitly implement `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`.
- **Minimum Touch Target:** All interactive controls maintain $\ge 44 \times 44\text{ px}$ clickable area for mobile touch accessibility.

### 5.2 Inspection Canvas Controls
- **Zoom Levels:** Fit to Screen, 100% (1:1 Native), 200%, 400%.
- **Pan Dragging:** Active grab cursor with bounded displacement.
- **Split Difference Slider:** Interactive vertical divider allowing seamless before/after or test/template comparison.
- **Per-Class Toggles:** Interactive checkbox badges allowing toggling of bounding boxes for each of the six defect classes independently.

---

## 6. Accessibility (WCAG 2.2 AA) Rules

1. **Non-Color Dependence:** Every defect bounding box carries both a distinct hex outline AND an explicit text label (e.g., `OPEN 94.2%`) with a high-contrast solid background badge.
2. **Keyboard Navigation:** Every action (sample selection, file upload, inference trigger, export, zoom) is reachable and operable via keyboard alone (`Tab`, `Space`, `Enter`).
3. **Screen Reader Landmarks:** Proper semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) with explicit `aria-label`s on icon-only controls.
4. **Motion Safety:** All animations respect `prefers-reduced-motion: reduce`.
