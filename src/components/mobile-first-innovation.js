import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Smartphone, Mic, Camera, Wifi, WifiOff, Upload, Download, Zap, CheckCircle, AlertCircle, ImageIcon, DollarSign, Clock, Scan, Volume2, CloudOff, Send as Sync, FileText, } from "lucide-react";
import { useCreateParsedEntry } from "../hooks/useParser";
import { useToast } from "../components/ui/use-toast";
const mockVoiceTransactions = [
    {
        id: "1",
        transcript: "Add expense for office supplies at Staples for $45.67 on March 15th",
        confidence: 94,
        extractedData: {
            amount: 45.67,
            vendor: "Staples",
            category: "Office Supplies",
            date: "2024-03-15",
            description: "Office supplies",
        },
        status: "confirmed",
    },
    {
        id: "2",
        transcript: "Client lunch at Mario's Restaurant $89.50 yesterday",
        confidence: 87,
        extractedData: {
            amount: 89.5,
            vendor: "Mario's Restaurant",
            category: "Meals & Entertainment",
            date: "2024-03-14",
            description: "Client lunch",
        },
        status: "needs_review",
    },
];
const mockReceiptScans = [
    {
        id: "1",
        imageUrl: "/paper-receipt.png",
        extractedData: {
            vendor: "Best Buy",
            amount: 299.99,
            date: "2024-03-15",
            items: [
                { description: "Wireless Mouse", amount: 49.99 },
                { description: "USB Cable", amount: 19.99 },
                { description: "Laptop Stand", amount: 229.99 },
            ],
            tax: 24.0,
            total: 299.99,
        },
        confidence: 96,
        status: "verified",
    },
    {
        id: "2",
        imageUrl: "/gas-receipt.png",
        extractedData: {
            vendor: "Shell Gas Station",
            amount: 52.34,
            date: "2024-03-14",
            items: [{ description: "Gasoline", amount: 52.34 }],
            tax: 4.19,
            total: 52.34,
        },
        confidence: 89,
        status: "needs_review",
    },
];
const mockOfflineActions = [
    {
        id: "1",
        type: "expense",
        data: { amount: 25.99, vendor: "Coffee Shop", category: "Meals" },
        timestamp: "2024-03-15 10:30:00",
        status: "pending",
    },
    {
        id: "2",
        type: "receipt",
        data: { imageUrl: "local://receipt_001.jpg", amount: 156.78 },
        timestamp: "2024-03-15 09:15:00",
        status: "synced",
    },
];
export function MobileFirstInnovation() {
    const [isRecording, setIsRecording] = useState(false);
    const [recognitionRef, setRecognitionRef] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const [voiceTransactions, setVoiceTransactions] = useState(mockVoiceTransactions);
    const [receiptScans, setReceiptScans] = useState(mockReceiptScans);
    const [offlineActions, setOfflineActions] = useState(mockOfflineActions);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const createEntry = useCreateParsedEntry();
    const { toast } = useToast();
    const startVoiceRecording = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                // Fallback to simulated recording
                setIsRecording(true);
                setTimeout(() => {
                    setIsRecording(false);
                    const newTransaction = {
                        id: Date.now().toString(),
                        transcript: "Gas station fill up 42,500 RWF this morning",
                        confidence: 90,
                        extractedData: {
                            amount: 42500,
                            vendor: "Gas Station",
                            category: "Vehicle Expenses",
                            date: new Date().toISOString().split("T")[0],
                            description: "Gas station fill up",
                        },
                        status: "needs_review",
                    };
                    setVoiceTransactions([newTransaction, ...voiceTransactions]);
                }, 2000);
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = true;
            recognition.continuous = false;
            setIsRecording(true);
            setRecognitionRef(recognition);
            let finalTranscript = '';
            recognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal)
                        finalTranscript += transcript + ' ';
                }
            };
            recognition.onerror = () => {
                setIsRecording(false);
                toast({ title: 'Voice error', description: 'Voice recognition failed, using fallback', variant: 'destructive' });
            };
            recognition.onend = () => {
                setIsRecording(false);
                const text = (finalTranscript || '').trim() || 'Recorded transaction';
                const amountMatch = text.match(/([0-9][0-9,]*\.?[0-9]*)/);
                const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : undefined;
                const newTransaction = {
                    id: Date.now().toString(),
                    transcript: text,
                    confidence: 90,
                    extractedData: {
                        amount,
                        vendor: undefined,
                        category: undefined,
                        date: new Date().toISOString().split('T')[0],
                        description: text.slice(0, 80)
                    },
                    status: 'needs_review'
                };
                setVoiceTransactions([newTransaction, ...voiceTransactions]);
            };
            recognition.start();
        }
        catch (e) {
            setIsRecording(false);
            toast({ title: 'Voice not available', description: 'Falling back to manual entry', variant: 'destructive' });
        }
    };
    const confirmVoiceTransaction = (id) => {
        const tx = voiceTransactions.find((t) => t.id === id);
        if (!tx)
            return;
        const companyId = (typeof window !== 'undefined' && (localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company'))) || undefined;
        createEntry.mutate({ text: tx.transcript, companyId, autoCreate: true }, {
            onSuccess: () => {
                toast({ title: "Saved", description: "Journal entry created from voice transaction." });
                setVoiceTransactions(voiceTransactions.map((t) => (t.id === id ? { ...t, status: "confirmed" } : t)));
            },
            onError: (err) => {
                toast({ title: "Save failed", description: err?.message || "Failed to create entry", variant: "destructive" });
            }
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "confirmed":
            case "verified":
            case "synced":
                return "bg-green-100 text-green-700";
            case "processing":
            case "pending":
                return "bg-blue-100 text-blue-700";
            case "needs_review":
            case "failed":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "confirmed":
            case "verified":
            case "synced":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case "processing":
            case "pending":
                return _jsx(Clock, { className: "h-4 w-4 text-blue-500" });
            case "needs_review":
            case "failed":
                return _jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500" });
            default:
                return _jsx(FileText, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const pendingActions = offlineActions.filter((action) => action.status === "pending");
    const syncedActions = offlineActions.filter((action) => action.status === "synced");
    return (_jsxs(Card, { className: "border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Smartphone, { className: "h-5 w-5 text-teal-600" }), _jsx(CardTitle, { className: "text-teal-900", children: "Mobile Innovation Hub" }), _jsx(Badge, { variant: "secondary", className: "bg-teal-100 text-teal-700", children: "AI-Powered" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [isOffline ? _jsx(WifiOff, { className: "h-4 w-4 text-red-500" }) : _jsx(Wifi, { className: "h-4 w-4 text-green-500" }), _jsx("span", { className: "text-xs text-gray-600", children: isOffline ? "Offline" : "Online" })] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setIsOffline(!isOffline), className: "border-teal-300 text-teal-700 bg-transparent", children: isOffline ? "Go Online" : "Go Offline" })] })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "voice", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "voice", children: "Voice Entry" }), _jsx(TabsTrigger, { value: "receipt", children: "Receipt Scan" }), _jsx(TabsTrigger, { value: "offline", children: "Offline Mode" }), _jsx(TabsTrigger, { value: "gestures", children: "Quick Actions" })] }), _jsxs(TabsContent, { value: "voice", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Mic, { className: "h-5 w-5 text-teal-600" }), "Voice-to-Transaction"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Speak naturally to record expenses and transactions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: `w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${isRecording
                                                            ? "bg-red-100 border-4 border-red-300 animate-pulse"
                                                            : "bg-teal-100 border-4 border-teal-300"}`, children: isRecording ? (_jsx(Volume2, { className: "h-8 w-8 text-red-600" })) : (_jsx(Mic, { className: "h-8 w-8 text-teal-600" })) }), _jsx(Button, { size: "lg", onClick: startVoiceRecording, disabled: isRecording, className: `${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"} transition-colors`, children: isRecording ? "Recording..." : "Start Recording" }), isRecording && (_jsx("p", { className: "text-sm text-gray-600", children: "Try saying: \"Add expense for lunch at Joe's Diner for $15.50 today\"" }))] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Recent Voice Transactions" }), voiceTransactions.map((transaction) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [getStatusIcon(transaction.status), _jsx(Badge, { variant: "outline", className: getStatusColor(transaction.status), children: transaction.status.replace("_", " ") }), _jsxs("span", { className: "text-xs text-gray-500", children: [transaction.confidence, "% confident"] })] }), _jsxs("p", { className: "text-sm text-gray-700 mb-2 italic", children: ["\"", transaction.transcript, "\""] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Amount: " }), _jsxs("span", { className: "font-medium", children: ["$", transaction.extractedData.amount] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Vendor: " }), _jsx("span", { className: "font-medium", children: transaction.extractedData.vendor })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Category: " }), _jsx("span", { className: "font-medium", children: transaction.extractedData.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Date: " }), _jsx("span", { className: "font-medium", children: transaction.extractedData.date })] })] })] }) }), transaction.status === "needs_review" && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: () => confirmVoiceTransaction(transaction.id), children: "Confirm" }), _jsx(Button, { size: "sm", variant: "outline", children: "Edit" })] }))] }) }, transaction.id)))] })] }), _jsxs(TabsContent, { value: "receipt", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Camera, { className: "h-5 w-5 text-teal-600" }), "Smart Receipt Processing"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Advanced OCR extracts all data from receipt photos" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-24 h-24 mx-auto bg-teal-100 rounded-lg flex items-center justify-center border-2 border-dashed border-teal-300", children: _jsx(Camera, { className: "h-8 w-8 text-teal-600" }) }), _jsxs("div", { className: "flex gap-2 justify-center", children: [_jsxs(Button, { className: "bg-teal-600 hover:bg-teal-700", children: [_jsx(Camera, { className: "h-4 w-4 mr-1" }), "Take Photo"] }), _jsxs(Button, { variant: "outline", className: "border-teal-300 text-teal-700 bg-transparent", children: [_jsx(Upload, { className: "h-4 w-4 mr-1" }), "Upload"] })] })] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Processed Receipts" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: receiptScans.map((receipt) => (_jsx(Card, { className: "cursor-pointer", onClick: () => setSelectedReceipt(receipt), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-16 h-20 bg-gray-100 rounded flex items-center justify-center", children: _jsx(ImageIcon, { className: "h-6 w-6 text-gray-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [getStatusIcon(receipt.status), _jsx(Badge, { variant: "outline", className: getStatusColor(receipt.status), children: receipt.status.replace("_", " ") })] }), _jsx("h5", { className: "font-medium text-gray-900", children: receipt.extractedData.vendor }), _jsxs("p", { className: "text-sm text-gray-600", children: ["$", receipt.extractedData.total] }), _jsx("p", { className: "text-xs text-gray-500", children: receipt.extractedData.date }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx(Scan, { className: "h-3 w-3 text-teal-600" }), _jsxs("span", { className: "text-xs text-gray-600", children: [receipt.confidence, "% accuracy"] })] })] })] }) }) }, receipt.id))) })] }), selectedReceipt && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Receipt Details" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSelectedReceipt(null), children: "\u00D7" })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Vendor" }), _jsx(Input, { value: selectedReceipt.extractedData.vendor, className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Total Amount" }), _jsx(Input, { value: selectedReceipt.extractedData.total, className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date" }), _jsx(Input, { value: selectedReceipt.extractedData.date, className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Tax" }), _jsx(Input, { value: selectedReceipt.extractedData.tax, className: "mt-1" })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx(Label, { children: "Items" }), _jsx("div", { className: "space-y-2 mt-1", children: selectedReceipt.extractedData.items.map((item, index) => (_jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm", children: item.description }), _jsxs("span", { className: "text-sm font-medium", children: ["$", item.amount] })] }, index))) })] }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsx(Button, { className: "bg-teal-600 hover:bg-teal-700", children: "Save Transaction" }), _jsx(Button, { variant: "outline", children: "Need Changes" })] })] })] }))] }), _jsxs(TabsContent, { value: "offline", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(CloudOff, { className: "h-5 w-5 text-teal-600" }), "Offline-First Design"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Full functionality even without internet connection" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx(Download, { className: "h-8 w-8 mx-auto mb-2 text-blue-600" }), _jsx("h4", { className: "font-medium text-gray-900", children: "Local Storage" }), _jsx("p", { className: "text-sm text-gray-600", children: "Data cached locally" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx(Sync, { className: "h-8 w-8 mx-auto mb-2 text-green-600" }), _jsx("h4", { className: "font-medium text-gray-900", children: "Auto Sync" }), _jsx("p", { className: "text-sm text-gray-600", children: "Syncs when online" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsx(Zap, { className: "h-8 w-8 mx-auto mb-2 text-purple-600" }), _jsx("h4", { className: "font-medium text-gray-900", children: "Instant Actions" }), _jsx("p", { className: "text-sm text-gray-600", children: "No waiting for network" })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg", children: ["Pending Sync (", pendingActions.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: pendingActions.map((action) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-yellow-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-yellow-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: action.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) }), _jsx("div", { className: "text-xs text-gray-600", children: action.timestamp })] })] }), _jsx(Badge, { variant: "outline", className: "bg-yellow-100 text-yellow-700", children: "Pending" })] }, action.id))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg", children: ["Recently Synced (", syncedActions.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: syncedActions.map((action) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-green-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: action.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) }), _jsx("div", { className: "text-xs text-gray-600", children: action.timestamp })] })] }), _jsx(Badge, { variant: "outline", className: "bg-green-100 text-green-700", children: "Synced" })] }, action.id))) }) })] })] })] }), _jsxs(TabsContent, { value: "gestures", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "Touch-Optimized Quick Actions" }), _jsx("p", { className: "text-sm text-gray-600", children: "Swipe gestures and touch-friendly controls" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs(Button, { className: "h-20 flex-col gap-2 bg-teal-600 hover:bg-teal-700", children: [_jsx(DollarSign, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Add Expense" })] }), _jsxs(Button, { className: "h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700", children: [_jsx(Camera, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Scan Receipt" })] }), _jsxs(Button, { className: "h-20 flex-col gap-2 bg-purple-600 hover:bg-purple-700", children: [_jsx(Mic, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Voice Entry" })] }), _jsxs(Button, { className: "h-20 flex-col gap-2 bg-green-600 hover:bg-green-700", children: [_jsx(FileText, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Quick Report" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Gesture Guide" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-teal-600", children: "\u2192" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Swipe Right" }), _jsx("div", { className: "text-sm text-gray-600", children: "Mark transaction as approved" })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "w-8 h-8 bg-red-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-red-600", children: "\u2190" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Swipe Left" }), _jsx("div", { className: "text-sm text-gray-600", children: "Flag for review or delete" })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-blue-600", children: "\u2191" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Swipe Up" }), _jsx("div", { className: "text-sm text-gray-600", children: "Quick categorize or archive" })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-purple-600", children: "\u2295" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Long Press" }), _jsx("div", { className: "text-sm text-gray-600", children: "Access context menu with more options" })] })] })] }) })] })] })] }) })] }));
}
