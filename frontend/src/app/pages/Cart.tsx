import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

export function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity } = useApp();

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }
    updateCartQuantity(productId, newQuantity);
  };

  const handleRemove = (productId: string, name: string) => {
    removeFromCart(productId);
    toast.success(`${name} removed from cart`);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-semibold hover:text-blue-600 truncate">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                    <p className="text-lg font-bold">${Number(item.price).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      or ${(Number(item.price) / 4).toFixed(2)}/week
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item.id, item.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <div className="flex items-center gap-2 border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2">Flexible Payment</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Pay in 2 weeks: ${(subtotal / 2).toFixed(2)}</p>
                  <p>• Weekly for 1 month: ${(subtotal / 4).toFixed(2)}</p>
                  <p>• Monthly for 3 months: ${(subtotal / 3).toFixed(2)}</p>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate('/home/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Link to="/home">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              <p className="text-xs text-gray-500 text-center">
                🔒 Secure checkout · 0% interest
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
