import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Shield,
  UserCheck,
  UserX,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  Download,
  Check,
  X,
  Edit,
  Ban,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

interface LoanApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  purpose: string;
  creditScore: number;
  requestedPlan: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

interface OverdueAccount {
  id: string;
  userId: string;
  userName: string;
  orderId: string;
  amountDue: number;
  daysOverdue: number;
  totalOwed: number;
  lastPaymentDate: string;
}

export function AdminPanel() {
  const { allUsers, orders, transactions } = useApp();

  // Loan Applications State (Mock Data)
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([
    {
      id: 'loan-1',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      amount: 1500,
      purpose: 'Electronics Purchase',
      creditScore: 720,
      requestedPlan: '6 months',
      status: 'pending',
      appliedDate: new Date().toISOString(),
    },
    {
      id: 'loan-2',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah@example.com',
      amount: 2500,
      purpose: 'Furniture Purchase',
      creditScore: 680,
      requestedPlan: '12 months',
      status: 'pending',
      appliedDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'loan-3',
      userId: 'user-3',
      userName: 'Mike Davis',
      userEmail: 'mike@example.com',
      amount: 800,
      purpose: 'Clothing Purchase',
      creditScore: 590,
      requestedPlan: '3 months',
      status: 'pending',
      appliedDate: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  // Overdue Accounts (Mock Data)
  const [overdueAccounts] = useState<OverdueAccount[]>([
    {
      id: 'overdue-1',
      userId: 'user-4',
      userName: 'Emily Brown',
      orderId: 'ORD-1234',
      amountDue: 125.50,
      daysOverdue: 15,
      totalOwed: 875.50,
      lastPaymentDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'overdue-2',
      userId: 'user-5',
      userName: 'David Wilson',
      orderId: 'ORD-5678',
      amountDue: 250.00,
      daysOverdue: 8,
      totalOwed: 1250.00,
      lastPaymentDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'overdue-3',
      userId: 'user-6',
      userName: 'Lisa Anderson',
      orderId: 'ORD-9012',
      amountDue: 89.99,
      daysOverdue: 22,
      totalOwed: 450.00,
      lastPaymentDate: new Date(Date.now() - 22 * 86400000).toISOString(),
    },
  ]);

  // Credit Limit Adjustment State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Calculate Dashboard Stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingLoans = loanApplications.filter(l => l.status === 'pending').length;
  const totalOverdue = overdueAccounts.reduce((sum, acc) => sum + acc.totalOwed, 0);
  const activeUsers = allUsers.length;
  const suspendedUsers = allUsers.filter(u => !u.kycVerified).length;

  // Loan Actions
  const handleLoanAction = (loanId: string, action: 'approved' | 'rejected') => {
    setLoanApplications(prev =>
      prev.map(loan =>
        loan.id === loanId ? { ...loan, status: action } : loan
      )
    );
    toast.success(`Loan ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
  };

  // Adjust Credit Limit
  const handleAdjustCreditLimit = () => {
    if (!selectedUser || !newCreditLimit) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success(`Credit limit adjusted to $${newCreditLimit} for ${selectedUser.name}`);
    setSelectedUser(null);
    setNewCreditLimit('');
    setAdjustmentReason('');
  };

  // Suspend User
  const handleSuspendUser = (userId: string, userName: string) => {
    toast.success(`User ${userName} has been suspended`);
  };

  // Generate Report
  const handleGenerateReport = (reportType: string) => {
    toast.success(`${reportType} report generated successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Control Panel
          </h1>
          <p className="text-gray-500 mt-1">Manage loans, users, and platform operations</p>
        </div>
        <Badge className="bg-blue-600 text-white px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Administrator
        </Badge>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +15.3% this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingLoans}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{overdueAccounts.length} accounts</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{activeUsers}</p>
            <p className="text-xs text-gray-500 mt-1">Registered members</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Suspended Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{suspendedUsers}</p>
            <p className="text-xs text-gray-500 mt-1">Inactive accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="loans" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="loans">Loan Applications</TabsTrigger>
          <TabsTrigger value="credit">Credit Limits</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Accounts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Loan Applications Tab */}
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Loan Applications
              </CardTitle>
              <CardDescription>Review and approve/reject loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanApplications.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.userName}</TableCell>
                      <TableCell>{loan.userEmail}</TableCell>
                      <TableCell className="font-semibold">${loan.amount}</TableCell>
                      <TableCell>{loan.purpose}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            loan.creditScore >= 700
                              ? 'bg-green-100 text-green-800'
                              : loan.creditScore >= 600
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {loan.creditScore}
                        </Badge>
                      </TableCell>
                      <TableCell>{loan.requestedPlan}</TableCell>
                      <TableCell>{formatDate(loan.appliedDate, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {loan.status === 'pending' ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        ) : loan.status === 'approved' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <X className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {loan.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleLoanAction(loan.id, 'approved')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleLoanAction(loan.id, 'rejected')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {loan.status !== 'pending' && (
                          <span className="text-sm text-gray-500">Processed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {loanApplications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No loan applications at this time
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Limits Tab */}
        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Adjust Credit Limits
              </CardTitle>
              <CardDescription>Modify user credit limits based on their profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Adjustment Form */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Credit Limit Adjustment
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Select User</Label>
                      <Select onValueChange={(value) => {
                        const user = allUsers.find(u => u.id === value);
                        setSelectedUser(user);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} - Score: {user.creditScore}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedUser && (
                      <>
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm text-gray-500">Current Credit Limit</p>
                          <p className="text-xl font-bold">
                            ${selectedUser.creditScore >= 700 ? '5,000' : selectedUser.creditScore >= 600 ? '2,500' : '1,000'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>New Credit Limit ($)</Label>
                          <Input
                            type="number"
                            placeholder="Enter new limit"
                            value={newCreditLimit}
                            onChange={(e) => setNewCreditLimit(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Reason for Adjustment</Label>
                          <Input
                            placeholder="e.g., Good payment history, credit score improvement"
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                          />
                        </div>

                        <Button onClick={handleAdjustCreditLimit} className="w-full">
                          <Check className="h-4 w-4 mr-2" />
                          Apply Adjustment
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* User Credit Limits Table */}
                <div>
                  <h3 className="font-semibold mb-3">All User Credit Limits</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Credit Score</TableHead>
                        <TableHead>Current Limit</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map(user => {
                        const creditLimit = user.creditScore >= 700 ? 5000 : user.creditScore >= 600 ? 2500 : 1000;
                        const utilization = Math.floor(Math.random() * 60) + 10; // Mock utilization
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.creditScore >= 700
                                    ? 'bg-green-100 text-green-800'
                                    : user.creditScore >= 600
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }
                              >
                                {user.creditScore}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">${creditLimit.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${utilization > 70 ? 'bg-red-500' : utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                    style={{ width: `${utilization}%` }}
                                  />
                                </div>
                                <span className="text-sm">{utilization}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Adjust
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Suspend or reactivate user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.creditScore >= 700
                              ? 'bg-green-100 text-green-800'
                              : user.creditScore >= 600
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {user.creditScore}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.kycVerified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.kycVerified ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Ban className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Suspend User Account</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to suspend {user.name}? They will not be able to make purchases or access their account.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleSuspendUser(user.id, user.name)}
                              >
                                Confirm Suspension
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue Accounts Tab */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Overdue Accounts
              </CardTitle>
              <CardDescription>Monitor and manage late payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Total Owed</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueAccounts.map(account => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.userName}</TableCell>
                      <TableCell className="font-mono text-sm">{account.orderId}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        ${account.amountDue.toFixed(2)}
                      </TableCell>
                      <TableCell>${account.totalOwed.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            account.daysOverdue > 20
                              ? 'bg-red-100 text-red-800'
                              : account.daysOverdue > 10
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {account.daysOverdue} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(account.lastPaymentDate, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Send Reminder
                          </Button>
                          <Button size="sm" variant="destructive">
                            Escalate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {overdueAccounts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  No overdue accounts - All payments are up to date!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid md:grid-cols-2 gap-6">
            {/* System Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  System Reports
                </CardTitle>
                <CardDescription>View comprehensive platform analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('User Activity')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  User Activity Report
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Transaction')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Transaction History Report
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Payment')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Payment Status Report
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Credit Score')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Credit Score Analysis
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Merchant Performance')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Merchant Performance Report
                </Button>
              </CardContent>
            </Card>

            {/* Financial Summaries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summaries
                </CardTitle>
                <CardDescription>Generate financial reports and statements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Monthly Revenue')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Monthly Revenue Summary
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Quarterly')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Quarterly Financial Report
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Annual')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Annual Financial Statement
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Outstanding Debt')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Outstanding Debt Report
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleGenerateReport('Profit & Loss')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Profit & Loss Statement
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Financial Overview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Revenue (MTD)</p>
                  <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Pending Settlements</p>
                  <p className="text-2xl font-bold text-blue-600">$12,450.00</p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Active Loans</p>
                  <p className="text-2xl font-bold text-yellow-600">$45,280.00</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Overdue</p>
                  <p className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
