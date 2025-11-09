import { ICard } from "./types";

export type BotAction = "fold" | "check" | "call" | "raise";

export interface BotDecision {
  action: BotAction;
  raiseAmount?: number;
}

export function makeBotDecision(
  botIndex: number,
  hand: ICard[],
  communityCards: ICard[],
  currentBet: number,
  botCurrentBet: number,
  botBalance: number
): BotDecision {
  const newBet = currentBet - botCurrentBet;
  const random = Math.random();
  const raiseProbability = 0.1; // 5% chance to raise

  // All bots always call/check - never fold
  // With 5% probability, bots can raise
  if (random < raiseProbability && botBalance > 0) {
    // Calculate raise amount: current bet + 1.5x to 3x the new bet (or available balance)
    const minRaise = currentBet + Math.max(newBet || 10, 10);
    const maxRaise = currentBet + Math.floor((newBet || 10) * 3);
    const availableForRaise = botBalance + botCurrentBet;
    const raiseAmount = Math.min(
      Math.floor(minRaise + (maxRaise - minRaise) * Math.random()),
      availableForRaise
    );
    
    if (raiseAmount > currentBet) {
      return { action: "raise", raiseAmount };
    }
  }

  // Default behavior: check if no bet, call if there's a bet
  if (newBet === 0) {
    return { action: "check" };
  }

  // Always call (will go all-in if bot can't afford full call)
  return { action: "call" };
}

