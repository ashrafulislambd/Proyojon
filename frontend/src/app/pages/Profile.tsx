import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
  const { currentUser, updateUserProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', zipCode: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        zipCode: currentUser.zip_code || '',
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div className="text-center py-12 text-gray-500">Please log in to view your profile.</div>;
  }

  const handleSave = async () => {
    try {
      await updateUserProfile({ ...formData, zip_code: formData.zipCode } as any);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const creditScore = currentUser.credit_score || 0;
  const creditRating = creditScore >= 700 ? 'Excellent' : creditScore >= 600 ? 'Good' : creditScore >= 500 ? 'Fair' : 'Poor';
  const creditBadge = creditScore >= 700 ? 'bg-green-100 text-green-800' : creditScore >= 600 ? 'bg-blue-100 text-blue-800' : creditScore >= 500 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information and credit details</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="credit">Credit Info</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button variant={isEditing ? 'outline' : 'default'} onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', field: 'name', icon: User, type: 'text' },
                  { label: 'Email', field: 'email', icon: Mail, type: 'email' },
                  { label: 'Phone', field: 'phone', icon: Phone, type: 'tel' },
                  { label: 'Address', field: 'address', icon: MapPin, type: 'text' },
                  { label: 'City', field: 'city', icon: null, type: 'text' },
                  { label: 'ZIP Code', field: 'zipCode', icon: null, type: 'text' },
                ].map(({ label, field, type }) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{label}</Label>
                    <Input
                      id={field}
                      type={type}
                      value={(formData as any)[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="flex justify-end">
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Verification Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Email Verified', verified: currentUser.email_verified, icon: Mail },
                  { label: 'Phone Verified', verified: currentUser.phone_verified, icon: Phone },
                  { label: 'KYC Status', verified: currentUser.kyc_status === 'Verified', icon: Shield },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <XCircle className="h-3 w-3 mr-1" />Pending
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">KYC Status: <strong>{currentUser.kyc_status}</strong>. Complete verification to unlock higher credit limits.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Info Tab */}
        <TabsContent value="credit" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Credit Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Credit Score</p>
                    <p className="text-3xl font-bold">{creditScore}</p>
                  </div>
                </div>
                <Badge className={creditBadge}>{creditRating}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Credit Limit</p>
                  <p className="text-xl font-bold">${Number(currentUser.credit_limit || 0).toFixed(0)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Available Credit</p>
                  <p className="text-xl font-bold text-green-600">${Number(currentUser.remaining_credit || 0).toFixed(0)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Outstanding</p>
                  <p className="text-xl font-bold text-orange-600">${Number(currentUser.total_due || 0).toFixed(0)}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">How to Improve Your Score</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Make installment payments on time</li>
                  <li>Complete KYC verification</li>
                  <li>Keep outstanding balance low</li>
                  <li>Complete orders fully (deliver)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
