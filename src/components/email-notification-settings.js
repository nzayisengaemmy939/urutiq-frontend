import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Bell, Settings, Save, TestTube, CheckCircle, XCircle, Info } from 'lucide-react';
export function EmailNotificationSettings({ companyId }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // State
    const [settings, setSettings] = useState({
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
    const [testResult, setTestResult] = useState(null);
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
        mutationFn: async (newSettings) => {
            // Mock API call - in real app, this would save to backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            return newSettings;
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Email notification settings saved successfully" });
            queryClient.invalidateQueries({ queryKey: ['email-notification-settings'] });
        },
        onError: (error) => {
            toast({ title: "Error", description: error?.message || 'Failed to save settings', variant: "destructive" });
        }
    });
    // Test email mutation
    const testEmailMutation = useMutation({
        mutationFn: async (email) => {
            // Mock API call - in real app, this would send a test email
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Simulate success/failure
            if (email.includes('@')) {
                return { success: true, message: 'Test email sent successfully' };
            }
            else {
                throw new Error('Invalid email address');
            }
        },
        onSuccess: (result) => {
            setTestResult(result);
            toast({ title: "Success", description: "Test email sent successfully" });
        },
        onError: (error) => {
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
    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };
    if (isLoading) {
        return _jsx("div", { className: "text-center py-8", children: "Loading settings..." });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Card, { children: _jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Mail, { className: "w-5 h-5" }), _jsx("span", { children: "Email Notification Settings" })] }), _jsx(CardDescription, { children: "Configure email notifications for journal entry activities" })] }) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Settings, { className: "w-5 h-5" }), _jsx("span", { children: "SMTP Configuration" })] }), _jsx(CardDescription, { children: "Configure your email server settings" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "enabled", checked: settings.enabled, onCheckedChange: (checked) => updateSetting('enabled', checked) }), _jsx(Label, { htmlFor: "enabled", children: "Enable Email Notifications" })] }), settings.enabled && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "smtpHost", children: "SMTP Host" }), _jsx(Input, { id: "smtpHost", value: settings.smtpHost, onChange: (e) => updateSetting('smtpHost', e.target.value), placeholder: "smtp.gmail.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "smtpPort", children: "SMTP Port" }), _jsx(Input, { id: "smtpPort", type: "number", value: settings.smtpPort, onChange: (e) => updateSetting('smtpPort', parseInt(e.target.value)), placeholder: "587" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "smtpUser", children: "SMTP Username" }), _jsx(Input, { id: "smtpUser", value: settings.smtpUser, onChange: (e) => updateSetting('smtpUser', e.target.value), placeholder: "your-email@gmail.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "smtpFrom", children: "From Email" }), _jsx(Input, { id: "smtpFrom", value: settings.smtpFrom, onChange: (e) => updateSetting('smtpFrom', e.target.value), placeholder: "noreply@yourcompany.com" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "smtpSecure", checked: settings.smtpSecure, onCheckedChange: (checked) => updateSetting('smtpSecure', checked) }), _jsx(Label, { htmlFor: "smtpSecure", children: "Use SSL/TLS" })] }), _jsxs(Alert, { children: [_jsx(Info, { className: "w-4 h-4" }), _jsx(AlertDescription, { children: "For Gmail, use smtp.gmail.com with port 587 and enable SSL/TLS. You may need to generate an App Password for authentication." })] })] }))] })] }), settings.enabled && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Bell, { className: "w-5 h-5" }), _jsx("span", { children: "Notification Types" })] }), _jsx(CardDescription, { children: "Choose which events should trigger email notifications" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "approvalRequests", children: "Approval Requests" }), _jsx("p", { className: "text-sm text-gray-600", children: "Send emails when journal entries require approval" })] }), _jsx(Switch, { id: "approvalRequests", checked: settings.approvalRequests, onCheckedChange: (checked) => updateSetting('approvalRequests', checked) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "approvalResponses", children: "Approval Responses" }), _jsx("p", { className: "text-sm text-gray-600", children: "Send emails when approval requests are approved or rejected" })] }), _jsx(Switch, { id: "approvalResponses", checked: settings.approvalResponses, onCheckedChange: (checked) => updateSetting('approvalResponses', checked) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "statusChanges", children: "Status Changes" }), _jsx("p", { className: "text-sm text-gray-600", children: "Send emails when journal entries are posted or reversed" })] }), _jsx(Switch, { id: "statusChanges", checked: settings.statusChanges, onCheckedChange: (checked) => updateSetting('statusChanges', checked) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "entryCreated", children: "Entry Created" }), _jsx("p", { className: "text-sm text-gray-600", children: "Send emails when new journal entries are created" })] }), _jsx(Switch, { id: "entryCreated", checked: settings.entryCreated, onCheckedChange: (checked) => updateSetting('entryCreated', checked) })] })] }) })] })), settings.enabled && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(TestTube, { className: "w-5 h-5" }), _jsx("span", { children: "Test Email Configuration" })] }), _jsx(CardDescription, { children: "Send a test email to verify your configuration" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { placeholder: "Enter email address to test", value: settings.testEmail, onChange: (e) => updateSetting('testEmail', e.target.value), className: "flex-1" }), _jsx(Button, { onClick: handleTestEmail, disabled: isTesting || !settings.testEmail, variant: "outline", children: isTesting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" }), "Testing..."] })) : (_jsxs(_Fragment, { children: [_jsx(TestTube, { className: "w-4 h-4 mr-2" }), "Send Test"] })) })] }), testResult && (_jsxs(Alert, { className: testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50', children: [testResult.success ? (_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" })) : (_jsx(XCircle, { className: "w-4 h-4 text-red-600" })), _jsx(AlertDescription, { className: testResult.success ? 'text-green-800' : 'text-red-800', children: testResult.message })] }))] })] })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: handleSaveSettings, disabled: saveSettingsMutation.isPending, className: "min-w-[120px]", children: saveSettingsMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Settings"] })) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Notification Status" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: settings.enabled ? 'ON' : 'OFF' }), _jsx("div", { className: "text-sm text-gray-600", children: "Email Notifications" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: [settings.approvalRequests, settings.approvalResponses, settings.statusChanges, settings.entryCreated].filter(Boolean).length }), _jsx("div", { className: "text-sm text-gray-600", children: "Active Types" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: settings.smtpHost ? '✓' : '✗' }), _jsx("div", { className: "text-sm text-gray-600", children: "SMTP Configured" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: testResult?.success ? '✓' : '?' }), _jsx("div", { className: "text-sm text-gray-600", children: "Test Status" })] })] }) })] })] }));
}
