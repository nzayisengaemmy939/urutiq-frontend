import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { SidebarProvider } from './contexts/sidebar-context'
import { ErrorBoundary } from './components/error-boundary'
import { Toaster } from './components/ui/toaster'
import { Toaster as SonnerToaster } from './components/ui/sonner'
import Layout from './components/layout'
import HomePage from './pages/home'
import Dashboard from './pages/dashboard'
import Accounting from './pages/accounting'
import Sales from './pages/sales'
import Expenses from './pages/expenses'
import PurchaseOrders from './pages/purchase-orders'
import AccountsPayable from './pages/accounts-payable'
import EnhancedAccountsPayable from './pages/enhanced-accounts-payable'
import Banking from './pages/banking'
import Inventory from './pages/inventory'
import Reports from './pages/reports'
import Settings from './pages/settings'
import AIInsights from './pages/ai-insights'
import EnhancedTransactionProcessing from './pages/enhanced-transaction-processing'
import EnhancedJournalManagement from './pages/enhanced-journal-management'
import CreditNotes from './pages/credit-notes'
import PeriodClose from './pages/period-close'
import RevenueRecognition from './pages/revenue-recognition'
import FixedAssets from './pages/fixed-assets'
import LlamaAI from './pages/llama-ai'
import Tax from './pages/tax'
import TaxCalculation from './pages/tax-calculation'
import Clients from './pages/clients'
import Security from './pages/security'
import Companies from './pages/companies'
import Help from './pages/help'
import HelpSupport from './pages/help-support'
import FinancialReports from './pages/financial-reports'
import JournalNew from './pages/journal-new'
import BudgetManagement from './pages/budget-management'
import Documents from './pages/documents'
import POS from './pages/pos'
import JournalHub from './pages/journal-hub'
import UnifiedApprovalHub from './pages/unified-approval-hub'
import SupplierPortal from './pages/supplier-portal'
import Login from './pages/auth/login'
import Register from './pages/auth/register'
import Unauthorized from './pages/unauthorized'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<HomePage />} />
          {/* Redirect /reports to /dashboard/reports */}
          <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
          {/* Redirect /documents to /dashboard/documents */}
          <Route path="/documents" element={<Navigate to="/dashboard/documents" replace />} />
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="sales" element={<Sales />} />
            <Route path="pos" element={<POS />} />
            <Route path="journal-hub" element={<JournalHub />} />
            <Route path="approval-hub" element={<UnifiedApprovalHub />} />
            <Route path="supplier-portal" element={<SupplierPortal />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="accounts-payable" element={<AccountsPayable />} />
            <Route path="enhanced-accounts-payable" element={<EnhancedAccountsPayable />} />
            <Route path="banking" element={<Banking />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="enhanced-transaction-processing" element={<EnhancedTransactionProcessing />} />
            <Route path="enhanced-journal-management" element={<EnhancedJournalManagement />} />
            <Route path="credit-notes" element={<CreditNotes />} />
            <Route path="period-close" element={<PeriodClose />} />
            <Route path="revenue-recognition" element={<RevenueRecognition />} />
            {/* <Route path="inventory-management" element={<InventoryManagement />} /> */}
            <Route path="fixed-assets" element={<FixedAssets />} />
            <Route path="llama-ai" element={<LlamaAI />} />
            <Route path="tax" element={<Tax />} />
            <Route path="tax-calculation" element={<TaxCalculation />} />
            <Route path="clients" element={<Clients />} />
            <Route path="companies" element={<Companies />} />
            <Route path="security" element={<Security />} />
            <Route path="help" element={<Help />} />
            <Route path="help-support" element={<Help />} />
            <Route path="financial-reports" element={<FinancialReports />} />
            {/* Alias to support sidebar link `/dashboard/financial-reporting` */}
            <Route path="financial-reporting" element={<FinancialReports />} />
            <Route path="budget-management" element={<BudgetManagement />} />
            <Route path="documents" element={<Documents />} />
            <Route path="journal/new" element={<JournalNew />} />
            <Route path="custom-report-builder" element={<Reports />} />
            {/* Add more routes as needed */}
          </Route>
          </Routes>
          <Toaster />
          <SonnerToaster position="top-right" />
        </SidebarProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
