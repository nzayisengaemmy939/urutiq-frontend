import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar, Clock, Settings, Mail, Shield, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface RecurringLine {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface RecurringInvoiceFormData {
  customerId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval: number;
  startDate: string;
  endDate?: string;
  currency: string;
  notes?: string;
  terms?: string;
  dueDateOffset: number;
  autoSend: boolean;
  emailTemplate?: string;
  
  // Advanced Scheduling
  dayOfWeek?: number;
  dayOfMonth?: number;
  businessDaysOnly: boolean;
  skipHolidays: boolean;
  timezone: string;
  
  // Conditional Logic
  skipIfOutstandingBalance: boolean;
  maxOutstandingAmount?: number;
  skipIfCustomerInactive: boolean;
  requireApproval: boolean;
  approvalWorkflowId?: string;
  
  // Email Settings
  ccEmails: string[];
  bccEmails: string[];
  reminderDays: number[];
  
  lines: RecurringLine[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
}

interface EnhancedRecurringInvoiceFormProps {
  formData: RecurringInvoiceFormData;
  onChange: (data: RecurringInvoiceFormData) => void;
  customers: Array<{ id: string; name: string; email?: string; status?: string; outstandingBalance?: number }>;
  isEditing?: boolean;
  readOnly?: boolean;
}

const timezoneOptions = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'EST', label: 'EST (Eastern Standard Time)' },
  { value: 'PST', label: 'PST (Pacific Standard Time)' },
  { value: 'CET', label: 'CET (Central European Time)' },
  { value: 'JST', label: 'JST (Japan Standard Time)' },
  { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
  { value: 'IST', label: 'IST (India Standard Time)' },
  { value: 'AEST', label: 'AEST (Australian Eastern Standard Time)' },
];

const dayOfWeekOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getOrdinalSuffix(i + 1)}`
}));

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export function EnhancedRecurringInvoiceForm({
  formData,
  onChange,
  customers,
  isEditing = false,
  readOnly = false,
}: EnhancedRecurringInvoiceFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [ccEmailInput, setCcEmailInput] = useState('');
  const [bccEmailInput, setBccEmailInput] = useState('');
  const [reminderDayInput, setReminderDayInput] = useState('');

  const updateFormData = (updates: Partial<RecurringInvoiceFormData>) => {
    onChange({ ...formData, ...updates });
  };

  // Helpers
  const formatCurrency = (amount: number, currency: string) => {
    const amt = Number(amount) || 0;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amt);
    } catch {
      return `$${amt.toFixed(2)}`;
    }
  };

  const computeTotals = (lines: RecurringLine[] = []) => {
    const subtotal = lines.reduce((sum, l) => sum + ((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0)), 0);
    const taxTotal = lines.reduce((sum, l) => sum + ((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0) * (Number(l.taxRate) || 0) / 100), 0);
    const totalAmount = subtotal + taxTotal;
    return { subtotal, taxTotal, totalAmount };
  };

  const isValidEmail = (email: string) => /.+@.+\..+/.test(email.trim());

  // Simple next run date preview for sticky header
  const getNextRunDate = (): Date | null => {
    const { startDate, endDate, frequency, interval, dayOfWeek, dayOfMonth, businessDaysOnly } = formData;
    if (!startDate) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    let next = new Date(startDate);
    if (isNaN(next.getTime())) return null;
    next.setHours(0,0,0,0);

    const cap = 500;
    const addBusinessDays = (date: Date, days: number) => {
      let d = new Date(date);
      while (days > 0) {
        d.setDate(d.getDate() + 1);
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) days--;
      }
      return d;
    };

    const advance = () => {
      switch (frequency) {
        case 'daily':
          if (businessDaysOnly) next = addBusinessDays(next, Math.max(1, interval || 1));
          else next.setDate(next.getDate() + Math.max(1, interval || 1));
          break;
        case 'weekly': {
          const stepWeeks = Math.max(1, interval || 1);
          if (typeof dayOfWeek === 'number') {
            const cur = next.getDay();
            const diff = (dayOfWeek + 7 - cur) % 7 || 7;
            next.setDate(next.getDate() + diff + (stepWeeks - 1) * 7);
          } else {
            next.setDate(next.getDate() + stepWeeks * 7);
          }
          break;
        }
        case 'monthly': {
          const stepMonths = Math.max(1, interval || 1);
          const dom = dayOfMonth || next.getDate();
          next.setMonth(next.getMonth() + stepMonths, Math.min(dom, 28));
          const tryDate = new Date(next.getFullYear(), next.getMonth(), dom);
          if (!isNaN(tryDate.getTime())) next = tryDate;
          break;
        }
        case 'quarterly': {
          const stepQ = Math.max(1, interval || 1) * 3;
          const dom = dayOfMonth || next.getDate();
          next.setMonth(next.getMonth() + stepQ, Math.min(dom, 28));
          const tryDate = new Date(next.getFullYear(), next.getMonth(), dom);
          if (!isNaN(tryDate.getTime())) next = tryDate;
          break;
        }
        case 'yearly': {
          const stepYears = Math.max(1, interval || 1);
          const dom = dayOfMonth || next.getDate();
          next.setFullYear(next.getFullYear() + stepYears);
          next.setDate(Math.min(dom, 28));
          const tryDate = new Date(next.getFullYear(), next.getMonth(), dom);
          if (!isNaN(tryDate.getTime())) next = tryDate;
          break;
        }
        default:
          next.setDate(next.getDate() + 1);
      }
    };

    if (next > today) {
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0,0,0,0);
        if (next > end) return null;
      }
      return next;
    }

    let steps = 0;
    while (next <= today && steps++ < cap) {
      advance();
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0,0,0,0);
        if (next > end) return null;
      }
    }
    return steps >= cap ? null : next;
  };

  const nextRun = getNextRunDate();

  // Keep totals in sync when lines change
  useEffect(() => {
    const totals = computeTotals(formData.lines || []);
    if (
      Math.abs((formData.subtotal || 0) - totals.subtotal) > 1e-6 ||
      Math.abs((formData.taxTotal || 0) - totals.taxTotal) > 1e-6 ||
      Math.abs((formData.totalAmount || 0) - totals.totalAmount) > 1e-6
    ) {
      updateFormData({ ...totals });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.lines]);

  const addEmail = (type: 'cc' | 'bcc', email: string) => {
    if (!email.trim()) return;
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    
    const emailList = type === 'cc' ? (formData.ccEmails || []) : (formData.bccEmails || []);
    if (!emailList.includes(email.trim())) {
      const newEmails = [...emailList, email.trim()];
      updateFormData({ [type === 'cc' ? 'ccEmails' : 'bccEmails']: newEmails });
    }
    
    if (type === 'cc') setCcEmailInput('');
    else setBccEmailInput('');
  };

  const removeEmail = (type: 'cc' | 'bcc', email: string) => {
    const emailList = type === 'cc' ? (formData.ccEmails || []) : (formData.bccEmails || []);
    const newEmails = emailList.filter(e => e !== email);
    updateFormData({ [type === 'cc' ? 'ccEmails' : 'bccEmails']: newEmails });
  };

  const addReminderDay = (day: string) => {
    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 0) return;
    
    const reminderDays = formData.reminderDays || [];
    if (!reminderDays.includes(dayNum)) {
      updateFormData({ reminderDays: [...reminderDays, dayNum].sort((a, b) => a - b) });
    }
    setReminderDayInput('');
  };

  const removeReminderDay = (day: number) => {
    const reminderDays = formData.reminderDays || [];
    updateFormData({ reminderDays: reminderDays.filter(d => d !== day) });
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  return (
    <div className="space-y-6">
      {/* Sticky summary header */}
      <div className="sticky top-0 z-20 bg-white border-b p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Template</div>
            <div className="font-medium">{formData.name || 'Untitled recurring invoice'}</div>
          </div>
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          <div>
            <div className="text-sm text-muted-foreground">Customer</div>
            <div className="font-medium">{selectedCustomer?.name || 'Select customer'}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="font-semibold">{formatCurrency(computeTotals(formData.lines || []).totalAmount, formData.currency || 'USD')}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Next run</div>
            <div className="font-semibold">{nextRun ? nextRun.toLocaleDateString() : '—'}</div>
          </div>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="conditions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Conditions
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="lines" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Line Items
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Name *</Label>
                  <Input
                    disabled={readOnly}
                    className="border"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="Monthly Subscription"
                  />
                </div>
                <div>
                  <Label>Customer *</Label>
                  <Select value={formData.customerId} onValueChange={(value) => updateFormData({ customerId: value })}>
                    <SelectTrigger className="border" disabled={readOnly}>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{customer.name}</span>
                            {customer.outstandingBalance && customer.outstandingBalance > 0 && (
                              <Badge variant="outline" className="ml-2">
                                ${customer.outstandingBalance.toFixed(2)} outstanding
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  disabled={readOnly}
                  className="border"
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Recurring invoice description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => updateFormData({ currency: value })}>
                    <SelectTrigger className="border" disabled={readOnly}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date Offset (Days)</Label>
                  <Input
                    disabled={readOnly}
                    className="border font-mono text-right"
                    type="number"
                    min="0"
                    value={formData.dueDateOffset}
                    onChange={(e) => updateFormData({ dueDateOffset: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoSend"
                    disabled={readOnly}
                    checked={formData.autoSend}
                    onCheckedChange={(checked) => updateFormData({ autoSend: !!checked })}
                  />
                  <Label htmlFor="autoSend">Auto-send invoices</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    disabled={readOnly}
                    className="border"
                    value={formData.notes || ''}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    placeholder="Optional notes"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Terms</Label>
                  <Textarea
                    disabled={readOnly}
                    className="border"
                    value={formData.terms || ''}
                    onChange={(e) => updateFormData({ terms: e.target.value })}
                    placeholder="Payment terms"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Scheduling Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(value: any) => updateFormData({ frequency: value })}>
                    <SelectTrigger className="border" disabled={readOnly}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Interval</Label>
                  <Input
                    disabled={readOnly}
                    className="border font-mono text-right"
                    type="number"
                    min="1"
                    value={formData.interval}
                    onChange={(e) => updateFormData({ interval: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => updateFormData({ timezone: value })}>
                    <SelectTrigger className="border" disabled={readOnly}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezoneOptions.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    disabled={readOnly}
                    className="border"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormData({ startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date (Optional)</Label>
                  <Input
                    disabled={readOnly}
                    className="border"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => updateFormData({ endDate: e.target.value || undefined })}
                  />
                </div>
              </div>

              {/* Frequency-specific options */}
              {formData.frequency === 'weekly' && (
                <div>
                  <Label>Day of Week</Label>
                  <Select value={formData.dayOfWeek?.toString()} onValueChange={(value) => updateFormData({ dayOfWeek: parseInt(value) })}>
                    <SelectTrigger className="border" disabled={readOnly}>
                      <SelectValue placeholder="Select day of week" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOfWeekOptions.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(formData.frequency === 'monthly' || formData.frequency === 'quarterly' || formData.frequency === 'yearly') && (
                <div>
                  <Label>Day of Month</Label>
                  <Select value={formData.dayOfMonth?.toString()} onValueChange={(value) => updateFormData({ dayOfMonth: parseInt(value) })}>
                    <SelectTrigger className="border" disabled={readOnly}>
                      <SelectValue placeholder="Select day of month" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOfMonthOptions.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="businessDaysOnly"
                      disabled={readOnly}
                    checked={formData.businessDaysOnly}
                    onCheckedChange={(checked) => updateFormData({ businessDaysOnly: !!checked })}
                  />
                  <Label htmlFor="businessDaysOnly">Business days only (Monday-Friday)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipHolidays"
                      disabled={readOnly}
                    checked={formData.skipHolidays}
                    onCheckedChange={(checked) => updateFormData({ skipHolidays: !!checked })}
                  />
                  <Label htmlFor="skipHolidays">Skip holidays</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditional Logic Tab */}
        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conditional Logic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipIfOutstandingBalance"
                    disabled={readOnly}
                    checked={formData.skipIfOutstandingBalance}
                    onCheckedChange={(checked) => updateFormData({ skipIfOutstandingBalance: !!checked })}
                  />
                  <Label htmlFor="skipIfOutstandingBalance">Skip if customer has outstanding balance</Label>
                </div>

                {formData.skipIfOutstandingBalance && (
                  <div className="ml-6">
                    <Label>Maximum Outstanding Amount</Label>
                    <Input
                      disabled={readOnly}
                      className="border font-mono text-right"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxOutstandingAmount || ''}
                      onChange={(e) => updateFormData({ maxOutstandingAmount: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Skip generation if outstanding balance exceeds this amount
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipIfCustomerInactive"
                    disabled={readOnly}
                    checked={formData.skipIfCustomerInactive}
                    onCheckedChange={(checked) => updateFormData({ skipIfCustomerInactive: !!checked })}
                  />
                  <Label htmlFor="skipIfCustomerInactive">Skip if customer is inactive</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireApproval"
                    disabled={readOnly}
                    checked={formData.requireApproval}
                    onCheckedChange={(checked) => updateFormData({ requireApproval: !!checked })}
                  />
                  <Label htmlFor="requireApproval">Require approval before generation</Label>
                </div>

                {formData.requireApproval && (
                  <div className="ml-6">
                    <Label>Approval Workflow ID</Label>
                    <Input
                      disabled={readOnly}
                      className="border"
                      value={formData.approvalWorkflowId || ''}
                      onChange={(e) => updateFormData({ approvalWorkflowId: e.target.value })}
                      placeholder="workflow-id"
                    />
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Customer Information</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p><strong>Status:</strong> {selectedCustomer.status || 'Unknown'}</p>
                    <p><strong>Outstanding Balance:</strong> ${(selectedCustomer.outstandingBalance || 0).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email Template</Label>
                <Textarea
                  disabled={readOnly}
                  className="border"
                  value={formData.emailTemplate || ''}
                  onChange={(e) => updateFormData({ emailTemplate: e.target.value })}
                  placeholder="Custom email template (HTML supported)"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">Tip: Use variables like {'{'}{'{'}customer.name{'}'}{'}'}, {'{'}{'{'}invoice.total{'}'}{'}'}, {'{'}{'{'}due_date{'}'}{'}'}.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CC Emails</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        disabled={readOnly}
                        className="border"
                        value={ccEmailInput}
                        onChange={(e) => setCcEmailInput(e.target.value)}
                        placeholder="email@example.com"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addEmail('cc', ccEmailInput);
                          }
                        }}
                      />
                      <Button type="button" disabled={readOnly} onClick={() => addEmail('cc', ccEmailInput)}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(formData.ccEmails || []).map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <button
                            disabled={readOnly}
                            type="button"
                            onClick={() => removeEmail('cc', email)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>BCC Emails</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        disabled={readOnly}
                        className="border"
                        value={bccEmailInput}
                        onChange={(e) => setBccEmailInput(e.target.value)}
                        placeholder="email@example.com"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addEmail('bcc', bccEmailInput);
                          }
                        }}
                      />
                      <Button type="button" disabled={readOnly} onClick={() => addEmail('bcc', bccEmailInput)}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(formData.bccEmails || []).map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <button
                            disabled={readOnly}
                            type="button"
                            onClick={() => removeEmail('bcc', email)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Reminder Days</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      disabled={readOnly}
                      className="border font-mono text-right"
                      type="number"
                      min="0"
                      value={reminderDayInput}
                      onChange={(e) => setReminderDayInput(e.target.value)}
                      placeholder="Days before due date"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addReminderDay(reminderDayInput);
                        }
                      }}
                    />
                    <Button type="button" disabled={readOnly} onClick={() => addReminderDay(reminderDayInput)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(formData.reminderDays || []).map((day) => (
                      <Badge key={day} variant="secondary" className="flex items-center gap-1">
                        {day} days
                        <button
                          disabled={readOnly}
                          type="button"
                          onClick={() => removeReminderDay(day)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Send reminder emails this many days before the due date
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Items Tab */}
        <TabsContent value="lines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData.lines || []).length > 0 && (
                <div className="grid grid-cols-12 gap-2 px-3 text-xs text-muted-foreground">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-right">Quantity</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Tax %</div>
                  <div className="col-span-1" />
                </div>
              )}
              {(formData.lines || []).map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                   <div className="col-span-5">
                    <Label>Description</Label>
                    <Input
                      disabled={readOnly}
                      className="border"
                      value={line.description}
                      onChange={(e) => {
                        const lines = [...(formData.lines || [])];
                        lines[idx].description = e.target.value;
                        const totals = computeTotals(lines);
                        updateFormData({ lines, ...totals });
                      }}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      disabled={readOnly}
                      className="border font-mono text-right"
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.quantity}
                      onChange={(e) => {
                        const lines = [...(formData.lines || [])];
                        lines[idx].quantity = parseFloat(e.target.value) || 0;
                        const totals = computeTotals(lines);
                        updateFormData({ lines, ...totals });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      disabled={readOnly}
                      className="border font-mono text-right"
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => {
                        const lines = [...(formData.lines || [])];
                        lines[idx].unitPrice = parseFloat(e.target.value) || 0;
                        const totals = computeTotals(lines);
                        updateFormData({ lines, ...totals });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      disabled={readOnly}
                      className="border font-mono text-right"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={line.taxRate}
                      onChange={(e) => {
                        const lines = [...(formData.lines || [])];
                        lines[idx].taxRate = parseFloat(e.target.value) || 0;
                        const totals = computeTotals(lines);
                        updateFormData({ lines, ...totals });
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={readOnly}
                      onClick={() => {
                        const lines = (formData.lines || []).filter((_, i) => i !== idx);
                        const totals = computeTotals(lines);
                        updateFormData({ lines, ...totals });
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                disabled={readOnly}
                onClick={() => {
                  const lines = [...(formData.lines || []), { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }];
                  const totals = computeTotals(lines);
                  updateFormData({ lines, ...totals });
                }}
              >
                Add Line Item
              </Button>

              {/* Totals */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(formData.subtotal || 0, formData.currency || 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(formData.taxTotal || 0, formData.currency || 'USD')}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(formData.totalAmount || 0, formData.currency || 'USD')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
