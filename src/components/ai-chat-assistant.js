import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { MessageSquare, Send, Bot, User, Sparkles, Minimize2, Maximize2, Database, Plus, Search, DollarSign, FileText, } from "lucide-react";
import { useParseTransaction, useCreateParsedEntry } from "../hooks/useParser";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../components/ui/use-toast";
const initialMessages = [
    {
        id: "welcome",
        type: "ai",
        content: "Hi! I'm your AI accounting assistant. I can help you record transactions, retrieve financial data, and provide insights. Try asking me to 'record an expense' or 'show me this month's revenue'.",
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
];
export function AIChatAssistant() {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef(null);
    const idCounterRef = useRef(0);
    const parseMutation = useParseTransaction();
    const createMutation = useCreateParsedEntry();
    const [lastParsedText, setLastParsedText] = useState("");
    const [lastCompanyId, setLastCompanyId] = useState(undefined);
    const [showEdit, setShowEdit] = useState(false);
    const [editText, setEditText] = useState("");
    const { toast } = useToast();
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const simulateAIResponse = (userMessage) => {
        const message = userMessage.toLowerCase();
        // Data Recording Patterns
        if (message.includes("record") || message.includes("add") || message.includes("create")) {
            if (message.includes("expense")) {
                return {
                    content: "I'll help you record an expense. Please provide the amount, description, and category.",
                    dataAction: { type: "record", data: { transactionType: "expense" } },
                    suggestions: ["$50 office supplies", "$120 client lunch", "$300 software subscription", "Cancel recording"],
                };
            }
            if (message.includes("invoice") || message.includes("payment")) {
                return {
                    content: "I'll help you record a payment or invoice. What's the amount and customer?",
                    dataAction: { type: "record", data: { transactionType: "income" } },
                    suggestions: ["$2000 from ABC Corp", "$500 consulting fee", "$1200 monthly retainer", "Cancel recording"],
                };
            }
            if (message.includes("customer") || message.includes("client")) {
                return {
                    content: "I'll help you add a new customer. What's their name and contact information?",
                    dataAction: { type: "record", data: { recordType: "customer" } },
                    suggestions: ["ABC Corporation", "John Smith Consulting", "Local Restaurant LLC", "Cancel"],
                };
            }
        }
        // Data Retrieval Patterns
        if (message.includes("show") || message.includes("find") || message.includes("get") || message.includes("what")) {
            if (message.includes("invoice")) {
                return {
                    content: "Here are your recent invoices:\n• INV-001: $2,500 - ABC Corp (Paid)\n• INV-002: $1,800 - TechStart Inc (Pending)\n• INV-003: $950 - Local Bakery (Overdue)",
                    dataAction: { type: "retrieve", data: { queryType: "invoices" } },
                    suggestions: ["Show overdue invoices", "Create new invoice", "Export invoice list", "Filter by customer"],
                };
            }
            if (message.includes("cash") || message.includes("balance")) {
                return {
                    content: "Current cash position:\n• Checking Account: $45,230.50\n• Savings Account: $12,800.00\n• Total Cash: $58,030.50\n\nNet change this month: +$3,420.00",
                    dataAction: { type: "retrieve", data: { queryType: "cash_flow" } },
                    suggestions: [
                        "Show cash flow forecast",
                        "View bank transactions",
                        "Reconcile accounts",
                        "Export cash report",
                    ],
                };
            }
            if (message.includes("revenue") || message.includes("income")) {
                return {
                    content: "Revenue summary this month:\n• Total Revenue: $18,450.00\n• Consulting: $12,000.00 (65%)\n• Products: $6,450.00 (35%)\n\nCompared to last month: +12.5%",
                    dataAction: { type: "analyze", data: { analysisType: "revenue" } },
                    suggestions: ["Show revenue by client", "Compare quarterly", "View payment methods", "Export revenue report"],
                };
            }
            if (message.includes("expense")) {
                return {
                    content: "Expense summary this month:\n• Total Expenses: $8,230.00\n• Office Supplies: $1,200.00\n• Software: $890.00\n• Travel: $2,140.00\n• Other: $4,000.00",
                    dataAction: { type: "analyze", data: { analysisType: "expenses" } },
                    suggestions: [
                        "Show expense categories",
                        "Find recurring expenses",
                        "Compare to budget",
                        "Export expense report",
                    ],
                };
            }
            if (message.includes("over") || message.includes(">") || message.includes("above")) {
                const amount = message.match(/\$?(\d+)/)?.[1] || "1000";
                return {
                    content: `Transactions over $${amount}:\n• $2,500 - ABC Corp Invoice (Income)\n• $1,800 - TechStart Inc Invoice (Income)\n• $1,200 - Office Equipment (Expense)\n• $1,050 - Marketing Campaign (Expense)`,
                    dataAction: { type: "retrieve", data: { queryType: "filtered_transactions", filter: `amount > ${amount}` } },
                    suggestions: [
                        `Show transactions under $${amount}`,
                        "Export filtered list",
                        "Categorize transactions",
                        "Flag for review",
                    ],
                };
            }
        }
        // Analysis Patterns
        if (message.includes("analyze") || message.includes("trend") || message.includes("pattern")) {
            return {
                content: "Expense trend analysis:\n• Office supplies increased 40% this quarter\n• Software costs stable at ~$900/month\n• Travel expenses down 25% from last quarter\n• Recommendation: Review office supply vendors for cost savings",
                dataAction: { type: "analyze", data: { analysisType: "trends" } },
                suggestions: ["Show detailed breakdown", "Compare to industry", "Set budget alerts", "Generate full report"],
            };
        }
        // Default response
        return {
            content: "I can help you with:\n• Recording transactions (expenses, income, payments)\n• Retrieving financial data (invoices, balances, reports)\n• Analyzing trends and patterns\n\nWhat would you like to do?",
            suggestions: ["Record an expense", "Show cash flow", "Find large transactions", "Analyze spending patterns"],
        };
    };
    const handleSend = async () => {
        if (!input.trim())
            return;
        const userMessage = {
            id: `msg-${idCounterRef.current++}`,
            type: "user",
            content: input,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);
        // Call backend parser
        try {
            setLastParsedText(currentInput);
            const companyId = (typeof window !== 'undefined' && (localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company'))) || undefined;
            setLastCompanyId(companyId);
            const { data } = await parseMutation.mutateAsync({ text: currentInput, companyId });
            const parsed = data.data;
            const preview = `Suggested entry (confidence ${parsed.confidence}%):\n${parsed.parsedTransaction.description}\nAmount: ${parsed.parsedTransaction.amount} ${parsed.parsedTransaction.currency}\nType: ${parsed.parsedTransaction.transactionType}\nCategory: ${parsed.parsedTransaction.category}\nBalanced: ${parsed.validationErrors?.length ? 'No' : 'Yes'}`;
            const aiResponse = {
                id: `msg-${idCounterRef.current++}`,
                type: "ai",
                content: preview,
                timestamp: new Date(),
                suggestions: ["Confirm ✅", "Edit ✏️", "Cancel"],
                dataAction: { type: "record", data: { parsed } }
            };
            setMessages((prev) => [...prev, aiResponse]);
        }
        catch (e) {
            const fallback = simulateAIResponse(currentInput);
            const aiResponse = {
                id: `msg-${idCounterRef.current++}`,
                type: "ai",
                content: fallback.content,
                timestamp: new Date(),
                suggestions: fallback.suggestions,
                dataAction: fallback.dataAction,
            };
            setMessages((prev) => [...prev, aiResponse]);
        }
        finally {
            setIsTyping(false);
        }
    };
    const handleDataAction = async (messageId, action) => {
        setMessages((prev) => prev.map((msg) => {
            if (msg.id === messageId && msg.dataAction) {
                // Confirm/save path
                if (action.startsWith("Confirm")) {
                    const text = lastParsedText;
                    const companyId = lastCompanyId;
                    createMutation.mutate({ text, companyId, autoCreate: true }, {
                        onSuccess: () => {
                            toast({ title: "Saved", description: "Journal entry created successfully." });
                        },
                        onError: (err) => {
                            toast({ title: "Save failed", description: err?.message || "Failed to create entry", variant: "destructive" });
                        }
                    });
                }
                if (action.startsWith("Edit")) {
                    setEditText(lastParsedText);
                    setShowEdit(true);
                }
                // TODO: Edit path could open a modal prefilled with parsed data
                const confirmationMessage = {
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
                };
                setTimeout(() => {
                    setMessages((prev) => [...prev, confirmationMessage]);
                }, 500);
                return { ...msg, dataAction: { ...msg.dataAction, confirmed: true } };
            }
            return msg;
        }));
    };
    const handleEditConfirm = () => {
        const companyId = lastCompanyId;
        createMutation.mutate({ text: editText, companyId, autoCreate: true }, {
            onSuccess: () => {
                toast({ title: "Saved", description: "Journal entry created from edited text." });
                setShowEdit(false);
            },
            onError: (err) => {
                toast({ title: "Save failed", description: err?.message || "Failed to create entry", variant: "destructive" });
            }
        });
    };
    const getDataActionConfirmation = (actionType, action) => {
        if (action === "Cancel" || action === "Cancel recording") {
            return "Action cancelled. What else can I help you with?";
        }
        switch (actionType) {
            case "record":
                return `✅ Transaction recorded successfully: ${action}\nThe entry has been added to your books and will appear in your reports.`;
            case "retrieve":
                return `✅ Data retrieved and displayed above. ${action === "Export" ? "Export file has been prepared for download." : ""}`;
            case "analyze":
                return `✅ Analysis completed. ${action.includes("report") ? "Full report has been generated and is ready for review." : "Additional insights have been calculated."}`;
            default:
                return "✅ Action completed successfully.";
        }
    };
    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    return (_jsxs(Card, { className: `bg-card border-border transition-all duration-300 ${isMinimized ? "h-16" : "h-96"}`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "flex items-center justify-between text-foreground", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-cyan-600" }), "AI Assistant", _jsxs(Badge, { variant: "secondary", className: "bg-cyan-100 text-cyan-700 text-xs", children: [_jsx(Database, { className: "w-3 h-3 mr-1" }), "Data"] }), _jsxs(Badge, { variant: "secondary", className: "bg-green-100 text-green-700 text-xs", children: [_jsx(Sparkles, { className: "w-3 h-3 mr-1" }), "Smart"] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsMinimized(!isMinimized), className: "h-6 w-6 p-0", children: isMinimized ? _jsx(Maximize2, { className: "w-3 h-3" }) : _jsx(Minimize2, { className: "w-3 h-3" }) })] }) }), !isMinimized && (_jsxs(CardContent, { className: "flex flex-col h-80", children: [_jsxs("div", { className: "flex-1 overflow-y-auto space-y-3 mb-4", children: [messages.map((message) => (_jsx("div", { className: `flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: `flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-cyan-600" : "bg-muted"}`, children: message.type === "user" ? (_jsx(User, { className: "w-3 h-3 text-white" })) : (_jsx(Bot, { className: "w-3 h-3 text-muted-foreground" })) }), _jsxs("div", { className: `p-3 rounded-lg ${message.type === "user" ? "bg-cyan-600 text-white" : "bg-muted text-foreground"}`, children: [_jsx("p", { className: "text-sm whitespace-pre-line", children: message.content }), message.suggestions && (_jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: message.suggestions.map((suggestion, index) => {
                                                        const isDataAction = message.dataAction && !message.dataAction.confirmed;
                                                        const getIcon = (text) => {
                                                            if (text.includes("$") || text.includes("record") || text.includes("add"))
                                                                return _jsx(Plus, { className: "w-3 h-3 mr-1" });
                                                            if (text.includes("show") || text.includes("find") || text.includes("export"))
                                                                return _jsx(Search, { className: "w-3 h-3 mr-1" });
                                                            if (text.includes("cash") || text.includes("balance"))
                                                                return _jsx(DollarSign, { className: "w-3 h-3 mr-1" });
                                                            if (text.includes("report") || text.includes("analyze"))
                                                                return _jsx(FileText, { className: "w-3 h-3 mr-1" });
                                                            return null;
                                                        };
                                                        return (_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => isDataAction
                                                                ? handleDataAction(message.id, suggestion)
                                                                : handleSuggestionClick(suggestion), className: "h-6 text-xs px-2 bg-background/20 hover:bg-background/40 text-current flex items-center", children: [getIcon(suggestion), suggestion] }, index));
                                                    }) }))] })] }) }, message.id))), isTyping && (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-6 h-6 rounded-full bg-muted flex items-center justify-center", children: _jsx(Bot, { className: "w-3 h-3 text-muted-foreground" }) }), _jsx("div", { className: "bg-muted p-3 rounded-lg", children: _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce", style: { animationDelay: "0.1s" } }), _jsx("div", { className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce", style: { animationDelay: "0.2s" } })] }) })] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: input, onChange: (e) => setInput(e.target.value), onKeyPress: handleKeyPress, placeholder: "Ask me to record data or retrieve information...", className: "flex-1 text-sm", disabled: isTyping }), _jsx(Button, { onClick: handleSend, disabled: !input.trim() || isTyping, size: "sm", className: "px-3", children: _jsx(Send, { className: "w-4 h-4" }) })] })] })), _jsx(Dialog, { open: showEdit, onOpenChange: setShowEdit, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit transaction before saving" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm", children: "Transaction text" }), _jsx(Textarea, { value: editText, onChange: (e) => setEditText(e.target.value), rows: 5 })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowEdit(false), children: "Cancel" }), _jsx(Button, { onClick: handleEditConfirm, disabled: createMutation.isPending, children: "Save" })] })] }) })] }));
}
