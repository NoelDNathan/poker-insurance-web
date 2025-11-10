import { TournamentDetails } from "@/components/TournamentDetails";
import { ClaimForm } from "@/components/ClaimForm";

export default function TournamentPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tournament & Insurance Policies</h1>
        <p className="text-muted-foreground">
          View tournament details, manage your insurance policies, and file claims
        </p>
      </div>

      <TournamentDetails />
{/* 
      <div className="grid md:grid-cols-1 gap-8">
        <ClaimForm />
      </div> */}
    </div>
  );
}
