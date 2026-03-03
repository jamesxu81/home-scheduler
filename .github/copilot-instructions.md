<!-- Kimberly's Scheduler - Project-specific Copilot Instructions -->

# Kimberly's Scheduler Configuration

## Project Overview
A full-stack family schedule management application built with Next.js, TypeScript, and PostgreSQL. The app enables families to create a shared account, manage family members/kids, schedule events, and view calendars with support for recurring events and event reminders.

## Key Features
- **Family Management**: Create family groups with unique join codes, add/manage family members with photos and age tracking
- **Event Scheduling**: Create, edit, and delete events with date, time, duration, category, and descriptions
- **Recurring Events**: Support for NONE, DAILY, WEEKDAYS, WEEKLY, and MONTHLY recurring patterns with end dates
- **Calendar Views**: Multiple calendar presentations (Month, Week views) with color-coded family members
- **Event Categories**: School, activities, appointments, other with reminder notifications
- **Responsive Design**: Tailwind CSS for mobile and desktop layouts

## Technology Stack
- **Framework**: Next.js 16 with App Router (src/app directory)
- **Language**: TypeScript with strict type definitions
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + API integration
- **Testing**: Jest (unit/integration) + Playwright (E2E)
- **Deployment**: Vercel-ready, supports containerized deployments (docker-compose.yml)

## Data Models (Prisma Schema)
- **Family**: Root entity with unique code for joining (id, code, createdAt, updatedAt)
- **FamilyMember**: Kids/family members with color coding and optional photos (id, name, age, color, photo, familyId)
- **Event**: Scheduled events with recurring support (id, title, description, date, time, duration, category, reminder, repeatType, repeatUntil, kidId, familyId)

