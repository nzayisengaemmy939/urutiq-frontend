import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth-context";
import { getCompanyId } from "../lib/config";
import { EnhancedJournalHub } from "../components/enhanced-journal-hub";
export default function JournalHubPage() {
    const { isAuthenticated } = useAuth();
    const [selectedCompany, setSelectedCompany] = useState(getCompanyId());
    // Listen for company changes from header
    useEffect(() => {
        const handleStorageChange = () => {
            const newCompanyId = getCompanyId();
            if (newCompanyId && newCompanyId !== selectedCompany) {
                console.log('🔄 Journal Hub page - Company changed from', selectedCompany, 'to', newCompanyId);
                setSelectedCompany(newCompanyId);
            }
        };
        // Listen for localStorage changes
        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom events (in case localStorage doesn't trigger)
        const handleCompanyChange = (e) => {
            const newCompanyId = e.detail.companyId;
            if (newCompanyId && newCompanyId !== selectedCompany) {
                console.log('🔄 Journal Hub page - Company changed via custom event from', selectedCompany, 'to', newCompanyId);
                setSelectedCompany(newCompanyId);
            }
        };
        window.addEventListener('companyChanged', handleCompanyChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyChanged', handleCompanyChange);
        };
    }, [selectedCompany]);
    if (!isAuthenticated) {
        return _jsx("div", { children: "Please log in to access the Journal Hub." });
    }
    return _jsx(EnhancedJournalHub, { companyId: selectedCompany });
}
