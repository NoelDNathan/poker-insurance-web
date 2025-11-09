"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PokerCoolerInsurance, type InsurancePolicy } from "@/lib/PokerCoolerInsurance";
import { useAccount } from "@/lib/AccountContext";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";

export function ClaimForm() {
  const { account, accountAddress, addBalance } = useAccount();
  const [policyId, setPolicyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [policies, setPolicies] = useState<Record<string, InsurancePolicy>>({});
  const [loadingPolicies, setLoadingPolicies] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  const getDefaultMockPolicies = (): Record<string, InsurancePolicy> => {
    // Policy 1: Tournament that finished, lost by cooler, can claim
    const policy1: InsurancePolicy = {
      id: "policy-001",
      player_address: (accountAddress || "0x0000000000000000000000000000000000000000") as any,
      tournament_id: "tournament-001",
      tournament_url: "http://localhost:8000/tournament_example.html",
      player_id: "player123",
      tournament_buy_in: BigInt(100),
      premium_paid: BigInt(10),
      has_claimed: false,
      claim_resolved: false,
      is_valid_cooler: true, // Lost by cooler, can claim
      payout_amount: BigInt(50),
      registration_date: "2024-01-10",
    };

    // Policy 2: Upcoming tournament, insurance active but tournament not played yet
    const policy2: InsurancePolicy = {
      id: "policy-002",
      player_address: (accountAddress || "0x0000000000000000000000000000000000000000") as any,
      tournament_id: "tournament-003",
      tournament_url: "http://localhost:8000/tournament_example.html",
      player_id: "player123",
      tournament_buy_in: BigInt(500),
      premium_paid: BigInt(50),
      has_claimed: false,
      claim_resolved: false,
      is_valid_cooler: false, // Tournament not played yet
      payout_amount: BigInt(250),
      registration_date: "2024-05-01",
    };

    return {
      "policy-001": policy1,
      "policy-002": policy2,
    };
  };

  const loadPolicies = async () => {
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
          setPolicies(getDefaultMockPolicies());
        }
      } else {
        // No account connected, use default mock policies for demo
        setPolicies(getDefaultMockPolicies());
      }
    } catch (err: any) {
      console.error("Failed to load policies:", err);
      // On error, use default mock policies
      setPolicies(getDefaultMockPolicies());
    } finally {
      setLoadingPolicies(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [account, accountAddress]);

  // Get claimable policies (finished tournaments with valid cooler, not yet claimed)
  const claimablePolicies = Object.values(policies).filter(
    (policy) => policy.is_valid_cooler && !policy.has_claimed
  );

  const handleFileClaim = async (policyIdToClaim: string) => {
    if (!account) {
      setError("Please connect an account first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
      const txHash = await contract.fileClaim(policyIdToClaim);
      
      // Get the policy to add payout to balance
      const policy = policies[policyIdToClaim];
      if (policy) {
        addBalance(Number(policy.payout_amount));
      }
      
      setSuccess(`Claim filed successfully! You received ${policy ? Number(policy.payout_amount) : 0} tokens. Transaction: ${txHash}`);
      
      // Reload policies to update status
      await loadPolicies();
    } catch (err: any) {
      setError(err.message || "Failed to file claim");
    } finally {
      setLoading(false);
    }
  };

  const handleManualClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setError("Please connect an account first");
      return;
    }

    if (!policyId) {
      setError("Please enter a policy ID");
      return;
    }

    await handleFileClaim(policyId);
    setPolicyId("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>File Claim</CardTitle>
          <CardDescription>
            File a claim for your insurance policy if you were eliminated by a cooler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Claimable Policies Section */}
          {account && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Claimable Policies</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These are policies for tournaments where you lost by a cooler and can claim your payout.
                </p>
              </div>

              {loadingPolicies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : claimablePolicies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No claimable policies found</p>
                  <p className="text-xs mt-2">Policies become claimable after a tournament ends if you lost by a cooler</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claimablePolicies.map((policy) => (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{policy.tournament_id}</h4>
                          <p className="text-sm text-muted-foreground">
                            Policy ID: {policy.id}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Claimable
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Payout Amount</p>
                          <p className="font-semibold text-lg text-green-600">
                            {Number(policy.payout_amount)} tokens
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Buy-in</p>
                          <p className="font-medium">{Number(policy.tournament_buy_in)} tokens</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleFileClaim(policy.id)}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Claim {Number(policy.payout_amount)} tokens
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual Claim Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-2">Manual Claim</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a policy ID manually to file a claim
            </p>
            <form onSubmit={handleManualClaim} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="policyId" className="text-sm font-medium">
                  Policy ID
                </label>
                <Input
                  id="policyId"
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  placeholder="policy-001"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !account}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "File Claim"
                )}
              </Button>

              {!account && (
                <p className="text-sm text-muted-foreground text-center">
                  Please connect an account to file a claim
                </p>
              )}
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}




