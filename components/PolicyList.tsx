"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PokerCoolerInsurance, type InsurancePolicy } from "@/lib/PokerCoolerInsurance";
import { useAccount } from "@/lib/AccountContext";
import { Loader2, FileText } from "lucide-react";

export function PolicyList() {
  const { account, accountAddress } = useAccount();
  const [policies, setPolicies] = useState<Record<string, InsurancePolicy>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  const loadPolicies = async () => {
    if (!account || !accountAddress) {
      setPolicies({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
      const playerPolicies = await contract.getPlayerPolicies(accountAddress);
      setPolicies(playerPolicies);
    } catch (err: any) {
      setError(err.message || "Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [account, accountAddress]);

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Policies</CardTitle>
          <CardDescription>Connect an account to view your insurance policies</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const policyEntries = Object.entries(policies);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Policies</CardTitle>
              <CardDescription>
                View and manage your insurance policies
              </CardDescription>
            </div>
            <Button onClick={loadPolicies} variant="outline" size="sm" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-destructive mb-4">{error}</div>
          )}

          {loading && policyEntries.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : policyEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No policies found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {policyEntries.map(([policyId, policy], index) => (
                <motion.div
                  key={policyId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{policy.tournament_id}</h4>
                      <p className="text-sm text-muted-foreground">
                        Policy ID: {policy.id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {policy.has_claimed && (
                        <Badge variant={policy.is_valid_cooler ? "default" : "secondary"}>
                          {policy.is_valid_cooler ? "Valid Cooler" : "Claimed"}
                        </Badge>
                      )}
                      {!policy.has_claimed && (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Player ID</p>
                      <p className="font-medium">{policy.player_id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Premium Paid</p>
                      <p className="font-medium">{Number(policy.premium_paid)} tokens</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payout Amount</p>
                      <p className="font-medium">{Number(policy.payout_amount)} tokens</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Buy-in</p>
                      <p className="font-medium">{Number(policy.tournament_buy_in)} tokens</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground">Tournament URL</p>
                    <a
                      href={policy.tournament_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {policy.tournament_url}
                    </a>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground">Registration Date</p>
                    <p>{policy.registration_date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}




