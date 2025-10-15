import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog"
import { PageLayout } from "../components/page-layout"
import { apiService } from "../lib/api"
import { useToast } from "../hooks/use-toast"
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Ticket,
  Search,
  ExternalLink,
  Star,
  Clock,
  Users,
  FileText,
  Play,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react"

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

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  views: number;
  lastUpdated: Date;
  helpful: boolean;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  ticketNumber: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: string;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  videoUrl: string;
  content?: string;
  isPublished?: boolean;
  completed: boolean;
  progress: number;
}

interface CommunityDiscussion {
  id: string;
  title: string;
  author: string;
  userName: string;
  replies: number;
  views: number;
  lastActivity: Date;
  category: string;
  tags: string[];
  pinned: boolean;
}

interface TutorialVideo {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  duration: number;
  thumbnailUrl?: string;
  downloadUrl: string;
  isPublished: boolean;
  viewCount: number;
  rating?: number;
  ratingCount: number;
  tags?: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export default function HelpPage() {
  const { toast } = useToast();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory] = useState('all');
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [communityDiscussions, setCommunityDiscussions] = useState<CommunityDiscussion[]>([]);
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    postsThisMonth: 0,
    knowledgeBaseArticles: 0
  });

  // Tutorial Video Management State
  const [tutorialVideos, setTutorialVideos] = useState<TutorialVideo[]>([]);
  const [showVideoUploadForm, setShowVideoUploadForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TutorialVideo | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'beginner',
    duration: 0,
    thumbnailUrl: '',
    tags: [] as string[],
    isPublished: false
  });
  const [videoTagInput, setVideoTagInput] = useState('');
  const [selectedTutorialVideo, setSelectedTutorialVideo] = useState<TutorialVideo | null>(null);
  const [activeTab, setActiveTab] = useState("knowledge");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [loading, setLoading] = useState(false);

  // New ticket form state
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  // Article management state
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    isPublished: false
  });
  const [articleTagInput, setArticleTagInput] = useState('');


  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{url: string, title: string} | null>(null);

  // Article viewer state
  const [showArticleViewer, setShowArticleViewer] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Tutorial viewer state
  const [showTutorialViewer, setShowTutorialViewer] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  // Live chat state
  const [showChatModal, setShowChatModal] = useState(false);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [activeChatSession, setActiveChatSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [newChatForm, setNewChatForm] = useState({
    category: '',
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  // Community discussion form state
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [newDiscussionForm, setNewDiscussionForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[]
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
    } catch (error) {
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
    } catch (error) {
      console.error('Error loading knowledge articles:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load support tickets
  const loadSupportTickets = async () => {
    try {
      const response = await apiService.get('/help/tickets');
      setSupportTickets(response.tickets || []);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "Error",
        description: "Failed to update knowledge article",
        variant: "destructive"
      });
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await apiService.delete(`/help/knowledge/articles/${articleId}`);
      toast({
        title: "Success",
        description: "Knowledge article deleted successfully"
      });
      loadAllArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge article",
        variant: "destructive"
      });
    }
  };

  const openEditArticle = (article: KnowledgeArticle) => {
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

  const removeArticleTag = (tagToRemove: string) => {
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
  const openVideo = (tutorial: Tutorial) => {
    if (tutorial.videoUrl) {
      setSelectedVideo({ url: tutorial.videoUrl, title: tutorial.title });
      setShowVideoModal(true);
    } else {
      toast({
        title: "No Video Available",
        description: "This tutorial doesn't have a video URL configured.",
        variant: "destructive"
      });
    }
  };

  const openExternalVideo = (url: string) => {
    window.open(url, '_blank');
  };

  // Tutorial Video Management Functions
  const loadTutorialVideos = async () => {
    try {
      const response = await fetch('https://urutiq-backend-clean-af6v.onrender.com/api/tutorial-videos', {
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
      const videosWithParsedTags = (result.data || []).map((video: any) => ({
        ...video,
        tags: video.tags ? (typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags) : []
      }));
      
      setTutorialVideos(videosWithParsedTags);
    } catch (error) {
      console.error('Error loading tutorial videos:', error);
      toast({
        title: "Error",
        description: "Failed to load tutorial videos",
        variant: "destructive"
      });
    }
  };

  const testUpload = async (file: File) => {
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

      const response = await fetch('https://urutiq-backend-clean-af6v.onrender.com/test-upload', {
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
    } catch (error) {
      console.error('Test upload error:', error);
      toast({
        title: "Test Upload Error",
        description: "Failed to test upload",
        variant: "destructive"
      });
    }
  };

  const handleUploadTutorialVideo = async (file: File) => {
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
        const response = await fetch('https://urutiq-backend-clean-af6v.onrender.com/api/tutorial-videos/upload', {
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
    } catch (error) {
      console.error('Error uploading tutorial video:', error);
      toast({
        title: "Error",
        description: "Failed to upload tutorial video",
        variant: "destructive"
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDeleteTutorialVideo = async (videoId: string) => {
    try {
      await apiService.delete(`/tutorial-videos/${videoId}`);
      toast({
        title: "Success",
        description: "Tutorial video deleted successfully"
      });
      loadTutorialVideos();
    } catch (error) {
      console.error('Error deleting tutorial video:', error);
      toast({
        title: "Error",
        description: "Failed to delete tutorial video",
        variant: "destructive"
      });
    }
  };

  const openTutorialVideoPlayer = (video: TutorialVideo) => {
    setSelectedTutorialVideo(video);
  };

  // Function to get video stream URL with proper headers
  const getVideoStreamUrl = (videoId: string) => {
    const tenantId = localStorage.getItem('tenant_id') || 'tenant_demo';
    const companyId = localStorage.getItem('company_id') || 'cmg0qxjh9003nao3ftbaz1oc1';
    const token = localStorage.getItem('auth_token') || '';
    
    return `https://urutiq-backend-clean-af6v.onrender.com/api/tutorial-videos/stream/${videoId}?tenantId=${tenantId}&companyId=${companyId}&token=${token}`;
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

  const removeVideoTag = (tag: string) => {
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Article and tutorial viewer functions
  const openArticleViewer = async (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setShowArticleViewer(true);
    
    // Track article view
    try {
      console.log('Tracking view for article:', article.id);
      const response = await apiService.post(`/help/knowledge/articles/${article.id}/view`);
      console.log('View tracking response:', response);
      
      // Update local state to increment view count
      setKnowledgeArticles(prev => 
        prev.map(a => a.id === article.id ? { ...a, views: a.views + 1 } : a)
      );
      
      console.log('Updated article views in local state');
    } catch (error) {
      console.error('Error tracking article view:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const openTutorialViewer = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setShowTutorialViewer(true);
  };

  // Mark article as helpful
  const markArticleHelpful = async (articleId?: string) => {
    if (!articleId) return;
    
    try {
      await apiService.post(`/help/knowledge/articles/${articleId}/helpful`);
      // Update local state
      setKnowledgeArticles(prev => 
        prev.map(a => a.id === articleId ? { ...a, helpful: true } : a)
      );
      setSelectedArticle(prev => 
        prev ? { ...prev, helpful: true } : prev
      );
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our knowledge base."
      });
    } catch (error) {
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
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const loadChatMessages = async (sessionId: string) => {
    try {
      const response = await apiService.get(`/help/chat/sessions/${sessionId}/messages`);
      setChatMessages(response.messages || []);
    } catch (error) {
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
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive"
      });
    }
  };

  const openChatSession = async (sessionId: string) => {
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
      } else {
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
    } catch (error) {
      console.error('Error opening chat session:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatSession) return;

    try {
      await apiService.post(`/help/chat/sessions/${activeChatSession.id}/messages`, {
        message: newMessage.trim(),
        messageType: 'text'
      });
      setNewMessage('');
      await loadChatMessages(activeChatSession.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const closeChatSession = async (sessionId: string) => {
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
    } catch (error) {
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
    } catch (error) {
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

  const removeTag = (tagToRemove: string) => {
    setNewDiscussionForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const resetDiscussionForm = () => {
    setNewDiscussionForm({ title: '', content: '', category: 'general', tags: [] });
    setTagInput('');
  };

  return (
    <PageLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
            <p className="text-muted-foreground">Get help, learn features, and access support resources</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button>
              <Ticket className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap w-full gap-2 h-auto ml-0 pl-0">
            <TabsTrigger value="knowledge" className="flex-shrink-0 px-4 py-2">Knowledge Base</TabsTrigger>
            <TabsTrigger value="tutorials" className="flex-shrink-0 px-4 py-2">Tutorials</TabsTrigger>
            <TabsTrigger value="chat" className="flex-shrink-0 px-4 py-2">Live Chat</TabsTrigger>
            <TabsTrigger value="tickets" className="flex-shrink-0 px-4 py-2">Support Tickets</TabsTrigger>
            <TabsTrigger value="community" className="flex-shrink-0 px-4 py-2">Community</TabsTrigger>
            <TabsTrigger value="articles" className="flex-shrink-0 px-4 py-2">Article Management</TabsTrigger>
            <TabsTrigger value="video-mgmt" className="flex-shrink-0 px-4 py-2">Video Management</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="space-y-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                // Group articles by category
                const categoryGroups = knowledgeArticles.reduce((groups, article) => {
                  const category = article.category;
                  if (!groups[category]) {
                    groups[category] = [];
                  }
                  groups[category].push(article);
                  return groups;
                }, {} as Record<string, KnowledgeArticle[]>);

                return Object.entries(categoryGroups).map(([category, articles]) => {
                  const config = categoryConfig[category as keyof typeof categoryConfig];
                  if (!config) return null;

                  const IconComponent = config.icon;

                  return (
                    <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[config.color as keyof typeof colorClasses]}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{config.title}</CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {articles.slice(0, 3).map((article) => (
                            <div 
                              key={article.id} 
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => openArticleViewer(article)}
                            >
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">{article.title}</span>
                                <span className="text-xs text-muted-foreground truncate block">
                                  {article.content.substring(0, 50)}...
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 ml-2">
                                <Badge variant="outline" className="text-xs">{article.views.toLocaleString()} views</Badge>
                                <Eye className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                          {articles.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{articles.length - 3} more articles
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }).filter(Boolean);
              })()}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Popular Articles</CardTitle>
                <CardDescription>Most viewed help articles this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeArticles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <Star className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="text-sm text-muted-foreground">{article.content.substring(0, 60)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{article.views.toLocaleString()} views</Badge>
                        <Button variant="outline" size="sm" onClick={() => openArticleViewer(article)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                  {knowledgeArticles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No articles found. Try searching for something else.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            {!selectedTutorialVideo ? (
              // Video Grid View
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Tutorial Videos</h2>
                    <p className="text-muted-foreground">Watch and learn from our tutorial videos</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => loadTutorialVideos()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tutorialVideos.map((video) => (
                    <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openTutorialVideoPlayer(video)}>
                      <div className="relative">
                        {video.thumbnailUrl ? (
                          <div className="aspect-video rounded-t-lg overflow-hidden">
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to gradient if thumbnail fails to load
                                e.currentTarget.style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center hidden">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-black/50 text-white">
                          <Clock className="mr-1 h-3 w-3" />
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </Badge>
                        {video.downloadUrl && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 rounded-full p-3">
                              <Play className="h-8 w-8 text-blue-600" />
                            </div>
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription>{video.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{video.rating || 0} ({video.viewCount || 0} views)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openTutorialVideoPlayer(video)}>
                              <Play className="mr-2 h-4 w-4" />
                              Watch
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tutorialVideos.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Play className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No tutorial videos yet</h3>
                      <p className="text-muted-foreground mb-4">Upload your first tutorial video to get started</p>
                      <Button onClick={() => setShowVideoUploadForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Video
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Video Player View
              <div className="space-y-6">
                {/* Back Button */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedTutorialVideo(null)}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Videos</span>
                  </Button>
                </div>

                <div className="flex gap-6">
                  {/* Main Video Area */}
                  <div className="flex-1 space-y-4">
                    {/* Video Player */}
                    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <video
                        controls
                        className="w-full h-full"
                        poster={selectedTutorialVideo.thumbnailUrl}
                        crossOrigin="anonymous"
                        onLoadStart={() => {
                          // Record view when video starts loading
                          apiService.post(`/tutorial-videos/${selectedTutorialVideo.id}/view`, {
                            duration: selectedTutorialVideo.duration
                          }).catch(console.error);
                        }}
                      >
                        <source 
                          src={getVideoStreamUrl(selectedTutorialVideo.id)} 
                          type="video/mp4" 
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    {/* Video Info - YouTube Style */}
                    <div className="space-y-4">
                      {/* Title */}
                      <h1 className="text-2xl font-bold leading-tight">{selectedTutorialVideo.title}</h1>
                      
                      {/* Video Stats and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="font-medium">{selectedTutorialVideo.viewCount || 0} views</span>
                          <span>•</span>
                          <span>{formatDuration(selectedTutorialVideo.duration || 0)}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{selectedTutorialVideo.rating || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{selectedTutorialVideo.category}</Badge>
                          <Badge variant="secondary">{selectedTutorialVideo.difficulty}</Badge>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {selectedTutorialVideo.description && (
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm leading-relaxed">{selectedTutorialVideo.description}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {selectedTutorialVideo.tags && selectedTutorialVideo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedTutorialVideo.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Sidebar */}
                  <div className="w-80 space-y-4">
                    <h4 className="font-semibold">More Tutorials</h4>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {tutorialVideos
                        .filter(video => video.id !== selectedTutorialVideo.id)
                        .slice(0, 10)
                        .map((video) => (
                        <div
                          key={video.id}
                          className="flex space-x-3 cursor-pointer hover:bg-muted/50 rounded-lg p-3 transition-colors"
                          onClick={() => setSelectedTutorialVideo(video)}
                        >
                          <div className="relative w-32 h-20 bg-black rounded overflow-hidden flex-shrink-0">
                            {video.thumbnailUrl ? (
                              <img 
                                src={video.thumbnailUrl} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-muted-foreground">{video.viewCount || 0} views</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs">{video.rating || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {tutorialVideos.length <= 1 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Play className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">No other videos available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Live Chat Support</h2>
                <p className="text-muted-foreground">Get instant help from our support team</p>
              </div>
              <Button onClick={() => setShowNewChatForm(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </div>

            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Our support team is online and ready to help! Average response time: 2 minutes.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Start a Conversation</CardTitle>
                  <CardDescription>Choose a category to begin your chat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => {
                    setNewChatForm(prev => ({ ...prev, category: 'technical' }));
                    setShowNewChatForm(true);
                  }}>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Technical Support</p>
                        <p className="text-sm text-muted-foreground">Issues with features or bugs</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => {
                    setNewChatForm(prev => ({ ...prev, category: 'account' }));
                    setShowNewChatForm(true);
                  }}>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Account Questions</p>
                        <p className="text-sm text-muted-foreground">Billing, plans, and account settings</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => {
                    setNewChatForm(prev => ({ ...prev, category: 'training' }));
                    setShowNewChatForm(true);
                  }}>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Training & Onboarding</p>
                        <p className="text-sm text-muted-foreground">Learn how to use features</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversations</CardTitle>
                  <CardDescription>Your recent chat sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chatSessions.length > 0 ? (
                      chatSessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => openChatSession(session.id)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{session.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.category} • {new Date(session.lastMessageAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No recent conversations. Start a new chat to get help!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Support Tickets</h2>
              <Button onClick={() => setShowNewTicketForm(true)}>
                <Ticket className="mr-2 h-4 w-4" />
                New Ticket
              </Button>
            </div>

            {/* New Ticket Form Modal */}
            {showNewTicketForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Support Ticket</CardTitle>
                  <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <textarea
                      className="w-full p-3 border rounded-md min-h-[100px]"
                      placeholder="Please provide detailed information about your issue..."
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="feature">Feature Request</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateTicket}>
                      Create Ticket
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewTicketForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supportTickets.filter(t => t.status === 'open').length}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supportTickets.filter(t => t.status === 'in-progress').length}</div>
                  <p className="text-xs text-muted-foreground">Being worked on</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supportTickets.filter(t => t.status === 'resolved').length}</div>
                  <p className="text-xs text-muted-foreground">Successfully closed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
                <CardDescription>Your latest support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          ticket.status === 'resolved' ? 'bg-green-100' :
                          ticket.status === 'in-progress' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          {ticket.status === 'resolved' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : ticket.status === 'in-progress' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Info className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{ticket.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {ticket.ticketNumber} • Created {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          ticket.status === 'resolved' ? 'default' :
                          ticket.status === 'in-progress' ? 'secondary' : 'outline'
                        } className={
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : ''
                        }>
                          {ticket.status === 'in-progress' ? 'In Progress' : 
                           ticket.status === 'resolved' ? 'Resolved' : 'Open'}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                  {supportTickets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No support tickets found. Create your first ticket above!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Community Forum</h2>
                <p className="text-muted-foreground">Connect with other UrutiIQ users and share knowledge</p>
              </div>
              <Button onClick={() => setShowNewDiscussionForm(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Discussion
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Discussions</CardTitle>
                  <CardDescription>Latest community conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {communityDiscussions.length > 0 ? (
                      communityDiscussions.slice(0, 5).map((discussion) => (
                        <div key={discussion.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{discussion.title}</p>
                              {discussion.pinned && (
                                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                  Pinned
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline">{discussion.replies} replies</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            by {discussion.userName} • {new Date(discussion.lastActivity).toLocaleDateString()}
                          </p>
                          {discussion.tags && discussion.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {discussion.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No community discussions yet. Start the first one!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Stats</CardTitle>
                  <CardDescription>Real-time community metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Active Members</p>
                        <p className="text-sm text-muted-foreground">{communityStats.totalMembers.toLocaleString()} users</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Posts This Month</p>
                        <p className="text-sm text-muted-foreground">{communityStats.postsThisMonth} discussions</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Knowledge Base</p>
                        <p className="text-sm text-muted-foreground">{communityStats.knowledgeBaseArticles} articles</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button className="w-full" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      View All Discussions
                    </Button>
                    <Button className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start New Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Article Management</h2>
                <p className="text-muted-foreground">Create, edit, and manage knowledge base articles</p>
              </div>
              <Dialog open={showArticleForm} onOpenChange={(open) => {
                setShowArticleForm(open);
                if (!open) resetArticleForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingArticle ? 'Edit Article' : 'Create New Article'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingArticle ? 'Update the article details below.' : 'Fill in the details to create a new knowledge base article.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={articleForm.title}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter article title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={articleForm.category} onValueChange={(value) => setArticleForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="getting-started">Getting Started</SelectItem>
                          <SelectItem value="accounting">Accounting</SelectItem>
                          <SelectItem value="invoicing">Invoicing</SelectItem>
                          <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="expenses">Expenses</SelectItem>
                          <SelectItem value="ai-features">AI Features</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={articleForm.content}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter article content"
                        rows={8}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="tags"
                          value={articleTagInput}
                          onChange={(e) => setArticleTagInput(e.target.value)}
                          placeholder="Enter tag and press Add"
                          onKeyPress={(e) => e.key === 'Enter' && addArticleTag()}
                        />
                        <Button type="button" variant="outline" onClick={addArticleTag}>
                          Add
                        </Button>
                      </div>
                      {articleForm.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {articleForm.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArticleTag(tag)}>
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={articleForm.isPublished}
                        onCheckedChange={(checked) => setArticleForm(prev => ({ ...prev, isPublished: checked }))}
                      />
                      <Label htmlFor="published">Publish immediately</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setShowArticleForm(false);
                        resetArticleForm();
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={editingArticle ? handleUpdateArticle : handleCreateArticle}>
                        {editingArticle ? 'Update Article' : 'Create Article'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Articles</CardTitle>
                <CardDescription>Manage your knowledge base articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeArticles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {article.category} • {article.views.toLocaleString()} views
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={article.helpful ? "default" : "secondary"}>
                          {article.helpful ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          {article.helpful ? 'Published' : 'Draft'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => openEditArticle(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{article.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteArticle(article.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {knowledgeArticles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No articles found. Create your first article to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Overview</CardTitle>
                <CardDescription>View articles by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(categoryConfig).map(([category, config]) => {
                    const articlesInCategory = knowledgeArticles.filter(article => article.category === category);
                    const IconComponent = config.icon;
                    
                    return (
                      <div key={category} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClasses[config.color as keyof typeof colorClasses]}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium">{config.title}</h3>
                            <p className="text-sm text-muted-foreground">{articlesInCategory.length} articles</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
                        {articlesInCategory.length > 0 && (
                          <div className="space-y-1">
                            {articlesInCategory.slice(0, 3).map((article) => (
                              <div key={article.id} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                                {article.title}
                              </div>
                            ))}
                            {articlesInCategory.length > 3 && (
                              <div className="text-sm text-muted-foreground">
                                +{articlesInCategory.length - 3} more articles
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Video Management Tab */}
          <TabsContent value="video-mgmt" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Tutorial Video Management</h2>
                <p className="text-muted-foreground">Upload, manage, and stream tutorial videos</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={showVideoUploadForm ? "default" : "outline"}
                  onClick={() => setShowVideoUploadForm(!showVideoUploadForm)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {showVideoUploadForm ? 'Hide Upload' : 'Upload Video'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadTutorialVideos()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
            {/* Video Upload Form */}
            {showVideoUploadForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingVideo ? 'Edit Tutorial Video' : 'Upload New Tutorial Video'}</CardTitle>
                  <CardDescription>{editingVideo ? 'Update the video details below.' : 'Upload a video file and provide details.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="video-title">Title *</Label>
                        <Input
                          id="video-title"
                          value={videoForm.title}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter video title"
                          disabled={isUploadingVideo}
                        />
                      </div>
                      <div>
                        <Label htmlFor="video-duration">Duration (seconds)</Label>
                        <Input
                          id="video-duration"
                          type="number"
                          value={videoForm.duration}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                          placeholder="e.g., 300"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="video-description">Description</Label>
                      <Textarea
                        id="video-description"
                        value={videoForm.description}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this video covers..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="video-category">Category *</Label>
                        <Select value={videoForm.category} onValueChange={(value) => setVideoForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="onboarding">Onboarding</SelectItem>
                            <SelectItem value="feature-guide">Feature Guide</SelectItem>
                            <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                            <SelectItem value="accounting">Accounting</SelectItem>
                            <SelectItem value="reporting">Reporting</SelectItem>
                            <SelectItem value="invoicing">Invoicing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="video-difficulty">Difficulty *</Label>
                        <Select value={videoForm.difficulty} onValueChange={(value) => setVideoForm(prev => ({ ...prev, difficulty: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="hidden">
                      <Label htmlFor="video-thumbnail">Thumbnail URL</Label>
                      <Input
                        id="video-thumbnail"
                        value={videoForm.thumbnailUrl}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-tags">Tags</Label>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Input
                            value={videoTagInput}
                            onChange={(e) => setVideoTagInput(e.target.value)}
                            placeholder="Add a tag"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoTag())}
                          />
                          <Button type="button" variant="outline" onClick={addVideoTag}>
                            Add
                          </Button>
                        </div>
                        {videoForm.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {videoForm.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <button
                                  onClick={() => removeVideoTag(tag)}
                                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="video-published"
                        checked={videoForm.isPublished}
                        onCheckedChange={(checked) => setVideoForm(prev => ({ ...prev, isPublished: checked }))}
                      />
                      <Label htmlFor="video-published">Publish immediately</Label>
                    </div>
                    <div>
                      <Label htmlFor="video-file">Video File *</Label>
                      <Input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Auto-fill duration if not set
                            if (videoForm.duration === 0) {
                              // You could use a library to get video duration, but for now we'll leave it manual
                              setVideoForm(prev => ({ ...prev, duration: 0 }));
                            }
                          }
                        }}
                        className="mt-1"
                        disabled={isUploadingVideo}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowVideoUploadForm(false);
                          resetVideoForm();
                        }}
                        disabled={isUploadingVideo}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const fileInput = document.getElementById('video-file') as HTMLInputElement;
                          const file = fileInput.files?.[0];
                          if (file) {
                            testUpload(file);
                          } else {
                            toast({
                              title: "Error",
                              description: "Please select a video file",
                              variant: "destructive"
                            });
                          }
                        }}
                        disabled={isUploadingVideo}
                      >
                        Test Upload
                      </Button>
                      <Button 
                        onClick={() => {
                          const fileInput = document.getElementById('video-file') as HTMLInputElement;
                          const file = fileInput.files?.[0];
                          if (file) {
                            handleUploadTutorialVideo(file);
                          } else {
                            toast({
                              title: "Error",
                              description: "Please select a video file",
                              variant: "destructive"
                            });
                          }
                        }}
                        disabled={isUploadingVideo}
                      >
                        {isUploadingVideo ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          editingVideo ? 'Update Video' : 'Upload Video'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video List */}
            <Card>
              <CardHeader>
                <CardTitle>Tutorial Videos ({tutorialVideos.length})</CardTitle>
                <CardDescription>Manage your uploaded tutorial videos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tutorialVideos.map((video) => (
                    <div key={video.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const nextElement = target.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="w-20 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-medium" style={{ display: video.thumbnailUrl ? 'none' : 'flex' }}>
                          <Play className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{video.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{video.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">{video.category}</Badge>
                          <Badge variant="secondary" className="text-xs">{video.difficulty}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDuration(video.duration)}</span>
                          {video.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{video.rating.toFixed(1)} ({video.ratingCount})</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTutorialVideo(video);
                            setActiveTab("tutorials");
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
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
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Video</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{video.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTutorialVideo(video.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {tutorialVideos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No tutorial videos yet</h3>
                      <p className="text-sm mb-4">Upload your first tutorial video to get started</p>
                      <Button onClick={() => setShowVideoUploadForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Your First Video
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
      

        {/* Article Viewer Modal */}
        <Dialog open={showArticleViewer} onOpenChange={setShowArticleViewer}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedArticle?.title}</DialogTitle>
              <DialogDescription>
                {selectedArticle?.category} • {selectedArticle?.views.toLocaleString()} views
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedArticle && (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedArticle.content}
                  </div>
                  {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                      {selectedArticle.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowArticleViewer(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tutorial Viewer Modal */}
        <Dialog open={showTutorialViewer} onOpenChange={setShowTutorialViewer}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTutorial?.title}</DialogTitle>
              <DialogDescription>
                {selectedTutorial?.category} • {selectedTutorial?.difficulty} • {selectedTutorial?.duration}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTutorial && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{selectedTutorial.rating} ({selectedTutorial.reviewCount} reviews)</span>
                    </div>
                    <Badge variant="outline">{selectedTutorial.category}</Badge>
                    <Badge variant="secondary">{selectedTutorial.difficulty}</Badge>
                  </div>
                  
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-sm leading-relaxed mb-4">{selectedTutorial.description}</p>
                    
                    {selectedTutorial.content && (
                      <>
                        <h3 className="text-lg font-semibold mb-2">Content</h3>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {selectedTutorial.content}
                        </div>
                      </>
                    )}
                  </div>

                  {selectedTutorial.videoUrl && (
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => {
                          setShowTutorialViewer(false);
                          openVideo(selectedTutorial);
                        }}
                        className="w-full"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Watch Video
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowTutorialViewer(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Player Modal */}
        <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedVideo && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be') ? (
                    // YouTube embed
                    <iframe
                      src={selectedVideo.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : selectedVideo.url.includes('vimeo.com') ? (
                    // Vimeo embed
                    <iframe
                      src={selectedVideo.url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    // Direct video file or other URL
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center text-white">
                        <Play className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-lg mb-2">Video not embeddable</p>
                        <p className="text-sm text-gray-300 mb-4">Click below to open in new tab</p>
                        <Button 
                          onClick={() => openExternalVideo(selectedVideo.url)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Video
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowVideoModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Chat Form Modal */}
        {showNewChatForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewChatForm(false)} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Start New Chat Session</h2>
                  <button
                    onClick={() => setShowNewChatForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">Create a new chat session to get help from our support team</p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chat-category">Category *</Label>
                    <Select value={newChatForm.category} onValueChange={(value) => setNewChatForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="account">Account Questions</SelectItem>
                        <SelectItem value="training">Training & Onboarding</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="chat-subject">Subject *</Label>
                    <Input
                      id="chat-subject"
                      value={newChatForm.subject}
                      onChange={(e) => setNewChatForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chat-priority">Priority</Label>
                    <Select value={newChatForm.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setNewChatForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowNewChatForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createChatSession}>
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{activeChatSession?.subject}</DialogTitle>
              <DialogDescription>
                {activeChatSession?.category} • {activeChatSession?.priority} priority
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 flex flex-col space-y-4">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
                {chatMessages.length > 0 ? (
                  chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderType === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderType === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                        }`}>
                          {message.senderName} • {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  Send
                </Button>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => activeChatSession && closeChatSession(activeChatSession.id)}
                >
                  Close Chat
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Discussion Form Modal */}
        <Dialog open={showNewDiscussionForm} onOpenChange={(open) => {
          setShowNewDiscussionForm(open);
          if (!open) resetDiscussionForm();
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start New Discussion</DialogTitle>
              <DialogDescription>Share your thoughts and connect with the community</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="discussion-title">Title *</Label>
                <Input
                  id="discussion-title"
                  value={newDiscussionForm.title}
                  onChange={(e) => setNewDiscussionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What's your discussion about?"
                />
              </div>
              <div>
                <Label htmlFor="discussion-category">Category</Label>
                <Select value={newDiscussionForm.category} onValueChange={(value) => setNewDiscussionForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Discussion</SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="reporting">Reporting</SelectItem>
                    <SelectItem value="invoicing">Invoicing</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="feature-request">Feature Request</SelectItem>
                    <SelectItem value="tips">Tips & Tricks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discussion-content">Content *</Label>
                <Textarea
                  id="discussion-content"
                  value={newDiscussionForm.content}
                  onChange={(e) => setNewDiscussionForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, ask questions, or provide helpful information..."
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="discussion-tags">Tags (optional)</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  {newDiscussionForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newDiscussionForm.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewDiscussionForm(false)}>
                  Cancel
                </Button>
                <Button onClick={createDiscussion}>
                  Create Discussion
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Article Viewer Modal */}
        <Dialog open={showArticleViewer} onOpenChange={setShowArticleViewer}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" onClick={() => setShowArticleViewer(false)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle className="text-xl">{selectedArticle?.title}</DialogTitle>
                    <DialogDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{selectedArticle?.views.toLocaleString()} views</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Updated {selectedArticle?.lastUpdated ? new Date(selectedArticle.lastUpdated).toLocaleDateString() : 'Recently'}</span>
                      </span>
                      <Badge variant="outline" className={`${colorClasses[categoryConfig[selectedArticle?.category as keyof typeof categoryConfig]?.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-600'}`}>
                        {categoryConfig[selectedArticle?.category as keyof typeof categoryConfig]?.title || selectedArticle?.category}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-1" />
                    Helpful
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <div className="prose prose-sm max-w-none p-6">
                {/* Tags */}
                {selectedArticle?.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 not-prose">
                    {selectedArticle.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Article Content */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {selectedArticle?.content}
                </div>
                
                {/* Article Actions */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t not-prose">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant={selectedArticle?.helpful ? "default" : "outline"} 
                      size="sm"
                      onClick={() => markArticleHelpful(selectedArticle?.id)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      {selectedArticle?.helpful ? 'Marked Helpful' : 'Mark as Helpful'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Ask Question
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Was this article helpful?
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tutorial Viewer Modal */}
        <Dialog open={showTutorialViewer} onOpenChange={setShowTutorialViewer}>
          <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" onClick={() => setShowTutorialViewer(false)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle className="text-xl">{selectedTutorial?.title}</DialogTitle>
                    <DialogDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center space-x-1">
                        <Play className="h-4 w-4" />
                        <span>{selectedTutorial?.duration}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{selectedTutorial?.rating}/5 ({selectedTutorial?.reviewCount} reviews)</span>
                      </span>
                      <Badge variant="outline" className={`${colorClasses[categoryConfig[selectedTutorial?.category as keyof typeof categoryConfig]?.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-600'}`}>
                        {categoryConfig[selectedTutorial?.category as keyof typeof categoryConfig]?.title || selectedTutorial?.category}
                      </Badge>
                      <Badge variant={selectedTutorial?.difficulty === 'beginner' ? 'default' : selectedTutorial?.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                        {selectedTutorial?.difficulty}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-1" />
                    Rate
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
              {/* Video Player */}
              <div className="flex-1">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  {selectedTutorial?.videoUrl ? (
                    <video 
                      controls 
                      className="w-full h-full rounded-lg"
                      poster={selectedTutorial?.thumbnail}
                    >
                      <source src={selectedTutorial.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-white text-center">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Video not available</p>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                {selectedTutorial?.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Progress</span>
                      <span>{selectedTutorial.progress}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${selectedTutorial.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tutorial Info */}
              <div className="lg:w-80 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedTutorial?.description || 'No description available.'}
                    </p>
                  </div>
                  
                  {selectedTutorial?.content && (
                    <div>
                      <h3 className="font-semibold mb-2">Additional Notes</h3>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedTutorial.content}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button 
                      variant={selectedTutorial?.completed ? "default" : "outline"} 
                      size="sm"
                      className="flex-1 mr-2"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {selectedTutorial?.completed ? 'Completed' : 'Mark Complete'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        </Tabs>
      </div>
    </PageLayout>
  )
}