## Component Structure
- **src/app/page.tsx** - Main dashboard layout and state management
- **src/app/layout.tsx** - Root layout with metadata
- **src/app/api/** - API routes for family, members, and events endpoints
- **src/components/EventForm.tsx** - Create/edit event form with validation (categories, duration)
- **src/components/EventList.tsx** - Display events with filter/sort by member and date, weather integrated
- **src/components/FamilyMembers.tsx** - Sidebar with family members, add/edit/delete functionality
- **src/components/Calendar.tsx** - Month view calendar with event indicators and weather (15-day limit)
- **src/components/WeeklyCalendar.tsx** - Week view with hourly time slots and weather (15-day limit)
- **src/lib/api.ts** - API client with familyAPI, memberAPI, eventAPI methods
- **src/lib/prisma.ts** - Prisma client singleton
- **src/lib/recurring.ts** - Recurring event expansion logic
- **src/lib/weather.ts** - Weather API integration with Open-Meteo, caching, and 15-day forecast limiting
- **src/types/index.ts** - TypeScript interfaces (Event, FamilyMember, Family, EventFormData)

## Weather Integration
- **Library**: `src/lib/weather.ts` - Centralized weather functionality with smart caching
- **API Route**: `src/app/api/weather/route.ts` - Backend proxy for Open-Meteo to avoid CORS issues
- **Provider**: Open-Meteo (free, no API key required)
- **Default Location**: Auckland, New Zealand (-37.7749, 174.8860)
- **Forecast Range**: Limited to 15 days from today for performance optimization
- **Caching Strategy**:
  - Individual date cache: 1-hour TTL (prevents duplicate calls for same date)
  - Month-level cache: Persistent in memory (survives page navigation within 1-hour window)
  - Bulk fetch throttling: 1-hour cooldown between month-wide fetches
- **Display Locations**: EventList (headers), Calendar (day cells), WeeklyCalendar (day headers)
- **Features**: Weather icon emoji, temperature (°C), weather condition text
- **Implementation Notes**:
  - Calendar.tsx: Uses `getMonthWeatherFromCache()` and `shouldFetchMonthWeather()` for smart caching
  - WeeklyCalendar.tsx: Fetches weather for 7 days, skips dates beyond 15-day window
  - EventList.tsx: Only fetches weather for unique event dates (most efficient)
  - All components check 15-day boundary using date comparison logic

## API Routes
- **POST /api/family** - Create family or join existing (action: "create" | "join", code)
- **GET /api/family** - Fetch family data by familyId
- **POST /api/members** - Add family member
- **GET /api/members** - Get members by familyId
- **POST /api/events** - Create event
- **GET /api/events** - Fetch events by familyId with optional kidId filter
- **DELETE /api/events** - Delete event by id
- **GET /api/weather** - Fetch weather for a date (params: date=YYYY-MM-DD, lat=XX, lon=XX)

## Development Guidelines
1. **Type Safety**: Always use TypeScript interfaces from src/types/index.ts
2. **Database**: Use Prisma queries through src/lib/prisma.ts singleton
3. **API Communication**: Use methods from src/lib/api.ts (familyAPI, memberAPI, eventAPI)
4. **Components**: All components use "use client" pragma for client-side rendering
5. **Styling**: Follow Tailwind CSS utility classes, responsive mobile-first approach
6. **Recurring Events**: Use src/lib/recurring.ts to expand repeat patterns (NONE, DAILY, WEEKDAYS, WEEKLY, MONTHLY)
7. **Weather**: Use src/lib/weather.ts for weather fetching with automatic caching and 15-day limit
8. **Error Handling**: Validate inputs, handle API errors gracefully
9. **Testing**: Write Jest tests for utils, Playwright E2E tests for features

## Database Setup
- PostgreSQL required (set DATABASE_URL in .env.local)
- Prisma migrations handle schema versioning
- Run `npm run setup-schema` to initialize schema before development
- Migration files in prisma/migrations/ track changes

## Testing Strategy
- **Unit Tests**: src/__tests__/ - api, lib, and schema tests
- **E2E Tests**: tests/e2e/ - Feature workflows (basic, event-management, family-management, calendar-views, recurring-events)
- **Test Commands**:
  - `npm test` - Run Jest unit tests
  - `npm run test:watch` - Jest watch mode
  - `npm run test:coverage` - Coverage report
  - `npm run test:e2e` - Playwright E2E tests
  - `npm run test:all` - All tests

## Deployment
- **Recommended**: Vercel (native Next.js support, auto-deploys from git)
- **Alternative**: Docker deployment via docker-compose.yml (includes PostgreSQL)
- **Build Process**: 
  - `npm run build` runs setup-schema + safe-migrate + tests before compilation
  - `npm start` runs production server
- **Environment Variables**: DATABASE_URL required, optional feature flags

## Common Tasks
- **Create Family**: familyAPI.create() generates unique code
- **Join Family**: familyAPI.join(code) with code from invite
- **Add Member**: memberAPI.create(familyId, name, age, color) with hex color
- **Add Event**: eventAPI.create(title, date, time, duration, kidId, category, reminder, repeatType, repeatUntil)
- **Recurring Events**: Set repeatType (DAILY/WEEKDAYS/WEEKLY/MONTHLY) with optional repeatUntil date
- **View Events**: eventAPI.getByFamily(familyId) or filter by kidId
- **Delete Event**: eventAPI.delete(eventId)
- **Fetch Weather**: fetchWeather(dateStr) for specific date, automatic 1-hour caching
- **Change Location**: setUserLocation(latitude, longitude) to update default weather location
- **Clear Cache**: clearWeatherCache() to reset all weather caches

## Build Commands
- `npm run dev` - Start dev server with auto-schema setup
- `npm run build` - Production build with migrations and tests
- `npm start` - Run production server
- `npm run lint` - Next.js linting
- `npm test` - Run unit/integration tests
- `npm run test:e2e` - Run Playwright tests
- `npm run test:all` - Run all tests

## Pre-Commit Quality Checklist - MANDATORY BEFORE GIT PUSH

**ALWAYS complete these steps before committing and pushing code to GitHub:**

### 1. Compile TypeScript
```bash
npx tsc --noEmit
```
**Purpose**: Verify all TypeScript code compiles without type errors
**Must Pass**: YES - Do not push if compilation fails

### 2. Run All Tests
```bash
npm run test:all
```
**Purpose**: Execute unit tests, E2E tests, and linting
**Coverage**: 
- Unit tests (Jest) - src/__tests__/
- E2E tests (Playwright) - tests/e2e/
- ESLint checks - Code quality

**Must Pass**: YES - Do not push if any test fails

### 3. Production Build Check
```bash
npm run build
```
**Purpose**: Verify production build succeeds (includes automatic test execution)
**Must Pass**: YES - Do not push if build fails

### 4. Manual Verification
- [ ] No console errors in browser DevTools
- [ ] No warnings in VS Code Problems panel
- [ ] All modified features tested in dev server
- [ ] Weather integration works (check 15-day limit)
- [ ] Database queries execute correctly
- [ ] No console.error() messages in output

### Git Workflow - Required Steps
1. Make code changes
2. Run: `npm test:all` → All tests pass ✅
3. Run: `npm run build` → No build errors ✅
4. Verify: Browser console clean, no errors ✅
5. Then commit: `git add -A && git commit -m "..."`
6. Then push: `git push origin main`

### Common Issues and Solutions
| Issue | Solution |
|-------|----------|
| Test fails | Check error message, fix code, re-run `npm test:all` |
| Build fails | Run `npm install`, verify all imports, check TypeScript errors |
| Type errors | Run `npx tsc --noEmit` to see exact errors |
| Weather API errors | Verify date format (YYYY-MM-DD), check coordinates |
| Cache issues | Clear browser cache, restart dev server |

### Critical Reminder
**DO NOT PUSH CODE THAT:**
- Has TypeScript compilation errors
- Has failing tests
- Fails to build
- Has console errors in browser
- Breaks existing features
- Breaks weather integration

**IF ANY STEP FAILS**: Fix the issue and re-run all steps before attempting to push again.

## Code Style Notes
- TypeScript strict mode enabled
- Prisma for all database queries
- Fetch API for client-side requests
- Tailwind for all styling (no CSS modules)
- Component naming: PascalCase (.tsx files)
- Type definitions in src/types/index.ts

