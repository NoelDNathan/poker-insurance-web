import { ICard } from "./types";
import { evaluateHand } from "./handEvaluation";

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

  // Bot 1 always calls/checks
  if (botIndex === 1) {
    if (newBet === 0) {
      return { action: "check" };
    }
    return { action: "call" };
  }

  // Bots 2-4 use probability formula with hand strength consideration
  if (newBet === 0) {
    return { action: "check" };
  }

  if (newBet > 0 && botBalance > 0) {
    // Evaluate hand strength
    const handEvaluation = evaluateHand(hand, communityCards);
    // Convert BigInt score to Number for calculations
    const handStrength = Number(handEvaluation.score);
    
    // Base probability from bet/balance ratio (increased from 0.75 to 1.2 for more calls)
    const baseProbability = 1.2 * (newBet / botBalance);
    
    // Hand strength modifier: stronger hands are more likely to call/raise
    // Hand scores range from ~0 (high card) to ~90000000000000 (royal flush)
    // Normalize to 0-1 range and add bonus (divide by a large number to normalize)
    const handStrengthBonus = Math.min(handStrength / 100000000000000, 0.4); // Max 40% bonus
    
    // Minimum call probability (30%) - bots will call at least 30% of the time
    const minCallProbability = 0.3;
    
    // Calculate final probability
    const probability = Math.min(baseProbability + handStrengthBonus, 0.95); // Cap at 95%
    const finalProbability = Math.max(probability, minCallProbability);
    
    const random = Math.random();

    if (random < finalProbability) {
      // Sometimes raise with strong hands (check if score is high enough)
      // Using category as a simpler check for strong hands
      if (handEvaluation.category >= 5 && random < 0.3 && botBalance > newBet * 2) {
        const raiseAmount = currentBet + Math.floor(newBet * (1.5 + Math.random()));
        return { action: "raise", raiseAmount };
      }
      return { action: "call" };
    } else {
      return { action: "fold" };
    }
  }

  // If bot can't afford to call, fold
  if (botBalance < newBet) {
    return { action: "fold" };
  }

  return { action: "fold" };
}

