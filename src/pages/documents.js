import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { PageLayout } from "../components/page-layout";
import { useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "../lib/api";
import { toast } from "sonner";
import { useAuth } from "../contexts/auth-context";
import { config } from "../lib/config";
import { securityApi } from "../lib/api/security";
import { FileText, Upload, Search, Clock, Download, Share, Eye, CheckCircle, AlertTriangle, Archive, Activity, Zap, Target, TrendingUp, Cpu, Shield, Key, Users, RefreshCw, Trash2, Monitor, Database, Filter, Grid, List, MoreVertical, Star, FolderPlus, Copy, Edit, CloudUpload, FileImage, File, FileSpreadsheet, X, ChevronDown, SortAsc, SortDesc } from "lucide-react";
const CreateWorkflowForm = ({ onSubmit, onCancel, templates }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        templateId: '',
        steps: []
    });
    const [currentStep, setCurrentStep] = useState({ name: '', type: 'validation' });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.description) {
            onSubmit(formData);
        }
    };
    const addStep = () => {
        if (currentStep.name) {
            const newStep = {
                id: Date.now().toString(),
                name: currentStep.name,
                type: currentStep.type,
                order: formData.steps.length + 1
            };
            setFormData(prev => ({
                ...prev,
                steps: [...prev.steps, newStep]
            }));
            setCurrentStep({ name: '', type: 'validation' });
        }
    };
    const removeStep = (stepId) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter(step => step.id !== stepId)
        }));
    };
    const useTemplate = (template) => {
        setFormData(prev => ({
            ...prev,
            name: template.name,
            description: template.description,
            category: template.category,
            templateId: template.id,
            steps: template.steps.map((step, index) => ({
                ...step,
                id: Date.now().toString() + index,
                order: index + 1
            }))
        }));
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "workflow-name", children: "Workflow Name" }), _jsx(Input, { id: "workflow-name", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), placeholder: "Enter workflow name", required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "workflow-description", children: "Description" }), _jsx(Textarea, { id: "workflow-description", value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), placeholder: "Describe what this workflow does", required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "workflow-category", children: "Category" }), _jsxs(Select, { value: formData.category, onValueChange: (value) => setFormData(prev => ({ ...prev, category: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Finance", children: "Finance" }), _jsx(SelectItem, { value: "Legal", children: "Legal" }), _jsx(SelectItem, { value: "AI", children: "AI" }), _jsx(SelectItem, { value: "Operations", children: "Operations" })] })] })] })] }), templates.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Start from Template (Optional)" }), _jsx("div", { className: "grid gap-2", children: templates.map((template) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: template.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: template.description })] }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => useTemplate(template), children: "Use Template" })] }, template.id))) })] })), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Workflow Steps" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: currentStep.name, onChange: (e) => setCurrentStep(prev => ({ ...prev, name: e.target.value })), placeholder: "Step name", className: "flex-1" }), _jsxs(Select, { value: currentStep.type, onValueChange: (value) => setCurrentStep(prev => ({ ...prev, type: value })), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "validation", children: "Validation" }), _jsx(SelectItem, { value: "approval", children: "Approval" }), _jsx(SelectItem, { value: "action", children: "Action" }), _jsx(SelectItem, { value: "review", children: "Review" }), _jsx(SelectItem, { value: "ai_processing", children: "AI Processing" })] })] }), _jsx(Button, { type: "button", onClick: addStep, disabled: !currentStep.name, children: "Add Step" })] }), _jsx("div", { className: "space-y-2", children: formData.steps.map((step) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium", children: step.order }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: step.name }), _jsx("p", { className: "text-sm text-muted-foreground capitalize", children: step.type })] })] }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => removeStep(step.id), children: _jsx(AlertTriangle, { className: "h-4 w-4" }) })] }, step.id))) })] }), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: !formData.name || !formData.description, children: "Create Workflow" })] })] }));
};
export default function DocumentsPage() {
    const { isAuthenticated, loginWithDemo, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        totalDocuments: 0,
        storageUsed: '0 GB',
        pendingApprovals: 0,
        sharedDocuments: 0
    });
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploading, setUploading] = useState(false);
    // Enhanced UI state
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedDocuments, setSelectedDocuments] = useState(new Set());
    const [dragActive, setDragActive] = useState(false);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        displayName: '',
        description: '',
        categoryId: '',
        workspaceId: ''
    });
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageBlobUrl, setImageBlobUrl] = useState(null);
    const [textContent, setTextContent] = useState(null);
    const [textLoading, setTextLoading] = useState(false);
    const [textError, setTextError] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    // Workflow states
    const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false);
    const [showPendingApprovals, setShowPendingApprovals] = useState(false);
    const [showWorkflowTemplates, setShowWorkflowTemplates] = useState(false);
    const [showWorkflowAnalytics, setShowWorkflowAnalytics] = useState(false);
    // Workflow data
    const [workflowStats, setWorkflowStats] = useState({
        activeWorkflows: 0,
        pendingApprovals: 0,
        completedToday: 0,
        averageProcessingTime: 0
    });
    const [workflows, setWorkflows] = useState([]);
    const [workflowTemplates, setWorkflowTemplates] = useState([]);
    const [workflowLoading, setWorkflowLoading] = useState(false);
    // Security data
    const [securityOverview, setSecurityOverview] = useState(null);
    const [accessControl, setAccessControl] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [compliance, setCompliance] = useState(null);
    const [complianceActions, setComplianceActions] = useState([]);
    const [encryption, setEncryption] = useState(null);
    const [securityAlerts, setSecurityAlerts] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [securityLoading, setSecurityLoading] = useState(false);
    // AI Intelligence state
    const [aiStats, setAiStats] = useState({
        totalDocuments: 0,
        analyzedDocuments: 0,
        analyzedPercentage: 0,
        smartTagsCount: 0,
        activeInsights: 0,
        qualityScore: 0
    });
    const [qualityAnalysis, setQualityAnalysis] = useState({
        completeness: 0,
        clarity: 0,
        compliance: 0,
        accessibility: 0
    });
    const [categorizationSuggestions, setCategorizationSuggestions] = useState([]);
    const [aiInsights, setAiInsights] = useState([]);
    const [aiTags, setAiTags] = useState([]);
    const [aiExtractions, setAiExtractions] = useState([]);
    const [aiSummaries, setAiSummaries] = useState([]);
    const [aiSearchQuery, setAiSearchQuery] = useState('');
    const [aiSearchResults, setAiSearchResults] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                // Auto-login with demo credentials
                loginWithDemo('demo@urutiq.com', ['admin']).catch(console.error);
            }
            else {
                loadDocumentData();
            }
        }
    }, [isAuthenticated, authLoading, loginWithDemo]);
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            loadDocumentData();
            loadWorkflowData();
            loadSecurityData();
        }
    }, [isAuthenticated, authLoading]);
    // Load AI data when component mounts and user is authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            // Add a small delay to ensure authentication is fully processed
            const timer = setTimeout(() => {
                loadAIData();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, authLoading]);
    const loadDocumentData = async () => {
        try {
            setLoading(true);
            // Load document statistics
            const statsResponse = await apiService.get('/api/documents/stats');
            setStats(statsResponse);
            // Load documents list
            const documentsResponse = await apiService.get('/api/documents?limit=20');
            setDocuments(documentsResponse.documents || []);
        }
        catch (error) {
            console.error('Error loading document data:', error);
            toast.error('Failed to load document data');
        }
        finally {
            setLoading(false);
        }
    };
    const loadAIData = async () => {
        try {
            setAiLoading(true);
            // Check if we have authentication before making AI calls
            if (!isAuthenticated) {
                return;
            }
            // Load AI data from various endpoints
            try {
                const stats = await apiService.getAIStats();
                setAiStats(stats);
            }
            catch (error) {
                setAiStats({ totalDocuments: 0, analyzedDocuments: 0, analyzedPercentage: 0, smartTagsCount: 0, activeInsights: 0, qualityScore: 0 });
            }
            try {
                const quality = await apiService.getQualityAnalysis();
                setQualityAnalysis(quality);
            }
            catch (error) {
                setQualityAnalysis({ completeness: 0, clarity: 0, compliance: 0, accessibility: 0 });
            }
            try {
                const suggestions = await apiService.getCategorizationSuggestions();
                setCategorizationSuggestions(suggestions);
            }
            catch (error) {
                setCategorizationSuggestions([]);
            }
            try {
                const insights = await apiService.getAIInsights();
                setAiInsights(insights);
            }
            catch (error) {
                setAiInsights([]);
            }
            try {
                const tags = await apiService.getAITags();
                setAiTags(tags);
            }
            catch (error) {
                setAiTags([]);
            }
            try {
                const extractions = await apiService.getAIExtractions();
                setAiExtractions(extractions);
            }
            catch (error) {
                setAiExtractions([]);
            }
            try {
                const summaries = await apiService.getAISummaries();
                setAiSummaries(summaries);
            }
            catch (error) {
                setAiSummaries([]);
            }
        }
        catch (error) {
            // Show user-friendly error message
            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    toast.error('Unable to connect to AI services. Please check if the server is running.');
                }
                else if (error.message.includes('401') || error.message.includes('unauthorized')) {
                    toast.error('Authentication required for AI services. Please log in again.');
                }
                else {
                    toast.error('Failed to load AI intelligence data');
                }
            }
            else {
                toast.error('Failed to load AI intelligence data');
            }
        }
        finally {
            setAiLoading(false);
        }
    };
    const handleAISearch = async () => {
        if (!aiSearchQuery.trim())
            return;
        try {
            setAiLoading(true);
            const results = await apiService.searchDocuments(aiSearchQuery);
            setAiSearchResults(results.results);
            setShowSearchResults(true);
            if (results.totalResults === 0) {
                toast.warning(`No documents found matching "${aiSearchQuery}". Try a different search term.`);
            }
            else {
                toast.success(`Found ${results.totalResults} documents matching "${aiSearchQuery}"`);
            }
        }
        catch (error) {
            console.error('Error in AI search:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`AI search failed: ${errorMessage}`);
        }
        finally {
            setAiLoading(false);
        }
    };
    const handleQuickSearch = async (query) => {
        setAiSearchQuery(query);
        try {
            setAiLoading(true);
            const results = await apiService.searchDocuments(query);
            setAiSearchResults(results.results);
            setShowSearchResults(true);
            toast.success(`Found ${results.totalResults} documents matching "${query}"`);
        }
        catch (error) {
            console.error('Error in quick search:', error);
            toast.error('Quick search failed');
        }
        finally {
            setAiLoading(false);
        }
    };
    const clearSearch = () => {
        setAiSearchQuery('');
        setAiSearchResults([]);
        setShowSearchResults(false);
    };
    const handleGenerateSummary = async (type) => {
        try {
            setAiLoading(true);
            const summary = await apiService.generateAISummary(type);
            setAiSummaries(prev => [summary, ...prev]);
            toast.success('AI summary generated successfully');
        }
        catch (error) {
            console.error('Error generating summary:', error);
            toast.error('Failed to generate AI summary');
        }
        finally {
            setAiLoading(false);
        }
    };
    const handleApplyCategorization = async (suggestion) => {
        try {
            setAiLoading(true);
            // This would typically update document categories in the backend
            // For now, we'll just show a success message
            toast.success(`Applied categorization "${suggestion.category}" to ${suggestion.suggestedCount} documents`);
            // Reload AI data to reflect changes
            await loadAIData();
        }
        catch (error) {
            console.error('Error applying categorization:', error);
            toast.error('Failed to apply categorization');
        }
        finally {
            setAiLoading(false);
        }
    };
    const handleAnalyzeAllDocuments = async () => {
        try {
            setAiLoading(true);
            // Trigger a comprehensive analysis
            await Promise.all([
                apiService.getAIInsights(),
                apiService.getAITags(),
                apiService.getAIExtractions(),
                apiService.getCategorizationSuggestions()
            ]);
            await loadAIData();
            toast.success('Document analysis completed');
        }
        catch (error) {
            console.error('Error analyzing documents:', error);
            toast.error('Failed to analyze documents');
        }
        finally {
            setAiLoading(false);
        }
    };
    const handleGenerateFullReport = async () => {
        try {
            setAiLoading(true);
            // Generate a comprehensive report
            const report = await apiService.generateAISummary('comprehensive');
            setAiSummaries(prev => [report, ...prev]);
            toast.success('Full AI report generated successfully');
        }
        catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate full report');
        }
        finally {
            setAiLoading(false);
        }
    };
    const handleExtractAllMetadata = async () => {
        try {
            setAiLoading(true);
            // Trigger metadata extraction for all documents
            await apiService.getAIExtractions();
            await loadAIData();
            toast.success('Metadata extraction completed');
        }
        catch (error) {
            console.error('Error extracting metadata:', error);
            toast.error('Failed to extract metadata');
        }
        finally {
            setAiLoading(false);
        }
    };
    const handleManageTags = () => {
        // For now, just show a message - this could open a tag management modal
        toast.info('Tag management feature coming soon');
    };
    const handleViewSummaryDetails = (summary) => {
        // For now, just show the summary in a toast
        toast.info(`Summary: ${summary.title}\n\n${summary.content}`);
    };
    const handleExportSummary = (summary) => {
        // Export summary as text file
        const blob = new Blob([`${summary.title}\n\n${summary.content}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Summary exported successfully');
    };
    // Workflow handler functions
    const handleApproveDocument = async (documentId) => {
        try {
            // This would call the API to approve the document
            toast.success('Document approved successfully');
            // Refresh pending approvals
        }
        catch (error) {
            console.error('Error approving document:', error);
            toast.error('Failed to approve document');
        }
    };
    const handleRejectDocument = async (documentId) => {
        try {
            // This would call the API to reject the document
            toast.success('Document rejected');
            // Refresh pending approvals
        }
        catch (error) {
            console.error('Error rejecting document:', error);
            toast.error('Failed to reject document');
        }
    };
    const handleUseTemplate = (templateType) => {
        toast.info(`Using ${templateType} template - feature coming soon`);
    };
    const handleViewWorkflow = (workflowId) => {
        toast.info(`Viewing workflow ${workflowId} - feature coming soon`);
    };
    const handleCreateWorkflow = async (workflowData) => {
        try {
            console.log('Creating workflow:', workflowData);
            await apiService.createWorkflow(workflowData);
            toast.success('Workflow created successfully');
            setShowCreateWorkflowDialog(false);
            // Refresh workflow data
            await loadWorkflowData();
        }
        catch (error) {
            console.error('Error creating workflow:', error);
            toast.error('Failed to create workflow');
        }
    };
    // Load workflow data
    const loadWorkflowData = async () => {
        try {
            console.log('🔄 Loading workflow data...');
            setWorkflowLoading(true);
            // Load workflow stats
            try {
                console.log('📊 Loading workflow stats...');
                const stats = await apiService.getWorkflowStats();
                console.log('✅ Workflow stats loaded:', stats);
                setWorkflowStats(stats);
            }
            catch (error) {
                console.error('❌ Error loading workflow stats:', error);
                // Use fallback data
                setWorkflowStats({
                    activeWorkflows: 0,
                    pendingApprovals: 0,
                    completedToday: 0,
                    averageProcessingTime: 0
                });
            }
            // Load workflows
            try {
                console.log('📋 Loading workflows...');
                const workflowsData = await apiService.getWorkflows();
                console.log('✅ Workflows loaded:', workflowsData);
                setWorkflows(workflowsData.workflows || []);
            }
            catch (error) {
                console.error('❌ Error loading workflows:', error);
                setWorkflows([]);
            }
            // Load workflow templates
            try {
                console.log('📚 Loading workflow templates...');
                const templatesData = await apiService.getWorkflowTemplates();
                console.log('✅ Workflow templates loaded:', templatesData);
                setWorkflowTemplates(templatesData.templates || []);
            }
            catch (error) {
                console.error('❌ Error loading workflow templates:', error);
                setWorkflowTemplates([]);
            }
        }
        catch (error) {
            console.error('❌ Error loading workflow data:', error);
            toast.error('Failed to load workflow data');
        }
        finally {
            setWorkflowLoading(false);
            console.log('✅ Workflow data loading completed');
        }
    };
    // Load security data
    const loadSecurityData = async () => {
        try {
            console.log('🔒 Loading security data...');
            setSecurityLoading(true);
            // Load security overview
            try {
                const overview = await securityApi.getOverview();
                setSecurityOverview(overview);
            }
            catch (error) {
                console.error('❌ Error loading security overview:', error);
            }
            // Load access control data
            try {
                const access = await securityApi.getAccessControl();
                setAccessControl(access);
            }
            catch (error) {
                console.error('❌ Error loading access control:', error);
            }
            // Load audit logs
            try {
                const logsResponse = await securityApi.getAuditLogs();
                setAuditLogs(logsResponse.data || []);
            }
            catch (error) {
                console.error('❌ Error loading audit logs:', error);
            }
            // Load compliance data
            try {
                const complianceResponse = await securityApi.getCompliance();
                setCompliance(complianceResponse);
                setComplianceActions(complianceResponse.actions || []);
            }
            catch (error) {
                console.error('❌ Error loading compliance:', error);
            }
            // Load encryption status
            try {
                const encryptionResponse = await securityApi.getEncryption();
                setEncryption(encryptionResponse.encryption || null);
            }
            catch (error) {
                console.error('❌ Error loading encryption:', error);
            }
            // Load sessions
            try {
                const sessionsResponse = await securityApi.getSessions();
                setSessions(sessionsResponse.sessions || []);
            }
            catch (error) {
                console.error('❌ Error loading sessions:', error);
            }
        }
        catch (error) {
            console.error('❌ Error loading security data:', error);
            toast.error('Failed to load security data');
        }
        finally {
            setSecurityLoading(false);
            console.log('✅ Security data loading completed');
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    // Enhanced utility functions
    const getFileIcon = (mimeType) => {
        if (mimeType.startsWith('image/'))
            return FileImage;
        if (mimeType === 'application/pdf')
            return File;
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
            return FileSpreadsheet;
        return FileText;
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0)
            return 'Today';
        if (diffDays === 1)
            return 'Yesterday';
        if (diffDays < 7)
            return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };
    // Drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setSelectedFile(files[0]);
            setUploadForm(prev => ({
                ...prev,
                displayName: files[0].name.replace(/\.[^/.]+$/, '')
            }));
            setShowUploadDialog(true);
        }
    }, []);
    // Document selection handlers
    const toggleDocumentSelection = (documentId) => {
        const newSelected = new Set(selectedDocuments);
        if (newSelected.has(documentId)) {
            newSelected.delete(documentId);
        }
        else {
            newSelected.add(documentId);
        }
        setSelectedDocuments(newSelected);
    };
    const selectAllDocuments = () => {
        if (selectedDocuments.size === filteredDocuments.length) {
            setSelectedDocuments(new Set());
        }
        else {
            setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)));
        }
    };
    // Bulk actions
    const handleBulkDelete = async () => {
        if (selectedDocuments.size === 0)
            return;
        setBulkActionLoading(true);
        try {
            for (const docId of selectedDocuments) {
                await apiService.delete(`/api/documents/${docId}`);
            }
            toast.success(`Deleted ${selectedDocuments.size} documents`);
            setSelectedDocuments(new Set());
            loadDocumentData();
        }
        catch (error) {
            console.error('Error deleting documents:', error);
            toast.error('Failed to delete some documents');
        }
        finally {
            setBulkActionLoading(false);
        }
    };
    // Filter and sort documents
    const filteredDocuments = documents
        .filter(doc => {
        const matchesSearch = doc.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || doc.category?.name === filterCategory;
        return matchesSearch && matchesCategory;
    })
        .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.displayName.localeCompare(b.displayName);
                break;
            case 'date':
                comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
                break;
            case 'size':
                comparison = a.sizeBytes - b.sizeBytes;
                break;
            default:
                comparison = 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    const getFileTypeColor = (mimeType) => {
        if (mimeType.startsWith('image/'))
            return 'text-green-600';
        if (mimeType.includes('pdf'))
            return 'text-red-600';
        if (mimeType.includes('word') || mimeType.includes('document'))
            return 'text-blue-600';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
            return 'text-green-600';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
            return 'text-orange-600';
        return 'text-gray-600';
    };
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadForm(prev => ({
                ...prev,
                displayName: file.name
            }));
        }
    };
    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('displayName', uploadForm.displayName);
            formData.append('description', uploadForm.description);
            if (uploadForm.categoryId && uploadForm.categoryId !== 'none')
                formData.append('categoryId', uploadForm.categoryId);
            if (uploadForm.workspaceId && uploadForm.workspaceId !== 'none')
                formData.append('workspaceId', uploadForm.workspaceId);
            await apiService.post('/api/documents/upload', formData);
            toast.success('Document uploaded successfully');
            setShowUploadDialog(false);
            setSelectedFile(null);
            setUploadForm({
                displayName: '',
                description: '',
                categoryId: '',
                workspaceId: ''
            });
            // Refresh documents list
            await loadDocumentData();
        }
        catch (error) {
            toast.error('Failed to upload document');
        }
        finally {
            setUploading(false);
        }
    };
    const handleDownload = async (doc) => {
        try {
            const response = await fetch(`/api/documents/${doc.id}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': localStorage.getItem('company_id') || 'cmg0qxjh9003nao3ftbaz1oc1'
                }
            });
            if (!response.ok) {
                throw new Error('Download failed');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Document downloaded successfully');
        }
        catch (error) {
            toast.error('Failed to download document');
        }
    };
    const loadImageAsBlob = async (document) => {
        try {
            setImageLoading(true);
            setImageError(false);
            const url = `${config.api.baseUrl}/api/documents/stream/${document.id}?token=${localStorage.getItem('auth_token')}&tenantId=${localStorage.getItem('tenant_id')}&companyId=${localStorage.getItem('company_id')}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': localStorage.getItem('company_id') || 'cmg0lhcl3001d89wpa7q33k6y'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            setImageBlobUrl(blobUrl);
            setImageLoading(false);
        }
        catch (error) {
            setImageError(true);
            setImageLoading(false);
        }
    };
    const loadTextContent = async (document) => {
        try {
            setTextLoading(true);
            setTextError(false);
            const url = `${config.api.baseUrl}/api/documents/stream/${document.id}?token=${localStorage.getItem('auth_token')}&tenantId=${localStorage.getItem('tenant_id')}&companyId=${localStorage.getItem('company_id')}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': localStorage.getItem('company_id') || 'cmg0lhcl3001d89wpa7q33k6y'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            setTextContent(text);
            setTextLoading(false);
        }
        catch (error) {
            setTextError(true);
            setTextLoading(false);
        }
    };
    const handlePreview = (document) => {
        setPreviewDocument(document);
        setShowPreviewModal(true);
        if (document.mimeType.startsWith('image/')) {
            loadImageAsBlob(document);
        }
        else if (document.mimeType.startsWith('text/')) {
            loadTextContent(document);
        }
    };
    const handleDelete = (document) => {
        setDocumentToDelete(document);
        setShowDeleteDialog(true);
    };
    const confirmDelete = async () => {
        if (!documentToDelete)
            return;
        try {
            await apiService.delete(`/api/documents/${documentToDelete.id}`);
            toast.success('Document deleted successfully');
            await loadDocumentData();
        }
        catch (error) {
            toast.error('Failed to delete document');
        }
        finally {
            setShowDeleteDialog(false);
            setDocumentToDelete(null);
        }
    };
    const closePreviewModal = () => {
        // Clean up blob URL to prevent memory leaks
        if (imageBlobUrl) {
            URL.revokeObjectURL(imageBlobUrl);
            setImageBlobUrl(null);
        }
        setShowPreviewModal(false);
        setImageError(false);
        setImageLoading(false);
        setTextContent(null);
        setTextError(false);
        setTextLoading(false);
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "flex-1 space-y-6 p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Document Management & Intelligence" }), _jsx("p", { className: "text-muted-foreground", children: "Enterprise-grade document management with AI-powered insights and advanced workflows" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", onClick: loadDocumentData, children: [_jsx(Activity, { className: "mr-2 h-4 w-4" }), "Refresh Data"] }), _jsxs(Dialog, { open: showUploadDialog, onOpenChange: setShowUploadDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => setShowUploadDialog(true), children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Upload Document"] }) }), _jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Upload Document" }), _jsx(DialogDescription, { children: "Upload a new document to your workspace. Files will be stored securely and processed by AI." })] }), _jsxs("div", { className: "grid gap-6 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "file", children: "File" }), _jsx("div", { className: `border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, children: selectedFile ? (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "flex items-center justify-center", children: (() => {
                                                                                    const FileIcon = getFileIcon(selectedFile.type);
                                                                                    return _jsx(FileIcon, { className: "h-8 w-8 text-blue-500" });
                                                                                })() }), _jsx("p", { className: "font-medium", children: selectedFile.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [(selectedFile.size / 1024 / 1024).toFixed(2), " MB \u2022 ", selectedFile.type] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                    setSelectedFile(null);
                                                                                    setUploadForm(prev => ({ ...prev, displayName: '' }));
                                                                                }, children: [_jsx(X, { className: "mr-2 h-4 w-4" }), "Remove File"] })] })) : (_jsxs("div", { className: "space-y-2", children: [_jsx(CloudUpload, { className: "h-8 w-8 text-gray-400 mx-auto" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Drop files here or click to browse" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Supports all file types up to 100MB" })] }), _jsx(Input, { id: "file", type: "file", ref: fileInputRef, onChange: handleFileSelect, accept: "*/*", className: "hidden" }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => fileInputRef.current?.click(), children: "Choose File" })] })) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "displayName", children: "Display Name" }), _jsx(Input, { id: "displayName", value: uploadForm.displayName, onChange: (e) => setUploadForm(prev => ({ ...prev, displayName: e.target.value })), placeholder: "Enter a descriptive name for your document", required: true }), uploadForm.displayName && uploadForm.displayName.length < 3 && (_jsx("p", { className: "text-xs text-red-500", children: "Display name must be at least 3 characters" }))] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: uploadForm.description, onChange: (e) => setUploadForm(prev => ({ ...prev, description: e.target.value })), placeholder: "Describe the document content and purpose...", rows: 3 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Optional but helps with AI categorization and search" })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "category", children: "Category" }), _jsxs(Select, { value: uploadForm.categoryId, onValueChange: (value) => setUploadForm(prev => ({ ...prev, categoryId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Auto-detect" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "auto", children: "\uD83E\uDD16 Auto-detect with AI" }), _jsx(SelectItem, { value: "none", children: "\uD83D\uDCC4 No specific category" }), _jsx(SelectItem, { value: "financial", children: "\uD83D\uDCB0 Financial Documents" }), _jsx(SelectItem, { value: "legal", children: "\u2696\uFE0F Legal & Contracts" }), _jsx(SelectItem, { value: "technical", children: "\uD83D\uDD27 Technical Documentation" }), _jsx(SelectItem, { value: "invoice", children: "\uD83E\uDDFE Invoices & Receipts" }), _jsx(SelectItem, { value: "report", children: "\uD83D\uDCCA Reports & Analytics" }), _jsx(SelectItem, { value: "correspondence", children: "\uD83D\uDCE7 Correspondence" }), _jsx(SelectItem, { value: "marketing", children: "\uD83D\uDCE2 Marketing Materials" }), _jsx(SelectItem, { value: "hr", children: "\uD83D\uDC65 HR & Personnel" })] })] })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "workspace", children: "Workspace" }), _jsxs(Select, { value: uploadForm.workspaceId, onValueChange: (value) => setUploadForm(prev => ({ ...prev, workspaceId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Default workspace" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "default", children: "\uD83C\uDFE0 Default Workspace" }), _jsx(SelectItem, { value: "finance", children: "\uD83D\uDCBC Finance Team" }), _jsx(SelectItem, { value: "legal", children: "\u2696\uFE0F Legal Department" }), _jsx(SelectItem, { value: "operations", children: "\u2699\uFE0F Operations" }), _jsx(SelectItem, { value: "shared", children: "\uD83D\uDC65 Shared Documents" })] })] })] })] }), _jsxs("div", { className: "space-y-3 p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4 text-blue-600" }), _jsx(Label, { className: "text-sm font-medium text-blue-800", children: "AI Processing Options" })] }), _jsxs("div", { className: "grid gap-2 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "auto-categorize", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "auto-categorize", className: "text-sm", children: "Auto-categorize with AI analysis" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "extract-text", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "extract-text", className: "text-sm", children: "Extract text and generate summary" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "generate-tags", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "generate-tags", className: "text-sm", children: "Generate smart tags for search" })] })] })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: selectedFile && (_jsx("span", { children: "File will be processed with AI after upload" })) }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                                        setShowUploadDialog(false);
                                                                        setSelectedFile(null);
                                                                        setUploadForm({
                                                                            displayName: '',
                                                                            description: '',
                                                                            categoryId: '',
                                                                            workspaceId: ''
                                                                        });
                                                                    }, children: "Cancel" }), _jsx(Button, { onClick: handleUpload, disabled: !selectedFile || uploading || uploadForm.displayName.length < 3, className: "min-w-24", children: uploading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }), "Uploading..."] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Upload, { className: "h-4 w-4" }), "Upload & Process"] })) })] })] })] })] })] })] }), _jsxs(Tabs, { defaultValue: "overview", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-8", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "all", children: "Documents" }), _jsx(TabsTrigger, { value: "ai", children: "AI Intelligence" }), _jsx(TabsTrigger, { value: "workflows", children: "Workflows" }), _jsx(TabsTrigger, { value: "security", children: "Security" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search documents...", className: "pl-10 w-64", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), "Filter", _jsx(ChevronDown, { className: "ml-2 h-4 w-4" })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [_jsx(DropdownMenuItem, { onClick: () => setFilterCategory('all'), children: "All Documents" }), _jsx(DropdownMenuItem, { onClick: () => setFilterCategory('Financial'), children: "Financial" }), _jsx(DropdownMenuItem, { onClick: () => setFilterCategory('Legal'), children: "Legal" }), _jsx(DropdownMenuItem, { onClick: () => setFilterCategory('Technical'), children: "Technical" })] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [sortOrder === 'asc' ? _jsx(SortAsc, { className: "mr-2 h-4 w-4" }) : _jsx(SortDesc, { className: "mr-2 h-4 w-4" }), "Sort", _jsx(ChevronDown, { className: "ml-2 h-4 w-4" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { onClick: () => { setSortBy('name'); setSortOrder('asc'); }, children: "Name (A-Z)" }), _jsx(DropdownMenuItem, { onClick: () => { setSortBy('name'); setSortOrder('desc'); }, children: "Name (Z-A)" }), _jsx(DropdownMenuItem, { onClick: () => { setSortBy('date'); setSortOrder('desc'); }, children: "Newest First" }), _jsx(DropdownMenuItem, { onClick: () => { setSortBy('date'); setSortOrder('asc'); }, children: "Oldest First" }), _jsx(DropdownMenuItem, { onClick: () => { setSortBy('size'); setSortOrder('desc'); }, children: "Largest First" }), _jsx(DropdownMenuItem, { onClick: () => { setSortBy('size'); setSortOrder('asc'); }, children: "Smallest First" })] })] }), _jsxs("div", { className: "flex items-center border rounded-md", children: [_jsx(Button, { variant: viewMode === 'grid' ? 'default' : 'ghost', size: "sm", onClick: () => setViewMode('grid'), className: "rounded-r-none", children: _jsx(Grid, { className: "h-4 w-4" }) }), _jsx(Button, { variant: viewMode === 'list' ? 'default' : 'ghost', size: "sm", onClick: () => setViewMode('list'), className: "rounded-l-none", children: _jsx(List, { className: "h-4 w-4" }) })] })] })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { className: "hover:shadow-md transition-shadow duration-200", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Documents" }), _jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(FileText, { className: "h-4 w-4 text-blue-600" }) })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold", children: loading ? (_jsx("div", { className: "animate-pulse bg-gray-200 h-8 w-16 rounded" })) : (stats.totalDocuments.toLocaleString()) }), _jsx("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-1", children: loading ? 'Loading...' : (_jsxs(_Fragment, { children: [_jsx(TrendingUp, { className: "h-3 w-3 text-green-500" }), "Active documents"] })) }), !loading && documents.length > 0 && (_jsx(Progress, { value: Math.min((stats.totalDocuments / 1000) * 100, 100), className: "mt-2" }))] })] }), _jsxs(Card, { className: "hover:shadow-md transition-shadow duration-200", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Storage Used" }), _jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Archive, { className: "h-4 w-4 text-purple-600" }) })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: loading ? (_jsx("div", { className: "animate-pulse bg-gray-200 h-8 w-16 rounded" })) : (stats.storageUsed) }), _jsx("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-1", children: loading ? 'Loading...' : (_jsxs(_Fragment, { children: [_jsx(Database, { className: "h-3 w-3 text-purple-500" }), "Total storage"] })) }), !loading && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex justify-between text-xs mb-1", children: [_jsx("span", { children: "Used" }), _jsx("span", { children: "75% of 10GB" })] }), _jsx(Progress, { value: 75, className: "h-2" })] }))] })] }), _jsxs(Card, { className: "hover:shadow-md transition-shadow duration-200", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Approvals" }), _jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Clock, { className: "h-4 w-4 text-yellow-600" }) })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-yellow-600", children: workflowLoading ? (_jsx("div", { className: "animate-pulse bg-gray-200 h-8 w-16 rounded" })) : (workflowStats.pendingApprovals) }), _jsx("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-1", children: workflowLoading ? 'Loading...' : (_jsxs(_Fragment, { children: [_jsx(AlertTriangle, { className: "h-3 w-3 text-yellow-500" }), "Require your review"] })) }), !workflowLoading && workflowStats.pendingApprovals > 0 && (_jsx(Button, { variant: "outline", size: "sm", className: "mt-2 w-full", children: "Review Now" }))] })] }), _jsxs(Card, { className: "hover:shadow-md transition-shadow duration-200", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Workflows" }), _jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(Activity, { className: "h-4 w-4 text-green-600" }) })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: workflowLoading ? (_jsx("div", { className: "animate-pulse bg-gray-200 h-8 w-16 rounded" })) : (workflowStats.activeWorkflows) }), _jsx("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-1", children: workflowLoading ? 'Loading...' : (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "h-3 w-3 text-green-500" }), "Processing documents"] })) }), !workflowLoading && (_jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: ["Avg. processing: ", workflowStats.averageProcessingTime || 0, "min"] }))] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-5 w-5 text-blue-600" }), "Quick Actions"] }), _jsx(CardDescription, { children: "Streamline your document management workflow" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300", onClick: () => setShowUploadDialog(true), children: [_jsx(Upload, { className: "h-6 w-6 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Upload Documents" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-300", children: [_jsx(FolderPlus, { className: "h-6 w-6 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Create Folder" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300", onClick: () => setShowCreateWorkflowDialog(true), children: [_jsx(Activity, { className: "h-6 w-6 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "New Workflow" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300", children: [_jsx(Search, { className: "h-6 w-6 text-orange-600" }), _jsx("span", { className: "text-sm font-medium", children: "AI Search" })] })] }) })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Document Intelligence Health" }), _jsx(CardDescription, { children: "AI-powered document processing and analysis status" })] }), _jsx(CardContent, { className: "space-y-4", children: aiLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading AI health data..." })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "AI Processing" }), _jsxs(Badge, { variant: "default", className: aiStats.analyzedPercentage >= 80 ? "bg-green-100 text-green-800" : aiStats.analyzedPercentage >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), aiStats.analyzedPercentage >= 80 ? 'Active' : aiStats.analyzedPercentage >= 50 ? 'Learning' : 'Needs Attention'] })] }), _jsx("div", { className: "h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: `h-2 rounded-full ${aiStats.analyzedPercentage >= 80 ? 'bg-green-500' : aiStats.analyzedPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`, style: { width: `${aiStats.analyzedPercentage}%` } }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [aiStats.analyzedPercentage, "% of documents processed with AI"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Quality Analysis" }), _jsxs(Badge, { variant: "default", className: aiStats.qualityScore >= 80 ? "bg-green-100 text-green-800" : aiStats.qualityScore >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), aiStats.qualityScore >= 80 ? 'Excellent' : aiStats.qualityScore >= 60 ? 'Good' : 'Needs Improvement'] })] }), _jsx("div", { className: "h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: `h-2 rounded-full ${aiStats.qualityScore >= 80 ? 'bg-green-500' : aiStats.qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`, style: { width: `${aiStats.qualityScore}%` } }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Average quality score: ", aiStats.qualityScore, "%"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Smart Tags" }), _jsxs(Badge, { variant: "default", className: aiStats.smartTagsCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), aiStats.smartTagsCount > 0 ? 'Generated' : 'None'] })] }), _jsx("div", { className: "h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: `h-2 rounded-full ${aiStats.smartTagsCount > 0 ? 'bg-blue-500' : 'bg-gray-400'}`, style: { width: `${Math.min(100, (aiStats.smartTagsCount / 10) * 100)}%` } }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [aiStats.smartTagsCount, " smart tags generated"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Active Insights" }), _jsxs(Badge, { variant: "secondary", className: aiStats.activeInsights > 0 ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800", children: [_jsx(Activity, { className: "mr-1 h-3 w-3" }), aiStats.activeInsights > 0 ? 'Active' : 'None'] })] }), _jsx("div", { className: "h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: `h-2 rounded-full ${aiStats.activeInsights > 0 ? 'bg-purple-500' : 'bg-gray-400'}`, style: { width: `${Math.min(100, (aiStats.activeInsights / 5) * 100)}%` } }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [aiStats.activeInsights, " active insights available"] })] })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent AI Insights" }), _jsx(CardDescription, { children: "Latest intelligent document analysis and recommendations" })] }), _jsx(CardContent, { className: "space-y-4", children: aiLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading AI insights..." })] })) : aiInsights.length > 0 ? (_jsx("div", { className: "space-y-3", children: aiInsights.slice(0, 4).map((insight, index) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-green-100", children: _jsx(Zap, { className: "h-5 w-5 text-green-600" }) }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("p", { className: "text-sm font-medium", children: insight.title }), _jsx("p", { className: "text-xs text-muted-foreground", children: insight.description }), _jsx("p", { className: "text-xs text-muted-foreground", children: insight.timestamp ? new Date(insight.timestamp).toLocaleString() : 'Recently' })] })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Zap, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No AI insights available" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Upload more documents to generate insights" })] })) })] })] })] }), _jsxs(TabsContent, { value: "all", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Documents" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: loading ? '...' : stats.totalDocuments.toLocaleString() }), _jsx("p", { className: "text-xs text-muted-foreground", children: loading ? 'Loading...' : 'Active documents' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Storage Used" }), _jsx(Archive, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: loading ? '...' : stats.storageUsed }), _jsx("p", { className: "text-xs text-muted-foreground", children: loading ? 'Loading...' : 'Total storage' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Approvals" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: loading ? '...' : stats.pendingApprovals }), _jsx("p", { className: "text-xs text-muted-foreground", children: loading ? 'Loading...' : 'Require your review' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Shared Documents" }), _jsx(Share, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: loading ? '...' : stats.sharedDocuments }), _jsx("p", { className: "text-xs text-muted-foreground", children: loading ? 'Loading...' : 'Active collaborations' })] })] })] }), selectedDocuments.size > 0 && (_jsx(Card, { className: "border-l-4 border-l-blue-500", children: _jsx(CardContent, { className: "pt-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("span", { className: "text-sm font-medium", children: [selectedDocuments.size, " document", selectedDocuments.size !== 1 ? 's' : '', " selected"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedDocuments(new Set()), children: "Clear Selection" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", disabled: bulkActionLoading, children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download All"] }), _jsxs(Button, { variant: "outline", size: "sm", disabled: bulkActionLoading, children: [_jsx(Share, { className: "mr-2 h-4 w-4" }), "Share"] }), _jsxs(Button, { variant: "destructive", size: "sm", onClick: handleBulkDelete, disabled: bulkActionLoading, children: [bulkActionLoading ? (_jsx(RefreshCw, { className: "mr-2 h-4 w-4 animate-spin" })) : (_jsx(Trash2, { className: "mr-2 h-4 w-4" })), "Delete"] })] })] }) }) })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Document Library" }), _jsxs(CardDescription, { children: [filteredDocuments.length, " document", filteredDocuments.length !== 1 ? 's' : '', filterCategory !== 'all' && ` in ${filterCategory}`] })] }), _jsx("div", { className: "flex items-center space-x-2", children: filteredDocuments.length > 0 && (_jsx(Button, { variant: "outline", size: "sm", onClick: selectAllDocuments, children: selectedDocuments.size === filteredDocuments.length ? 'Deselect All' : 'Select All' })) })] }) }), _jsxs(CardContent, { className: `transition-all duration-200 ${dragActive ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, children: [dragActive && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10 rounded-lg", children: _jsxs("div", { className: "text-center", children: [_jsx(CloudUpload, { className: "h-12 w-12 text-blue-500 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-blue-700", children: "Drop files here to upload" }), _jsx("p", { className: "text-sm text-blue-600", children: "Release to start uploading" })] }) })), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading documents..." })] })) : filteredDocuments.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "h-16 w-16 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-muted-foreground mb-2", children: documents.length === 0 ? 'No documents found' : 'No documents match your filters' }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: documents.length === 0
                                                                ? 'Upload your first document to get started'
                                                                : 'Try adjusting your search or filter criteria' }), documents.length === 0 && (_jsxs(Button, { onClick: () => setShowUploadDialog(true), children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Upload Document"] }))] })) : viewMode === 'grid' ? (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: filteredDocuments.map((doc) => {
                                                        const FileIcon = getFileIcon(doc.mimeType);
                                                        const isSelected = selectedDocuments.has(doc.id);
                                                        return (_jsx(Card, { className: `group cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`, onClick: () => toggleDocumentSelection(doc.id), children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden", children: [doc.mimeType.startsWith('image/') ? (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(FileIcon, { className: "h-12 w-12 text-blue-500" }) })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(FileIcon, { className: "h-12 w-12 text-gray-400" }) })), _jsx("div", { className: `absolute top-2 left-2 w-5 h-5 rounded-full border-2 transition-all ${isSelected
                                                                                    ? 'bg-blue-500 border-blue-500'
                                                                                    : 'border-gray-300 bg-white opacity-0 group-hover:opacity-100'}`, children: isSelected && (_jsx(CheckCircle, { className: "w-full h-full text-white" })) }), _jsxs("div", { className: "absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx(Button, { size: "sm", variant: "secondary", className: "h-8 w-8 p-0", onClick: (e) => {
                                                                                            e.stopPropagation();
                                                                                            setPreviewDocument(doc);
                                                                                            setShowPreviewModal(true);
                                                                                        }, children: _jsx(Eye, { className: "h-3 w-3" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: _jsx(Button, { size: "sm", variant: "secondary", className: "h-8 w-8 p-0", children: _jsx(MoreVertical, { className: "h-3 w-3" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => handleDownload(doc), children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Share, { className: "mr-2 h-4 w-4" }), "Share"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy Link"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), "Rename"] }), _jsxs(DropdownMenuItem, { onClick: () => {
                                                                                                            setDocumentToDelete(doc);
                                                                                                            setShowDeleteDialog(true);
                                                                                                        }, className: "text-red-600", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-sm truncate", title: doc.displayName, children: doc.displayName }), _jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: formatFileSize(doc.sizeBytes) }), _jsx("span", { children: formatDate(doc.uploadedAt) })] }), doc.category && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: doc.category.name })), doc.uploader && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Avatar, { className: "h-4 w-4", children: _jsx(AvatarFallback, { className: "text-xs", children: doc.uploader.name.charAt(0).toUpperCase() }) }), _jsx("span", { className: "truncate", children: doc.uploader.name })] }))] })] }) }, doc.id));
                                                    }) })) : (_jsx("div", { className: "space-y-2", children: filteredDocuments.map((doc) => {
                                                        const FileIcon = getFileIcon(doc.mimeType);
                                                        const isSelected = selectedDocuments.has(doc.id);
                                                        return (_jsx(Card, { className: `transition-all duration-200 hover:shadow-sm ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-3 cursor-pointer flex-1", onClick: () => toggleDocumentSelection(doc.id), children: [_jsx("div", { className: `w-5 h-5 rounded border-2 transition-all ${isSelected
                                                                                        ? 'bg-blue-500 border-blue-500'
                                                                                        : 'border-gray-300'}`, children: isSelected && (_jsx(CheckCircle, { className: "w-full h-full text-white" })) }), _jsx("div", { className: "w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center", children: _jsx(FileIcon, { className: "h-5 w-5 text-gray-600" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-medium text-sm truncate", title: doc.displayName, children: doc.displayName }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [_jsx("span", { children: formatFileSize(doc.sizeBytes) }), _jsx("span", { children: formatDate(doc.uploadedAt) }), doc.category && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: doc.category.name })), doc.uploader && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Avatar, { className: "h-4 w-4", children: _jsx(AvatarFallback, { className: "text-xs", children: doc.uploader.name.charAt(0).toUpperCase() }) }), _jsx("span", { className: "truncate", children: doc.uploader.name })] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                                        setPreviewDocument(doc);
                                                                                        setShowPreviewModal(true);
                                                                                    }, children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleDownload(doc), children: _jsx(Download, { className: "h-4 w-4" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { size: "sm", variant: "outline", children: _jsx(MoreVertical, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { children: [_jsx(Share, { className: "mr-2 h-4 w-4" }), "Share"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy Link"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), "Rename"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Star, { className: "mr-2 h-4 w-4" }), "Add to Favorites"] }), _jsxs(DropdownMenuItem, { onClick: () => {
                                                                                                        setDocumentToDelete(doc);
                                                                                                        setShowDeleteDialog(true);
                                                                                                    }, className: "text-red-600", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] })] })] }) }) }, doc.id));
                                                    }) }))] })] })] }), _jsxs(TabsContent, { value: "ai", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "AI Analysis" }), _jsx(Cpu, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [aiStats.analyzedPercentage, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Documents analyzed" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Smart Tags" }), _jsx(Target, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: aiStats.smartTagsCount.toLocaleString() }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Auto-generated tags" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Insights" }), _jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: aiStats.activeInsights }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Active insights" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Quality Score" }), _jsx(Activity, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [aiStats.qualityScore, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Average quality" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Cpu, { className: "h-5 w-5 text-blue-600" }), "AI-Powered Document Analysis"] }), _jsx(CardDescription, { children: "Advanced AI search, analysis, and insights for your documents" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Search, { className: "h-4 w-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold", children: "AI-Powered Search" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Ask AI: 'Find contracts expiring this month' or 'Show me all invoices over $10,000'", className: "flex-1", value: aiSearchQuery, onChange: (e) => setAiSearchQuery(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleAISearch() }), _jsxs(Button, { onClick: handleAISearch, disabled: aiLoading || !aiSearchQuery.trim(), children: [_jsx(Cpu, { className: "mr-2 h-4 w-4" }), aiLoading ? 'Searching...' : 'AI Search'] }), aiSearchQuery && (_jsx(Button, { variant: "outline", onClick: clearSearch, children: "Clear" })), _jsx(Button, { variant: "outline", onClick: () => handleQuickSearch(''), disabled: aiLoading, children: "Show All" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleQuickSearch('contracts'), disabled: aiLoading, children: "Recent contracts" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleQuickSearch('invoices'), disabled: aiLoading, children: "High-value invoices" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleQuickSearch('expiring'), disabled: aiLoading, children: "Expiring documents" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleQuickSearch('legal'), disabled: aiLoading, children: "Legal documents" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-4 w-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold", children: "Document Quality Analysis" })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Completeness" }), _jsxs("span", { children: [qualityAnalysis.completeness, "%"] })] }), _jsx("div", { className: "h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: "h-2 bg-green-500 rounded-full", style: { width: `${qualityAnalysis.completeness}%` } }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Clarity" }), _jsxs("span", { children: [qualityAnalysis.clarity, "%"] })] }), _jsx("div", { className: "h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: "h-2 bg-blue-500 rounded-full", style: { width: `${qualityAnalysis.clarity}%` } }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Compliance" }), _jsxs("span", { children: [qualityAnalysis.compliance, "%"] })] }), _jsx("div", { className: "h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: "h-2 bg-purple-500 rounded-full", style: { width: `${qualityAnalysis.compliance}%` } }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Accessibility" }), _jsxs("span", { children: [qualityAnalysis.accessibility, "%"] })] }), _jsx("div", { className: "h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: "h-2 bg-orange-500 rounded-full", style: { width: `${qualityAnalysis.accessibility}%` } }) })] })] })] })] })] }), showSearchResults && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Search, { className: "h-5 w-5 text-blue-600" }), "AI Search Results"] }), _jsxs(CardDescription, { children: ["Found ", aiSearchResults.length, " documents matching \"", aiSearchQuery, "\""] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: clearSearch, children: "Clear Search" })] }) }), _jsx(CardContent, { children: aiSearchResults.length > 0 ? (_jsx("div", { className: "space-y-3", children: aiSearchResults.map((doc, index) => (_jsx("div", { className: "p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("h4", { className: "font-medium", children: doc.displayName || doc.name }), doc.aiScore && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["AI Score: ", Math.round(doc.aiScore), "%"] }))] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: doc.description || 'No description available' }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Type: ", doc.mimeType] }), _jsxs("span", { children: ["Size: ", formatFileSize(doc.sizeBytes)] }), _jsxs("span", { children: ["Uploaded: ", new Date(doc.uploadedAt).toLocaleDateString()] }), doc.uploader && (_jsxs("span", { children: ["By: ", doc.uploader.name] }))] }), doc.aiSummary && (_jsxs("div", { className: "mt-2 p-2 bg-blue-50 rounded text-xs", children: [_jsx("strong", { children: "AI Summary:" }), " ", doc.aiSummary] }))] }), _jsxs("div", { className: "flex gap-2 ml-4", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => handlePreview(doc), children: _jsx(Eye, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleDownload(doc), children: _jsx(Download, { className: "h-3 w-3" }) })] })] }) }, doc.id || index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Search, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No documents found matching your search criteria." }), _jsx(Button, { variant: "outline", className: "mt-4", onClick: clearSearch, children: "Try Different Search" })] })) })] })), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5 text-green-600" }), "Smart Categorization"] }), _jsx(CardDescription, { children: "AI suggestions for better document organization" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [categorizationSuggestions.map((suggestion, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-blue-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: suggestion.category }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [suggestion.suggestedCount, " documents suggested (", Math.round(suggestion.confidence * 100), "% confidence)"] })] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleApplyCategorization(suggestion), disabled: aiLoading, children: "Apply" })] }, index))), categorizationSuggestions.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No categorization suggestions available" }))] }), _jsxs(Button, { variant: "outline", className: "w-full", onClick: handleAnalyzeAllDocuments, disabled: aiLoading, children: [_jsx(Cpu, { className: "mr-2 h-4 w-4" }), aiLoading ? 'Analyzing...' : 'Analyze All Documents'] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-purple-600" }), "AI Insights & Recommendations"] }), _jsx(CardDescription, { children: "Intelligent insights about your document collection" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [aiInsights.map((insight, index) => (_jsx("div", { className: `p-3 rounded-lg border ${insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                                                                        insight.type === 'info' ? 'bg-blue-50 border-blue-200' :
                                                                            insight.type === 'success' ? 'bg-green-50 border-green-200' :
                                                                                'bg-gray-50 border-gray-200'}`, children: _jsxs("div", { className: "flex items-start gap-2", children: [insight.type === 'warning' && _jsx(AlertTriangle, { className: "h-4 w-4 text-amber-600 mt-0.5" }), insight.type === 'info' && _jsx(Zap, { className: "h-4 w-4 text-blue-600 mt-0.5" }), insight.type === 'success' && _jsx(CheckCircle, { className: "h-4 w-4 text-green-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: `font-medium text-sm ${insight.type === 'warning' ? 'text-amber-800' :
                                                                                            insight.type === 'info' ? 'text-blue-800' :
                                                                                                insight.type === 'success' ? 'text-green-800' :
                                                                                                    'text-gray-800'}`, children: insight.title }), _jsx("p", { className: `text-xs ${insight.type === 'warning' ? 'text-amber-700' :
                                                                                            insight.type === 'info' ? 'text-blue-700' :
                                                                                                insight.type === 'success' ? 'text-green-700' :
                                                                                                    'text-gray-700'}`, children: insight.message })] })] }) }, index))), aiInsights.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No AI insights available" }))] }), _jsxs(Button, { variant: "outline", className: "w-full", onClick: handleGenerateFullReport, disabled: aiLoading, children: [_jsx(Activity, { className: "mr-2 h-4 w-4" }), aiLoading ? 'Generating...' : 'Generate Full Report'] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5 text-indigo-600" }), "Automated Tagging & Metadata Extraction"] }), _jsx(CardDescription, { children: "AI automatically extracts metadata and suggests tags for better organization" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Recent AI Extractions" }), _jsxs("div", { className: "space-y-2", children: [aiExtractions.map((extraction, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: extraction.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [extraction.status === 'completed' ? 'Extracted:' : 'Extracting:', " ", extraction.extractedFields.join(', ')] })] })] }), _jsx(Badge, { variant: extraction.status === 'completed' ? 'secondary' : 'outline', className: extraction.status === 'processing' ? 'text-blue-600' : '', children: extraction.status === 'completed' ? 'Completed' : 'Processing' })] }, index))), aiExtractions.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No recent extractions available" }))] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Auto-Generated Tags" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [aiTags.map((tag, index) => (_jsxs(Badge, { variant: "secondary", className: "text-sm", children: [tag.name, " (", tag.count, ")"] }, index))), aiTags.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground", children: "No tags available" }))] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: handleExtractAllMetadata, disabled: aiLoading, children: [_jsx(Target, { className: "mr-2 h-4 w-4" }), aiLoading ? 'Extracting...' : 'Extract All Metadata'] }), _jsxs(Button, { variant: "outline", onClick: handleManageTags, children: [_jsx(Activity, { className: "mr-2 h-4 w-4" }), "Manage Tags"] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Cpu, { className: "h-5 w-5 text-teal-600" }), "AI Document Summarization"] }), _jsx(CardDescription, { children: "Generate intelligent summaries and key insights from your documents" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => handleGenerateSummary('individual'), disabled: aiLoading, children: [_jsx(FileText, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Individual Summaries" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => handleGenerateSummary('collection'), disabled: aiLoading, children: [_jsx(Activity, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Collection Overview" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => handleGenerateSummary('trend'), disabled: aiLoading, children: [_jsx(TrendingUp, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Trend Analysis" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Recent AI Summaries" }), _jsxs("div", { className: "space-y-3", children: [aiSummaries.map((summary, index) => (_jsxs("div", { className: "p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h5", { className: "font-medium text-sm", children: summary.title }), _jsx(Badge, { variant: "outline", className: "text-xs", children: new Date(summary.createdAt).toLocaleTimeString() })] }), _jsx("p", { className: "text-xs text-muted-foreground mb-2", children: summary.content }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleViewSummaryDetails(summary), children: "View Details" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleExportSummary(summary), children: "Export" })] })] }, index))), aiSummaries.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No AI summaries available" }))] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => handleGenerateSummary('general'), disabled: aiLoading, children: [_jsx(Cpu, { className: "mr-2 h-4 w-4" }), aiLoading ? 'Generating...' : 'Generate New Summary'] }), _jsxs(Button, { variant: "outline", onClick: loadAIData, children: [_jsx(Activity, { className: "mr-2 h-4 w-4" }), "Refresh Data"] })] })] }) })] })] }), _jsxs(TabsContent, { value: "workflows", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Workflows" }), _jsx(Activity, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: workflowLoading ? '...' : workflowStats.activeWorkflows }), _jsx("p", { className: "text-xs text-muted-foreground", children: workflowLoading ? 'Loading...' : 'Active workflows' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Approvals" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: workflowLoading ? '...' : workflowStats.pendingApprovals }), _jsx("p", { className: "text-xs text-muted-foreground", children: workflowLoading ? 'Loading...' : 'Awaiting review' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Completed Today" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: workflowLoading ? '...' : workflowStats.completedToday }), _jsx("p", { className: "text-xs text-muted-foreground", children: workflowLoading ? 'Loading...' : 'Processed today' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Avg. Processing Time" }), _jsx(Target, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: workflowLoading ? '...' : `${workflowStats.averageProcessingTime.toFixed(1)}h` }), _jsx("p", { className: "text-xs text-muted-foreground", children: workflowLoading ? 'Loading...' : 'Average time' })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5 text-blue-600" }), "Quick Actions"] }), _jsx(CardDescription, { children: "Common workflow operations and shortcuts" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setShowCreateWorkflowDialog(true), children: [_jsx(Activity, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Create Workflow" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setShowPendingApprovals(true), children: [_jsx(Clock, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Review Pending" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setShowWorkflowTemplates(true), children: [_jsx(FileText, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Templates" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setShowWorkflowAnalytics(true), children: [_jsx(TrendingUp, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Analytics" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: loadWorkflowData, disabled: workflowLoading, children: [_jsx(Activity, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: workflowLoading ? 'Refreshing...' : 'Refresh' })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5 text-green-600" }), "Active Workflows"] }), _jsx(CardDescription, { children: "Currently running document processing workflows" })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Activity, { className: "mr-2 h-4 w-4" }), "View All"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: workflowLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading workflows..." })] })) : workflows.length > 0 ? (workflows.map((workflow) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${workflow.status === 'active' ? 'bg-green-500' :
                                                                        workflow.status === 'paused' ? 'bg-yellow-500' :
                                                                            'bg-gray-400'}` }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: workflow.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: workflow.description })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: workflow.status === 'active' ? 'secondary' : 'outline', children: workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleViewWorkflow(workflow.id), children: _jsx(Eye, { className: "h-4 w-4" }) })] })] }, workflow.id)))) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No workflows found" }), _jsx(Button, { variant: "outline", className: "mt-4", onClick: () => setShowCreateWorkflowDialog(true), children: "Create First Workflow" })] })) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5 text-amber-600" }), "Pending Approvals"] }), _jsx(CardDescription, { children: "Documents awaiting your review and approval" })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Clock, { className: "mr-2 h-4 w-4" }), "View All"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: workflowLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading pending approvals..." })] })) : (() => {
                                                    const pendingWorkflows = workflows.filter(w => w.status === 'paused' || w.status === 'pending');
                                                    return pendingWorkflows.length > 0 ? (pendingWorkflows.map((workflow) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-amber-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: workflow.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: workflow.description }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Assigned ", new Date(workflow.createdAt).toLocaleDateString()] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleApproveDocument(workflow.id), children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "Approve"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleRejectDocument(workflow.id), children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-1" }), "Reject"] })] })] }, workflow.id)))) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Clock, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No pending approvals" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "All documents are up to date" })] }));
                                                })() }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5 text-purple-600" }), "Workflow Templates"] }), _jsx(CardDescription, { children: "Pre-built workflow templates for common document processes" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: workflowLoading ? (_jsxs("div", { className: "col-span-full text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading templates..." })] })) : workflowTemplates.length > 0 ? (workflowTemplates.map((template) => (_jsxs("div", { className: "p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(FileText, { className: "h-4 w-4 text-blue-600" }), _jsx("h4", { className: "font-medium", children: template.name })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-3", children: template.description }), _jsx(Button, { size: "sm", variant: "outline", className: "w-full", onClick: () => handleUseTemplate(template.name), children: "Use Template" })] }, template.id)))) : (_jsxs("div", { className: "col-span-full text-center py-8", children: [_jsx(FileText, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No templates available" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Workflow templates will appear here when available" })] })) }) })] })] }), _jsxs(TabsContent, { value: "security", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Security Score" }), _jsx(Shield, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${securityOverview?.securityScore && securityOverview.securityScore >= 90 ? 'text-green-600' : securityOverview?.securityScore && securityOverview.securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`, children: [securityOverview?.securityScore || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: securityOverview?.securityScore && securityOverview.securityScore >= 90 ? 'Excellent security posture' :
                                                                securityOverview?.securityScore && securityOverview.securityScore >= 70 ? 'Good security posture' : 'Needs improvement' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Sessions" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: securityOverview?.activeSessions || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Across all users" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Failed Logins" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: `text-2xl font-bold ${securityOverview?.failedLogins && securityOverview.failedLogins > 10 ? 'text-red-600' : securityOverview?.failedLogins && securityOverview.failedLogins > 5 ? 'text-yellow-600' : 'text-green-600'}`, children: securityOverview?.failedLogins || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Last 24 hours" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Compliance Status" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [securityOverview?.complianceStatus || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "SOC 2 Type II compliant" })] })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Security Health Check" }), _jsx(CardDescription, { children: "Current security status across all systems" })] }), _jsx(CardContent, { className: "space-y-4", children: securityLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading security data..." })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Two-Factor Authentication" }), _jsxs(Badge, { variant: "default", className: securityOverview?.mfaPercentage === 100 ? "bg-green-100 text-green-800" : securityOverview?.mfaPercentage && securityOverview.mfaPercentage > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), securityOverview?.mfaPercentage === 100 ? "Enabled" : securityOverview?.mfaPercentage && securityOverview.mfaPercentage > 0 ? "Partial" : "Disabled"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${securityOverview?.mfaPercentage || 0}%` } }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [securityOverview?.mfaEnabled || 0, " of ", securityOverview?.totalUsers || 0, " users have 2FA enabled (", securityOverview?.mfaPercentage || 0, "%)"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Data Encryption" }), _jsxs(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Active"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full w-full" }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "AES-256 encryption at rest and in transit" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Access Controls" }), _jsxs(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Enforced"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full w-full" }) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Role-based access control implemented" })] })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Security Events" }), _jsx(CardDescription, { children: "Latest security activities and alerts" })] }), _jsx(CardContent, { children: securityLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading security events..." })] })) : auditLogs.length > 0 ? (_jsx("div", { className: "space-y-3", children: auditLogs.slice(0, 5).map((log, index) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 border rounded-lg", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${log.severity === 'high' ? 'bg-red-500' :
                                                                        log.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}` }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: log.action }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [log.user, " \u2022 ", new Date(log.timestamp).toLocaleString()] })] })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No recent security events" })] })) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Active Sessions" }), _jsx(CardDescription, { children: "Current user sessions and device information" })] }), _jsx(CardContent, { children: securityLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading sessions..." })] })) : sessions.length > 0 ? (_jsx("div", { className: "space-y-3", children: sessions.slice(0, 5).map((session, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(Monitor, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: session.deviceName || 'Unknown Device' }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [session.browser || 'Unknown Browser', " \u2022 ", session.location || 'Unknown Location'] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Last active: ", new Date(session.lastActivity).toLocaleString()] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: session.isCurrent ? "default" : "secondary", children: session.isCurrent ? "Current" : "Active" }), !session.isCurrent && (_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Trash2, { className: "h-4 w-4" }) }))] })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Users, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No active sessions found" })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Security Actions" }), _jsx(CardDescription, { children: "Common security management tasks" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(Key, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Enable 2FA" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(Users, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Manage Users" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(Shield, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Security Settings" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: loadSecurityData, children: [_jsx(RefreshCw, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: securityLoading ? 'Refreshing...' : 'Refresh' })] })] }) })] })] }), _jsxs(TabsContent, { value: "compliance", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Overall Compliance" }), _jsx(Shield, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${compliance?.overallScore && compliance.overallScore >= 90 ? 'text-green-600' : compliance?.overallScore && compliance.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`, children: [compliance?.overallScore || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: compliance?.overallScore && compliance.overallScore >= 90 ? 'Fully Compliant' :
                                                                compliance?.overallScore && compliance.overallScore >= 70 ? 'Mostly Compliant' : 'Needs Attention' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "MFA Adoption" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${compliance?.standards?.[0]?.score && compliance.standards[0].score >= 90 ? 'text-green-600' : compliance?.standards?.[0]?.score && compliance.standards[0].score >= 50 ? 'text-yellow-600' : 'text-red-600'}`, children: [compliance?.standards?.[0]?.score || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: compliance?.standards?.[0]?.status === 'certified' ? 'Fully Certified' :
                                                                compliance?.standards?.[0]?.status === 'compliant' ? 'Compliant' : 'Non-Compliant' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Security Monitoring" }), _jsx(Activity, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${compliance?.standards?.[1]?.score && compliance.standards[1].score >= 90 ? 'text-green-600' : compliance?.standards?.[1]?.score && compliance.standards[1].score >= 70 ? 'text-yellow-600' : 'text-red-600'}`, children: [compliance?.standards?.[1]?.score || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: compliance?.standards?.[1]?.status === 'certified' ? 'Fully Monitored' :
                                                                compliance?.standards?.[1]?.status === 'compliant' ? 'Monitored' : 'Needs Setup' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Audit Readiness" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${compliance?.standards?.[2]?.score && compliance.standards[2].score >= 90 ? 'text-green-600' : compliance?.standards?.[2]?.score && compliance.standards[2].score >= 70 ? 'text-yellow-600' : 'text-red-600'}`, children: [compliance?.standards?.[2]?.score || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: compliance?.standards?.[2]?.status === 'certified' ? 'Audit Ready' :
                                                                compliance?.standards?.[2]?.status === 'compliant' ? 'Mostly Ready' : 'Needs Work' })] })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Compliance Standards" }), _jsx(CardDescription, { children: "Current compliance status across different standards" })] }), _jsx(CardContent, { className: "space-y-4", children: securityLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading compliance data..." })] })) : compliance?.standards ? (_jsx("div", { className: "space-y-3", children: compliance.standards.map((standard, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${standard.status === 'certified' ? 'bg-green-100' :
                                                                                standard.status === 'compliant' ? 'bg-blue-100' : 'bg-yellow-100'}`, children: standard.status === 'certified' ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })) : standard.status === 'compliant' ? (_jsx(Shield, { className: "h-4 w-4 text-blue-600" })) : (_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" })) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: standard.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: standard.description })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `text-lg font-bold ${standard.score >= 90 ? 'text-green-600' :
                                                                                standard.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`, children: [standard.score, "%"] }), _jsxs(Badge, { variant: "default", className: standard.status === 'certified' ? 'bg-green-100 text-green-800' :
                                                                                standard.status === 'compliant' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800', children: [standard.status === 'certified' ? (_jsx(CheckCircle, { className: "mr-1 h-3 w-3" })) : standard.status === 'compliant' ? (_jsx(Shield, { className: "mr-1 h-3 w-3" })) : (_jsx(AlertTriangle, { className: "mr-1 h-3 w-3" })), standard.status === 'certified' ? 'Certified' :
                                                                                    standard.status === 'compliant' ? 'Compliant' : 'Non-Compliant'] })] })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Shield, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No compliance standards found" })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Required Actions" }), _jsx(CardDescription, { children: "Compliance tasks and recommendations" })] }), _jsx(CardContent, { children: securityLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading compliance actions..." })] })) : complianceActions.length > 0 ? (_jsx("div", { className: "space-y-3", children: complianceActions.map((action, index) => (_jsxs("div", { className: `flex items-center space-x-3 p-3 border rounded-lg ${action.priority === 'high' ? 'bg-red-50' :
                                                                action.priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${action.priority === 'high' ? 'bg-red-500' :
                                                                        action.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}` }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: action.title }), _jsx("p", { className: "text-xs text-muted-foreground", children: action.description }), _jsx("p", { className: "text-xs text-muted-foreground", children: action.status === 'completed' ? `Completed: ${new Date(action.dueDate).toLocaleDateString()}` :
                                                                                action.status === 'pending' ? `Due: ${new Date(action.dueDate).toLocaleDateString()}` :
                                                                                    `Status: ${action.status}` })] }), _jsx("div", { className: "flex items-center space-x-2", children: action.status === 'completed' ? (_jsxs(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Done"] })) : action.priority === 'high' ? (_jsx(Button, { size: "sm", variant: "destructive", children: "Urgent" })) : (_jsx(Button, { size: "sm", variant: "outline", children: action.priority === 'medium' ? 'Review' : 'Schedule' })) })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-500 mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No pending compliance actions" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "All compliance requirements are up to date" })] })) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Compliance Reports" }), _jsx(CardDescription, { children: "Generate and download compliance reports based on current data" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [_jsxs("div", { className: "p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(FileText, { className: "h-4 w-4 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Compliance Overview" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Overall compliance status: ", compliance?.overallScore || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-muted-foreground", children: ["Generated: ", new Date().toLocaleDateString()] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "Download"] })] })] }), _jsxs("div", { className: "p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx("div", { className: "w-8 h-8 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Security Standards" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [compliance?.standards?.length || 0, " standards tracked"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-muted-foreground", children: ["Generated: ", new Date().toLocaleDateString()] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "Download"] })] })] }), _jsxs("div", { className: "p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx("div", { className: "w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center", children: _jsx(Activity, { className: "h-4 w-4 text-yellow-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Action Items" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [complianceActions.length, " pending actions"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-muted-foreground", children: ["Generated: ", new Date().toLocaleDateString()] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "Download"] })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Compliance Actions" }), _jsx(CardDescription, { children: "Common compliance management tasks" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(FileText, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Generate Report" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(Activity, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Run Assessment" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(Shield, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Update Policies" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: loadSecurityData, children: [_jsx(RefreshCw, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: securityLoading ? 'Refreshing...' : 'Refresh' })] })] }) })] })] }), _jsxs(TabsContent, { value: "analytics", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Documents" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalDocuments }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+12% from last month" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Storage Used" }), _jsx(Database, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.storageUsed }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [Math.round(parseFloat(stats.storageUsed) * 0.8), " GB available"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "AI Processed" }), _jsx(Cpu, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: aiStats.analyzedDocuments }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [aiStats.analyzedPercentage, "% of total documents"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Workflows" }), _jsx(Activity, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: workflowStats.activeWorkflows }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [workflowStats.pendingApprovals, " pending approvals"] })] })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Document Upload Trends" }), _jsx(CardDescription, { children: "Document uploads over the last 30 days" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-[300px] flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(TrendingUp, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Upload trends chart" }), _jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [documents.length, " documents uploaded this month"] })] }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Document Categories" }), _jsx(CardDescription, { children: "Distribution of documents by category" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-500" }), _jsx("span", { className: "text-sm", children: "Invoices" })] }), _jsx("span", { className: "text-sm font-medium", children: "35%" })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full", style: { width: '35%' } }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" }), _jsx("span", { className: "text-sm", children: "Receipts" })] }), _jsx("span", { className: "text-sm font-medium", children: "28%" })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full", style: { width: '28%' } }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("span", { className: "text-sm", children: "Contracts" })] }), _jsx("span", { className: "text-sm font-medium", children: "20%" })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-yellow-500 h-2 rounded-full", style: { width: '20%' } }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-purple-500" }), _jsx("span", { className: "text-sm", children: "Other" })] }), _jsx("span", { className: "text-sm font-medium", children: "17%" })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-purple-500 h-2 rounded-full", style: { width: '17%' } }) })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Performance Metrics" }), _jsx(CardDescription, { children: "AI processing efficiency and accuracy" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [aiStats.qualityScore, "%"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Average Quality Score" }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mt-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${aiStats.qualityScore}%` } }) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: aiStats.smartTagsCount }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Smart Tags Generated" }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mt-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full transition-all duration-300", style: { width: `${Math.min(100, (aiStats.smartTagsCount / 50) * 100)}%` } }) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: aiStats.activeInsights }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Active Insights" }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mt-2", children: _jsx("div", { className: "bg-purple-600 h-2 rounded-full transition-all duration-300", style: { width: `${Math.min(100, (aiStats.activeInsights / 20) * 100)}%` } }) })] })] }) })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Document Activity" }), _jsx(CardDescription, { children: "Latest document uploads and modifications" })] }), _jsx(CardContent, { children: documents.length > 0 ? (_jsx("div", { className: "space-y-3", children: documents.slice(0, 5).map((doc) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 border rounded-lg", children: [_jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(FileText, { className: "h-4 w-4 text-blue-600" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: doc.displayName }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Uploaded ", new Date(doc.uploadedAt).toLocaleDateString()] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: formatFileSize(doc.sizeBytes) }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE' })] })] }, doc.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "No recent activity" })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Workflow Performance" }), _jsx(CardDescription, { children: "Workflow completion rates and processing times" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Completion Rate" }), _jsxs("span", { className: "text-sm font-bold text-green-600", children: [workflowStats.completedToday > 0 ?
                                                                                Math.round((workflowStats.completedToday / workflowStats.activeWorkflows) * 100) : 0, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full transition-all duration-300", style: {
                                                                        width: `${workflowStats.completedToday > 0 ?
                                                                            Math.round((workflowStats.completedToday / workflowStats.activeWorkflows) * 100) : 0}%`
                                                                    } }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Avg. Processing Time" }), _jsxs("span", { className: "text-sm font-bold text-blue-600", children: [workflowStats.averageProcessingTime, "h"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: {
                                                                        width: `${Math.min(100, (workflowStats.averageProcessingTime / 24) * 100)}%`
                                                                    } }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Pending Approvals" }), _jsx("span", { className: "text-sm font-bold text-yellow-600", children: workflowStats.pendingApprovals })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-yellow-600 h-2 rounded-full transition-all duration-300", style: {
                                                                        width: `${Math.min(100, (workflowStats.pendingApprovals / 10) * 100)}%`
                                                                    } }) })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Analytics Actions" }), _jsx(CardDescription, { children: "Generate reports and export analytics data" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(FileText, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Export Report" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(TrendingUp, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "View Trends" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", children: [_jsx(Activity, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Performance" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: loadDocumentData, children: [_jsx(RefreshCw, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: loading ? 'Refreshing...' : 'Refresh' })] })] }) })] })] }), _jsxs(TabsContent, { value: "settings", className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "General Settings" }), _jsx(CardDescription, { children: "Basic document management preferences" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "auto-categorization", children: "Auto-categorization" }), _jsxs(Select, { defaultValue: "enabled", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select option" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "enabled", children: "Enabled" }), _jsx(SelectItem, { value: "disabled", children: "Disabled" }), _jsx(SelectItem, { value: "manual", children: "Manual Only" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically categorize documents using AI" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "file-size-limit", children: "File Size Limit (MB)" }), _jsx(Input, { id: "file-size-limit", type: "number", defaultValue: "100", placeholder: "100" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Maximum file size for uploads" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "retention-period", children: "Retention Period (days)" }), _jsx(Input, { id: "retention-period", type: "number", defaultValue: "365", placeholder: "365" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "How long to keep documents before archiving" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "auto-delete", children: "Auto-delete Drafts" }), _jsxs(Select, { defaultValue: "30", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select option" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7", children: "After 7 days" }), _jsx(SelectItem, { value: "30", children: "After 30 days" }), _jsx(SelectItem, { value: "90", children: "After 90 days" }), _jsx(SelectItem, { value: "never", children: "Never" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically delete draft documents" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "notifications", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "notifications", className: "text-sm", children: "Enable email notifications for document processing" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "watermark", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "watermark", className: "text-sm", children: "Add watermarks to downloaded documents" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Processing Settings" }), _jsx(CardDescription, { children: "Configure AI-powered document analysis and processing" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "ai-model", children: "AI Model" }), _jsxs(Select, { defaultValue: "gemma2:2b", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select AI model" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "gemma2:2b", children: "Gemma 2B (Fast)" }), _jsx(SelectItem, { value: "gemma2:9b", children: "Gemma 9B (Accurate)" }), _jsx(SelectItem, { value: "llama3:8b", children: "Llama 3 8B (Balanced)" }), _jsx(SelectItem, { value: "llama3:70b", children: "Llama 3 70B (Most Accurate)" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Choose the AI model for document processing" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "processing-timeout", children: "Processing Timeout (seconds)" }), _jsx(Input, { id: "processing-timeout", type: "number", defaultValue: "30", placeholder: "30" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Maximum time for AI processing" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confidence-threshold", children: "Confidence Threshold (%)" }), _jsx(Input, { id: "confidence-threshold", type: "number", defaultValue: "80", placeholder: "80", min: "0", max: "100" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Minimum confidence for AI predictions" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "batch-size", children: "Batch Processing Size" }), _jsx(Input, { id: "batch-size", type: "number", defaultValue: "5", placeholder: "5" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Number of documents to process in parallel" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-sm font-medium", children: "AI Features" }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "auto-tagging", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "auto-tagging", className: "text-sm", children: "Automatic Tagging" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "quality-analysis", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "quality-analysis", className: "text-sm", children: "Quality Analysis" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "metadata-extraction", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "metadata-extraction", className: "text-sm", children: "Metadata Extraction" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "content-summarization", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "content-summarization", className: "text-sm", children: "Content Summarization" })] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Workflow Settings" }), _jsx(CardDescription, { children: "Configure document workflow automation and approval processes" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "default-workflow", children: "Default Workflow" }), _jsxs(Select, { defaultValue: "invoice-processing", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select default workflow" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "invoice-processing", children: "Invoice Processing" }), _jsx(SelectItem, { value: "contract-review", children: "Contract Review" }), _jsx(SelectItem, { value: "document-classification", children: "Document Classification" }), _jsx(SelectItem, { value: "expense-approval", children: "Expense Approval" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Default workflow for new documents" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "approval-timeout", children: "Approval Timeout (hours)" }), _jsx(Input, { id: "approval-timeout", type: "number", defaultValue: "72", placeholder: "72" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Time before approval requests expire" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "escalation-levels", children: "Escalation Levels" }), _jsx(Input, { id: "escalation-levels", type: "number", defaultValue: "3", placeholder: "3", min: "1", max: "5" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Number of escalation levels for approvals" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parallel-approvals", children: "Parallel Approvals" }), _jsxs(Select, { defaultValue: "enabled", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select option" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "enabled", children: "Enabled" }), _jsx(SelectItem, { value: "disabled", children: "Disabled" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Allow multiple approvers to work in parallel" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-sm font-medium", children: "Workflow Notifications" }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "workflow-email", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "workflow-email", className: "text-sm", children: "Email Notifications" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "workflow-sms", className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "workflow-sms", className: "text-sm", children: "SMS Notifications" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "workflow-slack", className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "workflow-slack", className: "text-sm", children: "Slack Notifications" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "workflow-reminders", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "workflow-reminders", className: "text-sm", children: "Automatic Reminders" })] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Security Settings" }), _jsx(CardDescription, { children: "Configure document security and access controls" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "encryption-level", children: "Encryption Level" }), _jsxs(Select, { defaultValue: "aes-256", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select encryption level" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "aes-128", children: "AES-128" }), _jsx(SelectItem, { value: "aes-256", children: "AES-256" }), _jsx(SelectItem, { value: "aes-512", children: "AES-512" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Document encryption strength" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "session-timeout", children: "Session Timeout (minutes)" }), _jsx(Input, { id: "session-timeout", type: "number", defaultValue: "60", placeholder: "60" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "User session timeout duration" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password-policy", children: "Password Policy" }), _jsxs(Select, { defaultValue: "strong", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select password policy" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "basic", children: "Basic (8+ characters)" }), _jsx(SelectItem, { value: "medium", children: "Medium (12+ characters, mixed case)" }), _jsx(SelectItem, { value: "strong", children: "Strong (16+ characters, special chars)" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Password complexity requirements" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mfa-required", children: "MFA Requirement" }), _jsxs(Select, { defaultValue: "optional", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select MFA requirement" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "disabled", children: "Disabled" }), _jsx(SelectItem, { value: "optional", children: "Optional" }), _jsx(SelectItem, { value: "required", children: "Required for All" }), _jsx(SelectItem, { value: "admin-only", children: "Required for Admins" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Multi-factor authentication requirements" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-sm font-medium", children: "Access Controls" }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "ip-whitelist", className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "ip-whitelist", className: "text-sm", children: "IP Whitelist" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "audit-logging", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "audit-logging", className: "text-sm", children: "Audit Logging" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "document-watermarking", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "document-watermarking", className: "text-sm", children: "Document Watermarking" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "download-tracking", defaultChecked: true, className: "rounded border-gray-300" }), _jsx(Label, { htmlFor: "download-tracking", className: "text-sm", children: "Download Tracking" })] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Save Settings" }), _jsx(CardDescription, { children: "Apply your configuration changes" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Changes will be applied immediately and affect all users" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", children: "Reset to Defaults" }), _jsx(Button, { children: "Save Settings" })] })] }) })] })] })] }), _jsx(Dialog, { open: showPreviewModal, onOpenChange: (open) => {
                        if (!open)
                            closePreviewModal();
                    }, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] w-full flex flex-col overflow-hidden", children: [_jsxs(DialogHeader, { className: "flex-shrink-0", children: [_jsx(DialogTitle, { children: "Document Preview" }), _jsx(DialogDescription, { children: previewDocument?.displayName })] }), previewDocument && (_jsxs("div", { className: "flex-1 min-h-0 flex flex-col space-y-4", children: [_jsxs("div", { className: "flex-shrink-0 flex items-center space-x-4 text-sm text-muted-foreground", children: [_jsxs("span", { children: ["Type: ", previewDocument.mimeType] }), _jsxs("span", { children: ["Size: ", formatFileSize(previewDocument.sizeBytes)] }), _jsxs("span", { children: ["Uploaded: ", new Date(previewDocument.uploadedAt).toLocaleDateString()] })] }), _jsx("div", { className: "flex-1 min-h-0 border rounded-lg overflow-hidden", children: previewDocument.mimeType.startsWith('image/') ? (_jsxs("div", { className: "relative bg-gray-50 h-full flex items-center justify-center overflow-auto", children: [imageLoading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading image..." })] }) })), !imageError && imageBlobUrl ? (_jsx("img", { src: imageBlobUrl, alt: previewDocument.displayName, className: "max-w-full max-h-full object-contain rounded-lg shadow-sm", style: {
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        width: 'auto',
                                                        height: 'auto',
                                                        display: 'block'
                                                    } })) : (_jsxs("div", { className: "text-center p-8", children: [_jsx(FileText, { className: "h-16 w-16 mx-auto text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Image preview failed to load" }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { onClick: () => handleDownload(previewDocument), children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download to View"] }), _jsx(Button, { variant: "outline", onClick: () => {
                                                                        if (previewDocument) {
                                                                            loadImageAsBlob(previewDocument);
                                                                        }
                                                                    }, children: "Retry Preview" })] })] }))] })) : previewDocument.mimeType.includes('pdf') ? (_jsx("iframe", { src: `${config.api.baseUrl}/api/documents/stream/${previewDocument.id}?token=${localStorage.getItem('auth_token')}&tenantId=${localStorage.getItem('tenant_id')}&companyId=${localStorage.getItem('company_id')}#toolbar=0`, className: "w-full h-full border-0", title: previewDocument.displayName })) : previewDocument.mimeType.startsWith('text/') ? (_jsx("div", { className: "w-full h-full overflow-auto", children: textLoading ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading text content..." })] }) })) : textError ? (_jsx("div", { className: "flex items-center justify-center h-full p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(FileText, { className: "h-16 w-16 mx-auto text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Failed to load text content" }), _jsx(Button, { variant: "outline", onClick: () => {
                                                                if (previewDocument) {
                                                                    loadTextContent(previewDocument);
                                                                }
                                                            }, children: "Retry" })] }) })) : textContent ? (_jsx("pre", { className: "p-4 text-sm whitespace-pre-wrap font-mono bg-gray-50", children: textContent })) : null })) : (_jsxs("div", { className: "p-8 text-center h-full flex flex-col items-center justify-center", children: [_jsx(FileText, { className: "h-16 w-16 mx-auto text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Preview not available for this file type" }), _jsxs(Button, { onClick: () => handleDownload(previewDocument), children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download to View"] })] })) }), _jsxs("div", { className: "flex-shrink-0 flex justify-end space-x-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setShowPreviewModal(false), children: "Close" }), _jsxs(Button, { onClick: () => handleDownload(previewDocument), children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download"] })] })] }))] }) }), _jsx(Dialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Delete Document" }), _jsxs(DialogDescription, { children: ["Are you sure you want to delete \"", documentToDelete?.displayName, "\"? This action cannot be undone."] })] }), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setShowDeleteDialog(false), children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: confirmDelete, children: "Delete" })] })] }) }), _jsx(Dialog, { open: showCreateWorkflowDialog, onOpenChange: setShowCreateWorkflowDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create New Workflow" }), _jsx(DialogDescription, { children: "Set up a new document processing workflow with custom steps and automation rules." })] }), _jsx(CreateWorkflowForm, { onSubmit: handleCreateWorkflow, onCancel: () => setShowCreateWorkflowDialog(false), templates: workflowTemplates })] }) })] }) }));
}
