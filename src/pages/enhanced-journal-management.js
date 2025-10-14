import { jsx as _jsx } from "react/jsx-runtime";
import { EnhancedJournalManagement } from '../components/enhanced-journal-management';
import { PageLayout } from '../components/page-layout';
import { ProtectedRoute } from '../components/auth/protected-route';
export default function EnhancedJournalManagementPage() {
    return (_jsx(ProtectedRoute, { children: _jsx(PageLayout, { children: _jsx(EnhancedJournalManagement, {}) }) }));
}
