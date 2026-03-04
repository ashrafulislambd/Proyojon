import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Calendar, DollarSign, CheckCircle, Clock, AlertCircle, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function Repayments() {
  const { orders, fetchOrders, payInstallment, currentUser } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Pending' | 'Paid' | 'Overdue'>('all');
  const [paying, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Flatten all installments across all orders
  const allInstallments = orders.flatMap(order => {
    if (!order.installment_info?.installments) return [];
    return order.installment_info.installments.map(inst => ({
      ...inst,
      orderId: order.order_id,
      orderTotal: order.total_amount,
      items: (order.items || []).map(i => i.name),
      totalInstallments: order.installment_info!.totalInstallments,
    }));
  });

  const filtered = selectedFilter === 'all'
    ? allInstallments
    : allInstallments.filter(i => i.status === selectedFilter);

  const paid = allInstallments.filter(i => i.status === 'Paid');
  const pending = allInstallments.filter(i => i.status === 'Pending');
  const overdue = allInstallments.filter(i => i.status === 'Overdue');
  const totalPaid = paid.reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = pending.reduce((s, i) => s + Number(i.amount), 0);

  const handlePayNow = async (installmentId: number) => {
    setPayingId(installmentId);
    try {
      await payInstallment(installmentId);
      toast.success('Payment processed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'Paid': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Paid' };
      case 'Overdue': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Overdue' };
      default: return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Upcoming' };
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your repayments.</p>
      </div>
    );
  }

  if (allInstallments.length === 0) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Payment Plans</h2>
        <p className="text-gray-500 mb-6">Place an order with a BNPL plan to see your installments here.</p>
        <Link to="/home"><Button><ShoppingCart className="h-4 w-4 mr-2" />Start Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Schedule</h1>
        <p className="text-gray-500 mt-1">Track and manage your installment payments</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">${totalPaid.toFixed(2)}</p>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">{paid.length} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-500">Upcoming</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">${totalPending.toFixed(2)}</p>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">{pending.length} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-500">Active Plans</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{orders.filter(o => o.installment_info).length}</p>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">payment plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">
                  {overdue.length} Overdue Payment{overdue.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-700">
                  Total overdue: ${overdue.reduce((s, i) => s + Number(i.amount), 0).toFixed(2)}. Please pay immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'Pending', 'Paid', 'Overdue'] as const).map(f => (
          <Button key={f} variant={selectedFilter === f ? 'default' : 'outline'}
            onClick={() => setSelectedFilter(f)}>
            {f === 'all' ? `All (${allInstallments.length})` : `${f} (${allInstallments.filter(i => i.status === f).length})`}
          </Button>
        ))}
      </div>

      {/* Installment Cards */}
      <div className="space-y-4">
        {filtered.map((inst) => {
          const cfg = statusConfig(inst.status);
          const Icon = cfg.icon;
          const progress = ((inst.number - 1) / inst.totalInstallments) * 100;
          return (
            <Card key={`${inst.orderId}-${inst.id}`}>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        Payment {inst.number} of {inst.totalInstallments}
                      </h3>
                      <Badge className={`${cfg.bg} ${cfg.color}`}>
                        <Icon className="h-3 w-3 mr-1" />{cfg.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">Order #{inst.orderId}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{inst.items.join(', ')}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-3xl font-bold">${Number(inst.amount).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      Due: {format(new Date(inst.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Installment Progress</span>
                    <span>{inst.number - 1} of {inst.totalInstallments} paid</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {inst.status === 'Pending' && (
                  <Button className="w-full" variant="outline"
                    disabled={paying === inst.id}
                    onClick={() => handlePayNow(inst.id)}>
                    {paying === inst.id ? 'Processing...' : 'Pay Now'}
                  </Button>
                )}
                {inst.status === 'Overdue' && (
                  <Button className="w-full" variant="destructive"
                    disabled={paying === inst.id}
                    onClick={() => handlePayNow(inst.id)}>
                    {paying === inst.id ? 'Processing...' : 'Pay Overdue Amount'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No {selectedFilter === 'all' ? '' : selectedFilter} payments found</p>
        </div>
      )}
    </div>
  );
}