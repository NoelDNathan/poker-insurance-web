"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PokerCoolerInsurance, type InsurancePolicy } from "@/lib/PokerCoolerInsurance";
import type { Address } from "viem";
import { useAccount } from "@/lib/AccountContext";
import {
  Loader2,
  Calendar,
  Users,
  Trophy,
  Shield,
  CheckCircle2,
  XCircle,
  Coins,
  Play,
} from "lucide-react";
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
  guaranteedPrizePool?: number;
}

// Helper function to get future dates
const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

// Helper function to get today's date
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

const initialTournaments: Tournament[] = [
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
    date: getFutureDate(7), // 7 days from now
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
    date: getFutureDate(14), // 14 days from now
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
    date: getFutureDate(30), // 30 days from now
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
    date: getFutureDate(21), // 21 days from now
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
    date: getFutureDate(45), // 45 days from now
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
    date: getFutureDate(60), // 60 days from now
    status: "upcoming",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 250,
    premium: 25,
    payout: 125,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
  {
    id: "tournament-011",
    name: "Daily Tournament",
    date: getTodayDate(), // Today
    status: "upcoming",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 50,
    premium: 5,
    payout: 25,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
  {
    id: "tournament-012",
    name: "Evening Showdown",
    date: getTodayDate(), // Today
    status: "upcoming",
    isRegistered: true,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 100,
    premium: 10,
    payout: 50,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
  {
    id: "tournament-013",
    name: "Quick Fire Tournament",
    date: getTodayDate(), // Today
    status: "upcoming",
    isRegistered: false,
    tournamentUrl: "http://localhost:8000/tournament_example.html",
    buyIn: 75,
    premium: 7.5,
    payout: 37.5,
    format: "No-Limit Hold'em",
    totalPlayers: 0,
  },
];

export function TournamentDetails() {
  const router = useRouter();
  const { account, accountAddress, addBalance } = useAccount();
  const [tournamentUrl, setTournamentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [tournamentInfo, setTournamentInfo] = useState<{
    tournament_buy_in: bigint;
    insurance_premium: bigint;
    payout_amount: bigint;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [policies, setPolicies] = useState<Record<string, InsurancePolicy>>({});
  const [, setLoadingPolicies] = useState(false);
  const [claimingPolicyId, setClaimingPolicyId] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);

  // Filter states - using strings for Select (single selection or "all")
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [registrationFilter, setRegistrationFilter] = useState<string>("all");
  const [insuranceFilter, setInsuranceFilter] = useState<string>("all");

  // Derived boolean states for filtering logic
  const showFinished = statusFilter === "all" || statusFilter === "finished";
  const showUpcoming = statusFilter === "all" || statusFilter === "upcoming";
  const showRegistered = registrationFilter === "all" || registrationFilter === "registered";
  const showNotRegistered = registrationFilter === "all" || registrationFilter === "not-registered";
  const showInsured = insuranceFilter === "all" || insuranceFilter === "insured";
  const showNotInsured = insuranceFilter === "all" || insuranceFilter === "not-insured";

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  const getDefaultMockPolicies = useCallback(
    (playerAddress: string | null): Record<string, InsurancePolicy> => {
      // Policy 1: Tournament that finished, lost by cooler, can claim
      const finishedTournament = tournaments.find((t) => t.id === "tournament-001");
      const policy1: InsurancePolicy = {
        id: "policy-001",
        player_address: (playerAddress || "0x0000000000000000000000000000000000000000") as Address,
        tournament_id: "tournament-001",
        tournament_url:
          finishedTournament?.tournamentUrl || "http://localhost:8000/tournament_example.html",
        player_id: "player123",
        tournament_buy_in: BigInt(finishedTournament?.buyIn || 100),
        premium_paid: BigInt(finishedTournament?.premium || 10),
        has_claimed: false,
        claim_resolved: false,
        is_valid_cooler: true, // Lost by cooler, can claim
        payout_amount: BigInt(finishedTournament?.payout || 50),
        registration_date: "2024-01-10",
      };

      // Policy 2: Upcoming tournament, insurance active but tournament not played yet
      const upcomingTournament = tournaments.find((t) => t.id === "tournament-003");
      const policy2: InsurancePolicy = {
        id: "policy-002",
        player_address: (playerAddress || "0x0000000000000000000000000000000000000000") as Address,
        tournament_id: "tournament-003",
        tournament_url:
          upcomingTournament?.tournamentUrl || "http://localhost:8000/tournament_example.html",
        player_id: "player123",
        tournament_buy_in: BigInt(upcomingTournament?.buyIn || 500),
        premium_paid: BigInt(upcomingTournament?.premium || 50),
        has_claimed: false,
        claim_resolved: false,
        is_valid_cooler: false, // Tournament not played yet
        payout_amount: BigInt(upcomingTournament?.payout || 250),
        registration_date: "2024-05-01",
      };

      return {
        "policy-001": policy1,
        "policy-002": policy2,
      };
    },
    [tournaments]
  );

  const loadPolicies = useCallback(async () => {
    setLoadingPolicies(true);
    try {
      if (account && accountAddress) {
        // Try to load real policies
        const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
        const playerPolicies = await contract.getPlayerPolicies(accountAddress);

        // If there are real policies, use them; otherwise use mock policies
        if (Object.keys(playerPolicies).length > 0) {
          setPolicies(playerPolicies);
        } else {
          // No real policies, use default mock policies
          setPolicies(getDefaultMockPolicies(accountAddress));
        }
      } else {
        // No account connected, use default mock policies for demo
        setPolicies(getDefaultMockPolicies(null));
      }
    } catch (err: unknown) {
      console.error("Failed to load policies:", err);
      // On error, use default mock policies
      setPolicies(getDefaultMockPolicies(accountAddress));
    } finally {
      setLoadingPolicies(false);
    }
  }, [account, accountAddress, contractAddress, studioUrl, getDefaultMockPolicies]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  // Function to update tournament registration status
  const updateTournamentRegistration = (tournamentId: string, isRegistered: boolean) => {
    setTournaments((prevTournaments) =>
      prevTournaments.map((tournament) =>
        tournament.id === tournamentId ? { ...tournament, isRegistered } : tournament
      )
    );
  };

  const hasInsuranceForTournament = (tournament: Tournament): boolean => {
    if (!policies || Object.keys(policies).length === 0) return false;

    // Only check by tournament_id since all tournaments share the same URL
    return Object.values(policies).some((policy) => {
      return policy.tournament_id === tournament.id;
    });
  };

  const getClaimablePolicyForTournament = (tournament: Tournament): InsurancePolicy | null => {
    if (!policies || Object.keys(policies).length === 0) return null;

    const policy = Object.values(policies).find((policy) => {
      return (
        policy.tournament_id === tournament.id && policy.is_valid_cooler && !policy.has_claimed
      );
    });

    return policy || null;
  };

  const handleClaimInsurance = async (e: React.MouseEvent, tournament: Tournament) => {
    e.stopPropagation(); // Prevent opening the dialog

    if (!account) {
      setError("Please connect an account first");
      return;
    }

    const policy = getClaimablePolicyForTournament(tournament);
    if (!policy) {
      setError("No claimable policy found for this tournament");
      return;
    }

    setClaimingPolicyId(policy.id);
    setError(null);
    setClaimSuccess(null);

    try {
      const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
      await contract.fileClaim(policy.id);

      // Add payout to balance
      const payoutAmount = Number(policy.payout_amount);
      addBalance(payoutAmount);

      // Update policy status in local state immediately
      setPolicies((prevPolicies) => {
        const updatedPolicies = { ...prevPolicies };
        if (updatedPolicies[policy.id]) {
          updatedPolicies[policy.id] = {
            ...updatedPolicies[policy.id],
            has_claimed: true,
            claim_resolved: true,
          };
        }
        return updatedPolicies;
      });

      // Reload policies to get latest state from contract
      await loadPolicies();

      // Show success message
      setClaimSuccess(`Successfully claimed ${payoutAmount} tokens!`);
      setError(null);

      // Clear success message after 5 seconds
      setTimeout(() => setClaimSuccess(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to file claim");
      setClaimSuccess(null);
    } finally {
      setClaimingPolicyId(null);
    }
  };

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch tournament information");
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    // Reload policies when dialog closes in case insurance was purchased
    if (!open) {
      loadPolicies();
      // Reset selected tournament
      setSelectedTournament(null);
    }
  };

  // Callback to update tournament when registration happens in dialog
  const handleTournamentRegistered = (tournamentId: string) => {
    updateTournamentRegistration(tournamentId, true);
    // Update the selected tournament to reflect the change immediately
    setSelectedTournament((prev) => {
      if (prev && prev.id === tournamentId) {
        return { ...prev, isRegistered: true };
      }
      return prev;
    });
  };

  // Callback to update tournament when insurance is purchased in dialog
  const handleInsurancePurchased = () => {
    // Reload policies to get the new insurance
    loadPolicies();
    // The UI will automatically update because hasInsuranceForTournament checks policies
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if tournament is today
  const isTournamentToday = (tournament: Tournament): boolean => {
    const today = getTodayDate();
    return tournament.date === today;
  };

  // Handle play button click
  const handlePlayTournament = (e: React.MouseEvent, tournament: Tournament) => {
    e.stopPropagation(); // Prevent opening the dialog
    router.push(`/play/${tournament.id}`);
  };

  const calculateGuaranteedPrizePool = (tournament: Tournament): number => {
    // If guaranteed prize pool is explicitly set, use it
    if (tournament.guaranteedPrizePool !== undefined) {
      return tournament.guaranteedPrizePool;
    }

    // Calculate based on registered players
    const currentPrizePool = tournament.totalPlayers * tournament.buyIn;

    // For upcoming tournaments with no players, use a minimum guarantee
    // based on a reasonable expected minimum (e.g., 50 players minimum)
    if (tournament.status === "upcoming" && currentPrizePool === 0) {
      return tournament.buyIn * 50; // Minimum guaranteed prize pool
    }

    return currentPrizePool;
  };

  // Filter and sort tournaments
  const filteredAndSortedTournaments = tournaments
    .filter((tournament) => {
      // Filter by status
      if (tournament.status === "finished" && !showFinished) return false;
      if (tournament.status === "upcoming" && !showUpcoming) return false;

      // Filter by registration status
      if (tournament.isRegistered && !showRegistered) return false;
      if (!tournament.isRegistered && !showNotRegistered) return false;

      // Filter by insurance status
      const hasInsurance = hasInsuranceForTournament(tournament);
      if (hasInsurance && !showInsured) return false;
      if (!hasInsurance && !showNotInsured) return false;

      return true;
    })
    .sort((a, b) => {
      // Sort by date (most recent first)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Info"}
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
            <CardDescription>Browse available tournaments and view details</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 space-y-4 pb-4 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Filter by Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Filter by Registration</label>
                  <Select value={registrationFilter} onValueChange={setRegistrationFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select registration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Registration</SelectItem>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="not-registered">Not Registered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Filter by Insurance</label>
                  <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select insurance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Insurance</SelectItem>
                      <SelectItem value="insured">Insured</SelectItem>
                      <SelectItem value="not-insured">Not Insured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredAndSortedTournaments.length} of {tournaments.length} tournaments
            </div>

            {claimSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">{claimSuccess}</span>
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">{error}</span>
                </div>
              </motion.div>
            )}
            <div className="space-y-3">
              {filteredAndSortedTournaments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tournaments match the selected filters.</p>
                  <p className="text-xs mt-2">Try adjusting your filter options.</p>
                </div>
              ) : (
                filteredAndSortedTournaments.map((tournament) => {
                  const claimablePolicy = getClaimablePolicyForTournament(tournament);
                  const isClaiming = claimingPolicyId === claimablePolicy?.id;

                  return (
                    <motion.div
                      key={tournament.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleTournamentClick(tournament)}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{tournament.name}</h3>
                            <Badge
                              variant={tournament.status === "finished" ? "secondary" : "default"}
                            >
                              {tournament.status === "finished" ? "Finished" : "Upcoming"}
                            </Badge>
                            <Badge variant={tournament.isRegistered ? "default" : "outline"}>
                              {tournament.isRegistered ? "Registered" : "Not Registered"}
                            </Badge>
                            {hasInsuranceForTournament(tournament) && (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                <Shield className="h-3 w-3 mr-1" />
                                Insured
                              </Badge>
                            )}
                            {claimablePolicy && (
                              <Badge
                                variant="default"
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Claimable
                              </Badge>
                            )}
                            {isTournamentToday(tournament) &&
                              tournament.status === "upcoming" &&
                              tournament.isRegistered && (
                                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                                  <Play className="h-3 w-3 mr-1" />
                                  Play Today
                                </Badge>
                              )}
                            {isTournamentToday(tournament) &&
                              tournament.status === "upcoming" &&
                              !tournament.isRegistered && (
                                <Badge
                                  variant="outline"
                                  className="border-orange-500 text-orange-600"
                                >
                                  Register to Play
                                </Badge>
                              )}
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
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              <span>
                                {calculateGuaranteedPrizePool(tournament).toLocaleString()} tokens
                                prize pool
                              </span>
                            </div>
                            {claimablePolicy && (
                              <div className="flex items-center gap-1 text-green-600 font-semibold">
                                <Shield className="h-4 w-4" />
                                <span>Claim {Number(claimablePolicy.payout_amount)} tokens</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isTournamentToday(tournament) &&
                            tournament.status === "upcoming" &&
                            tournament.isRegistered && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => handlePlayTournament(e, tournament)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Play
                              </Button>
                            )}
                          {isTournamentToday(tournament) &&
                            tournament.status === "upcoming" &&
                            !tournament.isRegistered && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTournamentClick(tournament)}
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              >
                                Register to Play
                              </Button>
                            )}
                          {claimablePolicy && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => handleClaimInsurance(e, tournament)}
                              disabled={isClaiming || !account}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isClaiming ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Claiming...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Claim
                                </>
                              )}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedTournament && (
        <TournamentDialog
          tournament={tournaments.find((t) => t.id === selectedTournament.id) || selectedTournament}
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onRegistered={() => handleTournamentRegistered(selectedTournament.id)}
          onInsurancePurchased={() => handleInsurancePurchased()}
        />
      )}
    </>
  );
}
