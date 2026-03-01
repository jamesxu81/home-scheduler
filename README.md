# 👨‍👩‍👧‍👦 Kimberly's Scheduler

A modern, full-stack web application for managing family schedules and activities. Keep track of school events, appointments, extracurricular activities, and more - all in one place that your entire family can access.

## Features

✨ **Event Management**
- Add, edit, and delete events for each family member
- Set event categories (School, Activities, Appointments, Other)
- Include descriptions and shared notes
- Color-coded by family member for easy identification
- **Recurring Events** - Set daily, weekly, weekdays, or monthly recurring schedules

👥 **Family Members**
- Add and manage family members with profile photos
- Assign unique colors to each person
- Track age for reference
- Quick filtering by family member

📱 **User-Friendly Interface**
- Clean, intuitive design with Tailwind CSS
- Responsive layout works on mobile, tablet, and desktop
- Real-time updates as you add/modify events
- Calendar and weekly views for better planning

📅 **Calendar Views**
- Monthly calendar view
- Weekly schedule view
- Comprehensive event listing
- Easy date navigation

🔄 **Data Persistence**
- Events securely stored in PostgreSQL database
- Family member data with photo support
- Automatic backup through database replication
- Data syncs across all devices

## Getting Started

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL 14+ (for local development with database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/home-scheduler.git
   cd home-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root with:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/home_scheduler"
   ```
   For Vercel deployment, add this in your project settings.

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Adding a Family Member
1. Click "+ Add Family Member" in the sidebar
2. Enter the name and optional age
3. Click "Add"

### Creating an Event
1. Click "+ Add Event"
2. Fill in the event details:
   - **Title**: Name of the event
   - **Kid**: Which family member needs this event
   - **Date**: When the event occurs
   - **Time**: What time the event starts
   - **Category**: Type of event
   - **Description**: Additional details (optional)
   - **Reminder**: Toggle to set a reminder
3. Click "Add Event"

### Filtering Events
- Click "All Events" to see all events
- Click a family member's name to see only their events
- Events are automatically sorted by date and time

## Deployment

### Deploy to Vercel (Recommended for Next.js)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)
2. **Connect your GitHub repository**
   - Click "New Project" in Vercel dashboard
   - Search for and import your GitHub repository
   - Vercel will auto-detect Next.js settings
3. **Add Environment Variables**
   - In Vercel project settings, add `DATABASE_URL`
   - Use a PostgreSQL database (e.g., Vercel Postgres, AWS RDS, Neon)
   - Example: `postgresql://user:password@host:5432/home_scheduler`
4. **Deploy**
   - Click "Deploy" - Vercel handles tests, build, and deployment
   - Your app is now live!

### Deploy to GitHub Pages with GitHub Actions

**Note**: This requires a PostgreSQL database (GitHub Pages is static only)

The included GitHub Actions workflow automatically:
1. Runs all unit tests
2. Builds the Next.js production bundle
3. Deploys to GitHub Pages (if tests pass)
4. Prevents deployment if tests fail

To enable:
1. Push code to main branch
2. Go to repository Settings → Pages
3. Select `GitHub Actions` as the deployment source
4. Workflow will run automatically on each push

### Database Setup for Deployment

Create a PostgreSQL database with one of these services:
- **Vercel Postgres** - Integrated with Vercel
- **Neon** - Serverless PostgreSQL (free tier available)
- **AWS RDS** - Managed PostgreSQL service
- **Render** - PostgreSQL hosting with free tier

Once created, set `DATABASE_URL` in your deployment platform's environment variables.

## Project Structure

```
home-scheduler/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout component
│   │   ├── page.tsx                # Home page with event management
│   │   ├── globals.css             # Global styles
│   │   └── api/                    # API routes
│   │       ├── events/route.ts      # Event CRUD operations
│   │       ├── members/route.ts     # Family member CRUD operations
│   │       └── family/route.ts      # Family data endpoints
│   ├── components/
│   │   ├── EventForm.tsx           # Form for adding/editing events
│   │   ├── EventList.tsx           # Display list of events
│   │   ├── Calendar.tsx            # Monthly calendar view
│   │   ├── WeeklyCalendar.tsx      # Weekly schedule view
│   │   └── FamilyMembers.tsx       # Family member management sidebar
│   ├── lib/
│   │   ├── api.ts                  # Client-side API utilities
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── recurring.ts            # Recurring event logic
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   └── __tests__/                  # Unit tests
│       ├── events.test.ts          # Event API tests
│       ├── members.test.ts         # Member API tests
│       ├── recurring.test.ts       # Recurring logic tests
│       ├── schema.test.ts          # Database schema tests
│       └── api.test.ts             # API utilities tests
├── prisma/
│   ├── schema.prisma               # Database schema definition
│   └── migrations/                 # Database migrations
├── public/                         # Static assets
├── .github/
│   └── workflows/                  # GitHub Actions CI/CD
│       ├── ci.yml                  # Continuous integration pipeline
│       └── github-pages-deploy.yml # Deployment workflow
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Jest testing configuration
├── jest.setup.js                   # Jest test environment setup
├── package.json                    # Project dependencies
└── README.md                       # This file
```

## Technology Stack

- **Framework**: Next.js 16 (React 19) - Full-stack React with Server Components
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL 14+ with Prisma ORM for type-safe database access
- **Styling**: Tailwind CSS 3.4+ for utility-first styling
- **Testing**: Jest 29+ with TypeScript support for unit tests
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Linting**: ESLint for code quality
- **Hosting**: Vercel (recommended) or GitHub Pages with database backend

## Available Scripts

- `npm run dev` - Start development server at http://localhost:3000
- `npm test` - Run unit tests (all tests must pass before building)
- `npm run test:watch` - Run tests in watch mode during development
- `npm run test:coverage` - Generate test coverage report
- `npm run build` - Build for production (tests run automatically via prebuild hook)
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Data Storage & Database

This application uses PostgreSQL for persistent data storage:

### Database Models
- **FamilyMember** - Stores user profiles with names, ages, colors, and photos
- **Event** - Stores event details with title, date, time, category, description, and recurring settings

### Recurring Events
- **Categories**: Daily, Weekly, Weekdays (Mon-Fri), or Monthly
- **Duration**: Optional end date for recurring schedules
- **Expansion**: Events automatically expand based on recurrence rules
- **Storage**: `repeatType` and `repeatUntil` fields store recurrence configuration

### Prisma ORM
- Type-safe database queries with TypeScript
- Automatic migrations for schema changes
- Connection pooling via Prisma Client

### Environment Setup
Set up database connection in `.env.local`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/home_scheduler"
```

### Database Initialization
```bash
# Create/migrate database schema
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

This project includes comprehensive unit tests with 100% coverage of critical functionality:

### Running Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Suites (58 total tests)
- **events.test.ts** (15 tests) - Event API CRUD operations
- **members.test.ts** (10 tests) - Family member management
- **recurring.test.ts** (8 tests) - Recurring event expansion logic
- **schema.test.ts** (13 tests) - Database schema validation
- **api.test.ts** (12 tests) - Utility function testing

### Important: Tests Required Before Building
The build process includes a **prebuild hook** that automatically runs all tests. The build will fail if any test fails. This ensures code quality and prevents broken deployments.

```bash
# This automatically runs tests first
npm run build
```

## CI/CD Pipeline

The project includes automated testing and deployment via GitHub Actions:

### Continuous Integration (`.github/workflows/ci.yml`)
- Runs on every push to main/develop and pull requests
- Tests on Node.js 18 & 20 for compatibility
- Runs ESLint for code quality checks
- Builds the production bundle
- Generates test coverage reports
- Uploads test artifacts for review

### Deployment Workflow (`.github/workflows/github-pages-deploy.yml`)
- **Test Gate**: All unit tests must pass before deployment
- **Build Gate**: Production build must succeed
- Automatic deployment to GitHub Pages on successful tests and build
- Prevents deploying broken code to production

## Tips for Family Use

1. **Share on a shared family device** - Keep a tablet in a common area
2. **Use categories effectively** - Helps you quickly scan what type of event it is
3. **Add descriptions** - Include pickup times, locations, or special notes
4. **Use family member colors** - Makes it easy to see at a glance whose event it is
5. **Regular sync** - Have a weekly family meeting to plan ahead

## Development Workflow

### Making Changes
1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes and run tests: `npm test`
3. The build process also runs tests: `npm run build`
4. If tests pass, commit and push: `git push origin feature/my-feature`
5. Create a Pull Request on GitHub
6. CI/CD pipeline automatically tests your changes
7. Merge when tests pass and code review is complete

### Database Migrations
When modifying the database schema in `prisma/schema.prisma`:
```bash
# Create a new migration
npx prisma migrate dev --name add_feature_name

# This creates a migration file and applies it to your local database
```

## Customization

### Change Color Scheme
Edit the color assignments in [src/components/FamilyMembers.tsx](src/components/FamilyMembers.tsx)

### Add Event Categories
Update the `Category` type in [src/types/index.ts](src/types/index.ts) and add options to the EventForm in [src/components/EventForm.tsx](src/components/EventForm.tsx)

### Modify Styling
- Global styles: Edit [src/app/globals.css](src/app/globals.css)
- Component styles: Edit Tailwind classes in individual component files
- Tailwind config: Edit [tailwind.config.ts](tailwind.config.ts)

### Database Schema Changes
1. Edit [prisma/schema.prisma](prisma/schema.prisma) with new fields
2. Run migration: `npx prisma migrate dev --name describe_change`
3. Update TypeScript types in [src/types/index.ts](src/types/index.ts)
4. Update API routes in [src/app/api/](src/app/api/)
5. Add tests for new functionality
6. Commit changes

## Future Enhancements

- 📧 Email reminders for upcoming events
- 🔔 Browser push notifications for time-sensitive events
- 📤 Export events to calendar formats (ICS, Google Calendar)
- 👥 Family member permissions and role-based access
- 🔒 Two-factor authentication for enhanced security
- 📊 Family statistics and insights (busiest days, activity trends)
- 🎨 Customizable themes and dark mode
- 📱 Mobile app (React Native) with offline support
- 🔄 Real-time sync across devices for concurrent users

## API Documentation

### Events API
- `GET /api/events` - Fetch all events (with optional familyMemberId filter)
- `POST /api/events` - Create a new event with optional recurring settings
- `PUT /api/events/:id` - Update an event's details or recurrence
- `DELETE /api/events/:id` - Delete an event

### Family Members API
- `GET /api/members` - Fetch all family members
- `POST /api/members` - Create a new family member
- `PUT /api/members/:id` - Update a family member (name, age, color, photo)
- `DELETE /api/members/:id` - Delete a family member and their events

### Family API
- `GET /api/family` - Get family metadata
- `POST /api/family` - Initialize family

All API requests return JSON. Errors include appropriate HTTP status codes and error messages.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test` (all tests must pass)
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Quality Requirements
- All tests must pass before submitting a PR
- New features must include tests
- ESLint checks must pass: `npm run lint`
- TypeScript must compile without errors

## License

MIT License - feel free to use this project for personal or commercial use.

## Support

If you encounter any issues:

1. **Check for existing issues**: [GitHub Issues](https://github.com/yourusername/home-scheduler/issues)
2. **Review test failures**: Run `npm test` and check for failing tests
3. **Check logs**: For production issues, check Vercel logs or deployment platform logs
4. **Create a new issue** with:
   - Detailed description of the problem
   - Steps to reproduce
   - Browser and OS version
   - Test output if applicable
   - Screenshots if relevant

### Troubleshooting

**Database connection errors**:
- Verify `DATABASE_URL` is set correctly in `.env.local`
- Check PostgreSQL service is running
- Run `npx prisma db push` to sync schema

**Tests failing**:
- Run `npm test -- --verbose` for detailed output
- Check that all dependencies are installed: `npm install`
- Run `npm run build` to catch any build issues

**Build failures**:
- Ensure all tests pass: `npm test`
- Check TypeScript compilation: `npx tsc --noEmit`
- Clear build cache: `rm -rf .next` (then rebuild)

## Related Resources

- [Next.js Documentation](https://nextjs.org/docs) - Full-stack React framework
- [React Documentation](https://react.dev) - UI library and hooks
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type safety in JavaScript
- [Prisma Documentation](https://www.prisma.io/docs/) - Database ORM
- [Jest Documentation](https://jestjs.io/docs/getting-started) - Testing framework
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - CI/CD automation
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database system

## Documentation Files

- [MIGRATION_NOTES.md](MIGRATION_NOTES.md) - Database migration and deployment guide
- [TEST_STRATEGY.md](TEST_STRATEGY.md) - Testing approach and coverage details

---

**Made with ❤️ for families everywhere!**

Happy scheduling! 📅✨
