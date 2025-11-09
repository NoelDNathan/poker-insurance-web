import { TournamentDetails } from "@/components/TournamentDetails";
import { PolicyList } from "@/components/PolicyList";
import { ClaimForm } from "@/components/ClaimForm";

export default function TournamentPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tournament & Policies</h1>
        <p className="text-muted-foreground">
          View tournament details, manage your policies, and file claims
        </p>
      </div>

      <TournamentDetails />

      <div className="grid md:grid-cols-2 gap-8">
        <PolicyList />
        <ClaimForm />
      </div>
    </div>
  );
}




