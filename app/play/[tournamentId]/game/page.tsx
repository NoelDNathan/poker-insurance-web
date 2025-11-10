"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PokerGame } from "@/components/poker/PokerGame";
import { GameMode } from "@/lib/poker/gameState";

function GamePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tournamentId = params.tournamentId as string;
  const mode = (searchParams.get("mode") || "normal") as GameMode;

  if (!["normal", "cooler", "epic"].includes(mode)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Game Mode</h1>
          <p className="text-muted-foreground">Please select a valid game mode.</p>
        </div>
      </div>
    );
  }

  return <PokerGame tournamentId={tournamentId} gameMode={mode} />;
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </div>
      }
    >
      <GamePageContent />
    </Suspense>
  );
}
