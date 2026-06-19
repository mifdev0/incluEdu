---
name: Inclusive Education System
colors:
  surface: '#fef7ff'
  surface-dim: '#dfd7e6'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f1ff'
  surface-container: '#f3ebfa'
  surface-container-high: '#ede5f4'
  surface-container-highest: '#e8dfee'
  on-surface: '#1d1a24'
  on-surface-variant: '#4a4455'
  inverse-surface: '#332f39'
  inverse-on-surface: '#f6eefc'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#1b6b4f'
  on-secondary: '#ffffff'
  secondary-container: '#a6f2cf'
  on-secondary-container: '#247155'
  tertiary: '#6e5e0d'
  on-tertiary: '#ffffff'
  tertiary-container: '#bfab56'
  on-tertiary-container: '#4b3f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#a6f2cf'
  secondary-fixed-dim: '#8bd6b4'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#00513a'
  tertiary-fixed: '#f9e287'
  tertiary-fixed-dim: '#dcc66e'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#534600'
  background: '#fef7ff'
  on-background: '#1d1a24'
  surface-variant: '#e8dfee'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is built for an AI-powered inclusive education platform that balances academic rigor with a nurturing, accessible atmosphere. The brand personality is optimistic, supportive, and human-centric. It aims to evoke a sense of safety and curiosity, ensuring that students and educators of all abilities feel empowered rather than overwhelmed by technology.

The aesthetic follows a **Modern Playful** direction. It leverages the "Neo-Memphis" softness—combining high-quality editorial typography with organic, rounded shapes and a vibrant, pastel-informed palette. The design avoids the coldness of traditional SaaS by using tactile-inspired surfaces, generous whitespace, and whimsical decorative elements like hand-drawn doodles and geometric sparkles to highlight AI-generated insights.

## Colors

The palette is anchored by a warm, off-white background to reduce eye strain and provide a "paper-like" feel. 

- **Primary Accent:** A vibrant Purple (#7C3AED) used for critical actions, active states, and brand-defining moments.
- **Surface Palette:** Three distinct soft pastels (Soft Purple, Mint Green, and Warm Yellow) are used to categorize content types or differentiate learning modules.
- **Contrast:** All text and functional iconography remain in high-contrast dark charcoal (#1A1A1A) to ensure WCAG AAA accessibility compliance against the pastel backgrounds.
- **Semantic Colors:** Use standard success (green), warning (amber), and error (red) tones, but desaturate them slightly to match the soft tonal range of the design system.

## Typography

This design system utilizes a sophisticated pairing of a bold serif and a friendly sans-serif. 

- **Headlines:** Playfair Display provides an authoritative yet elegant "editorial" feel, making educational content feel curated and valuable. Use tight letter-spacing for large displays.
- **Body & UI:** Plus Jakarta Sans is selected for its high x-height and open apertures, which significantly improve readability for users with dyslexia or visual impairments.
- **Scale:** Maintain a clear hierarchy. Large display type should be reserved for landing moments and module headers, while body text should never drop below 16px to ensure accessibility.

## Layout & Spacing

The layout philosophy centers on **Generous Breathing Room**. Use a 12-column fluid grid for desktop with wide margins (48px+) to prevent content from feeling "trapped." 

- **Centricity:** For focus-heavy tasks (like lessons or quizzes), use a narrow, centered 8-column layout to minimize horizontal eye movement.
- **Rhythm:** Spacing follows an 8px linear scale. Use larger gaps (`lg` and `xl`) between distinct content sections to visually group related items without needing heavy dividers.
- **Mobile:** Transition to a single-column layout with 16px side margins. Horizontal scrolling "cards" are preferred for navigating categories on smaller screens.

## Elevation & Depth

This system avoids heavy drop shadows in favor of **Tonal Layering** and **Flat Dimensions**. 

- **Flat Depth:** Most cards do not float; they sit flat on the background with a subtle 1px border colored slightly darker than the surface color (e.g., a dark-purple border on a soft-purple card).
- **Interactive Elevation:** Upon hover, cards should lift using a "hard shadow" (0px blur, 4px-8px offset) to create a sticker-like, tactile effect rather than a realistic 3D shadow.
- **Glassmorphism:** Use background blurs (12px) only for persistent navigation bars or modal overlays to maintain context of the content underneath.

## Shapes

The shape language is extremely soft and approachable. 

- **Primary Radius:** Use the "Pill" style (32px+) for all buttons, input fields, and tags.
- **Card Radius:** Larger containers and cards use a 24px-32px (2xl/3xl) radius to maintain a "bubbly" and safe aesthetic.
- **Decorative Elements:** Incorporate "Squircle" shapes and organic, imperfect hand-drawn circles for decorative background accents. Avoid sharp 90-degree corners entirely across the UI.

## Components

- **Buttons:** Primary buttons are pill-shaped, filled with the Primary Purple, and use white or high-contrast text. Secondary buttons use a thick 2px border with no fill.
- **Cards:** Use the three signature pastel colors for card backgrounds. Every card should have a 1px stroke (opacity 10-20% of the text color) to define its edges against the off-white background.
- **Input Fields:** Large, pill-shaped enclosures with 16px horizontal padding. Focus states should use a thick 2px purple border and a soft glow.
- **Chips/Badges:** Small pill shapes using a contrasting pastel color from the parent container (e.g., a Mint Green chip on a Soft Purple card).
- **Doodles:** Integrate small SVG "sparkle" or "underline" decorations around AI-generated text or highlighted keywords to draw the eye in a friendly way.
- **Progress Bars:** Thick, rounded tracks with a bright accent color fill, avoiding "thin" lines that are hard to see.