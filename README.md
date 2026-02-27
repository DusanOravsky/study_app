# AI Mentor

Adaptive learning platform for Slovak students preparing for high school entrance exams (prijimacky na gymnazium).

## Features

- **Smart Questions** - Randomized math and Slovak language questions, different every time
- **3 Learning Phases** - Example, Planning, Solving, Feedback for effective learning
- **Gamification** - XP, levels, streaks, achievements, points
- **Mock Tests** - Timed practice tests with scoring
- **AI Chat** - Chat interface (ready for API integration)
- **Progress Tracking** - Daily activity, accuracy stats, topic mastery
- **2 Exam Types** - 8-rocne gymnazium (5th grade) and 4-rocne gymnazium (9th grade)

### Math Rules

- **5th grade**: Simple fractions only (whole number or simple fraction results). NO percentages. NO decimals.
- **9th grade**: All fractions + percentages with whole number results only. NO decimals.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## Project Structure

```
src/
  components/       # Reusable UI components
    Navbar.tsx         - Navigation with XP/streak display
    QuestionCard.tsx   - Question display with answer options
    Timer.tsx          - Countdown timer for mock tests
    XPBar.tsx          - XP progress bar
    StreakBadge.tsx     - Streak flame counter
    SubjectCard.tsx    - Subject selection card
    ChatBubble.tsx     - Chat message bubble
    ProgressRing.tsx   - Circular progress indicator
    AchievementPopup.tsx - Achievement notification
    LevelUpModal.tsx   - Level up celebration
  pages/            # Page components (routes)
    RoleSelectionPage.tsx  - Landing / role selection
    ExamTypePage.tsx       - Exam type selection
    DashboardPage.tsx      - Main dashboard
    LearningPage.tsx       - Core learning interface
    MockTestPage.tsx       - Timed mock tests
    ChatPage.tsx           - AI chat interface
    ProfilePage.tsx        - User profile & stats
    PricingPage.tsx        - Plans & pricing
  utils/            # Helper functions
    storage.ts         - LocalStorage persistence layer
    questionGenerator.ts - Smart randomized question generator
    gamification.ts    - XP, levels, streaks, achievements
    progress.ts        - Progress tracking utilities
  types/            # TypeScript types
    index.ts           - All type definitions
  styles/           # CSS
    index.css          - Tailwind CSS + custom animations
  App.tsx           # Main app with routing
  main.tsx          # Entry point
```

## Tech Stack

- **React 19** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **React Router v7** - Navigation
- **Lucide React** - Icons
- **LocalStorage** - Data persistence (Firebase-ready)

## Adding Firebase Later

The app uses a storage abstraction layer (`src/utils/storage.ts`). To add Firebase:

1. Install Firebase: `npm install firebase`
2. Create `src/utils/firebase.ts` with your config
3. Update `src/utils/storage.ts` to use Firestore instead of localStorage
4. Add authentication to the role selection page
5. Copy `.env.example` to `.env.local` and fill in Firebase credentials

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect your GitHub repo at vercel.com for auto-deploy
```

## License

Private project. All rights reserved.
