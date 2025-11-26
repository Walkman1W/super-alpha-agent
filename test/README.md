# Testing Framework

This directory contains the testing infrastructure for the Super Alpha Agent project.

## Framework

- **Unit Testing**: Vitest
- **Property-Based Testing**: fast-check
- **React Testing**: @testing-library/react
- **DOM Assertions**: @testing-library/jest-dom

## Configuration

- `vitest.config.ts`: Main Vitest configuration
- `test/setup.ts`: Global test setup and mocks

## Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Unit Tests

Place test files next to the source files with `.test.ts` or `.test.tsx` extension:

```typescript
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should render correctly', () => {
    expect(true).toBe(true)
  })
})
```

### Property-Based Tests

Use fast-check for property-based testing:

```typescript
import fc from 'fast-check'

/**
 * Feature: agent-brand-showcase, Property X: Description
 * Validates: Requirements X.Y
 */
it('should maintain property across all inputs', () => {
  fc.assert(
    fc.property(
      fc.string(),
      (input) => {
        // Test property here
        return true
      }
    ),
    { numRuns: 100 }
  )
})
```

## Test Organization

- `test/setup.ts`: Global setup and mocks
- `test/example.test.ts`: Example tests demonstrating the framework
- Component tests: Place next to components (e.g., `components/button.test.tsx`)
- Utility tests: Place next to utilities (e.g., `lib/url-analyzer.test.ts`)

## Mocks

The setup file includes mocks for:
- Next.js router (`next/navigation`)
- Next.js Image component (`next/image`)
- Environment variables

## Coverage

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

Target coverage: ≥ 80%
