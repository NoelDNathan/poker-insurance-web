"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PokerCoolerInsurance } from "@/lib/PokerCoolerInsurance";
import { useAccount } from "@/lib/AccountContext";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function PurchaseForm() {
  const { account, accountAddress, subtractBalance } = useAccount();
  const [tournamentId, setTournamentId] = useState("");
  const [tournamentUrl, setTournamentUrl] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  const handleGetTournamentInfo = async () => {
    if (!tournamentUrl) {
      setError("Please enter a tournament URL");
      return;
    }

    setLoadingInfo(true);
    setError(null);
    setTournamentInfo(null);

    try {
      const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
      const info = await contract.getTournamentInfo(tournamentUrl);
      setTournamentInfo(info);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tournament information");
    } finally {
      setLoadingInfo(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setError("Please connect an account first");
      return;
    }

    if (!contractAddress || contractAddress.trim() === "") {
      setError("Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local file.");
      return;
    }

    if (!tournamentId || !tournamentUrl || !playerId || !registrationDate) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
      const txHash = await contract.purchaseInsurance(
        tournamentId,
        tournamentUrl,
        playerId,
        registrationDate
      );
      // Subtract premium from balance
      const premium = tournamentInfo ? Number(tournamentInfo.insurance_premium) : 0;
      if (premium > 0) {
        subtractBalance(premium);
      }
      setSuccess(`Insurance purchased successfully! ${premium} tokens deducted. Transaction: ${txHash}`);
      // Reset form
      setTournamentId("");
      setTournamentUrl("");
      setPlayerId("");
      setRegistrationDate("");
      setTournamentInfo(null);
    } catch (err: any) {
      setError(err.message || "Failed to purchase insurance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Purchase Insurance</CardTitle>
          <CardDescription>
            Enter tournament details to purchase cooler insurance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePurchase} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="tournamentId" className="text-sm font-medium">
                Tournament ID
              </label>
              <Input
                id="tournamentId"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                placeholder="tournament123"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tournamentUrl" className="text-sm font-medium">
                Tournament URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="tournamentUrl"
                  value={tournamentUrl}
                  onChange={(e) => setTournamentUrl(e.target.value)}
                  placeholder="http://localhost:8000/tournament_example.html"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetTournamentInfo}
                  disabled={loadingInfo}
                >
                  {loadingInfo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Get Info"
                  )}
                </Button>
              </div>
            </div>

            {tournamentInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-lg border bg-muted p-4"
              >
                <h4 className="font-semibold mb-2">Tournament Information</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Buy-in:</strong> {Number(tournamentInfo.tournament_buy_in)} tokens
                  </p>
                  <p>
                    <strong>Premium:</strong> {Number(tournamentInfo.insurance_premium)} tokens
                  </p>
                  <p>
                    <strong>Payout:</strong> {Number(tournamentInfo.payout_amount)} tokens
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label htmlFor="playerId" className="text-sm font-medium">
                Player ID
              </label>
              <Input
                id="playerId"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="player123"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="registrationDate" className="text-sm font-medium">
                Registration Date
              </label>
              <Input
                id="registrationDate"
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !account}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Purchase Insurance"
              )}
            </Button>

            {!account && (
              <p className="text-sm text-muted-foreground text-center">
                Please connect an account to purchase insurance
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}




