import OracleForm from "@/components/oracle/oracle-form";

export default function OraclePage() {
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">DeFi Oracle</h1>
        <p className="text-lg text-muted-foreground">
          Let our AI find the best DeFi protocols to maximize your yield.
        </p>
      </div>
      <OracleForm />
    </div>
  );
}
