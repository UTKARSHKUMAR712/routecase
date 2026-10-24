---
name: frontend-design
description: Guidelines and design system for crafting premium developer tool websites, dark-mode interfaces, interactive mockups, and responsive layouts.
---

# Frontend Design Guidelines for Developer Tools

## Visual Philosophy & Aesthetic
- **Color Palette:**
  - Base Background: Deep midnight navy / near-black (`#0B0F19`, `#080C14`, `#0D1117`).
  - Elevated Surfaces / Cards: `#111827`, `#161F30`, `#1E293B`.
  - Borders & Dividers: Subtle translucent borders (`rgba(56, 189, 248, 0.15)` or `rgba(255, 255, 255, 0.08)`).
  - Primary Accent: Electric Cyan (`#00E5FF` / `#38BDF8`).
  - Secondary Accent: Neon Indigo / Violet (`#6366F1` / `#818CF8`).
  - Success Indicator: Mint / Emerald (`#10B981` / `#34D399`).
  - Warning / Error: Amber (`#F59E0B`) and Coral Red (`#EF4444`).
  - Typography: Pure white headings (`#F8FAFC`), cool slate body text (`#94A3B8`, `#CBD5E1`).

## Typography & Hierarchy
- Font Family: Clean modern sans-serif (`Inter`, system sans-serif stack) for interface and prose. Monospace (`JetBrains Mono`, `Fira Code`, system monospace) for code and endpoints.
- Line heights: Relaxed (`1.6`–`1.75`) for prose readability; compact for tables and code blocks.
- Hierarchy: Clear font weight contrast (Bold 700 / Semi-bold 600 for headings, Regular 400 for copy).

## Interactive Polish & Usability
- Micro-interactions: Smooth 150ms-250ms transitions on hover, focus, and active states.
- Code Blocks: Syntax highlighting with copy-to-clipboard buttons and language badges.
- Responsive Behavior: Mobile-first responsive grid system (collapsible navigation drawer, flexible flex/grid wrapping, touch-friendly tap targets >= 44px).
- Accessibility: Minimum 4.5:1 contrast ratio for normal text, visible keyboard `:focus-visible` outlines, ARIA roles for interactive modals and search dialogues.
