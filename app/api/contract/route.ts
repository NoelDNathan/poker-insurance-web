import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Path to the contract file relative to the project root
    // The app-nextjs folder is inside genlayer-project-boilerplate
    // So we need to go up two levels to reach the contracts folder
    const contractPath = join(process.cwd(), "..", "contracts", "poker_tournament_V2.py");
    const contractCode = readFileSync(contractPath);
    
    // Convert to Uint8Array and return as base64 for easier transfer
    const base64 = Buffer.from(contractCode).toString("base64");
    
    return NextResponse.json({ 
      code: base64,
      filename: "poker_tournament_V2.py"
    });
  } catch (error: any) {
    console.error("Error reading contract file:", error);
    return NextResponse.json(
      { error: "Failed to read contract file", details: error.message },
      { status: 500 }
    );
  }
}
