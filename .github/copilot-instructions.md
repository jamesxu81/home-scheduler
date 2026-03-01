<!-- Kimberly's Scheduler - Project-specific Copilot Instructions -->

# Kimberly's Scheduler Configuration

## Project Overview
This is a modern Next.js-based family schedule management application that allows families to track events and activities for kids. The app uses client-side storage (localStorage) so no backend server is required.

## Key Features
- Add and manage family members with color coding
- Create, view, and delete events for each family member
- Filter events by family member
- Automatic sorting by date and time
- Persistent data storage in browser localStorage

## Technology Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Storage**: Browser localStorage

## Component Structure
- **src/app/page.tsx** - Main dashboard with event management
- **src/components/EventForm.tsx** - Form for adding new events
- **src/components/EventList.tsx** - Display and manage events
- **src/components/FamilyMembers.tsx** - Family member sidebar

## Development Guidelines
1. All event data is client-side only (localStorage)
2. Use TypeScript for type safety
3. Follow Tailwind CSS for styling consistency
4. Components are client-side ("use client" pragma)
5. Keep components modular and reusable

## Deployment
- Ready to deploy on Vercel (recommended for Next.js)
- Can also deploy on GitHub Pages, Netlify, or any static host
- Includes GitHub Actions workflow for automated deployments

## Common Tasks
- **Add event**: User fills EventForm, data saved to localStorage
- **Filter by member**: Click member name to filter EventList
- **Delete event**: Click ❌ button on event card
- **Add family member**: Use FamilyMembers component sidebar

## Build Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - Code quality check

## Notes for Contributors
- Data is never sent to external servers
- All information stays in user's browser
- localStorage has ~5-10MB limit per domain
- Clear browser cache to reset all data
