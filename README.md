# Poker Tournament dApp

## Overview

A decentralized poker tournament platform powered by GenLayer Intelligent Contracts. This dApp allows users to participate in poker tournaments, purchase insurance against "cooler" eliminations, and automatically resolve tournament outcomes using AI consensus based on game state data.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Blockchain**: GenLayer Testnet (Intelligent Contracts)
- **SDK**: genlayer-js
- **AI**: GenLayer AI Consensus

## Key Features

### 1. Poker Tournaments

- **Create Tournaments**: Set up poker tournaments with customizable parameters
- **Multiple Game Modes**:
  - **Normal Mode**: Standard poker gameplay with random card dealing
  - **Cooler Mode**: Experience a cooler situation (strong hand loses to stronger hand)
  - **Epic Mode**: Get premium hands like Royal Flush or Straight Flush
- **Real-time Gameplay**: Interactive poker table with betting controls
- **Tournament Management**: Track player balances, eliminations, and pot distribution

### 2. Cooler Insurance

- **Purchase Insurance**: Buy insurance coverage for poker tournament coolers
- **Policy Management**: View and manage your insurance policies
- **Claim Processing**: Submit claims for cooler eliminations
- **Automatic Verification**: AI-powered verification of cooler situations

### 3. AI-Powered Resolution

- **Automatic Tournament Resolution**: After tournament ends, trigger AI resolution
- **Hand Evaluation**: GenLayer AI evaluates poker hands and determines winners
- **Elimination Tracking**: Automatically tracks player eliminations and cooler situations
- **Fair Distribution**: Winners receive proportional payouts based on tournament results

### 4. Tournament Feed

