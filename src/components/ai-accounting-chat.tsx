import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Sparkles,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Volume2,
  VolumeX
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiService from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    action?: 'create_invoice' | 'create_expense' | 'create_customer' | 'generate_report' | 'analyze_data'
    confidence?: number
    entities?: Array<{
      type: 'customer' | 'amount' | 'date' | 'item' | 'account' | 'category'
      value: string
      confidence: number
    }>
    suggestions?: Array<{
      text: string
      action: string
      confidence: number
    }>
  }
}

interface AIAccountingChatProps {
  onActionExecuted?: (action: string, result: any) => void
}

export function AIAccountingChat({ onActionExecuted }: AIAccountingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Get user's companies
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiService.getCompanies(),
    enabled: !!user
  })

  // Get financial insights
  const { data: insights } = useQuery({
    queryKey: ['financial-insights', selectedCompanyId],
    queryFn: () => apiService.getFinancialInsights(selectedCompanyId),
    enabled: !!selectedCompanyId
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { message: string; companyId: string; sessionId?: string; conversationHistory?: ChatMessage[] }) =>
      apiService.sendChatMessage(data),
    onSuccess: (response) => {
      if (response.success) {
        // Add user message
        const userMessage: ChatMessage = {
          id: `user_${Date.now()}`,
          role: 'user',
          content: response.response.message,
          timestamp: new Date()
        }

        // Add AI response
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: response.response.message,
          timestamp: new Date(),
          metadata: {
            action: response.response.action?.type,
            confidence: response.response.action?.confidence,
            suggestions: response.response.suggestions
          }
        }

        setMessages(prev => [...prev, userMessage, aiMessage])
        setInputMessage('')
        
        // Speak the response
        if (response.response.message) {
          speakText(response.response.message)
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message')
    }
  })

  // Execute action mutation
  const executeActionMutation = useMutation({
    mutationFn: (action: { type: "create_invoice" | "create_expense" | "create_customer" | "generate_report" | "analyze_data"; data: any }) =>
      apiService.executeChatAction(action),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message)
        onActionExecuted?.(response.result?.type || 'unknown', response.result)
        queryClient.invalidateQueries({ queryKey: ['invoices'] })
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        queryClient.invalidateQueries({ queryKey: ['customers'] })
      } else {
        toast.error(response.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to execute action')
    }
  })

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: (companyId: string) => apiService.startChatSession(companyId),
    onSuccess: (response) => {
      if (response.success) {
        setSessionId(response.sessionId)
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: `welcome_${Date.now()}`,
          role: 'assistant',
          content: `Hi! I'm your AI accounting assistant. I can help you with invoices, expenses, customers, reports, and answer any financial questions. What would you like to do today?`,
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start session')
    }
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start session when company is selected
  useEffect(() => {
    if (selectedCompanyId && !sessionId) {
      startSessionMutation.mutate(selectedCompanyId)
    }
  }, [selectedCompanyId])

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedCompanyId || !sessionId) {
      toast.error('Please select a company and enter a message')
      return
    }

    sendMessageMutation.mutate({
      message: inputMessage.trim(),
      companyId: selectedCompanyId,
      sessionId,
      conversationHistory: messages
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: { text: string; action: string; confidence: number }) => {
    setInputMessage(suggestion.text)
  }

  const handleActionClick = (action: { type: "create_invoice" | "create_expense" | "create_customer" | "generate_report" | "analyze_data"; data: any }) => {
    executeActionMutation.mutate(action)
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
      }
      
      recognition.start()
    } else {
      toast.error('Speech recognition not supported in this browser')
    }
  }

  const getMessageIcon = (role: string) => {
    switch (role) {
      case 'user': return <User className="w-4 h-4" />
      case 'assistant': return <Bot className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create_invoice': return <FileText className="w-4 h-4" />
      case 'create_expense': return <DollarSign className="w-4 h-4" />
      case 'create_customer': return <Users className="w-4 h-4" />
      case 'generate_report': return <BarChart3 className="w-4 h-4" />
      case 'analyze_data': return <TrendingUp className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Accounting Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="company">Select Company</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a company to chat with AI" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.data?.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowInsights(!showInsights)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {showInsights ? 'Hide' : 'Show'} Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Insights */}
      {showInsights && insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Financial Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${insights.insights.financialSummary.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  ${insights.insights.financialSummary.totalExpenses.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Expenses</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${insights.insights.financialSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${insights.insights.financialSummary.netIncome.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Net Income</div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">AI Recommendations</Label>
              <div className="space-y-2 mt-2">
                {insights.insights.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span className="text-sm text-blue-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat with AI Assistant
            </span>
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <Button variant="outline" size="sm" onClick={stopSpeaking}>
                  <VolumeX className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => speakText(messages[messages.length - 1]?.content || '')}>
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role !== 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {getMessageIcon(message.role)}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getMessageIcon(message.role)}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1]?.metadata?.suggestions && (
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Quick Actions</Label>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1]?.metadata?.suggestions?.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-2"
                  >
                    {getActionIcon(suggestion.action)}
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your finances... (e.g., 'Create an invoice for Acme Corp for $500', 'Show me my expenses this month', 'How's my business doing?')"
                className="min-h-[60px] resize-none"
                disabled={sendMessageMutation.isPending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !selectedCompanyId || sendMessageMutation.isPending}
                className="flex items-center gap-2"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isListening ? undefined : startListening}
                disabled={isListening}
                className="flex items-center gap-2"
              >
                {isListening ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div>
              {sendMessageMutation.isPending && 'AI is thinking...'}
              {isListening && 'Listening...'}
              {isSpeaking && 'Speaking...'}
            </div>
            <div>
              {sessionId && `Session: ${sessionId.slice(-8)}`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
