"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PokerCoolerInsurance } from "@/lib/PokerCoolerInsurance";
import { Loader2, Calendar, Users, Trophy } from "lucide-react";
import { TournamentDialog } from "./TournamentDialog";

export interface Tournament {
  id: string;
  name: string;
  date: string;
  status: "finished" | "upcoming";
  isRegistered: boolean;
  tournamentUrl: string;
  buyIn: number;
  premium: number;
  payout: number;
  format: string;
  totalPlayers: number;
}

const mockTournaments: Tournament[] = [
  {
    id: "tournament-001",
    name: "Winter Championship 2024",
    date: "2024-01-15",
    status: "finished",
    isRegistered: true,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 100,
    premium: 10,
    payout: 50,
    format: "No-Limit Hold'em",
    totalPlayers: 150,
  },
  {
    id: "tournament-002",
    name: "Spring Series Main Event",
    date: "2024-03-20",
    status: "upcoming",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 200,
    premium: 20,
    payout: 100,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
  {
    id: "tournament-003",
    name: "Summer High Roller",
    date: "2024-06-10",
    status: "upcoming",
    isRegistered: true,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 500,
    premium: 50,
    payout: 250,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
  {
    id: "tournament-004",
    name: "Autumn Classic",
    date: "2023-11-05",
    status: "finished",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 150,
    premium: 15,
    payout: 75,
    format: "No-Limit Hold'em",
    totalPlayers: 200,
  },
  {
    id: "tournament-005",
    name: "New Year's Tournament",
    date: "2024-12-31",
    status: "upcoming",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 75,
    premium: 7.5,
    payout: 37.5,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
  {
    id: "tournament-006",
    name: "February Freeze",
    date: "2024-02-14",
    status: "finished",
    isRegistered: true,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 120,
    premium: 12,
    payout: 60,
    format: "No-Limit Hold'em",
    totalPlayers: 180,
  },
  {
    id: "tournament-007",
    name: "April Showers",
    date: "2024-04-22",
    status: "upcoming",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 80,
    premium: 8,
    payout: 40,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
  {
    id: "tournament-008",
    name: "May Madness",
    date: "2024-05-15",
    status: "upcoming",
    isRegistered: true,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 300,
    premium: 30,
    payout: 150,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
  {
    id: "tournament-009",
    name: "July Jamboree",
    date: "2023-07-04",
    status: "finished",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 90,
    premium: 9,
    payout: 45,
    format: "No-Limit Hold'em",
    totalPlayers: 175,
  },
  {
    id: "tournament-010",
    name: "October Open",
    date: "2024-10-15",
    status: "upcoming",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 250,
    premium: 25,
    payout: 125,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
];

export function TournamentDetails() {
  const [tournamentUrl, setTournamentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  const handleGetInfo = async () => {
    if (!tournamentUrl) {
      setError("Please enter a tournament URL");
      return;
    }

    setLoading(true);
    setError(null);
    setTournamentInfo(null);

    try {
      const contract = new PokerCoolerInsurance(contractAddress, null, studioUrl);
      const info = await contract.getTournamentInfo(tournamentUrl);
      setTournamentInfo(info);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tournament information");
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Tournament Search</CardTitle>
            <CardDescription>
              Enter a tournament URL to view buy-in, premium, and payout information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tournamentUrl}
                onChange={(e) => setTournamentUrl(e.target.value)}
                placeholder="http://localhost:8000/tournament_example.html"
                onKeyDown={(e) => e.key === "Enter" && handleGetInfo()}
              />
              <Button onClick={handleGetInfo} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Get Info"
                )}
              </Button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {tournamentInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border bg-muted p-4 space-y-2"
              >
                <h4 className="font-semibold text-lg">Tournament Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Buy-in</p>
                    <p className="text-2xl font-bold">
                      {Number(tournamentInfo.tournament_buy_in)} tokens
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Insurance Premium</p>
                    <p className="text-2xl font-bold">
                      {Number(tournamentInfo.insurance_premium)} tokens
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payout Amount</p>
                    <p className="text-2xl font-bold">
                      {Number(tournamentInfo.payout_amount)} tokens
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tournament List</CardTitle>
            <CardDescription>
              Browse available tournaments and view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTournaments.map((tournament) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleTournamentClick(tournament)}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{tournament.name}</h3>
                        <Badge
                          variant={
                            tournament.status === "finished"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {tournament.status === "finished" ? "Finished" : "Upcoming"}
                        </Badge>
                        <Badge
                          variant={tournament.isRegistered ? "default" : "outline"}
                        >
                          {tournament.isRegistered ? "Registered" : "Not Registered"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(tournament.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span>{tournament.buyIn} tokens buy-in</span>
                        </div>
                        {tournament.status === "finished" && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{tournament.totalPlayers} players</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedTournament && (
        <TournamentDialog
          tournament={selectedTournament}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}




