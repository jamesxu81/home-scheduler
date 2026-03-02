# Testing Strategy: Unit Tests + E2E Tests

This project uses a **two-tier testing approach** optimized for local development and Vercel deployments.

## Overview

| Type | Tool | Command | Time | Server Required | CI Ready |
|------|------|---------|------|-----------------|----------|
| **Unit Tests** | Jest | `npm test` | ~2-3s | ❌ No | ✅ Yes |
| **E2E Tests** | Playwright | `npm run test:e2e` | ~20s | ✅ Yes | ⚠️ Manual |

## Unit Tests (Jest)

**Location**: `src/__tests__/`

Runs fast, no server required. Runs automatically in Vercel prebuild before full build.

### What's Tested
- Database schema validation
- Event CRUD operations
- Member management
- API routes
- Recurring event logic
- Utility functions

### Commands
```bash
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
npm run test:ci            # CI mode (exit with code)
```

### Vercel Integration
✅ **Automatically runs in Vercel prebuild**
```
npm run setup-schema && npm test -- --passWithNoTests
```
- Non-blocking, fast (2-3 seconds)
- Prevents invalid code from being deployed
- Failures stop the build

## E2E Tests (Playwright)

**Location**: `tests/e2e/`

Tests real user workflows. Requires running dev server. Best run locally.

### What's Tested
- App loads without errors
- Page renders properly
- Content is accessible
- User can navigate
- Critical features work

### Browsers
- **Primary**: WebKit (Safari-compatible)
- Why WebKit? Works reliably on Windows, no headless rendering issues

### Commands
```bash
npm run test:e2e            # Run E2E tests (starts server automatically)
npm run test:e2e:watch      # Watch mode
npm run test:all            # Both unit + E2E tests locally
```

### Why NOT in Vercel Build

E2E tests with Playwright require:
1. **System libraries** - WebKit needs GTK, GStreamer, Vulkan, etc. (~50+ dependencies)
2. **Dev server running** - 10+ seconds startup
3. **Browser installation** - WebKit ~60 MB
4. **Time limits** - Vercel functions timeout, builds stay < 45 seconds
5. **Interactive environment** - Playwright needs TTY

**Better approach**: E2E tests run locally before commit. Vercel focuses on build verification with fast unit tests only.

**Build time impact**: Current Vercel prebuild ~1-2 seconds (just unit tests). Adding E2E would add 30+ seconds + fail due to missing system libraries.

## Running Tests Locally

### Before Committing
```bash
npm run test:all  # Run unit + E2E tests
```

### During Development
```bash
npm test -- --watch    # Only unit tests, watch mode
npm run test:e2e:watch # Only E2E tests, watch mode
```

### Coverage Report
```bash
npm run test:coverage  # See what's being tested
```

## Vercel Build Flow

```
Deployment Started
       ↓
npm install
       ↓
prebuild script: npm run setup-schema && npm test -- --passWithNoTests
       ├─ Schema switched to PostgreSQL ✓
       └─ Unit tests run (2-3 seconds) ✓
       ↓
If tests pass → npm run build
       ├─ Next.js build
       ├─ Optimized production bundle
       └─ Deploy to live ✓
       ↓
If tests fail → Build aborted ✗
```

## Recommended Workflow

Before pushing to GitHub:

1. **Run full test suite locally**
   ```bash
   npm run test:all
   ```

2. **Verify build locally**
   ```bash
   npm run build
   ```

3. **Push to GitHub**
   ```bash
   git push origin feature-branch
   ```

4. **Create PR** - Vercel will run prebuild tests automatically

This ensures:
- ✅ All tests pass before deployment
- ✅ Build succeeds 
- ✅ No surprises in Vercel
- ✅ E2E tests validated locally

## Test Organization

### Unit Tests (`src/__tests__/`)
```
schema.test.ts              - Database models
api/
  ├─ events.test.ts         - Event CRUD
  └─ members.test.ts        - Member management  
lib/
  ├─ api.test.ts            - API utilities
  └─ recurring.test.ts      - Recurring logic
```

### E2E Tests (`tests/e2e/`)
```
basic-test.spec.ts                  - App loads
calendar-views.spec.ts              - Calendar views
event-management.spec.ts            - Event operations
family-management.spec.ts           - Family features
recurring-events.spec.ts            - Recurring events
recurring-event-deletion.spec.ts    - Deletion logic
simple-recurring-deletion.spec.ts   - More deletion tests
```

