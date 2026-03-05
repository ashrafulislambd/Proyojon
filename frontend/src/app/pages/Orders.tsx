import { useEffect } from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { formatDate } from '../utils/dateUtils';
import { Package, ShoppingCart, Loader2 } from 'lucide-react';

const statusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-800';
    case 'Confirmed': return 'bg-blue-100 text-blue-800';
    case 'Shipped': return 'bg-purple-100 text-purple-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

const planLabel = (plan: string) => {
  switch (plan) {
    case '3months': return '3 Monthly Payments';
    case '6months': return '6 Monthly Payments (5% interest)';
    case '12months': return '12 Monthly Payments (10% interest)';
    default: return 'Paid in Full';
  }
};

export function Orders() {
  const { orders, fetchOrders, currentUser } = useApp();

  useEffect(() => {
    fetchOrders();
  }, []);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your orders.</p>
        <Link to="/"><Button className="mt-4">Login</Button></Link>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
        <p className="text-gray-500 mb-6">Start shopping to create your first order.</p>
        <Link to="/home">
          <Button><ShoppingCart className="h-4 w-4 mr-2" />Shop Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.date, 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(order.status)}>{order.status}</Badge>
                  <Badge variant="outline">{planLabel(order.paymentPlan)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Total</span>
                  <span className="font-medium">${Number(order.total).toFixed(2)}</span>
                </div>
                {Number(order.outstandingBalance) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Outstanding Balance</span>
                    <span className="font-medium text-orange-600">${Number(order.outstandingBalance).toFixed(2)}</span>
                  </div>
                )}
                {order.creditScoreUsed && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Credit Score at Order</span>
                    <span className="font-medium">{order.creditScoreUsed}</span>
                  </div>
                )}
              </div>

              {/* Installment Plan Preview */}
              {order.installment_info && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Installment Plan</p>
                  <div className="grid grid-cols-3 gap-2">
                    {order.installment_info.installments?.map((inst) => (
                      <div key={inst.id} className={`text-center p-2 rounded-lg text-xs border ${inst.status === 'Paid' ? 'bg-green-50 border-green-200 text-green-800' :
                        inst.status === 'Overdue' ? 'bg-red-50 border-red-200 text-red-800' :
                          'bg-gray-50 border-gray-200 text-gray-700'
                        }`}>
                        <p className="font-medium">#{inst.number}</p>
                        <p>${Number(inst.amount).toFixed(2)}</p>
                        <p className="text-xs">{formatDate(inst.dueDate, 'MMM dd')}</p>
                        <p className="font-semibold">{inst.status}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/home/repayments">
                    <Button variant="outline" size="sm">Manage Repayments</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}