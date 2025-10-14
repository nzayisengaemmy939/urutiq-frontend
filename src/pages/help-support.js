import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageLayout } from '../components/page-layout';
import { useToast } from '../hooks/use-toast';
import { BookOpen, Ticket, Search, Star, Clock, Users, Play, Plus, Send, Phone, Mail, Zap, Shield, Settings, Video, Download, ThumbsUp, Eye, Calendar, ArrowRight, Filter, ChevronRight, LifeBuoy, MessageCircle, Activity, CreditCard } from 'lucide-react';
const supportCategories = [
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen, color: 'blue' },
    { id: 'billing', name: 'Billing & Payments', icon: CreditCard, color: 'green' },
    { id: 'technical', name: 'Technical Issues', icon: Settings, color: 'red' },
    { id: 'features', name: 'Features & Usage', icon: Star, color: 'purple' },
    { id: 'security', name: 'Security & Privacy', icon: Shield, color: 'yellow' },
    { id: 'integrations', name: 'Integrations', icon: Zap, color: 'indigo' },
];
const contactMethods = [
    {
        title: 'Live Chat',
        description: 'Get instant help from our support team',
        icon: MessageCircle,
        availability: '24/7',
        responseTime: 'Instant',
        action: 'Start Chat',
        color: 'blue'
    },
    {
        title: 'Email Support',
        description: 'Send us a detailed message',
        icon: Mail,
        availability: 'Business Hours',
        responseTime: '< 24 hours',
        action: 'Send Email',
        color: 'green'
    },
    {
        title: 'Phone Support',
        description: 'Speak directly with our experts',
        icon: Phone,
        availability: 'Mon-Fri 9AM-6PM',
        responseTime: 'Immediate',
        action: 'Call Now',
        color: 'purple'
    },
    {
        title: 'Video Call',
        description: 'Schedule a screen sharing session',
        icon: Video,
        availability: 'By Appointment',
        responseTime: 'Same Day',
        action: 'Schedule Call',
        color: 'orange'
    }
];
const quickActions = [
    { title: 'Submit a Ticket', icon: Ticket, description: 'Report an issue or request help' },
    { title: 'Browse Knowledge Base', icon: BookOpen, description: 'Find answers in our help articles' },
    { title: 'Watch Tutorials', icon: Play, description: 'Learn with step-by-step videos' },
    { title: 'Community Forum', icon: Users, description: 'Connect with other users' },
    { title: 'System Status', icon: Activity, description: 'Check service availability' },
    { title: 'Feature Requests', icon: Plus, description: 'Suggest new features' }
];
const popularFAQs = [
    {
        id: '1',
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking the "Forgot Password" link on the login page...',
        category: 'getting-started',
        helpful: 245,
        views: 1203
    },
    {
        id: '2',
        question: 'How do I add a new company?',
        answer: 'To add a new company, navigate to the Companies page and click the "Add Company" button...',
        category: 'features',
        helpful: 189,
        views: 892
    },
    {
        id: '3',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, and bank transfers...',
        category: 'billing',
        helpful: 156,
        views: 743
    },
    {
        id: '4',
        question: 'How do I export my data?',
        answer: 'You can export your data from the Settings page under Data Export...',
        category: 'features',
        helpful: 134,
        views: 567
    }
];
export default function HelpSupportPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [tickets, setTickets] = useState([]);
    const [isSubmitTicketOpen, setIsSubmitTicketOpen] = useState(false);
    const [ticketForm, setTicketForm] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
    });
    const handleSubmitTicket = async () => {
        try {
            // API call would go here
            toast({
                title: "Ticket Submitted",
                description: "Your support ticket has been submitted successfully.",
            });
            setIsSubmitTicketOpen(false);
            setTicketForm({ title: '', description: '', category: '', priority: 'medium' });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit ticket. Please try again.",
                variant: "destructive",
            });
        }
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-8", children: [_jsx("div", { className: "bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-8 border-b border-indigo-100", children: _jsxs("div", { className: "text-center max-w-3xl mx-auto", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6", children: _jsx(LifeBuoy, { className: "w-8 h-8 text-white" }) }), _jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Help & Support Center" }), _jsx("p", { className: "text-xl text-gray-600 mb-8", children: "Get the help you need, when you need it. Our comprehensive support resources are here to assist you." }), _jsxs("div", { className: "relative max-w-xl mx-auto", children: [_jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx(Input, { placeholder: "Search for help articles, tutorials, or FAQs...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-12 pr-4 py-4 text-lg border-2 border-indigo-200 focus:border-indigo-500 rounded-xl shadow-lg" })] })] }) }), _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-8", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5 h-14 p-1 bg-gray-100 rounded-xl", children: [_jsx(TabsTrigger, { value: "overview", className: "text-sm font-medium", children: "Overview" }), _jsx(TabsTrigger, { value: "knowledge-base", className: "text-sm font-medium", children: "Knowledge Base" }), _jsx(TabsTrigger, { value: "tutorials", className: "text-sm font-medium", children: "Tutorials" }), _jsx(TabsTrigger, { value: "support", className: "text-sm font-medium", children: "Get Support" }), _jsx(TabsTrigger, { value: "my-tickets", className: "text-sm font-medium", children: "My Tickets" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Quick Actions" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: quickActions.map((action, index) => (_jsx(Card, { className: "hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-md", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(action.icon, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: action.title }), _jsx("p", { className: "text-gray-600 text-sm", children: action.description })] }), _jsx(ChevronRight, { className: "w-5 h-5 text-gray-400" })] }) }) }, index))) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Popular Questions" }), _jsx(Button, { variant: "outline", children: "View All FAQs" })] }), _jsx("div", { className: "grid gap-4", children: popularFAQs.map((faq) => (_jsx(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: faq.question }), _jsx("p", { className: "text-gray-600 mb-4 line-clamp-2", children: faq.answer }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(ThumbsUp, { className: "w-4 h-4" }), _jsx("span", { children: faq.helpful })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Eye, { className: "w-4 h-4" }), _jsx("span", { children: faq.views })] }), _jsx(Badge, { variant: "secondary", className: "capitalize", children: supportCategories.find(cat => cat.id === faq.category)?.name })] })] }), _jsx(ChevronRight, { className: "w-5 h-5 text-gray-400 ml-4" })] }) }) }, faq.id))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Browse by Category" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: supportCategories.map((category) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx("div", { className: `w-16 h-16 bg-${category.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`, children: _jsx(category.icon, { className: `w-8 h-8 text-${category.color}-600` }) }), _jsx("h3", { className: "font-semibold text-lg mb-2", children: category.name }), _jsxs("p", { className: "text-gray-600 text-sm mb-4", children: ["Find articles and guides related to ", category.name.toLowerCase()] }), _jsxs(Button, { variant: "outline", size: "sm", children: ["Explore ", _jsx(ArrowRight, { className: "w-4 h-4 ml-1" })] })] }) }, category.id))) })] })] }), _jsxs(TabsContent, { value: "knowledge-base", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Knowledge Base" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "All Categories" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), supportCategories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id)))] })] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Filter"] })] })] }), _jsx("div", { className: "grid gap-6", children: [
                                            {
                                                title: "Getting Started with UrutiIQ",
                                                description: "A comprehensive guide to setting up your account and getting started",
                                                category: "getting-started",
                                                readTime: 5,
                                                views: 1234
                                            },
                                            {
                                                title: "Managing Company Settings",
                                                description: "Learn how to configure your company settings and preferences",
                                                category: "features",
                                                readTime: 8,
                                                views: 892
                                            },
                                            {
                                                title: "Understanding Billing and Invoicing",
                                                description: "Complete guide to billing features and invoice management",
                                                category: "billing",
                                                readTime: 12,
                                                views: 756
                                            }
                                        ].map((article, index) => (_jsx(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: article.title }), _jsx("p", { className: "text-gray-600 mb-4", children: article.description }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsxs("span", { children: [article.readTime, " min read"] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Eye, { className: "w-4 h-4" }), _jsxs("span", { children: [article.views, " views"] })] }), _jsx(Badge, { variant: "secondary", children: supportCategories.find(cat => cat.id === article.category)?.name })] })] }), _jsx(ChevronRight, { className: "w-5 h-5 text-gray-400 ml-4" })] }) }) }, index))) })] }), _jsxs(TabsContent, { value: "tutorials", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Video Tutorials" }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download All"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                                            {
                                                title: "Setting Up Your First Company",
                                                duration: "5:30",
                                                views: 2341,
                                                difficulty: "Beginner",
                                                thumbnail: "/api/placeholder/300/200"
                                            },
                                            {
                                                title: "Advanced Reporting Features",
                                                duration: "12:45",
                                                views: 1876,
                                                difficulty: "Advanced",
                                                thumbnail: "/api/placeholder/300/200"
                                            },
                                            {
                                                title: "Integrating with Third-Party Tools",
                                                duration: "8:20",
                                                views: 1234,
                                                difficulty: "Intermediate",
                                                thumbnail: "/api/placeholder/300/200"
                                            }
                                        ].map((tutorial, index) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer overflow-hidden", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "aspect-video bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center", children: _jsx(Play, { className: "w-12 h-12 text-white" }) }), _jsx(Badge, { className: "absolute top-2 right-2 bg-black/70 text-white", children: tutorial.duration })] }), _jsxs(CardContent, { className: "p-4", children: [_jsx("h3", { className: "font-semibold mb-2", children: tutorial.title }), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Eye, { className: "w-4 h-4" }), _jsxs("span", { children: [tutorial.views, " views"] })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: tutorial.difficulty })] })] })] }, index))) })] }), _jsxs(TabsContent, { value: "support", className: "space-y-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Get Support" }), _jsx("p", { className: "text-gray-600 max-w-2xl mx-auto", children: "Choose the best way to get help. Our support team is available through multiple channels to assist you." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: contactMethods.map((method, index) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: `w-12 h-12 bg-${method.color}-100 rounded-xl flex items-center justify-center`, children: _jsx(method.icon, { className: `w-6 h-6 text-${method.color}-600` }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: method.title }), _jsx("p", { className: "text-gray-600 mb-4", children: method.description }), _jsxs("div", { className: "space-y-2 text-sm text-gray-500 mb-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Availability:" }), _jsx("span", { children: method.availability })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Response Time:" }), _jsx("span", { children: method.responseTime })] })] }), _jsx(Button, { className: "w-full", children: method.action })] })] }) }) }, index))) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Ticket, { className: "w-5 h-5" }), "Submit a Support Ticket"] }), _jsx(CardDescription, { children: "Describe your issue in detail and we'll get back to you as soon as possible." })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "ticket-title", children: "Subject" }), _jsx(Input, { id: "ticket-title", placeholder: "Brief description of your issue", value: ticketForm.title, onChange: (e) => setTicketForm({ ...ticketForm, title: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "ticket-category", children: "Category" }), _jsxs(Select, { value: ticketForm.category, onValueChange: (value) => setTicketForm({ ...ticketForm, category: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select a category" }) }), _jsx(SelectContent, { children: supportCategories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id))) })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "ticket-priority", children: "Priority" }), _jsxs(Select, { value: ticketForm.priority, onValueChange: (value) => setTicketForm({ ...ticketForm, priority: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "ticket-description", children: "Description" }), _jsx(Textarea, { id: "ticket-description", placeholder: "Please provide as much detail as possible about your issue...", rows: 6, value: ticketForm.description, onChange: (e) => setTicketForm({ ...ticketForm, description: e.target.value }) })] }), _jsxs(Button, { onClick: handleSubmitTicket, disabled: !ticketForm.title || !ticketForm.description || !ticketForm.category, className: "w-full md:w-auto", children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Submit Ticket"] })] })] })] }), _jsxs(TabsContent, { value: "my-tickets", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Your Support Tickets" }), _jsxs(Button, { onClick: () => setIsSubmitTicketOpen(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Ticket"] })] }), tickets.length === 0 ? (_jsx(Card, { className: "text-center py-12", children: _jsxs(CardContent, { children: [_jsx(Ticket, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No support tickets" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "You haven't submitted any support tickets yet." }), _jsxs(Button, { onClick: () => setIsSubmitTicketOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Submit Your First Ticket"] })] }) })) : (_jsx("div", { className: "space-y-4", children: tickets.map((ticket) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsx("h3", { className: "font-semibold text-lg", children: ticket.title }), _jsx(Badge, { variant: ticket.status === 'open' ? 'default' :
                                                                                ticket.status === 'in-progress' ? 'secondary' :
                                                                                    ticket.status === 'resolved' ? 'secondary' : 'outline', children: ticket.status }), _jsx(Badge, { variant: ticket.priority === 'urgent' ? 'destructive' :
                                                                                ticket.priority === 'high' ? 'default' :
                                                                                    ticket.priority === 'medium' ? 'secondary' : 'outline', children: ticket.priority })] }), _jsx("p", { className: "text-gray-600 mb-4 line-clamp-2", children: ticket.description }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [_jsxs("span", { children: ["#", ticket.ticketNumber] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsxs("span", { children: ["Created ", new Date(ticket.createdAt).toLocaleDateString()] })] }), _jsx(Badge, { variant: "outline", className: "capitalize", children: supportCategories.find(cat => cat.id === ticket.category)?.name })] })] }), _jsx(Button, { variant: "outline", size: "sm", children: "View Details" })] }) }) }, ticket.id))) }))] })] }) })] }) }));
}
