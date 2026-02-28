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

- **Firebase** - Auth (email/password) + Firestore (classes, schools, leaderboard, admins)

## Project Structure

```
study-app/
  Testy/               # 28 real school worksheets (.docx, .doc, .pptx, .png) - source for generators
  presun/              # Original prototype files from son's Claude.ai project
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
    firebase/            # Firebase integration
      config.ts            - Firebase app/auth/db initialization
      auth.ts              - Sign in, register, sign out, auth state
      classes.ts           - Teacher class management (CRUD, assignments, submissions)
      admin.ts             - Admin school management (CRUD, whitelist, teachers, students)
      sync.ts              - Firestore data sync
      migration.ts         - LocalStorage → Firestore migration
    contexts/
      AuthContext.tsx       - Firebase auth context provider
    pages/               # Route pages
      RoleSelectionPage.tsx  - / (landing, 4 role cards: student/parent/teacher/admin)
      ExamTypePage.tsx       - /exam-type (8-rocne vs 4-rocne vs bilingvalne)
      DashboardPage.tsx      - /dashboard (main hub)
      LearningPage.tsx       - /learning, /learning/:subject (4-phase learning)
      MockTestPage.tsx       - /test (timed practice tests)
      ChatPage.tsx           - /chat (AI chat, pre-programmed for now)
      ProfilePage.tsx        - /profile (stats, achievements, settings)
      PricingPage.tsx        - /pricing (free vs premium plans)
      LoginPage.tsx          - /login (Firebase email/password auth)
      LeaderboardPage.tsx    - /leaderboard (XP rankings)
      StudyPlanPage.tsx      - /plan (60-day study plan)
      ParentDashboardPage.tsx - /parent (PIN-protected, no auth)
      TeacherDashboardPage.tsx - /teacher (Firebase auth, class management)
      AdminDashboardPage.tsx - /admin (Firebase auth + whitelist, school management)
      JoinClassPage.tsx      - /join-class (student joins teacher's class)
    utils/               # Business logic
      storage.ts           - LocalStorage abstraction (PREFIX: "ai-mentor:")
      questionGenerator.ts - Smart randomized question generator (~2200 lines, 20+ generators)
      studyPlan.ts         - 60-day adaptive study plan generator
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
| `/login` | LoginPage | NO |
| `/parent` | ParentDashboardPage | NO |
| `/teacher` | TeacherDashboardPage | NO |
| `/admin` | AdminDashboardPage | NO |
| `/dashboard` | DashboardPage | YES |
| `/learning` | LearningPage | YES |
| `/learning/:subject` | LearningPage | YES |
| `/test` | MockTestPage | YES |
| `/chat` | ChatPage | YES |
| `/profile` | ProfilePage | YES |
| `/pricing` | PricingPage | YES |
| `/leaderboard` | LeaderboardPage | YES |
| `/plan` | StudyPlanPage | YES |
| `/join-class` | JoinClassPage | YES |

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
- **5th grade math (8-rocne)**: Simple fractions, geometry, word problems, miestna hodnota (place value). NO percentages. NO decimals.
- **9th grade math (4-rocne & bilingvalne)**: Complex fractions + percentages + geometry + word problems. Percentage results must be WHOLE NUMBERS only.
- **Slovak language** (dynamic generators): Slovné druhy, Vzory (12 patterns), Pravopis i/y, Rytmický zákon, Veľké/malé písmená, Spodobovanie, Prídavné mená (vzory + typy), Zámená (doplň + typy), Vety podľa obsahu, Melódia vety, Umelecké prostriedky, Pády
- **Slovak language** (static bank): 30+ questions from real exam worksheets (synonymá, antonymá, literatúra, pranostiky, etc.)
- **German** (bilingválne only): Vocabulary, articles, verbs, sentences
- **Mock test config**: 8-rocne = 15q/30min, 4-rocne = 20q/45min, bilingvalne = 15q/30min
- **Router split**: 70% dynamic generators, 30% static bank; 8-ročné = 13 Slovak generators, 9-ročné adds Pády

### Question Generator - Noun Patterns (VZORY_DB)
12 patterns with example words:
- **Mužský životný**: chlap (otec, učiteľ, chatár...), hrdina (hokejista, tenista, sudca...)
- **Mužský neživotný**: dub (strom, dom, hrad, dážď...), stroj (nôž, kôš, čaj, meč...)
- **Ženský**: žena (mama, ryba, škola...), ulica (stanica, nemocnica...), dlaň (pieseň, báseň, loď...), kosť (myš, radosť, sladkosť...)
- **Stredný**: mesto (okno, selo, pero...), srdce (more, pole, slnce...), vysvedčenie (lístie, prítmie...), dievča (dieťa, mláďa...)

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
- Učenie = Learning
- Skúšobný test = Mock test
- Zlomky = Fractions
- Percenta = Percentages
- Vybrané slová = Selected words (Slovak grammar topic)
- Prijímačky = Entrance exams
- Gymnázium = Grammar school / high school
- Bilingválne gymnázium = Bilingual gymnasium (German)
- Rytmický zákon = Rhythmic shortening law (after long syllable → short)
- Spodobovanie = Consonant assimilation (voiced↔voiceless)
- Vzory = Noun declension patterns (chlap, hrdina, dub, stroj, žena, ulica, dlaň, kosť, mesto, srdce, vysvedčenie, dievča)
- Prídavné mená = Adjectives (vzory: pekný/cudzí; druhy: akostné/vzťahové/privlastňovacie)
- Zámená = Pronouns (osobné základné / osobné privlastňovacie)
- Miestna hodnota = Place value (jednotky, desiatky, stovky, tisícky...)

## Git & Deployment

- **Personal GitHub repo**: https://github.com/DusanOravsky/study_app
- **Always commit and push here** (not to Covestro org)
- Git identity: `Dusan Oravsky <dusan.oravsky@gmail.com>`

## Reference Materials

### `Testy/` - Real School Worksheets (28 files)
Source material for question generators. Slovak language + math worksheets for 5th graders (8-ročné gymnázium entrance exams). Includes .docx, .doc, .pptx, .png files from actual school tests.

**Already integrated into questionGenerator.ts:**
- Rytmický zákon (1. Opakovanie), Vzory ženského rodu (3. Pl-), Veľké/malé písmená (4.), Polročné opakovanie (5. SJL5), Spodobovanie (PL), Miestna hodnota (du.douč.png)
- Prídavné mená (1. Opakujeme, 2. Prídavné mená, 3. Druhy, Určovanie vzorov)
- Vzory mužského rodu (1. Vzory chlap a hrdina, 2. CHLAP A HRDINA DUB STROJ, 3. Pravopis mužského rodu)
- Prijímacie skúšky (4. Opakovanie 1-3, Opakovanie 5.ročník, Opakujeme netradične)
- Zámená (2. Osobné zámená, ZÁMENÁ opakovanie)
- Genitív (2. Zo slov utvor tvary), Čítanie s porozumením (Vo výťahu)
- Prehľad gramatiky 5.ročník (comprehensive grammar reference)

### `presun/` - Original Prototype
Original prototype files from son's Claude.ai project:
- `SMART-RANDOM-QUESTIONS.js` - Rich question templates (geometria, slovne ulohy, vzory, pady, pravopis) - partially integrated
- `ai-mentor-ultra-main.jsx` / `ai-mentor-ultra-components.jsx` - Original full app prototype
- `ai-mentor-LOCALHOST-demo.html` - Standalone demo

## Role System

4 roles selected on landing page (`/`):
- **Študent** (purple) → `/exam-type` → localStorage, no auth required
- **Rodič** (pink) → `/parent` → PIN-protected, no Firebase auth
- **Učiteľ** (emerald) → `/teacher` → Firebase auth required, manages classes
- **Admin** (amber) → `/admin` → Firebase auth + Firestore whitelist (`admins/{email}`)

**Role enforcement**: Admin emails in `admins` collection are blocked from teacher panel (and vice versa). One email = one role.

### Firestore Collections

```
users/{uid}             - User data (synced from localStorage)
classes/{classId}       - Teacher classes
  /students/{uid}       - Class students with stats
  /assignments/{id}     - Class assignments
  /submissions/{id}     - Assignment submissions
schools/{schoolId}      - Admin schools
  /teachers/{uid}       - School teachers
  /students/{uid}       - School students
admins/{email}          - Admin whitelist (write: false, only via Console)
leaderboard/{examType}/entries/{uid} - XP leaderboard
```

## What's NOT Done Yet

- [ ] Real AI chat API integration (currently pre-programmed responses)
- [ ] More math topics from presun/ (some geometria, slovne ulohy templates available)
- [ ] Čítanie s porozumením (reading comprehension) - worksheets available in Testy/ but needs longer text UI
- [ ] Genitív/Datív/Lokál tvorenie tvarov - fill-in generator (worksheets available)
- [ ] Vercel deployment
- [ ] PWA / offline support
- [ ] Sound effects for gamification

## Design Principles

- **Colorful and fun** - gradients, animations, playful design for ages 10-15
- **Mobile-first** - responsive, works on phone
- **Dual persistence** - localStorage + Firebase sync
- **No over-engineering** - keep it working and simple
- **Slovak language** - all UI text in Slovak
