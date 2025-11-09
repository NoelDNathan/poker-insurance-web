"use client";
import React, { useState } from "react";

interface BettingControlsProps {
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  currentBet: number;
  playerBet: number;
  playerBalance: number;
  isLoading: boolean;
}

export const BettingControls: React.FC<BettingControlsProps> = ({
  onFold,
  onCheck,
  onCall,
  onRaise,
  currentBet,
  playerBet,
  playerBalance,
  isLoading,
}) => {
  const [raiseAmount, setRaiseAmount] = useState("");
  const [showRaiseInput, setShowRaiseInput] = useState(true);

  const handleRaise = () => {
    const amount = parseFloat(raiseAmount);
    if (amount > currentBet && amount <= playerBalance + playerBet) {
      onRaise(amount);
      setRaiseAmount("");
      setShowRaiseInput(true);
    }
  };

  const callAmount = currentBet - playerBet;
  const canCheck = currentBet === playerBet;
  const canCall = currentBet > playerBet && playerBalance >= callAmount;
  const canRaise = playerBalance > 0 && currentBet < playerBalance + playerBet;

  return (
    <div className="rounded-lg p-6 shadow-lg max-w-md mx-auto bg-gradient-to-br from-white/70 via-violet-100/50 to-fuchsia-100/40 backdrop-blur-md border border-white/20">
      <h3 className="text-lg font-semibold mb-4 text-center">Your Turn</h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            {canCheck ? (
              <button
                onClick={onCheck}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
              >
                Check
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onFold}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Fold
                </button>
                <button
                  onClick={onCall}
                  disabled={isLoading || !canCall}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Call ${callAmount.toFixed(0)}
                </button>
              </div>
            )}
          </div>

          {canRaise && (
            <div className="flex-1 min-w-0">
              {!showRaiseInput ? (
                <button
                  onClick={() => setShowRaiseInput(true)}
                  disabled={isLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Raise
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={raiseAmount}
                      onChange={(e) => setRaiseAmount(e.target.value)}
                      placeholder="Raise amount"
                      className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-2 bg-white/80 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                      min={currentBet + 1}
                      max={playerBalance + playerBet}
                      step="1"
                    />
                    <button
                      onClick={handleRaise}
                      disabled={
                        isLoading ||
                        !raiseAmount ||
                        parseFloat(raiseAmount) <= currentBet ||
                        parseFloat(raiseAmount) > playerBalance + playerBet
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold whitespace-nowrap flex-shrink-0"
                    >
                      Raise
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
