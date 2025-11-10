"use client";

import { getClient, type Account } from "./genlayer";
import type { Address } from "genlayer-js/types";

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
      status: "FINALIZED",
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
    return {
      tournament_buy_in: BigInt(result.tournament_buy_in),
      insurance_premium: BigInt(result.insurance_premium),
      payout_amount: BigInt(result.payout_amount),
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
      status: "FINALIZED",
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
    return BigInt(result);
  }

  async getTotalPayouts(): Promise<bigint> {
    const client = this.getClient();
    const result = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_total_payouts",
      args: [],
    });
    return BigInt(result);
  }

  private convertPolicy(policy: any): InsurancePolicy {
    return {
      id: policy.id || "",
      player_address: policy.player_address,
      tournament_id: policy.tournament_id || "",
      tournament_url: policy.tournament_url || "",
      player_id: policy.player_id || "",
      tournament_buy_in: BigInt(policy.tournament_buy_in || 0),
      premium_paid: BigInt(policy.premium_paid || 0),
      has_claimed: policy.has_claimed || false,
      claim_resolved: policy.claim_resolved || false,
      is_valid_cooler: policy.is_valid_cooler || false,
      payout_amount: BigInt(policy.payout_amount || 0),
      registration_date: policy.registration_date || "",
    };
  }
}