## Configuration

### Jest (Unit Tests)
- **testEnvironment**: jsdom
- **testMatch**: `src/__tests__/**/*.test.ts`
- **testPathIgnorePatterns**: `/tests/e2e/` (exclude Playwright tests)
- **setup**: `jest.setup.js`

### Playwright (E2E Tests)
- **testDir**: `tests/e2e/`
- **browser**: webkit
- **baseURL**: `http://localhost:3000`
- **webServer**: Auto-starts on demand
- **timeout**: 60 seconds per test
- **workers**: 1 (sequential, more stable)

## Debugging

### Unit Test Failure
```bash
npm test -- --watch shared.test.ts
# Run specific test file in watch mode
```

### E2E Test Failure
```bash
npx playwright test --headed --debug
# Run with visible browser and debugger
```

### See Full Error Details
```bash
npm test 2>&1 | less
# Pipe output to pager for long output
```

## Best Practices

1. ✅ **Run tests before pushing**
   ```bash
   npm run test:all
   ```

2. ✅ **Write tests for new features**
   - Add unit tests for logic
   - Add E2E tests for user workflows

3. ✅ **Keep tests independent**
   - No test should depend on another test's state
   - Use proper setup/teardown

4. ✅ **Use meaningful assertions**
   - Test behavior, not implementation
   - Clear error messages

5. ❌ **Don't commit failing tests**
   - All tests must pass locally first

## CI/CD Pipeline (Vercel)

```
GitHub Push
    ↓
Vercel Deployment Triggered
    ├─ Install Dependencies
    ├─ Prebuild: npm test (unit tests only)
    │   ├─ PASS → Continue to build
    │   └─ FAIL → Abort deployment
    ├─ Build: next build
    └─ Deploy to Live
```

**Note**: E2E tests are NOT part of Vercel pipeline (by design - they need server)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Tests fail locally but pass in Vercel | Clear node_modules, reinstall |
| Playwright browser not found | Run `npx playwright install` |
| Tests timeout | Increase `timeout` in playwright.config.ts |
| Port 3000 already in use | Kill process: `lsof -ti:3000 \| xargs kill` |
| Variable snapshots in E2E tests | Use fixed test data, not random values |

## Files Referenced

- `package.json` - Test scripts and dependencies
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup
- `playwright.config.ts` - Playwright configuration
- `src/__tests__/` - Unit test files
- `tests/e2e/` - E2E test files

## Summary

**Unit Tests (Jest)**
- Run in Vercel prebuild ✅
- ~2-3 seconds
- No server needed
- Catches logic errors early

**E2E Tests (Playwright)**
- Run locally before pushing
- ~20 seconds
- Requires dev server
- Tests real user workflows

**Before Deploying**
```bash
npm run test:all  # Both unit + E2E
npm run build     # Build test
git push          # Deploy with confidence
```


## Test Requirements

### Prerequisites
- Node.js 18+ 
- npm with legacy peer deps support
- All dependencies installed: `npm install --legacy-peer-deps`

### Running Tests Locally

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Build Process

### Local Build
```bash
# Step 1: Tests run automatically via prebuild hook
# Step 2: Build runs if tests pass
npm run build
```

**IMPORTANT**: If tests fail, the build will stop and not proceed.

### What Tests Are Included

The test suite covers:

1. **Database Schema Tests** (`src/__tests__/schema.test.ts`)
   - Event model structure with recurring fields
   - FamilyMember and Family models
   - Relations and constraints
   - Data integrity

2. **Events API Tests** (`src/__tests__/api/events.test.ts`)
   - Create, read, update, delete operations
   - Recurring event field handling
   - Error handling for missing data

3. **Members API Tests** (`src/__tests__/api/members.test.ts`)
   - Member CRUD operations
   - Photo field support
   - Family association

4. **Recurring Events Logic** (`src/__tests__/lib/recurring.test.ts`)
   - Daily, Weekly, Weekdays, Monthly patterns
   - Date boundary handling
   - Event expansion with limits

5. **API Utilities** (`src/__tests__/lib/api.test.ts`)
   - Event and member service functions
   - API error handling
   - Data persistence

## GitHub Actions CI/CD

### Workflows

