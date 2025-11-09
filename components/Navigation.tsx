"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/AccountContext";
import { Wallet, LogOut, Coins } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const { account, connectAccount, disconnectAccount, accountAddress, balance } = useAccount();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Poker Insurance
            </Link>
            <div className="flex gap-4">
              <Link
                href="/purchase"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/purchase" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Purchase
              </Link>
              <Link
                href="/tournament"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/tournament" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Tournament & Policies
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {account ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{balance.toLocaleString()} tokens</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Connected</p>
                    <p className="font-mono text-xs">{accountAddress?.slice(0, 10)}...</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectAccount}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={connectAccount}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
