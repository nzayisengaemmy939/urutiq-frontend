import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { PageLayout } from "../components/page-layout";
import { apiService } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import { HelpCircle, BookOpen, MessageSquare, Ticket, Search, ExternalLink, Star, Clock, Users, FileText, Play, CheckCircle, AlertTriangle, Info, Plus, Edit, Trash2, Eye, EyeOff, RefreshCw, Loader2, X, ArrowLeft, } from "lucide-react";
// Category configuration
const categoryConfig = {
    'getting-started': { color: 'blue', icon: BookOpen, title: 'Getting Started', description: 'Essential guides for new users' },
    'accounting': { color: 'green', icon: FileText, title: 'Accounting', description: 'Financial management guides' },
    'invoicing': { color: 'purple', icon: Users, title: 'Invoicing', description: 'Billing and invoice management' },
    'troubleshooting': { color: 'yellow', icon: HelpCircle, title: 'Troubleshooting', description: 'Common issues and solutions' },
    'security': { color: 'red', icon: AlertTriangle, title: 'Security', description: 'Security and compliance' },
    'expenses': { color: 'orange', icon: FileText, title: 'Expenses', description: 'Expense management' },
    'ai-features': { color: 'indigo', icon: Star, title: 'AI Features', description: 'AI-powered insights' }
};
const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600'
};
export default function HelpPage() {
    const { toast } = useToast();
    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory] = useState('all');
    const [knowledgeArticles, setKnowledgeArticles] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);
    const [communityDiscussions, setCommunityDiscussions] = useState([]);
    const [communityStats, setCommunityStats] = useState({
        totalMembers: 0,
        postsThisMonth: 0,
        knowledgeBaseArticles: 0
    });
    // Tutorial Video Management State
    const [tutorialVideos, setTutorialVideos] = useState([]);
    const [showVideoUploadForm, setShowVideoUploadForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [videoForm, setVideoForm] = useState({
        title: '',
        description: '',
        category: 'general',
        difficulty: 'beginner',
        duration: 0,
        thumbnailUrl: '',
        tags: [],
        isPublished: false
    });
    const [videoTagInput, setVideoTagInput] = useState('');
    const [selectedTutorialVideo, setSelectedTutorialVideo] = useState(null);
    const [activeTab, setActiveTab] = useState("knowledge");
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [loading, setLoading] = useState(false);
    // New ticket form state
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
    });
    // Article management state
    const [showArticleForm, setShowArticleForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [articleForm, setArticleForm] = useState({
        title: '',
        content: '',
        category: '',
        tags: [],
        isPublished: false
    });
    const [articleTagInput, setArticleTagInput] = useState('');
    // Video modal state
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    // Article viewer state
    const [showArticleViewer, setShowArticleViewer] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    // Tutorial viewer state
    const [showTutorialViewer, setShowTutorialViewer] = useState(false);
    const [selectedTutorial, setSelectedTutorial] = useState(null);
    // Live chat state
    const [showChatModal, setShowChatModal] = useState(false);
    const [showNewChatForm, setShowNewChatForm] = useState(false);
    const [activeChatSession, setActiveChatSession] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatSessions, setChatSessions] = useState([]);
    const [newChatForm, setNewChatForm] = useState({
        category: '',
        subject: '',
        priority: 'medium'
    });
    // Community discussion form state
    const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
    const [newDiscussionForm, setNewDiscussionForm] = useState({
        title: '',
        content: '',
        category: 'general',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    // Load data on component mount
    useEffect(() => {
        loadKnowledgeArticles();
        loadSupportTickets();
        loadCommunityDiscussions();
        loadChatSessions();
        loadTutorialVideos();
    }, []);
    // Load all articles for management tab
    const loadAllArticles = async () => {
        try {
            const response = await apiService.get('/help/knowledge/articles');
            console.log('All articles API response:', response);
            // Handle the nested response structure
            const articles = response.data?.articles || response.articles || [];
            console.log('Extracted all articles:', articles);
            setKnowledgeArticles(articles);
        }
        catch (error) {
            console.error('Error loading all articles:', error);
        }
    };
    // Load knowledge articles
    const loadKnowledgeArticles = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/help/knowledge/search?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
            console.log('Knowledge articles API response:', response);
            // Handle the nested response structure
            const articles = response.data?.articles || response.articles || [];
            console.log('Extracted articles:', articles);
            setKnowledgeArticles(articles);
        }
        catch (error) {
            console.error('Error loading knowledge articles:', error);
            toast({
                title: "Error",
                description: "Failed to load knowledge articles",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    // Load support tickets
    const loadSupportTickets = async () => {
        try {
            const response = await apiService.get('/help/tickets');
            setSupportTickets(response.tickets || []);
        }
        catch (error) {
            console.error('Error loading support tickets:', error);
            toast({
                title: "Error",
                description: "Failed to load support tickets",
                variant: "destructive"
            });
        }
    };
    // Load community discussions
    const loadCommunityDiscussions = async () => {
        try {
            const response = await apiService.get('/help/community/discussions');
            setCommunityDiscussions(response.discussions || []);
            // Update community stats if available
            if (response.stats) {
                setCommunityStats(response.stats);
            }
        }
        catch (error) {
            console.error('Error loading community discussions:', error);
            toast({
                title: "Error",
                description: "Failed to load community discussions",
                variant: "destructive"
            });
        }
    };
    // Handle search
    const handleSearch = () => {
        loadKnowledgeArticles();
    };
    // Handle new ticket creation
    const handleCreateTicket = async () => {
        if (!newTicket.title || !newTicket.description) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }
        try {
            await apiService.post('/help/tickets', newTicket);
            toast({
                title: "Success",
                description: "Support ticket created successfully"
            });
            setShowNewTicketForm(false);
            setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' });
            loadSupportTickets();
        }
        catch (error) {
            console.error('Error creating ticket:', error);
            toast({
                title: "Error",
                description: "Failed to create support ticket",
                variant: "destructive"
            });
        }
    };
    // Article management functions
    const handleCreateArticle = async () => {
        if (!articleForm.title || !articleForm.content || !articleForm.category) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }
        try {
            await apiService.post('/help/knowledge/articles', articleForm);
            toast({
                title: "Success",
                description: "Knowledge article created successfully"
            });
            setShowArticleForm(false);
            setArticleForm({ title: '', content: '', category: '', tags: [], isPublished: false });
            loadAllArticles();
        }
        catch (error) {
            console.error('Error creating article:', error);
            toast({
                title: "Error",
                description: "Failed to create knowledge article",
                variant: "destructive"
            });
        }
    };
    const handleUpdateArticle = async () => {
        if (!editingArticle || !articleForm.title || !articleForm.content || !articleForm.category) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }
        try {
            await apiService.put(`/help/knowledge/articles/${editingArticle.id}`, articleForm);
            toast({
                title: "Success",
                description: "Knowledge article updated successfully"
            });
            setEditingArticle(null);
            setArticleForm({ title: '', content: '', category: '', tags: [], isPublished: false });
            loadAllArticles();
        }
        catch (error) {
            console.error('Error updating article:', error);
            toast({
                title: "Error",
                description: "Failed to update knowledge article",
                variant: "destructive"
            });
        }
    };
    const handleDeleteArticle = async (articleId) => {
        try {
            await apiService.delete(`/help/knowledge/articles/${articleId}`);
            toast({
                title: "Success",
                description: "Knowledge article deleted successfully"
            });
            loadAllArticles();
        }
        catch (error) {
            console.error('Error deleting article:', error);
            toast({
                title: "Error",
                description: "Failed to delete knowledge article",
                variant: "destructive"
            });
        }
    };
    const openEditArticle = (article) => {
        setEditingArticle(article);
        setArticleForm({
            title: article.title,
            content: article.content,
            category: article.category,
            tags: article.tags,
            isPublished: article.helpful // Using helpful as published status
        });
        setShowArticleForm(true);
    };
    const addArticleTag = () => {
        if (articleTagInput.trim() && !articleForm.tags.includes(articleTagInput.trim())) {
            setArticleForm(prev => ({
                ...prev,
                tags: [...prev.tags, articleTagInput.trim()]
            }));
            setArticleTagInput('');
        }
    };
    const removeArticleTag = (tagToRemove) => {
        setArticleForm(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };
    const resetArticleForm = () => {
        setArticleForm({ title: '', content: '', category: '', tags: [], isPublished: false });
        setEditingArticle(null);
        setTagInput('');
    };
    // Video handling functions
    const openVideo = (tutorial) => {
        if (tutorial.videoUrl) {
            setSelectedVideo({ url: tutorial.videoUrl, title: tutorial.title });
            setShowVideoModal(true);
        }
        else {
            toast({
                title: "No Video Available",
                description: "This tutorial doesn't have a video URL configured.",
                variant: "destructive"
            });
        }
    };
    const openExternalVideo = (url) => {
        window.open(url, '_blank');
    };
    // Tutorial Video Management Functions
    const loadTutorialVideos = async () => {
        try {
            const response = await fetch('https://urutiq-backend-clean-11.onrender.com/api/tutorial-videos', {
                method: 'GET',
                headers: {
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': localStorage.getItem('company_id') || 'cmg0qxjh9003nao3ftbaz1oc1',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch tutorial videos');
            }
            const result = await response.json();
            // Parse tags from JSON strings to arrays
            const videosWithParsedTags = (result.data || []).map((video) => ({
                ...video,
                tags: video.tags ? (typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags) : []
            }));
            setTutorialVideos(videosWithParsedTags);
        }
        catch (error) {
            console.error('Error loading tutorial videos:', error);
            toast({
                title: "Error",
                description: "Failed to load tutorial videos",
                variant: "destructive"
            });
        }
    };
    const testUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('video', file);
            console.log('Testing upload with FormData:', {
                hasFile: !!file,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                formDataKeys: Array.from(formData.keys())
            });
            const response = await fetch('https://urutiq-backend-clean-11.onrender.com/test-upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            console.log('Test upload response:', result);
            toast({
                title: "Test Upload",
                description: `File received: ${result.hasFile ? 'Yes' : 'No'}`,
                variant: result.hasFile ? "default" : "destructive"
            });
        }
        catch (error) {
            console.error('Test upload error:', error);
            toast({
                title: "Test Upload Error",
                description: "Failed to test upload",
                variant: "destructive"
            });
        }
    };
    const handleUploadTutorialVideo = async (file) => {
        if (!videoForm.title || !videoForm.category || !videoForm.difficulty) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }
        setIsUploadingVideo(true);
        try {
            const formData = new FormData();
            formData.append('video', file);
            formData.append('title', videoForm.title);
            formData.append('description', videoForm.description);
            formData.append('category', videoForm.category);
            formData.append('difficulty', videoForm.difficulty);
            formData.append('duration', videoForm.duration.toString());
            formData.append('thumbnailUrl', videoForm.thumbnailUrl);
            formData.append('tags', JSON.stringify(videoForm.tags));
            formData.append('isPublished', videoForm.isPublished.toString());
            console.log('FormData created:', {
                hasFile: !!file,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                formDataKeys: Array.from(formData.keys())
            });
            // Debug localStorage values
            const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo';
            const companyId = localStorage.getItem('company_id') || 'cmg0qxjh9003nao3ftbaz1oc1';
            const token = localStorage.getItem('auth_token');
            console.log('LocalStorage values:', {
                tenantId,
                companyId,
                token: token ? 'Present' : 'Missing'
            });
            // Use direct fetch instead of apiService to handle FormData properly
            const response = await fetch('https://urutiq-backend-clean-11.onrender.com/api/tutorial-videos/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'x-tenant-id': tenantId,
                    'x-company-id': companyId,
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }
            const result = await response.json();
            toast({
                title: "Success",
                description: "Tutorial video uploaded successfully"
            });
            setShowVideoUploadForm(false);
            resetVideoForm();
            loadTutorialVideos();
        }
        catch (error) {
            console.error('Error uploading tutorial video:', error);
            toast({
                title: "Error",
                description: "Failed to upload tutorial video",
                variant: "destructive"
            });
        }
        finally {
            setIsUploadingVideo(false);
        }
    };
    const handleDeleteTutorialVideo = async (videoId) => {
        try {
            await apiService.delete(`/tutorial-videos/${videoId}`);
            toast({
                title: "Success",
                description: "Tutorial video deleted successfully"
            });
            loadTutorialVideos();
        }
        catch (error) {
            console.error('Error deleting tutorial video:', error);
            toast({
                title: "Error",
                description: "Failed to delete tutorial video",
                variant: "destructive"
            });
        }
    };
    const openTutorialVideoPlayer = (video) => {
        setSelectedTutorialVideo(video);
    };
    // Function to get video stream URL with proper headers
    const getVideoStreamUrl = (videoId) => {
        const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo';
        const companyId = localStorage.getItem('company_id') || 'cmg0qxjh9003nao3ftbaz1oc1';
        const token = localStorage.getItem('auth_token') || '';
        return `https://urutiq-backend-clean-11.onrender.com/api/tutorial-videos/stream/${videoId}?tenantId=${tenantId}&companyId=${companyId}&token=${token}`;
    };
    const addVideoTag = () => {
        if (videoTagInput.trim() && !videoForm.tags.includes(videoTagInput.trim())) {
            setVideoForm(prev => ({
                ...prev,
                tags: [...prev.tags, videoTagInput.trim()]
            }));
            setVideoTagInput('');
        }
    };
    const removeVideoTag = (tag) => {
        setVideoForm(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };
    const resetVideoForm = () => {
        setVideoForm({
            title: '',
            description: '',
            category: 'general',
            difficulty: 'beginner',
            duration: 0,
            thumbnailUrl: '',
            tags: [],
            isPublished: false
        });
        setVideoTagInput('');
        setEditingVideo(null);
    };
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };
    // Article and tutorial viewer functions
    const openArticleViewer = async (article) => {
        setSelectedArticle(article);
        setShowArticleViewer(true);
        // Track article view
        try {
            console.log('Tracking view for article:', article.id);
            const response = await apiService.post(`/help/knowledge/articles/${article.id}/view`);
            console.log('View tracking response:', response);
            // Update local state to increment view count
            setKnowledgeArticles(prev => prev.map(a => a.id === article.id ? { ...a, views: a.views + 1 } : a));
            console.log('Updated article views in local state');
        }
        catch (error) {
            console.error('Error tracking article view:', error);
            console.error('Error details:', error.response?.data || error.message);
        }
    };
    const openTutorialViewer = (tutorial) => {
        setSelectedTutorial(tutorial);
        setShowTutorialViewer(true);
    };
    // Mark article as helpful
    const markArticleHelpful = async (articleId) => {
        if (!articleId)
            return;
        try {
            await apiService.post(`/help/knowledge/articles/${articleId}/helpful`);
            // Update local state
            setKnowledgeArticles(prev => prev.map(a => a.id === articleId ? { ...a, helpful: true } : a));
            setSelectedArticle(prev => prev ? { ...prev, helpful: true } : prev);
            toast({
                title: "Thank you!",
                description: "Your feedback helps us improve our knowledge base."
            });
        }
        catch (error) {
            console.error('Error marking article as helpful:', error);
            toast({
                title: "Error",
                description: "Failed to save your feedback",
                variant: "destructive"
            });
        }
    };
    // Live chat functions
    const loadChatSessions = async () => {
        try {
            const response = await apiService.get('/help/chat/sessions');
            setChatSessions(response.sessions || []);
        }
        catch (error) {
            console.error('Error loading chat sessions:', error);
        }
    };
    const loadChatMessages = async (sessionId) => {
        try {
            const response = await apiService.get(`/help/chat/sessions/${sessionId}/messages`);
            setChatMessages(response.messages || []);
        }
        catch (error) {
            console.error('Error loading chat messages:', error);
        }
    };
    const createChatSession = async () => {
        if (!newChatForm.category || !newChatForm.subject) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }
        try {
            const response = await apiService.post('/help/chat/sessions', newChatForm);
            toast({
                title: "Success",
                description: "Chat session created successfully"
            });
            setShowNewChatForm(false);
            setNewChatForm({ category: '', subject: '', priority: 'medium' });
            await loadChatSessions();
            // Open the new chat session
            openChatSession(response.data?.sessionId || response.sessionId);
        }
        catch (error) {
            console.error('Error creating chat session:', error);
            toast({
                title: "Error",
                description: "Failed to create chat session",
                variant: "destructive"
            });
        }
    };
    const openChatSession = async (sessionId) => {
        try {
            // First, try to find the session in the current list
            let session = chatSessions.find(s => s.id === sessionId);
            // If not found, reload sessions and try again
            if (!session) {
                await loadChatSessions();
                session = chatSessions.find(s => s.id === sessionId);
            }
            if (session) {
                setActiveChatSession(session);
                await loadChatMessages(sessionId);
                setShowChatModal(true);
            }
            else {
                // If still not found, create a mock session for demo mode
                setActiveChatSession({
                    id: sessionId,
                    subject: newChatForm.subject,
                    category: newChatForm.category,
                    priority: newChatForm.priority,
                    status: 'open'
                });
                setChatMessages([]);
                setShowChatModal(true);
            }
        }
        catch (error) {
            console.error('Error opening chat session:', error);
        }
    };
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeChatSession)
            return;
        try {
            await apiService.post(`/help/chat/sessions/${activeChatSession.id}/messages`, {
                message: newMessage.trim(),
                messageType: 'text'
            });
            setNewMessage('');
            await loadChatMessages(activeChatSession.id);
        }
        catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive"
            });
        }
    };
    const closeChatSession = async (sessionId) => {
        try {
            await apiService.put(`/help/chat/sessions/${sessionId}/close`);
            toast({
                title: "Success",
                description: "Chat session closed successfully"
            });
            setShowChatModal(false);
            setActiveChatSession(null);
            setChatMessages([]);
            loadChatSessions();
        }
        catch (error) {
            console.error('Error closing chat session:', error);
            toast({
                title: "Error",
                description: "Failed to close chat session",
                variant: "destructive"
            });
        }
    };
    // Community discussion functions
    const createDiscussion = async () => {
        if (!newDiscussionForm.title || !newDiscussionForm.content) {
            toast({
                title: "Error",
                description: "Please fill in title and content",
                variant: "destructive"
            });
            return;
        }
        try {
            await apiService.post('/help/community/discussions', {
                title: newDiscussionForm.title,
                content: newDiscussionForm.content,
                category: newDiscussionForm.category,
                tags: newDiscussionForm.tags
            });
            toast({
                title: "Success",
                description: "Discussion created successfully"
            });
            setShowNewDiscussionForm(false);
            setNewDiscussionForm({ title: '', content: '', category: 'general', tags: [] });
            setTagInput('');
            loadCommunityDiscussions();
        }
        catch (error) {
            console.error('Error creating discussion:', error);
            toast({
                title: "Error",
                description: "Failed to create discussion",
                variant: "destructive"
            });
        }
    };
    const addTag = () => {
        if (tagInput.trim() && !newDiscussionForm.tags.includes(tagInput.trim())) {
            setNewDiscussionForm(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };
    const removeTag = (tagToRemove) => {
        setNewDiscussionForm(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };
    const resetDiscussionForm = () => {
        setNewDiscussionForm({ title: '', content: '', category: 'general', tags: [] });
        setTagInput('');
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "flex-1 space-y-6 p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Help & Support" }), _jsx("p", { className: "text-muted-foreground", children: "Get help, learn features, and access support resources" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(MessageSquare, { className: "mr-2 h-4 w-4" }), "Contact Support"] }), _jsxs(Button, { children: [_jsx(Ticket, { className: "mr-2 h-4 w-4" }), "Create Ticket"] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "flex flex-wrap w-full gap-2 h-auto ml-0 pl-0", children: [_jsx(TabsTrigger, { value: "knowledge", className: "flex-shrink-0 px-4 py-2", children: "Knowledge Base" }), _jsx(TabsTrigger, { value: "tutorials", className: "flex-shrink-0 px-4 py-2", children: "Tutorials" }), _jsx(TabsTrigger, { value: "chat", className: "flex-shrink-0 px-4 py-2", children: "Live Chat" }), _jsx(TabsTrigger, { value: "tickets", className: "flex-shrink-0 px-4 py-2", children: "Support Tickets" }), _jsx(TabsTrigger, { value: "community", className: "flex-shrink-0 px-4 py-2", children: "Community" }), _jsx(TabsTrigger, { value: "articles", className: "flex-shrink-0 px-4 py-2", children: "Article Management" }), _jsx(TabsTrigger, { value: "video-mgmt", className: "flex-shrink-0 px-4 py-2", children: "Video Management" })] }), _jsxs(TabsContent, { value: "knowledge", className: "space-y-6", children: [_jsxs("div", { className: "flex space-x-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" }), _jsx(Input, { placeholder: "Search knowledge base...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSearch(), className: "pl-10" })] }) }), _jsx(Button, { variant: "outline", onClick: handleSearch, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Searching..."] })) : (_jsxs(_Fragment, { children: [_jsx(Search, { className: "h-4 w-4 mr-2" }), "Search"] })) })] }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: (() => {
                                        // Group articles by category
                                        const categoryGroups = knowledgeArticles.reduce((groups, article) => {
                                            const category = article.category;
                                            if (!groups[category]) {
                                                groups[category] = [];
                                            }
                                            groups[category].push(article);
                                            return groups;
                                        }, {});
                                        return Object.entries(categoryGroups).map(([category, articles]) => {
                                            const config = categoryConfig[category];
                                            if (!config)
                                                return null;
                                            const IconComponent = config.icon;
                                            return (_jsxs(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[config.color]}`, children: _jsx(IconComponent, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: config.title }), _jsx(CardDescription, { children: config.description })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [articles.slice(0, 3).map((article) => (_jsxs("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors", onClick: () => openArticleViewer(article), children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("span", { className: "text-sm font-medium truncate block", children: article.title }), _jsxs("span", { className: "text-xs text-muted-foreground truncate block", children: [article.content.substring(0, 50), "..."] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-2", children: [_jsxs(Badge, { variant: "outline", className: "text-xs", children: [article.views.toLocaleString(), " views"] }), _jsx(Eye, { className: "h-3 w-3 text-muted-foreground" })] })] }, article.id))), articles.length > 3 && (_jsxs("div", { className: "text-sm text-muted-foreground", children: ["+", articles.length - 3, " more articles"] }))] }) })] }, category));
                                        }).filter(Boolean);
                                    })() }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Popular Articles" }), _jsx(CardDescription, { children: "Most viewed help articles this month" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [knowledgeArticles.map((article) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-blue-100", children: _jsx(Star, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: article.title }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [article.content.substring(0, 60), "..."] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { variant: "outline", children: [article.views.toLocaleString(), " views"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => openArticleViewer(article), children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "View"] })] })] }, article.id))), knowledgeArticles.length === 0 && (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No articles found. Try searching for something else." }))] }) })] })] }), _jsx(TabsContent, { value: "tutorials", className: "space-y-6", children: !selectedTutorialVideo ? (
                            // Video Grid View
                            _jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Tutorial Videos" }), _jsx("p", { className: "text-muted-foreground", children: "Watch and learn from our tutorial videos" })] }), _jsxs(Button, { variant: "outline", onClick: () => loadTutorialVideos(), children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Refresh"] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [tutorialVideos.map((video) => (_jsxs(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", onClick: () => openTutorialVideoPlayer(video), children: [_jsxs("div", { className: "relative", children: [video.thumbnailUrl ? (_jsxs("div", { className: "aspect-video rounded-t-lg overflow-hidden", children: [_jsx("img", { src: video.thumbnailUrl, alt: video.title, className: "w-full h-full object-cover", onError: (e) => {
                                                                            // Fallback to gradient if thumbnail fails to load
                                                                            e.currentTarget.style.display = 'none';
                                                                            const nextElement = e.currentTarget.nextElementSibling;
                                                                            if (nextElement) {
                                                                                nextElement.style.display = 'flex';
                                                                            }
                                                                        } }), _jsx("div", { className: "aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center hidden", children: _jsx(Play, { className: "h-12 w-12 text-white" }) })] })) : (_jsx("div", { className: "aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center", children: _jsx(Play, { className: "h-12 w-12 text-white" }) })), _jsxs(Badge, { className: "absolute top-3 left-3 bg-black/50 text-white", children: [_jsx(Clock, { className: "mr-1 h-3 w-3" }), Math.floor(video.duration / 60), ":", (video.duration % 60).toString().padStart(2, '0')] }), video.downloadUrl && (_jsx("div", { className: "absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity", children: _jsx("div", { className: "bg-white/90 rounded-full p-3", children: _jsx(Play, { className: "h-8 w-8 text-blue-600" }) }) }))] }), _jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: video.title }), _jsx(CardDescription, { children: video.description })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Star, { className: "h-4 w-4 text-yellow-500" }), _jsxs("span", { className: "text-sm", children: [video.rating || 0, " (", video.viewCount || 0, " views)"] })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Button, { size: "sm", variant: "outline", onClick: () => openTutorialVideoPlayer(video), children: [_jsx(Play, { className: "mr-2 h-4 w-4" }), "Watch"] }) })] }) })] }, video.id))), tutorialVideos.length === 0 && (_jsxs("div", { className: "col-span-full text-center py-12", children: [_jsx("div", { className: "mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4", children: _jsx(Play, { className: "h-12 w-12 text-muted-foreground" }) }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No tutorial videos yet" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Upload your first tutorial video to get started" }), _jsxs(Button, { onClick: () => setShowVideoUploadForm(true), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Upload Video"] })] }))] })] })) : (
                            // Video Player View
                            _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsxs(Button, { variant: "ghost", onClick: () => setSelectedTutorialVideo(null), className: "flex items-center space-x-2", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), _jsx("span", { children: "Back to Videos" })] }) }), _jsxs("div", { className: "flex gap-6", children: [_jsxs("div", { className: "flex-1 space-y-4", children: [_jsx("div", { className: "relative w-full bg-black rounded-lg overflow-hidden", style: { aspectRatio: '16/9' }, children: _jsxs("video", { controls: true, className: "w-full h-full", poster: selectedTutorialVideo.thumbnailUrl, crossOrigin: "anonymous", onLoadStart: () => {
                                                                // Record view when video starts loading
                                                                apiService.post(`/tutorial-videos/${selectedTutorialVideo.id}/view`, {
                                                                    duration: selectedTutorialVideo.duration
                                                                }).catch(console.error);
                                                            }, children: [_jsx("source", { src: getVideoStreamUrl(selectedTutorialVideo.id), type: "video/mp4" }), "Your browser does not support the video tag."] }) }), _jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold leading-tight", children: selectedTutorialVideo.title }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4 text-sm text-muted-foreground", children: [_jsxs("span", { className: "font-medium", children: [selectedTutorialVideo.viewCount || 0, " views"] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: formatDuration(selectedTutorialVideo.duration || 0) }), _jsx("span", { children: "\u2022" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Star, { className: "h-4 w-4 text-yellow-500" }), _jsx("span", { children: selectedTutorialVideo.rating || 0 })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: "outline", children: selectedTutorialVideo.category }), _jsx(Badge, { variant: "secondary", children: selectedTutorialVideo.difficulty })] })] }), selectedTutorialVideo.description && (_jsx("div", { className: "bg-muted/30 rounded-lg p-4", children: _jsx("p", { className: "text-sm leading-relaxed", children: selectedTutorialVideo.description }) })), selectedTutorialVideo.tags && selectedTutorialVideo.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: selectedTutorialVideo.tags.map((tag, index) => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, index))) }))] })] }), _jsxs("div", { className: "w-80 space-y-4", children: [_jsx("h4", { className: "font-semibold", children: "More Tutorials" }), _jsxs("div", { className: "space-y-3 max-h-[600px] overflow-y-auto", children: [tutorialVideos
                                                                .filter(video => video.id !== selectedTutorialVideo.id)
                                                                .slice(0, 10)
                                                                .map((video) => (_jsxs("div", { className: "flex space-x-3 cursor-pointer hover:bg-muted/50 rounded-lg p-3 transition-colors", onClick: () => setSelectedTutorialVideo(video), children: [_jsxs("div", { className: "relative w-32 h-20 bg-black rounded overflow-hidden flex-shrink-0", children: [video.thumbnailUrl ? (_jsx("img", { src: video.thumbnailUrl, alt: video.title, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center", children: _jsx(Play, { className: "h-6 w-6 text-white" }) })), _jsxs("div", { className: "absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded", children: [Math.floor(video.duration / 60), ":", (video.duration % 60).toString().padStart(2, '0')] })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h5", { className: "font-medium text-sm line-clamp-2 mb-1", children: video.title }), _jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: video.description }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsxs("span", { className: "text-xs text-muted-foreground", children: [video.viewCount || 0, " views"] }), _jsx("span", { className: "text-xs text-muted-foreground", children: "\u2022" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Star, { className: "h-3 w-3 text-yellow-500" }), _jsx("span", { className: "text-xs", children: video.rating || 0 })] })] })] })] }, video.id))), tutorialVideos.length <= 1 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Play, { className: "h-8 w-8 mx-auto mb-2" }), _jsx("p", { className: "text-sm", children: "No other videos available" })] }))] })] })] })] })) }), _jsxs(TabsContent, { value: "chat", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Live Chat Support" }), _jsx("p", { className: "text-muted-foreground", children: "Get instant help from our support team" })] }), _jsxs(Button, { onClick: () => setShowNewChatForm(true), children: [_jsx(MessageSquare, { className: "mr-2 h-4 w-4" }), "Start New Chat"] })] }), _jsxs(Alert, { children: [_jsx(MessageSquare, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Our support team is online and ready to help! Average response time: 2 minutes." })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Start a Conversation" }), _jsx(CardDescription, { children: "Choose a category to begin your chat" })] }), _jsxs(CardContent, { className: "space-y-3", children: [_jsx("div", { className: "p-4 border rounded-lg hover:bg-muted/50 cursor-pointer", onClick: () => {
                                                                setNewChatForm(prev => ({ ...prev, category: 'technical' }));
                                                                setShowNewChatForm(true);
                                                            }, children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-green-100", children: _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Technical Support" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Issues with features or bugs" })] })] }) }), _jsx("div", { className: "p-4 border rounded-lg hover:bg-muted/50 cursor-pointer", onClick: () => {
                                                                setNewChatForm(prev => ({ ...prev, category: 'account' }));
                                                                setShowNewChatForm(true);
                                                            }, children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-blue-100", children: _jsx(HelpCircle, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Account Questions" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Billing, plans, and account settings" })] })] }) }), _jsx("div", { className: "p-4 border rounded-lg hover:bg-muted/50 cursor-pointer", onClick: () => {
                                                                setNewChatForm(prev => ({ ...prev, category: 'training' }));
                                                                setShowNewChatForm(true);
                                                            }, children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-purple-100", children: _jsx(BookOpen, { className: "h-5 w-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Training & Onboarding" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Learn how to use features" })] })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Conversations" }), _jsx(CardDescription, { children: "Your recent chat sessions" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: chatSessions.length > 0 ? (chatSessions.slice(0, 5).map((session) => (_jsx("div", { className: "p-4 border rounded-lg hover:bg-muted/50 cursor-pointer", onClick: () => openChatSession(session.id), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: session.subject }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [session.category, " \u2022 ", new Date(session.lastMessageAt).toLocaleString()] })] }), _jsx(Badge, { variant: session.status === 'open' ? 'default' : 'secondary', children: session.status })] }) }, session.id)))) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No recent conversations. Start a new chat to get help!" })) }) })] })] })] }), _jsxs(TabsContent, { value: "tickets", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Support Tickets" }), _jsxs(Button, { onClick: () => setShowNewTicketForm(true), children: [_jsx(Ticket, { className: "mr-2 h-4 w-4" }), "New Ticket"] })] }), showNewTicketForm && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create New Support Ticket" }), _jsx(CardDescription, { children: "Describe your issue and we'll help you resolve it" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Title *" }), _jsx(Input, { placeholder: "Brief description of your issue", value: newTicket.title, onChange: (e) => setNewTicket({ ...newTicket, title: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Description *" }), _jsx("textarea", { className: "w-full p-3 border rounded-md min-h-[100px]", placeholder: "Please provide detailed information about your issue...", value: newTicket.description, onChange: (e) => setNewTicket({ ...newTicket, description: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Category" }), _jsxs("select", { className: "w-full p-2 border rounded-md", value: newTicket.category, onChange: (e) => setNewTicket({ ...newTicket, category: e.target.value }), children: [_jsx("option", { value: "general", children: "General" }), _jsx("option", { value: "technical", children: "Technical" }), _jsx("option", { value: "billing", children: "Billing" }), _jsx("option", { value: "feature", children: "Feature Request" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Priority" }), _jsxs("select", { className: "w-full p-2 border rounded-md", value: newTicket.priority, onChange: (e) => setNewTicket({ ...newTicket, priority: e.target.value }), children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { onClick: handleCreateTicket, children: "Create Ticket" }), _jsx(Button, { variant: "outline", onClick: () => setShowNewTicketForm(false), children: "Cancel" })] })] })] })), _jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Open Tickets" }), _jsx(Ticket, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: supportTickets.filter(t => t.status === 'open').length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Require attention" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "In Progress" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: supportTickets.filter(t => t.status === 'in-progress').length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Being worked on" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Resolved" }), _jsx(Star, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: supportTickets.filter(t => t.status === 'resolved').length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Successfully closed" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Tickets" }), _jsx(CardDescription, { children: "Your latest support requests" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [supportTickets.slice(0, 5).map((ticket) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-full ${ticket.status === 'resolved' ? 'bg-green-100' :
                                                                            ticket.status === 'in-progress' ? 'bg-yellow-100' : 'bg-blue-100'}`, children: ticket.status === 'resolved' ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : ticket.status === 'in-progress' ? (_jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600" })) : (_jsx(Info, { className: "h-5 w-5 text-blue-600" })) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: ticket.title }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [ticket.ticketNumber, " \u2022 Created ", new Date(ticket.createdAt).toLocaleDateString()] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: ticket.status === 'resolved' ? 'default' :
                                                                            ticket.status === 'in-progress' ? 'secondary' : 'outline', className: ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                                            ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : '', children: ticket.status === 'in-progress' ? 'In Progress' :
                                                                            ticket.status === 'resolved' ? 'Resolved' : 'Open' }), _jsx(Button, { size: "sm", variant: "ghost", children: "View" })] })] }, ticket.id))), supportTickets.length === 0 && (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No support tickets found. Create your first ticket above!" }))] }) })] })] }), _jsxs(TabsContent, { value: "community", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Community Forum" }), _jsx("p", { className: "text-muted-foreground", children: "Connect with other UrutiIQ users and share knowledge" })] }), _jsxs(Button, { onClick: () => setShowNewDiscussionForm(true), children: [_jsx(MessageSquare, { className: "mr-2 h-4 w-4" }), "Start Discussion"] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Discussions" }), _jsx(CardDescription, { children: "Latest community conversations" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: communityDiscussions.length > 0 ? (communityDiscussions.slice(0, 5).map((discussion) => (_jsxs("div", { className: "p-4 border rounded-lg hover:bg-muted/50 cursor-pointer", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("p", { className: "font-medium", children: discussion.title }), discussion.pinned && (_jsx(Badge, { variant: "default", className: "bg-yellow-100 text-yellow-800", children: "Pinned" }))] }), _jsxs(Badge, { variant: "outline", children: [discussion.replies, " replies"] })] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["by ", discussion.userName, " \u2022 ", new Date(discussion.lastActivity).toLocaleDateString()] }), discussion.tags && discussion.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: discussion.tags.slice(0, 3).map((tag, index) => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, index))) }))] }, discussion.id)))) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No community discussions yet. Start the first one!" })) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Community Stats" }), _jsx(CardDescription, { children: "Real-time community metrics" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Active Members" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [communityStats.totalMembers.toLocaleString(), " users"] })] }), _jsx(Users, { className: "h-8 w-8 text-blue-600" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Posts This Month" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [communityStats.postsThisMonth, " discussions"] })] }), _jsx(MessageSquare, { className: "h-8 w-8 text-green-600" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Knowledge Base" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [communityStats.knowledgeBaseArticles, " articles"] })] }), _jsx(BookOpen, { className: "h-8 w-8 text-purple-600" })] })] }), _jsxs("div", { className: "mt-4 space-y-2", children: [_jsxs(Button, { className: "w-full", variant: "outline", children: [_jsx(Users, { className: "mr-2 h-4 w-4" }), "View All Discussions"] }), _jsxs(Button, { className: "w-full", children: [_jsx(MessageSquare, { className: "mr-2 h-4 w-4" }), "Start New Discussion"] })] })] })] })] })] }), _jsxs(TabsContent, { value: "articles", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Article Management" }), _jsx("p", { className: "text-muted-foreground", children: "Create, edit, and manage knowledge base articles" })] }), _jsxs(Dialog, { open: showArticleForm, onOpenChange: (open) => {
                                                setShowArticleForm(open);
                                                if (!open)
                                                    resetArticleForm();
                                            }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Create Article"] }) }), _jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingArticle ? 'Edit Article' : 'Create New Article' }), _jsx(DialogDescription, { children: editingArticle ? 'Update the article details below.' : 'Fill in the details to create a new knowledge base article.' })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "title", children: "Title *" }), _jsx(Input, { id: "title", value: articleForm.title, onChange: (e) => setArticleForm(prev => ({ ...prev, title: e.target.value })), placeholder: "Enter article title" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "category", children: "Category *" }), _jsxs(Select, { value: articleForm.category, onValueChange: (value) => setArticleForm(prev => ({ ...prev, category: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "getting-started", children: "Getting Started" }), _jsx(SelectItem, { value: "accounting", children: "Accounting" }), _jsx(SelectItem, { value: "invoicing", children: "Invoicing" }), _jsx(SelectItem, { value: "troubleshooting", children: "Troubleshooting" }), _jsx(SelectItem, { value: "security", children: "Security" }), _jsx(SelectItem, { value: "expenses", children: "Expenses" }), _jsx(SelectItem, { value: "ai-features", children: "AI Features" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "content", children: "Content *" }), _jsx(Textarea, { id: "content", value: articleForm.content, onChange: (e) => setArticleForm(prev => ({ ...prev, content: e.target.value })), placeholder: "Enter article content", rows: 8 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "tags", children: "Tags" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { id: "tags", value: articleTagInput, onChange: (e) => setArticleTagInput(e.target.value), placeholder: "Enter tag and press Add", onKeyPress: (e) => e.key === 'Enter' && addArticleTag() }), _jsx(Button, { type: "button", variant: "outline", onClick: addArticleTag, children: "Add" })] }), articleForm.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: articleForm.tags.map((tag, index) => (_jsxs(Badge, { variant: "secondary", className: "cursor-pointer", onClick: () => removeArticleTag(tag), children: [tag, " \u00D7"] }, index))) }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "published", checked: articleForm.isPublished, onCheckedChange: (checked) => setArticleForm(prev => ({ ...prev, isPublished: checked })) }), _jsx(Label, { htmlFor: "published", children: "Publish immediately" })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                                                setShowArticleForm(false);
                                                                                resetArticleForm();
                                                                            }, children: "Cancel" }), _jsx(Button, { onClick: editingArticle ? handleUpdateArticle : handleCreateArticle, children: editingArticle ? 'Update Article' : 'Create Article' })] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "All Articles" }), _jsx(CardDescription, { children: "Manage your knowledge base articles" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [knowledgeArticles.map((article) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-blue-100", children: _jsx(FileText, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: article.title }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [article.category, " \u2022 ", article.views.toLocaleString(), " views"] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { variant: article.helpful ? "default" : "secondary", children: [article.helpful ? _jsx(Eye, { className: "h-3 w-3 mr-1" }) : _jsx(EyeOff, { className: "h-3 w-3 mr-1" }), article.helpful ? 'Published' : 'Draft'] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => openEditArticle(article), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Trash2, { className: "h-4 w-4" }) }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete Article" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete \"", article.title, "\"? This action cannot be undone."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: () => handleDeleteArticle(article.id), children: "Delete" })] })] })] })] })] }, article.id))), knowledgeArticles.length === 0 && (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No articles found. Create your first article to get started." }))] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Category Overview" }), _jsx(CardDescription, { children: "View articles by category" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(categoryConfig).map(([category, config]) => {
                                                    const articlesInCategory = knowledgeArticles.filter(article => article.category === category);
                                                    const IconComponent = config.icon;
                                                    return (_jsxs("div", { className: "p-4 border rounded-lg hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx("div", { className: `flex h-8 w-8 items-center justify-center rounded-lg ${colorClasses[config.color]}`, children: _jsx(IconComponent, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: config.title }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [articlesInCategory.length, " articles"] })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-3", children: config.description }), articlesInCategory.length > 0 && (_jsxs("div", { className: "space-y-1", children: [articlesInCategory.slice(0, 3).map((article) => (_jsx("div", { className: "text-sm text-blue-600 hover:text-blue-800 cursor-pointer", children: article.title }, article.id))), articlesInCategory.length > 3 && (_jsxs("div", { className: "text-sm text-muted-foreground", children: ["+", articlesInCategory.length - 3, " more articles"] }))] }))] }, category));
                                                }) }) })] })] }), _jsxs(TabsContent, { value: "video-mgmt", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Tutorial Video Management" }), _jsx("p", { className: "text-muted-foreground", children: "Upload, manage, and stream tutorial videos" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: showVideoUploadForm ? "default" : "outline", onClick: () => setShowVideoUploadForm(!showVideoUploadForm), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), showVideoUploadForm ? 'Hide Upload' : 'Upload Video'] }), _jsxs(Button, { variant: "outline", onClick: () => loadTutorialVideos(), children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Refresh"] })] })] }), showVideoUploadForm && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: editingVideo ? 'Edit Tutorial Video' : 'Upload New Tutorial Video' }), _jsx(CardDescription, { children: editingVideo ? 'Update the video details below.' : 'Upload a video file and provide details.' })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "video-title", children: "Title *" }), _jsx(Input, { id: "video-title", value: videoForm.title, onChange: (e) => setVideoForm(prev => ({ ...prev, title: e.target.value })), placeholder: "Enter video title", disabled: isUploadingVideo })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "video-duration", children: "Duration (seconds)" }), _jsx(Input, { id: "video-duration", type: "number", value: videoForm.duration, onChange: (e) => setVideoForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 })), placeholder: "e.g., 300" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "video-description", children: "Description" }), _jsx(Textarea, { id: "video-description", value: videoForm.description, onChange: (e) => setVideoForm(prev => ({ ...prev, description: e.target.value })), placeholder: "Describe what this video covers...", className: "min-h-[100px]" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "video-category", children: "Category *" }), _jsxs(Select, { value: videoForm.category, onValueChange: (value) => setVideoForm(prev => ({ ...prev, category: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "general", children: "General" }), _jsx(SelectItem, { value: "onboarding", children: "Onboarding" }), _jsx(SelectItem, { value: "feature-guide", children: "Feature Guide" }), _jsx(SelectItem, { value: "troubleshooting", children: "Troubleshooting" }), _jsx(SelectItem, { value: "accounting", children: "Accounting" }), _jsx(SelectItem, { value: "reporting", children: "Reporting" }), _jsx(SelectItem, { value: "invoicing", children: "Invoicing" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "video-difficulty", children: "Difficulty *" }), _jsxs(Select, { value: videoForm.difficulty, onValueChange: (value) => setVideoForm(prev => ({ ...prev, difficulty: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select difficulty" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "beginner", children: "Beginner" }), _jsx(SelectItem, { value: "intermediate", children: "Intermediate" }), _jsx(SelectItem, { value: "advanced", children: "Advanced" })] })] })] })] }), _jsxs("div", { className: "hidden", children: [_jsx(Label, { htmlFor: "video-thumbnail", children: "Thumbnail URL" }), _jsx(Input, { id: "video-thumbnail", value: videoForm.thumbnailUrl, onChange: (e) => setVideoForm(prev => ({ ...prev, thumbnailUrl: e.target.value })), placeholder: "https://example.com/thumbnail.jpg" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "video-tags", children: "Tags" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { value: videoTagInput, onChange: (e) => setVideoTagInput(e.target.value), placeholder: "Add a tag", onKeyPress: (e) => e.key === 'Enter' && (e.preventDefault(), addVideoTag()) }), _jsx(Button, { type: "button", variant: "outline", onClick: addVideoTag, children: "Add" })] }), videoForm.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: videoForm.tags.map((tag, index) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [tag, _jsx("button", { onClick: () => removeVideoTag(tag), className: "ml-1 hover:bg-gray-300 rounded-full p-0.5", children: "\u00D7" })] }, index))) }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "video-published", checked: videoForm.isPublished, onCheckedChange: (checked) => setVideoForm(prev => ({ ...prev, isPublished: checked })) }), _jsx(Label, { htmlFor: "video-published", children: "Publish immediately" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "video-file", children: "Video File *" }), _jsx(Input, { id: "video-file", type: "file", accept: "video/*", onChange: (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        // Auto-fill duration if not set
                                                                        if (videoForm.duration === 0) {
                                                                            // You could use a library to get video duration, but for now we'll leave it manual
                                                                            setVideoForm(prev => ({ ...prev, duration: 0 }));
                                                                        }
                                                                    }
                                                                }, className: "mt-1", disabled: isUploadingVideo })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                                    setShowVideoUploadForm(false);
                                                                    resetVideoForm();
                                                                }, disabled: isUploadingVideo, children: "Cancel" }), _jsx(Button, { variant: "outline", onClick: () => {
                                                                    const fileInput = document.getElementById('video-file');
                                                                    const file = fileInput.files?.[0];
                                                                    if (file) {
                                                                        testUpload(file);
                                                                    }
                                                                    else {
                                                                        toast({
                                                                            title: "Error",
                                                                            description: "Please select a video file",
                                                                            variant: "destructive"
                                                                        });
                                                                    }
                                                                }, disabled: isUploadingVideo, children: "Test Upload" }), _jsx(Button, { onClick: () => {
                                                                    const fileInput = document.getElementById('video-file');
                                                                    const file = fileInput.files?.[0];
                                                                    if (file) {
                                                                        handleUploadTutorialVideo(file);
                                                                    }
                                                                    else {
                                                                        toast({
                                                                            title: "Error",
                                                                            description: "Please select a video file",
                                                                            variant: "destructive"
                                                                        });
                                                                    }
                                                                }, disabled: isUploadingVideo, children: isUploadingVideo ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Uploading..."] })) : (editingVideo ? 'Update Video' : 'Upload Video') })] })] }) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: ["Tutorial Videos (", tutorialVideos.length, ")"] }), _jsx(CardDescription, { children: "Manage your uploaded tutorial videos" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [tutorialVideos.map((video) => (_jsxs("div", { className: "flex items-center space-x-4 p-4 border rounded-lg", children: [_jsxs("div", { className: "flex-shrink-0", children: [video.thumbnailUrl ? (_jsx("img", { src: video.thumbnailUrl, alt: video.title, className: "w-20 h-12 object-cover rounded", onError: (e) => {
                                                                            const target = e.target;
                                                                            target.style.display = 'none';
                                                                            const nextElement = target.nextElementSibling;
                                                                            if (nextElement) {
                                                                                nextElement.style.display = 'flex';
                                                                            }
                                                                        } })) : null, _jsx("div", { className: "w-20 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-medium", style: { display: video.thumbnailUrl ? 'none' : 'flex' }, children: _jsx(Play, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-medium text-sm truncate", children: video.title }), _jsx("p", { className: "text-xs text-muted-foreground truncate", children: video.description }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: video.category }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: video.difficulty }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatDuration(video.duration) }), video.rating && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Star, { className: "h-3 w-3 text-yellow-500 fill-current" }), _jsxs("span", { className: "text-xs", children: [video.rating.toFixed(1), " (", video.ratingCount, ")"] })] }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                            setSelectedTutorialVideo(video);
                                                                            setActiveTab("tutorials");
                                                                        }, children: [_jsx(Play, { className: "h-3 w-3 mr-1" }), "Play"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                            setEditingVideo(video);
                                                                            setVideoForm({
                                                                                title: video.title,
                                                                                description: video.description || '',
                                                                                category: video.category,
                                                                                difficulty: video.difficulty,
                                                                                duration: video.duration,
                                                                                thumbnailUrl: video.thumbnailUrl || '',
                                                                                tags: video.tags || [],
                                                                                isPublished: video.isPublished
                                                                            });
                                                                            setShowVideoUploadForm(true);
                                                                        }, children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Trash2, { className: "h-3 w-3" }) }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete Video" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete \"", video.title, "\"? This action cannot be undone."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: () => handleDeleteTutorialVideo(video.id), children: "Delete" })] })] })] })] })] }, video.id))), tutorialVideos.length === 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Play, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No tutorial videos yet" }), _jsx("p", { className: "text-sm mb-4", children: "Upload your first tutorial video to get started" }), _jsxs(Button, { onClick: () => setShowVideoUploadForm(true), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Upload Your First Video"] })] }))] }) })] })] }), _jsx(Dialog, { open: showArticleViewer, onOpenChange: setShowArticleViewer, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: selectedArticle?.title }), _jsxs(DialogDescription, { children: [selectedArticle?.category, " \u2022 ", selectedArticle?.views.toLocaleString(), " views"] })] }), _jsxs("div", { className: "space-y-4", children: [selectedArticle && (_jsxs("div", { className: "prose max-w-none", children: [_jsx("div", { className: "whitespace-pre-wrap text-sm leading-relaxed", children: selectedArticle.content }), selectedArticle.tags && selectedArticle.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mt-6 pt-4 border-t", children: selectedArticle.tags.map((tag, index) => (_jsx(Badge, { variant: "secondary", children: tag }, index))) }))] })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", onClick: () => setShowArticleViewer(false), children: "Close" }) })] })] }) }), _jsx(Dialog, { open: showTutorialViewer, onOpenChange: setShowTutorialViewer, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: selectedTutorial?.title }), _jsxs(DialogDescription, { children: [selectedTutorial?.category, " \u2022 ", selectedTutorial?.difficulty, " \u2022 ", selectedTutorial?.duration] })] }), _jsxs("div", { className: "space-y-4", children: [selectedTutorial && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Star, { className: "h-4 w-4 text-yellow-500" }), _jsxs("span", { className: "text-sm", children: [selectedTutorial.rating, " (", selectedTutorial.reviewCount, " reviews)"] })] }), _jsx(Badge, { variant: "outline", children: selectedTutorial.category }), _jsx(Badge, { variant: "secondary", children: selectedTutorial.difficulty })] }), _jsxs("div", { className: "prose max-w-none", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Description" }), _jsx("p", { className: "text-sm leading-relaxed mb-4", children: selectedTutorial.description }), selectedTutorial.content && (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Content" }), _jsx("div", { className: "whitespace-pre-wrap text-sm leading-relaxed", children: selectedTutorial.content })] }))] }), selectedTutorial.videoUrl && (_jsx("div", { className: "pt-4 border-t", children: _jsxs(Button, { onClick: () => {
                                                                setShowTutorialViewer(false);
                                                                openVideo(selectedTutorial);
                                                            }, className: "w-full", children: [_jsx(Play, { className: "mr-2 h-4 w-4" }), "Watch Video"] }) }))] })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", onClick: () => setShowTutorialViewer(false), children: "Close" }) })] })] }) }), _jsx(Dialog, { open: showVideoModal, onOpenChange: setShowVideoModal, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-hidden", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: selectedVideo?.title }) }), _jsxs("div", { className: "space-y-4", children: [selectedVideo && (_jsx("div", { className: "aspect-video bg-black rounded-lg overflow-hidden", children: selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be') ? (
                                                // YouTube embed
                                                _jsx("iframe", { src: selectedVideo.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/'), title: selectedVideo.title, className: "w-full h-full", allowFullScreen: true })) : selectedVideo.url.includes('vimeo.com') ? (
                                                // Vimeo embed
                                                _jsx("iframe", { src: selectedVideo.url.replace('vimeo.com/', 'player.vimeo.com/video/'), title: selectedVideo.title, className: "w-full h-full", allowFullScreen: true })) : (
                                                // Direct video file or other URL
                                                _jsx("div", { className: "w-full h-full flex items-center justify-center bg-gray-900", children: _jsxs("div", { className: "text-center text-white", children: [_jsx(Play, { className: "h-16 w-16 mx-auto mb-4" }), _jsx("p", { className: "text-lg mb-2", children: "Video not embeddable" }), _jsx("p", { className: "text-sm text-gray-300 mb-4", children: "Click below to open in new tab" }), _jsxs(Button, { onClick: () => openExternalVideo(selectedVideo.url), className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(ExternalLink, { className: "mr-2 h-4 w-4" }), "Open Video"] })] }) })) })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", onClick: () => setShowVideoModal(false), children: "Close" }) })] })] }) }), showNewChatForm && (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "fixed inset-0 bg-black/50", onClick: () => setShowNewChatForm(false) }), _jsx("div", { className: "relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Start New Chat Session" }), _jsx("button", { onClick: () => setShowNewChatForm(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsx("p", { className: "text-gray-600 mb-6", children: "Create a new chat session to get help from our support team" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "chat-category", children: "Category *" }), _jsxs(Select, { value: newChatForm.category, onValueChange: (value) => setNewChatForm(prev => ({ ...prev, category: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "technical", children: "Technical Support" }), _jsx(SelectItem, { value: "account", children: "Account Questions" }), _jsx(SelectItem, { value: "training", children: "Training & Onboarding" }), _jsx(SelectItem, { value: "billing", children: "Billing & Payments" }), _jsx(SelectItem, { value: "feature", children: "Feature Request" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "chat-subject", children: "Subject *" }), _jsx(Input, { id: "chat-subject", value: newChatForm.subject, onChange: (e) => setNewChatForm(prev => ({ ...prev, subject: e.target.value })), placeholder: "Brief description of your issue" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "chat-priority", children: "Priority" }), _jsxs(Select, { value: newChatForm.priority, onValueChange: (value) => setNewChatForm(prev => ({ ...prev, priority: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setShowNewChatForm(false), children: "Cancel" }), _jsx(Button, { onClick: createChatSession, children: "Start Chat" })] })] })] }) })] })), _jsx(Dialog, { open: showChatModal, onOpenChange: setShowChatModal, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] flex flex-col", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: activeChatSession?.subject }), _jsxs(DialogDescription, { children: [activeChatSession?.category, " \u2022 ", activeChatSession?.priority, " priority"] })] }), _jsxs("div", { className: "flex-1 flex flex-col space-y-4", children: [_jsx("div", { className: "flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20", children: chatMessages.length > 0 ? (chatMessages.map((message) => (_jsx("div", { className: `flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[70%] p-3 rounded-lg ${message.senderType === 'user'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white border'}`, children: [_jsx("p", { className: "text-sm", children: message.message }), _jsxs("p", { className: `text-xs mt-1 ${message.senderType === 'user' ? 'text-blue-100' : 'text-muted-foreground'}`, children: [message.senderName, " \u2022 ", new Date(message.timestamp).toLocaleString()] })] }) }, message.id)))) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No messages yet. Start the conversation!" })) }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: "Type your message...", onKeyPress: (e) => e.key === 'Enter' && sendMessage() }), _jsx(Button, { onClick: sendMessage, disabled: !newMessage.trim(), children: "Send" })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", onClick: () => activeChatSession && closeChatSession(activeChatSession.id), children: "Close Chat" }) })] })] }) }), _jsx(Dialog, { open: showNewDiscussionForm, onOpenChange: (open) => {
                                setShowNewDiscussionForm(open);
                                if (!open)
                                    resetDiscussionForm();
                            }, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Start New Discussion" }), _jsx(DialogDescription, { children: "Share your thoughts and connect with the community" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "discussion-title", children: "Title *" }), _jsx(Input, { id: "discussion-title", value: newDiscussionForm.title, onChange: (e) => setNewDiscussionForm(prev => ({ ...prev, title: e.target.value })), placeholder: "What's your discussion about?" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "discussion-category", children: "Category" }), _jsxs(Select, { value: newDiscussionForm.category, onValueChange: (value) => setNewDiscussionForm(prev => ({ ...prev, category: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "general", children: "General Discussion" }), _jsx(SelectItem, { value: "accounting", children: "Accounting" }), _jsx(SelectItem, { value: "reporting", children: "Reporting" }), _jsx(SelectItem, { value: "invoicing", children: "Invoicing" }), _jsx(SelectItem, { value: "support", children: "Support" }), _jsx(SelectItem, { value: "feature-request", children: "Feature Request" }), _jsx(SelectItem, { value: "tips", children: "Tips & Tricks" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "discussion-content", children: "Content *" }), _jsx(Textarea, { id: "discussion-content", value: newDiscussionForm.content, onChange: (e) => setNewDiscussionForm(prev => ({ ...prev, content: e.target.value })), placeholder: "Share your thoughts, ask questions, or provide helpful information...", className: "min-h-[120px]" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "discussion-tags", children: "Tags (optional)" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { value: tagInput, onChange: (e) => setTagInput(e.target.value), placeholder: "Add a tag", onKeyPress: (e) => e.key === 'Enter' && (e.preventDefault(), addTag()) }), _jsx(Button, { type: "button", variant: "outline", onClick: addTag, children: "Add" })] }), newDiscussionForm.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: newDiscussionForm.tags.map((tag, index) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [tag, _jsx("button", { type: "button", onClick: () => removeTag(tag), className: "ml-1 hover:text-destructive", children: "\u00D7" })] }, index))) }))] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowNewDiscussionForm(false), children: "Cancel" }), _jsx(Button, { onClick: createDiscussion, children: "Create Discussion" })] })] })] }) }), _jsx(Dialog, { open: showArticleViewer, onOpenChange: setShowArticleViewer, children: _jsxs(DialogContent, { className: "max-w-6xl w-[95vw] max-h-[95vh] flex flex-col", children: [_jsx(DialogHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowArticleViewer(false), children: _jsx(ArrowLeft, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-xl", children: selectedArticle?.title }), _jsxs(DialogDescription, { className: "flex items-center space-x-4 mt-1", children: [_jsxs("span", { className: "flex items-center space-x-1", children: [_jsx(Eye, { className: "h-4 w-4" }), _jsxs("span", { children: [selectedArticle?.views.toLocaleString(), " views"] })] }), _jsxs("span", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsxs("span", { children: ["Updated ", selectedArticle?.lastUpdated ? new Date(selectedArticle.lastUpdated).toLocaleDateString() : 'Recently'] })] }), _jsx(Badge, { variant: "outline", className: `${colorClasses[categoryConfig[selectedArticle?.category]?.color] || 'bg-gray-100 text-gray-600'}`, children: categoryConfig[selectedArticle?.category]?.title || selectedArticle?.category })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Star, { className: "h-4 w-4 mr-1" }), "Helpful"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(ExternalLink, { className: "h-4 w-4 mr-1" }), "Share"] })] })] }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "prose prose-sm max-w-none p-6", children: [selectedArticle?.tags && selectedArticle.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mb-6 not-prose", children: selectedArticle.tags.map((tag, index) => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, index))) })), _jsx("div", { className: "whitespace-pre-wrap leading-relaxed", children: selectedArticle?.content }), _jsxs("div", { className: "flex items-center justify-between pt-6 mt-6 border-t not-prose", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Button, { variant: selectedArticle?.helpful ? "default" : "outline", size: "sm", onClick: () => markArticleHelpful(selectedArticle?.id), children: [_jsx(Star, { className: "h-4 w-4 mr-1" }), selectedArticle?.helpful ? 'Marked Helpful' : 'Mark as Helpful'] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(MessageSquare, { className: "h-4 w-4 mr-1" }), "Ask Question"] })] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Was this article helpful?" })] })] }) })] }) }), _jsx(Dialog, { open: showTutorialViewer, onOpenChange: setShowTutorialViewer, children: _jsxs(DialogContent, { className: "max-w-6xl max-h-[90vh] flex flex-col", children: [_jsx(DialogHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowTutorialViewer(false), children: _jsx(ArrowLeft, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-xl", children: selectedTutorial?.title }), _jsxs(DialogDescription, { className: "flex items-center space-x-4 mt-1", children: [_jsxs("span", { className: "flex items-center space-x-1", children: [_jsx(Play, { className: "h-4 w-4" }), _jsx("span", { children: selectedTutorial?.duration })] }), _jsxs("span", { className: "flex items-center space-x-1", children: [_jsx(Star, { className: "h-4 w-4" }), _jsxs("span", { children: [selectedTutorial?.rating, "/5 (", selectedTutorial?.reviewCount, " reviews)"] })] }), _jsx(Badge, { variant: "outline", className: `${colorClasses[categoryConfig[selectedTutorial?.category]?.color] || 'bg-gray-100 text-gray-600'}`, children: categoryConfig[selectedTutorial?.category]?.title || selectedTutorial?.category }), _jsx(Badge, { variant: selectedTutorial?.difficulty === 'beginner' ? 'default' : selectedTutorial?.difficulty === 'intermediate' ? 'secondary' : 'destructive', children: selectedTutorial?.difficulty })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Star, { className: "h-4 w-4 mr-1" }), "Rate"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(ExternalLink, { className: "h-4 w-4 mr-1" }), "Share"] })] })] }) }), _jsxs("div", { className: "flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "aspect-video bg-black rounded-lg flex items-center justify-center", children: selectedTutorial?.videoUrl ? (_jsxs("video", { controls: true, className: "w-full h-full rounded-lg", poster: selectedTutorial?.thumbnail, children: [_jsx("source", { src: selectedTutorial.videoUrl, type: "video/mp4" }), "Your browser does not support the video tag."] })) : (_jsxs("div", { className: "text-white text-center", children: [_jsx(Play, { className: "h-16 w-16 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "Video not available" })] })) }), selectedTutorial?.progress !== undefined && (_jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground mb-2", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [selectedTutorial.progress, "% complete"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${selectedTutorial.progress}%` } }) })] }))] }), _jsx("div", { className: "lg:w-80 flex flex-col", children: _jsxs("div", { className: "flex-1 overflow-y-auto space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "Description" }), _jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: selectedTutorial?.description || 'No description available.' })] }), selectedTutorial?.content && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "Additional Notes" }), _jsx("div", { className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap", children: selectedTutorial.content })] })), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsxs(Button, { variant: selectedTutorial?.completed ? "default" : "outline", size: "sm", className: "flex-1 mr-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), selectedTutorial?.completed ? 'Completed' : 'Mark Complete'] }), _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Star, { className: "h-4 w-4" }) })] })] }) })] })] }) })] })] }) }));
}
