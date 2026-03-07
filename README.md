<p align="center">
  <img src="swadl/assets/icon.png" alt="Swadl" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">Swadl</h1>

<p align="center">
  <strong>Parenting workload management for modern families</strong>
</p>

<p align="center">
  Swadl is not another baby tracker. It's an operational layer that reduces cognitive load,<br/>
  coordinates caregivers, and anticipates tasks before they become emergencies.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo_SDK-55-000020?style=flat-square&logo=expo" alt="Expo SDK 55" />
  <img src="https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tests-120_passing-22C55E?style=flat-square" alt="Tests" />
</p>

---

<!--
## Screenshots

Add screenshots here once available. Recommended layout:

<p align="center">
  <img src="docs/screenshots/dashboard.png" width="200" alt="Dashboard" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/chores.png" width="200" alt="Chore Manager" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/trends.png" width="200" alt="Trends" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/summary.png" width="200" alt="Summary" />
</p>

Place screenshots in swadl/docs/screenshots/ and uncomment this section.
-->

## Features

| | Feature | Description |
|---|---|---|
| **Adaptive Care Modes** | Together / Shifts / Nanny | The entire UI adapts based on how your household shares care |
| **Quick Logging** | Feed, Diaper, Sleep, Pump | 1-2 taps with offline queuing and confirmation animations |
| **Dashboard** | Status cards, mood, tasks | Real-time overview with pull-to-refresh |
| **Chore Manager** | Recurring + one-off tasks | Swipe-to-complete, animated checkmarks, caregiver assignment |
| **Shift Handoffs** | Auto-generated briefings | Structured summaries for caregiver transitions |
| **Summary** | Day/week stats | Shareable reports for partners and pediatricians |
| **Trends** | Animated bar charts | Staggered reveal animations, 7/14/30 day ranges |
| **Partner Invites** | Email invitations | Sent via Supabase Auth admin API |
| **Light/Dark Mode** | Theme toggle | Persisted preference, dark-first design |
| **Multi-Baby** | Multiple babies per household | Supported from day one |

## Design

<table>
  <tr>
    <td align="center"><strong>Midnight</strong><br/><code>#080E1A</code><br/><img src="https://via.placeholder.com/40/080E1A/080E1A" width="40" height="40" alt="midnight"/></td>
    <td align="center"><strong>Navy Card</strong><br/><code>#0F1D32</code><br/><img src="https://via.placeholder.com/40/0F1D32/0F1D32" width="40" height="40" alt="navy-card"/></td>
    <td align="center"><strong>Navy Raise</strong><br/><code>#162A46</code><br/><img src="https://via.placeholder.com/40/162A46/162A46" width="40" height="40" alt="navy-raise"/></td>
    <td align="center"><strong>Amber</strong><br/><code>#F59E0B</code><br/><img src="https://via.placeholder.com/40/F59E0B/F59E0B" width="40" height="40" alt="amber"/></td>
    <td align="center"><strong>Ember</strong><br/><code>#F97316</code><br/><img src="https://via.placeholder.com/40/F97316/F97316" width="40" height="40" alt="ember"/></td>
    <td align="center"><strong>White</strong><br/><code>#F8FAFC</code><br/><img src="https://via.placeholder.com/40/F8FAFC/F8FAFC" width="40" height="40" alt="white"/></td>
  </tr>
</table>

**Typography:** Fraunces 900 (display) / Outfit (body) / JetBrains Mono (data)

**Iconography:** [Lucide](https://lucide.dev) icons throughout &mdash; Home, ClipboardList, BarChart3, CheckSquare, Settings (tabs), Baby, Moon, Droplets (status cards)

All tokens live in `constants/theme.ts` and `constants/animation.ts`. See `docs/brand.md` for the full spec.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 55 |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind v4 + Tailwind CSS 3.3.2 |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| State | Zustand (local/UI) + React Query (server state) |
| Animations | react-native-reanimated 4 + react-native-gesture-handler 2 |
| Icons | lucide-react-native |
| Testing | Jest 29 + jest-expo 55 + React Native Testing Library |
| CI/CD | EAS Build + EAS Submit |

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
npm install --no-save sharp   # required locally only
node scripts/generate-icon.mjs
```

## Project Structure

```
swadl/
├── app/
│   ├── (auth)/           # Login and signup (eye toggle, forgot password)
│   ├── (onboarding)/     # 3-step onboarding flow
│   ├── (tabs)/           # Main app screens
│   │   ├── index.tsx     # Dashboard
│   │   ├── chores.tsx    # Chore Manager
│   │   ├── summary.tsx   # Daily/weekly summary
│   │   ├── trends.tsx    # Charts and trends
│   │   └── settings.tsx  # Settings and household
│   ├── log/[type].tsx    # Quick Log (feed/diaper/sleep/pump)
│   └── briefing.tsx      # Adaptive briefing / shift handoff
├── components/           # StatusCard, TaskItem, MoodPicker, ActivityFeed, etc.
├── constants/            # Design tokens, animation configs, chore templates
├── hooks/                # usePressSpring, useLogBurst, useOfflineSync, usePushNotifications
├── lib/                  # Supabase client, React Query hooks, Zustand store
├── types/                # TypeScript types (generated from Supabase schema)
├── __tests__/            # 14 suites, 120 tests
└── supabase/
    ├── migrations/       # SQL schema migrations
    └── functions/        # Edge Functions (Deno)
        ├── delete-account/       # Cascading account + data deletion
        ├── generate-handoff/     # Shift handoff briefing
        ├── send-invite/          # Partner/caregiver invite email
        ├── send-push/            # Push notifications via Expo Push API
        ├── seed-chores/          # Default chore setup on household creation
        └── compute-next-tasks/   # Cron: next tasks from recurrence rules
```

## Testing

```bash
npm test                  # Run all 14 suites (120 tests)
npx jest --no-coverage    # Without coverage report
```

> Jest 30 is incompatible with jest-expo 55 &mdash; pin to Jest ^29.7.0.

## Build & Deploy

Builds use [EAS Build](https://docs.expo.dev/build/introduction/). Environment variables are stored as **EAS Secrets** (never committed to git).

```bash
# Set secrets (one-time)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <url>
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key>

# Build
eas build --platform ios --profile preview      # Device build
eas build --platform ios --profile production    # App Store build
```

> Apple builds with 2FA require an [app-specific password](https://support.apple.com/en-us/102654).

### Deploy Edge Functions

```bash
supabase functions deploy send-invite
supabase functions deploy delete-account
supabase functions deploy send-push
supabase functions deploy generate-handoff
supabase functions deploy seed-chores
supabase functions deploy compute-next-tasks
```

### Supabase Configuration

| Setting | Value |
|---|---|
| Authentication > Site URL | `swadl://` |
| Authentication > Redirect URLs | `swadl://`, `exp+swadl://` |
| Email confirmation | Enabled |

---

<p align="center">
  <sub>Built with care, for caregivers.</sub>
</p>
