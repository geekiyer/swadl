# Swadl

A multi-caregiver parenting workload management app built with React Native and Expo. Swadl is not another baby tracker — it's an operational layer that reduces cognitive load, coordinates caregivers, and anticipates tasks before they become emergencies.

## Tech Stack

- **Framework:** React Native + Expo SDK 55
- **Navigation:** Expo Router (file-based routing)
- **Styling:** NativeWind v4 + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **State:** Zustand (local/UI) + React Query (server state)
- **Animations:** react-native-reanimated 4 + react-native-gesture-handler 2
- **Icons:** lucide-react-native
- **Fonts:** Fraunces (display), Outfit (body), JetBrains Mono (data)

## Features

- **Adaptive Care Modes** — Together, Shifts, or Nanny mode. The entire UI adapts based on how your household shares care.
- **Quick Logging** — Feed, diaper, sleep, and pump logs in 1-2 taps with offline queuing.
- **Dashboard** — Real-time status cards, mood tracking, next tasks, and activity feed.
- **Chore Manager** — Recurring and one-off tasks with swipe-to-complete and caregiver assignment.
- **Shift Handoffs** — Automatic briefing generation for caregiver transitions.
- **Daily Briefings** — Shareable summaries for partners, grandparents, or pediatricians.
- **Summary & Trends** — Daily/weekly stats and visual charts for feeding, sleep, and diapers.
- **Multi-Baby Support** — Schema supports multiple babies per household from day one.
- **Offline Support** — Quick Log entries queue locally and sync when connectivity resumes.

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Supabase](https://supabase.com) project

### Installation

```bash
cd swadl
npm install --legacy-peer-deps
```

### Environment Variables

Create a `.env` file in the `swadl/` directory:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running

```bash
npm start        # Start Expo dev server
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
```

### Generate App Icon

```bash
node scripts/generate-icon.mjs
```

## Project Structure

```
swadl/
├── app/
│   ├── (auth)/           # Login and signup
│   ├── (onboarding)/     # 3-step onboarding flow
│   ├── (tabs)/           # Main app screens
│   │   ├── index.tsx     # Dashboard
│   │   ├── chores.tsx    # Chore Manager
│   │   ├── summary.tsx   # Daily/weekly summary
│   │   ├── trends.tsx    # Charts and trends
│   │   └── settings.tsx  # Settings and household
│   ├── log/[type].tsx    # Quick Log (feed/diaper/sleep/pump)
│   └── briefing.tsx      # Adaptive briefing / shift handoff
├── components/           # Reusable UI components
├── constants/            # Design tokens, animation configs
├── hooks/                # Custom hooks (press spring, log burst)
├── lib/                  # Supabase client, React Query hooks, Zustand store
├── types/                # TypeScript types (generated from Supabase schema)
└── supabase/
    ├── migrations/       # SQL schema migrations
    └── functions/        # Edge Functions
```

## Design

Dark-first UI with midnight (#080E1A) backgrounds, navy card surfaces, amber primary accent, and ember secondary accent. All colors, spacing, and typography are tokenized in `constants/theme.ts`. Animation configs live in `constants/animation.ts`.

## License

Private — All rights reserved.
