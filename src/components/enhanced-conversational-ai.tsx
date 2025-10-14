import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { ScrollArea } from "../components/ui/scroll-area"
import { Separator } from "../components/ui/separator"
import { Progress } from "../components/ui/progress"
import { useToast } from "../components/ui/use-toast"
import { useDemoAuth } from "../hooks/useDemoAuth"
import apiService from "../lib/api"
import { AITransactionCategorization } from "../components/ai-transaction-categorization"
import { AINaturalLanguageReports } from "../components/ai-natural-language-reports"
import { AICashFlowForecasting } from "../components/ai-cash-flow-forecasting"
import { AIConfigurationManager } from "../components/ai-configuration-manager"
import { ConversationalParser } from "../components/conversational-parser"
import { 
  Send, 
  MessageCircle, 
  Brain, 
  Languages, 
  Settings, 
  History, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  User,
  Zap,
  Lightbulb,
  BarChart3,
  FileText,
  Download,
  Bot,
  Sparkles,
  Target,
  Activity,
  Globe,
  Shield,
  Star,
  ArrowRight,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Info,
  HelpCircle,
  BookOpen,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  Edit,
  Trash2,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Home,
  Users,
  CreditCard,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  DollarSign as Dollar,
  Percent,
  Calculator,
  Receipt,
  File,
  Folder,
  Archive,
  Tag,
  Hash,
  AtSign,
  Hash as HashIcon,
  Link,
  Image,
  Video,
  Music,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  MessageSquare
} from "lucide-react"

interface EnhancedConversationalAIProps {
  companyId?: string
}

