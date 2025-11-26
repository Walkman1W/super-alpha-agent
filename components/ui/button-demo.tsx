'use client'

import { Button } from './button'

/**
 * Button Component Demo
 * 
 * This file demonstrates all the variants and sizes of the Button component.
 * It can be used as a reference or imported into a page for testing.
 */
export function ButtonDemo() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔍</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Disabled State</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled Default</Button>
          <Button variant="destructive" disabled>Disabled Destructive</Button>
          <Button variant="outline" disabled>Disabled Outline</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Touch Target (44x44px minimum)</h2>
        <div className="flex flex-wrap gap-4">
          <Button>✓</Button>
          <Button size="icon">+</Button>
          <Button variant="ghost">×</Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          All buttons maintain a minimum 44x44 pixel touch target for accessibility
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Interactive States</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Hover me</Button>
          <Button variant="outline">Focus me (Tab)</Button>
          <Button variant="secondary">Click me</Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Try hovering, focusing (Tab key), and clicking these buttons
        </p>
      </section>
    </div>
  )
}
