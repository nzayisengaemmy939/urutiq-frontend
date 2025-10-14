import { apiService } from '../api'

export interface SecurityOverview {
  securityScore: number
  activeSessions: number
  failedLogins: number
  complianceStatus: number
  totalUsers: number
  auditLogsThisMonth: number
  mfaEnabled: number
  mfaPercentage: number
  recentEvents: SecurityEvent[]
}

export interface SecurityEvent {
  id: string
  action: string
  user: string
  timestamp: string
  ipAddress?: string
}

export interface AccessControlData {
  roleStats: Record<string, { count: number; users: any[] }>
  securityFeatures: {
    twoFactorAuth: {
      required: boolean
      enabledUsers: number
      totalUsers: number
      adoptionRate: number
    }
    ipWhitelisting: {
      active: boolean
      allowedIPs: string[]
      count: number
    }
    sessionManagement: {
      maxIdleTime: number
      enforced: boolean
      activeSessions: number
    }
    apiKeyRotation: {
      automatic: boolean
      lastRotation: string
      nextRotation: string
    }
  }
  totalUsers: number
  activeUsers: number
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  entityType?: string
  entityId?: string
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failed' | 'warning'
}

export interface ComplianceStandard {
  name: string
  description: string
  status: 'certified' | 'compliant' | 'ready' | 'in_progress' | 'planned'
  lastAudit?: string
  nextAudit?: string
  score: number
}

export interface ComplianceAction {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'due_soon' | 'overdue'
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
}

export interface EncryptionStatus {
  dataAtRest: {
    enabled: boolean
    algorithm: string
    status: string
    lastKeyRotation: string
  }
  dataInTransit: {
    enabled: boolean
    protocol: string
    status: string
    certificateExpiry: string
  }
  keyManagement: {
    type: string
    status: string
    keysRotated: number
    lastRotation: string
  }
  applicationSecurity: {
    enabled: boolean
    type: string
    status: string
    fieldsEncrypted: string[]
  }
}

export interface SecurityMeasure {
  name: string
  status: string
  description: string
  lastCheck: string
}

export interface MonitoringComponent {
  name: string
  status: string
  description: string
  lastScan?: string
  usersMonitored?: number
  alertsCount?: number
  lastUpdate?: string
  checksCompleted?: number
  alertLevel: 'green' | 'blue' | 'yellow' | 'red'
}

export interface SecurityAlert {
  id: string
  type: string
  message: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

export interface MFASetupResult {
  secret: string
  otpauth: string
  qrCodeUrl: string
}

export interface MFAVerificationResult {
  enabled: boolean
  backupCodes: string[]
}

export interface SessionData {
  id: string
  deviceName: string
  ipAddress: string
  location: string
  loginTime: string
  lastActivity: string
  isCurrent: boolean
}

export interface IPWhitelistEntry {
  id: string
  ipAddress: string
  description: string
  addedBy: string
  addedAt: string
  isActive: boolean
}

export interface APIKeyData {
  id: string
  name: string
  keyPrefix: string
  lastUsed?: string
  createdAt: string
  expiresAt: string
  permissions: string[]
  isActive: boolean
  apiKey?: string // Only included during creation
}

export class SecurityApi {
  /**
   * Get security dashboard overview
   */
  async getOverview(): Promise<SecurityOverview> {
    const response = await apiService.get<SecurityOverview>('/api/security/overview')
    return response
  }

