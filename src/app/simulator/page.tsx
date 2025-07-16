import SimulatorForm from '@/components/simulator/simulator-form';

export default function SimulatorPage() {
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Retirement Simulator</h1>
        <p className="text-lg text-muted-foreground">
          Project your financial future. See how your investments can grow over time.
        </p>
      </div>
      <SimulatorForm />
    </div>
  );
}
