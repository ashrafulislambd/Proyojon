import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { CreditCard, Calendar, Lock, CheckCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export function Checkout() {
  const navigate = useNavigate();
  const { cart, createOrder, currentUser } = useApp();
  const [paymentPlan, setPaymentPlan] = useState<'full' | '3months' | '6months' | '12months'>('3months');
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingData, setBillingData] = useState({
    firstName: '', lastName: '', email: currentUser?.email || '', address: currentUser?.address || '',
    city: currentUser?.city || '', zip: currentUser?.zip_code || '',
    cardNumber: '', expiry: '', cvv: '',
  });

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const creditScore = currentUser?.credit_score || 0;
  const creditLimit = currentUser?.credit_limit || 0;
  const isEligible = creditScore >= 500 && subtotal <= creditLimit;
  const maxCreditLimit = creditLimit;

  const paymentOptions = [
    { id: 'full' as const, label: 'Pay in Full', description: 'One-time payment', installments: 1, amount: subtotal, interest: 0, total: subtotal, recommended: false },
    { id: '3months' as const, label: '3 Monthly Payments', description: '0% interest', installments: 3, amount: subtotal / 3, interest: 0, total: subtotal, recommended: true },
    { id: '6months' as const, label: '6 Monthly Payments', description: '5% interest', installments: 6, amount: (subtotal * 1.05) / 6, interest: 5, total: subtotal * 1.05, recommended: false },
    { id: '12months' as const, label: '12 Monthly Payments', description: '10% interest', installments: 12, amount: (subtotal * 1.10) / 12, interest: 10, total: subtotal * 1.10, recommended: false },
  ];

  const selectedOption = paymentOptions.find(o => o.id === paymentPlan)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible && paymentPlan !== 'full') {
      toast.error('You are not eligible for BNPL. Please improve your credit score or reduce cart amount.');
      return;
    }
    if (!currentUser) {
      toast.error('Please log in to place an order');
      navigate('/');
      return;
    }
    setIsProcessing(true);
    try {
      const orderId = await createOrder(paymentPlan);
      toast.success(`Order #${orderId} placed successfully!`);
      navigate('/home/orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/home/cart');
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      {/* Eligibility Banner */}
      <Card className={isEligible || paymentPlan === 'full' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {isEligible ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Eligible for BNPL</p>
                  <p className="text-sm text-green-700">
                    Credit Score: {creditScore} · Credit Limit: ${Number(maxCreditLimit).toFixed(0)} · Order: ${subtotal.toFixed(2)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">BNPL Requires Improvement</p>
                  <p className="text-sm text-red-700">
                    {creditScore < 500
                      ? `Min credit score required: 500 (Your score: ${creditScore})`
                      : `Order ($${subtotal.toFixed(2)}) exceeds your limit ($${maxCreditLimit})`}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Choose Payment Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentPlan} onValueChange={(value: any) => setPaymentPlan(value)}>
                  <div className="space-y-3">
                    {paymentOptions.map(option => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentPlan === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          } ${!isEligible && option.id !== 'full' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={option.id} id={option.id} disabled={!isEligible && option.id !== 'full'} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{option.label}</p>
                              {option.recommended && <Badge className="bg-green-500">Recommended</Badge>}
                            </div>
                            <p className="text-sm text-gray-500">{option.description}</p>
                            {option.interest > 0 && (
                              <p className="text-xs text-gray-400 mt-1">Total: ${option.total.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${option.amount.toFixed(2)}</p>
                          {option.id !== 'full' && <p className="text-xs text-gray-500">per month</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>

                {paymentPlan !== 'full' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Payment Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">First Payment:</span>
                        <span className="font-medium">Today — ${selectedOption.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next payment due:</span>
                        <span className="font-medium">{format(addDays(new Date(), 30), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-medium">{selectedOption.interest}%</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${selectedOption.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">✨ No hidden fees · Late payment attracts additional charges</p>
                </div>
              </CardContent>
            </Card>

            {/* Billing */}
            <Card>
              <CardHeader><CardTitle>Billing Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={billingData.firstName} onChange={e => setBillingData(p => ({ ...p, firstName: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={billingData.lastName} onChange={e => setBillingData(p => ({ ...p, lastName: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={billingData.email} onChange={e => setBillingData(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={billingData.address} onChange={e => setBillingData(p => ({ ...p, address: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={billingData.city} onChange={e => setBillingData(p => ({ ...p, city: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code</Label>
                    <Input value={billingData.zip} onChange={e => setBillingData(p => ({ ...p, zip: e.target.value }))} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" value={billingData.cardNumber}
                    onChange={e => setBillingData(p => ({ ...p, cardNumber: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" value={billingData.expiry}
                      onChange={e => setBillingData(p => ({ ...p, expiry: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" value={billingData.cvv}
                      onChange={e => setBillingData(p => ({ ...p, cvv: e.target.value }))} required />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} × {item.quantity}</span>
                      <span className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Interest</span><span>${(selectedOption.total - subtotal).toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span className="text-green-600">FREE</span></div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">${selectedOption.total.toFixed(2)}</span>
                </div>

                {paymentPlan !== 'full' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-semibold mb-1">Today's Payment</p>
                    <p className="text-2xl font-bold">${selectedOption.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Then {selectedOption.installments - 1} more payments of ${selectedOption.amount.toFixed(2)}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing || (!isEligible && paymentPlan !== 'full')}
                >
                  {isProcessing ? 'Processing...' : <><Lock className="h-4 w-4 mr-2" />Place Order</>}
                </Button>
                <p className="text-xs text-gray-500 text-center">🔒 Your payment information is secure</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}