import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { PageLayout } from '../components/page-layout';
import { useToast } from '../hooks/use-toast';
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
  Send,
  Phone,
  Mail,
  Zap,
  Shield,
  Settings,
  Video,
  Download,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Calendar,
  ArrowRight,
  Filter,
  ChevronRight,
  Globe,
  Headphones,
  LifeBuoy,
  MessageCircle,
  Activity,
  CreditCard,
  Briefcase
} from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  ticketNumber: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  views: number;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  lastUpdated: string;
  estimatedReadTime: number;
}

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
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isSubmitTicketOpen, setIsSubmitTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState<{
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>({
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-8 border-b border-indigo-100">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6">
              <LifeBuoy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support Center</h1>
            <p className="text-xl text-gray-600 mb-8">
              Get the help you need, when you need it. Our comprehensive support resources are here to assist you.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search for help articles, tutorials, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-indigo-200 focus:border-indigo-500 rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 h-14 p-1 bg-gray-100 rounded-xl">
              <TabsTrigger value="overview" className="text-sm font-medium">Overview</TabsTrigger>
              <TabsTrigger value="knowledge-base" className="text-sm font-medium">Knowledge Base</TabsTrigger>
              <TabsTrigger value="tutorials" className="text-sm font-medium">Tutorials</TabsTrigger>
              <TabsTrigger value="support" className="text-sm font-medium">Get Support</TabsTrigger>
              <TabsTrigger value="my-tickets" className="text-sm font-medium">My Tickets</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickActions.map((action, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                            <p className="text-gray-600 text-sm">{action.description}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Popular FAQs */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Popular Questions</h2>
                  <Button variant="outline">View All FAQs</Button>
                </div>
                <div className="grid gap-4">
                  {popularFAQs.map((faq) => (
                    <Card key={faq.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{faq.answer}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{faq.helpful}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{faq.views}</span>
                              </div>
                              <Badge variant="secondary" className="capitalize">
                                {supportCategories.find(cat => cat.id === faq.category)?.name}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Support Categories */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {supportCategories.map((category) => (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 bg-${category.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                          <category.icon className={`w-8 h-8 text-${category.color}-600`} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">Find articles and guides related to {category.name.toLowerCase()}</p>
                        <Button variant="outline" size="sm">
                          Explore <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Knowledge Base Tab */}
            <TabsContent value="knowledge-base" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Knowledge Base</h2>
                <div className="flex items-center space-x-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {supportCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                {/* Sample knowledge base articles */}
                {[
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
                ].map((article, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                          <p className="text-gray-600 mb-4">{article.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{article.readTime} min read</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{article.views} views</span>
                            </div>
                            <Badge variant="secondary">
                              {supportCategories.find(cat => cat.id === article.category)?.name}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tutorials Tab */}
            <TabsContent value="tutorials" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Video Tutorials</h2>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
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
                ].map((tutorial, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                        {tutorial.duration}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{tutorial.views} views</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {tutorial.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Get Support Tab */}
            <TabsContent value="support" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Get Support</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose the best way to get help. Our support team is available through multiple channels to assist you.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-${method.color}-100 rounded-xl flex items-center justify-center`}>
                          <method.icon className={`w-6 h-6 text-${method.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                          <p className="text-gray-600 mb-4">{method.description}</p>
                          <div className="space-y-2 text-sm text-gray-500 mb-4">
                            <div className="flex justify-between">
                              <span>Availability:</span>
                              <span>{method.availability}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Response Time:</span>
                              <span>{method.responseTime}</span>
                            </div>
                          </div>
                          <Button className="w-full">
                            {method.action}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Submit Ticket Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Submit a Support Ticket
                  </CardTitle>
                  <CardDescription>
                    Describe your issue in detail and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticket-title">Subject</Label>
                      <Input
                        id="ticket-title"
                        placeholder="Brief description of your issue"
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-category">Category</Label>
                      <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({...ticketForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ticket-priority">Priority</Label>
                    <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({...ticketForm, priority: value as 'low' | 'medium' | 'high' | 'urgent'})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-description">Description</Label>
                    <Textarea
                      id="ticket-description"
                      placeholder="Please provide as much detail as possible about your issue..."
                      rows={6}
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitTicket}
                    disabled={!ticketForm.title || !ticketForm.description || !ticketForm.category}
                    className="w-full md:w-auto"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Ticket
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Tickets Tab */}
            <TabsContent value="my-tickets" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Support Tickets</h2>
                <Button onClick={() => setIsSubmitTicketOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </div>

              {tickets.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No support tickets</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't submitted any support tickets yet.
                    </p>
                    <Button onClick={() => setIsSubmitTicketOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{ticket.title}</h3>
                              <Badge variant={
                                ticket.status === 'open' ? 'default' :
                                ticket.status === 'in-progress' ? 'secondary' :
                                ticket.status === 'resolved' ? 'secondary' : 'outline'
                              }>
                                {ticket.status}
                              </Badge>
                              <Badge variant={
                                ticket.priority === 'urgent' ? 'destructive' :
                                ticket.priority === 'high' ? 'default' :
                                ticket.priority === 'medium' ? 'secondary' : 'outline'
                              }>
                                {ticket.priority}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>#{ticket.ticketNumber}</span>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {supportCategories.find(cat => cat.id === ticket.category)?.name}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
