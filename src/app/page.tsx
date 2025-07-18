import {
  Activity,
  Calendar,
  CircleDollarSign,
  Wallet,
  Hourglass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DepositDialog from '@/components/dashboard/deposit-dialog';
import WithdrawDialog from '@/components/dashboard/withdraw-dialog';
import StatCard from '@/components/dashboard/stat-card';
import YieldChart from '@/components/dashboard/yield-chart';
import ProjectionChart from '@/components/dashboard/projection-chart';
import LockupDialog from '@/components/dashboard/lockup-dialog';
import { db, formatTimestamp, admin, isFirebaseEnabled } from '@/lib/firebase-server';

async function getDashboardData() {
  if (!isFirebaseEnabled) {
    // Return mock data if Firebase is not configured
    return {
      userData: {
        currentBalance: 5250.75,
        accumulatedRewards: 250.75,
        activeProtocol: 'Compound',
        activeProtocolApy: 5.2,
        lockupPeriod: 12,
      },
      transactions: [
        { id: '1', date: 'June 30, 2024', amount: 45.5, status: 'Paid', protocol: 'Aave', type: 'Yield' },
        { id: '6', date: 'June 1, 2024', amount: 1000, status: 'Completed', protocol: 'N/A', type: 'Deposit' },
        { id: '2', date: 'May 31, 2024', amount: 42.1, status: 'Paid', protocol: 'Aave', type: 'Yield' },
        { id: '3', date: 'April 30, 2024', amount: 48.9, status: 'Paid', protocol: 'Compound', type: 'Yield' },
        { id: '7', date: 'April 15, 2024', amount: 500, status: 'Completed', protocol: 'N/A', type: 'Deposit' },
        { id: '4', date: 'March 31, 2024', amount: 39.2, status: 'Paid', protocol: 'Compound', type: 'Yield' },
        { id: '5', date: 'February 29, 2024', amount: 41.8, status: 'Paid', protocol: 'Compound', type: 'Yield' },
      ],
    };
  }

  const userId = 'user_1'; // In a real app, this would be the logged-in user's ID
  
  const userDocRef = db.collection('users').doc(userId);
  const transactionsRef = db.collection('transactions').where('userId', '==', userId).orderBy('date', 'desc').limit(10);

  const userDocPromise = userDocRef.get();
  const transactionsPromise = transactionsRef.get();

  const [userDoc, transactionsSnapshot] = await Promise.all([userDocPromise, transactionsPromise]);

  if (!userDoc.exists) {
    throw new Error('User not found. Please sign up or add a "user_1" document to your Firestore.');
  }

  const userData = userDoc.data()!;
  
  const transactions = transactionsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      date: formatTimestamp(data.date as admin.firestore.Timestamp),
      amount: data.amount,
      status: data.status,
      protocol: data.protocol || 'N/A',
      type: data.type,
    };
  });

  return { userData, transactions };
}


export default async function Dashboard() {
  const { userData, transactions } = await getDashboardData();
  const initialInvestment = userData.currentBalance - userData.accumulatedRewards;
  
  const distributionHistory = transactions.filter(t => t.type === 'Yield');
  const depositHistory = transactions.filter(t => t.type === 'Deposit');

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <WithdrawDialog />
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
          title="Lock-up Period"
          value={`${userData.lockupPeriod} Months`}
          description="Configurable period"
          icon={<Hourglass className="text-accent" />}
          action={<LockupDialog currentPeriod={userData.lockupPeriod} />}
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
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            A record of your deposits and yield distributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="yield">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="yield">Yield History</TabsTrigger>
                <TabsTrigger value="deposits">Deposit History</TabsTrigger>
            </TabsList>
            <TabsContent value="yield">
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
            </TabsContent>
            <TabsContent value="deposits">
                 <Table>
                    <TableHeader>
                    <TableRow className='hover:bg-card'>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {depositHistory.map((deposit) => (
                        <TableRow key={deposit.id} className='hover:bg-muted/50'>
                        <TableCell>
                            <div className="font-bold">{deposit.date}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">${deposit.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                             <Badge variant="outline" className="border-green-500 bg-green-500/20 text-foreground brutalist-border">
                                {deposit.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TabsContent>
           </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
