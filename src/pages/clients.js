import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useState, useEffect } from "react";
import { apiService } from "../lib/api";
import { toast } from "sonner";
import { Users, MessageSquare, FileText, Phone, Mail, Calendar, CheckCircle, Clock, AlertTriangle, Share, Download, Eye, Bell, } from "lucide-react";
export default function ClientsPage() {
    const [stats, setStats] = useState({
        activeClients: 0,
        unreadMessages: 0,
        pendingApprovals: 0,
        portalLogins: 0
    });
    const [companies, setCompanies] = useState([]);
    const [messages, setMessages] = useState([]);
    const [clientAccess, setClientAccess] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [clientForm, setClientForm] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        contactPerson: '',
        industry: '',
        website: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        currency: 'USD',
        paymentTerms: '',
        creditLimit: '',
        taxId: '',
        notes: '',
        source: ''
    });
    // Message composition state
    const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
    const [messageForm, setMessageForm] = useState({
        recipientId: '',
        subject: '',
        messageText: '',
        priority: 'normal'
    });
    // Document sharing state
    const [isShareDocumentDialogOpen, setIsShareDocumentDialogOpen] = useState(false);
    const [shareDocumentForm, setShareDocumentForm] = useState({
        clientId: '',
        documentId: '',
        message: '',
        expiresAt: ''
    });
    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [sharedDocuments, setSharedDocuments] = useState([]);
    const [loadingSharedDocuments, setLoadingSharedDocuments] = useState(false);
    // Client details state
    const [viewingClient, setViewingClient] = useState(null);
    useEffect(() => {
        loadClientData();
    }, []);
    const loadClientData = async () => {
        try {
            setLoading(true);
            // Load clients from the new clients API
            const clientsResponse = await apiService.get('/api/clients');
            // Handle different response structures
            let clientsData = [];
            if (Array.isArray(clientsResponse)) {
                // Direct array response
                clientsData = clientsResponse;
            }
            else if (clientsResponse.clients && Array.isArray(clientsResponse.clients)) {
                // Wrapped in clients property (our new API format)
                clientsData = clientsResponse.clients;
            }
            else if (clientsResponse.data && Array.isArray(clientsResponse.data)) {
                // Wrapped in data property
                clientsData = clientsResponse.data;
            }
            setCompanies(clientsData);
            // Load messages
            const messagesResponse = await apiService.get('/api/messages');
            setMessages(messagesResponse || []);
            // Calculate statistics from real data
            const totalClients = clientsData.length;
            // Update stats with real data
            setStats({
                activeClients: totalClients, // All clients are considered active for now
                unreadMessages: 0, // Will be updated later
                pendingApprovals: 0, // Will be updated later  
                portalLogins: 0 // Will be updated later
            });
            // Load client access
            const accessResponse = await apiService.get('/api/client-access');
            setClientAccess(accessResponse || []);
            // Load shared documents
            await loadSharedDocuments();
            // Load unread message count
            const unreadResponse = await apiService.get('/api/messages/unread-count');
            // Update stats with additional data (merge with existing stats)
            setStats(prevStats => ({
                ...prevStats,
                unreadMessages: unreadResponse.unreadCount || 0,
                pendingApprovals: 0, // TODO: Implement pending approvals API
                portalLogins: accessResponse?.length || 0 // Use actual portal access count
            }));
        }
        catch (error) {
            console.error('Error loading client data:', error);
            toast.error('Failed to load client data');
        }
        finally {
            setLoading(false);
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if (diffInHours < 1)
            return 'Just now';
        if (diffInHours < 24)
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInHours < 48)
            return '1 day ago';
        return `${Math.floor(diffInHours / 24)} days ago`;
    };
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    const resetClientForm = () => {
        setClientForm({
            name: '',
            email: '',
            phone: '',
            businessName: '',
            contactPerson: '',
            industry: '',
            website: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
            currency: 'USD',
            paymentTerms: '',
            creditLimit: '',
            taxId: '',
            notes: '',
            source: ''
        });
    };
    const handleCreateClient = async () => {
        try {
            if (!clientForm.name?.trim()) {
                toast.error('Please enter a client name');
                return;
            }
            if (!clientForm.email?.trim()) {
                toast.error('Please enter a client email');
                return;
            }
            const clientData = {
                name: clientForm.name.trim(),
                email: clientForm.email.trim(),
                phone: clientForm.phone?.trim() || undefined,
                businessName: clientForm.businessName?.trim() || undefined,
                contactPerson: clientForm.contactPerson?.trim() || undefined,
                industry: clientForm.industry?.trim() || undefined,
                website: clientForm.website?.trim() || undefined,
                address: clientForm.address?.trim() || undefined,
                city: clientForm.city?.trim() || undefined,
                state: clientForm.state?.trim() || undefined,
                postalCode: clientForm.postalCode?.trim() || undefined,
                country: clientForm.country,
                currency: clientForm.currency,
                paymentTerms: clientForm.paymentTerms?.trim() || undefined,
                creditLimit: clientForm.creditLimit || undefined,
                taxNumber: clientForm.taxId?.trim() || undefined,
                notes: clientForm.notes?.trim() || undefined,
                source: clientForm.source?.trim() || undefined
            };
            const response = await apiService.post('/api/clients', clientData);
            toast.success('Client created successfully!');
            setIsCreateDialogOpen(false);
            resetClientForm();
            // Add a small delay before refreshing to ensure DB consistency
            setTimeout(async () => {
                await loadClientData();
            }, 500);
        }
        catch (error) {
            console.error('Error creating client:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            }
            else {
                toast.error('Failed to create client');
            }
        }
    };
    // Message composition helper functions
    const resetMessageForm = () => {
        setMessageForm({
            recipientId: '',
            subject: '',
            messageText: '',
            priority: 'normal'
        });
    };
    const openComposeDialog = (recipientId) => {
        resetMessageForm();
        if (recipientId) {
            setMessageForm(prev => ({ ...prev, recipientId }));
        }
        setIsComposeDialogOpen(true);
    };
    // Document sharing helper functions
    const openShareDocumentDialog = (clientId) => {
        setShareDocumentForm({
            clientId: clientId || '',
            documentId: '',
            message: '',
            expiresAt: ''
        });
        setIsShareDocumentDialogOpen(true);
        // Load documents when dialog opens
        loadDocuments();
    };
    const loadDocuments = async () => {
        try {
            setLoadingDocuments(true);
            const response = await apiService.get('/api/documents');
            setDocuments(response.documents || response.data || response || []);
        }
        catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents');
        }
        finally {
            setLoadingDocuments(false);
        }
    };
    const loadSharedDocuments = async () => {
        try {
            setLoadingSharedDocuments(true);
            const allSharedDocs = [];
            // Load shared documents for each client
            for (const client of companies) {
                try {
                    const response = await apiService.get(`/api/clients/${client.id}/documents`);
                    const clientDocs = response.documents || response.data || response || [];
                    // Add client info to each document
                    const docsWithClient = clientDocs.map((doc) => ({
                        ...doc,
                        clientInfo: {
                            id: client.id,
                            name: client.name,
                            email: client.email
                        }
                    }));
                    allSharedDocs.push(...docsWithClient);
                }
                catch (error) {
                    console.error(`Error loading documents for client ${client.name}:`, error);
                }
            }
            setSharedDocuments(allSharedDocs);
        }
        catch (error) {
            console.error('Error loading shared documents:', error);
            toast.error('Failed to load shared documents');
        }
        finally {
            setLoadingSharedDocuments(false);
        }
    };
    const handleShareDocument = async () => {
        try {
            if (!shareDocumentForm.clientId) {
                toast.error('Please select a client');
                return;
            }
            if (!shareDocumentForm.documentId) {
                toast.error('Please select a document');
                return;
            }
            const shareData = {
                documentId: shareDocumentForm.documentId,
                message: shareDocumentForm.message.trim() || undefined,
                expiresAt: shareDocumentForm.expiresAt || undefined
            };
            await apiService.post(`/api/clients/${shareDocumentForm.clientId}/share-document`, shareData);
            toast.success('Document shared successfully!');
            setIsShareDocumentDialogOpen(false);
            setShareDocumentForm({
                clientId: '',
                documentId: '',
                message: '',
                expiresAt: ''
            });
            // Refresh shared documents list
            await loadSharedDocuments();
        }
        catch (error) {
            console.error('Error sharing document:', error);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            }
            else {
                toast.error('Failed to share document');
            }
        }
    };
    const handleSendMessage = async () => {
        try {
            if (!messageForm.recipientId) {
                toast.error('Please select a recipient');
                return;
            }
            if (!messageForm.subject.trim()) {
                toast.error('Please enter a subject');
                return;
            }
            if (!messageForm.messageText.trim()) {
                toast.error('Please enter a message');
                return;
            }
            // Get sender from localStorage (current authenticated user)
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                toast.error('Please log in to send messages');
                return;
            }
            // Get receiver ID - for now use the current user as receiver
            // (In a real app, you'd get the actual user ID associated with the company)
            let receiverId = localStorage.getItem('user_id');
            if (!receiverId) {
                // Try to get from JWT token payload
                try {
                    const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
                    receiverId = tokenPayload.sub;
                }
                catch (e) {
                    // fallback
                }
            }
            // Find the selected client to get the company ID
            const selectedClient = companies.find(c => c.id === messageForm.recipientId);
            if (!selectedClient) {
                toast.error('Selected client not found');
                return;
            }
            const messageData = {
                companyId: selectedClient.companyId || 'default', // Use the client's company ID
                receiverId: selectedClient.assignedTo || receiverId, // Send to assigned user or fallback to current user
                messageText: `Subject: ${messageForm.subject.trim()}\n\nPriority: ${messageForm.priority.toUpperCase()}\n\n${messageForm.messageText.trim()}`
            };
            await apiService.post('/api/messages', messageData);
            toast.success('Message sent successfully!');
            setIsComposeDialogOpen(false);
            resetMessageForm();
            // Refresh messages after sending
            setTimeout(async () => {
                await loadClientData();
            }, 500);
        }
        catch (error) {
            console.error('Error sending message:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            }
            else {
                toast.error('Failed to send message');
            }
        }
    };
    // Client details helper function
    const openClientDetails = (client) => {
        setViewingClient(client);
    };
    const countries = [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'AU', name: 'Australia' },
        { code: 'JP', name: 'Japan' },
        { code: 'RW', name: 'Rwanda' },
        { code: 'KE', name: 'Kenya' },
        { code: 'UG', name: 'Uganda' },
        { code: 'TZ', name: 'Tanzania' },
        { code: 'ZA', name: 'South Africa' }
    ];
    const currencies = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'CAD', name: 'Canadian Dollar' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'FRW', name: 'Rwandan Franc' },
        { code: 'KES', name: 'Kenyan Shilling' },
        { code: 'UGX', name: 'Ugandan Shilling' },
        { code: 'TZS', name: 'Tanzanian Shilling' },
        { code: 'ZAR', name: 'South African Rand' }
    ];
    return (_jsxs("div", { className: "flex-1 space-y-6 p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Client Portal & Communication " }), _jsx("p", { className: "text-muted-foreground", children: "Manage client relationships and secure communications" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", onClick: loadClientData, children: [_jsx(MessageSquare, { className: "mr-2 h-4 w-4" }), "Refresh Data"] }), _jsxs(Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => {
                                                resetClientForm();
                                                setIsCreateDialogOpen(true);
                                            }, children: [_jsx(Users, { className: "mr-2 h-4 w-4" }), "Add Client"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add New Client" }), _jsx(DialogDescription, { children: "Create a new client company to manage their financial data and communications." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "client-name", children: "Company Name *" }), _jsx(Input, { id: "client-name", placeholder: "Enter company name", value: clientForm.name, onChange: (e) => setClientForm(prev => ({ ...prev, name: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "client-email", children: "Email *" }), _jsx(Input, { id: "client-email", type: "email", placeholder: "Enter email address", value: clientForm.email, onChange: (e) => setClientForm(prev => ({ ...prev, email: e.target.value })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "client-phone", children: "Phone" }), _jsx(Input, { id: "client-phone", placeholder: "Enter phone number", value: clientForm.phone, onChange: (e) => setClientForm(prev => ({ ...prev, phone: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "client-business-name", children: "Business Name" }), _jsx(Input, { id: "client-business-name", placeholder: "Legal business name", value: clientForm.businessName, onChange: (e) => setClientForm(prev => ({ ...prev, businessName: e.target.value })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "client-contact-person", children: "Contact Person" }), _jsx(Input, { id: "client-contact-person", placeholder: "Primary contact name", value: clientForm.contactPerson, onChange: (e) => setClientForm(prev => ({ ...prev, contactPerson: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "client-industry", children: "Industry" }), _jsx(Input, { id: "client-industry", placeholder: "e.g., Technology, Manufacturing", value: clientForm.industry, onChange: (e) => setClientForm(prev => ({ ...prev, industry: e.target.value })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "client-country", children: "Country" }), _jsxs(Select, { value: clientForm.country, onValueChange: (value) => setClientForm(prev => ({ ...prev, country: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select country" }) }), _jsx(SelectContent, { children: countries.map((country) => (_jsx(SelectItem, { value: country.code, children: country.name }, country.code))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "client-currency", children: "Currency" }), _jsxs(Select, { value: clientForm.currency, onValueChange: (value) => setClientForm(prev => ({ ...prev, currency: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select currency" }) }), _jsx(SelectContent, { children: currencies.map((currency) => (_jsxs(SelectItem, { value: currency.code, children: [currency.code, " - ", currency.name] }, currency.code))) })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "client-tax-id", children: "Tax ID" }), _jsx(Input, { id: "client-tax-id", placeholder: "Enter tax identification number", value: clientForm.taxId, onChange: (e) => setClientForm(prev => ({ ...prev, taxId: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "client-fiscal-year", children: "Fiscal Year Start" }), _jsxs(Select, { value: clientForm.fiscalYearStart, onValueChange: (value) => setClientForm(prev => ({ ...prev, fiscalYearStart: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select fiscal year start" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "01-01", children: "January 1st" }), _jsx(SelectItem, { value: "04-01", children: "April 1st" }), _jsx(SelectItem, { value: "07-01", children: "July 1st" }), _jsx(SelectItem, { value: "10-01", children: "October 1st" })] })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                                    setIsCreateDialogOpen(false);
                                                                    resetClientForm();
                                                                }, children: "Cancel" }), _jsx(Button, { onClick: handleCreateClient, disabled: !clientForm.name.trim(), children: "Create Client" })] })] })] })] })] })] }), _jsxs(Tabs, { defaultValue: "overview", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "clients", children: "Clients" }), _jsx(TabsTrigger, { value: "communications", children: "Communications" }), _jsx(TabsTrigger, { value: "documents", children: "Shared Documents" }), _jsx(TabsTrigger, { value: "portal", children: "Portal Settings" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Clients" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: loading ? '...' : stats.activeClients }), _jsx("p", { className: "text-xs text-muted-foreground", children: loading ? 'Loading...' : 'Total companies' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Unread Messages" }), _jsx(MessageSquare, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: loading ? '...' : stats.unreadMessages }), _jsx("p", { className: "text-xs text-muted-foreground", children: loading ? 'Loading...' : 'Require response' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Approvals" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: loading ? '...' : stats.pendingApprovals }), _jsx("p", { className: "text-xs text-muted-foreground", children: loading ? 'Loading...' : 'Documents awaiting approval' })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Portal Access" }), _jsx(Eye, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: loading ? '...' : clientAccess.filter(access => access.isActive).length }), _jsx("p", { className: "text-xs text-muted-foreground", children: loading ? 'Loading...' : 'Active portal users' })] })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Communications" }), _jsx(CardDescription, { children: "Latest messages and interactions with clients" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsx("div", { className: "space-y-3", children: loading ? (_jsx("div", { className: "text-center py-4", children: _jsx("div", { className: "text-muted-foreground", children: "Loading messages..." }) })) : messages.length === 0 ? (_jsx("div", { className: "text-center py-4", children: _jsx("div", { className: "text-muted-foreground", children: "No recent messages" }) })) : (messages.slice(0, 4).map((message) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Avatar, { children: _jsx(AvatarFallback, { children: getInitials(message.sender.name) }) }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("p", { className: "text-sm font-medium", children: message.company.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["\"", message.messageText.length > 60
                                                                                ? message.messageText.substring(0, 60) + '...'
                                                                                : message.messageText, "\""] }), _jsx("p", { className: "text-xs text-muted-foreground", children: formatDate(message.createdAt) })] }), _jsx(Badge, { variant: message.isRead ? "default" : "destructive", className: message.isRead
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800", children: message.isRead ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Read"] })) : ('Unread') })] }, message.id)))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Client Portal Activity" }), _jsx(CardDescription, { children: "Recent client portal usage and document access" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsx("div", { className: "space-y-3", children: loading ? (_jsx("div", { className: "text-center py-4", children: _jsx("div", { className: "text-muted-foreground", children: "Loading activity..." }) })) : clientAccess.length === 0 ? (_jsx("div", { className: "text-center py-4", children: _jsx("div", { className: "text-muted-foreground", children: "No portal activity" }) })) : (clientAccess.slice(0, 4).map((access) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-full ${access.isActive ? 'bg-green-100' : 'bg-gray-100'}`, children: _jsx(Eye, { className: `h-5 w-5 ${access.isActive ? 'text-green-600' : 'text-gray-600'}` }) }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("p", { className: "text-sm font-medium", children: access.isActive ? 'Portal Access Active' : 'Portal Access Inactive' }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [access.company.name, " - ", access.user.name] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Role: ", access.user.role] })] }), _jsx(Badge, { variant: access.isActive ? "default" : "secondary", className: access.isActive
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800", children: access.isActive ? 'Active' : 'Inactive' })] }, access.id)))) }) })] })] })] }), _jsxs(TabsContent, { value: "clients", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Client Directory" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { placeholder: "Search clients...", className: "w-64", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }), _jsx(Button, { onClick: () => {
                                                    resetClientForm();
                                                    setIsCreateDialogOpen(true);
                                                }, children: "Add Client" })] })] }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: loading ? (_jsx("div", { className: "col-span-full text-center py-8", children: _jsx("div", { className: "text-muted-foreground", children: "Loading clients..." }) })) : companies.length === 0 ? (_jsxs("div", { className: "col-span-full text-center py-8", children: [_jsx("div", { className: "text-muted-foreground", children: "No clients found" }), _jsx(Button, { className: "mt-2", onClick: () => {
                                                resetClientForm();
                                                setIsCreateDialogOpen(true);
                                            }, children: "Add First Client" })] })) : (companies
                                    .filter(company => !searchQuery ||
                                    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase())))
                                    .map((company) => {
                                    const hasAccess = clientAccess.some(access => access.companyId === company.id && access.isActive);
                                    return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Avatar, { children: _jsx(AvatarFallback, { children: getInitials(company.name) }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: company.name }), _jsx(CardDescription, { children: company.industry || 'No industry specified' })] })] }), _jsx(Badge, { variant: hasAccess ? "default" : "secondary", className: hasAccess
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800", children: hasAccess ? 'Active' : 'Setup Required' })] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: company.email || 'No email provided' })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx(Phone, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: company.phone || 'No phone provided' })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Created" }), _jsx("span", { className: "font-medium", children: formatDate(company.createdAt) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Portal Access" }), _jsx(Badge, { variant: hasAccess ? "default" : "outline", className: hasAccess
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800", children: hasAccess ? 'Enabled' : 'Setup Required' })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Country" }), _jsx("span", { className: "font-medium", children: company.country || 'Not specified' })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { size: "sm", className: "flex-1", onClick: () => openComposeDialog(company.id), children: [_jsx(MessageSquare, { className: "mr-2 h-4 w-4" }), "Message"] }), _jsxs(Button, { size: "sm", variant: "outline", className: "flex-1", onClick: () => openShareDocumentDialog(company.id), children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), "Share Doc"] }), _jsx(Button, { size: "sm", variant: "outline", className: "flex-1", onClick: () => setViewingClient(company), children: "View Details" })] })] })] }, company.id));
                                })) })] }), _jsx(TabsContent, { value: "communications", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Message Center" }), _jsx(CardDescription, { children: "Secure communications with clients" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs(Alert, { children: [_jsx(Bell, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["You have ", stats.unreadMessages, " unread messages from clients.", stats.unreadMessages > 0 ? ' Some may require immediate attention.' : ' All messages have been read.'] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Recent Messages" }), _jsx("div", { className: "space-y-3", children: loading ? (_jsx("div", { className: "text-center py-4", children: _jsx("div", { className: "text-muted-foreground", children: "Loading messages..." }) })) : messages.length === 0 ? (_jsx("div", { className: "text-center py-4", children: _jsx("div", { className: "text-muted-foreground", children: "No messages found" }) })) : (messages.slice(0, 6).map((message) => (_jsxs("div", { className: "p-4 border rounded-lg hover:bg-muted/50 cursor-pointer", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarFallback, { children: getInitials(message.sender.name) }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: message.company.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: message.sender.name })] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: message.isRead ? "default" : "destructive", className: message.isRead
                                                                                            ? "bg-green-100 text-green-800"
                                                                                            : "bg-red-100 text-red-800", children: message.isRead ? 'Read' : 'Unread' }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: formatDate(message.createdAt) })] })] }), _jsxs("p", { className: "text-sm", children: ["\"", message.messageText.length > 100
                                                                                ? message.messageText.substring(0, 100) + '...'
                                                                                : message.messageText, "\""] })] }, message.id)))) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Quick Actions" }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { className: "w-full justify-start bg-transparent", variant: "outline", onClick: () => openComposeDialog(), children: [_jsx(MessageSquare, { className: "mr-2 h-4 w-4" }), "Compose New Message"] }), _jsxs(Button, { className: "w-full justify-start bg-transparent", variant: "outline", children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Schedule Meeting"] }), _jsxs(Button, { className: "w-full justify-start bg-transparent", variant: "outline", children: [_jsx(Share, { className: "mr-2 h-4 w-4" }), "Share Document"] }), _jsxs(Button, { className: "w-full justify-start bg-transparent", variant: "outline", children: [_jsx(Bell, { className: "mr-2 h-4 w-4" }), "Send Notification"] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h4", { className: "font-medium mb-3", children: "Message Templates" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Button, { size: "sm", variant: "ghost", className: "w-full justify-start text-sm", children: "Document Review Request" }), _jsx(Button, { size: "sm", variant: "ghost", className: "w-full justify-start text-sm", children: "Meeting Confirmation" }), _jsx(Button, { size: "sm", variant: "ghost", className: "w-full justify-start text-sm", children: "Payment Reminder" }), _jsx(Button, { size: "sm", variant: "ghost", className: "w-full justify-start text-sm", children: "Project Update" })] })] })] })] })] })] }) }), _jsx(TabsContent, { value: "documents", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Shared Documents" }), _jsx(CardDescription, { children: "Documents shared with clients through the portal" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: loadingSharedDocuments ? 'Loading...' : `${sharedDocuments.length} documents are currently shared with clients` }), _jsxs(Button, { onClick: () => openShareDocumentDialog(), children: [_jsx(Share, { className: "mr-2 h-4 w-4" }), "Share New Document"] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2", children: [_jsx("div", { className: "col-span-4", children: "Document" }), _jsx("div", { className: "col-span-2", children: "Client" }), _jsx("div", { className: "col-span-2", children: "Shared Date" }), _jsx("div", { className: "col-span-2", children: "Status" }), _jsx("div", { className: "col-span-2", children: "Actions" })] }), _jsxs("div", { className: "space-y-2", children: [loadingSharedDocuments ? (_jsx("div", { className: "text-center py-8", children: _jsx("div", { className: "text-muted-foreground", children: "Loading shared documents..." }) })) : sharedDocuments.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-muted-foreground", children: "No documents have been shared yet" }), _jsx(Button, { className: "mt-2", onClick: () => openShareDocumentDialog(), children: "Share Your First Document" })] })) : (sharedDocuments.map((sharedDoc) => (_jsxs("div", { className: "grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "col-span-4 flex items-center space-x-3", children: [_jsx(FileText, { className: "h-5 w-5 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: sharedDoc.document?.displayName || sharedDoc.document?.name || 'Unknown Document' }), _jsx("p", { className: "text-sm text-muted-foreground", children: sharedDoc.document?.sizeBytes ? `${(sharedDoc.document.sizeBytes / 1024 / 1024).toFixed(1)} MB` : 'Unknown size' })] })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Avatar, { className: "h-6 w-6", children: _jsx(AvatarFallback, { children: getInitials(sharedDoc.clientInfo?.name || 'Unknown') }) }), _jsx("span", { className: "text-sm", children: sharedDoc.clientInfo?.name || 'Unknown Client' })] }) }), _jsx("div", { className: "col-span-2 text-sm text-muted-foreground", children: formatDate(sharedDoc.sharedAt || sharedDoc.createdAt) }), _jsx("div", { className: "col-span-2", children: _jsx(Badge, { variant: sharedDoc.status === 'active' ? 'default' : 'secondary', className: sharedDoc.status === 'active'
                                                                                ? "bg-green-100 text-green-800"
                                                                                : "bg-gray-100 text-gray-800", children: sharedDoc.expiresAt && new Date(sharedDoc.expiresAt) < new Date() ? (_jsxs(_Fragment, { children: [_jsx(AlertTriangle, { className: "mr-1 h-3 w-3" }), "Expired"] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Active"] })) }) }), _jsxs("div", { className: "col-span-2 flex items-center space-x-1", children: [_jsx(Button, { size: "sm", variant: "ghost", title: "View Document", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", title: "Message Client", onClick: () => openComposeDialog(sharedDoc.clientInfo?.id), children: _jsx(MessageSquare, { className: "h-4 w-4" }) })] })] }, sharedDoc.id)))), _jsxs("div", { className: "grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg", style: { display: 'none' }, children: [_jsxs("div", { className: "col-span-4 flex items-center space-x-3", children: [_jsx(FileText, { className: "h-5 w-5 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Q4 Financial Report.pdf" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "2.4 MB" })] })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Avatar, { className: "h-6 w-6", children: [_jsx(AvatarImage, { src: "/professional-woman-diverse.png" }), _jsx(AvatarFallback, { children: "AC" })] }), _jsx("span", { className: "text-sm", children: "ABC Corp" })] }) }), _jsx("div", { className: "col-span-2 text-sm text-muted-foreground", children: "2 hours ago" }), _jsx("div", { className: "col-span-2", children: _jsxs(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-800", children: [_jsx(Clock, { className: "mr-1 h-3 w-3" }), "Pending Review"] }) }), _jsxs("div", { className: "col-span-2 flex items-center space-x-1", children: [_jsx(Button, { size: "sm", variant: "ghost", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", children: _jsx(MessageSquare, { className: "h-4 w-4" }) })] })] }), _jsxs("div", { className: "grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "col-span-4 flex items-center space-x-3", children: [_jsx(FileText, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Tax Return 2024.pdf" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "1.8 MB" })] })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Avatar, { className: "h-6 w-6", children: [_jsx(AvatarImage, { src: "/professional-man.png" }), _jsx(AvatarFallback, { children: "XY" })] }), _jsx("span", { className: "text-sm", children: "XYZ Ind" })] }) }), _jsx("div", { className: "col-span-2 text-sm text-muted-foreground", children: "1 day ago" }), _jsx("div", { className: "col-span-2", children: _jsxs(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "Approved"] }) }), _jsxs("div", { className: "col-span-2 flex items-center space-x-1", children: [_jsx(Button, { size: "sm", variant: "ghost", children: _jsx(Download, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", children: _jsx(Share, { className: "h-4 w-4" }) })] })] }), _jsxs("div", { className: "grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "col-span-4 flex items-center space-x-3", children: [_jsx(FileText, { className: "h-5 w-5 text-purple-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Contract Amendment.docx" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "456 KB" })] })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Avatar, { className: "h-6 w-6", children: [_jsx(AvatarImage, { src: "/professional-woman-2.png" }), _jsx(AvatarFallback, { children: "DE" })] }), _jsx("span", { className: "text-sm", children: "DEF Ent" })] }) }), _jsx("div", { className: "col-span-2 text-sm text-muted-foreground", children: "3 days ago" }), _jsx("div", { className: "col-span-2", children: _jsxs(Badge, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "mr-1 h-3 w-3" }), "Rejected"] }) }), _jsxs("div", { className: "col-span-2 flex items-center space-x-1", children: [_jsx(Button, { size: "sm", variant: "ghost", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", children: _jsx(MessageSquare, { className: "h-4 w-4" }) })] })] })] })] })] }) })] }) }), _jsx(TabsContent, { value: "portal", className: "space-y-6", children: _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Portal Configuration" }), _jsx(CardDescription, { children: "Customize client portal settings and branding" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Custom Branding" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Add your logo and brand colors" })] }), _jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Enabled" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Two-Factor Authentication" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Enhanced security for client access" })] }), _jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Required" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Document Watermarks" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Add watermarks to shared documents" })] }), _jsx(Badge, { variant: "outline", children: "Optional" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Email Notifications" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Notify clients of new documents" })] }), _jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Enabled" })] })] }), _jsx(Button, { className: "w-full", children: "Configure Portal Settings" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Access Management" }), _jsx(CardDescription, { children: "Manage client permissions and access levels" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "font-medium", children: "Document Access" }), _jsx(Badge, { variant: "default", className: "bg-blue-100 text-blue-800", children: "Full Access" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Clients can view, download, and approve documents" })] }), _jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "font-medium", children: "Communication" }), _jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Enabled" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Secure messaging and meeting scheduling" })] }), _jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "font-medium", children: "Financial Reports" }), _jsx(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-800", children: "View Only" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Read-only access to financial statements" })] }), _jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "font-medium", children: "Invoice Management" }), _jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Full Access" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "View, approve, and pay invoices online" })] })] }), _jsx(Button, { className: "w-full bg-transparent", variant: "outline", children: "Manage Permissions" })] })] })] }) })] }), _jsx(Dialog, { open: isComposeDialogOpen, onOpenChange: (open) => {
                    if (!open) {
                        setIsComposeDialogOpen(false);
                        resetMessageForm();
                    }
                }, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Compose New Message" }), _jsx(DialogDescription, { children: "Send a secure message to one of your clients" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "recipient", children: "Recipient Company *" }), _jsxs(Select, { value: messageForm.recipientId, onValueChange: (value) => setMessageForm(prev => ({ ...prev, recipientId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select a client to message" }) }), _jsx(SelectContent, { children: companies.map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "subject", children: "Subject *" }), _jsx(Input, { id: "subject", placeholder: "Enter message subject", value: messageForm.subject, onChange: (e) => setMessageForm(prev => ({ ...prev, subject: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "priority", children: "Priority" }), _jsxs(Select, { value: messageForm.priority, onValueChange: (value) => setMessageForm(prev => ({ ...prev, priority: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "normal", children: "Normal" }), _jsx(SelectItem, { value: "high", children: "High" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "message", children: "Message *" }), _jsx(Textarea, { id: "message", placeholder: "Type your message here...", value: messageForm.messageText, onChange: (e) => setMessageForm(prev => ({ ...prev, messageText: e.target.value })), rows: 6, className: "resize-none" }), _jsx("div", { className: "text-right mt-1", children: _jsxs("span", { className: "text-xs text-muted-foreground", children: [messageForm.messageText.length, " characters"] }) })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setIsComposeDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleSendMessage, disabled: !messageForm.recipientId || !messageForm.subject.trim() || !messageForm.messageText.trim(), children: [_jsx(MessageSquare, { className: "w-4 h-4 mr-2" }), "Send Message"] })] })] })] }) }), _jsx(Dialog, { open: isShareDocumentDialogOpen, onOpenChange: setIsShareDocumentDialogOpen, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Share Document" }), _jsx(DialogDescription, { children: "Share a document with the selected client" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "document-select", children: "Select Document" }), _jsxs(Select, { value: shareDocumentForm.documentId, onValueChange: (value) => setShareDocumentForm(prev => ({ ...prev, documentId: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose a document to share" }) }), _jsx(SelectContent, { children: loadingDocuments ? (_jsx(SelectItem, { value: "loading", disabled: true, children: "Loading documents..." })) : documents.length === 0 ? (_jsx(SelectItem, { value: "none", disabled: true, children: "No documents available" })) : (documents.map((doc) => (_jsx(SelectItem, { value: doc.id, children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "h-4 w-4" }), _jsx("span", { children: doc.displayName || doc.name })] }) }, doc.id)))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "share-message", children: "Message (Optional)" }), _jsx(Textarea, { id: "share-message", placeholder: "Add a message for the client...", value: shareDocumentForm.message, onChange: (e) => setShareDocumentForm(prev => ({ ...prev, message: e.target.value })), rows: 3, className: "resize-none" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "expires-at", children: "Expiration Date (Optional)" }), _jsx(Input, { id: "expires-at", type: "datetime-local", value: shareDocumentForm.expiresAt, onChange: (e) => setShareDocumentForm(prev => ({ ...prev, expiresAt: e.target.value })) })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setIsShareDocumentDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleShareDocument, disabled: !shareDocumentForm.documentId || !shareDocumentForm.clientId, children: [_jsx(Share, { className: "w-4 h-4 mr-2" }), "Share Document"] })] })] })] }) }), _jsx(Dialog, { open: !!viewingClient, onOpenChange: (open) => {
                    if (!open)
                        setViewingClient(null);
                }, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Client Details" }), _jsx(DialogDescription, { children: "View detailed information about this client" })] }), viewingClient && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Basic Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Company Name" }), _jsx("p", { className: "text-lg font-semibold", children: viewingClient.name })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Industry" }), _jsx("p", { className: "text-sm", children: viewingClient.industry || 'Not specified' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Country" }), _jsx("p", { className: "text-sm", children: viewingClient.country || 'Not specified' })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Currency" }), _jsx("p", { className: "text-sm", children: viewingClient.currency || 'Not specified' })] }), viewingClient.taxId && (_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Tax ID" }), _jsx("p", { className: "text-sm", children: viewingClient.taxId })] })), viewingClient.fiscalYearStart && (_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Fiscal Year Start" }), _jsx("p", { className: "text-sm", children: viewingClient.fiscalYearStart })] }))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Contact Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: viewingClient.email || 'No email provided' })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Phone, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: viewingClient.phone || 'No phone provided' })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Account Status" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Client Since" }), _jsx("p", { className: "text-sm", children: formatDate(viewingClient.createdAt) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Portal Access" }), _jsx("div", { className: "mt-1", children: _jsx(Badge, { variant: clientAccess.some(access => access.companyId === viewingClient.id && access.isActive) ? "default" : "outline", className: clientAccess.some(access => access.companyId === viewingClient.id && access.isActive)
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800", children: clientAccess.some(access => access.companyId === viewingClient.id && access.isActive) ? 'Enabled' : 'Setup Required' }) })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4 border-t", children: [_jsx(Button, { variant: "outline", onClick: () => setViewingClient(null), children: "Close" }), _jsxs(Button, { onClick: () => {
                                                setViewingClient(null);
                                                openComposeDialog(viewingClient.id);
                                            }, children: [_jsx(MessageSquare, { className: "w-4 h-4 mr-2" }), "Send Message"] })] })] }))] }) })] }));
}
