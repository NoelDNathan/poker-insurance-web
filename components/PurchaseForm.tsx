"use client";

import { useState, useEffect } from "react";
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
  // Try to get deployed contract address from localStorage
  const defaultTournamentAddress =
    typeof window !== "undefined"
      ? localStorage.getItem("poker_tournament_contract_address") || ""
      : "";
  const [tournamentAddress, setTournamentAddress] = useState(defaultTournamentAddress);
  const [registrationDate, setRegistrationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  // Update tournament address when localStorage changes
  useEffect(() => {
    const storedAddress = localStorage.getItem("poker_tournament_contract_address");
    if (storedAddress && !tournamentAddress) {
      setTournamentAddress(storedAddress);
    }
  }, [tournamentAddress]);

  const handleGetTournamentInfo = async () => {
    if (!tournamentAddress) {
      setError("Please enter a tournament contract address");
      return;
    }

    setLoadingInfo(true);
    setError(null);
    setTournamentInfo(null);

    try {
      // Note: getTournamentInfo might need to be updated to work with contract address
      // For now, we'll skip this or implement a different method
      setError("Tournament info lookup by address not yet implemented");
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
      setError(
        "Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local file."
      );
      return;
    }

    if (!tournamentAddress || !registrationDate || !accountAddress) {
      setError("Please fill in all fields and ensure account is connected");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
      const txHash = await contract.purchaseInsurance(
        tournamentAddress,
        registrationDate,
        accountAddress
      );
      // Subtract premium from balance (if tournamentInfo is available)
      const premium = tournamentInfo ? Number(tournamentInfo.insurance_premium) : 0;
      if (premium > 0) {
        subtractBalance(premium);
      }
      setSuccess(`Insurance purchased successfully! Transaction: ${txHash}`);
      // Reset form
      setTournamentAddress(defaultTournamentAddress);
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
          <CardDescription>Enter tournament details to purchase cooler insurance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePurchase} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="tournamentAddress" className="text-sm font-medium">
                Tournament Contract Address
              </label>
              <Input
                id="tournamentAddress"
                value={tournamentAddress}
                onChange={(e) => setTournamentAddress(e.target.value)}
                placeholder="0x..."
                required
              />
              {defaultTournamentAddress && (
                <p className="text-xs text-muted-foreground">
                  Using deployed contract address from localStorage
                </p>
              )}
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

            {accountAddress && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Player Address</label>
                <Input value={accountAddress} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Using connected account address</p>
              </div>
            )}

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
