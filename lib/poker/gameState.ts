import { ICard } from "./types";

export type GameMode = "normal" | "cooler" | "epic";

export interface Player {
  id: number;
  name: string;
  isHuman: boolean;
  chair: number;
  balance: number;
  currentBet: number;
  inGame: boolean;
  isAllIn: boolean;
  folded: boolean;
  hand: ICard[];
}

export interface GameState {
  players: Player[];
  communityCards: ICard[];
  currentRound: "preflop" | "flop" | "turn" | "river" | "showdown";
  pot: number;
  currentBet: number;
  dealerPosition: number;
  currentTurnIndex: number;
  handNumber: number;
  gameMode: GameMode;
  firstHandPlayed: boolean;
  isHandComplete: boolean;
  winners: number[];
  roundStartIndex: number; // Index of the first player to act in the current round
  hasActedThisRound: boolean; // Whether at least one player has acted in the current round
}

export const createInitialGameState = (
  gameMode: GameMode,
  humanPlayerName: string = "You"
): GameState => {
  const players: Player[] = [
    {
      id: 0,
      name: humanPlayerName,
      isHuman: true,
      chair: 0,
      balance: 1000,
      currentBet: 0,
      inGame: true,
      isAllIn: false,
      folded: false,
      hand: [],
    },
    {
      id: 1,
      name: "Bot 1",
      isHuman: false,
      chair: 1,
      balance: 1000,
      currentBet: 0,
      inGame: true,
      isAllIn: false,
      folded: false,
      hand: [],
    },
    {
      id: 2,
      name: "Bot 2",
      isHuman: false,
      chair: 2,
      balance: 1000,
      currentBet: 0,
      inGame: true,
      isAllIn: false,
      folded: false,
      hand: [],
    },
    {
      id: 3,
      name: "Bot 3",
      isHuman: false,
      chair: 3,
      balance: 1000,
      currentBet: 0,
      inGame: true,
      isAllIn: false,
      folded: false,
      hand: [],
    },
    {
      id: 4,
      name: "Bot 4",
      isHuman: false,
      chair: 4,
      balance: 1000,
      currentBet: 0,
      inGame: true,
      isAllIn: false,
      folded: false,
      hand: [],
    },
  ];

  return {
    players,
    communityCards: [],
    currentRound: "preflop",
    pot: 0,
    currentBet: 0,
    dealerPosition: 0,
    currentTurnIndex: 0,
    handNumber: 0,
    gameMode,
    firstHandPlayed: false,
    isHandComplete: false,
    winners: [],
    roundStartIndex: 0,
    hasActedThisRound: false,
  };
};

