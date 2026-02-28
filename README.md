# 👨‍👩‍👧‍👦 Family Scheduler

A modern, user-friendly web application for managing family schedules and kids' activities. Keep track of school events, appointments, extracurricular activities, and more - all in one place that your entire family can access.

## Features

✨ **Event Management**
- Add, edit, and delete events for each family member
- Set event categories (School, Activities, Appointments, Other)
- Include descriptions and reminders
- Color-coded by family member for easy identification

👥 **Family Members**
- Add and manage family members
- Assign unique colors to each person
- Track age for reference
- Quick filtering by family member

📱 **User-Friendly Interface**
- Clean, intuitive design with Tailwind CSS
- Responsive layout works on mobile, tablet, and desktop
- Real-time updates as you add/modify events
- Persistent storage using browser localStorage

🔄 **Data Persistence**
- Events automatically saved to your browser
- No backend server required
- Data stays private on your device

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/home-scheduler.git
   cd home-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
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

### Deploy to GitHub Pages

1. **Create a GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Family Scheduler app"
   git branch -M main
   git remote add origin https://github.com/yourusername/home-scheduler.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "GitHub Pages" section
   - Select "Deploy from a branch"
   - Choose `main` branch and root folder
   - Save

### Alternative: Deploy to Vercel (Recommended for Next.js)

1. **Sign up at [Vercel](https://vercel.com)**
2. **Import your GitHub repository**
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings
3. **Click Deploy**
4. **Share the link with your family!**

### Deploy to Netlify

1. **Sign up at [Netlify](https://www.netlify.com)**
2. **Build the project locally**
   ```bash
   npm run build
   ```
3. **Drag and drop the `.next` folder to Netlify**
   - Or connect your GitHub repository for automatic deployments

## Project Structure

```
home-scheduler/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── EventForm.tsx       # Form for adding events
│   │   ├── EventList.tsx       # Display list of events
│   │   └── FamilyMembers.tsx   # Family member management
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── public/                      # Static assets
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

## Technology Stack

- **Framework**: Next.js 16 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Browser localStorage
- **Linting**: ESLint

## Available Scripts

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Data Storage

This application uses browser `localStorage` to persist data:
- Family members are stored under the key `familyMembers`
- Events are stored under the key `familyEvents`
- All data is stored locally on your device and never sent to external servers
- Clear your browser's cache/data to delete all stored information

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Tips for Family Use

1. **Share on a shared family device** - Keep a tablet in a common area
2. **Use categories effectively** - Helps you quickly scan what type of event it is
3. **Add descriptions** - Include pickup times, locations, or special notes
4. **Use family member colors** - Makes it easy to see at a glance whose event it is
5. **Regular sync** - Have a weekly family meeting to plan ahead

## Customization

### Change Colors
Edit the `defaultMembers` array in `src/app/page.tsx` to change default color assignments.

### Add More Categories
Update the category type in `src/types/index.ts` and the category options in `src/components/EventForm.tsx`.

### Modify Styling
Edit `src/app/globals.css` or Tailwind classes in component files to customize the appearance.

## Future Enhancements

- 📧 Email reminders for upcoming events
- 🔔 Browser push notifications
- 📤 Export events to calendar formats (ICS, Google Calendar)
- 👥 Multi-device sync with cloud backend
- 🔒 Password protection for privacy
- 📊 Family statistics and insights

## Contributing

Feel free to fork this project and submit pull requests with improvements!

## License

MIT License - feel free to use this project for personal or commercial use.

## Support

If you encounter any issues, please:
1. Check the [GitHub Issues](https://github.com/yourusername/home-scheduler/issues)
2. Create a new issue with detailed description
3. Include browser version and steps to reproduce

## Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Made with ❤️ for families everywhere!**

Happy scheduling! 📅✨
