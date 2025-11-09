"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GameState, Player, createInitialGameState, GameMode } from "@/lib/poker/gameState";
import {
  startNewHand,
  processPlayerAction,
  advanceToNextRound,
  isBettingRoundComplete,
  getNextActivePlayerIndex,
} from "@/lib/poker/gameEngine";
import { makeBotDecision } from "@/lib/poker/botAI";
import { evaluateHand } from "@/lib/poker/handEvaluation";
import { Table } from "./Table";
import { BettingControls } from "./BettingControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PokerGameProps {
  tournamentId: string;
  gameMode: GameMode;
}

export const PokerGame: React.FC<PokerGameProps> = ({ tournamentId, gameMode }) => {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(gameMode)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [dealtCards, setDealtCards] = useState<boolean[]>(
    Array(5).fill(false)
  );
  const [showNextHandButton, setShowNextHandButton] = useState(false);

  useEffect(() => {
    const newState = startNewHand(createInitialGameState(gameMode));
    setGameState(newState);
    setDealtCards(Array(5).fill(true));
    setShowNextHandButton(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameState.isHandComplete) {
      setShowNextHandButton(true);
      return;
    }

    if (gameState.currentRound === "showdown") {
      return;
    }

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer || currentPlayer.isHuman) {
      return;
    }

    if (isProcessing) {
      return;
    }

    const handleBotTurn = async () => {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const bot = currentPlayer;
      const decision = makeBotDecision(
        bot.id,
        bot.hand,
        gameState.communityCards,
        gameState.currentBet,
        bot.currentBet,
        bot.balance
      );

      let newState = processPlayerAction(
        gameState,
        gameState.currentTurnIndex,
        decision.action,
        decision.raiseAmount
      );

      if (isBettingRoundComplete(newState)) {
        if (newState.currentRound === "river") {
          newState = advanceToNextRound(newState);
        } else {
          newState = advanceToNextRound(newState);
        }
      } else {
        const nextIndex = getNextActivePlayerIndex(newState);
        if (nextIndex >= 0) {
          newState.currentTurnIndex = nextIndex;
        } else {
          newState = advanceToNextRound(newState);
        }
      }

      setGameState(newState);
      setIsProcessing(false);
    };

    handleBotTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentTurnIndex, gameState.currentRound, gameState.isHandComplete, isProcessing]);

  const handlePlayerAction = useCallback(
    (action: "fold" | "check" | "call" | "raise", raiseAmount?: number) => {
      if (isProcessing) return;

      const humanPlayerIndex = gameState.players.findIndex((p) => p.isHuman);
      if (humanPlayerIndex === -1) return;

      let newState = processPlayerAction(gameState, humanPlayerIndex, action, raiseAmount);

      if (isBettingRoundComplete(newState)) {
        if (newState.currentRound === "river") {
          newState = advanceToNextRound(newState);
        } else {
          newState = advanceToNextRound(newState);
        }
      } else {
        const nextIndex = getNextActivePlayerIndex(newState);
        if (nextIndex >= 0) {
          newState.currentTurnIndex = nextIndex;
        } else {
          newState = advanceToNextRound(newState);
        }
      }

      setGameState(newState);
    },
    [gameState, isProcessing]
  );

  const handleNextHand = useCallback(() => {
    const newState = startNewHand(gameState);
    setGameState(newState);
    setDealtCards(Array(5).fill(true));
    setShowNextHandButton(false);
  }, [gameState]);

  const handleExit = useCallback(() => {
    router.push("/tournament");
  }, [router]);

  const humanPlayer = gameState.players.find((p) => p.isHuman);
  const humanPlayerHand = humanPlayer
    ? evaluateHand(humanPlayer.hand, gameState.communityCards).name
    : null;
  const isHumanTurn =
    humanPlayer &&
    gameState.currentTurnIndex === gameState.players.indexOf(humanPlayer) &&
    !gameState.isHandComplete &&
    gameState.currentRound !== "showdown";

  const roundLabels: Record<string, string> = {
    preflop: "Preflop",
    flop: "Flop",
    turn: "Turn",
    river: "River",
    showdown: "Showdown",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Poker Game</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExit} className="text-white">
            Exit Game
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <Table
          pot={gameState.pot}
          currentRound={gameState.currentRound}
          lastBetAmount={gameState.currentBet}
          communityCards={gameState.communityCards}
          visibleCards={5}
          players={gameState.players}
          turnHolder={gameState.players[gameState.currentTurnIndex]?.chair ?? -1}
          humanPlayerHand={humanPlayerHand || ""}
          dealtCards={dealtCards}
          userAddress=""
        />
      </div>

      {gameState.isHandComplete && showNextHandButton && (
        <div className="p-4 flex justify-center">
          <Card className="bg-white/90">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Hand Complete!</h2>
                {gameState.winners.length > 0 && (
                  <div>
                    <p className="text-lg mb-2">Winners:</p>
                    {gameState.winners.map((winnerId) => {
                      const winner = gameState.players.find((p) => p.id === winnerId);
                      return (
                        <p key={winnerId} className="font-semibold text-green-600">
                          {winner?.name} won ${Math.floor(gameState.pot / gameState.winners.length)}
                        </p>
                      );
                    })}
                  </div>
                )}
                <Button onClick={handleNextHand} className="w-full">
                  Next Hand
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isHumanTurn && humanPlayer && (
        <div className="p-4">
          <BettingControls
            onFold={() => handlePlayerAction("fold")}
            onCheck={() => handlePlayerAction("check")}
            onCall={() => handlePlayerAction("call")}
            onRaise={(amount) => handlePlayerAction("raise", amount)}
            currentBet={gameState.currentBet}
            playerBet={humanPlayer.currentBet}
            playerBalance={humanPlayer.balance}
            isLoading={isProcessing}
          />
        </div>
      )}

      {!isHumanTurn && !gameState.isHandComplete && gameState.currentRound !== "showdown" && (
        <div className="p-4 text-center text-white">
          <p>Waiting for other players...</p>
          <p className="text-sm text-gray-400">
            {gameState.players[gameState.currentTurnIndex]?.name} is thinking...
          </p>
        </div>
      )}

      <div className="p-4 text-center text-white text-sm">
        <p>
          Round: {roundLabels[gameState.currentRound]} | Hand #{gameState.handNumber} | Mode:{" "}
          {gameState.gameMode}
        </p>
      </div>
    </div>
  );
};

