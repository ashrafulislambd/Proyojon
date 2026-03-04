import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Store, DollarSign, CheckCircle, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function MerchantDashboard() {
  const { merchants, addMerchant, verifyMerchant, processMerchantSettlement } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    addMerchant(formData);
    toast.success('Merchant onboarded successfully');
    setFormData({ businessName: '', email: '', phone: '', address: '' });
    setIsAddDialogOpen(false);
  };

  const handleVerify = (merchantId: string) => {
    verifyMerchant(merchantId);
    toast.success('Merchant verified successfully');
  };

  const handleProcessSettlement = (merchantId: string, businessName: string) => {
    processMerchantSettlement(merchantId);
    toast.success(`Settlement processed for ${businessName}`);
  };

  const totalMerchants = merchants.length;
  const verifiedMerchants = merchants.filter(m => m.verified).length;
  const totalPendingSettlement = merchants.reduce((sum, m) => sum + m.pendingSettlement, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Merchant Management</h1>
          <p className="text-gray-500 mt-1">Onboard and manage merchants</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Onboard Merchant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Onboard New Merchant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Onboard Merchant</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{totalMerchants}</p>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Verified Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{verifiedMerchants}</p>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Settlement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">${totalPendingSettlement.toFixed(2)}</p>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Merchants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Merchants</CardTitle>
        </CardHeader>
        <CardContent>
          {merchants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No merchants yet. Onboard your first merchant to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">{merchant.businessName}</TableCell>
                      <TableCell>{merchant.email}</TableCell>
                      <TableCell>{merchant.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {merchant.verified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>${merchant.totalSales.toFixed(2)}</TableCell>
                      <TableCell>${merchant.pendingSettlement.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {!merchant.verified && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(merchant.id)}
                            >
                              Verify
                            </Button>
                          )}
                          {merchant.pendingSettlement > 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessSettlement(merchant.id, merchant.businessName)}
                            >
                              Pay Out
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlement History */}
      {merchants.some(m => m.settlements.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {merchants
                .flatMap(m => m.settlements.map(s => ({ ...s, merchantName: m.businessName })))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((settlement) => (
                  <div
                    key={settlement.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{settlement.merchantName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(settlement.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${settlement.amount.toFixed(2)}</p>
                      <Badge className="bg-green-100 text-green-800 mt-1">Completed</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
