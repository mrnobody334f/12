# NovaSearch Design Guidelines

## Design Approach

**Reference-Based Approach** inspired by:
- **Perplexity AI**: Clean search interface, AI summary presentation
- **Linear**: Modern typography, subtle interactions, professional feel
- **Google Search**: Familiar search patterns, result card layouts
- **Notion**: Card-based information architecture, elegant spacing

**Key Design Principles:**
1. Information clarity over visual noise
2. AI-powered intelligence through subtle visual cues
3. Instant visual feedback for dynamic content
4. Professional, trustworthy aesthetic
5. Scannable result cards with clear hierarchy

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Background: 0 0% 100% (pure white)
- Surface: 240 5% 96% (subtle gray for cards)
- Primary: 221 83% 53% (vibrant blue for CTAs, active tabs)
- Text Primary: 222 47% 11% (dark slate)
- Text Secondary: 215 14% 34% (muted slate)
- Border: 214 32% 91% (light borders)
- AI Accent: 262 83% 58% (purple for AI elements)
- Success: 142 71% 45% (green for verified sources)

**Dark Mode:**
- Background: 222 47% 11% (deep dark blue)
- Surface: 217 33% 17% (elevated dark surface)
- Primary: 221 83% 53% (same vibrant blue)
- Text Primary: 210 40% 98% (off-white)
- Text Secondary: 215 20% 65% (muted blue-gray)
- Border: 215 28% 17% (subtle borders)
- AI Accent: 262 83% 58% (same purple)
- Success: 142 71% 45% (same green)

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - Clean, modern sans-serif
- Monospace: 'JetBrains Mono' - For technical content/code snippets

**Hierarchy:**
- Search Input: text-lg (18px), font-medium
- Page Title: text-3xl (30px), font-bold
- AI Summary Heading: text-xl (20px), font-semibold
- Tab Labels: text-sm (14px), font-medium
- Result Titles: text-base (16px), font-semibold
- Snippets: text-sm (14px), font-normal
- Metadata: text-xs (12px), font-normal

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing: 2 (8px) - Between inline elements
- Small gaps: 4 (16px) - Card internal padding
- Medium gaps: 6 (24px) - Between sections
- Large gaps: 8 (32px) - Major section separation
- XL gaps: 12 (48px) - Page-level spacing

**Container Widths:**
- Max content width: max-w-7xl (1280px)
- Search bar container: max-w-3xl (768px)
- Result cards: w-full within container

**Grid System:**
- Single column on mobile
- 2-column for "Smart Recommendations" on tablet/desktop
- Masonry-style result grid optional for visual-heavy queries

### D. Component Library

**1. Search Interface:**
- Centered search bar with generous padding (p-4)
- Rounded corners (rounded-2xl)
- Subtle shadow (shadow-lg in light, custom glow in dark)
- Search icon left, microphone/camera icons right
- Auto-complete dropdown below with subtle animation

**2. Dynamic Tabs:**
- Horizontal scrollable tab bar below search
- Active tab: Primary color background, white text
- Inactive tabs: Transparent, secondary text
- Tab icons: 16px, positioned left of label
- Smooth underline animation on switch
- Pill-shaped (rounded-full), padding px-4 py-2

**3. AI Summary Card:**
- Floating card above results (rounded-xl, p-6)
- Purple accent border-left (border-l-4)
- AI icon (sparkle/stars) top-left
- Gradient background (subtle purple-to-blue, 5% opacity)
- Collapsible on mobile
- Typography: Larger line-height for readability (leading-relaxed)

**4. Result Cards:**
- Individual cards (rounded-lg, p-4, border, shadow-sm)
- Favicon/logo: 20px circle, top-left
- Source name: Small caps, secondary color
- Title: Semibold, primary color, underline on hover
- Snippet: 2-3 lines, ellipsis truncation
- Thumbnail (if available): 120px × 80px, rounded, right-aligned
- Hover state: Slight scale (scale-[1.01]), shadow increase

**5. Smart Recommendation Cards:**
- Featured styling with gradient border (2px)
- "AI Pick" badge top-right
- Star rating or trust indicator
- Price/key info prominently displayed
- Larger thumbnail (160px × 120px)

**6. Filters & Controls:**
- Dropdown filters (Time, Type, Region) - subtle, non-intrusive
- Toggle switches for advanced options
- Positioned right of tabs or in expandable panel

**7. Navigation:**
- Minimal top bar with logo left, theme toggle right
- No traditional nav menu - focus stays on search
- Logo: "NovaSearch" with gradient text effect

**8. Loading States:**
- Skeleton loaders matching card structure
- Pulsing animation (animate-pulse)
- Shimmer effect for premium feel

**9. Empty/Error States:**
- Friendly illustrations or icon
- Helpful suggestions for refinement
- Centered, generous spacing

### E. Interactions & Animations

**Minimal, Purposeful Animations:**
- Tab switching: Slide transition (duration-300)
- Card hover: Subtle lift (transform, duration-200)
- AI summary reveal: Fade-in from top (duration-500)
- Search input focus: Glow effect (ring-2 ring-primary)
- Result appearance: Staggered fade-in (delay increments)

**No Animations For:**
- Button hover states (native)
- Text color changes
- Background transitions

---

## Layout Structure

**Page Hierarchy:**

1. **Header** (sticky, backdrop-blur)
   - Logo + wordmark
   - Theme toggle
   - Minimal height (h-16)

2. **Search Hero** (centered, pt-12 pb-8)
   - Large search input
   - Suggested queries below (hidden after first search)

3. **Tab Bar** (sticky below header)
   - Dynamic tabs based on intent
   - Filters aligned right

4. **AI Summary Section** (pt-6)
   - Prominent card
   - Expandable/collapsible

5. **Results Grid** (pt-4, pb-12)
   - Gap-4 between cards
   - Infinite scroll or pagination

6. **Footer** (minimal)
   - About, Privacy, Terms links
   - AdSense placeholder zones

---

## Special Features

**AdSense Integration Zones:**
- Subtle rectangular slots between every 5th-7th result
- Clearly labeled "Sponsored" in muted text
- Match card styling but with distinct border color

**Intent-Based Visual Cues:**
- Shopping: Cart icon, price tags in green
- News: Breaking news badge, timestamp prominence
- Learning: Book icon, difficulty level
- Entertainment: Play button overlay on thumbnails

**Accessibility:**
- WCAG AA contrast ratios maintained
- Focus indicators visible (ring-2)
- Screen reader labels on all interactive elements
- Keyboard navigation for tabs and results

---

## Images

**No Large Hero Image** - This is a utility-focused search interface. Images appear only in:
- Search result thumbnails (context-dependent)
- Source logos/favicons
- Empty state illustrations
- AI avatar/icon (subtle, 24px)

**Image Treatment:**
- Lazy loading for all thumbnails
- Rounded corners (rounded-md)
- Object-fit cover to prevent distortion
- Subtle border in light mode
- Placeholder with dominant color extraction

---

## Responsive Behavior

**Mobile (< 768px):**
- Full-width search bar
- Horizontal scroll tabs
- Single column results
- Collapsed filters (expandable drawer)
- Larger touch targets (min-h-12)

**Tablet (768px - 1024px):**
- Centered max-w-4xl container
- 2-column smart recommendations
- Visible filters

**Desktop (> 1024px):**
- Max-w-7xl container
- Side-by-side filters and results
- Hover states active
- Multi-column smart picks (3 columns)

---

This design creates a **modern, intelligent search experience** that feels familiar yet innovative, professional yet approachable, and scales seamlessly from a simple query to complex multi-source research sessions.