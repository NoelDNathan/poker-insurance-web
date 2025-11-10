"use client";

import { getClient, type Account } from "./genlayer";
import type { Address, TransactionHash } from "genlayer-js/types";
import { TransactionStatus } from "genlayer-js/types";

export interface TournamentState {
  player_balances: number[];
  player_addresses: string[];
  player_hands: string[];
  board_cards: string;
  pot: number;
  hand_winner_index: number;
  tie_players: number[];
  is_tie: boolean;
  last_pot_distribution: number[];
  tournament_finished: boolean;
  tournament_winner_index: number;
}

export interface LastWinnerInfo {
  player_hands: string[];
  board_cards: string;
  hand_winner_index: number;
  tie_players: number[];
  is_tie: boolean;
  tournament_finished: boolean;
  tournament_winner_index: number;
}

export interface CalculateWinnersResult {
  hand_winner_index: number;
  tie_players: number[];
  is_tie: boolean;
  pot_distributed: number;
  player_balances: number[];
  tournament_finished: boolean;
  tournament_winner_index: number;
}

export class PokerTournament {
  private contractAddress: string | null;
  private account: Account | null;
  private studioUrl?: string;

  constructor(contractAddress: string | null = null, account: Account | null = null, studioUrl?: string) {
    this.contractAddress = contractAddress;
    this.account = account;
    this.studioUrl = studioUrl;
  }

  updateAccount(account: Account | null) {
    this.account = account;
  }

  setContractAddress(address: string) {
    this.contractAddress = address;
  }

  private getClient() {
    if (!this.account) {
      throw new Error("Account is required for this operation. Please connect an account first.");
    }
    return getClient(this.account, this.studioUrl);
  }

  async deployContract(contractCode: Uint8Array): Promise<string> {
    console.log("[PokerTournament] Starting contract deployment...");
    const client = this.getClient();
    
    try {
      console.log("[PokerTournament] Initializing consensus smart contract...");
      await client.initializeConsensusSmartContract();

      console.log("[PokerTournament] Deploying contract...");
      const deployTransaction = await client.deployContract({
        code: contractCode,
        args: [],
      });
      console.log("[PokerTournament] Deployment transaction sent, hash:", deployTransaction);

      console.log("[PokerTournament] Waiting for transaction receipt...");
      const receipt = await client.waitForTransactionReceipt({
        hash: deployTransaction as TransactionHash,
        status: TransactionStatus.ACCEPTED,
        retries: 200,
      });
      console.log("[PokerTournament] Transaction receipt received");

      // Check status - handle both camelCase and snake_case formats
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const receiptAny = receipt as any;
      const statusName = receiptAny.statusName || receiptAny.status_name;
      if (
        statusName !== TransactionStatus.ACCEPTED &&
        statusName !== TransactionStatus.FINALIZED
      ) {
        throw new Error(`Deployment failed. Receipt: ${JSON.stringify(receipt)}`);
      }

      // Extract contract address - try multiple possible locations
      let deployedContractAddress: string | undefined;
      
      // Try receipt.data.contract_address (for localnet and some networks)
      if (receiptAny.data?.contract_address) {
        deployedContractAddress = receiptAny.data.contract_address;
      }
      // Try receipt.txDataDecoded.contractAddress (for other networks)
      else if (receiptAny.txDataDecoded?.contractAddress) {
        deployedContractAddress = receiptAny.txDataDecoded.contractAddress;
      }
      // Try receipt.recipient (sometimes the contract address is here)
      else if (receiptAny.recipient) {
        deployedContractAddress = receiptAny.recipient;
      }
      // Try receipt.to_address (alternative field name)
      else if (receiptAny.to_address) {
        deployedContractAddress = receiptAny.to_address;
      }

      if (!deployedContractAddress || typeof deployedContractAddress !== "string") {
        throw new Error(`Failed to get contract address from deployment receipt. Receipt: ${JSON.stringify(receipt)}`);
      }

      this.contractAddress = deployedContractAddress;
      console.log("[PokerTournament] Contract deployed successfully at address:", deployedContractAddress);
      return deployedContractAddress;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error during deployment: ${errorMessage}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async setPlayers(balances: number[], addresses: string[]): Promise<any> {
    if (!this.contractAddress) {
      throw new Error("Contract address is required. Please deploy the contract first.");
    }

    console.log("[PokerTournament] Setting players:", { 
      playerCount: balances.length, 
      balances: balances.length + " players",
      contractAddress: this.contractAddress 
    });
    const client = this.getClient();
    const txHash = await client.writeContract({
      address: this.contractAddress as Address,
      functionName: "set_players",
      args: [balances, addresses],
      value: BigInt(0),
    });
    console.log("[PokerTournament] set_players transaction sent, hash:", txHash);
    console.log("[PokerTournament] Waiting for set_players transaction receipt...");
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.FINALIZED,
      interval: 10000,
      retries: 20,
    });
    console.log("[PokerTournament] set_players completed successfully");
    return receipt;
  }

  async calculateWinners(
    players: string[],
    boardCards: string,
    playerBets: number[]
  ): Promise<CalculateWinnersResult> {
    if (!this.contractAddress) {
      throw new Error("Contract address is required. Please deploy the contract first.");
    }

    console.log("[PokerTournament] Calculating winners:", { 
      playerCount: players.length, 
      boardCardsCount: boardCards.length > 0 ? "5 cards" : "pre-flop",
      totalBets: playerBets.reduce((a, b) => a + b, 0)
    });
    const client = this.getClient();
    const txHash = await client.writeContract({
      address: this.contractAddress as Address,
      functionName: "calculate_winners",
      args: [players, boardCards, playerBets],
      value: BigInt(0),
    });
    console.log("[PokerTournament] calculate_winners transaction sent, hash:", txHash);
    console.log("[PokerTournament] Waiting for calculate_winners transaction receipt...");
    await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.FINALIZED,
      interval: 10000,
      retries: 20,
    });
    console.log("[PokerTournament] calculate_winners transaction finalized, reading state...");
    
    // The result is in the receipt, but we need to read the state to get the full result
    const result = await this.getState();
    console.log("[PokerTournament] Winners calculated:", { 
      winnerIndex: result.hand_winner_index, 
      isTie: result.is_tie,
      tiePlayers: result.tie_players.length 
    });
    return {
      hand_winner_index: result.hand_winner_index,
      tie_players: result.tie_players,
      is_tie: result.is_tie,
      pot_distributed: result.pot,
      player_balances: result.player_balances,
      tournament_finished: result.tournament_finished,
      tournament_winner_index: result.tournament_winner_index,
    };
  }

  async getState(): Promise<TournamentState> {
    if (!this.contractAddress) {
      throw new Error("Contract address is required. Please deploy the contract first.");
    }

    console.log("[PokerTournament] Reading contract state...");
    const client = this.getClient();
    const result = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_state",
      args: [],
    });
    console.log("[PokerTournament] State read successfully");
    return result as unknown as TournamentState;
  }

  async getLastWinner(): Promise<LastWinnerInfo> {
    if (!this.contractAddress) {
      throw new Error("Contract address is required. Please deploy the contract first.");
    }

    console.log("[PokerTournament] Getting last winner info...");
    const client = this.getClient();
    const result = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_last_winner",
      args: [],
    });
    console.log("[PokerTournament] Last winner info retrieved");
    return result as unknown as LastWinnerInfo;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getWinnerInfo(): Promise<any> {
    if (!this.contractAddress) {
      throw new Error("Contract address is required. Please deploy the contract first.");
    }

    const client = this.getClient();
    const result = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_winner_info",
      args: [],
    });
    return result;
  }
}
