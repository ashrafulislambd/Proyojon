import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Users, Store, ShoppingCart, DollarSign, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export function AdminPanel() {
  const { adminStats, allUsers, merchants, auditLogs, fetchAdminData, verifyMerchant, processMerchantSettlement, currentUser } = useApp();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (id: number, name: string) => {
    try {
      await verifyMerchant(id);
      toast.success(`${name} verified successfully`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSettle = async (id: number, name: string) => {
    try {
      await processMerchantSettlement(id);
      toast.success(`Settlement processed for ${name}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!adminStats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading admin data...</p>
      </div>
    );
  }

  const { stats, merchantRevenue, revenueByPlan, monthlyRevenue } = adminStats;

  const planData = revenueByPlan.map(r => ({
    name: r.payment_plan === 'full' ? 'Full' : r.payment_plan === '3months' ? '3M' : r.payment_plan === '6months' ? '6M' : '12M',
    revenue: Number(r.total_revenue),
    orders: Number(r.order_count),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Welcome, {currentUser?.name}. Monitor your BNPL platform.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${Number(stats.total_revenue).toFixed(0)}</p>
            <p className="text-xs text-orange-600 mt-1">Outstanding: ${Number(stats.total_outstanding).toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total_orders}</p>
            <p className="text-xs text-red-600 mt-1">{stats.overdue_installments} overdue installments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total_users}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.active_plans} active plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Store className="h-4 w-4" />Merchants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total_merchants}</p>
            <p className="text-xs text-gray-500 mt-1">{merchants.filter(m => m.verified).length} verified</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month_label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Revenue by Merchant</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={merchantRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="merchant_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_revenue" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Revenue by Payment Plan</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={planData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Orders by Plan</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={planData} cx="50%" cy="50%" outerRadius={80} dataKey="orders"
                      label={(e) => `${e.name}: ${e.orders}`}>
                      {planData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>User Management ({allUsers.length} users)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.credit_score}</TableCell>
                      <TableCell>${Number(user.credit_limit).toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge className={user.kyc_status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {user.kyc_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(user.created_at), 'MMM dd, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Merchants Tab */}
        <TabsContent value="merchants">
          <Card>
            <CardHeader><CardTitle>Merchant Management ({merchants.length} merchants)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Pending Settlement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.contact_email}</TableCell>
                      <TableCell>
                        <Badge className={m.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {m.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>${Number(m.total_sales).toFixed(2)}</TableCell>
                      <TableCell>${Number(m.pending_settlement).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!m.verified && (
                            <Button size="sm" variant="outline" onClick={() => handleVerify(m.id, m.name)}>
                              Verify
                            </Button>
                          )}
                          {Number(m.pending_settlement) > 0 && (
                            <Button size="sm" onClick={() => handleSettle(m.id, m.name)}>
                              Settle
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No audit logs yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Record ID</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.slice(0, 50).map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.table_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.action}</Badge>
                        </TableCell>
                        <TableCell>#{log.record_id}</TableCell>
                        <TableCell>{log.changed_by}</TableCell>
                        <TableCell className="text-xs">{format(new Date(log.changed_at), 'MMM dd, h:mm a')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
