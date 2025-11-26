# UI Components

This directory contains reusable UI components for the Super Alpha Agent platform.

## Card Component

A flexible, composable card component with shadow and hover effects for displaying content.

### Features

- ✅ **Multiple Variants**: default, elevated, outlined, ghost
- ✅ **Flexible Padding**: none, sm, default, lg
- ✅ **Hover Effects**: Smooth shadow transitions on hover
- ✅ **Responsive Layout**: Works seamlessly in grid layouts
- ✅ **Composable**: Includes CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- ✅ **TypeScript**: Full type safety with VariantProps
- ✅ **Customizable**: Accepts custom className via cn() utility

### Usage

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Basic usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// With variant
<Card variant="elevated">
  <CardContent>Elevated card with prominent shadow</CardContent>
</Card>

// With custom padding
<Card padding="lg">
  <CardContent>Card with large padding</CardContent>
</Card>

// Agent card example
<Card variant="default" className="hover:scale-[1.02] cursor-pointer">
  <CardHeader>
    <CardTitle>Agent Name</CardTitle>
    <CardDescription>Short description</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="text-sm">Platform: Web</div>
      <div className="text-sm">AI Searches: 1,234</div>
    </div>
  </CardContent>
  <CardFooter>
    <Button size="sm">View Details</Button>
  </CardFooter>
</Card>
```

### Variants

- **default**: Subtle shadow with hover effect (shadow-sm → shadow-md)
- **elevated**: More prominent shadow (shadow-md → shadow-lg)
- **outlined**: Border focus with no shadow, border darkens on hover
- **ghost**: Minimal styling, shows background on hover

### Padding Options

- **none**: No padding (p-0)
- **sm**: Small padding (p-4)
- **default**: Standard padding (p-6)
- **lg**: Large padding (p-8)

### Subcomponents

- **CardHeader**: Container for title and description with vertical spacing
- **CardTitle**: Heading element (h3) with semibold font
- **CardDescription**: Paragraph element with muted text color
- **CardContent**: Main content area
- **CardFooter**: Footer area with flex layout for actions

### Responsive Design

Cards work seamlessly in responsive grid layouts:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Demo

See `card-demo.tsx` for a comprehensive demonstration of all variants, padding options, and use cases including Agent cards.

## Button Component

A flexible, accessible button component with multiple variants and sizes.

### Features

- ✅ **Multiple Variants**: default, destructive, outline, secondary, ghost, link
- ✅ **Multiple Sizes**: sm, default, lg, icon
- ✅ **Accessibility**: 44x44px minimum touch target (Requirement 10.2)
- ✅ **Interactive States**: hover, focus, disabled
- ✅ **TypeScript**: Full type safety with VariantProps
- ✅ **Customizable**: Accepts custom className via cn() utility

### Usage

```tsx
import { Button } from '@/components/ui/button'

// Basic usage
<Button>Click me</Button>

// With variant
<Button variant="destructive">Delete</Button>

// With size
<Button size="lg">Large Button</Button>

// Disabled
<Button disabled>Can't click</Button>

// Custom styling
<Button className="w-full">Full Width</Button>

// Icon button
<Button size="icon">🔍</Button>
```

### Variants

- **default**: Primary blue button (bg-blue-600)
- **destructive**: Red button for dangerous actions (bg-red-600)
- **outline**: Transparent with border
- **secondary**: Gray background (bg-gray-200)
- **ghost**: Transparent, shows background on hover
- **link**: Text-only with underline on hover

### Sizes

- **sm**: Small button (h-11, px-4)
- **default**: Standard button (h-11, px-6)
- **lg**: Large button (h-12, px-8)
- **icon**: Square button for icons (h-11, w-11)

### Accessibility

All button sizes maintain a minimum 44x44 pixel touch target as per WCAG guidelines and mobile accessibility best practices (Requirement 10.2).

### Testing

Run tests with:
```bash
npm run test -- components/ui/button.test.tsx
```

### Demo

See `button-demo.tsx` for a visual demonstration of all variants and sizes.
