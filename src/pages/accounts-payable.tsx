import React, { useEffect, useState } from 'react';
import { PageLayout } from '../components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Download,
  RefreshCw,
  Loader2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../lib/api';
import { purchaseApi } from '../lib/api/accounting';
import { getCompanyId, getTenantId } from '../lib/config';

interface Bill {
  id: string;
  billNumber: string;
  vendor: {
    name: string;
  };
  totalAmount: number;
  balanceDue: number;
  status: string;
  dueDate: string;
  invoiceDate: string;
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  notes?: string;
}

interface PaymentFormData {
  billId: string;
  amount: number;
  paymentMethod: 'check' | 'bank_transfer' | 'credit_card' | 'cash';
  notes?: string;
}

export default function AccountsPayablePage() {
  const [companyId, setCompanyId] = useState<string>(getCompanyId());
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Payment form state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    billId: '',
    amount: 0,
    paymentMethod: 'bank_transfer',
    notes: ''
  });

  // Listen for company changes from header
  useEffect(() => {
    const handleStorageChange = () => {
      const newCompanyId = getCompanyId();
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Accounts Payable page - Company changed from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
        loadBills();
        loadPayments();
      }
    };

    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Accounts Payable page - Company changed via custom event from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
        loadBills();
        loadPayments();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [companyId]);

  // Load bills on component mount
  useEffect(() => {
    loadBills();
    loadPayments();
  }, [companyId]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const { bills } = await purchaseApi.getBills(companyId, undefined, 1, 50);
      setBills(bills || []);
    } catch (error) {
      console.error('Error loading bills:', error);
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      // This would need to be implemented in the API
      // For now, we'll use a placeholder
      setPayments([]);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handlePaymentClick = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentForm({
      billId: bill.id,
      amount: bill.balanceDue,
      paymentMethod: 'bank_transfer',
      notes: ''
    });
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      setLoading(true);
      
      const result = await apiService.processPayment({
        billId: paymentForm.billId,
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      });

      toast.success('Payment processed successfully!', {
        description: `Payment of $${paymentForm.amount} recorded with journal entry ${result.journalEntry?.id || result.accountingEntries?.journalEntryId || 'N/A'}`
      });
      
      // Reload bills and payments
      await loadBills();
      await loadPayments();
      // Close dialog
      setShowPaymentDialog(false);
      setSelectedBill(null);
      setPaymentForm({
        billId: '',
        amount: 0,
        paymentMethod: 'bank_transfer',
        notes: ''
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment', {
        description: 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'partially_paid':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Partially Paid</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <CreditCard className="w-4 h-4" />;
      case 'check':
        return <FileText className="w-4 h-4" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const pendingBills = bills.filter(bill => bill.status !== 'paid');
  const paidBills = bills.filter(bill => bill.status === 'paid');
  const totalPending = pendingBills.reduce((sum, bill) => sum + bill.balanceDue, 0);
  const totalPaid = paidBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

  return (
    <PageLayout title="Accounts Payable" description="Manage vendor payments and bills">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBills.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalPending)} total due
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidBills.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalPaid)} total paid
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bills.length}</div>
              <p className="text-xs text-muted-foreground">
                All bills this period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bills</CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={loadBills} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading bills...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
                      <TableCell>{bill.vendor.name}</TableCell>
                      <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                      <TableCell>{formatCurrency(bill.balanceDue)}</TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell>{formatDate(bill.dueDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentClick(bill)}
                            disabled={bill.status === 'paid'}
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Pay
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
              <DialogDescription>
                Record payment for {selectedBill?.vendor.name} - {selectedBill?.billNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    value={formatCurrency(selectedBill?.totalAmount || 0)}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="balanceDue">Balance Due</Label>
                  <Input
                    id="balanceDue"
                    value={formatCurrency(selectedBill?.balanceDue || 0)}
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({
                    ...paymentForm,
                    amount: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value: any) => setPaymentForm({
                    ...paymentForm,
                    paymentMethod: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="check">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Check
                      </div>
                    </SelectItem>
                    <SelectItem value="credit_card">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Credit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Cash
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add payment notes..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({
                    ...paymentForm,
                    notes: e.target.value
                  })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={loading || paymentForm.amount <= 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
