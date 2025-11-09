import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Poker Cooler Insurance</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Protect yourself from bad beats. Get insurance coverage for poker tournament coolers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mt-8">
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Purchase Insurance</CardTitle>
            <CardDescription>
              Buy insurance for your poker tournament participation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/purchase">
              <Button className="w-full">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Tournament & Policies</CardTitle>
            <CardDescription>
              View tournament details and manage your insurance policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/tournament">
              <Button className="w-full" variant="outline">
                View Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