  /**
   * Get access control information
   */
  async getAccessControl(): Promise<AccessControlData> {
    const response = await apiService.get<AccessControlData>('/api/security/access-control')
    return response
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(page = 1, limit = 50): Promise<{
    data: AuditLog[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const response = await apiService.get<{
      data: AuditLog[]
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(`/api/security/audit-logs?page=${page}&limit=${limit}`)
    return response
  }

  /**
   * Get compliance status
   */
  async getCompliance(): Promise<{
    standards: ComplianceStandard[]
    actions: ComplianceAction[]
    overallScore: number
  }> {
    const response = await apiService.get<{
      standards: ComplianceStandard[]
      actions: ComplianceAction[]
      overallScore: number
    }>('/api/security/compliance')
    return response
  }

  /**
   * Get encryption and data security status
   */
  async getEncryption(): Promise<{
    encryption: EncryptionStatus
    securityMeasures: SecurityMeasure[]
    securityScore: number
  }> {
    const response = await apiService.get<{
      encryption: EncryptionStatus
      securityMeasures: SecurityMeasure[]
      securityScore: number
    }>('/api/security/encryption')
    return response
  }

  /**
   * Get security monitoring data
   */
  async getMonitoring(): Promise<{
    systemMetrics: {
      uptime: number
      monitoring: string
      incidentResponse: string
    }
    monitoringComponents: MonitoringComponent[]
    recentAlerts: SecurityAlert[]
    alertSummary: {
      total: number
      critical: number
      warning: number
      info: number
    }
  }> {
    const response = await apiService.get<{
      systemMetrics: { uptime: number; monitoring: string; incidentResponse: string }
      monitoringComponents: MonitoringComponent[]
      recentAlerts: SecurityAlert[]
      alertSummary: { total: number; critical: number; warning: number; info: number }
    }>('/api/security/monitoring')
    return response
  }

  /**
   * Update security settings
   */
  async updateSettings(setting: string, value: any): Promise<void> {
    await apiService.post('/api/security/settings', { setting, value })
  }

  /**
   * Trigger security audit
   */
  async triggerAudit(): Promise<{
    auditId: string
    estimatedCompletion: string
  }> {
    const response = await apiService.post<{
      data: {
        auditId: string
        estimatedCompletion: string
      }
    }>('/api/security/audit')
    return response.data
  }

  // MFA Management Methods
  /**
   * Get MFA status
   */
  async getMFAStatus(): Promise<{
    mfaEnabled: boolean
    mfaEnabledAt: string | null
    hasBackupCodes: boolean
  }> {
    const response = await apiService.get<{
      mfaEnabled: boolean
      mfaEnabledAt: string | null
      hasBackupCodes: boolean
    }>('/api/security/mfa/status')
    return response
  }

  /**
   * Start MFA setup
   */
  async startMFASetup(): Promise<MFASetupResult> {
    try {
      console.log('Calling MFA setup API...')
      const response = await apiService.post<MFASetupResult>('/api/security/mfa/setup/start')
      console.log('MFA setup API response:', response)
      return response
    } catch (error) {
      console.error('MFA setup API error:', error)
      throw error
    }
  }

  /**
   * Verify MFA setup
   */
  async verifyMFASetup(token: string): Promise<MFAVerificationResult> {
    const response = await apiService.post<MFAVerificationResult>('/api/security/mfa/setup/verify', { token })
    return response
  }

  /**
   * Disable MFA
   */
  async disableMFA(verification: { totpCode?: string; password?: string }): Promise<{ message: string }> {
    const response = await apiService.post<{
      message: string
    }>('/api/security/mfa/disable', verification)
    return response
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(): Promise<{ backupCodes: string[] }> {
    const response = await apiService.post<{ backupCodes: string[] }>('/api/security/mfa/backup/regenerate')
    return response
  }

  // Session Management Methods
  /**
   * Get active sessions
   */
  async getSessions(): Promise<{
    sessions: SessionData[]
    totalSessions: number
  }> {
    const response = await apiService.get<{
      sessions: SessionData[]
      totalSessions: number
    }>('/api/security/sessions')
    return response
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{
      message: string
    }>(`/api/security/sessions/${sessionId}`)
    return response
  }

  // IP Whitelist Management Methods
  /**
   * Get whitelisted IPs
   */
  async getIPWhitelist(): Promise<{
    whitelistedIPs: IPWhitelistEntry[]
    totalCount: number
  }> {
    const response = await apiService.get<{
      whitelistedIPs: IPWhitelistEntry[]
      totalCount: number
    }>('/api/security/ip-whitelist')
    return response
  }

  /**
   * Add IP to whitelist
   */
  async addIPToWhitelist(ipAddress: string, description?: string): Promise<IPWhitelistEntry> {
    const response = await apiService.post<IPWhitelistEntry>('/api/security/ip-whitelist', { ipAddress, description })
    return response
  }

  /**
   * Remove IP from whitelist
   */
  async removeIPFromWhitelist(id: string): Promise<{ message: string }> {
    const response = await apiService.delete<{
      message: string
    }>(`/api/security/ip-whitelist/${id}`)
    return response
  }

  // API Key Management Methods
  /**
   * Get API keys
   */
  async getAPIKeys(): Promise<{
    apiKeys: APIKeyData[]
    totalCount: number
  }> {
    const response = await apiService.get<{
      apiKeys: APIKeyData[]
      totalCount: number
    }>('/api/security/api-keys')
    return response
  }

  /**
   * Create API key
   */
  async createAPIKey(name: string, permissions?: string[], expiresAt?: string): Promise<APIKeyData> {
    const response = await apiService.post<APIKeyData>('/api/security/api-keys', { name, permissions, expiresAt })
    return response
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(id: string): Promise<{ message: string }> {
    const response = await apiService.delete<{
      message: string
    }>(`/api/security/api-keys/${id}`)
    return response
  }
}

export const securityApi = new SecurityApi()
