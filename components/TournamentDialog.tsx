"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PokerCoolerInsurance } from "@/lib/PokerCoolerInsurance";
import { PokerTournament } from "@/lib/PokerTournament";
import { generateRandomAddress } from "@/lib/utils";
import { useAccount } from "@/lib/AccountContext";
import { Tournament } from "./TournamentDetails";
import {
  Loader2,
  Calendar,
  Trophy,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Play,
} from "lucide-react";

interface TournamentDialogProps {
  tournament: Tournament;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered?: (tournamentId: string, contractAddress?: string) => void;
  onInsurancePurchased?: (tournamentId: string) => void;
  tournamentContractAddress?: string | null;
}

export function TournamentDialog({
  tournament,
  open,
  onOpenChange,
  onRegistered,
  onInsurancePurchased,
  tournamentContractAddress,
}: TournamentDialogProps) {
  const { account, accountAddress, subtractBalance } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPurchasingInsurance, setIsPurchasingInsurance] = useState(false);
  const [showInsurancePrompt, setShowInsurancePrompt] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  // Generate automatic values for insurance purchase
  const getAutoPlayerId = (): string => {
    // Use accountAddress as playerId (Option 2)
    return accountAddress || "";
  };

  const getAutoRegistrationDate = (): string => {
    // Use current date in YYYY-MM-DD format
    return new Date().toISOString().split("T")[0];
  };

  // Check if tournament is today
  const isTournamentToday = (): boolean => {
    const today = new Date().toISOString().split("T")[0];
    return tournament.date === today;
  };

  // Handle play button click (placeholder for future functionality)
  const handlePlayTournament = () => {
    // TODO: Implement tournament play functionality
    console.log("Play tournament:", tournament.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleRegister = async () => {
    if (!account) {
      setError("Please connect an account first");
      return;
    }

    setIsRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      let contractAddress = tournamentContractAddress;

      // If tournament doesn't have a contract yet, deploy a new one
      if (!contractAddress) {
        console.log("[TournamentDialog] Deploying new contract for tournament:", tournament.id);

        // Fetch contract code from API
        const response = await fetch("/api/contract");
        if (!response.ok) {
          throw new Error("Failed to fetch contract code");
        }
        const { code } = await response.json();

        // Convert base64 to Uint8Array
        const binaryString = atob(code);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const contractCode = bytes;

        // Deploy contract
        const tournamentContract = new PokerTournament(null, account, studioUrl);
        contractAddress = await tournamentContract.deployContract(contractCode);
        tournamentContract.setContractAddress(contractAddress);

        console.log(
          "[TournamentDialog] Contract deployed for tournament:",
          tournament.id,
          "at address:",
          contractAddress
        );

        // Set players after deployment
        const botAddresses = Array.from({ length: 2 }, () => generateRandomAddress());
        let userAddress = accountAddress || "";
        if (!userAddress && account) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const accountAny = account as any;
          if (accountAny.address) {
            userAddress =
              typeof accountAny.address === "string" ? accountAny.address : accountAny.address();
          }
        }

        if (!userAddress) {
          throw new Error("Could not get user address from account");
        }

        const balances = Array(3).fill(1000);
        const addresses = [userAddress, ...botAddresses];
        await tournamentContract.setPlayers(balances, addresses);
        console.log("[TournamentDialog] Players set for tournament:", tournament.id);
      }

      // Subtract buy-in from balance
      subtractBalance(tournament.buyIn);
      setSuccess(
        `Successfully registered for the tournament! ${tournament.buyIn} tokens deducted.`
      );
      // Notify parent component to update tournament registration status and pass contract address
      if (onRegistered) {
        onRegistered(tournament.id, contractAddress || undefined);
      }
      // Show insurance prompt dialog
      setShowInsurancePrompt(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register for tournament");
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePurchaseInsurance = async () => {
    if (!account || !accountAddress) {
      setError("Please connect an account first");
      return;
    }

    if (!tournamentContractAddress) {
      setError(
        "Tournament contract address is not available. Please wait for contract deployment."
      );
      return;
    }

    setIsPurchasingInsurance(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate automatic values
      const registrationDate = getAutoRegistrationDate();

      const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
      const txHash = await contract.purchaseInsurance(
        tournamentContractAddress,
        registrationDate,
        accountAddress
      );
      // Subtract premium from balance
      subtractBalance(tournament.premium);
      setSuccess(
        `Insurance purchased successfully! ${tournament.premium} tokens deducted. Transaction: ${txHash}`
      );
      // Close insurance prompt dialog
      setShowInsurancePrompt(false);
      // Notify parent component to reload policies
      if (onInsurancePurchased) {
        onInsurancePurchased(tournament.id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to purchase insurance");
    } finally {
      setIsPurchasingInsurance(false);
    }
  };

  const handleInsurancePromptYes = () => {
    setShowInsurancePrompt(false);
    // Automatically purchase insurance when user accepts prompt
    handlePurchaseInsurance();
  };

  const handleInsurancePromptNo = () => {
    setShowInsurancePrompt(false);
  };

  return (
    <>
      {/* Insurance Prompt Dialog */}
      <Dialog open={showInsurancePrompt} onOpenChange={setShowInsurancePrompt}>
        <DialogContent className="max-w-md !bg-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <DialogTitle>Purchase Insurance?</DialogTitle>
            </div>
            <DialogDescription>
              Would you like to purchase cooler insurance for this tournament?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border bg-muted/50 p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Premium:</span>
                  <span className="font-semibold">{tournament.premium} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payout if eliminated by cooler:</span>
                  <span className="font-semibold">{tournament.payout} tokens</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Protect yourself against cooler eliminations. If you get eliminated by a cooler,
              you&apos;ll receive {tournament.payout} tokens as compensation.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleInsurancePromptNo}>
              Not Now
            </Button>
            <Button onClick={handleInsurancePromptYes} className="bg-primary">
              Yes, Purchase Insurance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Tournament Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !bg-white">
          <DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-2xl flex-1">{tournament.name}</DialogTitle>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge variant={tournament.status === "finished" ? "secondary" : "default"}>
                    {tournament.status === "finished" ? "Finished" : "Upcoming"}
                  </Badge>
                  <Badge variant={tournament.isRegistered ? "default" : "outline"}>
                    {tournament.isRegistered ? "Registered" : "Not Registered"}
                  </Badge>
                </div>
              </div>
              <DialogDescription>
                View tournament details, register, or purchase insurance
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tournament Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tournament Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">{formatDate(tournament.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <Trophy className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Format</p>
                    <p className="font-medium">{tournament.format}</p>
                  </div>
                </div>
                {tournament.status === "finished" && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Total Players</p>
                      <p className="font-medium">{tournament.totalPlayers}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border bg-muted/50 p-5">
                <h4 className="font-semibold mb-4 text-base">Financial Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-background">
                    <p className="text-sm text-muted-foreground mb-2">Buy-in</p>
                    <p className="text-2xl font-bold">{tournament.buyIn} tokens</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background">
                    <p className="text-sm text-muted-foreground mb-2">Insurance Premium</p>
                    <p className="text-2xl font-bold">{tournament.premium} tokens</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background">
                    <p className="text-sm text-muted-foreground mb-2">Payout Amount</p>
                    <p className="text-2xl font-bold">{tournament.payout} tokens</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Play Section - Only for tournaments today */}
            {tournament.status === "upcoming" && isTournamentToday() && (
              <div className="space-y-4 border-t pt-6">
                {tournament.isRegistered ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Play Tournament</h3>
                      <p className="text-sm text-muted-foreground">
                        This tournament is available to play today. Click Play to start.
                      </p>
                    </div>
                    <Button
                      onClick={handlePlayTournament}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </Button>
                  </div>
                ) : (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Registration Required</AlertTitle>
                    <AlertDescription>
                      You need to register for this tournament before you can play. Register now to
                      join today&apos;s tournament!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Registration Section */}
            {tournament.status === "upcoming" && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Registration</h3>
                    <p className="text-sm text-muted-foreground">
                      {tournament.isRegistered
                        ? "You are already registered for this tournament"
                        : "Register to participate in this tournament"}
                    </p>
                  </div>
                  {!tournament.isRegistered && (
                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering || !account}
                      className="w-full sm:w-auto"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Insurance Purchase Section */}
            {tournament.status === "upcoming" && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Cooler Insurance</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Protect yourself against cooler eliminations. If you get eliminated by a cooler,
                  you&apos;ll receive {tournament.payout} tokens as compensation.
                </p>

                {!account && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Account Required</AlertTitle>
                    <AlertDescription>
                      Please connect an account to purchase insurance
                    </AlertDescription>
                  </Alert>
                )}

                {account && (
                  <div className="space-y-4">
                    <Button
                      onClick={handlePurchaseInsurance}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isPurchasingInsurance || !accountAddress}
                    >
                      {isPurchasingInsurance ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Purchase Insurance ({tournament.premium} tokens)
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Player ID and registration date will be automatically generated from your
                      account
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error and Success Messages */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
