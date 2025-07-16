import OracleForm from "@/components/oracle/oracle-form";

export default function OraclePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">DeFi Oracle</h1>
        <p className="text-muted-foreground">
          Let our AI find the best DeFi protocols to maximize your yield.
        </p>
      </div>
      <OracleForm />
    </div>
  );
}
