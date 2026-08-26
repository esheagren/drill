# Magnitude

Adult mental arithmetic trainer: scientific-notation estimation, big-number ops, and percents, with timed practice.

## What it is

Magnitude is a mobile-first PWA designed for adults who want to improve their mental arithmetic skills. It focuses on three core areas:

1. **Big Numbers** — Multiply and divide large quantities (thousands through trillions)
2. **Estimation** — Order-of-magnitude arithmetic with scientific notation scaffolding
3. **Percents** — Fast percentage calculations with instant feedback

The app uses scientific notation as a teaching method: convert numbers to scientific notation, perform operations on coefficients and exponents, then convert back. This scaffold can be shown or hidden as you improve.

## Features

- **Three practice modes** with adaptive difficulty
- **Progress tracking** with localStorage persistence
- **Scientific notation hints** that can be toggled on/off
- **Order-of-magnitude scoring** for estimation mode
- **Session summaries** showing accuracy and median time
- **PWA support** — install to your phone's home screen
- **Dark mode** support
- **No accounts required** — all data stored locally

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app works best in mobile viewport (use responsive design mode in your browser's dev tools, or open it on your phone).

### Building for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

This app is optimized for deployment on Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build settings
4. Deploy!

Alternatively, using the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## PWA Installation

Once deployed (or running locally), you can install Magnitude as a PWA:

- **iOS Safari**: Tap the Share button, then "Add to Home Screen"
- **Android Chrome**: Tap the menu (⋮), then "Install app" or "Add to Home Screen"
- **Desktop Chrome**: Click the install icon in the address bar

## How Practice Works

Each mode generates 10 questions per round. The app tracks:

- Accuracy (correct vs. incorrect)
- Response time (milliseconds)
- Magnitude error (for estimation mode)

After each round, you'll see a summary and your progress over time. Difficulty adapts based on your performance.

### Big Numbers Mode

Practice multiplying and dividing large quantities. Numbers are presented in various formats (numeric, word form like "5 million"). The scientific notation hint shows the calculation breakdown.

### Estimation Mode

Focus on order-of-magnitude accuracy, not exact answers. The optional step-by-step walkthrough shows:
1. Convert to scientific notation
2. Perform operations on coefficients and exponents
3. Result

Scoring uses logarithmic error, so being within the right order of magnitude is what matters.

### Percents Mode

Drill percentage calculations until they're instant. Mix of easy (10% of 80), medium (15% of 1,000), and harder (2.5% of 200) problems. Hints available for common patterns.

## Technology Stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **localStorage** for progress persistence
- **PWA** with service worker for offline support

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout with PWA setup
│   ├── page.tsx         # Home screen
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── BigNumbers.tsx   # Big numbers practice mode
│   ├── Estimation.tsx   # Estimation practice mode
│   ├── Percents.tsx     # Percents practice mode
│   ├── Progress.tsx     # Progress tracking screen
│   ├── PracticeSession.tsx  # Shared practice logic
│   └── PWAInstaller.tsx # Service worker registration
├── lib/                 # Utilities and helpers
│   ├── progress.ts      # Progress tracking and persistence
│   └── utils.ts         # Number parsing and formatting
└── public/              # Static assets
    ├── manifest.json    # PWA manifest
    ├── sw.js           # Service worker
    └── icon-*.svg      # App icons
```

## Design Principles

- **Mobile-first**: Designed for phone screens with large tap targets
- **Calm and grown-up**: No gamification, no cutesy copy, no distractions
- **Fast to start**: One tap from home screen to practice
- **Minimal settings**: Just enough options, nothing more
- **Progress-focused**: Clear feedback on improvement over time

## License

MIT
