import {
  Activity,
  ArrowUpRight,
  Calendar,
  CircleDollarSign,
  Landmark,
  Wallet,
} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DepositDialog from '@/components/dashboard/deposit-dialog';
import StatCard from '@/components/dashboard/stat-card';
import YieldChart from '@/components/dashboard/yield-chart';
import ProjectionChart from '@/components/dashboard/projection-chart';
import { db, formatTimestamp, admin, isFirebaseEnabled } from '@/lib/firebase';

async function getDashboardData() {
  if (!isFirebaseEnabled) {
    // Return mock data if Firebase is not configured
    return {
      userData: {
        currentBalance: 5250.75,
        accumulatedRewards: 250.75,
        activeProtocol: 'Compound',
        activeProtocolApy: 5.2,
      },
      distributionHistory: [
        { id: '1', date: '2024-06-30', amount: 45.50, status: 'Paid', protocol: 'Aave' },
        { id: '2', date: '2024-05-31', amount: 42.10, status: 'Paid', protocol: 'Aave' },
        { id: '3', date: '2024-04-30', amount: 48.90, status: 'Paid', protocol: 'Compound' },
        { id: '4', date: '2024-03-31', amount: 39.20, status: 'Paid', protocol: 'Compound' },
        { id: '5', date: '2024-02-29', amount: 41.80, status: 'Paid', protocol: 'Compound' },
      ],
    };
  }

  const userId = 'user_1'; // In a real app, this would be the logged-in user's ID
  
  const userDocRef = db.collection('users').doc(userId);
  const distributionsRef = db.collection('distributions').where('userId', '==', userId).orderBy('date', 'desc').limit(5);

  const userDocPromise = userDocRef.get();
  const distributionsPromise = distributionsRef.get();

  const [userDoc, distributionsSnapshot] = await Promise.all([userDocPromise, distributionsPromise]);

  if (!userDoc.exists) {
    throw new Error('User not found. Please sign up or add a "user_1" document to your Firestore.');
  }

  const userData = userDoc.data()!;
  
  const distributionHistory = distributionsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      date: formatTimestamp(data.date as admin.firestore.Timestamp),
      amount: data.amount,
      status: data.status,
      protocol: data.protocol,
    };
  });

  return { userData, distributionHistory };
}


export default async function Dashboard() {
  const { userData, distributionHistory } = await getDashboardData();
  const initialInvestment = userData.currentBalance - userData.accumulatedRewards;

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <DepositDialog />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Balance"
          value={`$${Number(userData.currentBalance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          description="+1.2% from last month"
          icon={<Wallet className="text-accent" />}
        />
        <StatCard
          title="Accumulated Rewards"
          value={`$${Number(userData.accumulatedRewards).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          description="Total since inception"
          icon={<CircleDollarSign className="text-accent" />}
        />
        <StatCard
          title="Next Payout"
          value="15 days"
          description="July 31, 2024"
          icon={<Calendar className="text-accent" />}
        />
        <StatCard
          title="Active Protocol"
          value={userData.activeProtocol}
          description={`Current APY: ${userData.activeProtocolApy}%`}
          icon={<Activity className="text-accent" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historical Yield (APY)</CardTitle>
            <CardDescription>
              Performance over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <YieldChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Investment Growth</CardTitle>
            <CardDescription>
              Projected growth of your initial investment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectionChart initialInvestment={initialInvestment} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
          <CardDescription>
            A record of your monthly yield distributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-card'>
                <TableHead>Date</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributionHistory.map((dist) => (
                <TableRow key={dist.id} className='hover:bg-muted/50'>
                  <TableCell>
                    <div className="font-bold">{dist.date}</div>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{dist.protocol}</TableCell>
                  <TableCell className="text-right font-mono font-bold">${dist.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-accent bg-accent/20 text-accent-foreground brutalist-border">
                      {dist.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
