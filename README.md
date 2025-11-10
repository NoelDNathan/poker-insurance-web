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

## Deployment to GitHub Pages

This application is configured for static export and can be deployed to GitHub Pages.

### Prerequisites

1. The repository must be on GitHub
2. GitHub Pages must be enabled in repository settings

### Setup GitHub Pages

1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Save the settings

### Environment Variables

Set the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your contract address (optional)
- `NEXT_PUBLIC_STUDIO_URL`: GenLayer Studio URL (defaults to `https://studio.genlayer.com`)

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Build the Next.js application as a static site
- Deploy to GitHub Pages on every push to `main` or `master` branch

### Manual Build

To build locally for testing:

```bash
npm run build
```

The static files will be generated in the `out` directory.

### Notes

- The application uses static export (`output: 'export'` in `next.config.ts`)
- API routes are not supported with static export
- The contract file is served from `public/contracts/` as a static file
