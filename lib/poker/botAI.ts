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

  // Bots 2-4 use probability formula
  if (newBet === 0) {
    return { action: "check" };
  }

  if (newBet > 0 && botBalance > 0) {
    const probability = 0.75 * (newBet / botBalance);
    const random = Math.random();

    if (random < probability) {
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