export function EnhancedConversationalAI({ companyId = "demo-company" }: EnhancedConversationalAIProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState<Array<{
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: Date
    type?: "text" | "suggestion" | "error"
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { ready: authReady } = useDemoAuth('enhanced-conversational-ai')
  const [aiMode, setAiMode] = useState("enhanced")
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [examples, setExamples] = useState<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Load examples on component mount
  useEffect(() => {
    if (!authReady) return
    
    const loadExamples = async () => {
      try {
        const response = await apiService.get('/enhanced-conversational-ai/examples')
        setExamples(response.data)
      } catch (error) {
        console.error('Failed to load examples:', error)
      }
    }
    loadExamples()
  }, [authReady])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: inputText,
      role: "user" as const,
      timestamp: new Date(),
      type: "text" as const
    }

    setMessages(prev => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    try {
      const response = await apiService.post('/enhanced-conversational-ai/chat', {
        text: inputText,
        companyId,
        mode: aiMode
      })
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data?.data?.response || response.data?.data?.message || "I received your message but couldn't process it properly.",
        role: "assistant" as const,
        timestamp: new Date(),
        type: "text" as const
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant" as const,
        timestamp: new Date(),
        type: "error" as const
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderExamples = () => {
    if (!examples) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 rounded-full w-fit mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-[#009688] animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading example phrases...</p>
        </div>
      </div>
    )

    return (
      <div className="space-y-6">
        {examples.categories?.map((category: any, index: number) => (
          <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold">{category.name}</span>
                  <p className="text-sm text-muted-foreground font-normal">Click any example to try it</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {category.examples?.map((example: string, exampleIndex: number) => (
                  <div
                    key={exampleIndex}
                    className="p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-[#009688]/5 hover:to-[#1565c0]/5 transition-all duration-200 border border-gray-200/50 hover:border-[#009688]/30 group"
                    onClick={() => {
                      setInputText(example)
                      setActiveTab('chat')
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-lg group-hover:scale-110 transition-transform duration-200">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-[#009688] transition-colors duration-200">
                          {example}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to use this example
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Additional Help Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#009688]/5 to-[#1565c0]/5">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="p-3 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-full w-fit mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Need More Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The AI assistant understands natural language. Try describing your transactions in your own words!
              </p>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('chat')}
                className="border-[#009688]/30 text-[#009688] hover:bg-[#009688]/10"
              >
                Start Chatting
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#009688] to-[#1565c0] text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Bot className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight"> Conversational AI</h1>
                    <p className="text-blue-100 text-lg">
                      Powered by Llama 3.1 - Your intelligent financial assistant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI-Powered
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Brain className="w-4 h-4 mr-2" />
                    Natural Language
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Shield className="w-4 h-4 mr-2" />
                    Secure
                  </Badge>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <div className="text-center">
                    <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-3">
                      <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">AI Assistant Status</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">Online & Ready</span>
                    </div>
                    <p className="text-xs text-blue-100">
                      Processing requests in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="px-6 pt-6 pb-2">
            {/* Primary Navigation */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">AI Assistant Features</h3>
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#009688] to-[#1565c0] text-white rounded-full text-sm font-medium">
                  <Sparkles className="w-3 h-3" />
                  Llama 3.1
                </div>
              </div>
              <TabsList className="flex w-full bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 p-1 rounded-xl border border-[#009688]/20 shadow-sm">
                <TabsTrigger 
                  value="chat" 
                  className={`flex items-center gap-2 py-3 px-4 gap-2 ${activeTab === 'chat' ? 'bg-white text-[#009688] shadow-md' : 'text-gray-600 hover:text-[#009688]'}`}
                >
                  <div className="p-1.5 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-lg">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className={`flex items-center gap-1 py-2 px-3 gap-1 whitespace-nowrap ${activeTab === 'insights' ? 'bg-white text-[#009688] shadow-md' : 'text-gray-600 hover:text-[#009688]'}`}
                >
                  <Brain className="w-4 h-4" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger 
                  value="stats" 
                  className={`flex items-center gap-1 py-2 px-3 gap-1 whitespace-nowrap ${activeTab === 'stats' ? 'bg-white text-[#009688] shadow-md' : 'text-gray-600 hover:text-[#009688]'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Stats
                </TabsTrigger>
                <TabsTrigger 
                  value="categorization" 
                  className={`flex items-center gap-1 py-2 px-3 gap-1 whitespace-nowrap ${activeTab === 'categorization' ? 'bg-white text-[#009688] shadow-md' : 'text-gray-600 hover:text-[#009688]'}`}
                >
                  <Target className="w-4 h-4" />
                  Auto Categorize
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className={`flex items-center gap-1 py-2 px-3 gap-1 whitespace-nowrap ${activeTab === 'reports' ? 'bg-white text-[#009688] shadow-md' : 'text-gray-600 hover:text-[#009688]'}`}
                >
                  <FileText className="w-4 h-4" />
                  Smart Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="parser" 
                  className={`flex items-center gap-1 py-2 px-3 gap-1 whitespace-nowrap ${activeTab === 'parser' ? 'bg-white text-[#009688] shadow-md' : 'text-gray-600 hover:text-[#009688]'}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Transaction Parser
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 border-b">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-lg">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-lg font-bold">AI Chat Assistant</span>
                        <p className="text-sm text-muted-foreground font-normal">Ask me anything about your finances</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Messages */}
                    <ScrollArea className="h-96 p-6">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="p-4 bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 rounded-full w-fit mx-auto mb-4">
                            <Bot className="w-8 h-8 text-[#009688]" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Enhanced AI Assistant</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            I'm powered by Llama 3.1 and can help you with:
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Auto Categorization
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Smart Reports
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Cash Flow Forecast
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Fraud Detection
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Transaction Parser
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              AI Insights
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-4 rounded-2xl ${
                                  message.role === 'user'
                                    ? 'bg-gradient-to-r from-[#009688] to-[#1565c0] text-white'
                                    : message.type === 'error'
                                    ? 'bg-red-50 text-red-800 border border-red-200'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-2">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          {isLoading && (
                            <div className="flex justify-start">
                              <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                    
                    {/* Input Area */}
                    <div className="p-6 border-t bg-gray-50/50">
                      <div className="flex gap-3">
                        <Textarea
                          ref={textareaRef}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your finances..."
                          className="flex-1 min-h-[60px] resize-none border-gray-200 focus:border-[#009688] focus:ring-[#009688]"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputText.trim() || isLoading}
                          className="px-6 bg-gradient-to-r from-[#009688] to-[#1565c0] hover:from-[#009688]/90 hover:to-[#1565c0]/90 text-white border-0"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Examples */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 border-b">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold">Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('categorization')}
                        className="w-full justify-start border-[#009688]/30 text-[#009688] hover:bg-[#009688]/10"
                      >
                        <Target className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">AI Categorization</div>
                          <div className="text-xs text-muted-foreground">Auto-categorize transactions</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('reports')}
                        className="w-full justify-start border-[#009688]/30 text-[#009688] hover:bg-[#009688]/10"
                      >
                        <FileText className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Smart Reports</div>
                          <div className="text-xs text-muted-foreground">Generate insights</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('forecasting')}
                        className="w-full justify-start border-[#009688]/30 text-[#009688] hover:bg-[#009688]/10"
                      >
                        <TrendingUp className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Cash Flow Forecast</div>
                          <div className="text-xs text-muted-foreground">Predict future trends</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('parser')}
                        className="w-full justify-start border-[#009688]/30 text-[#009688] hover:bg-[#009688]/10"
                      >
                        <MessageSquare className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Transaction Parser</div>
                          <div className="text-xs text-muted-foreground">Natural language to journal entries</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Examples */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 border-b">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-lg">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold">Example Phrases</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ScrollArea className="h-64">
                      {renderExamples()}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold">AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 rounded-full w-fit mx-auto mb-4">
                    <Brain className="w-8 h-8 text-[#009688]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Insights Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI insights and analytics will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-[#009688] to-[#1565c0] rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold">Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-r from-[#009688]/10 to-[#1565c0]/10 rounded-full w-fit mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-[#009688]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Statistics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed statistics and analytics will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categorization Tab */}
          <TabsContent value="categorization" className="space-y-6">
            <AITransactionCategorization />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <AINaturalLanguageReports />
          </TabsContent>

          {/* Parser Tab */}
          <TabsContent value="parser" className="space-y-6">
            <ConversationalParser companyId={companyId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
