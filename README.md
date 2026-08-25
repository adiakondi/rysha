# rysha

**Uber for small repairs** — a mobile MVP that connects landlords & Airbnb hosts with vetted contractors.

Post a job → get matched with available pros → book by reliability & rate.

Built end-to-end with **React Native + Expo** and **Supabase**.

---

## Overview

rysha solves the pain of finding reliable help for small property repairs (leaky faucets, electrical issues, painting, HVAC, etc.). 

- **Landlords / Property Owners** can post jobs with clear scope, location, and preferred timing.
- **Contractors / Handymen** can set availability + hourly rate ranges and accept open jobs.
- Simple auto-assignment logic (first available contractor) + manual accept flow.

This is a functional mobile MVP demonstrating full authentication, role-based UX, CRUD operations, and real-time-ish job matching using a BaaS backend.

---

## Features

### Authentication & Onboarding
- Email/password sign-up and sign-in (Supabase Auth)
- Automatic redirect if already logged in
- First-time profile setup (display name + role selection)
- Persistent sessions

### Role-Based Experience
| Role | Capabilities |
|------|--------------|
| **Landlord** | Post jobs (title, category, description, location, date/time needed) |
| **Contractor** | Toggle availability, set min/max hourly rates, browse & accept open jobs |

### Core Flows
- **Post Job** → Creates record in `jobs` table with status `open`. Attempts auto-assignment to the first available contractor.
- **Available Jobs** → Contractors see open jobs (excluding their own), can accept them (status → `assigned`).
- **Profile** → Edit display name & role; log out.
- Pull-to-refresh on job list.

### Supporting
- Waitlist landing page (static HTML + Supabase insert) for early user acquisition.
- Clean, modern UI with consistent orange (#ea580c) primary color and navy accents.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native 0.83, Expo SDK ~55, Expo Router, TypeScript |
| **UI** | React Native core components + `@expo/vector-icons`, `react-native-modal-selector` |
| **Backend / Auth / DB** | Supabase (Auth + Postgres) |
| **State / Data** | Direct Supabase client calls (no additional state library) |
| **Landing** | Vanilla HTML/CSS/JS + Supabase JS client |

**Key dependencies** (from `package.json`):
- `expo-router` – file-based routing
- `@supabase/supabase-js`
- `expo-dev-client`, `expo-splash-screen`, `react-native-safe-area-context`, `react-native-screens`

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Expo CLI (`npx expo` is sufficient)
- iOS Simulator (macOS) **or** Android Emulator **or** Expo Go app on a physical device
- Supabase project (already configured in the code — see notes below)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/adiakondi/rysha.git
cd rysha
```
### 2. Install dependencies

```bash
cd rysha-app
npm install
```
### 3. Start the app

```bash
npx expo start
```
### Then choose one of these options:
- Phone (easiest) -> Install Expo Go → scan the QR code shown in the terminal
- iOS Simulator (Mac only) -> Press i in the terminal
- Android Emulator -> Press a in the terminal
- Web -> Press w in the terminal






