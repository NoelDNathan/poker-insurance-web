import { PurchaseForm } from "@/components/PurchaseForm";

export default function PurchasePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Purchase Insurance</h1>
        <p className="text-muted-foreground">
          Fill in the tournament details to purchase cooler insurance coverage
        </p>
      </div>
      <PurchaseForm />
    </div>
  );
}




