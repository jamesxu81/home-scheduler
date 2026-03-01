# Unit Tests Guide

This directory contains comprehensive unit tests for the Home Scheduler application, focusing on database schema validation and API routes.

## Test Structure

```
src/__tests__/
├── api/
│   ├── events.test.ts       # Tests for event CRUD operations
│   └── members.test.ts      # Tests for family member CRUD operations
├── lib/
│   ├── api.test.ts          # Tests for API utility functions
│   └── recurring.test.ts    # Tests for recurring event logic
└── schema.test.ts           # Tests for database schema validation
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (re-run on file changes)
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test events.test.ts
```

## Test Coverage

The test suite covers:

### 1. **Database Schema Tests** (`schema.test.ts`)
- Event model structure with all required fields
- New `repeatType` and `repeatUntil` fields
- FamilyMember and Family models
- Proper field types and constraints
- Relations and cascade delete behavior
- Data integrity validation

### 2. **Events API Tests** (`api/events.test.ts`)
- Creating events with required fields
- Handling missing required fields
- Recurring event creation with `repeatType` and `repeatUntil`
- Fetching events with proper sorting
- Updating events including recurring properties
- Deleting events
- Error handling

### 3. **Members API Tests** (`api/members.test.ts`)
- Creating family members
- Adding members with optional photos
- Fetching members by family
- Updating member information
- Updating member photos
- Deleting members
- Error handling

### 4. **Recurring Events Logic** (`lib/recurring.test.ts`)
- Expanding events with different repeat types (DAILY, WEEKLY, WEEKDAYS, MONTHLY)
- Respecting `repeatUntil` dates
- Handling unlimited recurrence
- Proper event ID generation with date suffixes
- Preserving event properties through expansion
- Multiple events with different repeat types

### 5. **API Utility Functions** (`lib/api.test.ts`)
- Adding events through API
- Adding recurring events with persistence
- Fetching all events for a family
- Updating events and recurring properties
- Deleting events
- Family member operations (add, update, delete)

## Key Bug Fixes Covered

These tests validate the fixes made to support recurring events:
- ✅ `repeatType` field is now stored and retrieved
- ✅ `repeatUntil` field is now stored and retrieved
- ✅ API routes properly handle recurring event data
- ✅ Recurring event expansion works with database values

## Mocking Strategy

- **Prisma Client**: Mocked to test API logic without database dependency
- **Fetch API**: Mocked for testing API utility functions
- **Date/Time**: Mocked to test recurring event generation consistently

## Adding New Tests

When adding new features:

1. Follow the existing test structure
2. Mock external dependencies (Prisma, fetch)
3. Test both happy paths and error cases
4. Include test descriptions that clearly state what is being tested
5. Use descriptive assertion messages

Example template:
```typescript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange - setup test data
    // Act - execute the code
    // Assert - verify results
  });
});
```

## Continuous Integration

Tests should be run automatically in CI/CD pipelines:
- Before merging pull requests
- Before deployments
- As part of the build process

Add to your CI configuration:
```yaml
- name: Run Tests
  run: npm test -- --coverage --passWithNoTests
```

## Troubleshooting

### Tests timing out
- Increase Jest timeout: `jest.setTimeout(10000)`
- Check for unresolved promises

### Mock not working
- Ensure mocks are defined before imports
- Clear mocks between tests with `beforeEach(() => jest.clearAllMocks())`

### Schema validation tests failing
- Update tests when schema changes
- Reference the current schema in Prisma as source of truth
