import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { PageLayout } from "../components/page-layout"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../contexts/auth-context"
import { useState, useEffect } from "react"
import { 
  securityApi, 
  type SecurityOverview, 
  type AccessControlData, 
  type AuditLog,
  type ComplianceStandard,
  type ComplianceAction,
  type EncryptionStatus,
  type SecurityMeasure,
  type MonitoringComponent,
  type SecurityAlert,
  type MFASetupResult,
  type SessionData,
  type IPWhitelistEntry,
  type APIKeyData
} from "../lib/api/security"
import {
  Shield,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Activity,
  Database,
  Globe,
  Smartphone,
  RefreshCw,
  QrCode,
  Copy,
  Trash2,
  Plus,
  Monitor,
  MapPin,
  Calendar,
} from "lucide-react"

export default function SecurityPage() {
  const { toast } = useToast()
  const { clearAllData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<SecurityOverview | null>(null)
  const [accessControl, setAccessControl] = useState<AccessControlData | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [compliance, setCompliance] = useState<{
    standards: ComplianceStandard[]
    actions: ComplianceAction[]
    overallScore: number
  } | null>(null)
  const [encryption, setEncryption] = useState<{
    encryption: EncryptionStatus
    securityMeasures: SecurityMeasure[]
    securityScore: number
  } | null>(null)
  const [monitoring, setMonitoring] = useState<{
    systemMetrics: { uptime: number; monitoring: string; incidentResponse: string }
    monitoringComponents: MonitoringComponent[]
    recentAlerts: SecurityAlert[]
    alertSummary: { total: number; critical: number; warning: number; info: number }
  } | null>(null)

  // MFA Management State
  const [mfaSetup, setMfaSetup] = useState<MFASetupResult | null>(null)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaVerificationToken, setMfaVerificationToken] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showQRModal, setShowQRModal] = useState(false)
  
  // Session Management State
  const [sessions, setSessions] = useState<SessionData[]>([])
  
  // IP Whitelist State
  const [ipWhitelist, setIpWhitelist] = useState<IPWhitelistEntry[]>([])
  const [newIP, setNewIP] = useState('')
  const [newIPDescription, setNewIPDescription] = useState('')
  
  // API Key Management State
  const [apiKeys, setApiKeys] = useState<APIKeyData[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read'])
  const [showNewAPIKey, setShowNewAPIKey] = useState(false)
  const [newAPIKeyData, setNewAPIKeyData] = useState<APIKeyData | null>(null)
  
  // MFA Disable Verification State
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [disableVerification, setDisableVerification] = useState({ totpCode: '', password: '' })
  const [verificationMethod, setVerificationMethod] = useState<'totp' | 'password'>('totp')
  const [showSecurityDetails, setShowSecurityDetails] = useState(false)
  const [selectedSecurityMeasure, setSelectedSecurityMeasure] = useState<any>(null)

  // Load all security data
  const loadSecurityData = async () => {
    setLoading(true)
    try {
      
      const [
        overviewData,
        accessControlData,
        auditLogsData,
        complianceData,
        encryptionData,
        monitoringData,
        sessionsData,
        ipWhitelistData,
        apiKeysData,
        mfaStatusData
      ] = await Promise.all([
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
      ])


      setOverview(overviewData)
      setAccessControl(accessControlData)
      // The API returns the audit logs array directly, not wrapped in a data property
      if (Array.isArray(auditLogsData)) {
        setAuditLogs(auditLogsData)
      } else if (auditLogsData?.data && Array.isArray(auditLogsData.data)) {
        setAuditLogs(auditLogsData.data)
      } else {
        setAuditLogs([])
      }
      setCompliance(complianceData)
      setEncryption(encryptionData)
      setMonitoring(monitoringData)
      
      // Update MFA status
      setMfaEnabled(mfaStatusData.mfaEnabled)
      
      
      // Add null checks for the data
      if (sessionsData && sessionsData.sessions) {
        setSessions(sessionsData.sessions)
      } else {
        setSessions([])
      }
      
      if (ipWhitelistData && ipWhitelistData.whitelistedIPs) {
        setIpWhitelist(ipWhitelistData.whitelistedIPs)
      } else {
        setIpWhitelist([])
      }
      
      if (apiKeysData && apiKeysData.apiKeys) {
        setApiKeys(apiKeysData.apiKeys)
      } else {
        setApiKeys([])
      }
    } catch (error) {
      console.error('Error loading security data:', error)
      // Set fallback values to prevent undefined errors
      setAuditLogs([])
      toast({
        title: "Error",
        description: "Failed to load security data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Security Details Functions
  const handleViewSecurityDetails = (measure: any) => {
    setSelectedSecurityMeasure(measure)
    setShowSecurityDetails(true)
  }

  // MFA Management Functions
  const handleStartMFASetup = async () => {
    try {
      const setupData = await securityApi.startMFASetup()
      
      if (setupData && setupData.secret && setupData.qrCodeUrl) {
        setMfaSetup(setupData)
        toast({
          title: "MFA Setup Started",
          description: "Scan the QR code with your authenticator app.",
        })
      } else {
        console.error('MFA setup data is incomplete:', setupData)
        toast({
          title: "Error",
          description: "MFA setup data is incomplete. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('MFA Setup Error:', error) // Debug log
      toast({
        title: "Error",
        description: "Failed to start MFA setup. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleVerifyMFA = async () => {
    if (!mfaVerificationToken) {
      toast({
        title: "Error",
        description: "Please enter the verification code.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await securityApi.verifyMFASetup(mfaVerificationToken)
      setMfaEnabled(true)
      setBackupCodes(result.backupCodes)
      setMfaSetup(null)
      setMfaVerificationToken('')
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDisableMFA = () => {
    setShowDisableDialog(true)
    setDisableVerification({ totpCode: '', password: '' })
    setVerificationMethod('totp')
  }

  const handleConfirmDisableMFA = async () => {
    try {
      const verification = verificationMethod === 'totp' 
        ? { totpCode: disableVerification.totpCode }
        : { password: disableVerification.password }

      await securityApi.disableMFA(verification)
      setMfaEnabled(false)
      setBackupCodes([])
      setShowDisableDialog(false)
      setDisableVerification({ totpCode: '', password: '' })
      
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable MFA. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRegenerateBackupCodes = async () => {
    try {
      const result = await securityApi.regenerateBackupCodes()
      setBackupCodes(result.backupCodes)
      toast({
        title: "Backup Codes Regenerated",
        description: "New backup codes have been generated. Please save them securely.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate backup codes.",
        variant: "destructive",
      })
    }
  }

  // Session Management Functions
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await securityApi.revokeSession(sessionId)
      setSessions(sessions.filter(s => s.id !== sessionId))
      toast({
        title: "Session Revoked",
        description: "The session has been successfully revoked.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session.",
        variant: "destructive",
      })
    }
  }

  // IP Whitelist Functions
  const handleAddIP = async () => {
    if (!newIP) {
      toast({
        title: "Error",
        description: "Please enter an IP address.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await securityApi.addIPToWhitelist(newIP, newIPDescription)
      setIpWhitelist([...ipWhitelist, result])
      setNewIP('')
      setNewIPDescription('')
      toast({
        title: "IP Added",
        description: "IP address has been added to the whitelist.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add IP to whitelist.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveIP = async (id: string) => {
    try {
      await securityApi.removeIPFromWhitelist(id)
      setIpWhitelist(ipWhitelist.filter(ip => ip.id !== id))
      toast({
        title: "IP Removed",
        description: "IP address has been removed from the whitelist.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove IP from whitelist.",
        variant: "destructive",
      })
    }
  }

  // API Key Functions
  const handleCreateAPIKey = async () => {
    if (!newKeyName) {
      toast({
        title: "Error",
        description: "Please enter an API key name.",
        variant: "destructive",
      })
      return
    }

    if (selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one permission.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await securityApi.createAPIKey(newKeyName, selectedPermissions)
      setApiKeys([...apiKeys, result])
      setNewKeyName('')
      setSelectedPermissions(['read'])
      setNewAPIKeyData(result)
      setShowNewAPIKey(true)
      toast({
        title: "API Key Created",
        description: "New API key has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key.",
        variant: "destructive",
      })
    }
  }

  const handleRevokeAPIKey = async (id: string) => {
    try {
      await securityApi.revokeAPIKey(id)
      setApiKeys(apiKeys.filter(key => key.id !== id))
      toast({
        title: "API Key Revoked",
        description: "API key has been revoked successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke API key.",
        variant: "destructive",
      })
    }
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    })
  }

  // Load data on component mount
  useEffect(() => {
    loadSecurityData()
  }, [])

  // Trigger security audit
  const handleSecurityAudit = async () => {
    try {
      const result = await securityApi.triggerAudit()
      toast({
        title: "Security Audit Started",
        description: `Audit ${result.auditId} initiated successfully. Estimated completion: ${new Date(result.estimatedCompletion).toLocaleTimeString()}`,
      })
    } catch (error) {
      console.error('Error triggering security audit:', error)
      toast({
        title: "Error",
        description: "Failed to start security audit. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <PageLayout>
      <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Compliance</h1>
          <p className="text-muted-foreground">Advanced security controls and regulatory compliance management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSecurityAudit} disabled={loading}>
            <Activity className="mr-2 h-4 w-4" />
            Security Audit
          </Button>
          <Button onClick={() => loadSecurityData()} disabled={loading}>
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              clearAllData()
              toast({
                title: "Data Cleared",
                description: "All localStorage data has been cleared for debugging.",
              })
            }}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data (Debug)
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="encryption">Data Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${overview?.securityScore && overview.securityScore >= 90 ? 'text-green-600' : overview?.securityScore && overview.securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {overview?.securityScore || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {overview?.securityScore && overview.securityScore >= 90 ? 'Excellent security posture' : 
                   overview?.securityScore && overview.securityScore >= 70 ? 'Good security posture' : 'Needs improvement'}
                </p>
                {/* Use compliance, encryption, and monitoring data for enhanced metrics */}
                {compliance && encryption && monitoring && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Compliance: {compliance.overallScore}%
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.activeSessions || 0}</div>
                <p className="text-xs text-muted-foreground">Across all users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${overview?.failedLogins && overview.failedLogins > 10 ? 'text-red-600' : overview?.failedLogins && overview.failedLogins > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {overview?.failedLogins || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{overview?.complianceStatus || 0}%</div>
                <p className="text-xs text-muted-foreground">SOC 2 Type II compliant</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Health Check</CardTitle>
                <CardDescription>Current security status across all systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Two-Factor Authentication</span>
                      <Badge 
                        variant="default" 
                        className={overview?.mfaPercentage === 100 ? "bg-green-100 text-green-800" : overview?.mfaPercentage && overview.mfaPercentage > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {overview?.mfaPercentage === 100 ? "Enabled" : overview?.mfaPercentage && overview.mfaPercentage > 0 ? "Partial" : "Disabled"}
                      </Badge>
                    </div>
                    <Progress value={overview?.mfaPercentage || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {overview?.mfaEnabled || 0} of {overview?.totalUsers || 0} users have 2FA enabled ({overview?.mfaPercentage || 0}%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Encryption</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground">AES-256 encryption at rest and in transit</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Access Controls</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Configured
                      </Badge>
                    </div>
                    <Progress value={95} className="h-2" />
                    <p className="text-xs text-muted-foreground">Role-based permissions active</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Backup & Recovery</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="mr-1 h-3 w-3" />
                        In Progress
                      </Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">Daily backups with 99.9% success rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security activities and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {auditLogs && auditLogs.length > 0 ? (
                      auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center space-x-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          log.status === 'failed' ? 'bg-red-100' :
                          log.action.includes('LOGIN') ? 'bg-green-100' :
                          log.action.includes('SECURITY') ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          {log.status === 'failed' ? (
                            <AlertTriangle className={`h-5 w-5 ${
                              log.status === 'failed' ? 'text-red-600' :
                              log.action.includes('LOGIN') ? 'text-green-600' :
                              log.action.includes('SECURITY') ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          ) : log.action.includes('LOGIN') ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : log.action.includes('SECURITY') ? (
                            <Shield className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Key className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{log.action.replace(/_/g, ' ').toLowerCase()}</p>
                          <p className="text-xs text-muted-foreground">User: {log.user}</p>
                          {log.ipAddress && (
                            <p className="text-xs text-muted-foreground">From: {log.ipAddress}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No recent security events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>Secure your account with two-factor authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!mfaEnabled && !mfaSetup ? (
                <div className="text-center space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 mx-auto">
                    <Smartphone className="h-10 w-10 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Enable Two-Factor Authentication</h3>
                    <p className="text-muted-foreground">
                      Add an extra layer of security to your account with 2FA
                    </p>
                  </div>
                  <Button onClick={handleStartMFASetup} className="mt-4">
                    <QrCode className="mr-2 h-4 w-4" />
                    Set Up MFA
                  </Button>
                </div>
              ) : mfaSetup ? (
                <div className="space-y-6">
                  <Alert>
                    <QrCode className="h-4 w-4" />
                    <AlertDescription>
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-center p-6 bg-white border rounded-lg">
                    <div className="text-center space-y-4">
                      <div className="space-y-4">
                        <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100 mx-auto">
                          <QrCode className="h-16 w-16 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">QR Code Ready</h3>
                          <p className="text-sm text-muted-foreground">
                            Click the button below to view and scan the QR code
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => setShowQRModal(true)}
                            className="w-full"
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(mfaSetup.secret)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Secret
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Enter the 6-digit code from your authenticator app
                      </label>
                      <input
                        type="text"
                        placeholder="123456"
                        value={mfaVerificationToken}
                        onChange={(e) => setMfaVerificationToken(e.target.value)}
                        className="w-full mt-2 px-3 py-2 border rounded-md"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleVerifyMFA} disabled={!mfaVerificationToken}>
                        Verify & Enable MFA
                      </Button>
                      <Button variant="outline" onClick={() => setMfaSetup(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Two-factor authentication is enabled and protecting your account.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">MFA Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Enabled</p>
                            <p className="text-sm text-muted-foreground">
                              Account protected with 2FA
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDisableMFA}
                          className="mt-4"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Disable MFA
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Backup Codes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Use these codes if you lose access to your authenticator app
                        </p>
                        {backupCodes.length > 0 ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              {backupCodes.slice(0, 6).map((code, index) => (
                                <div key={index} className="bg-gray-100 p-2 rounded text-center">
                                  {code}
                                </div>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRegenerateBackupCodes}
                              className="mt-3"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerate Codes
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRegenerateBackupCodes}
                          >
                            Generate Backup Codes
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active login sessions across all devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Monitor className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{session.deviceName}</p>
                          {session.isCurrent && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            <span>{session.ipAddress}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Last active: {new Date(session.lastActivity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center py-8">
                    <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No active sessions found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Management</CardTitle>
              <CardDescription>Role-based permissions and user access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All users have appropriate role-based access controls. {accessControl?.totalUsers || 0} total users, {accessControl?.activeUsers || 0} active users with granular permissions.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">User Roles & Permissions</h3>
                  <div className="space-y-3">
                    {accessControl?.roleStats ? Object.entries(accessControl.roleStats).map(([role, data]) => (
                      <div key={role} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            role === 'super_admin' ? 'bg-red-100' :
                            role === 'admin' ? 'bg-blue-100' :
                            role === 'accountant' ? 'bg-green-100' :
                            'bg-yellow-100'
                          }`}>
                            {role === 'super_admin' ? (
                              <Shield className="h-5 w-5 text-red-600" />
                            ) : role === 'admin' ? (
                              <Users className="h-5 w-5 text-blue-600" />
                            ) : role === 'accountant' ? (
                              <FileText className="h-5 w-5 text-green-600" />
                            ) : (
                              <Eye className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                            <p className="text-sm text-muted-foreground">
                              {role === 'super_admin' ? 'Full system access' :
                               role === 'admin' ? 'User & system management' :
                               role === 'accountant' ? 'Financial data access' :
                               'Read-only access'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{data.count} users</p>
                          <Badge variant={
                            role === 'super_admin' ? 'destructive' :
                            role === 'admin' ? 'secondary' :
                            role === 'accountant' ? 'default' :
                            'outline'
                          } className={
                            role === 'super_admin' ? '' :
                            role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            role === 'accountant' ? 'bg-green-100 text-green-800' :
                            ''
                          }>
                            {role === 'super_admin' ? 'Critical' :
                             role === 'admin' ? 'High' :
                             role === 'accountant' ? 'Standard' :
                             'Limited'}
                          </Badge>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No role data available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Access Control Features</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="font-medium">Two-Factor Authentication</span>
                        </div>
                        <Badge 
                          variant="default" 
                          className={accessControl?.securityFeatures?.twoFactorAuth?.required ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {accessControl?.securityFeatures?.twoFactorAuth?.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {accessControl?.securityFeatures?.twoFactorAuth?.enabledUsers || 0} of {accessControl?.securityFeatures?.twoFactorAuth?.totalUsers || 0} users have 2FA enabled ({accessControl?.securityFeatures?.twoFactorAuth?.adoptionRate || 0}%)
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">IP Whitelisting</span>
                        </div>
                        <Badge 
                          variant="default" 
                          className={accessControl?.securityFeatures?.ipWhitelisting?.active ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}
                        >
                          {accessControl?.securityFeatures?.ipWhitelisting?.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {accessControl?.securityFeatures?.ipWhitelisting?.active 
                          ? `${accessControl?.securityFeatures?.ipWhitelisting?.count || 0} IP addresses whitelisted`
                          : "No IP restrictions configured"
                        }
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Session Management</span>
                        </div>
                        <Badge 
                          variant="default" 
                          className={accessControl?.securityFeatures?.sessionManagement?.enforced ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {accessControl?.securityFeatures?.sessionManagement?.enforced ? "Configured" : "Not Enforced"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {accessControl?.securityFeatures?.sessionManagement?.enforced 
                          ? `Automatic session timeout after ${accessControl?.securityFeatures?.sessionManagement?.maxIdleTime || 30} minutes of inactivity`
                          : "Session timeout not enforced"
                        }
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4" />
                          <span className="font-medium">API Key Management</span>
                        </div>
                        <Badge 
                          variant="default" 
                          className={accessControl?.securityFeatures?.apiKeyRotation?.automatic ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}
                        >
                          {accessControl?.securityFeatures?.apiKeyRotation?.automatic ? "Automated" : "Manual"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {accessControl?.securityFeatures?.apiKeyRotation?.automatic 
                          ? `Automatic key rotation with audit logging. Next rotation: ${accessControl?.securityFeatures?.apiKeyRotation?.nextRotation ? new Date(accessControl.securityFeatures.apiKeyRotation.nextRotation).toLocaleDateString() : 'N/A'}`
                          : "Manual key rotation required"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IP Whitelist Management */}
          <Card>
            <CardHeader>
              <CardTitle>IP Whitelist Management</CardTitle>
              <CardDescription>Control which IP addresses can access your system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="IP Address (e.g., 192.168.1.100)"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newIPDescription}
                  onChange={(e) => setNewIPDescription(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={handleAddIP}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add IP
                </Button>
              </div>

              <div className="space-y-3">
                {ipWhitelist.map((ip) => (
                  <div key={ip.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{ip.ipAddress}</span>
                        {ip.isActive && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ip.description} • Added by {ip.addedBy} on {new Date(ip.addedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveIP(ip.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
                
                {ipWhitelist.length === 0 && (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No IP addresses in whitelist</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Key Management */}
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>Create and manage API keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="API Key Name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <Button onClick={handleCreateAPIKey}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create API Key
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Permissions:</label>
                  <div className="flex flex-wrap gap-2">
                    {['read', 'write', 'admin', 'reports', 'webhooks'].map((permission) => (
                      <button
                        key={permission}
                        type="button"
                        onClick={() => togglePermission(permission)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedPermissions.includes(permission)
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {permission}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select the permissions this API key should have
                  </p>
                </div>
              </div>

              {showNewAPIKey && newAPIKeyData && (
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Your new API key has been created:</p>
                      <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded font-mono text-sm">
                        <span className="flex-1">{newAPIKeyData.apiKey}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(newAPIKeyData.apiKey || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Permissions:</span>
                        <div className="flex space-x-1">
                          {newAPIKeyData.permissions?.map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Make sure to copy this key now. You won't be able to see it again!
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowNewAPIKey(false)
                          setNewAPIKeyData(null)
                        }}
                      >
                        I've saved this key
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{key.name}</span>
                        {key.isActive && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Key: {key.keyPrefix}</p>
                        <div className="flex items-center space-x-4">
                          <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                          <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>
                          {key.lastUsed && (
                            <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>Permissions:</span>
                          {key.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeAPIKey(key.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  </div>
                ))}
                
                {apiKeys.length === 0 && (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No API keys created</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail & Activity Logs</CardTitle>
              <CardDescription>Comprehensive logging of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing recent audit events • {auditLogs?.length || 0} total events loaded
                  </p>
                  <Button variant="outline" size="sm">
                    Export Logs
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-2">User</div>
                    <div className="col-span-3">Action</div>
                    <div className="col-span-2">Resource</div>
                    <div className="col-span-2">IP Address</div>
                    <div className="col-span-1">Status</div>
                  </div>

                  <div className="space-y-2">
                    {auditLogs && auditLogs.length > 0 ? (
                      auditLogs.map((log) => {
                        const getStatusBadge = (action: string) => {
                          if (action.includes('FAILED') || action.includes('DENIED')) {
                            return <Badge variant="destructive">Failed</Badge>
                          } else if (action.includes('WARNING') || action.includes('ALERT')) {
                            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
                          } else if (action.includes('INFO') || action.includes('BACKUP')) {
                            return <Badge variant="default" className="bg-blue-100 text-blue-800">Info</Badge>
                          } else {
                            return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
                          }
                        }

                        const getUserInitials = (user: string) => {
                          if (user === 'System') return 'SY'
                          const words = user.split(' ')
                          return words.map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
                        }

                        return (
                          <div key={log.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                            <div className="col-span-2 text-sm">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                            <div className="col-span-2 flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{getUserInitials(log.user)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{log.user}</span>
                            </div>
                            <div className="col-span-3 text-sm">{log.action}</div>
                            <div className="col-span-2 text-sm">{log.entityType || 'N/A'}</div>
                            <div className="col-span-2 text-sm">{log.ipAddress || 'N/A'}</div>
                            <div className="col-span-1">
                              {getStatusBadge(log.action)}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No audit logs found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance</CardTitle>
              <CardDescription>Real-time compliance status based on system security metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Compliance Score */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold">Overall Compliance Score</h3>
                  <p className="text-sm text-muted-foreground">Based on MFA adoption, security monitoring, and audit logging</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {compliance?.overallScore || 0}%
                  </div>
                  <Badge variant={(compliance?.overallScore || 0) >= 80 ? "default" : (compliance?.overallScore || 0) >= 60 ? "secondary" : "destructive"}>
                    {(compliance?.overallScore || 0) >= 80 ? "Excellent" : (compliance?.overallScore || 0) >= 60 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
              </div>

              {/* Compliance Standards */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compliance Standards</h3>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {compliance?.standards?.map((standard) => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'certified': return 'bg-green-100 text-green-800'
                        case 'compliant': return 'bg-blue-100 text-blue-800'
                        case 'non-compliant': return 'bg-red-100 text-red-800'
                        default: return 'bg-gray-100 text-gray-800'
                      }
                    }

                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case 'certified': return <CheckCircle className="h-5 w-5 text-green-600" />
                        case 'compliant': return <Shield className="h-5 w-5 text-blue-600" />
                        case 'non-compliant': return <AlertTriangle className="h-5 w-5 text-red-600" />
                        default: return <Clock className="h-5 w-5 text-gray-600" />
                      }
                    }

                    return (
                      <div key={standard.name} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              {getStatusIcon(standard.status)}
                            </div>
                            <div>
                              <p className="font-medium">{standard.name}</p>
                              <p className="text-sm text-muted-foreground">{standard.description}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(standard.status)}>
                            {standard.status.charAt(0).toUpperCase() + standard.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Score:</span>
                            <span className="font-medium">{standard.score}%</span>
                          </div>
                          <Progress value={standard.score} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Last audit: {standard.lastAudit ? new Date(standard.lastAudit).toLocaleDateString() : 'N/A'}</span>
                            <span>Next audit: {standard.nextAudit ? new Date(standard.nextAudit).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Compliance Actions */}
              {compliance?.actions && compliance.actions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Required Actions</h3>
                  <div className="space-y-3">
                    {compliance.actions.map((action) => {
                      const getPriorityColor = (priority: string) => {
                        switch (priority) {
                          case 'high': return 'border-red-200 bg-red-50'
                          case 'medium': return 'border-yellow-200 bg-yellow-50'
                          case 'low': return 'border-blue-200 bg-blue-50'
                          default: return 'border-gray-200 bg-gray-50'
                        }
                      }

                      const getPriorityBadge = (priority: string) => {
                        switch (priority) {
                          case 'high': return <Badge variant="destructive">High Priority</Badge>
                          case 'medium': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                          case 'low': return <Badge variant="default" className="bg-blue-100 text-blue-800">Low Priority</Badge>
                          default: return <Badge variant="outline">Normal</Badge>
                        }
                      }

                      const isOverdue = action.dueDate ? new Date(action.dueDate) < new Date() : false
                      const daysUntilDue = action.dueDate ? Math.ceil((new Date(action.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

                      return (
                        <div key={action.id} className={`p-4 border rounded-lg ${getPriorityColor(action.priority)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{action.title}</h4>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(action.priority)}
                              <Badge variant={isOverdue ? "destructive" : daysUntilDue <= 3 ? "secondary" : "outline"}>
                                {isOverdue ? "Overdue" : `Due in ${daysUntilDue} days`}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Due: {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'N/A'}
                            </span>
                            <Button size="sm" variant="outline">
                              {action.status === 'pending' || action.status === 'active' ? 'Start Action' : 'View Details'}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* No Actions Message */}
              {(!compliance?.actions || compliance.actions.length === 0) && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All compliance requirements are currently met. No immediate actions required.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Security & Encryption</CardTitle>
              <CardDescription>Real-time encryption status and security measures based on system metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Security Score */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold">Overall Security Score</h3>
                  <p className="text-sm text-muted-foreground">Based on password security, MFA adoption, and security monitoring</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {encryption?.securityScore || 0}%
                  </div>
                  <Badge variant={(encryption?.securityScore || 0) >= 90 ? "default" : (encryption?.securityScore || 0) >= 70 ? "secondary" : "destructive"}>
                    {(encryption?.securityScore || 0) >= 90 ? "Excellent" : (encryption?.securityScore || 0) >= 70 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Encryption Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Encryption Status</h3>
                  <div className="space-y-3">
                    {/* Data at Rest */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4" />
                          <span className="font-medium">Data at Rest</span>
                        </div>
                        <Badge variant={encryption?.encryption?.dataAtRest?.enabled ? "default" : "destructive"} 
                               className={encryption?.encryption?.dataAtRest?.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {encryption?.encryption?.dataAtRest?.algorithm || 'Not Configured'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {encryption?.encryption?.dataAtRest?.enabled 
                          ? 'All passwords are securely hashed with salt'
                          : 'Password security needs attention'}
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Status: {encryption?.encryption?.dataAtRest?.status || 'Unknown'}</span>
                        <span>Last rotation: {encryption?.encryption?.dataAtRest?.lastKeyRotation ? new Date(encryption.encryption.dataAtRest.lastKeyRotation).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Data in Transit */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">Data in Transit</span>
                        </div>
                        <Badge variant={encryption?.encryption?.dataInTransit?.enabled ? "default" : "destructive"}
                               className={encryption?.encryption?.dataInTransit?.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {encryption?.encryption?.dataInTransit?.protocol || 'Not Configured'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {encryption?.encryption?.dataInTransit?.enabled 
                          ? 'All network communications are encrypted'
                          : 'Network encryption needs to be enabled'}
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Status: {encryption?.encryption?.dataInTransit?.status || 'Unknown'}</span>
                        <span>Cert expires: {encryption?.encryption?.dataInTransit?.certificateExpiry ? new Date(encryption.encryption.dataInTransit.certificateExpiry).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Key Management */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4" />
                          <span className="font-medium">Key Management</span>
                        </div>
                        <Badge variant={encryption?.encryption?.keyManagement?.status === 'operational' ? "default" : "secondary"}
                               className={encryption?.encryption?.keyManagement?.status === 'operational' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {encryption?.encryption?.keyManagement?.type || 'Unknown'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {encryption?.encryption?.keyManagement?.status === 'operational' 
                          ? 'Key management is operational'
                          : 'Key management needs attention'}
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Keys rotated: {encryption?.encryption?.keyManagement?.keysRotated || 0}</span>
                        <span>Last rotation: {encryption?.encryption?.keyManagement?.lastRotation ? new Date(encryption.encryption.keyManagement.lastRotation).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Application Security */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">Application Security</span>
                        </div>
                        <Badge variant={encryption?.encryption?.applicationSecurity?.enabled ? "default" : "destructive"}
                               className={encryption?.encryption?.applicationSecurity?.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {encryption?.encryption?.applicationSecurity?.type || 'Not Configured'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {encryption?.encryption?.applicationSecurity?.enabled 
                          ? 'Application-level security is active'
                          : 'Application security needs improvement'}
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Status: {encryption?.encryption?.applicationSecurity?.status || 'Unknown'}</span>
                        <span>Fields encrypted: {encryption?.encryption?.applicationSecurity?.fieldsEncrypted?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Measures */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security Measures</h3>
                  <div className="space-y-3">
                    {encryption?.securityMeasures?.map((measure) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'active': return 'bg-green-100 text-green-800'
                          case 'partial': return 'bg-yellow-100 text-yellow-800'
                          case 'inactive': return 'bg-red-100 text-red-800'
                          case 'alert': return 'bg-red-100 text-red-800'
                          case 'monitoring': return 'bg-blue-100 text-blue-800'
                          case 'needs_attention': return 'bg-yellow-100 text-yellow-800'
                          default: return 'bg-gray-100 text-gray-800'
                        }
                      }

                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
                          case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          case 'inactive': return <AlertTriangle className="h-4 w-4 text-red-600" />
                          case 'alert': return <AlertTriangle className="h-4 w-4 text-red-600" />
                          case 'monitoring': return <Activity className="h-4 w-4 text-blue-600" />
                          case 'needs_attention': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          default: return <Clock className="h-4 w-4 text-gray-600" />
                        }
                      }

                      return (
                        <div key={measure.name} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(measure.status)}
                              <span className="font-medium">{measure.name}</span>
                            </div>
                            <Badge className={getStatusColor(measure.status)}>
                              {measure.status.charAt(0).toUpperCase() + measure.status.slice(1).replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{measure.description}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Last check: {measure.lastCheck ? new Date(measure.lastCheck).toLocaleDateString() : 'N/A'}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 text-xs"
                              onClick={() => handleViewSecurityDetails(measure)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Security Summary Alert */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {(encryption?.securityScore || 0) >= 90 
                    ? "All security measures are operating optimally. System is well-protected."
                    : (encryption?.securityScore || 0) >= 70
                    ? "Security measures are mostly in place. Consider reviewing areas marked as 'needs attention'."
                    : "Security measures need immediate attention. Please review and address the issues above."
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Monitoring & Alerts</CardTitle>
              <CardDescription>Real-time security monitoring and incident response based on system metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Metrics */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className={`text-2xl font-bold ${(monitoring?.systemMetrics?.uptime || 0) >= 95 ? 'text-green-600' : (monitoring?.systemMetrics?.uptime || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {monitoring?.systemMetrics?.uptime || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on security events and failed logins</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{monitoring?.systemMetrics?.monitoring || '24/7'}</div>
                  <p className="text-sm text-muted-foreground">Security Monitoring</p>
                  <p className="text-xs text-muted-foreground mt-1">Continuous monitoring active</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className={`text-2xl font-bold ${monitoring?.systemMetrics?.incidentResponse === '<5min' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {monitoring?.systemMetrics?.incidentResponse || '<5min'}
                  </div>
                  <p className="text-sm text-muted-foreground">Incident Response</p>
                  <p className="text-xs text-muted-foreground mt-1">Average response time</p>
                </div>
              </div>

              {/* Alert Summary */}
              {monitoring?.alertSummary && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Security Alert Summary</h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{monitoring.alertSummary.total}</div>
                      <p className="text-sm text-muted-foreground">Total Alerts</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{monitoring.alertSummary.critical}</div>
                      <p className="text-sm text-muted-foreground">Critical</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{monitoring.alertSummary.warning}</div>
                      <p className="text-sm text-muted-foreground">Warning</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{monitoring.alertSummary.info}</div>
                      <p className="text-sm text-muted-foreground">Info</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Monitoring Components */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Monitoring Components</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {monitoring?.monitoringComponents?.map((component) => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'active': return 'bg-green-100 text-green-800'
                        case 'secure': return 'bg-green-100 text-green-800'
                        case 'normal': return 'bg-green-100 text-green-800'
                        case 'needs_attention': return 'bg-yellow-100 text-yellow-800'
                        case 'alert': return 'bg-red-100 text-red-800'
                        case 'inactive': return 'bg-gray-100 text-gray-800'
                        default: return 'bg-gray-100 text-gray-800'
                      }
                    }

                    const getStatusIcon = (status: string, alertLevel: string) => {
                      if (alertLevel === 'red' || status === 'alert') return <AlertTriangle className="h-4 w-4 text-red-600" />
                      if (alertLevel === 'yellow' || status === 'needs_attention') return <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      if (alertLevel === 'green' || status === 'active' || status === 'secure' || status === 'normal') return <CheckCircle className="h-4 w-4 text-green-600" />
                      return <Clock className="h-4 w-4 text-gray-600" />
                    }

                    return (
                      <div key={component.name} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{component.name}</p>
                          <Badge className={getStatusColor(component.status)}>
                            {component.status.charAt(0).toUpperCase() + component.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          {getStatusIcon(component.status, component.alertLevel)}
                          <span>
                            {component.lastScan ? `Last scan: ${new Date(component.lastScan).toLocaleTimeString()}` :
                             component.lastUpdate ? `Updated: ${new Date(component.lastUpdate).toLocaleTimeString()}` :
                             component.usersMonitored ? `${component.usersMonitored} users monitored` :
                             component.checksCompleted ? `${component.checksCompleted} checks completed` :
                             component.alertsCount ? `${component.alertsCount} alerts` :
                             'Status unknown'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Security Alerts */}
              {monitoring?.recentAlerts && monitoring.recentAlerts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Security Alerts</h3>
                  <div className="space-y-3">
                    {monitoring.recentAlerts.map((alert) => {
                      const getSeverityColor = (severity: string) => {
                        switch (severity) {
                          case 'critical': return 'border-red-200 bg-red-50'
                          case 'high': return 'border-red-200 bg-red-50'
                          case 'medium': return 'border-yellow-200 bg-yellow-50'
                          case 'low': return 'border-blue-200 bg-blue-50'
                          default: return 'border-gray-200 bg-gray-50'
                        }
                      }

                      const getSeverityIcon = (severity: string) => {
                        switch (severity) {
                          case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
                          case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />
                          case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          case 'low': return <Activity className="h-4 w-4 text-blue-600" />
                          default: return <Clock className="h-4 w-4 text-gray-600" />
                        }
                      }

                      return (
                        <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getSeverityIcon(alert.severity)}
                              <div>
                                <p className="font-medium text-sm">{alert.type}</p>
                                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(alert.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                alert.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                              </Badge>
                              {!alert.resolved && (
                                <Button size="sm" variant="outline" className="h-6 text-xs">
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Monitoring Status Alert */}
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  {!monitoring?.alertSummary || monitoring.alertSummary.total === 0 
                    ? "Security monitoring is active across all systems. No alerts detected in the last 24 hours."
                    : (monitoring.alertSummary.critical || 0) > 0
                    ? `Critical security alerts detected! ${monitoring.alertSummary.critical} critical alerts require immediate attention.`
                    : (monitoring.alertSummary.warning || 0) > 0
                    ? `Security monitoring is active. ${monitoring.alertSummary.warning} warning alerts require review.`
                    : "Security monitoring is active across all systems. All systems operating normally."
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app to set up two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {mfaSetup?.qrCodeUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white border rounded-lg">
                  <img 
                    src={mfaSetup.qrCodeUrl} 
                    alt="QR Code for MFA Setup" 
                    className="border rounded"
                    style={{ width: '256px', height: '256px' }}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Use your authenticator app to scan this QR code
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(mfaSetup.secret)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Secret
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQRModal(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100 mx-auto">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  QR code not available
                </p>
                <Button onClick={() => setShowQRModal(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
        </div>

        {/* MFA Disable Verification Dialog */}
        <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                For security reasons, please verify your identity before disabling MFA.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Verification Method Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Method</label>
                <div className="flex space-x-4">
                  <Button
                    variant={verificationMethod === 'totp' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVerificationMethod('totp')}
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Authenticator Code
                  </Button>
                  <Button
                    variant={verificationMethod === 'password' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVerificationMethod('password')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Password
                  </Button>
                </div>
              </div>

              {/* Verification Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {verificationMethod === 'totp' ? 'Authenticator Code' : 'Password'}
                </label>
                {verificationMethod === 'totp' ? (
                  <input
                    type="text"
                    placeholder="Enter 6-digit code from your authenticator app"
                    value={disableVerification.totpCode}
                    onChange={(e) => setDisableVerification(prev => ({ ...prev, totpCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                  />
                ) : (
                  <input
                    type="password"
                    placeholder="Enter your account password"
                    value={disableVerification.password}
                    onChange={(e) => setDisableVerification(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDisableDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDisableMFA}
                  disabled={!disableVerification.totpCode && !disableVerification.password}
                >
                  Disable MFA
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      {/* Security Details Modal */}
      <Dialog open={showSecurityDetails} onOpenChange={setShowSecurityDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Measure Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedSecurityMeasure?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSecurityMeasure && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {selectedSecurityMeasure.status === 'active' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : selectedSecurityMeasure.status === 'partial' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedSecurityMeasure.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedSecurityMeasure.description}</p>
                  </div>
                </div>
                <Badge className={
                  selectedSecurityMeasure.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedSecurityMeasure.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  selectedSecurityMeasure.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  selectedSecurityMeasure.status === 'alert' ? 'bg-red-100 text-red-800' :
                  selectedSecurityMeasure.status === 'monitoring' ? 'bg-blue-100 text-blue-800' :
                  selectedSecurityMeasure.status === 'needs_attention' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {selectedSecurityMeasure.status.charAt(0).toUpperCase() + selectedSecurityMeasure.status.slice(1).replace('_', ' ')}
                </Badge>
              </div>

              {/* Detailed Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Current Status</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold">
                      {selectedSecurityMeasure.status.charAt(0).toUpperCase() + selectedSecurityMeasure.status.slice(1).replace('_', ' ')}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Last Check</p>
                    <p className="text-lg font-semibold">
                      {selectedSecurityMeasure.lastCheck ? new Date(selectedSecurityMeasure.lastCheck).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="font-medium">Recommendations</h4>
                <div className="space-y-3">
                  {selectedSecurityMeasure.status === 'active' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        This security measure is operating optimally. Continue monitoring for any changes.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {selectedSecurityMeasure.status === 'partial' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This security measure is partially implemented. Consider completing the setup for full protection.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {selectedSecurityMeasure.status === 'inactive' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This security measure is not active. Immediate action is required to secure your system.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {selectedSecurityMeasure.status === 'alert' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Security alerts detected. Review the issues and take corrective action immediately.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {selectedSecurityMeasure.status === 'monitoring' && (
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        This security measure is under active monitoring. Watch for any anomalies.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {selectedSecurityMeasure.status === 'needs_attention' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This security measure needs attention. Review and address the identified issues.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSecurityDetails(false)}>
                  Close
                </Button>
                {selectedSecurityMeasure.status !== 'active' && (
                  <Button onClick={() => {
                    toast({
                      title: "Action Required",
                      description: `Please review and address the issues with ${selectedSecurityMeasure.name}.`,
                    })
                    setShowSecurityDetails(false)
                  }}>
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
