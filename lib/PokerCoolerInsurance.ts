"use client";

import { getClient, type Account } from "./genlayer";
import type { Address } from "genlayer-js/types";
import { TransactionStatus } from "genlayer-js/types";

export interface InsurancePolicy {
  id: string;
  player_address: Address;
  tournament_id: string;
  tournament_url: string;
  player_id: string;
  tournament_buy_in: bigint;
  premium_paid: bigint;
  has_claimed: boolean;
  claim_resolved: boolean;
  is_valid_cooler: boolean;
  payout_amount: bigint;
  registration_date: string;
}

export interface TournamentInfo {
  tournament_buy_in: bigint;
  insurance_premium: bigint;
  payout_amount: bigint;
}

export class PokerCoolerInsurance {
  private contractAddress: string;
  private account: Account | null;
  private studioUrl?: string;

  constructor(contractAddress: string, account: Account | null = null, studioUrl?: string) {
    if (!contractAddress || contractAddress.trim() === "") {
      throw new Error("Contract address is required. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.");
    }
    this.contractAddress = contractAddress;
    this.account = account;
    this.studioUrl = studioUrl;
  }

  updateAccount(account: Account | null) {
    this.account = account;
  }

  private getClient() {
    if (!this.account) {
      throw new Error("Account is required for this operation. Please connect an account first.");
    }
    
    if (!this.contractAddress || this.contractAddress.trim() === "") {
      throw new Error("Contract address is not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.");
    }
    
    return getClient(this.account, this.studioUrl);
  }

  async purchaseInsurance(
    tournamentAddress: string,
    registrationDate: string,
    playerAddress: string
  ): Promise<string> {
    const client = this.getClient();
    const txHash = await client.writeContract({
      address: this.contractAddress as Address,
      functionName: "purchase_insurance",
      args: [tournamentAddress, registrationDate, playerAddress],
      value: BigInt(0),
    });
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.FINALIZED,
      interval: 10000,
      retries: 20,
    });
    return txHash;
  }

  async getTournamentInfo(tournamentUrl: string): Promise<TournamentInfo> {
    const client = this.getClient();
    const result = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_tournament_info",
      args: [tournamentUrl],
    });
    // Cast result to expected type (same pattern as PokerTournament.ts)
    const normalized = result as unknown as {
      tournament_buy_in: string | number | bigint;
      insurance_premium: string | number | bigint;
      payout_amount: string | number | bigint;
    };
    return {
      tournament_buy_in: BigInt(normalized.tournament_buy_in ?? 0),
      insurance_premium: BigInt(normalized.insurance_premium ?? 0),
      payout_amount: BigInt(normalized.payout_amount ?? 0),
    };
  }

  async getPlayerPolicies(playerAddress: string): Promise<Record<string, InsurancePolicy>> {
    const client = this.getClient();
    const policies = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_player_policies",
      args: [playerAddress],
    });
    
    // Convert Map/entries to object
    const policiesObj: Record<string, InsurancePolicy> = {};
    if (policies && typeof policies === "object") {
      if (policies instanceof Map) {
        for (const [key, value] of policies.entries()) {
          policiesObj[key] = this.convertPolicy(value);
        }
      } else {
        for (const [key, value] of Object.entries(policies)) {
          policiesObj[key] = this.convertPolicy(value);
        }
      }
    }
    return policiesObj;
  }

  async getPolicy(policyId: string): Promise<InsurancePolicy> {
    const client = this.getClient();
    const policy = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_policy",
      args: [policyId],
    });
    return this.convertPolicy(policy);
  }

  async fileClaim(policyId: string): Promise<string> {
    const client = this.getClient();
    const txHash = await client.writeContract({
      address: this.contractAddress as Address,
      functionName: "file_claim",
      args: [policyId],
      value: BigInt(0),
    });
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.FINALIZED,
      interval: 10000,
      retries: 20,
    });
    return txHash;
  }

  async getTotalPremiums(): Promise<bigint> {
    const client = this.getClient();
    const result = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_total_premiums",
      args: [],
    });
    // Cast result to a type compatible with BigInt
    const value = result as unknown as string | number | bigint;
    return BigInt(value ?? 0);
  }

  async getTotalPayouts(): Promise<bigint> {
    const client = this.getClient();
    const result = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_total_payouts",
      args: [],
    });
    // Cast result to a type compatible with BigInt
    const value = result as unknown as string | number | bigint;
    return BigInt(value ?? 0);
  }

  private convertPolicy(policy: unknown): InsurancePolicy {
    // Cast policy to expected structure from contract
    const rawPolicy = policy as {
      id?: string;
      player_address?: Address;
      tournament_id?: string;
      tournament_url?: string;
      player_id?: string;
      tournament_buy_in?: string | number | bigint;
      premium_paid?: string | number | bigint;
      has_claimed?: boolean;
      claim_resolved?: boolean;
      is_valid_cooler?: boolean;
      payout_amount?: string | number | bigint;
      registration_date?: string;
    };
    
    return {
      id: rawPolicy.id || "",
      player_address: rawPolicy.player_address as Address,
      tournament_id: rawPolicy.tournament_id || "",
      tournament_url: rawPolicy.tournament_url || "",
      player_id: rawPolicy.player_id || "",
      tournament_buy_in: BigInt(rawPolicy.tournament_buy_in || 0),
      premium_paid: BigInt(rawPolicy.premium_paid || 0),
      has_claimed: rawPolicy.has_claimed || false,
      claim_resolved: rawPolicy.claim_resolved || false,
      is_valid_cooler: rawPolicy.is_valid_cooler || false,
      payout_amount: BigInt(rawPolicy.payout_amount || 0),
      registration_date: rawPolicy.registration_date || "",
    };
  }
}

