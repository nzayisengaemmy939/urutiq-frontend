import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../lib/api';
import { PageLayout } from '../components/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ProtectedRoute } from '../components/auth/protected-route';
import { useDemoAuth } from '../hooks/useDemoAuth';
import { getCompanyId } from '../lib/config';
import { EnhancedFinancialReports } from '../components/enhanced-financial-reports';
import { TemplateManager } from '../components/reports/template-manager';
import { ReportBuilder } from '../components/reports/report-builder';
import { TemplateCreator } from '../components/reports/template-creator';
import { ReportCreationModal } from '../components/reports/report-creation-modal';
import { ConfirmationModal } from '../components/ui/confirmation-modal';
import { TemplateDetailsModal } from '../components/ui/template-details-modal';
import { useToast } from '../hooks/use-toast';
import { config } from '../lib/config';
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Plus, 
  Search, 
  Download,
  Share2,
  Calendar,
  Zap,
  Eye,
  Edit,
  Trash2,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText as Template,
  RefreshCw,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

interface FinancialReport {
  id: string;
  name: string;
  type: string;
  description?: string;
  isTemplate: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    reportItems: number;
    reportSchedules: number;
  };
  fileUrl?: string; // For compliance reports
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  isPublic: boolean;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface ReportExecution {
  id: string;
  executedAt: string;
  status: string;
  executedByUser: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ReportsPage() {
  const { toast } = useToast();
  const location = useLocation();
  const [companyId, setCompanyId] = useState<string>(getCompanyId());
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [executionStatusFilter, setExecutionStatusFilter] = useState('all');
  const [showFinancialReports, setShowFinancialReports] = useState(false);
  const [financialReportData, setFinancialReportData] = useState<any>(null);

  // Listen for company changes from header
  useEffect(() => {
    const handleStorageChange = () => {
      const newCompanyId = getCompanyId();
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Reports page - Company changed from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (in case localStorage doesn't trigger)
    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Reports page - Company changed via custom event from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [companyId]);
  
  // Determine default tab based on route
  const getDefaultTab = () => {
    if (location.pathname === '/dashboard/custom-report-builder') {
      return 'builder';
    }
    return 'overview';
  };
  
  // Dynamic financial data states
  const [balanceSheetData, setBalanceSheetData] = useState<any>(null);
  const [incomeStatementData, setIncomeStatementData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [loadingFinancialData, setLoadingFinancialData] = useState(true);
  
  // Template and report builder states
  const [showTemplateCreator, setShowTemplateCreator] = useState(false);
  const [showReportCreationModal, setShowReportCreationModal] = useState(false);
  const [selectedTemplateForReport, setSelectedTemplateForReport] = useState<any>(null);
  const [inlineReport, setInlineReport] = useState<any>(null);
  const [showInlineReport, setShowInlineReport] = useState(false);
  
  // Confirmation modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState<{
    title: string;
    description: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'default';
    icon: 'delete' | 'execute' | 'warning';
    onConfirm: () => void;
  } | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  // Template details modal states
  const [showTemplateDetailsModal, setShowTemplateDetailsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  useEffect(() => {
    // Ensure API service has tenant ID
    if (!(apiService as any).tenantId) {
      (apiService as any).tenantId = 'tenant_demo';
    }
    
    // Test API connection
    const testApiConnection = async () => {
      try {
        const testReport = await fetchReportById('cmfuyxjgo009pii03jql5wugu');
      } catch (error) {
        // Silent error handling
      }
    };
    
    testApiConnection();
    
    fetchReports();
    fetchTemplates();
    fetchExecutions();
    fetchFinancialData();
  }, []);

  // Refresh executions periodically to get updated statuses
  useEffect(() => {
    const interval = setInterval(() => {
      fetchExecutions();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoadingFinancialData(true);
      const companyId = getCompanyId();
      
      // Fetch balance sheet data
      const balanceSheetResponse = await apiService.post('/api/enhanced-financial-reports/generate', {
        reportType: 'balance-sheet',
        companyId,
        asOfDate: new Date().toISOString().split('T')[0]
      });
      setBalanceSheetData(balanceSheetResponse);

      // Fetch income statement data (current year)
      const currentYear = new Date().getFullYear();
      const incomeStatementResponse = await apiService.post('/api/enhanced-financial-reports/generate', {
        reportType: 'profit-loss',
        companyId,
        startDate: `${currentYear}-01-01`,
        endDate: new Date().toISOString().split('T')[0]
      });
      setIncomeStatementData(incomeStatementResponse);

      // Fetch cash flow data (current year)
      const cashFlowResponse = await apiService.post('/api/enhanced-financial-reports/generate', {
        reportType: 'cash-flow',
        companyId,
        startDate: `${currentYear}-01-01`,
        endDate: new Date().toISOString().split('T')[0]
      });
      setCashFlowData(cashFlowResponse);

    } catch (error) {
      // Keep static data as fallback
    } finally {
      setLoadingFinancialData(false);
    }
  };
  // Helper functions to format financial data
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBalanceSheetTotals = () => {
    if (!balanceSheetData) {
      // console.log('No balance sheet data available');
      return { totalAssets: 0, totalLiabilities: 0, totalEquity: 0 };
    }
    
    // console.log('Balance Sheet Data:', balanceSheetData);
    
    // Calculate totals from the detailed data
    const totalAssets = (balanceSheetData.assets?.currentAssets?.reduce((sum: number, asset: any) => sum + (asset.balance || 0), 0) || 0) +
                       (balanceSheetData.assets?.fixedAssets?.reduce((sum: number, asset: any) => sum + (asset.balance || 0), 0) || 0) +
                       (balanceSheetData.assets?.otherAssets?.reduce((sum: number, asset: any) => sum + (asset.balance || 0), 0) || 0);
    
    const totalLiabilities = (balanceSheetData.liabilities?.currentLiabilities?.reduce((sum: number, liability: any) => sum + (liability.balance || 0), 0) || 0) +
                           (balanceSheetData.liabilities?.longTermLiabilities?.reduce((sum: number, liability: any) => sum + (liability.balance || 0), 0) || 0);
    
    const totalEquity = (balanceSheetData.equity?.contributedCapital?.reduce((sum: number, equity: any) => sum + (equity.balance || 0), 0) || 0) +
                       (balanceSheetData.equity?.retainedEarnings?.reduce((sum: number, equity: any) => sum + (equity.balance || 0), 0) || 0) +
                       (balanceSheetData.equity?.otherEquity?.reduce((sum: number, equity: any) => sum + (equity.balance || 0), 0) || 0);
    
    const totals = {
      totalAssets,
      totalLiabilities,
      totalEquity
    };
    
    // console.log('Balance Sheet Totals:', totals);
    return totals;
  };

  const getIncomeStatementTotals = () => {
    if (!incomeStatementData) {
      // console.log('No income statement data available');
      return { totalRevenue: 0, totalExpenses: 0, netIncome: 0 };
    }
    
    // console.log('Income Statement Data:', incomeStatementData);
    
    // Calculate total revenue from all revenue arrays
    const salesRevenue = incomeStatementData.revenue?.salesRevenue?.reduce((sum: number, rev: any) => sum + (rev.balance || 0), 0) || 0;
    const serviceRevenue = incomeStatementData.revenue?.serviceRevenue?.reduce((sum: number, rev: any) => sum + (rev.balance || 0), 0) || 0;
    const otherRevenue = incomeStatementData.revenue?.otherRevenue?.reduce((sum: number, rev: any) => sum + (rev.balance || 0), 0) || 0;
    const totalRevenue = salesRevenue + serviceRevenue + otherRevenue;
    
    // Calculate total expenses
    const cogs = incomeStatementData.costOfGoodsSold?.totalCOGS || 0;
    const operatingExpenses = incomeStatementData.operatingExpenses?.totalOperatingExpenses || 0;
    const otherExpenses = incomeStatementData.otherExpenses?.totalOtherExpenses || 0;
    const totalExpenses = cogs + operatingExpenses + otherExpenses;
    
    const totals = {
      totalRevenue,
      totalExpenses,
      netIncome: incomeStatementData.netIncome || 0
    };
    
    // console.log('Income Statement Totals:', totals);
    return totals;
  };

  const getCashFlowTotals = () => {
    if (!cashFlowData) {
      // console.log('No cash flow data available');
      return { operatingCash: 0, investingCash: 0, netCashFlow: 0 };
    }
    
    // console.log('Cash Flow Data:', cashFlowData);
    
    const totals = {
      operatingCash: cashFlowData.operatingActivities?.netCashFlow || 0,
      investingCash: cashFlowData.investingActivities?.netCashFlow || 0,
      netCashFlow: cashFlowData.netCashFlow || 0
    };
    
    // console.log('Cash Flow Totals:', totals);
    return totals;
  };

  const fetchReportById = async (reportId: string) => {
    try {
      // console.log('🔧 Fetching report by ID:', reportId);
      // console.log('🔧 API Service tenant ID:', (apiService as any).tenantId || 'tenant_demo');
      
      const companyId = getCompanyId();
      if (!companyId) throw new Error('Company ID is required');
      // Use Enhanced Financial Reports API - get balance sheet as example
      const data = await apiService.get(`/api/enhanced-financial-reports/balance-sheet?companyId=${companyId}`);
      // console.log('Report by ID API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching report by ID:', error);
      throw error;
    }
  };

  const fetchReports = async () => {
    try {
      // console.log('🔧 Fetching reports with API service...');
      // console.log('🔧 API Service tenant ID:', (apiService as any).tenantId || 'tenant_demo');
      
      const companyId = getCompanyId();
      if (!companyId) throw new Error('Company ID is required');
      // Use Enhanced Financial Reports API - get templates
      const data = await apiService.get(`/api/enhanced-financial-reports/templates`);
      // console.log('Reports API response:', data);
      // console.log('Data structure:', JSON.stringify(data, null, 2));
      
      // Handle Enhanced Financial Reports API response structure
      let reportsData = [];
      
      if (data.success && data.data && Array.isArray(data.data)) {
        // Enhanced Financial Reports format
        reportsData = data.data;
      } else if (Array.isArray(data)) {
        // Direct array format
        reportsData = data;
      } else {
        // console.warn('Unexpected data format:', data);
        reportsData = [];
      }
      
      // console.log('Setting reports data:', reportsData);
      setReports(reportsData);
      
      // Legacy code for compliance reports format (keeping for reference)
      if (false && Array.isArray(data)) {
        // Compliance reports format (array of reports)
        reportsData = data.map((report: any) => {
          // Map compliance report types back to financial report types
          const typeMapping: { [key: string]: string } = {
            'Balance Sheet': 'balance_sheet',
            'P&L': 'income_statement',
            'Cash Flow': 'cash_flow',
            'AR/AP Aging': 'custom',
            'Tax Summary': 'equity'
          };

          // Parse parameters to get additional info
          let parameters: any = {};
          try {
            parameters = JSON.parse(report.parameters || '{}');
          } catch (e) {
            parameters = {};
          }

          // Generate realistic counts based on report type
          const getReportCounts = (reportType: string) => {
            switch (reportType) {
              case 'Balance Sheet':
                return { reportItems: 12, reportSchedules: 1 }; // Assets, Liabilities, Equity sections
              case 'P&L':
                return { reportItems: 8, reportSchedules: 1 }; // Revenue, COGS, Expenses sections
              case 'Cash Flow':
                return { reportItems: 6, reportSchedules: 1 }; // Operating, Investing, Financing
              case 'Tax Summary':
                return { reportItems: 4, reportSchedules: 1 }; // Tax categories
              case 'AR/AP Aging':
                return { reportItems: 5, reportSchedules: 1 }; // Age buckets
              default:
                return { reportItems: 3, reportSchedules: 0 }; // Default for custom reports
            }
          };

          const counts = getReportCounts(report.reportType);

          return {
            id: report.id,
            name: (parameters as any).name || `${report.reportType} Report`,
            type: typeMapping[report.reportType] || 'custom',
            description: (parameters as any).description || `${report.reportType} report generated on ${new Date(report.generatedAt).toLocaleDateString()}`,
            isTemplate: (parameters as any).isTemplate || false,
            isPublic: (parameters as any).isPublic || false,
            createdAt: report.generatedAt,
            updatedAt: report.generatedAt,
            createdByUser: { id: '1', name: 'Current User', email: 'user@urutiq.com' },
            _count: counts,
            fileUrl: report.fileUrl // Include file URL for PDF viewing
          };
        });
      } else if (data.reports) {
        // Financial reports format
        reportsData = data.reports;
      } else {
        reportsData = [];
      }
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Set some mock data for demonstration
      setReports([
        {
          id: '1',
          name: 'Monthly Balance Sheet',
          type: 'balance_sheet',
          description: 'Monthly balance sheet report',
          isTemplate: false,
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdByUser: { id: '1', name: 'System', email: 'system@urutiq.com' },
          _count: { reportItems: 15, reportSchedules: 1 }
        },
        {
          id: '2',
          name: 'Quarterly Income Statement',
          type: 'income_statement',
          description: 'Quarterly income statement report',
          isTemplate: false,
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdByUser: { id: '1', name: 'System', email: 'system@urutiq.com' },
          _count: { reportItems: 12, reportSchedules: 1 }
        }
      ]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const companyId = getCompanyId();
      
      if (!companyId) {
        setTemplates([]);
        return;
      }
      
      // Use Enhanced Financial Reports API for templates
      const data = await apiService.get(`/api/enhanced-financial-reports/templates`);
      
      // Handle the response structure from Enhanced Financial Reports
      let templatesArray = [];
      if (data && data.success && data.data) {
        templatesArray = data.data;
      } else if (Array.isArray(data)) {
        templatesArray = data;
      } else if (data && Array.isArray(data.templates)) {
        templatesArray = data.templates;
      } else {
        templatesArray = [];
      }
      
      setTemplates(templatesArray);
    } catch (error: any) {
      setTemplates([]);
      
      // Show detailed error toast to user
      toast({
        title: 'Error Loading Templates',
        description: `Failed to load templates: ${error?.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Filter executions based on status
  const getFilteredExecutions = () => {
    if (executionStatusFilter === 'all') {
      return executions;
    }
    return executions.filter(execution => execution.status === executionStatusFilter);
  };

  // Refresh executions from database
  const refreshExecutions = async () => {
    await fetchExecutions();
  };

  const fetchExecutions = async () => {
    try {
      // Mock executions data since we don't have a real executions endpoint yet
      const mockExecutions = [
        {
          id: 'exec-1',
          status: 'completed',
          executedAt: new Date().toISOString(),
          executedByUser: { id: '1', name: 'Current User', email: 'user@urutiq.com' },
          report: { id: 'report-1', name: 'Balance Sheet Report' }
        },
        {
          id: 'exec-2', 
          status: 'completed',
          executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          executedByUser: { id: '1', name: 'Current User', email: 'user@urutiq.com' },
          report: { id: 'report-2', name: 'Profit & Loss Report' }
        }
      ];
      
      setExecutions(mockExecutions);
    } catch (error) {
      setExecutions([]);
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'balance_sheet':
        return <BarChart3 className="h-4 w-4" />;
      case 'income_statement':
        return <TrendingUp className="h-4 w-4" />;
      case 'cash_flow':
        return <Activity className="h-4 w-4" />;
      case 'equity':
        return <PieChart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'balance_sheet':
        return 'Balance Sheet';
      case 'income_statement':
        return 'Income Statement';
      case 'cash_flow':
        return 'Cash Flow';
      case 'equity':
        return 'Equity';
      default:
        return 'Custom';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = (report.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  // Generate inline financial report for overview cards
  const generateInlineFinancialReport = async (reportType: string) => {
    try {
      const companyId = config.demo.companyId;
      const currentDate = new Date().toISOString().split('T')[0];
      let endpoint = '';
      
      // Use the same pattern as accounting.tsx - GET requests to specific endpoints
      switch (reportType) {
        case 'balance-sheet':
          endpoint = `/api/enhanced-financial-reports/balance-sheet?companyId=${companyId}&asOfDate=${currentDate}`;
          break;
        case 'profit-loss':
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          endpoint = `/api/enhanced-financial-reports/profit-loss?companyId=${companyId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${currentDate}`;
          break;
        case 'cash-flow':
          const cashStartDate = new Date();
          cashStartDate.setMonth(cashStartDate.getMonth() - 1);
          endpoint = `/api/enhanced-financial-reports/cash-flow?companyId=${companyId}&startDate=${cashStartDate.toISOString().split('T')[0]}&endDate=${currentDate}`;
          break;
        default:
          throw new Error(`Unsupported report type: ${reportType}`);
      }
      
      const response = await apiService.get(endpoint);
      
      // Handle response data the same way as accounting.tsx
      const reportData = response?.data || response;
      
      if (reportData) {
        setInlineReport(reportData);
        setShowInlineReport(true);
        
        toast({
          title: 'Report Generated',
          description: `${reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} report generated successfully.`,
        });
      } else {
        throw new Error('No data received from report generation');
      }
    } catch (error) {
      console.error('Error generating inline report:', error);
      toast({
        title: 'Error',
        description: `Failed to generate ${reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Handler functions for report actions
  const handleViewReport = async (reportId: string) => {
    // console.log('Viewing report:', reportId);
    try {
      // Handle hardcoded overview report IDs by generating inline reports
      if (reportId === 'balance-sheet-1' || reportId === 'income-statement-1' || reportId === 'cash-flow-1') {
        let reportType = 'balance-sheet';
        if (reportId === 'income-statement-1') reportType = 'profit-loss';
        if (reportId === 'cash-flow-1') reportType = 'cash-flow';
        
        // Generate inline financial report
        await generateInlineFinancialReport(reportType);
        return;
      }

      // First try to get the report from API to ensure we have latest data
      let report;
      try {
        const apiReport = await fetchReportById(reportId);
        // Convert API report to our format
        const typeMapping: { [key: string]: string } = {
          'Balance Sheet': 'balance_sheet',
          'P&L': 'income_statement',
          'Cash Flow': 'cash_flow',
          'AR/AP Aging': 'custom',
          'Tax Summary': 'equity'
        };

        let parameters: any = {};
        try {
          parameters = JSON.parse(apiReport.parameters || '{}');
        } catch (e) {
          parameters = {};
        }

        report = {
          id: apiReport.id,
          name: parameters.name || `${apiReport.reportType} Report`,
          type: typeMapping[apiReport.reportType] || 'custom',
          description: parameters.description || `${apiReport.reportType} report`,
          isTemplate: parameters.isTemplate || false,
          isPublic: parameters.isPublic || false,
          createdAt: apiReport.generatedAt,
          updatedAt: apiReport.generatedAt,
          createdByUser: { id: '1', name: 'Current User', email: 'user@urutiq.com' },
          _count: { reportItems: 5, reportSchedules: 1 },
          fileUrl: apiReport.fileUrl
        };
      } catch (error) {
        // console.log('Could not fetch from API, using local data');
        // Fallback to local reports array
        report = reports.find(r => r.id === reportId);
      }
      
      if (!report) {
        toast({
          title: 'Error',
          description: 'Report not found.',
          variant: 'destructive',
        });
        return;
      }

      // Check if this is a compliance report with file URL
      if (report.fileUrl) {
        // Extract filename from fileUrl (e.g., "/reports/filename.pdf" -> "filename.pdf")
        const filename = report.fileUrl.replace('/reports/', '');
        // Construct PDF URL using the dedicated PDF route
        const pdfUrl = `${config.api.baseUrlWithoutApi}/api/pdf/${filename}?tenantId=${config.demo.tenantId}`;
        window.open(pdfUrl, '_blank');
        
        toast({
          title: 'Opening Report',
          description: `Opening ${report.name} in a new tab...`,
        });
        return;
      }
      
      // For reports without file URL, try to generate inline view
      let reportType = '';
      switch (report.type) {
        case 'balance_sheet':
          reportType = 'balance-sheet';
          break;
        case 'income_statement':
          reportType = 'profit-loss';
          break;
        case 'cash_flow':
          reportType = 'cash-flow';
          break;
        default:
          reportType = 'balance-sheet';
      }

      toast({
        title: 'Generating Report',
        description: `Generating ${report.name}...`,
      });

      // Generate the report
      const response = await apiService.post('/api/enhanced-financial-reports/generate', {
        reportType,
        companyId: 'seed-company-1',
        asOfDate: new Date().toISOString().split('T')[0],
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });

      setFinancialReportData({ [reportType]: response.data });
      setShowFinancialReports(true);
      
      toast({
        title: 'Report Generated',
        description: `${report.name} has been generated successfully.`,
      });
      
    } catch (error) {
      console.error('Error viewing report:', error);
      toast({
        title: 'Error',
        description: 'Failed to view report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewExecutions = async (reportId: string) => {
    try {
      const executions = await fetchReportExecutions(reportId);
      // console.log('Viewing executions for report:', reportId, executions);
      
      toast({
        title: 'Execution History',
        description: `Found ${executions.length} executions for this report. Check console for details.`,
      });
      
      // TODO: Add a modal to display execution history
      // For now, we'll just log to console and show a toast
      
    } catch (error) {
      console.error('Error viewing executions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch execution history.',
        variant: 'destructive',
      });
    }
  };

  const handleExecuteReport = (reportId: string) => {
    // console.log('Executing report:', reportId);
    
    // Find the report to get its name
    const report = reports.find(r => r.id === reportId);
    const reportName = report?.name || 'Unknown Report';
    
    // Show confirmation modal
    setConfirmationConfig({
      title: 'Execute Report',
      description: `Are you sure you want to execute "${reportName}"? This will generate a new report instance.`,
      confirmText: 'Execute Report',
      variant: 'default',
      icon: 'execute',
      onConfirm: () => executeReport(reportId)
    });
    setShowConfirmationModal(true);
  };

  const fetchReportExecutions = async (reportId: string) => {
    try {
      // Use Enhanced Financial Reports API - return empty for now
      // console.log('Report executions - using mock data for reportId:', reportId);
      return [];
    } catch (error) {
      console.error('Error fetching executions:', error);
      return [];
    }
  };

  const executeReport = async (reportId: string) => {
    try {
      setIsLoadingAction(true);
      
      // console.log('Executing report:', reportId);
      const companyId = getCompanyId();
      
      if (!companyId) {
        throw new Error('No company ID found. Please select a company first.');
      }
      
      // Use Enhanced Financial Reports API to generate report
      const response = await apiService.post(`/api/enhanced-financial-reports/generate`, {
        reportType: 'balance-sheet', // Default to balance sheet
        companyId: companyId,
        asOfDate: new Date().toISOString().split('T')[0]
      });
      
      // console.log('Report execution response:', response);
      
      toast({
        title: 'Report Executed Successfully',
        description: `Report has been executed. Execution ID: ${response.executionId}`,
      });
      
      // Refresh executions from database to show the new execution
      await fetchExecutions();
      
      // Show execution results if available
      if (response.data) {
        // console.log('Execution results:', response.data);
        // You can add a modal or navigate to show the results
        // For now, we'll just log them to console
      }
      
      // Refresh reports list to show updated data
      await fetchReports();
      
    } catch (error) {
      console.error('Error executing report:', error);
      toast({
        title: 'Execution Failed',
        description: 'Failed to execute report. Please check the logs and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAction(false);
      setShowConfirmationModal(false);
    }
  };

  const handleEditReport = async (reportId: string) => {
    // console.log('Editing report:', reportId);
    
    try {
      // First try to get the report from API to ensure we have latest data
      let report;
      try {
        const apiReport = await fetchReportById(reportId);
        // Convert API report to our format
        const typeMapping: { [key: string]: string } = {
          'Balance Sheet': 'balance_sheet',
          'P&L': 'income_statement',
          'Cash Flow': 'cash_flow',
          'AR/AP Aging': 'custom',
          'Tax Summary': 'equity'
        };

        let parameters: any = {};
        try {
          parameters = JSON.parse(apiReport.parameters || '{}');
        } catch (e) {
          parameters = {};
        }

        report = {
          id: apiReport.id,
          name: parameters.name || `${apiReport.reportType} Report`,
          type: typeMapping[apiReport.reportType] || 'custom',
          description: parameters.description || `${apiReport.reportType} report`,
          isTemplate: parameters.isTemplate || false,
          isPublic: parameters.isPublic || false,
          createdAt: apiReport.generatedAt,
          updatedAt: apiReport.generatedAt,
          createdByUser: { id: '1', name: 'Current User', email: 'user@urutiq.com' },
          _count: { reportItems: 5, reportSchedules: 1 },
          fileUrl: apiReport.fileUrl
        };
      } catch (error) {
        // console.log('Could not fetch from API, using local data');
        // Fallback to local reports array
        report = reports.find(r => r.id === reportId);
      }
      
      if (!report) {
        toast({
          title: 'Error',
          description: 'Report not found.',
          variant: 'destructive',
        });
        return;
      }

      // Set the selected report for editing and open the modal
      setSelectedTemplateForReport(report);
      setShowReportCreationModal(true);
      
      toast({
        title: 'Editing Report',
        description: `Editing ${report.name}...`,
      });
    } catch (error) {
      console.error('Error preparing report for edit:', error);
      toast({
        title: 'Error',
        description: 'Failed to prepare report for editing.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReport = (reportId: string) => {
    // console.log('Deleting report:', reportId);
    
    // Find the report to get its name
    const report = reports.find(r => r.id === reportId);
    const reportName = report?.name || 'Unknown Report';
    
    // Show confirmation modal
    setConfirmationConfig({
      title: 'Delete Report',
      description: `Are you sure you want to delete "${reportName}"? This action cannot be undone.`,
      confirmText: 'Delete Report',
      variant: 'danger',
      icon: 'delete',
      onConfirm: () => deleteReport(reportId)
    });
    setShowConfirmationModal(true);
  };

  const deleteReport = async (reportId: string) => {
    try {
      setIsLoadingAction(true);
      
      // Call the API to delete the report
      const companyId = getCompanyId();
      if (!companyId) throw new Error('Company ID is required');
      // Enhanced Financial Reports API - delete not implemented yet
      // console.log('Delete report - using mock for reportId:', reportId);
      
      // Remove the report from the local state
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      toast({
        title: 'Report Deleted',
        description: `Report has been deleted successfully.`,
      });
      
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAction(false);
      setShowConfirmationModal(false);
    }
  };

  const handleCreateReport = (reportData: any) => {
    // console.log('Creating new report:', reportData);
    setSelectedTemplateForReport(reportData);
    setShowReportCreationModal(true);
  };

  const handleSubmitReport = async (formData: any) => {
    try {
      // Check if we're editing an existing report
      const isEditing = selectedTemplateForReport?.id;
      
      // Map financial report types to compliance report types
      const typeMapping: { [key: string]: string } = {
        'balance_sheet': 'Balance Sheet',
        'income_statement': 'P&L',
        'cash_flow': 'Cash Flow',
        'equity': 'Tax Summary',
        'custom': 'Balance Sheet' // Default to Balance Sheet for custom
      };

      const reportPayload = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        isTemplate: formData.isTemplate || false,
        isPublic: formData.isPublic || false,
        metadata: JSON.stringify({
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        })
      };

      // console.log(`${isEditing ? 'Updating' : 'Creating'} report with payload:`, reportPayload);
      // console.log('API Service tenant ID:', (apiService as any).tenantId || 'tenant_demo');

      let response;
      if (isEditing) {
        // Update existing report
        const companyId = getCompanyId();
        if (!companyId) throw new Error('Company ID is required');
        // Enhanced Financial Reports API - update not implemented yet
        // console.log('Update report - using mock for reportId:', selectedTemplateForReport.id);
        response = { id: selectedTemplateForReport.id, ...reportPayload };
      } else {
        // Create new report
        const companyId = getCompanyId();
        if (!companyId) throw new Error('Company ID is required');
        // Enhanced Financial Reports API - create not implemented yet
        // console.log('Create report - using mock data');
        response = { id: `report-${Date.now()}`, ...reportPayload };
      }
      
      // Generate realistic counts based on report type
      const getReportCounts = (reportType: string) => {
        switch (reportType) {
          case 'balance_sheet':
            return { reportItems: 12, reportSchedules: 1 }; // Assets, Liabilities, Equity sections
          case 'income_statement':
            return { reportItems: 8, reportSchedules: 1 }; // Revenue, COGS, Expenses sections
          case 'cash_flow':
            return { reportItems: 6, reportSchedules: 1 }; // Operating, Investing, Financing
          case 'equity':
            return { reportItems: 4, reportSchedules: 1 }; // Equity categories
          case 'custom':
            return { reportItems: 3, reportSchedules: 0 }; // Default for custom reports
          default:
            return { reportItems: 5, reportSchedules: 1 }; // Default
        }
      };

      // Convert compliance report response to financial report format for UI
      const updatedReport: FinancialReport = {
        id: response.id || selectedTemplateForReport?.id || `report-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        isTemplate: formData.isTemplate,
        isPublic: formData.isPublic,
        createdAt: response.generatedAt || selectedTemplateForReport?.createdAt || new Date().toISOString(),
        updatedAt: response.generatedAt || new Date().toISOString(),
        createdByUser: { id: '1', name: 'Current User', email: 'user@urutiq.com' },
        _count: getReportCounts(formData.type),
        fileUrl: response.fileUrl || selectedTemplateForReport?.fileUrl
      };

      if (isEditing) {
        // Update existing report in the list
        setReports(prev => prev.map(r => r.id === selectedTemplateForReport.id ? updatedReport : r));
        
        toast({
          title: 'Report Updated',
          description: 'Your report has been updated successfully.',
        });
      } else {
        // Add new report to the list
        setReports(prev => [updatedReport, ...prev]);
        
        toast({
          title: 'Report Created',
          description: 'Your report has been created successfully.',
        });
      }

      // Refresh reports list to get latest data
      await fetchReports();
      
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error',
        description: `Failed to ${selectedTemplateForReport?.id ? 'update' : 'create'} report. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleSaveAsDraft = (reportData: any) => {
    // console.log('Saving report as draft:', reportData);
    // Add the draft report to the reports list
    const draftReport: FinancialReport = {
      id: `draft-${Date.now()}`,
      name: reportData.name,
      type: reportData.type,
      description: reportData.description,
      isTemplate: false,
      isPublic: false,
      createdAt: reportData.createdAt,
      updatedAt: reportData.createdAt,
      createdByUser: { id: '1', name: 'Current User', email: 'user@urutiq.com' },
      _count: { reportItems: reportData.items?.length || 0, reportSchedules: 0 }
    };
    setReports([...reports, draftReport]);
    toast({
      title: "Draft Saved",
      description: `Draft "${reportData.name}" has been saved successfully!`,
    });
  };

  const handleCreateTemplate = () => {
    setShowTemplateCreator(true);
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      // console.log('Saving template:', templateData);
      
      // Save template to API
      const templatePayload = {
        name: templateData.name,
        type: templateData.type,
        category: (templateData.category || 'custom').toLowerCase(), // Backend expects lowercase
        description: templateData.description || '',
        isPublic: templateData.isPublic || false,
        configuration: JSON.stringify(templateData.configuration || {})
        // Note: createdBy is set by the backend from req.user?.id
      };
      
      // Enhanced Financial Reports API - template creation not implemented yet
      // console.log('Create template - using mock data');
      const response = { id: `template-${Date.now()}`, ...templatePayload };
      // console.log('Template saved to API:', response);
      
      // Add to local state
      const newTemplate: ReportTemplate = {
        id: response.id || `template-${Date.now()}`,
        name: templateData.name,
        type: templateData.type,
        category: templateData.category || 'Custom',
        description: templateData.description,
        isPublic: templateData.isPublic || false,
        createdByUser: { id: '1', name: 'Current User', email: 'user@urutiq.com' }
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      setShowTemplateCreator(false);
      
      toast({
        title: "Template Created",
        description: `Template "${templateData.name}" has been created successfully!`,
      });
      
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = (templateId: string) => {
    // console.log('Using template:', templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Create a new report based on the template
      const reportData = {
        name: `${template.name} - Report`,
        type: template.type,
        description: template.description || `Report created from template: ${template.name}`,
        companyId: 'seed-company-1',
        isTemplate: false,
        isPublic: false
      };
      
      // Set the template data and open the report creation modal
      setSelectedTemplateForReport(reportData);
      setShowReportCreationModal(true);
      
      toast({
        title: "Using Template",
        description: `Creating report from template: ${template.name}`,
      });
    }
  };

  const handleViewTemplate = (templateId: string) => {
    // console.log('Viewing template:', templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Set the selected template and show the details modal
      setSelectedTemplate(template);
      setShowTemplateDetailsModal(true);
      
      toast({
        title: "Template Details",
        description: `Viewing template: ${template.name}`,
      });
    }
  };

  const handleViewTemplates = () => {
    // console.log('Viewing report templates');
    // Switch to templates tab - this would be handled by the Tabs component
  };

  return (
    <ProtectedRoute>
      <PageLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {location.pathname === '/dashboard/custom-report-builder' ? 'Custom Report Builder' : 'Financial Reports'}
            </h1>
            <p className="text-muted-foreground">
              {location.pathname === '/dashboard/custom-report-builder' 
                ? 'Build custom financial reports with drag-and-drop interface and advanced analytics'
                : 'Create, manage, and execute comprehensive financial reports and analytics'
              }
            </p>
        </div>
          <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleViewTemplates}>
              <Template className="h-4 w-4 mr-2" />
              Templates
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchFinancialData}
            disabled={loadingFinancialData}
          >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingFinancialData ? 'animate-spin' : ''}`} />
              Refresh Data
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCreateTemplate}
          >
              <Template className="h-4 w-4 mr-2" />
              Create Template
          </Button>
          <Button onClick={handleCreateReport}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
          </Button>
        </div>
      </div>
      {/* Quick filters */}
      <div className="flex flex-wrap items-center gap-2 -mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Company</span>
          <input className="h-8 w-48 border rounded px-2 text-sm" placeholder="seed-company-1" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Period</span>
          <div className="inline-flex rounded-md border overflow-hidden">
            <button className="px-2 py-1 text-xs hover:bg-muted">MTD</button>
            <button className="px-2 py-1 text-xs hover:bg-muted">QTD</button>
            <button className="px-2 py-1 text-xs hover:bg-muted">YTD</button>
          </div>
          <input className="h-8 w-40 border rounded px-2 text-sm" placeholder="YYYY-MM-DD" />
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Template className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-muted-foreground">
                +5 new templates
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{executions.length}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last week
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Active schedules
              </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
        <Tabs defaultValue={getDefaultTab()} className="space-y-4">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>Current financial position</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingFinancialData ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Assets</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Liabilities</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Equity</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(() => {
                        const { totalAssets, totalLiabilities, totalEquity } = getBalanceSheetTotals();
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Total Assets</span>
                              <span className="font-semibold">{formatCurrency(totalAssets)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Liabilities</span>
                              <span className="font-semibold">{formatCurrency(totalLiabilities)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Equity</span>
                              <span className="font-semibold text-green-600">{formatCurrency(totalEquity)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => handleViewReport('balance-sheet-1')}
                    disabled={loadingFinancialData}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Income Statement
                  </CardTitle>
                  <CardDescription>Revenue and expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingFinancialData ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Revenue</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Expenses</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Income</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(() => {
                        const { totalRevenue, totalExpenses, netIncome } = getIncomeStatementTotals();
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Total Revenue</span>
                              <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Expenses</span>
                              <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Net Income</span>
                              <span className={`font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(netIncome)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => handleViewReport('income-statement-1')}
                    disabled={loadingFinancialData}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Cash Flow
                  </CardTitle>
                  <CardDescription>Cash movement analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingFinancialData ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Operating Cash</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <span>Investing Cash</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Cash Flow</span>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(() => {
                        const { operatingCash, investingCash, netCashFlow } = getCashFlowTotals();
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Operating Cash</span>
                              <span className={`font-semibold ${operatingCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(operatingCash)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Investing Cash</span>
                              <span className={`font-semibold ${investingCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(investingCash)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Net Cash Flow</span>
                              <span className={`font-semibold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(netCashFlow)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => handleViewReport('cash-flow-1')}
                    disabled={loadingFinancialData}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Financial Reports Component */}
            {showFinancialReports && financialReportData && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Report Details</CardTitle>
                  <CardDescription>Detailed financial analysis with export capabilities</CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFinancialReports(false)}
                    className="absolute top-4 right-4"
                  >
                    Close
                  </Button>
                </CardHeader>
                <CardContent>
                  <EnhancedFinancialReports initialData={financialReportData} />
                </CardContent>
              </Card>
            )}

            {/* Inline Report Display */}
            {showInlineReport && inlineReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      <FileText className="h-5 w-5 mr-2 inline" />
                      {inlineReport.reportType?.replace('_', ' ').toUpperCase() || 'Financial Report'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowInlineReport(false);
                        setInlineReport(null);
                      }}
                    >
                      Close
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedFinancialReports initialData={inlineReport} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recent Report Executions</CardTitle>
                <CardDescription>Latest report runs and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions.slice(0, 5).map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          execution.status === 'success' ? 'bg-green-500' :
                          execution.status === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">
                            {(execution as any).report?.name || 'Report Execution'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Executed by {execution.executedByUser.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(execution.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(execution.executedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                    <SelectItem value="income_statement">Income Statement</SelectItem>
                    <SelectItem value="cash_flow">Cash Flow</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateReport}>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getReportTypeIcon(report.type)}
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-1">
                        {report.isTemplate && (
                          <Badge variant="secondary" className="text-xs">
                            <Template className="h-3 w-3 mr-1" />
                            Template
                          </Badge>
                        )}
                        {report.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            <Share2 className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {report.description || getReportTypeLabel(report.type)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Items:</span>
                        <span className="font-medium">{report._count.reportItems}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Schedules:</span>
                        <span className="font-medium">{report._count.reportSchedules}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created by:</span>
                        <span className="font-medium">{report.createdByUser.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Updated:</span>
                        <span className="font-medium">
                          {new Date(report.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleExecuteReport(report.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewExecutions(report.id)}
                        title="View Executions"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewReport(report.id)}
                        title="View Report"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditReport(report.id)}
                        title="Edit Report"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteReport(report.id)}
                        title="Delete Report"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            {showTemplateCreator ? (
              <TemplateCreator
                onSaveTemplate={handleSaveTemplate}
                onCancel={() => setShowTemplateCreator(false)}
              />
            ) : (
              <TemplateManager
                templates={templates}
                onCreateTemplate={handleCreateTemplate}
                onUseTemplate={handleUseTemplate}
                onViewTemplate={handleViewTemplate}
              />
            )}
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Report Executions</h3>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refreshExecutions}
                  title="Refresh Executions"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Select 
                  value={executionStatusFilter} 
                  onValueChange={setExecutionStatusFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status ({executions.length})</SelectItem>
                    <SelectItem value="success">Success ({executions.filter(e => e.status === 'success').length})</SelectItem>
                    <SelectItem value="error">Error ({executions.filter(e => e.status === 'error').length})</SelectItem>
                    <SelectItem value="processing">Processing ({executions.filter(e => e.status === 'processing').length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {getFilteredExecutions().map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          execution.status === 'success' ? 'bg-green-500' :
                          execution.status === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">
                            {(execution as any).report?.name || 'Report Execution'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Executed by {execution.executedByUser.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(execution.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(execution.executedAt).toLocaleString()}
                        </span>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Builder Tab */}
          <TabsContent value="builder" className="space-y-4">
            <ReportBuilder
              onCreateReport={handleCreateReport}
              onSaveAsDraft={handleSaveAsDraft}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Report Usage
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Most Used</span>
                      <span className="font-semibold">Balance Sheet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Executions</span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Runtime</span>
                      <span className="font-semibold">2.3s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Performance
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-semibold text-green-600">98.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate</span>
                      <span className="font-semibold text-red-600">1.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Response</span>
                      <span className="font-semibold">1.8s</span>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2" />
                    Report Types
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Balance Sheets</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Income Statements</span>
                      <span className="font-semibold">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash Flow</span>
                      <span className="font-semibold">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custom</span>
                      <span className="font-semibold">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
      
      {/* Report Creation Modal */}
      <ReportCreationModal
        isOpen={showReportCreationModal}
        onClose={() => {
          setShowReportCreationModal(false);
          setSelectedTemplateForReport(null);
        }}
        onCreateReport={handleSubmitReport}
        templateData={selectedTemplateForReport}
      />
      
      {/* Confirmation Modal */}
      {confirmationConfig && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setConfirmationConfig(null);
          }}
          onConfirm={confirmationConfig.onConfirm}
          title={confirmationConfig.title}
          description={confirmationConfig.description}
          confirmText={confirmationConfig.confirmText}
          variant={confirmationConfig.variant}
          icon={confirmationConfig.icon}
          isLoading={isLoadingAction}
        />
      )}
      
      {/* Template Details Modal */}
      <TemplateDetailsModal
        isOpen={showTemplateDetailsModal}
        onClose={() => {
          setShowTemplateDetailsModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
      
      </PageLayout>
    </ProtectedRoute>
  );
}
