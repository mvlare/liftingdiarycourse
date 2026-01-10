# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the sole UI component library. All UI components must come from shadcn/ui.

## Rules

### 1. Only Use shadcn/ui Components

**ABSOLUTELY NO custom UI components should be created.** All UI elements must be built using shadcn/ui components.

- Use existing shadcn/ui components for all UI needs
- If a component doesn't exist in the project, add it from shadcn/ui using the CLI or by copying from the shadcn/ui documentation
- Compose complex UIs by combining multiple shadcn/ui components

### 2. Adding New Components

To add a new shadcn/ui component:

```bash
npx shadcn@latest add <component-name>
```

Or manually copy the component code from [ui.shadcn.com](https://ui.shadcn.com) into `components/ui/`.

### 3. Component Location

All shadcn/ui components reside in:

```
components/ui/
```

### 4. Styling

- Use Tailwind CSS utility classes for layout and spacing
- Use the `cn()` utility from `@/lib/utils` for conditional class merging
- Leverage CSS variables defined in `globals.css` for theming
- Do not create custom CSS files for components

### 5. Customization

If a shadcn/ui component needs modification:

- Extend it using the component's built-in variant props
- Use Tailwind classes via the `className` prop
- Modify the component file in `components/ui/` directly if needed
- **Do not** create wrapper components or custom alternatives

### 6. Available Components

Current shadcn/ui components in this project:

- `Button` - `@/components/ui/button`
- `Calendar` - `@/components/ui/calendar`
- `Popover` - `@/components/ui/popover`
- `DatePicker` - `@/components/ui/date-picker`

Add more components from shadcn/ui as needed.

### 7. Date Formatting

All date formatting must use **date-fns**. Dates should be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the format string `do MMM yyyy`:

```typescript
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```

- `do` - Day of month with ordinal (1st, 2nd, 3rd, 4th, etc.)
- `MMM` - Abbreviated month name (Jan, Feb, Mar, etc.)
- `yyyy` - Full year

## Rationale

- **Consistency**: Single source of truth for UI components
- **Accessibility**: shadcn/ui components are built with accessibility in mind
- **Maintainability**: No custom component debt to maintain
- **Design System**: Cohesive look and feel across the application
