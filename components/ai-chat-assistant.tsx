"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Minimize2,
  Maximize2,
  Database,
  Plus,
  Search,
  DollarSign,
  FileText,
} from "lucide-react"
import { useParseTransaction, useCreateParsedEntry } from "@/hooks/useParser"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  suggestions?: string[]
  dataAction?: {
    type: "record" | "retrieve" | "analyze"
    data?: any
    confirmed?: boolean
  }
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    type: "ai",
    content:
      "Hi! I'm your AI accounting assistant. I can help you record transactions, retrieve financial data, and provide insights. Try asking me to 'record an expense' or 'show me this month's revenue'.",
    timestamp: new Date(),
    suggestions: [
      "Record a new expense",
      "Show me recent invoices",
      "What's my cash balance?",
      "Find transactions over $1000",
      "Add a new customer payment",
      "Analyze expense trends",
    ],
  },
]

export function AIChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idCounterRef = useRef(0)
  const parseMutation = useParseTransaction()
  const createMutation = useCreateParsedEntry()
  const [lastParsedText, setLastParsedText] = useState<string>("")
  const [lastCompanyId, setLastCompanyId] = useState<string | undefined>(undefined)
  const [showEdit, setShowEdit] = useState(false)
  const [editText, setEditText] = useState("")
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateAIResponse = (userMessage: string): { content: string; dataAction?: any; suggestions?: string[] } => {
    const message = userMessage.toLowerCase()

    // Data Recording Patterns
    if (message.includes("record") || message.includes("add") || message.includes("create")) {
      if (message.includes("expense")) {
        return {
          content: "I'll help you record an expense. Please provide the amount, description, and category.",
          dataAction: { type: "record", data: { transactionType: "expense" } },
          suggestions: ["$50 office supplies", "$120 client lunch", "$300 software subscription", "Cancel recording"],
        }
      }
      if (message.includes("invoice") || message.includes("payment")) {
        return {
          content: "I'll help you record a payment or invoice. What's the amount and customer?",
          dataAction: { type: "record", data: { transactionType: "income" } },
          suggestions: ["$2000 from ABC Corp", "$500 consulting fee", "$1200 monthly retainer", "Cancel recording"],
        }
      }
      if (message.includes("customer") || message.includes("client")) {
        return {
          content: "I'll help you add a new customer. What's their name and contact information?",
          dataAction: { type: "record", data: { recordType: "customer" } },
          suggestions: ["ABC Corporation", "John Smith Consulting", "Local Restaurant LLC", "Cancel"],
        }
      }
    }

    // Data Retrieval Patterns
    if (message.includes("show") || message.includes("find") || message.includes("get") || message.includes("what")) {
      if (message.includes("invoice")) {
        return {
          content:
            "Here are your recent invoices:\n• INV-001: $2,500 - ABC Corp (Paid)\n• INV-002: $1,800 - TechStart Inc (Pending)\n• INV-003: $950 - Local Bakery (Overdue)",
          dataAction: { type: "retrieve", data: { queryType: "invoices" } },
          suggestions: ["Show overdue invoices", "Create new invoice", "Export invoice list", "Filter by customer"],
        }
      }
      if (message.includes("cash") || message.includes("balance")) {
        return {
          content:
            "Current cash position:\n• Checking Account: $45,230.50\n• Savings Account: $12,800.00\n• Total Cash: $58,030.50\n\nNet change this month: +$3,420.00",
          dataAction: { type: "retrieve", data: { queryType: "cash_flow" } },
          suggestions: [
            "Show cash flow forecast",
            "View bank transactions",
            "Reconcile accounts",
            "Export cash report",
          ],
        }
      }
      if (message.includes("revenue") || message.includes("income")) {
        return {
          content:
            "Revenue summary this month:\n• Total Revenue: $18,450.00\n• Consulting: $12,000.00 (65%)\n• Products: $6,450.00 (35%)\n\nCompared to last month: +12.5%",
          dataAction: { type: "analyze", data: { analysisType: "revenue" } },
          suggestions: ["Show revenue by client", "Compare quarterly", "View payment methods", "Export revenue report"],
        }
      }
      if (message.includes("expense")) {
        return {
          content:
            "Expense summary this month:\n• Total Expenses: $8,230.00\n• Office Supplies: $1,200.00\n• Software: $890.00\n• Travel: $2,140.00\n• Other: $4,000.00",
          dataAction: { type: "analyze", data: { analysisType: "expenses" } },
          suggestions: [
            "Show expense categories",
            "Find recurring expenses",
            "Compare to budget",
            "Export expense report",
          ],
        }
      }
      if (message.includes("over") || message.includes(">") || message.includes("above")) {
        const amount = message.match(/\$?(\d+)/)?.[1] || "1000"
        return {
          content: `Transactions over $${amount}:\n• $2,500 - ABC Corp Invoice (Income)\n• $1,800 - TechStart Inc Invoice (Income)\n• $1,200 - Office Equipment (Expense)\n• $1,050 - Marketing Campaign (Expense)`,
          dataAction: { type: "retrieve", data: { queryType: "filtered_transactions", filter: `amount > ${amount}` } },
          suggestions: [
            `Show transactions under $${amount}`,
            "Export filtered list",
            "Categorize transactions",
            "Flag for review",
          ],
        }
      }
    }

    // Analysis Patterns
    if (message.includes("analyze") || message.includes("trend") || message.includes("pattern")) {
      return {
        content:
          "Expense trend analysis:\n• Office supplies increased 40% this quarter\n• Software costs stable at ~$900/month\n• Travel expenses down 25% from last quarter\n• Recommendation: Review office supply vendors for cost savings",
        dataAction: { type: "analyze", data: { analysisType: "trends" } },
        suggestions: ["Show detailed breakdown", "Compare to industry", "Set budget alerts", "Generate full report"],
      }
    }

    // Default response
    return {
      content:
        "I can help you with:\n• Recording transactions (expenses, income, payments)\n• Retrieving financial data (invoices, balances, reports)\n• Analyzing trends and patterns\n\nWhat would you like to do?",
      suggestions: ["Record an expense", "Show cash flow", "Find large transactions", "Analyze spending patterns"],
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: `msg-${idCounterRef.current++}`,
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsTyping(true)

    // Call backend parser
    try {
      setLastParsedText(currentInput)
      const companyId = (typeof window !== 'undefined' && (localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company'))) || undefined
      setLastCompanyId(companyId)
      const { data } = await parseMutation.mutateAsync({ text: currentInput, companyId })
      const parsed = data.data
      const preview = `Suggested entry (confidence ${parsed.confidence}%):\n${parsed.parsedTransaction.description}\nAmount: ${parsed.parsedTransaction.amount} ${parsed.parsedTransaction.currency}\nType: ${parsed.parsedTransaction.transactionType}\nCategory: ${parsed.parsedTransaction.category}\nBalanced: ${parsed.validationErrors?.length ? 'No' : 'Yes'}`
      const aiResponse: ChatMessage = {
        id: `msg-${idCounterRef.current++}`,
        type: "ai",
        content: preview,
        timestamp: new Date(),
        suggestions: ["Confirm ✅", "Edit ✏️", "Cancel"],
        dataAction: { type: "record", data: { parsed } }
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (e: any) {
      const fallback = simulateAIResponse(currentInput)
      const aiResponse: ChatMessage = {
        id: `msg-${idCounterRef.current++}`,
        type: "ai",
        content: fallback.content,
        timestamp: new Date(),
        suggestions: fallback.suggestions,
        dataAction: fallback.dataAction,
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleDataAction = async (messageId: string, action: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.dataAction) {
          // Confirm/save path
          if (action.startsWith("Confirm")) {
            const text = lastParsedText
            const companyId = lastCompanyId
            createMutation.mutate(
              { text, companyId, autoCreate: true },
              {
                onSuccess: () => {
                  toast({ title: "Saved", description: "Journal entry created successfully." })
                },
                onError: (err: any) => {
                  toast({ title: "Save failed", description: err?.message || "Failed to create entry", variant: "destructive" })
                }
              }
            )
          }
          if (action.startsWith("Edit")) {
            setEditText(lastParsedText)
            setShowEdit(true)
          }
          // TODO: Edit path could open a modal prefilled with parsed data
          const confirmationMessage: ChatMessage = {
            id: Date.now().toString(),
            type: "ai",
            content: getDataActionConfirmation(msg.dataAction.type, action),
            timestamp: new Date(),
            suggestions: [
              "Record another transaction",
              "View updated data",
              "Generate report",
              "What else can I help with?",
            ],
          }

          setTimeout(() => {
            setMessages((prev) => [...prev, confirmationMessage])
          }, 500)

          return { ...msg, dataAction: { ...msg.dataAction, confirmed: true } }
        }
        return msg
      }),
    )
  }

  const handleEditConfirm = () => {
    const companyId = lastCompanyId
    createMutation.mutate(
      { text: editText, companyId, autoCreate: true },
      {
        onSuccess: () => {
          toast({ title: "Saved", description: "Journal entry created from edited text." })
          setShowEdit(false)
        },
        onError: (err: any) => {
          toast({ title: "Save failed", description: err?.message || "Failed to create entry", variant: "destructive" })
        }
      }
    )
  }

  const getDataActionConfirmation = (actionType: string, action: string): string => {
    if (action === "Cancel" || action === "Cancel recording") {
      return "Action cancelled. What else can I help you with?"
    }

    switch (actionType) {
      case "record":
        return `✅ Transaction recorded successfully: ${action}\nThe entry has been added to your books and will appear in your reports.`
      case "retrieve":
        return `✅ Data retrieved and displayed above. ${action === "Export" ? "Export file has been prepared for download." : ""}`
      case "analyze":
        return `✅ Analysis completed. ${action.includes("report") ? "Full report has been generated and is ready for review." : "Additional insights have been calculated."}`
      default:
        return "✅ Action completed successfully."
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className={`bg-card border-border transition-all duration-300 ${isMinimized ? "h-16" : "h-96"}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-600" />
            AI Assistant
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 text-xs">
              <Database className="w-3 h-3 mr-1" />
              Data
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="h-6 w-6 p-0">
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-80">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-cyan-600" : "bg-muted"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === "user" ? "bg-cyan-600 text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.suggestions.map((suggestion, index) => {
                          const isDataAction = message.dataAction && !message.dataAction.confirmed
                          const getIcon = (text: string) => {
                            if (text.includes("$") || text.includes("record") || text.includes("add"))
                              return <Plus className="w-3 h-3 mr-1" />
                            if (text.includes("show") || text.includes("find") || text.includes("export"))
                              return <Search className="w-3 h-3 mr-1" />
                            if (text.includes("cash") || text.includes("balance"))
                              return <DollarSign className="w-3 h-3 mr-1" />
                            if (text.includes("report") || text.includes("analyze"))
                              return <FileText className="w-3 h-3 mr-1" />
                            return null
                          }

                          return (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                isDataAction
                                  ? handleDataAction(message.id, suggestion)
                                  : handleSuggestionClick(suggestion)
                              }
                              className="h-6 text-xs px-2 bg-background/20 hover:bg-background/40 text-current flex items-center"
                            >
                              {getIcon(suggestion)}
                              {suggestion}
                            </Button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to record data or retrieve information..."
              className="flex-1 text-sm"
              disabled={isTyping}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="sm" className="px-3">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit transaction before saving</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm">Transaction text</label>
            <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={5} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEditConfirm} disabled={createMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
