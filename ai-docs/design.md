# UI Design Guidelines & Tech Stack

## Tech Stack
- Framework: React (Vite)
- Styling: Tailwind CSS
- Components: shadcn/ui
- Icons: Lucide React

## Design Tokens (Visual Identity)
- **Color Palette:**
  - Primary: Slate-900 (High contrast)
  - Accent: Indigo-600
  - Background: White / Slate-50 (Light mode), Slate-950 (Dark mode)
- **Radius:** 0.5rem (Rounded-md)
- **Spacing:** Relaxed breathing room (p-4, gap-4 default)

## Component Rules
1. **Buttons:** Always use `Button` from shadcn. Default to 'default' variant for primary actions, 'ghost' for secondary.
2. **Inputs:** Use standard Tailwind forms plugin styles or shadcn Input component.
3. **Layout:**
   - Use Flexbox/Grid for layouts.
   - Mobile-first approach (`block` by default, `md:flex` for desktop).
4. **Typography:**
   - Headings: Bold, Tracking-tight.
   - Body: Slate-600 for text, Slate-900 for headings.

## Code Style for UI
- Do not create custom CSS classes unless absolutely necessary; use Tailwind utility classes.
- Ensure all interactive elements have focus states (`focus-visible:ring-2`).
- Support Dark Mode using `dark:` prefix.