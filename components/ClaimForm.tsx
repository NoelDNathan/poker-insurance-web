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

export function ClaimForm() {
  const { account } = useAccount();
  const [policyId, setPolicyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL;

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setError("Please connect an account first");
      return;
    }

    if (!policyId) {
      setError("Please enter a policy ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = new PokerCoolerInsurance(contractAddress, account, studioUrl);
      const txHash = await contract.fileClaim(policyId);
      setSuccess(`Claim filed successfully! Transaction: ${txHash}`);
      setPolicyId("");
    } catch (err: any) {
      setError(err.message || "Failed to file claim");
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
          <CardTitle>File Claim</CardTitle>
          <CardDescription>
            File a claim for your insurance policy if you were eliminated by a cooler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileClaim} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="policyId" className="text-sm font-medium">
                Policy ID
              </label>
              <Input
                id="policyId"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                placeholder="tournament123_0x..."
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
                "File Claim"
              )}
            </Button>

            {!account && (
              <p className="text-sm text-muted-foreground text-center">
                Please connect an account to file a claim
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}




