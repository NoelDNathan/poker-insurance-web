"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { GameState, Player, createInitialGameState, GameMode } from "@/lib/poker/gameState";
import {
  startNewHand,
  processPlayerAction,
  advanceToNextRound,
  isBettingRoundComplete,
  getNextActivePlayerIndex,
  determineWinners,
} from "@/lib/poker/gameEngine";
import { makeBotDecision } from "@/lib/poker/botAI";
import { evaluateHand } from "@/lib/poker/handEvaluation";
import { Table } from "./Table";
import { BettingControls } from "./BettingControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PokerTournament } from "@/lib/PokerTournament";
import { useAccount } from "@/lib/AccountContext";
import { cardsToString, generateRandomAddress } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface PokerGameProps {
  tournamentId: string;
  gameMode: GameMode;
}

export const PokerGame: React.FC<PokerGameProps> = ({ tournamentId, gameMode }) => {
  const router = useRouter();
  const { account, accountAddress } = useAccount();
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(gameMode));
  const [isProcessing, setIsProcessing] = useState(false);
  const [dealtCards, setDealtCards] = useState<boolean[]>(Array(5).fill(false));
  const [showNextHandButton, setShowNextHandButton] = useState(false);
  const [contract, setContract] = useState<PokerTournament | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [contractDeployed, setContractDeployed] = useState(false);
  const botAddressesRef = useRef<string[]>([]);
  const initialBalancesRef = useRef<number[]>([]);
  const isActionInProgressRef = useRef(false);
  const [isResolvingOnChain, setIsResolvingOnChain] = useState(false);
  const [lastWinnerIndex, setLastWinnerIndex] = useState<number | null>(null);
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  // Deploy contract and set players on mount
  useEffect(() => {
    const initializeContract = async () => {
      console.log("[PokerGame] Initializing contract...");
      if (!account) {
        console.log("[PokerGame] No account found, aborting initialization");
        setDeploymentError("Please connect an account first");
        return;
      }

      console.log("[PokerGame] Account found, starting deployment process");
      setIsDeploying(true);
      setDeploymentError(null);

      try {
        // Fetch contract code from API
        console.log("[PokerGame] Fetching contract code from API...");
        const response = await fetch("/api/contract");
        if (!response.ok) {
          throw new Error("Failed to fetch contract code");
        }
        const { code } = await response.json();
        console.log("[PokerGame] Contract code fetched, converting to Uint8Array...");
        // Convert base64 to Uint8Array
        const binaryString = atob(code);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const contractCode = bytes;
        console.log("[PokerGame] Contract code ready, size:", contractCode.length, "bytes");

        // Deploy contract
        console.log("[PokerGame] Creating PokerTournament instance...");
        const tournamentContract = new PokerTournament(null, account, studioUrl);
        console.log("[PokerGame] Deploying contract...");
        const contractAddress = await tournamentContract.deployContract(contractCode);
        tournamentContract.setContractAddress(contractAddress);
        setContract(tournamentContract);
        console.log("[PokerGame] Contract deployed, address:", contractAddress);

        // Generate bot addresses (2 bots)
        console.log("[PokerGame] Generating bot addresses...");
        const botAddresses = Array.from({ length: 2 }, () => generateRandomAddress());
        botAddressesRef.current = botAddresses;
        console.log("[PokerGame] Bot addresses generated:", botAddresses.length);

        // Get user address - try to get from account
        let userAddress = accountAddress || "";
        if (!userAddress && account) {
          // Try to get address from account object
          const accountAny = account as any;
          if (accountAny.address) {
            userAddress =
              typeof accountAny.address === "string" ? accountAny.address : accountAny.address();
          }
        }

        if (!userAddress) {
          throw new Error("Could not get user address from account");
        }
        console.log("[PokerGame] User address:", userAddress);

        // Set players: 3 players with balance 1000 each
        const balances = Array(3).fill(1000);
        const addresses = [userAddress, ...botAddresses];
        console.log("[PokerGame] Setting players:", { playerCount: 3, balancePerPlayer: 1000 });

        await tournamentContract.setPlayers(balances, addresses);
        console.log("[PokerGame] Players set successfully, contract initialization complete");
        setContractDeployed(true);
      } catch (error: any) {
        console.error("Error initializing contract:", error);
        setDeploymentError(error.message || "Failed to deploy contract");
      } finally {
        setIsDeploying(false);
      }
    };

    initializeContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  useEffect(() => {
    if (!contractDeployed) {
      return;
    }

    const newState = startNewHand(createInitialGameState(gameMode));
    // Store initial balances at the start of each hand
    initialBalancesRef.current = newState.players.map((p) => p.balance);
    setGameState(newState);
    setDealtCards(Array(5).fill(true));
    setShowNextHandButton(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractDeployed]);

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
      if (isProcessing || isActionInProgressRef.current) {
        console.log("[PokerGame] Action blocked - already in progress");
        return;
      }
      isActionInProgressRef.current = true;
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

      // Check if betting round is complete BEFORE advancing
      // Store result to avoid checking again after advanceToNextRound resets playersToActInRound
      console.log("handlebotturn")
      const bettingRoundComplete = isBettingRoundComplete(newState);

      if (bettingRoundComplete) {
        newState = advanceToNextRound(newState);
      } else {
        const nextIndex = getNextActivePlayerIndex(newState);
        console.log("nextIndex", nextIndex);
        if (nextIndex >= 0) {
          newState.currentTurnIndex = nextIndex;
        } else {
          // If no next player found, round must be complete
          newState = advanceToNextRound(newState);
        }
      }

      setGameState(newState);
      setIsProcessing(false);
      isActionInProgressRef.current = false;
    };

    handleBotTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentTurnIndex, gameState.currentRound, gameState.isHandComplete, isProcessing]);

  const handlePlayerAction = useCallback(
    (action: "fold" | "check" | "call" | "raise", raiseAmount?: number) => {
      // Prevent double execution
      if (isProcessing || isActionInProgressRef.current) {
        console.log("[PokerGame] Action blocked - already in progress");
        return;
      }

      // Set flag immediately to prevent concurrent executions
      isActionInProgressRef.current = true;

      try {
        const humanPlayerIndex = gameState.players.findIndex((p) => p.isHuman);
        if (humanPlayerIndex === -1) {
          isActionInProgressRef.current = false;
          return;
        }

        let newState = processPlayerAction(gameState, humanPlayerIndex, action, raiseAmount);

        // Check if betting round is complete BEFORE advancing
        // Store result to avoid checking again after advanceToNextRound resets playersToActInRound
        console.log("handleplayeraction")
        const bettingRoundComplete = isBettingRoundComplete(newState);

        if (bettingRoundComplete) {
          newState = advanceToNextRound(newState);
        } else {
          const nextIndex = getNextActivePlayerIndex(newState);
          if (nextIndex >= 0) {
            newState.currentTurnIndex = nextIndex;
          } else {
            // If no next player found, round must be complete
            newState = advanceToNextRound(newState);
          }
        }

        setGameState(newState);
        isActionInProgressRef.current = false;
        setIsProcessing(false);
      } finally {
        // Reset flag after state update
        // Use setTimeout to ensure state update completes first
        setTimeout(() => {
          isActionInProgressRef.current = false;
        }, 0);
      }
    },
    [gameState, isProcessing]
  );

  const handleNextHand = useCallback(() => {
    const newState = startNewHand(gameState);
    // Store initial balances at the start of each hand
    initialBalancesRef.current = newState.players.map((p) => p.balance);
    setGameState(newState);
    setDealtCards(Array(5).fill(true));
    setShowNextHandButton(false);
  }, [gameState]);

  // Call calculate_winners when we reach showdown (before determining winners locally)
  useEffect(() => {
    const calculateWinnersOnContract = async () => {
      // Trigger when we reach showdown, not when isHandComplete (which happens after contract calculation)
      if (!contract || gameState.currentRound !== "showdown" || !contractDeployed) {
        return;
      }

      // Prevent multiple calls
      if (isResolvingOnChain) {
        return;
      }

      console.log("[PokerGame] Hand complete, calculating winners on contract...");
      setIsResolvingOnChain(true);
      try {
        // Prepare player hands in contract format
        console.log("[PokerGame] Preparing player hands and board cards...");
        const playerHands = gameState.players.map((player) => {
          if (player.folded || !player.inGame) {
            return ""; // Empty string for folded players
          }
          return cardsToString(player.hand);
        });

        // Prepare board cards
        const boardCards = cardsToString(gameState.communityCards);

        // Prepare player bets (total amount each player bet in this hand)
        // The initial balance is saved AFTER blinds are posted, so we need to account for that
        // Total bet = (initial balance - current balance) + currentBet
        // The currentBet represents the bet in the current round that may not be fully reflected
        const playerBets = gameState.players.map((player, index) => {
          if (player.folded || !player.inGame) {
            console.log(`[PokerGame] Player ${index} is folded or not in game, returning 0`);
            return 0;
          }

          // Get initial balance (saved after blinds, so it already accounts for blinds)
          const initialBalance = initialBalancesRef.current[index];
          if (initialBalance === undefined) {
            // Fallback: use currentBet as estimate
            console.warn(`[PokerGame] No initial balance for player ${index}, using currentBet`);
            return player.currentBet || 0;
          }

          // Calculate balance difference (what they've bet so far)
          console.log("[PokerGame] Balance of player", index, ":", player.balance);
          console.log("[PokerGame] Initial balance of player", index, ":", initialBalance);
          console.log("[PokerGame] player.currentBet:", player.currentBet);
          const balanceDifference = initialBalance - player.balance;

          // Add currentBet to capture the full bet amount
          // currentBet represents the bet in the current/last round
          // This ensures we capture all bets including the final round
          const totalBet = balanceDifference + (player.currentBet || 0);

          return Math.max(0, totalBet);
        });

        // Debug: Log initial balances and curdetermineWinnersrent balances to understand the calculation
        console.log("[PokerGame] Bet calculation details:", {
          initialBalances: initialBalancesRef.current,
          currentBalances: gameState.players.map((p) => p.balance),
          currentBets: gameState.players.map((p) => p.currentBet),
          calculatedBets: playerBets,
          pot: gameState.pot,
        });

        console.log("[PokerGame] Calling calculate_winners on contract...");
        console.log("[PokerGame] Input data to calculate_winners:", {
          players: playerHands,
          boardCards: boardCards,
          playerBets: playerBets,
          playersCount: playerHands.length,
          boardCardsLength: boardCards.length,
          totalBets: playerBets.reduce((a, b) => a + b, 0),
          playerBetsDetail: playerBets.map((bet, idx) => ({
            playerIndex: idx,
            bet: bet,
            playerName: gameState.players[idx]?.name || `Player ${idx}`,
            folded: gameState.players[idx]?.folded || false,
          })),
        });
        // Call calculate_winners
        const result = await contract.calculateWinners(playerHands, boardCards, playerBets);

        console.log("[PokerGame] Winners calculated, updating game state...");
        console.log("[PokerGame] Result:", result);

        // Get last winner info to determine winners
        console.log("[PokerGame] Getting last winner info...");
        const lastWinner = await contract.getLastWinner();
        console.log(
          "[PokerGame] Last winner info retrieved, winner index:",
          lastWinner.hand_winner_index
        );

        // Update game state with contract results and determine winners
        setGameState((prevState) => {
          let updated = { ...prevState };

          // Update balances from contract
          if (
            Array.isArray(result.player_balances) &&
            result.player_balances.length === updated.players.length
          ) {
            updated.players = updated.players.map((player, index) => ({
              ...player,
              balance: result.player_balances[index],
            }));
          }

          // Now determine winners based on contract result
          // Use determineWinners to set winners array and mark hand as complete
          // Skip pot distribution since contract already did it
          updated = determineWinners(updated, true);
          updated.currentBet = 0;
          updated.players.forEach((p) => {
            p.currentBet = 0;
          });

          // Override winners with contract result if available
          if (lastWinner.hand_winner_index !== undefined && lastWinner.hand_winner_index !== null) {
            if (lastWinner.hand_winner_index === 999999) {
              // Tie - use tie_players from contract
              if (Array.isArray(lastWinner.tie_players) && lastWinner.tie_players.length > 0) {
                updated.winners = lastWinner.tie_players;
              }
            } else if (lastWinner.hand_winner_index >= 0) {
              // Single winner
              updated.winners = [updated.players[lastWinner.hand_winner_index]?.id].filter(Boolean);
            }
          }

          return updated;
        });

        setLastWinnerIndex(
          typeof lastWinner?.hand_winner_index === "number" ? lastWinner.hand_winner_index : null
        );
      } catch (error: any) {
        console.error("Error calculating winners on contract:", error);
      } finally {
        setIsResolvingOnChain(false);
      }
    };

    calculateWinnersOnContract();
  }, [
    contract,
    gameState.currentRound,
    gameState.players,
    gameState.communityCards,
    contractDeployed,
    gameState.isHandComplete,
  ]);

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

  if (isDeploying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/90 max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <h2 className="text-xl font-bold">Deploying Contract...</h2>
              <p className="text-sm text-gray-600 text-center">
                Please wait while we deploy the tournament contract and set up the game.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (deploymentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/90 max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>
                <h2 className="text-xl font-bold mb-2">Deployment Error</h2>
                <p>{deploymentError}</p>
                <Button onClick={handleExit} className="mt-4">
                  Go Back
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      <div className="p-2 md:p-4 flex justify-between items-center flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-bold text-white">Poker Game</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExit} className="text-white text-sm">
            Exit Game
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center min-h-0 overflow-hidden pt-2">
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
                {isResolvingOnChain ? (
                  <div className="flex items-center justify-center gap-3 text-gray-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Resolving on-chain...</span>
                  </div>
                ) : (
                  <>
                    {gameState.winners.length > 0 && (
                      <div>
                        <p className="text-lg mb-2">Winners:</p>
                        {gameState.winners.map((winnerId) => {
                          const winner = gameState.players.find((p) => p.id === winnerId);
                          return (
                            <p key={winnerId} className="font-semibold text-green-600">
                              {winner?.name} won $
                              {Math.floor(gameState.pot / gameState.winners.length)}
                            </p>
                          );
                        })}
                      </div>
                    )}
                    {lastWinnerIndex !== null &&
                      lastWinnerIndex !== 999999 &&
                      lastWinnerIndex >= 0 && (
                        <div>
                          <p className="text-lg mb-2">On-chain Winner:</p>
                          <p className="font-semibold text-blue-600">
                            {gameState.players[lastWinnerIndex]?.name ??
                              `Player ${lastWinnerIndex}`}
                          </p>
                        </div>
                      )}
                    {lastWinnerIndex === 999999 && (
                      <div>
                        <p className="text-lg mb-2">On-chain Result:</p>
                        <p className="font-semibold text-blue-600">Tie</p>
                      </div>
                    )}
                    <Button onClick={handleNextHand} className="w-full">
                      Next Hand
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isHumanTurn && humanPlayer && (
        <div className="p-2 md:p-4 pb-4 flex-shrink-0">
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
        <div className="p-2 md:p-4 text-center text-white flex-shrink-0">
          <p>Waiting for other players...</p>
          <p className="text-sm text-gray-400">
            {gameState.players[gameState.currentTurnIndex]?.name} is thinking...
          </p>
        </div>
      )}

      <div className="p-2 md:p-4 text-white text-xs md:text-sm flex-shrink-0 flex justify-end">
        <p>
          Round: {roundLabels[gameState.currentRound]} | Hand #{gameState.handNumber} | Mode:{" "}
          {gameState.gameMode}
        </p>
      </div>
    </div>
  );
};
