# Testing and Build Process

This document explains how unit tests are integrated into the build and deployment process.

## Overview

All unit tests **must pass** before:
- Building the application locally (`npm run build`)
- Deploying to any environment
- Merging pull requests to main/develop branches

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
