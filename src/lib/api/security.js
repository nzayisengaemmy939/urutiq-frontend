import { apiService } from '../api';
export class SecurityApi {
    /**
     * Get security dashboard overview
     */
    async getOverview() {
        const response = await apiService.get('/api/security/overview');
        return response;
    }
    /**
     * Get access control information
     */
    async getAccessControl() {
        const response = await apiService.get('/api/security/access-control');
        return response;
    }
    /**
     * Get audit logs
     */
    async getAuditLogs(page = 1, limit = 50) {
        const response = await apiService.get(`/api/security/audit-logs?page=${page}&limit=${limit}`);
        return response;
    }
    /**
     * Get compliance status
     */
    async getCompliance() {
        const response = await apiService.get('/api/security/compliance');
        return response;
    }
    /**
     * Get encryption and data security status
     */
    async getEncryption() {
        const response = await apiService.get('/api/security/encryption');
        return response;
    }
    /**
     * Get security monitoring data
     */
    async getMonitoring() {
        const response = await apiService.get('/api/security/monitoring');
        return response;
    }
    /**
     * Update security settings
     */
    async updateSettings(setting, value) {
        await apiService.post('/api/security/settings', { setting, value });
    }
    /**
     * Trigger security audit
     */
    async triggerAudit() {
        const response = await apiService.post('/api/security/audit');
        return response.data;
    }
    // MFA Management Methods
    /**
     * Get MFA status
     */
    async getMFAStatus() {
        const response = await apiService.get('/api/security/mfa/status');
        return response;
    }
    /**
     * Start MFA setup
     */
    async startMFASetup() {
        try {
            console.log('Calling MFA setup API...');
            const response = await apiService.post('/api/security/mfa/setup/start');
            console.log('MFA setup API response:', response);
            return response;
        }
        catch (error) {
            console.error('MFA setup API error:', error);
            throw error;
        }
    }
    /**
     * Verify MFA setup
     */
    async verifyMFASetup(token) {
        const response = await apiService.post('/api/security/mfa/setup/verify', { token });
        return response;
    }
    /**
     * Disable MFA
     */
    async disableMFA(verification) {
        const response = await apiService.post('/api/security/mfa/disable', verification);
        return response;
    }
    /**
     * Regenerate backup codes
     */
    async regenerateBackupCodes() {
        const response = await apiService.post('/api/security/mfa/backup/regenerate');
        return response;
    }
    // Session Management Methods
    /**
     * Get active sessions
     */
    async getSessions() {
        const response = await apiService.get('/api/security/sessions');
        return response;
    }
    /**
     * Revoke session
     */
    async revokeSession(sessionId) {
        const response = await apiService.delete(`/api/security/sessions/${sessionId}`);
        return response;
    }
    // IP Whitelist Management Methods
    /**
     * Get whitelisted IPs
     */
    async getIPWhitelist() {
        const response = await apiService.get('/api/security/ip-whitelist');
        return response;
    }
    /**
     * Add IP to whitelist
     */
    async addIPToWhitelist(ipAddress, description) {
        const response = await apiService.post('/api/security/ip-whitelist', { ipAddress, description });
        return response;
    }
    /**
     * Remove IP from whitelist
     */
    async removeIPFromWhitelist(id) {
        const response = await apiService.delete(`/api/security/ip-whitelist/${id}`);
        return response;
    }
    // API Key Management Methods
    /**
     * Get API keys
     */
    async getAPIKeys() {
        const response = await apiService.get('/api/security/api-keys');
        return response;
    }
    /**
     * Create API key
     */
    async createAPIKey(name, permissions, expiresAt) {
        const response = await apiService.post('/api/security/api-keys', { name, permissions, expiresAt });
        return response;
    }
    /**
     * Revoke API key
     */
    async revokeAPIKey(id) {
        const response = await apiService.delete(`/api/security/api-keys/${id}`);
        return response;
    }
}
export const securityApi = new SecurityApi();