#### 1. **CI Workflow** (`.github/workflows/ci.yml`)
Runs on every push and pull request:

**Test Job** (matrix: Node 18.x, 20.x)
- Installs dependencies
- Runs unit tests with coverage
- Uploads coverage to Codecov

**Lint Job**
- Checks code quality with ESLint
- Non-blocking (continues even if fails)

**Build Job** (depends on test)
- Runs tests again
- Builds application
- Uploads build artifact

#### 2. **Deployment Workflow** (`.github/workflows/github-pages-deploy.yml`)
Runs on push to main, workflow_dispatch:

**Build Job**
- Installs dependencies
- **Runs unit tests** (must pass)
- Builds application
- Uploads to GitHub Pages

**Deploy Job**
- Deploys to GitHub Pages

### Test Gates

```
Main Branch Push
    ↓
CI Workflow Starts
    ├─ Test Job (Node 18.x) ←─ MUST PASS
    ├─ Test Job (Node 20.x) ←─ MUST PASS
    ├─ Lint Job (optional)
    └─ Build Job (depends on tests)
         └─ Runs tests again ←─ MUST PASS
         └─ npm run build runs
          
If any test fails → Build fails → Deploy does not run
```

## Development Workflow

### When Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Run tests locally**
   ```bash
   npm test
   # or watch mode
   npm run test:watch
   ```

3. **Make your changes**
   - Update code
   - Update tests to cover new functionality

4. **Verify tests still pass**
   ```bash
   npm test
   ```

5. **Test the build locally** (runs tests + build)
   ```bash
   npm run build
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: describe your change"
   git push origin feature/your-feature
   ```

7. **Create pull request**
   - GitHub Actions automatically runs CI tests
   - Tests must pass before merging
   - Cannot merge if tests fail

### Fixing Failed Tests

If tests fail in CI:

1. Check the GitHub Actions logs for error details
2. Run tests locally to reproduce
   ```bash
   npm test
   ```
3. Fix the code or tests
4. Commit fix
5. Push to the same branch
6. CI automatically re-runs

## Test Coverage

After running tests, view coverage:

```bash
npm run test:coverage
```

This generates a coverage report in `coverage/` directory showing:
- Line coverage
- Branch coverage  
- Function coverage
- Statement coverage

Coverage is automatically uploaded to Codecov on each CI run.

## Adding New Tests

When adding new features:

1. **Write tests first** (TDD approach)
   ```bash
   # Create test file in src/__tests__/
   # e.g., src/__tests__/api/newfeature.test.ts
   ```

2. **Run tests in watch mode**
   ```bash
   npm run test:watch
   ```

3. **Watch tests fail initially**
4. **Implement the feature**
5. **Watch tests pass**
6. **Verify no other tests broke**

## Troubleshooting

### Tests time out
- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises
- Check for infinite loops in code

### Build fails locally but works in CI
- Clear node_modules and reinstall
  ```bash
  rm -rf node_modules package-lock.json
  npm install --legacy-peer-deps
  npm test
  npm run build
  ```
- Check Node version matches CI (20.x recommended)

### Mocks not working
- Ensure mocks are defined before imports
- Clear mocks in beforeEach: `jest.clearAllMocks()`
- Check mock paths match actual imports

### GitHub Actions fails but local tests pass
- Test with same Node version as CI
  ```bash
  nvm use 20
  ```
- Check .env file is present (needed for Prisma)
- Run with --passWithNoTests flag like CI does

## Deployment Checklist

Before deploying, ensure:

- [ ] All local tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] Feature branch pushed with tests
- [ ] Pull request created
- [ ] GitHub Actions CI passes
- [ ] All tests pass (58 tests)
- [ ] Code review approved
- [ ] Ready to merge to main

## CI/CD Pipeline Summary

```
Code Push → GitHub Actions Triggered
         ↓
    Run Tests (Node 18 & 20)
    Run Linter
    Build (includes tests)
         ↓
    All Passed?
         ├─ YES → Deploy to GitHub Pages
         └─ NO  → Block deployment, notify developer
```

## Files Involved

- `.github/workflows/ci.yml` - CI/CD pipeline
- `.github/workflows/github-pages-deploy.yml` - Deployment pipeline
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup file
- `package.json` - Scripts and dependencies
- `src/__tests__/` - All test files

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
