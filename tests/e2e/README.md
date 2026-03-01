# E2E Tests

This directory contains end-to-end (E2E) tests using Playwright for testing the Kimberly's Scheduler application.

## Test Files

- **event-management.spec.ts** - Tests for creating, editing, deleting events and setting reminders
- **recurring-events.spec.ts** - Tests for daily, weekly, weekdays, and monthly recurring events
- **family-management.spec.ts** - Tests for creating families, adding/deleting members
- **calendar-views.spec.ts** - Tests for different calendar view modes (list, month, week)

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run E2E tests in watch mode
```bash
npm run test:e2e:watch
```

### Run unit tests and E2E tests
```bash
npm run test:all
```

### Run specific test file
```bash
npx playwright test tests/e2e/event-management.spec.ts
```

### Run tests with UI
```bash
npx playwright test --ui
```

### View test results
```bash
npx playwright show-report
```

## How Tests Work

1. Tests automatically start the Next.js development server (`npm run dev`)
2. Tests run against `http://localhost:3000`
3. Each test is isolated - creates its own family, members, and events
4. Tests wait for network idle to ensure all data is loaded

## Test Structure

Each test follows this pattern:

```typescript
test('description', async ({ page }) => {
  // 1. Navigate
  await page.goto('/');
  
  // 2. Create test data (family, members, events)
  
  // 3. Perform actions (click, fill, select)
  
  // 4. Verify with assertions
  await expect(page.locator('text=...')).toBeVisible();
});
```

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import `{ test, expect }` from `@playwright/test`
3. Use `test.describe()` to group related tests
4. Use `test()` for individual test cases
5. Use `page.goto('/')` to navigate
6. Use standard Playwright locator methods: `click()`, `fill()`, `selectOption()`, etc.

## Debugging

### Debug a single test
```bash
npx playwright test --debug tests/e2e/event-management.spec.ts
```

### Pause on pause() calls
```typescript
await page.pause();
```

### View screenshots on failure
Screenshots are saved in `test-results/` when tests fail.

## CI/CD Integration

Tests run automatically before build with:
```bash
npm run prebuild
# Runs: npm run test:all (unit tests + E2E tests)
```

Set `CI` environment variable in CI/CD pipeline to enable stricter settings:
```bash
CI=true npm run test:all
```
