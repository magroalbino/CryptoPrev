import LearnAccordion from '@/components/learn/learn-accordion';

export default function LearnPage() {
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">DeFi Learn</h1>
        <p className="text-lg text-muted-foreground">
          Your AI-powered guide to the world of Decentralized Finance.
        </p>
      </div>
      <LearnAccordion />
    </div>
  );
}
