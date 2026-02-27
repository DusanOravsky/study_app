# CLAUDE.md - AI Mentor Study App

## What Is This

AI Mentor - adaptive learning platform for Slovak students preparing for high school entrance exams (prijimacky na gymnazium). Three exam types: 8-rocne gymnazium (5th grade, age 10-11), 4-rocne gymnazium (9th grade, age 14-15), and bilingvalne gymnazium (9th grade, German bilingual, 15 questions / 30 min).

Built for a student under 13 - keep things simple, fun, and budget-friendly (€0-12/year).

## Common Commands

```bash
cd /home/cvcta/Projects/dims/study-app

npm run dev        # Start dev server (http://localhost:5173)
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
npm run lint       # ESLint check
```

## Tech Stack

- **React 19** + TypeScript (strict)
- **Vite 7** - build tool
- **Tailwind CSS v4** - styling (imported via `@import "tailwindcss"` in CSS, `@tailwindcss/vite` plugin)
- **React Router v7** - client-side routing
- **Lucide React** - icons (use ONLY lucide-react, no other icon libs)
- **LocalStorage** - data persistence via `src/utils/storage.ts` abstraction

No backend yet. Firebase planned for later (parent will set up account).

## Project Structure

```
study-app/
  src/
    App.tsx              # Router + layout (Navbar shown on all pages except onboarding)
    main.tsx             # Entry point with BrowserRouter
    components/          # 10 reusable UI components
      Navbar.tsx           - Self-contained nav (reads own gamification state)
      QuestionCard.tsx     - Question display with multiple choice
      Timer.tsx            - Countdown timer (circular SVG)
      XPBar.tsx            - XP progress bar (compact + full modes)
      StreakBadge.tsx       - Streak flame counter
      SubjectCard.tsx      - Subject selection card
      ChatBubble.tsx       - Chat message bubble
      ProgressRing.tsx     - Circular SVG progress ring
      AchievementPopup.tsx - Achievement toast notification
      LevelUpModal.tsx     - Level up celebration overlay
    pages/               # 8 route pages
      RoleSelectionPage.tsx  - / (landing, role selection)
      ExamTypePage.tsx       - /exam-type (8-rocne vs 4-rocne vs bilingvalne)
      DashboardPage.tsx      - /dashboard (main hub)
      LearningPage.tsx       - /learning, /learning/:subject (4-phase learning)
      MockTestPage.tsx       - /test (timed practice tests)
      ChatPage.tsx           - /chat (AI chat, pre-programmed for now)
      ProfilePage.tsx        - /profile (stats, achievements, settings)
      PricingPage.tsx        - /pricing (free vs premium plans)
    utils/               # Business logic
      storage.ts           - LocalStorage abstraction (PREFIX: "ai-mentor:")
      questionGenerator.ts - Smart randomized question generator
      gamification.ts      - XP, levels, streaks, achievements engine
      progress.ts          - Progress tracking, daily activity, mock test results
    types/
      index.ts             - All TypeScript type definitions
    styles/
      index.css            - Tailwind CSS v4 imports + custom animations
```

## Routes

| Path | Page | Navbar |
|------|------|--------|
| `/` | RoleSelectionPage | NO |
| `/exam-type` | ExamTypePage | NO |
| `/dashboard` | DashboardPage | YES |
| `/learning` | LearningPage | YES |
| `/learning/:subject` | LearningPage | YES |
| `/test` | MockTestPage | YES |
| `/chat` | ChatPage | YES |
| `/profile` | ProfilePage | YES |
| `/pricing` | PricingPage | YES |

Navbar is rendered once in App.tsx. Pages do NOT render their own Navbar.

## Key Patterns

### Storage Layer
All persistence goes through `src/utils/storage.ts`. Keys are prefixed with `ai-mentor:`. To swap to Firebase later, only this file needs to change.

```typescript
import { getItem, setItem } from "./storage";
const data = getItem<MyType>("key", defaultValue);
setItem("key", data);
```

### Question Generator
`src/utils/questionGenerator.ts` - generates unique questions every time:
- **5th grade math (8-rocne)**: Simple fractions only. Results must be whole numbers or simple fractions. NO percentages. NO decimals.
- **9th grade math (4-rocne & bilingvalne)**: Complex fractions + percentages. Percentage results must be WHOLE NUMBERS only. NO decimals.
- **Slovak language**: Pre-defined question bank (vybrane slova, gramatika, literatura)
- **Mock test config**: 8-rocne = 15q/30min, 4-rocne = 20q/45min, bilingvalne = 15q/30min

### Gamification
`src/utils/gamification.ts` - XP system:
- Correct answer: 10 XP
- Wrong answer: 2 XP (participation)
- Streak bonus (3+ days): +5 XP
- 100 XP per level
- 8 achievements (first question, streaks, levels, perfect test, 100 questions)

### Learning Flow (4 phases)
1. **Priklad** (Example) - worked example with explanation
2. **Planovanie** (Planning) - question + hints, student plans approach
3. **Riesenie** (Solving) - student answers via QuestionCard
4. **Spatna vazba** (Feedback) - result, explanation, XP earned

## Language

All user-facing text is in **Slovak**. Key terms:
- Ucenie = Learning
- Skusobny test = Mock test
- Zlomky = Fractions
- Percenta = Percentages
- Vybrane slova = Selected words (Slovak grammar topic)
- Prijimacky = Entrance exams
- Gymnazium = Grammar school / high school
- Bilingvalne gymnazium = Bilingual gymnasium (German)

## Git & Deployment

- **Personal GitHub repo**: https://github.com/DusanOravsky/study_app
- **Always commit and push here** (not to Covestro org)
- Git identity: `Dusan Oravsky <dusan.oravsky@gmail.com>`

## Reference Materials

`presun/` folder contains original prototype files from son's Claude.ai project:
- `SMART-RANDOM-QUESTIONS.js` - Rich question templates (geometria, slovne ulohy, vzory, pady, pravopis) not yet integrated
- `ai-mentor-ultra-main.jsx` / `ai-mentor-ultra-components.jsx` - Original full app prototype
- `ai-mentor-LOCALHOST-demo.html` - Standalone demo

## What's NOT Done Yet

- [ ] Firebase integration (auth + Firestore) - waiting for parent to create account
- [ ] Real AI chat API integration (currently pre-programmed responses)
- [ ] More Slovak language questions (small bank currently)
- [ ] More math topics beyond fractions and percentages (geometria, slovne ulohy available in presun/)
- [ ] Integrate richer Slovak questions from presun/ (vzory, pady, pravopis i/y)
- [ ] Parent dashboard
- [ ] Teacher dashboard
- [ ] Vercel deployment
- [ ] PWA / offline support
- [ ] Sound effects for gamification

## Design Principles

- **Colorful and fun** - gradients, animations, playful design for ages 10-15
- **Mobile-first** - responsive, works on phone
- **Simple persistence** - localStorage now, Firebase later
- **No over-engineering** - keep it working and simple
- **Slovak language** - all UI text in Slovak
