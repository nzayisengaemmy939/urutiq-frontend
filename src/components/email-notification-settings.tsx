import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Bell, 
  Settings, 
  Save, 
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface EmailNotificationSettingsProps {
  companyId: string;
}

interface NotificationSettings {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpFrom: string;
  approvalRequests: boolean;
  approvalResponses: boolean;
  statusChanges: boolean;
  entryCreated: boolean;
  testEmail: string;
}

export function EmailNotificationSettings({ companyId }: EmailNotificationSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpFrom: '',
    approvalRequests: true,
    approvalResponses: true,
    statusChanges: true,
    entryCreated: false,
    testEmail: ''
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Mock query for settings (in real app, this would fetch from API)
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['email-notification-settings', companyId],
    queryFn: async () => {
      // Mock data - in real app, this would be an API call
      return {
        enabled: false,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: '',
        smtpFrom: '',
        approvalRequests: true,
        approvalResponses: true,
        statusChanges: true,
        entryCreated: false
      };
    }
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      // Mock API call - in real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSettings;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Email notification settings saved successfully" });
      queryClient.invalidateQueries({ queryKey: ['email-notification-settings'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || 'Failed to save settings', variant: "destructive" });
    }
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      // Mock API call - in real app, this would send a test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure
      if (email.includes('@')) {
        return { success: true, message: 'Test email sent successfully' };
      } else {
        throw new Error('Invalid email address');
      }
    },
    onSuccess: (result) => {
      setTestResult(result);
      toast({ title: "Success", description: "Test email sent successfully" });
    },
    onError: (error: any) => {
      setTestResult({ success: false, message: error?.message || 'Failed to send test email' });
      toast({ title: "Error", description: error?.message || 'Failed to send test email', variant: "destructive" });
    }
  });

  // Handlers
  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleTestEmail = () => {
    if (!settings.testEmail) {
      toast({ title: "Error", description: "Please enter an email address to test", variant: "destructive" });
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    testEmailMutation.mutate(settings.testEmail);
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Email Notification Settings</span>
          </CardTitle>
          <CardDescription>
            Configure email notifications for journal entry activities
          </CardDescription>
        </CardHeader>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>SMTP Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure your email server settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
            <Label htmlFor="enabled">Enable Email Notifications</Label>
          </div>

          {settings.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>

                <div>
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => updateSetting('smtpUser', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <Label htmlFor="smtpFrom">From Email</Label>
                  <Input
                    id="smtpFrom"
                    value={settings.smtpFrom}
                    onChange={(e) => updateSetting('smtpFrom', e.target.value)}
                    placeholder="noreply@yourcompany.com"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={settings.smtpSecure}
                  onCheckedChange={(checked) => updateSetting('smtpSecure', checked)}
                />
                <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
              </div>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  For Gmail, use smtp.gmail.com with port 587 and enable SSL/TLS. 
                  You may need to generate an App Password for authentication.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      {settings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Types</span>
            </CardTitle>
            <CardDescription>
              Choose which events should trigger email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="approvalRequests">Approval Requests</Label>
                  <p className="text-sm text-gray-600">Send emails when journal entries require approval</p>
                </div>
                <Switch
                  id="approvalRequests"
                  checked={settings.approvalRequests}
                  onCheckedChange={(checked) => updateSetting('approvalRequests', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="approvalResponses">Approval Responses</Label>
                  <p className="text-sm text-gray-600">Send emails when approval requests are approved or rejected</p>
                </div>
                <Switch
                  id="approvalResponses"
                  checked={settings.approvalResponses}
                  onCheckedChange={(checked) => updateSetting('approvalResponses', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="statusChanges">Status Changes</Label>
                  <p className="text-sm text-gray-600">Send emails when journal entries are posted or reversed</p>
                </div>
                <Switch
                  id="statusChanges"
                  checked={settings.statusChanges}
                  onCheckedChange={(checked) => updateSetting('statusChanges', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="entryCreated">Entry Created</Label>
                  <p className="text-sm text-gray-600">Send emails when new journal entries are created</p>
                </div>
                <Switch
                  id="entryCreated"
                  checked={settings.entryCreated}
                  onCheckedChange={(checked) => updateSetting('entryCreated', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Email */}
      {settings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Test Email Configuration</span>
            </CardTitle>
            <CardDescription>
              Send a test email to verify your configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address to test"
                value={settings.testEmail}
                onChange={(e) => updateSetting('testEmail', e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleTestEmail}
                disabled={isTesting || !settings.testEmail}
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          className="min-w-[120px]"
        >
          {saveSettingsMutation.isPending ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {settings.enabled ? 'ON' : 'OFF'}
              </div>
              <div className="text-sm text-gray-600">Email Notifications</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {[settings.approvalRequests, settings.approvalResponses, settings.statusChanges, settings.entryCreated].filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Active Types</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {settings.smtpHost ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">SMTP Configured</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {testResult?.success ? '✓' : '?'}
              </div>
              <div className="text-sm text-gray-600">Test Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
