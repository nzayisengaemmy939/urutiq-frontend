import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  FileText, 
  CreditCard, 
  Settings, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { PageLayout } from '@/components/page-layout';
import { SupplierDashboard } from '@/components/supplier-dashboard';

interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  companyName: string;
  paymentTerms: string;
  createdAt: string;
  updatedAt: string;
}

interface SupplierPayment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  status: 'pending' | 'completed' | 'failed';
  invoiceId: string;
  invoiceNumber: string;
  reference: string;
  notes: string;
}

interface SupplierProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  website: string;
  contactPerson: string;
  paymentTerms: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupplierStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averagePaymentDays: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
}

export default function SupplierPortal() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<SupplierProfile>>({});

  // Fetch supplier profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['supplier-profile', user?.id],
    queryFn: () => apiService.getSupplierProfile(user?.id || ''),
    enabled: !!user?.id && isAuthenticated
  });

  // Fetch supplier statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['supplier-stats', user?.id],
    queryFn: () => apiService.getSupplierStats(user?.id || ''),
    enabled: !!user?.id && isAuthenticated
  });

  // Fetch supplier invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['supplier-invoices', user?.id],
    queryFn: () => apiService.getSupplierInvoices(user?.id || ''),
    enabled: !!user?.id && isAuthenticated
  });

  // Fetch supplier payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['supplier-payments', user?.id],
    queryFn: () => apiService.getSupplierPayments(user?.id || ''),
    enabled: !!user?.id && isAuthenticated
  });

  // Initialize profile form when profile data loads
  useEffect(() => {
    if (profile) {
      setProfileForm(profile);
    }
  }, [profile]);

  const handleProfileUpdate = async () => {
    try {
      await apiService.updateSupplierProfile(user?.id || '', profileForm);
      setIsEditingProfile(false);
      refetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout title="Supplier Portal">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Access Denied</CardTitle>
              <CardDescription className="text-center">
                Please log in to access the supplier portal.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Supplier Portal">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile?.name || 'Supplier'}</h1>
            <p className="text-muted-foreground">
              Manage your invoices, payments, and account information
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={profile?.isActive ? 'default' : 'secondary'}>
              {profile?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  ${stats.totalAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.paidInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  ${stats.paidAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  ${stats.pendingAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  ${stats.overdueAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <SupplierDashboard />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>View and manage all your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : invoices && invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {invoice.companyName} • {new Date(invoice.invoiceDate).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getStatusColor(invoice.status)}>
                                {getStatusIcon(invoice.status)}
                                <span className="ml-1 capitalize">{invoice.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {invoice.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                              <span>Terms: {invoice.paymentTerms}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${invoice.amount.toLocaleString()}</div>
                            <div className="flex space-x-2 mt-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Invoices Found</h3>
                    <p className="text-muted-foreground">
                      You don't have any invoices yet. Invoices will appear here once they're created.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all your payments and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-semibold">{payment.paymentNumber}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Invoice: {payment.invoiceNumber} • {new Date(payment.paymentDate).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getStatusColor(payment.status)}>
                                {getStatusIcon(payment.status)}
                                <span className="ml-1 capitalize">{payment.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Method: {payment.method.replace('_', ' ').toUpperCase()}
                            </p>
                            {payment.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Notes: {payment.notes}
                              </p>
                            )}
                            {payment.reference && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Reference: {payment.reference}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${payment.amount.toLocaleString()}</div>
                            <div className="flex space-x-2 mt-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                    <p className="text-muted-foreground">
                      You don't have any payments yet. Payments will appear here once they're processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Company Profile</CardTitle>
                    <CardDescription>Manage your company information and settings</CardDescription>
                  </div>
                  <Button
                    variant={isEditingProfile ? "outline" : "default"}
                    onClick={() => {
                      if (isEditingProfile) {
                        setProfileForm(profile || {});
                        setIsEditingProfile(false);
                      } else {
                        setIsEditingProfile(true);
                      }
                    }}
                  >
                    {isEditingProfile ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                          id="name"
                          value={profileForm.name || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileForm.website || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          value={profileForm.taxId || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, taxId: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={profileForm.address || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={profileForm.city || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={profileForm.state || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            value={profileForm.postalCode || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={profileForm.country || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                            disabled={!isEditingProfile}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={profileForm.contactPerson || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Select
                          value={profileForm.paymentTerms || ''}
                          onValueChange={(value) => setProfileForm({ ...profileForm, paymentTerms: value })}
                          disabled={!isEditingProfile}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="net_15">Net 15</SelectItem>
                            <SelectItem value="net_30">Net 30</SelectItem>
                            <SelectItem value="net_45">Net 45</SelectItem>
                            <SelectItem value="net_60">Net 60</SelectItem>
                            <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                {isEditingProfile && (
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleProfileUpdate}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
