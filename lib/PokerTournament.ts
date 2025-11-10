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
    return {
      hand_winner_index: -1,
      tie_players: [],
      is_tie: false,
      pot_distributed: 0,
      player_balances: [],
      tournament_finished: false,
      tournament_winner_index: -1,
    };
    
    try {
      const txHash = await client.writeContract({
        address: this.contractAddress as Address,
        functionName: "calculate_winners",
        args: [players, boardCards, playerBets],
        value: BigInt(0),
      });
      console.log("[PokerTournament] calculate_winners transaction sent, hash:", txHash);
      console.log("[PokerTournament] Waiting for calculate_winners transaction receipt...");

      try {
        const receipt = await client.waitForTransactionReceipt({
          hash: txHash,
          status: TransactionStatus.FINALIZED,
          interval: 10000,
          retries: 20,
        });
        
        // Verify transaction was successful
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const receiptAny = receipt as any;
        const statusName = receiptAny.statusName || receiptAny.status_name;
        const status = receiptAny.status;
        
        console.log("[PokerTournament] Transaction receipt received:", {
          hash: txHash,
          status: status,
          statusName: statusName,
          result: receiptAny.result,
          resultName: receiptAny.result_name,
        });
        
        // Verify that the transaction was successful
        if (
          statusName !== TransactionStatus.ACCEPTED &&
          statusName !== TransactionStatus.FINALIZED
        ) {
          throw new Error(`Transaction failed with status: ${statusName}. Receipt: ${JSON.stringify(receipt)}`);
        }
        
        // Verify the execution result
        if (receiptAny.result_name && receiptAny.result_name !== "MAJORITY_AGREE") {
          console.warn(`[PokerTournament] Transaction result: ${receiptAny.result_name} (expected MAJORITY_AGREE)`);
        }
        
        console.log("[PokerTournament] calculate_winners transaction finalized successfully");
      } catch (waitError: unknown) {
        const errorMessage = waitError instanceof Error ? waitError.message : String(waitError);
        console.error("[PokerTournament] Transaction failed or timed out:", errorMessage);
        throw new Error(`Transaction failed or timed out: ${errorMessage}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('insufficient funds')) {
        console.error("[PokerTournament] Not enough balance to pay for transaction");
        throw new Error('Not enough balance to pay for transaction');
      } else if (errorMessage.includes('user rejected')) {
        console.error("[PokerTournament] User rejected the transaction");
        throw new Error('User rejected the transaction');
      } else {
        console.error("[PokerTournament] Error sending transaction:", errorMessage);
        throw error;
      }
    }
    
    // The result is in the receipt, but we need to read the state to get the full result
    const result = await this.getState();
    
    // Validate and normalize the result
    const tiePlayers = Array.isArray(result.tie_players) ? result.tie_players : [];
    const playerBalances = Array.isArray(result.player_balances) ? result.player_balances : [];
    
    console.log("[PokerTournament] Winners calculated:", { 
      winnerIndex: result.hand_winner_index ?? -1, 
      isTie: result.is_tie ?? false,
      tiePlayers: tiePlayers.length 
    });
    
    return {
      hand_winner_index: result.hand_winner_index ?? -1,
      tie_players: tiePlayers,
      is_tie: result.is_tie ?? false,
      pot_distributed: result.pot ?? 0,
      player_balances: playerBalances,
      tournament_finished: result.tournament_finished ?? false,
      tournament_winner_index: result.tournament_winner_index ?? -1,
    };
  }

  async getState(): Promise<TournamentState> {
    if (!this.contractAddress) {
      throw new Error("Contract address is required. Please deploy the contract first.");
    }

    console.log("[PokerTournament] Reading contract state... contractAddress:", this.contractAddress);
    const client = this.getClient();
    const result = await client.readContract({
      address: this.contractAddress as Address,
      functionName: "get_state",
      args: [],
    });
    console.log("[PokerTournament] State read successfully:", result);
    
    // Normalize and validate the result to ensure all fields exist
    const normalized = result as unknown as TournamentState;
    return {
      player_balances: Array.isArray(normalized?.player_balances) ? normalized.player_balances : [],
      player_addresses: Array.isArray(normalized?.player_addresses) ? normalized.player_addresses : [],
      player_hands: Array.isArray(normalized?.player_hands) ? normalized.player_hands : [],
      board_cards: normalized?.board_cards ?? "",
      pot: normalized?.pot ?? 0,
      hand_winner_index: normalized?.hand_winner_index ?? -1,
      tie_players: Array.isArray(normalized?.tie_players) ? normalized.tie_players : [],
      is_tie: normalized?.is_tie ?? false,
      last_pot_distribution: Array.isArray(normalized?.last_pot_distribution) ? normalized.last_pot_distribution : [],
      tournament_finished: normalized?.tournament_finished ?? false,
      tournament_winner_index: normalized?.tournament_winner_index ?? -1,
    };
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
    
    // Normalize and validate the result to ensure all fields exist
    const normalized = result as unknown as LastWinnerInfo;
    return {
      player_hands: Array.isArray(normalized?.player_hands) ? normalized.player_hands : [],
      board_cards: normalized?.board_cards ?? "",
      hand_winner_index: normalized?.hand_winner_index ?? -1,
      tie_players: Array.isArray(normalized?.tie_players) ? normalized.tie_players : [],
      is_tie: normalized?.is_tie ?? false,
      tournament_finished: normalized?.tournament_finished ?? false,
      tournament_winner_index: normalized?.tournament_winner_index ?? -1,
    };
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
