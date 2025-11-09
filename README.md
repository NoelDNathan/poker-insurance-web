# Poker Cooler Insurance - Next.js Interface

A Next.js application to interact with the Poker Cooler Insurance contract on GenLayer.

## Features

- **Purchase Insurance**: Buy insurance for poker tournaments
- **Tournament Details**: View tournament information, buy-in, premium, and payout
- **Policy Management**: View and manage your insurance policies
- **File Claims**: Submit claims for cooler eliminations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_STUDIO_URL=https://studio.genlayer.com
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- `/` - Home page with navigation to main features
- `/purchase` - Purchase insurance for a tournament
- `/tournament` - View tournament details, policies, and file claims

## Technologies

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- framer-motion for animations
- genlayer-js SDK

## Account Management

The app uses local storage to persist account information. Click "Connect Account" to create a new account or use an existing one.