- **Browse Tournaments**: View all active and completed tournaments
- **Filter by Status**: Filter tournaments by status (Active / Finished / Resolved)
- **Detailed Statistics**: View tournament details, player counts, and pot sizes
- **Game History**: Track your tournament participation and results

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **GenLayer Studio** (Install from [Docs](https://docs.genlayer.com/developers/intelligent-contracts/tooling-setup#using-the-genlayer-studio) or use the hosted version at [GenLayer Studio](https://studio.genlayer.com/))
- **GenLayer CLI** (optional): `npm install -g genlayer`
- **Python 3.12+** (for contract testing)

### Installation

1. **Install frontend dependencies**:
```bash
cd app-nextjs
npm install
```

2. **Install Python dependencies** (for contract testing):
```bash
pip install -r requirements.txt
```

3. **Create environment file**:
Create a `.env.local` file in the `app-nextjs` directory:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_STUDIO_URL=https://studio.genlayer.com
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

### Contract Deployment

1. **Choose network**:
```bash
genlayer network
```

2. **Deploy contract**:
```bash
genlayer deploy contracts/poker_tournament_V2.py
```

Or use **GenLayer Studio** (Browser):
- Go to [studio.genlayer.com](https://studio.genlayer.com)
- Paste contract code from `contracts/poker_tournament_V2.py`
- Deploy to testnet
- Copy contract address to `.env.local`

## Architecture

### Intelligent Contracts (GenLayer)

The poker tournament logic runs on GenLayer's Intelligent Contracts:

#### `PokerTournament` Contract

```python
class PokerTournament(gl.Contract):
    - set_players()          # Initialize tournament players
    - play_hand()            # Execute a poker hand
    - eliminate_player()     # Record player elimination
    - resolve_tournament()   # AI resolves final winner
    - get_state()            # Query tournament state
    - claim_reward()         # Winners claim payout
```

#### `PokerCoolerInsurance` Contract

```python
class PokerCoolerInsurance(gl.Contract):
    - purchase_insurance()   # Buy insurance for tournament
    - file_claim()           # Submit cooler claim
    - verify_cooler()        # AI verifies cooler situation
    - process_claim()        # Process and payout claim
```

### Frontend Structure

```
app-nextjs/
├── app/
│   ├── page.tsx                    # Home page
│   ├── tournament/
│   │   └── page.tsx                # Tournament details & insurance
│   └── play/
│       └── [tournamentId]/
│           ├── page.tsx            # Game mode selection
│           └── game/
│               └── page.tsx        # Poker game interface
├── components/
│   ├── poker/                      # Poker game components
│   │   ├── PokerGame.tsx
│   │   ├── Table.tsx
│   │   ├── Card.tsx
│   │   ├── BettingControls.tsx
│   │   └── ...
│   ├── TournamentDetails.tsx
│   ├── ClaimForm.tsx
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── genlayer.ts                 # GenLayer client setup
│   ├── AccountContext.tsx          # Account management
│   ├── poker/                      # Poker game logic
│   │   ├── gameEngine.ts
│   │   ├── cardDealer.ts
│   │   ├── handEvaluation.ts
│   │   └── ...
│   └── PokerTournament.ts          # Contract interactions
├── contracts/                      # GenLayer contracts
│   ├── poker_tournament_V2.py
│   ├── poker_cooler_insurance.py
│   └── ...
└── test/                           # Contract tests
    ├── test_poker_tournament.py
    └── ...
```

## GenLayer Integration

### How GenLayer AI Consensus Works

1. **Tournament Creation**: Contract deployed to GenLayer testnet
2. **Gameplay**: Players participate in poker hands, betting and playing cards
3. **Elimination Tracking**: System records player eliminations and hand outcomes
4. **Resolution Trigger**: Anyone can trigger resolution after tournament ends
5. **AI Consensus**:
   - Multiple validator nodes use different AI models
   - Each AI evaluates poker hands and tournament state
   - Consensus is reached through majority vote
   - Result is written to blockchain
6. **Payout**: Winners claim proportional share of pot

### Example Resolution Process

**Tournament State**: 3 players remaining, pot = 1000 tokens

**AI Process**:
1. **Evaluate**: Analyze all player hands and board cards
2. **Rank**: Determine hand rankings (Royal Flush > Straight Flush > ...)
3. **Compare**: Compare all active hands
4. **Decide**: Determine winner(s) and elimination order
5. **Consensus**: Vote with other validators
6. **Distribute**: Allocate pot to winner(s)

## UI/UX Design

### Modern Poker Theme

- **Colors**: Professional card table green, gold accents for winnings
- **Effects**: Smooth card animations, chip stack visualizations
- **Typography**: Clean, readable fonts optimized for game interface
- **Interactions**: Hover effects, smooth transitions, responsive design

### Key Design Elements

- Animated card dealing
- Realistic poker table visualization
- Chip stack animations
- Betting controls with visual feedback
- Tournament status indicators
- Player position indicators

## Development

### Project Structure

```
app-nextjs/
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/                    # Utilities and business logic
├── contracts/              # GenLayer intelligent contracts
├── config/                 # Configuration files
├── test/                   # Contract tests
├── public/                 # Static assets
├── package.json            # Node dependencies
├── requirements.txt        # Python dependencies
└── tsconfig.json           # TypeScript config
```

### Environment Variables

**Environment Variables** (`.env.local`):
```**env**
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_STUDIO_URL=https://studio.genlayer.com
```

**Config** (`config/genlayer_config.py`):
```python
RPCPROTOCOL=http
RPCHOST=localhost
RPCPORT=8545
```

### Testing

#### Contract Tests

1. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run tests** (ensure GenLayer Studio is running):
```bash
gltest
```

Or run specific test files:
```bash
python -m pytest test/test_poker_tournament.py -v
python -m pytest test/test_poker_tournamentv2_eliminations.py -v
python -m pytest test/test_poker_cooler_insurance.py -v
```

#### Manual Testing Flow

1. **Connect Account**:
   - Click "Connect Account" in navbar
   - Create new account or use existing one (stored in localStorage)

2. **View Tournaments**:
   - Navigate to `/tournament`
   - View tournament details and insurance options

3. **Join Tournament**:
   - Navigate to `/play/[tournamentId]`
   - Select game mode (Normal / Cooler / Epic)
   - Start playing poker

4. **Purchase Insurance**:
   - Go to tournament page
   - Enter tournament ID and premium amount
   - Click "Purchase Insurance"

5. **File Claim**:
   - After experiencing a cooler elimination
   - Submit claim with tournament details
   - AI will verify and process claim

6. **Resolve Tournament**:
   - After tournament ends
   - Trigger AI resolution
   - Winners can claim rewards

## Deployment

### Static Export (GitHub Pages)

This application is configured for static export:

```bash
npm run build
```

The static files will be generated in the `out` directory.

### GenLayer Contract Deployment

**Using GenLayer CLI**:
```bash
genlayer init
genlayer deploy contracts/poker_tournament_V2.py
```

**Using GenLayer Studio**:
1. Go to [studio.genlayer.com](https://studio.genlayer.com)
2. Paste contract code
3. Deploy to testnet
4. Copy contract address

### Production Build

```bash
npm run build
npm run start
```

## Contract Details

### Available Contracts

- **`poker_tournament_V2.py`**: Main tournament contract with elimination tracking
- **`poker_tournament.py`**: Original tournament contract
- **`poker_cooler_insurance.py`**: Insurance contract for cooler situations
- **`poker_winner_checker_multiple.py`**: Winner verification contract
- **`ERC20.py`**: Token contract for tournament stakes
- **`nft_contract.py`**: NFT contract (if needed)

### Contract Testing

All contracts include comprehensive tests in the `test/` directory:

- `test_poker_tournament.py`: Basic tournament functionality
- `test_poker_tournamentv2_eliminations.py`: Elimination tracking
- `test_poker_cooler_insurance.py`: Insurance claims
- `test_poker_winner_checker_multiple.py`: Winner verification
