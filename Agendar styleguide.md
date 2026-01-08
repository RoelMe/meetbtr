# Agendar Visual Design Guidelines
Drafted based on research into Cal.com, Linear.app, and Midday.ai.

## 1. Core Philosophy: "The Functional Premium"
Agendar's design should sit at the intersection of utility (Linear) and approachability (Cal.com). It should feel like a high-precision tool for professionals, yet welcoming enough for daily use.

Keywords: **Focused**, **Airy**, **Refined**, **Responsive**, **"Border-First"**.

## 2. Color Palette
Move away from generic grays to a purposeful, high-contrast system using standard Tailwind CSS classes.

### Backgrounds (The Canvas)
Avoid pure black/white for the main canvas. Use "Off" shades to reduce eye strain and feel more premium.

*   **Light Mode Canvas**: `bg-gray-50` (Cool cool gray)
*   **Light Mode Surface**: `bg-white` (Pure White) -> Used for cards/modals.
*   **Dark Mode Canvas**: `bg-zinc-950` (Deep bluish-gray, "Linear" feel)
*   **Dark Mode Surface**: `bg-zinc-900` (Slightly lighter, strictly for cards)

### Borders (Depth)
We define depth primarily through borders, not shadows. Shadows should be reserved for floating elements (popovers, dropdowns).

*   **Subtle Border**: `border-gray-200` (Light) / `border-zinc-800` (Dark)
*   **Active/Highlight Border**: `border-gray-300` / `border-zinc-700` or Brand Color.

### Typography Colors
*   **Primary Text**: `text-gray-900` (Light) / `text-zinc-50` (Dark) - High contrast for readability.
*   **Secondary Text**: `text-gray-500` (Light) / `text-zinc-400` (Dark) - For metadata, dates.
*   **Tertiary Text**: `text-gray-400` (Light) / `text-zinc-500` (Dark) - For placeholders only.

### Brand Accent
Select one signature color.

*   **Suggestion**: "Agendar Slate" (`slate-600` / `slate-500`). It implies focus and calm.
*   **Usage**: Primary buttons, active tab indicators, "now" time lines, and subtle background glows.

## 3. Typography
Capitalize on the existing Geist Sans (or Inter).

*   **Headings**: Bold (Weight 700), Tight Tracking (`-0.02em` or `-0.03em`).
    *   *Why?* Tight tracking on large text looks modern and confident (Cal.com style).
*   **Body**: Regular (Weight 400), Normal Tracking.
*   **Data/Labels**: Medium (Weight 500), Normal Tracking.
*   **Numbers/IDs**: Geist Mono (or JetBrains Mono).
    *   *Usage*: Timestamps, IDs, tabular data. This adds the "engineering precision" feel of Linear.

## 4. Layout & Spacing
*   **Density**: "Comfortable Density". Not as sparse as a landing page, not as cramped as Excel.
*   **The Grid**: Align main content areas to a central column (max-width 1200px or 1400px) but allow full-width headers.
*   **Whitespace**:
    *   Cards should have internal padding of `p-6` (24px).
    *   Sections should be separated by `gap-8` (32px).

## 5. UI Components

### Cards
*   **Shape**: `rounded-xl` (12px) or `rounded-2xl` (16px).
*   **Style**: Flat background, 1px subtle border, no shadow by default.
*   **Hover**: Transition to `border-gray-300` (Light) / `border-gray-700` (Dark) and a very subtle shadow (`shadow-sm`).

### Buttons
*   **Primary**: Solid Brand Color, `text-white`, `rounded-lg` (8px-10px), subtle inner shadow/gloss.
*   **Secondary**: Transparent background, `border border-gray-200`, `text-gray-900`, `hover:bg-gray-50`.
*   **Icon Buttons**: `text-gray-500`, `hover:text-gray-900`, `hover:bg-gray-100` (rounded-md).

### Visual Flourishes ("The Magic")
*   **Glassmorphism**: Use `backdrop-blur-md` and `bg-white/80` (or `bg-black/80`) for sticky headers and floating menus.
*   **Gradients**: Use extremely subtle "spotlight" gradients in the background to highlight active areas (e.g., top-left glow on the active meeting card).
*   **Micro-interactions**:
    *   Active inputs should have a "ring" that corresponds to the Brand Accent.
    *   List items (action items) should have a hover state that highlights the entire row with a very light background (`bg-gray-50/50`).

## 6. Implementation Strategy
*   **globals.css**: Define the new CSS variables for colors (Canvas, Surface, Border).
*   **Refine tailwind.config.ts**: strictly map border-radius, font-family, and colors to these guidelines.
*   **Global Background**: Add a subtle "dot pattern" or noise texture SVG to the body background to kill the "flatness" of pure CSS colors.

### Example: Background Dot Pattern (Tailwind)
```css
body {
  background-color: var(--background);
  background-image: radial-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px);
  background-size: 20px 20px; /* Distinct grid feel */
}
```