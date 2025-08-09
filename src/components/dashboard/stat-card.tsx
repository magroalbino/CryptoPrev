import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  description:string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  subtitle,
  description,
  icon,
  action,
}: StatCardProps) {
  return (
    <Card className='brutalist-shadow'>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold uppercase tracking-wider">{title}</CardTitle>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && <div className="text-sm text-muted-foreground font-bold">{subtitle}</div>}
        </div>
        <div className='p-2 bg-secondary/50 border-2 border-foreground'>
          {icon}
        </div>
      </CardHeader>
      <CardContent className='p-6 pt-0 flex items-center justify-between'>
        <p className="text-xs text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
