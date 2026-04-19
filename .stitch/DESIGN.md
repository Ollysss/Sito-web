# Design System: Servizi Digitali Interattivi

**Project ID:** 11470275921198688977  
**Screen ID:** f77ad91bdfd745cc8f3ae9fb560ad798  
**Screen Name:** Portfolio - COL Games

---

## 1. Visual Theme & Atmosphere

**Mood:** Sophisticated Tech-Forward Minimalism with Editorial Luxury  
**Aesthetic Philosophy:** "Architecting Digital Atmospheres"

The design embodies a **futuristic yet refined** atmosphere—blending:
- **Deep cosmic darkness** (not pure black, but intentional blue-indigo undertones)
- **Ethereal glassmorphism** effects for layered depth and lightness
- **Soft glowing accents** that draw focus without harshness
- **Smooth, fluid micro-interactions** (3D card rotations, hover scales, transitions)
- **Editorial precision** in typography hierarchy and whitespace

This is **not brutalist or harsh**—it's **airy professionalism meets sci-fi elegance**.

---

## 2. Color Palette & Roles

### Primary Spectrum
- **Primary: Indigo Lavender** (#c0c1ff) — Main action color, headlines, focal points
- **Primary Container: Deep Indigo** (#4b4dd8) — Button backgrounds, accent fills
- **Inverse Primary: Muted Indigo** (#494bd6) — Secondary interactions

### Secondary Spectrum (Cyan Accent)
- **Secondary: Electric Cyan** (#4cd7f6) — Active navigation, category labels, highlights
- **Secondary Container: Deep Cyan** (#03b5d3) — Supporting fills
- **Secondary Fixed: Light Cyan** (#acedff) — Muted backgrounds

### Tertiary (Purple Accent)
- **Tertiary: Soft Lavender** (#ddb8ff) — Decorative and tertiary interactions
- **Tertiary Container: Rich Purple** (#7d42b6) — Deep accents

### Surfaces & Backgrounds
- **Background: Deep Space Blue** (#0b1326) — Main canvas
- **Surface: Deep Space Blue** (#0b1326) — Content areas
- **Surface Container: Slate Gray-Blue** (#171f33) — Cards, panels
- **Surface Container High: Dark Blue** (#222a3d) — Elevated containers
- **Surface Container Highest: Medium Blue** (#2d3449) — Highest elevation

### Text & Contrast
- **On Surface: Soft Lavender** (#dae2fd) — Primary text, high contrast
- **On Surface Variant: Muted Purple** (#c7c4d8) — Secondary text, lower contrast
- **On Primary: Deep Indigo** (#1000a9) — Text on primary buttons
- **On Primary Container: White-ish Lavender** (#d9d8ff) — Text on containers

### Utility
- **Outline: Gray-Purple** (#918fa1) — Borders, dividers
- **Outline Variant: Dark Purple** (#464555) — Subtle borders
- **Error: Coral Pink** (#ffb4ab) — Error states

---

## 3. Typography Rules

### Font Families
- **Headlines (Manrope):** Bold, expressive, tech-forward serif alternative
  - Weights: 700 (bold), 800 (extra bold)
  - Used for: H1, H2, H3, major titles
  - Tracking: Tight (tighter-than-default), all-caps variants

- **Body & Labels (Inter):** Clean, neutral, highly legible
  - Weights: 400 (regular), 500 (medium), 600 (semibold)
  - Used for: Body copy, navigation, UI labels
  - Tracking: Normal to wide (0.2em uppercase)

### Scale Hierarchy
- **H1 (Hero):** 3.5rem (56px), font-bold, text-indigo-200, tracking-tighter
- **H2 (Section):** 2.25rem (36px), font-headline font-bold
- **H3 (Card Title):** 1.5rem (24px), font-headline font-bold, tracking-tight
- **Body (Large):** 1.125rem (18px), text-on-surface-variant
- **Body (Regular):** 1rem (16px)
- **Label (Small):** 0.875rem (14px), text-on-surface-variant
- **Label (XSmall):** 0.75rem (12px), uppercase, tracking-widest

---

## 4. Component Stylings

### Buttons
- **Primary Action Button**
  - Background: Gradient from Primary to Primary Container (#c0c1ff → #4b4dd8)
  - Text: On Primary (#1000a9)
  - Padding: px-8 py-3 (large), px-10 py-4 (extra large)
  - Rounding: rounded-md (0.375rem / 6px)
  - Shadow: shadow-lg shadow-primary-container/20
  - Hover: brightness-110
  - Active: scale-95

- **Secondary Button (Outline)**
  - Background: Transparent
  - Border: 1px solid outline-variant (#464555)
  - Text: secondary (#4cd7f6)
  - Hover: bg-secondary/10
  - Rounding: rounded-md

### Cards & Containers
- **Project Card**
  - Background: Surface Container (#171f33)
  - Rounding: rounded-xl (0.75rem)
  - Shadow: shadow-2xl
  - Border: 1px gradient border (p-px technique)
  - Hover: gradient glow from secondary/primary
  - Image aspect: 16:9 (h-64)

- **Glassmorphism Panel**
  - Background: rgba(49, 57, 77, 0.4) semi-transparent
  - Backdrop Filter: blur(20px) with -webkit fallback
  - Border: 1px solid outline-variant/10
  - Rounding: rounded-xl
  - Padding: p-16

### Navigation & Headers
- **Fixed Header**
  - Position: fixed top-0 z-50
  - Background: slate-950/40 with backdrop-blur-2xl
  - Shadow: shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] (blue glow)
  - Padding: px-12 py-6

- **Nav Links**
  - Active: text-secondary with bottom border
  - Hover: brightness-125 transition
  - Inactive: text-slate-400 hover:text-white

### Decorative Elements
- **Blur Orbs** (Background Accents)
  - Size: w-96 h-96
  - Color: secondary-container or primary
  - Opacity: 10%
  - Blur: blur-[120px] or blur-[80px]
  - Purpose: Atmospheric depth without visual clutter

---

## 5. Layout Principles

### Grid & Spacing
- **Max Width:** 1440px (xl container)
- **Horizontal Padding:** px-8 (content) to px-12 (header/footer)
- **Vertical Spacing:** mb-24 (major sections), gap-12 (grid)
- **Project Grid:** 
  - 1 column (mobile)
  - 2 columns (tablet, md)
  - 3 columns (desktop, lg)

### Whitespace Strategy
- **Generous vertical rhythm** — sections breathe with 6rem (96px) gaps
- **Compressed horizontal** — max-w-3xl for text blocks (optimal reading)
- **Floating elements** — images and accent orbs placed absolutely for atmospheric depth

### Elevation & Depth
- **3D Perspective:** CSS preserve-3d with rotateY/rotateX hover effects
- **Card Elevation:** Stacked shadows (shadow-2xl base, shadow-lg accents)
- **Blur Depth:** backdrop-filter blur-2xl on header, blur-20px on panels
- **Opacity Layering:** Overlays use opacity-60, backgrounds use opacity-10

### Animation Timing
- **Transitions:** duration-300 (standard), duration-500 (heavy), duration-700 (image zoom)
- **Easing:** ease-out (default natural feel)
- **Hover States:** scale-110 (images), scale-95 (buttons), translate-x-1 (text links)
- **Performance:** All animations use GPU-friendly transforms (scale, translate, rotate)

---

## 6. Responsive Breakpoints

- **Mobile:** Base, hidden elements use hidden md:flex
- **Tablet (md):** 2-column grid, visible navigation
- **Desktop (lg):** 3-column grid, staggered card offsets (lg:mt-12)
- **Max Width:** 1440px, centered with mx-auto

---

## 7. Accessibility & Semantics

- **Selection Color:** Primary (#c0c1ff) with high contrast text
- **Material Icons:** Used for navigation (arrow_back, arrow_forward)
- **Alt Text:** All images have descriptive alt attributes
- **Semantic HTML:** Proper header, main, section, footer structure
- **Focus States:** Brightness transitions on interactive elements

---

## 8. Technical Stack

- **Framework:** Tailwind CSS (v3+) with custom config
- **Icons:** Material Symbols Outlined (Google Fonts)
- **Fonts:** Manrope (headlines) + Inter (body), via Google Fonts
- **Dark Mode:** class-based (darkMode: "class" in Tailwind config)
- **Custom CSS:** Inline styles for perspective, 3D transforms, and glassmorphism filters

---

## 9. Usage Notes for Future Designs

✅ **DO:**
- Leverage the indigo-lavender primary for all CTAs
- Use cyan secondary for active/highlighted states
- Apply glassmorphism panels for elevated content
- Animate on hover—it's part of the brand identity
- Maintain high contrast text (lavender on dark blue)
- Use blur orbs for atmospheric depth (never overwhelming)

❌ **DON'T:**
- Deviate to bright, saturated colors (keep it refined)
- Use harsh black or white—stick to the defined palette
- Skip animations—they're core to the aesthetic
- Clutter layouts—whitespace is a design tool
- Ignore the 3D perspective on cards—it's signature

---

**Generated:** April 2026  
**Purpose:** Source of truth for "Servizi Digitali Interattivi" portfolio design consistency
