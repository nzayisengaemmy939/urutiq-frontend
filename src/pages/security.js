import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { PageLayout } from "../components/page-layout";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/auth-context";
import { useState, useEffect } from "react";
import { securityApi } from "../lib/api/security";
import { Shield, Key, Eye, AlertTriangle, CheckCircle, Clock, Users, FileText, Activity, Database, Globe, Smartphone, RefreshCw, QrCode, Copy, Trash2, Plus, Monitor, MapPin, Calendar, } from "lucide-react";
export default function SecurityPage() {
    const { toast } = useToast();
    const { clearAllData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState(null);
    const [accessControl, setAccessControl] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [compliance, setCompliance] = useState(null);
    const [encryption, setEncryption] = useState(null);
    const [monitoring, setMonitoring] = useState(null);
    // MFA Management State
    const [mfaSetup, setMfaSetup] = useState(null);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [mfaVerificationToken, setMfaVerificationToken] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [showQRModal, setShowQRModal] = useState(false);
    // Session Management State
    const [sessions, setSessions] = useState([]);
    // IP Whitelist State
    const [ipWhitelist, setIpWhitelist] = useState([]);
    const [newIP, setNewIP] = useState('');
    const [newIPDescription, setNewIPDescription] = useState('');
    // API Key Management State
    const [apiKeys, setApiKeys] = useState([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState(['read']);
    const [showNewAPIKey, setShowNewAPIKey] = useState(false);
    const [newAPIKeyData, setNewAPIKeyData] = useState(null);
    // MFA Disable Verification State
    const [showDisableDialog, setShowDisableDialog] = useState(false);
    const [disableVerification, setDisableVerification] = useState({ totpCode: '', password: '' });
    const [verificationMethod, setVerificationMethod] = useState('totp');
    const [showSecurityDetails, setShowSecurityDetails] = useState(false);
    const [selectedSecurityMeasure, setSelectedSecurityMeasure] = useState(null);
    // Load all security data
    const loadSecurityData = async () => {
        setLoading(true);
        try {
            const [overviewData, accessControlData, auditLogsData, complianceData, encryptionData, monitoringData, sessionsData, ipWhitelistData, apiKeysData, mfaStatusData] = await Promise.all([
                securityApi.getOverview(),
                securityApi.getAccessControl(),
                securityApi.getAuditLogs(1, 20),
                securityApi.getCompliance(),
                securityApi.getEncryption(),
                securityApi.getMonitoring(),
                securityApi.getSessions(),
                securityApi.getIPWhitelist(),
                securityApi.getAPIKeys(),
                securityApi.getMFAStatus()
            ]);
            setOverview(overviewData);
            setAccessControl(accessControlData);
            // The API returns the audit logs array directly, not wrapped in a data property
            if (Array.isArray(auditLogsData)) {
                setAuditLogs(auditLogsData);
            }
            else if (auditLogsData?.data && Array.isArray(auditLogsData.data)) {
                setAuditLogs(auditLogsData.data);
            }
            else {
                setAuditLogs([]);
            }
            setCompliance(complianceData);
            setEncryption(encryptionData);
            setMonitoring(monitoringData);
            // Update MFA status
            setMfaEnabled(mfaStatusData.mfaEnabled);
            // Add null checks for the data
            if (sessionsData && sessionsData.sessions) {
                setSessions(sessionsData.sessions);
            }
            else {
                setSessions([]);
            }
            if (ipWhitelistData && ipWhitelistData.whitelistedIPs) {
                setIpWhitelist(ipWhitelistData.whitelistedIPs);
            }
            else {
                setIpWhitelist([]);
            }
            if (apiKeysData && apiKeysData.apiKeys) {
                setApiKeys(apiKeysData.apiKeys);
            }
            else {
                setApiKeys([]);
            }
        }
        catch (error) {
            console.error('Error loading security data:', error);
            // Set fallback values to prevent undefined errors
            setAuditLogs([]);
            toast({
                title: "Error",
                description: "Failed to load security data. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    // Security Details Functions
    const handleViewSecurityDetails = (measure) => {
        setSelectedSecurityMeasure(measure);
        setShowSecurityDetails(true);
    };
    // MFA Management Functions
    const handleStartMFASetup = async () => {
        try {
            const setupData = await securityApi.startMFASetup();
            if (setupData && setupData.secret && setupData.qrCodeUrl) {
                setMfaSetup(setupData);
                toast({
                    title: "MFA Setup Started",
                    description: "Scan the QR code with your authenticator app.",
                });
            }
            else {
                console.error('MFA setup data is incomplete:', setupData);
                toast({
                    title: "Error",
                    description: "MFA setup data is incomplete. Please try again.",
                    variant: "destructive",
                });
            }
        }
        catch (error) {
            console.error('MFA Setup Error:', error); // Debug log
            toast({
                title: "Error",
                description: "Failed to start MFA setup. Please try again.",
                variant: "destructive",
            });
        }
    };
    const handleVerifyMFA = async () => {
        if (!mfaVerificationToken) {
            toast({
                title: "Error",
                description: "Please enter the verification code.",
                variant: "destructive",
            });
            return;
        }
        try {
            const result = await securityApi.verifyMFASetup(mfaVerificationToken);
            setMfaEnabled(true);
            setBackupCodes(result.backupCodes);
            setMfaSetup(null);
            setMfaVerificationToken('');
            toast({
                title: "MFA Enabled",
                description: "Two-factor authentication has been successfully enabled.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Invalid verification code. Please try again.",
                variant: "destructive",
            });
        }
    };
    const handleDisableMFA = () => {
        setShowDisableDialog(true);
        setDisableVerification({ totpCode: '', password: '' });
        setVerificationMethod('totp');
    };
    const handleConfirmDisableMFA = async () => {
        try {
            const verification = verificationMethod === 'totp'
                ? { totpCode: disableVerification.totpCode }
                : { password: disableVerification.password };
            await securityApi.disableMFA(verification);
            setMfaEnabled(false);
            setBackupCodes([]);
            setShowDisableDialog(false);
            setDisableVerification({ totpCode: '', password: '' });
            toast({
                title: "MFA Disabled",
                description: "Two-factor authentication has been disabled.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to disable MFA. Please try again.",
                variant: "destructive",
            });
        }
    };
    const handleRegenerateBackupCodes = async () => {
        try {
            const result = await securityApi.regenerateBackupCodes();
            setBackupCodes(result.backupCodes);
            toast({
                title: "Backup Codes Regenerated",
                description: "New backup codes have been generated. Please save them securely.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to regenerate backup codes.",
                variant: "destructive",
            });
        }
    };
    // Session Management Functions
    const handleRevokeSession = async (sessionId) => {
        try {
            await securityApi.revokeSession(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
            toast({
                title: "Session Revoked",
                description: "The session has been successfully revoked.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to revoke session.",
                variant: "destructive",
            });
        }
    };
    // IP Whitelist Functions
    const handleAddIP = async () => {
        if (!newIP) {
            toast({
                title: "Error",
                description: "Please enter an IP address.",
                variant: "destructive",
            });
            return;
        }
        try {
            const result = await securityApi.addIPToWhitelist(newIP, newIPDescription);
            setIpWhitelist([...ipWhitelist, result]);
            setNewIP('');
            setNewIPDescription('');
            toast({
                title: "IP Added",
                description: "IP address has been added to the whitelist.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to add IP to whitelist.",
                variant: "destructive",
            });
        }
    };
    const handleRemoveIP = async (id) => {
        try {
            await securityApi.removeIPFromWhitelist(id);
            setIpWhitelist(ipWhitelist.filter(ip => ip.id !== id));
            toast({
                title: "IP Removed",
                description: "IP address has been removed from the whitelist.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove IP from whitelist.",
                variant: "destructive",
            });
        }
    };
    // API Key Functions
    const handleCreateAPIKey = async () => {
        if (!newKeyName) {
            toast({
                title: "Error",
                description: "Please enter an API key name.",
                variant: "destructive",
            });
            return;
        }
        if (selectedPermissions.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one permission.",
                variant: "destructive",
            });
            return;
        }
        try {
            const result = await securityApi.createAPIKey(newKeyName, selectedPermissions);
            setApiKeys([...apiKeys, result]);
            setNewKeyName('');
            setSelectedPermissions(['read']);
            setNewAPIKeyData(result);
            setShowNewAPIKey(true);
            toast({
                title: "API Key Created",
                description: "New API key has been created successfully.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to create API key.",
                variant: "destructive",
            });
        }
    };
    const handleRevokeAPIKey = async (id) => {
        try {
            await securityApi.revokeAPIKey(id);
            setApiKeys(apiKeys.filter(key => key.id !== id));
            toast({
                title: "API Key Revoked",
                description: "API key has been revoked successfully.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to revoke API key.",
                variant: "destructive",
            });
        }
    };
    const togglePermission = (permission) => {
        setSelectedPermissions(prev => prev.includes(permission)
            ? prev.filter(p => p !== permission)
            : [...prev, permission]);
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Text copied to clipboard.",
        });
    };
    // Load data on component mount
    useEffect(() => {
        loadSecurityData();
    }, []);
    // Trigger security audit
    const handleSecurityAudit = async () => {
        try {
            const result = await securityApi.triggerAudit();
            toast({
                title: "Security Audit Started",
                description: `Audit ${result.auditId} initiated successfully. Estimated completion: ${new Date(result.estimatedCompletion).toLocaleTimeString()}`,
            });
        }
        catch (error) {
            console.error('Error triggering security audit:', error);
            toast({
                title: "Error",
                description: "Failed to start security audit. Please try again.",
                variant: "destructive",
            });
        }
    };
    return (_jsxs(PageLayout, { children: [_jsxs("div", { className: "flex-1 space-y-6 p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Security & Compliance" }), _jsx("p", { className: "text-muted-foreground", children: "Advanced security controls and regulatory compliance management" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", onClick: handleSecurityAudit, disabled: loading, children: [_jsx(Activity, { className: "mr-2 h-4 w-4" }), "Security Audit"] }), _jsxs(Button, { onClick: () => loadSecurityData(), disabled: loading, children: [loading ? (_jsx(RefreshCw, { className: "mr-2 h-4 w-4 animate-spin" })) : (_jsx(Shield, { className: "mr-2 h-4 w-4" })), loading ? 'Loading...' : 'Refresh Data'] }), _jsxs(Button, { variant: "outline", onClick: () => {
                                            clearAllData();
                                            toast({
                                                title: "Data Cleared",
                                                description: "All localStorage data has been cleared for debugging.",
                                            });
                                        }, disabled: loading, children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Clear All Data (Debug)"] })] })] }), _jsxs(Tabs, { defaultValue: "overview", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-8", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "mfa", children: "MFA" }), _jsx(TabsTrigger, { value: "sessions", children: "Sessions" }), _jsx(TabsTrigger, { value: "access", children: "Access Control" }), _jsx(TabsTrigger, { value: "audit", children: "Audit Logs" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" }), _jsx(TabsTrigger, { value: "encryption", children: "Data Security" }), _jsx(TabsTrigger, { value: "monitoring", children: "Monitoring" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Security Score" }), _jsx(Shield, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${overview?.securityScore && overview.securityScore >= 90 ? 'text-green-600' : overview?.securityScore && overview.securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`, children: [overview?.securityScore || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: overview?.securityScore && overview.securityScore >= 90 ? 'Excellent security posture' :
                                                                    overview?.securityScore && overview.securityScore >= 70 ? 'Good security posture' : 'Needs improvement' }), compliance && encryption && monitoring && (_jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Compliance: ", compliance.overallScore, "%"] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Sessions" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: overview?.activeSessions || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Across all users" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Failed Logins" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: `text-2xl font-bold ${overview?.failedLogins && overview.failedLogins > 10 ? 'text-red-600' : overview?.failedLogins && overview.failedLogins > 5 ? 'text-yellow-600' : 'text-green-600'}`, children: overview?.failedLogins || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Last 24 hours" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Compliance Status" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [overview?.complianceStatus || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "SOC 2 Type II compliant" })] })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Security Health Check" }), _jsx(CardDescription, { children: "Current security status across all systems" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Two-Factor Authentication" }), _jsxs(Badge, { variant: "default", className: overview?.mfaPercentage === 100 ? "bg-green-100 text-green-800" : overview?.mfaPercentage && overview.mfaPercentage > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), overview?.mfaPercentage === 100 ? "Enabled" : overview?.mfaPercentage && overview.mfaPercentage > 0 ? "Partial" : "Disabled"] })] }), _jsx(Progress, { value: overview?.mfaPercentage || 0, className: "h-2" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [overview?.mfaEnabled || 0, " of ", overview?.totalUsers || 0, " users have 2FA enabled (", overview?.mfaPercentage || 0, "%)"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Data Encryption" }), _jsxs(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Active"] })] }), _jsx(Progress, { value: 100, className: "h-2" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "AES-256 encryption at rest and in transit" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Access Controls" }), _jsxs(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Configured"] })] }), _jsx(Progress, { value: 95, className: "h-2" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Role-based permissions active" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Backup & Recovery" }), _jsxs(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-800", children: [_jsx(Clock, { className: "mr-1 h-3 w-3" }), "In Progress"] })] }), _jsx(Progress, { value: 85, className: "h-2" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Daily backups with 99.9% success rate" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Security Events" }), _jsx(CardDescription, { children: "Latest security activities and alerts" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsx("div", { className: "space-y-3", children: auditLogs && auditLogs.length > 0 ? (auditLogs.slice(0, 5).map((log) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-full ${log.status === 'failed' ? 'bg-red-100' :
                                                                            log.action.includes('LOGIN') ? 'bg-green-100' :
                                                                                log.action.includes('SECURITY') ? 'bg-yellow-100' :
                                                                                    'bg-blue-100'}`, children: log.status === 'failed' ? (_jsx(AlertTriangle, { className: `h-5 w-5 ${log.status === 'failed' ? 'text-red-600' :
                                                                                log.action.includes('LOGIN') ? 'text-green-600' :
                                                                                    log.action.includes('SECURITY') ? 'text-yellow-600' :
                                                                                        'text-blue-600'}` })) : log.action.includes('LOGIN') ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : log.action.includes('SECURITY') ? (_jsx(Shield, { className: "h-5 w-5 text-yellow-600" })) : (_jsx(Key, { className: "h-5 w-5 text-blue-600" })) }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("p", { className: "text-sm font-medium", children: log.action.replace(/_/g, ' ').toLowerCase() }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["User: ", log.user] }), log.ipAddress && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["From: ", log.ipAddress] })), _jsx("p", { className: "text-xs text-muted-foreground", children: new Date(log.timestamp).toLocaleString() })] })] }, log.id)))) : (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "No recent security events" }) })) }) })] })] })] }), _jsx(TabsContent, { value: "mfa", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Multi-Factor Authentication" }), _jsx(CardDescription, { children: "Secure your account with two-factor authentication" })] }), _jsx(CardContent, { className: "space-y-6", children: !mfaEnabled && !mfaSetup ? (_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 mx-auto", children: _jsx(Smartphone, { className: "h-10 w-10 text-yellow-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Enable Two-Factor Authentication" }), _jsx("p", { className: "text-muted-foreground", children: "Add an extra layer of security to your account with 2FA" })] }), _jsxs(Button, { onClick: handleStartMFASetup, className: "mt-4", children: [_jsx(QrCode, { className: "mr-2 h-4 w-4" }), "Set Up MFA"] })] })) : mfaSetup ? (_jsxs("div", { className: "space-y-6", children: [_jsxs(Alert, { children: [_jsx(QrCode, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)" })] }), _jsx("div", { className: "flex justify-center p-6 bg-white border rounded-lg", children: _jsx("div", { className: "text-center space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100 mx-auto", children: _jsx(QrCode, { className: "h-16 w-16 text-gray-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "QR Code Ready" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Click the button below to view and scan the QR code" })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsxs(Button, { onClick: () => setShowQRModal(true), className: "w-full", children: [_jsx(QrCode, { className: "mr-2 h-4 w-4" }), "View QR Code"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => copyToClipboard(mfaSetup.secret), children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy Secret"] })] })] }) }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Enter the 6-digit code from your authenticator app" }), _jsx("input", { type: "text", placeholder: "123456", value: mfaVerificationToken, onChange: (e) => setMfaVerificationToken(e.target.value), className: "w-full mt-2 px-3 py-2 border rounded-md", maxLength: 6 })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { onClick: handleVerifyMFA, disabled: !mfaVerificationToken, children: "Verify & Enable MFA" }), _jsx(Button, { variant: "outline", onClick: () => setMfaSetup(null), children: "Cancel" })] })] })] })) : (_jsxs("div", { className: "space-y-6", children: [_jsxs(Alert, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Two-factor authentication is enabled and protecting your account." })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(CardTitle, { className: "text-lg", children: "MFA Status" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-green-100", children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Enabled" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Account protected with 2FA" })] })] }), _jsxs(Button, { variant: "destructive", size: "sm", onClick: handleDisableMFA, className: "mt-4", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Disable MFA"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(CardTitle, { className: "text-lg", children: "Backup Codes" }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Use these codes if you lose access to your authenticator app" }), backupCodes.length > 0 ? (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "grid grid-cols-2 gap-2 text-xs font-mono", children: backupCodes.slice(0, 6).map((code, index) => (_jsx("div", { className: "bg-gray-100 p-2 rounded text-center", children: code }, index))) }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleRegenerateBackupCodes, className: "mt-3", children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Regenerate Codes"] })] })) : (_jsx(Button, { variant: "outline", size: "sm", onClick: handleRegenerateBackupCodes, children: "Generate Backup Codes" }))] })] })] })] })) })] }) }), _jsx(TabsContent, { value: "sessions", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Active Sessions" }), _jsx(CardDescription, { children: "Manage your active login sessions across all devices" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [sessions.map((session) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-blue-100", children: _jsx(Monitor, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("p", { className: "font-medium", children: session.deviceName }), session.isCurrent && (_jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Current" }))] }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-muted-foreground", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Globe, { className: "h-3 w-3" }), _jsx("span", { children: session.ipAddress })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(MapPin, { className: "h-3 w-3" }), _jsx("span", { children: session.location })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Calendar, { className: "h-3 w-3" }), _jsxs("span", { children: ["Last active: ", new Date(session.lastActivity).toLocaleString()] })] })] })] })] }), !session.isCurrent && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleRevokeSession(session.id), children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Revoke"] }))] }, session.id))), sessions.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Monitor, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No active sessions found" })] }))] }) })] }) }), _jsxs(TabsContent, { value: "access", className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Access Control Management" }), _jsx(CardDescription, { children: "Role-based permissions and user access controls" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs(Alert, { children: [_jsx(Shield, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["All users have appropriate role-based access controls. ", accessControl?.totalUsers || 0, " total users, ", accessControl?.activeUsers || 0, " active users with granular permissions."] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "User Roles & Permissions" }), _jsx("div", { className: "space-y-3", children: accessControl?.roleStats ? Object.entries(accessControl.roleStats).map(([role, data]) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-full ${role === 'super_admin' ? 'bg-red-100' :
                                                                                                role === 'admin' ? 'bg-blue-100' :
                                                                                                    role === 'accountant' ? 'bg-green-100' :
                                                                                                        'bg-yellow-100'}`, children: role === 'super_admin' ? (_jsx(Shield, { className: "h-5 w-5 text-red-600" })) : role === 'admin' ? (_jsx(Users, { className: "h-5 w-5 text-blue-600" })) : role === 'accountant' ? (_jsx(FileText, { className: "h-5 w-5 text-green-600" })) : (_jsx(Eye, { className: "h-5 w-5 text-yellow-600" })) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }), _jsx("p", { className: "text-sm text-muted-foreground", children: role === 'super_admin' ? 'Full system access' :
                                                                                                        role === 'admin' ? 'User & system management' :
                                                                                                            role === 'accountant' ? 'Financial data access' :
                                                                                                                'Read-only access' })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-medium", children: [data.count, " users"] }), _jsx(Badge, { variant: role === 'super_admin' ? 'destructive' :
                                                                                                role === 'admin' ? 'secondary' :
                                                                                                    role === 'accountant' ? 'default' :
                                                                                                        'outline', className: role === 'super_admin' ? '' :
                                                                                                role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                                                                    role === 'accountant' ? 'bg-green-100 text-green-800' :
                                                                                                        '', children: role === 'super_admin' ? 'Critical' :
                                                                                                role === 'admin' ? 'High' :
                                                                                                    role === 'accountant' ? 'Standard' :
                                                                                                        'Limited' })] })] }, role))) : (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "No role data available" }) })) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Access Control Features" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Smartphone, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Two-Factor Authentication" })] }), _jsx(Badge, { variant: "default", className: accessControl?.securityFeatures?.twoFactorAuth?.required ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800", children: accessControl?.securityFeatures?.twoFactorAuth?.required ? "Required" : "Optional" })] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [accessControl?.securityFeatures?.twoFactorAuth?.enabledUsers || 0, " of ", accessControl?.securityFeatures?.twoFactorAuth?.totalUsers || 0, " users have 2FA enabled (", accessControl?.securityFeatures?.twoFactorAuth?.adoptionRate || 0, "%)"] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Globe, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "IP Whitelisting" })] }), _jsx(Badge, { variant: "default", className: accessControl?.securityFeatures?.ipWhitelisting?.active ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800", children: accessControl?.securityFeatures?.ipWhitelisting?.active ? "Active" : "Inactive" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: accessControl?.securityFeatures?.ipWhitelisting?.active
                                                                                            ? `${accessControl?.securityFeatures?.ipWhitelisting?.count || 0} IP addresses whitelisted`
                                                                                            : "No IP restrictions configured" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Session Management" })] }), _jsx(Badge, { variant: "default", className: accessControl?.securityFeatures?.sessionManagement?.enforced ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800", children: accessControl?.securityFeatures?.sessionManagement?.enforced ? "Configured" : "Not Enforced" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: accessControl?.securityFeatures?.sessionManagement?.enforced
                                                                                            ? `Automatic session timeout after ${accessControl?.securityFeatures?.sessionManagement?.maxIdleTime || 30} minutes of inactivity`
                                                                                            : "Session timeout not enforced" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Key, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "API Key Management" })] }), _jsx(Badge, { variant: "default", className: accessControl?.securityFeatures?.apiKeyRotation?.automatic ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800", children: accessControl?.securityFeatures?.apiKeyRotation?.automatic ? "Automated" : "Manual" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: accessControl?.securityFeatures?.apiKeyRotation?.automatic
                                                                                            ? `Automatic key rotation with audit logging. Next rotation: ${accessControl?.securityFeatures?.apiKeyRotation?.nextRotation ? new Date(accessControl.securityFeatures.apiKeyRotation.nextRotation).toLocaleDateString() : 'N/A'}`
                                                                                            : "Manual key rotation required" })] })] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "IP Whitelist Management" }), _jsx(CardDescription, { children: "Control which IP addresses can access your system" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex space-x-4", children: [_jsx("input", { type: "text", placeholder: "IP Address (e.g., 192.168.1.100)", value: newIP, onChange: (e) => setNewIP(e.target.value), className: "flex-1 px-3 py-2 border rounded-md" }), _jsx("input", { type: "text", placeholder: "Description (optional)", value: newIPDescription, onChange: (e) => setNewIPDescription(e.target.value), className: "flex-1 px-3 py-2 border rounded-md" }), _jsxs(Button, { onClick: handleAddIP, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add IP"] })] }), _jsxs("div", { className: "space-y-3", children: [ipWhitelist.map((ip) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Globe, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "font-medium", children: ip.ipAddress }), ip.isActive && (_jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Active" }))] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [ip.description, " \u2022 Added by ", ip.addedBy, " on ", new Date(ip.addedAt).toLocaleDateString()] })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleRemoveIP(ip.id), children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Remove"] })] }, ip.id))), ipWhitelist.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Globe, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No IP addresses in whitelist" })] }))] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "API Key Management" }), _jsx(CardDescription, { children: "Create and manage API keys for programmatic access" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex space-x-4", children: [_jsx("input", { type: "text", placeholder: "API Key Name", value: newKeyName, onChange: (e) => setNewKeyName(e.target.value), className: "flex-1 px-3 py-2 border rounded-md" }), _jsxs(Button, { onClick: handleCreateAPIKey, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Create API Key"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Permissions:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['read', 'write', 'admin', 'reports', 'webhooks'].map((permission) => (_jsx("button", { type: "button", onClick: () => togglePermission(permission), className: `px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedPermissions.includes(permission)
                                                                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                                                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'}`, children: permission }, permission))) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Select the permissions this API key should have" })] })] }), showNewAPIKey && newAPIKeyData && (_jsxs(Alert, { children: [_jsx(Key, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "font-medium", children: "Your new API key has been created:" }), _jsxs("div", { className: "flex items-center space-x-2 bg-gray-100 p-3 rounded font-mono text-sm", children: [_jsx("span", { className: "flex-1", children: newAPIKeyData.apiKey }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => copyToClipboard(newAPIKeyData.apiKey || ''), children: _jsx(Copy, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Permissions:" }), _jsx("div", { className: "flex space-x-1", children: newAPIKeyData.permissions?.map((permission) => (_jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full", children: permission }, permission))) })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Make sure to copy this key now. You won't be able to see it again!" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                setShowNewAPIKey(false);
                                                                                setNewAPIKeyData(null);
                                                                            }, children: "I've saved this key" })] }) })] })), _jsxs("div", { className: "space-y-3", children: [apiKeys.map((key) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Key, { className: "h-4 w-4 text-purple-600" }), _jsx("span", { className: "font-medium", children: key.name }), key.isActive && (_jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Active" }))] }), _jsxs("div", { className: "text-sm text-muted-foreground space-y-1", children: [_jsxs("p", { children: ["Key: ", key.keyPrefix] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("span", { children: ["Created: ", new Date(key.createdAt).toLocaleDateString()] }), _jsxs("span", { children: ["Expires: ", new Date(key.expiresAt).toLocaleDateString()] }), key.lastUsed && (_jsxs("span", { children: ["Last used: ", new Date(key.lastUsed).toLocaleDateString()] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: "Permissions:" }), key.permissions.map((perm) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: perm }, perm)))] })] })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleRevokeAPIKey(key.id), children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Revoke"] })] }, key.id))), apiKeys.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Key, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No API keys created" })] }))] })] })] })] }), _jsx(TabsContent, { value: "audit", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Audit Trail & Activity Logs" }), _jsx(CardDescription, { children: "Comprehensive logging of all system activities" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("p", { className: "text-sm text-muted-foreground", children: ["Showing recent audit events \u2022 ", auditLogs?.length || 0, " total events loaded"] }), _jsx(Button, { variant: "outline", size: "sm", children: "Export Logs" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2", children: [_jsx("div", { className: "col-span-2", children: "Timestamp" }), _jsx("div", { className: "col-span-2", children: "User" }), _jsx("div", { className: "col-span-3", children: "Action" }), _jsx("div", { className: "col-span-2", children: "Resource" }), _jsx("div", { className: "col-span-2", children: "IP Address" }), _jsx("div", { className: "col-span-1", children: "Status" })] }), _jsx("div", { className: "space-y-2", children: auditLogs && auditLogs.length > 0 ? (auditLogs.map((log) => {
                                                                    const getStatusBadge = (action) => {
                                                                        if (action.includes('FAILED') || action.includes('DENIED')) {
                                                                            return _jsx(Badge, { variant: "destructive", children: "Failed" });
                                                                        }
                                                                        else if (action.includes('WARNING') || action.includes('ALERT')) {
                                                                            return _jsx(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-800", children: "Warning" });
                                                                        }
                                                                        else if (action.includes('INFO') || action.includes('BACKUP')) {
                                                                            return _jsx(Badge, { variant: "default", className: "bg-blue-100 text-blue-800", children: "Info" });
                                                                        }
                                                                        else {
                                                                            return _jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Success" });
                                                                        }
                                                                    };
                                                                    const getUserInitials = (user) => {
                                                                        if (user === 'System')
                                                                            return 'SY';
                                                                        const words = user.split(' ');
                                                                        return words.map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
                                                                    };
                                                                    return (_jsxs("div", { className: "grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg", children: [_jsx("div", { className: "col-span-2 text-sm", children: new Date(log.timestamp).toLocaleString() }), _jsxs("div", { className: "col-span-2 flex items-center space-x-2", children: [_jsx(Avatar, { className: "h-6 w-6", children: _jsx(AvatarFallback, { children: getUserInitials(log.user) }) }), _jsx("span", { className: "text-sm", children: log.user })] }), _jsx("div", { className: "col-span-3 text-sm", children: log.action }), _jsx("div", { className: "col-span-2 text-sm", children: log.entityType || 'N/A' }), _jsx("div", { className: "col-span-2 text-sm", children: log.ipAddress || 'N/A' }), _jsx("div", { className: "col-span-1", children: getStatusBadge(log.action) })] }, log.id));
                                                                })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No audit logs found" })] })) })] })] }) })] }) }), _jsx(TabsContent, { value: "compliance", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Regulatory Compliance" }), _jsx(CardDescription, { children: "Real-time compliance status based on system security metrics" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Overall Compliance Score" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Based on MFA adoption, security monitoring, and audit logging" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-3xl font-bold text-green-600", children: [compliance?.overallScore || 0, "%"] }), _jsx(Badge, { variant: (compliance?.overallScore || 0) >= 80 ? "default" : (compliance?.overallScore || 0) >= 60 ? "secondary" : "destructive", children: (compliance?.overallScore || 0) >= 80 ? "Excellent" : (compliance?.overallScore || 0) >= 60 ? "Good" : "Needs Attention" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Compliance Standards" }), _jsx("div", { className: "grid gap-4 md:grid-cols-1 lg:grid-cols-2", children: compliance?.standards?.map((standard) => {
                                                                const getStatusColor = (status) => {
                                                                    switch (status) {
                                                                        case 'certified': return 'bg-green-100 text-green-800';
                                                                        case 'compliant': return 'bg-blue-100 text-blue-800';
                                                                        case 'non-compliant': return 'bg-red-100 text-red-800';
                                                                        default: return 'bg-gray-100 text-gray-800';
                                                                    }
                                                                };
                                                                const getStatusIcon = (status) => {
                                                                    switch (status) {
                                                                        case 'certified': return _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" });
                                                                        case 'compliant': return _jsx(Shield, { className: "h-5 w-5 text-blue-600" });
                                                                        case 'non-compliant': return _jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" });
                                                                        default: return _jsx(Clock, { className: "h-5 w-5 text-gray-600" });
                                                                    }
                                                                };
                                                                return (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-muted", children: getStatusIcon(standard.status) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: standard.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: standard.description })] })] }), _jsx(Badge, { className: getStatusColor(standard.status), children: standard.status.charAt(0).toUpperCase() + standard.status.slice(1).replace('-', ' ') })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Score:" }), _jsxs("span", { className: "font-medium", children: [standard.score, "%"] })] }), _jsx(Progress, { value: standard.score, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Last audit: ", standard.lastAudit ? new Date(standard.lastAudit).toLocaleDateString() : 'N/A'] }), _jsxs("span", { children: ["Next audit: ", standard.nextAudit ? new Date(standard.nextAudit).toLocaleDateString() : 'N/A'] })] })] })] }, standard.name));
                                                            }) })] }), compliance?.actions && compliance.actions.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Required Actions" }), _jsx("div", { className: "space-y-3", children: compliance.actions.map((action) => {
                                                                const getPriorityColor = (priority) => {
                                                                    switch (priority) {
                                                                        case 'high': return 'border-red-200 bg-red-50';
                                                                        case 'medium': return 'border-yellow-200 bg-yellow-50';
                                                                        case 'low': return 'border-blue-200 bg-blue-50';
                                                                        default: return 'border-gray-200 bg-gray-50';
                                                                    }
                                                                };
                                                                const getPriorityBadge = (priority) => {
                                                                    switch (priority) {
                                                                        case 'high': return _jsx(Badge, { variant: "destructive", children: "High Priority" });
                                                                        case 'medium': return _jsx(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-800", children: "Medium Priority" });
                                                                        case 'low': return _jsx(Badge, { variant: "default", className: "bg-blue-100 text-blue-800", children: "Low Priority" });
                                                                        default: return _jsx(Badge, { variant: "outline", children: "Normal" });
                                                                    }
                                                                };
                                                                const isOverdue = action.dueDate ? new Date(action.dueDate) < new Date() : false;
                                                                const daysUntilDue = action.dueDate ? Math.ceil((new Date(action.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                                                                return (_jsxs("div", { className: `p-4 border rounded-lg ${getPriorityColor(action.priority)}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium", children: action.title }), _jsxs("div", { className: "flex items-center space-x-2", children: [getPriorityBadge(action.priority), _jsx(Badge, { variant: isOverdue ? "destructive" : daysUntilDue <= 3 ? "secondary" : "outline", children: isOverdue ? "Overdue" : `Due in ${daysUntilDue} days` })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-3", children: action.description }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-muted-foreground", children: ["Due: ", action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'N/A'] }), _jsx(Button, { size: "sm", variant: "outline", children: action.status === 'pending' || action.status === 'active' ? 'Start Action' : 'View Details' })] })] }, action.id));
                                                            }) })] })), (!compliance?.actions || compliance.actions.length === 0) && (_jsxs(Alert, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "All compliance requirements are currently met. No immediate actions required." })] }))] })] }) }), _jsx(TabsContent, { value: "encryption", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Data Security & Encryption" }), _jsx(CardDescription, { children: "Real-time encryption status and security measures based on system metrics" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Overall Security Score" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Based on password security, MFA adoption, and security monitoring" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-3xl font-bold text-green-600", children: [encryption?.securityScore || 0, "%"] }), _jsx(Badge, { variant: (encryption?.securityScore || 0) >= 90 ? "default" : (encryption?.securityScore || 0) >= 70 ? "secondary" : "destructive", children: (encryption?.securityScore || 0) >= 90 ? "Excellent" : (encryption?.securityScore || 0) >= 70 ? "Good" : "Needs Attention" })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Encryption Status" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Database, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Data at Rest" })] }), _jsx(Badge, { variant: encryption?.encryption?.dataAtRest?.enabled ? "default" : "destructive", className: encryption?.encryption?.dataAtRest?.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", children: encryption?.encryption?.dataAtRest?.algorithm || 'Not Configured' })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: encryption?.encryption?.dataAtRest?.enabled
                                                                                        ? 'All passwords are securely hashed with salt'
                                                                                        : 'Password security needs attention' }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Status: ", encryption?.encryption?.dataAtRest?.status || 'Unknown'] }), _jsxs("span", { children: ["Last rotation: ", encryption?.encryption?.dataAtRest?.lastKeyRotation ? new Date(encryption.encryption.dataAtRest.lastKeyRotation).toLocaleDateString() : 'N/A'] })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Globe, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Data in Transit" })] }), _jsx(Badge, { variant: encryption?.encryption?.dataInTransit?.enabled ? "default" : "destructive", className: encryption?.encryption?.dataInTransit?.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", children: encryption?.encryption?.dataInTransit?.protocol || 'Not Configured' })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: encryption?.encryption?.dataInTransit?.enabled
                                                                                        ? 'All network communications are encrypted'
                                                                                        : 'Network encryption needs to be enabled' }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Status: ", encryption?.encryption?.dataInTransit?.status || 'Unknown'] }), _jsxs("span", { children: ["Cert expires: ", encryption?.encryption?.dataInTransit?.certificateExpiry ? new Date(encryption.encryption.dataInTransit.certificateExpiry).toLocaleDateString() : 'N/A'] })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Key, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Key Management" })] }), _jsx(Badge, { variant: encryption?.encryption?.keyManagement?.status === 'operational' ? "default" : "secondary", className: encryption?.encryption?.keyManagement?.status === 'operational' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800", children: encryption?.encryption?.keyManagement?.type || 'Unknown' })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: encryption?.encryption?.keyManagement?.status === 'operational'
                                                                                        ? 'Key management is operational'
                                                                                        : 'Key management needs attention' }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Keys rotated: ", encryption?.encryption?.keyManagement?.keysRotated || 0] }), _jsxs("span", { children: ["Last rotation: ", encryption?.encryption?.keyManagement?.lastRotation ? new Date(encryption.encryption.keyManagement.lastRotation).toLocaleDateString() : 'N/A'] })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Application Security" })] }), _jsx(Badge, { variant: encryption?.encryption?.applicationSecurity?.enabled ? "default" : "destructive", className: encryption?.encryption?.applicationSecurity?.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", children: encryption?.encryption?.applicationSecurity?.type || 'Not Configured' })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: encryption?.encryption?.applicationSecurity?.enabled
                                                                                        ? 'Application-level security is active'
                                                                                        : 'Application security needs improvement' }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Status: ", encryption?.encryption?.applicationSecurity?.status || 'Unknown'] }), _jsxs("span", { children: ["Fields encrypted: ", encryption?.encryption?.applicationSecurity?.fieldsEncrypted?.length || 0] })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Security Measures" }), _jsx("div", { className: "space-y-3", children: encryption?.securityMeasures?.map((measure) => {
                                                                        const getStatusColor = (status) => {
                                                                            switch (status) {
                                                                                case 'active': return 'bg-green-100 text-green-800';
                                                                                case 'partial': return 'bg-yellow-100 text-yellow-800';
                                                                                case 'inactive': return 'bg-red-100 text-red-800';
                                                                                case 'alert': return 'bg-red-100 text-red-800';
                                                                                case 'monitoring': return 'bg-blue-100 text-blue-800';
                                                                                case 'needs_attention': return 'bg-yellow-100 text-yellow-800';
                                                                                default: return 'bg-gray-100 text-gray-800';
                                                                            }
                                                                        };
                                                                        const getStatusIcon = (status) => {
                                                                            switch (status) {
                                                                                case 'active': return _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" });
                                                                                case 'partial': return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" });
                                                                                case 'inactive': return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" });
                                                                                case 'alert': return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" });
                                                                                case 'monitoring': return _jsx(Activity, { className: "h-4 w-4 text-blue-600" });
                                                                                case 'needs_attention': return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" });
                                                                                default: return _jsx(Clock, { className: "h-4 w-4 text-gray-600" });
                                                                            }
                                                                        };
                                                                        return (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(measure.status), _jsx("span", { className: "font-medium", children: measure.name })] }), _jsx(Badge, { className: getStatusColor(measure.status), children: measure.status.charAt(0).toUpperCase() + measure.status.slice(1).replace('_', ' ') })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: measure.description }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Last check: ", measure.lastCheck ? new Date(measure.lastCheck).toLocaleDateString() : 'N/A'] }), _jsx(Button, { size: "sm", variant: "outline", className: "h-6 text-xs", onClick: () => handleViewSecurityDetails(measure), children: "View Details" })] })] }, measure.name));
                                                                    }) })] })] }), _jsxs(Alert, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: (encryption?.securityScore || 0) >= 90
                                                                ? "All security measures are operating optimally. System is well-protected."
                                                                : (encryption?.securityScore || 0) >= 70
                                                                    ? "Security measures are mostly in place. Consider reviewing areas marked as 'needs attention'."
                                                                    : "Security measures need immediate attention. Please review and address the issues above." })] })] })] }) }), _jsx(TabsContent, { value: "monitoring", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Security Monitoring & Alerts" }), _jsx(CardDescription, { children: "Real-time security monitoring and incident response based on system metrics" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("div", { className: `text-2xl font-bold ${(monitoring?.systemMetrics?.uptime || 0) >= 95 ? 'text-green-600' : (monitoring?.systemMetrics?.uptime || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'}`, children: [monitoring?.systemMetrics?.uptime || 0, "%"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "System Uptime" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Based on security events and failed logins" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: monitoring?.systemMetrics?.monitoring || '24/7' }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Security Monitoring" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Continuous monitoring active" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("div", { className: `text-2xl font-bold ${monitoring?.systemMetrics?.incidentResponse === '<5min' ? 'text-green-600' : 'text-yellow-600'}`, children: monitoring?.systemMetrics?.incidentResponse || '<5min' }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Incident Response" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Average response time" })] })] }), monitoring?.alertSummary && (_jsxs("div", { className: "p-4 bg-muted/50 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Security Alert Summary" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-600", children: monitoring.alertSummary.total }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Total Alerts" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: monitoring.alertSummary.critical }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Critical" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: monitoring.alertSummary.warning }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Warning" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: monitoring.alertSummary.info }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Info" })] })] })] })), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Active Monitoring Components" }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: monitoring?.monitoringComponents?.map((component) => {
                                                                const getStatusColor = (status) => {
                                                                    switch (status) {
                                                                        case 'active': return 'bg-green-100 text-green-800';
                                                                        case 'secure': return 'bg-green-100 text-green-800';
                                                                        case 'normal': return 'bg-green-100 text-green-800';
                                                                        case 'needs_attention': return 'bg-yellow-100 text-yellow-800';
                                                                        case 'alert': return 'bg-red-100 text-red-800';
                                                                        case 'inactive': return 'bg-gray-100 text-gray-800';
                                                                        default: return 'bg-gray-100 text-gray-800';
                                                                    }
                                                                };
                                                                const getStatusIcon = (status, alertLevel) => {
                                                                    if (alertLevel === 'red' || status === 'alert')
                                                                        return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" });
                                                                    if (alertLevel === 'yellow' || status === 'needs_attention')
                                                                        return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" });
                                                                    if (alertLevel === 'green' || status === 'active' || status === 'secure' || status === 'normal')
                                                                        return _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" });
                                                                    return _jsx(Clock, { className: "h-4 w-4 text-gray-600" });
                                                                };
                                                                return (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "font-medium", children: component.name }), _jsx(Badge, { className: getStatusColor(component.status), children: component.status.charAt(0).toUpperCase() + component.status.slice(1).replace('_', ' ') })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: component.description }), _jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [getStatusIcon(component.status, component.alertLevel), _jsx("span", { children: component.lastScan ? `Last scan: ${new Date(component.lastScan).toLocaleTimeString()}` :
                                                                                        component.lastUpdate ? `Updated: ${new Date(component.lastUpdate).toLocaleTimeString()}` :
                                                                                            component.usersMonitored ? `${component.usersMonitored} users monitored` :
                                                                                                component.checksCompleted ? `${component.checksCompleted} checks completed` :
                                                                                                    component.alertsCount ? `${component.alertsCount} alerts` :
                                                                                                        'Status unknown' })] })] }, component.name));
                                                            }) })] }), monitoring?.recentAlerts && monitoring.recentAlerts.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Recent Security Alerts" }), _jsx("div", { className: "space-y-3", children: monitoring.recentAlerts.map((alert) => {
                                                                const getSeverityColor = (severity) => {
                                                                    switch (severity) {
                                                                        case 'critical': return 'border-red-200 bg-red-50';
                                                                        case 'high': return 'border-red-200 bg-red-50';
                                                                        case 'medium': return 'border-yellow-200 bg-yellow-50';
                                                                        case 'low': return 'border-blue-200 bg-blue-50';
                                                                        default: return 'border-gray-200 bg-gray-50';
                                                                    }
                                                                };
                                                                const getSeverityIcon = (severity) => {
                                                                    switch (severity) {
                                                                        case 'critical': return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" });
                                                                        case 'high': return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" });
                                                                        case 'medium': return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" });
                                                                        case 'low': return _jsx(Activity, { className: "h-4 w-4 text-blue-600" });
                                                                        default: return _jsx(Clock, { className: "h-4 w-4 text-gray-600" });
                                                                    }
                                                                };
                                                                return (_jsx("div", { className: `p-4 border rounded-lg ${getSeverityColor(alert.severity)}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [getSeverityIcon(alert.severity), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: alert.type }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: alert.message }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: new Date(alert.timestamp).toLocaleString() })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                                                            alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                                                                                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                                                    alert.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                                                                                                        'bg-gray-100 text-gray-800', children: alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1) }), !alert.resolved && (_jsx(Button, { size: "sm", variant: "outline", className: "h-6 text-xs", children: "Resolve" }))] })] }) }, alert.id));
                                                            }) })] })), _jsxs(Alert, { children: [_jsx(Activity, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: !monitoring?.alertSummary || monitoring.alertSummary.total === 0
                                                                ? "Security monitoring is active across all systems. No alerts detected in the last 24 hours."
                                                                : (monitoring.alertSummary.critical || 0) > 0
                                                                    ? `Critical security alerts detected! ${monitoring.alertSummary.critical} critical alerts require immediate attention.`
                                                                    : (monitoring.alertSummary.warning || 0) > 0
                                                                        ? `Security monitoring is active. ${monitoring.alertSummary.warning} warning alerts require review.`
                                                                        : "Security monitoring is active across all systems. All systems operating normally." })] })] })] }) })] }), _jsx(Dialog, { open: showQRModal, onOpenChange: setShowQRModal, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Scan QR Code" }), _jsx(DialogDescription, { children: "Scan this QR code with your authenticator app to set up two-factor authentication." })] }), _jsx("div", { className: "flex flex-col items-center space-y-4 py-4", children: mfaSetup?.qrCodeUrl ? (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex justify-center p-4 bg-white border rounded-lg", children: _jsx("img", { src: mfaSetup.qrCodeUrl, alt: "QR Code for MFA Setup", className: "border rounded", style: { width: '256px', height: '256px' } }) }), _jsxs("div", { className: "text-center space-y-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Use your authenticator app to scan this QR code" }), _jsxs("div", { className: "flex justify-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => copyToClipboard(mfaSetup.secret), children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy Secret"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowQRModal(false), children: "Close" })] })] })] })) : (_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100 mx-auto", children: _jsx(QrCode, { className: "h-16 w-16 text-gray-400" }) }), _jsx("p", { className: "text-sm text-muted-foreground", children: "QR code not available" }), _jsx(Button, { onClick: () => setShowQRModal(false), children: "Close" })] })) })] }) })] }), _jsx(Dialog, { open: showDisableDialog, onOpenChange: setShowDisableDialog, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Disable Two-Factor Authentication" }), _jsx(DialogDescription, { children: "For security reasons, please verify your identity before disabling MFA." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Verification Method" }), _jsxs("div", { className: "flex space-x-4", children: [_jsxs(Button, { variant: verificationMethod === 'totp' ? 'default' : 'outline', size: "sm", onClick: () => setVerificationMethod('totp'), children: [_jsx(Smartphone, { className: "mr-2 h-4 w-4" }), "Authenticator Code"] }), _jsxs(Button, { variant: verificationMethod === 'password' ? 'default' : 'outline', size: "sm", onClick: () => setVerificationMethod('password'), children: [_jsx(Shield, { className: "mr-2 h-4 w-4" }), "Password"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: verificationMethod === 'totp' ? 'Authenticator Code' : 'Password' }), verificationMethod === 'totp' ? (_jsx("input", { type: "text", placeholder: "Enter 6-digit code from your authenticator app", value: disableVerification.totpCode, onChange: (e) => setDisableVerification(prev => ({ ...prev, totpCode: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", maxLength: 6 })) : (_jsx("input", { type: "password", placeholder: "Enter your account password", value: disableVerification.password, onChange: (e) => setDisableVerification(prev => ({ ...prev, password: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }))] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowDisableDialog(false), children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: handleConfirmDisableMFA, disabled: !disableVerification.totpCode && !disableVerification.password, children: "Disable MFA" })] })] })] }) }), _jsx(Dialog, { open: showSecurityDetails, onOpenChange: setShowSecurityDetails, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Security Measure Details" }), _jsxs(DialogDescription, { children: ["Detailed information about ", selectedSecurityMeasure?.name] })] }), selectedSecurityMeasure && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-muted", children: selectedSecurityMeasure.status === 'active' ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : selectedSecurityMeasure.status === 'partial' ? (_jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600" })) : (_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" })) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: selectedSecurityMeasure.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: selectedSecurityMeasure.description })] })] }), _jsx(Badge, { className: selectedSecurityMeasure.status === 'active' ? 'bg-green-100 text-green-800' :
                                                selectedSecurityMeasure.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                    selectedSecurityMeasure.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                        selectedSecurityMeasure.status === 'alert' ? 'bg-red-100 text-red-800' :
                                                            selectedSecurityMeasure.status === 'monitoring' ? 'bg-blue-100 text-blue-800' :
                                                                selectedSecurityMeasure.status === 'needs_attention' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800', children: selectedSecurityMeasure.status.charAt(0).toUpperCase() + selectedSecurityMeasure.status.slice(1).replace('_', ' ') })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Current Status" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Status" }), _jsx("p", { className: "text-lg font-semibold", children: selectedSecurityMeasure.status.charAt(0).toUpperCase() + selectedSecurityMeasure.status.slice(1).replace('_', ' ') })] }), _jsxs("div", { className: "p-3 border rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Last Check" }), _jsx("p", { className: "text-lg font-semibold", children: selectedSecurityMeasure.lastCheck ? new Date(selectedSecurityMeasure.lastCheck).toLocaleDateString() : 'N/A' })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Recommendations" }), _jsxs("div", { className: "space-y-3", children: [selectedSecurityMeasure.status === 'active' && (_jsxs(Alert, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "This security measure is operating optimally. Continue monitoring for any changes." })] })), selectedSecurityMeasure.status === 'partial' && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "This security measure is partially implemented. Consider completing the setup for full protection." })] })), selectedSecurityMeasure.status === 'inactive' && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "This security measure is not active. Immediate action is required to secure your system." })] })), selectedSecurityMeasure.status === 'alert' && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Security alerts detected. Review the issues and take corrective action immediately." })] })), selectedSecurityMeasure.status === 'monitoring' && (_jsxs(Alert, { children: [_jsx(Activity, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "This security measure is under active monitoring. Watch for any anomalies." })] })), selectedSecurityMeasure.status === 'needs_attention' && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "This security measure needs attention. Review and address the identified issues." })] }))] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowSecurityDetails(false), children: "Close" }), selectedSecurityMeasure.status !== 'active' && (_jsx(Button, { onClick: () => {
                                                toast({
                                                    title: "Action Required",
                                                    description: `Please review and address the issues with ${selectedSecurityMeasure.name}.`,
                                                });
                                                setShowSecurityDetails(false);
                                            }, children: "Take Action" }))] })] }))] }) })] }));
}
