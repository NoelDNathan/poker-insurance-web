"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Shield, Trophy } from "lucide-react";

export default function GameModeSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;

  const handleModeSelect = (mode: "normal" | "cooler" | "epic") => {
    router.push(`/play/${tournamentId}/game?mode=${mode}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight">Select Game Mode</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Choose how you want to play this tournament
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Play className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Play Normal</CardTitle>
              <CardDescription>
                Play with random card dealing. Standard poker gameplay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleModeSelect("normal")}>
                Play Normal
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Shield className="h-8 w-8 mb-2 text-orange-500" />
              <CardTitle>Loss by a Cooler</CardTitle>
              <CardDescription>
                Experience a cooler situation - you&apos;ll get a strong hand but lose to an even
                stronger one (first hand only).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => handleModeSelect("cooler")}
              >
                Play Cooler Mode
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Trophy className="h-8 w-8 mb-2 text-yellow-500" />
              <CardTitle>Win with an Epic Hand</CardTitle>
              <CardDescription>
                Get a premium hand like Royal Flush or Straight Flush and win big (first hand only).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={() => handleModeSelect("epic")}
              >
                Play Epic Mode
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
