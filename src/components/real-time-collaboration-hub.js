import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Users, MessageSquare, Bell, Eye, Edit3, Share2, CheckCircle, AlertCircle, FileText, Video, Phone, Send, MoreHorizontal, UserPlus, } from "lucide-react";
const mockUsers = [
    {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah@urutiiq.com",
        role: "accountant",
        status: "online",
        currentDocument: "Q4 Financial Report",
    },
    {
        id: "2",
        name: "Mike Chen",
        email: "mike@acmecorp.com",
        role: "client",
        status: "online",
        currentDocument: "Invoice #2024-001",
    },
    {
        id: "3",
        name: "Lisa Rodriguez",
        email: "lisa@urutiiq.com",
        role: "manager",
        status: "away",
        lastSeen: "5 minutes ago",
    },
    {
        id: "4",
        name: "David Kim",
        email: "david@techstart.com",
        role: "client",
        status: "offline",
        lastSeen: "2 hours ago",
    },
];
const mockActivities = [
    {
        id: "1",
        type: "comment",
        user: mockUsers[1],
        document: "Invoice #2024-001",
        message: "Please update the billing address for this invoice.",
        timestamp: "2 minutes ago",
        priority: "high",
    },
    {
        id: "2",
        type: "edit",
        user: mockUsers[0],
        document: "Q4 Financial Report",
        message: "Updated revenue projections based on latest data.",
        timestamp: "15 minutes ago",
        priority: "medium",
    },
    {
        id: "3",
        type: "approve",
        user: mockUsers[2],
        document: "Expense Report - October",
        message: "Approved expense report for processing.",
        timestamp: "1 hour ago",
        priority: "low",
    },
    {
        id: "4",
        type: "share",
        user: mockUsers[0],
        document: "Tax Planning Summary",
        message: "Shared document with client for review.",
        timestamp: "3 hours ago",
        priority: "medium",
    },
];
const mockDocuments = [
    {
        id: "1",
        name: "Q4 Financial Report",
        type: "report",
        status: "draft",
        collaborators: [mockUsers[0], mockUsers[2]],
        lastModified: "15 minutes ago",
        comments: 3,
    },
    {
        id: "2",
        name: "Invoice #2024-001",
        type: "invoice",
        status: "review",
        collaborators: [mockUsers[0], mockUsers[1]],
        lastModified: "2 minutes ago",
        comments: 1,
    },
    {
        id: "3",
        name: "Tax Planning Summary",
        type: "tax_form",
        status: "approved",
        collaborators: [mockUsers[0], mockUsers[3]],
        lastModified: "3 hours ago",
        comments: 0,
    },
];
export function RealTimeCollaborationHub() {
    const [activeUsers, setActiveUsers] = useState(mockUsers);
    const [activities, setActivities] = useState(mockActivities);
    const [documents, setDocuments] = useState(mockDocuments);
    const [newComment, setNewComment] = useState("");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const getStatusColor = (status) => {
        switch (status) {
            case "online":
                return "bg-green-500";
            case "away":
                return "bg-yellow-500";
            case "offline":
                return "bg-gray-400";
            default:
                return "bg-gray-400";
        }
    };
    const getRoleColor = (role) => {
        switch (role) {
            case "accountant":
                return "bg-blue-100 text-blue-700";
            case "client":
                return "bg-green-100 text-green-700";
            case "manager":
                return "bg-purple-100 text-purple-700";
            case "viewer":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const getActivityIcon = (type) => {
        switch (type) {
            case "comment":
                return _jsx(MessageSquare, { className: "h-4 w-4 text-blue-500" });
            case "edit":
                return _jsx(Edit3, { className: "h-4 w-4 text-orange-500" });
            case "share":
                return _jsx(Share2, { className: "h-4 w-4 text-green-500" });
            case "approve":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" });
            case "view":
                return _jsx(Eye, { className: "h-4 w-4 text-gray-500" });
            default:
                return _jsx(FileText, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getDocumentStatusColor = (status) => {
        switch (status) {
            case "draft":
                return "bg-gray-100 text-gray-700";
            case "review":
                return "bg-yellow-100 text-yellow-700";
            case "approved":
                return "bg-green-100 text-green-700";
            case "sent":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const handleSendComment = () => {
        if (newComment.trim() && selectedDocument) {
            // Simulate adding a comment
            console.log("[v0] Adding comment:", newComment, "to document:", selectedDocument.name);
            setNewComment("");
        }
    };
    const onlineUsers = activeUsers.filter((user) => user.status === "online");
    const awayUsers = activeUsers.filter((user) => user.status === "away");
    return (_jsxs(Card, { className: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5 text-indigo-600" }), _jsx(CardTitle, { className: "text-indigo-900", children: "Collaboration Hub" }), _jsxs(Badge, { variant: "secondary", className: "bg-indigo-100 text-indigo-700", children: [onlineUsers.length, " Online"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "border-indigo-300 text-indigo-700 bg-transparent", children: [_jsx(Video, { className: "h-4 w-4 mr-1" }), "Start Meeting"] }), _jsxs(Button, { size: "sm", variant: "outline", className: "border-indigo-300 text-indigo-700 bg-transparent", children: [_jsx(UserPlus, { className: "h-4 w-4 mr-1" }), "Invite"] })] })] }) }), _jsxs(CardContent, { children: [_jsxs(Tabs, { defaultValue: "activity", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "activity", children: "Activity" }), _jsx(TabsTrigger, { value: "users", children: "Team" }), _jsx(TabsTrigger, { value: "documents", children: "Documents" }), _jsx(TabsTrigger, { value: "notifications", children: "Notifications" })] }), _jsx(TabsContent, { value: "activity", className: "space-y-4", children: _jsx("div", { className: "space-y-3", children: activities.map((activity) => (_jsxs("div", { className: "flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100", children: [_jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarFallback, { className: "text-xs", children: activity.user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("") }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [getActivityIcon(activity.type), _jsx("span", { className: "font-medium text-sm text-gray-900", children: activity.user.name }), _jsx(Badge, { variant: "outline", className: getRoleColor(activity.user.role), children: activity.user.role }), _jsx("span", { className: "text-xs text-gray-500", children: activity.timestamp })] }), _jsxs("p", { className: "text-sm text-gray-600 mb-1", children: [activity.type === "comment"
                                                                ? "commented on"
                                                                : activity.type === "edit"
                                                                    ? "edited"
                                                                    : activity.type === "share"
                                                                        ? "shared"
                                                                        : activity.type === "approve"
                                                                            ? "approved"
                                                                            : "viewed", _jsx("span", { className: "font-medium text-gray-900 ml-1", children: activity.document })] }), activity.message && (_jsxs("p", { className: "text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2", children: ["\"", activity.message, "\""] }))] }), _jsxs("div", { className: "flex items-center gap-1", children: [activity.priority === "high" && _jsx(AlertCircle, { className: "h-4 w-4 text-red-500" }), _jsx(Button, { size: "sm", variant: "ghost", className: "h-6 w-6 p-0", children: _jsx(MoreHorizontal, { className: "h-3 w-3" }) })] })] }, activity.id))) }) }), _jsx(TabsContent, { value: "users", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-sm text-gray-900 mb-2", children: ["Online (", onlineUsers.length, ")"] }), _jsx("div", { className: "space-y-2", children: onlineUsers.map((user) => (_jsxs("div", { className: "flex items-center gap-3 p-2 bg-white rounded-lg border border-indigo-100", children: [_jsxs("div", { className: "relative", children: [_jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarFallback, { className: "text-xs", children: user.name
                                                                                .split(" ")
                                                                                .map((n) => n[0])
                                                                                .join("") }) }), _jsx("div", { className: `absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}` })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-sm text-gray-900", children: user.name }), _jsx(Badge, { variant: "outline", className: getRoleColor(user.role), children: user.role })] }), user.currentDocument && (_jsxs("p", { className: "text-xs text-gray-600", children: ["Working on: ", user.currentDocument] }))] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "ghost", className: "h-6 w-6 p-0", children: _jsx(MessageSquare, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", className: "h-6 w-6 p-0", children: _jsx(Phone, { className: "h-3 w-3" }) })] })] }, user.id))) })] }), awayUsers.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-sm text-gray-900 mb-2", children: ["Away (", awayUsers.length, ")"] }), _jsx("div", { className: "space-y-2", children: awayUsers.map((user) => (_jsxs("div", { className: "flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 opacity-75", children: [_jsxs("div", { className: "relative", children: [_jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarFallback, { className: "text-xs", children: user.name
                                                                                .split(" ")
                                                                                .map((n) => n[0])
                                                                                .join("") }) }), _jsx("div", { className: `absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}` })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-sm text-gray-700", children: user.name }), _jsx(Badge, { variant: "outline", className: getRoleColor(user.role), children: user.role })] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Last seen: ", user.lastSeen] })] })] }, user.id))) })] }))] }) }), _jsx(TabsContent, { value: "documents", className: "space-y-4", children: _jsx("div", { className: "space-y-3", children: documents.map((document) => (_jsxs("div", { className: "p-3 bg-white rounded-lg border border-indigo-100", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-indigo-600" }), _jsx("span", { className: "font-medium text-sm text-gray-900", children: document.name }), _jsx(Badge, { variant: "outline", className: getDocumentStatusColor(document.status), children: document.status })] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setSelectedDocument(document), className: "border-indigo-300 text-indigo-700", children: "Open" })] }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { children: ["Modified: ", document.lastModified] }), _jsxs("span", { children: [document.comments, " comments"] })] }), _jsxs("div", { className: "flex -space-x-1", children: [document.collaborators.slice(0, 3).map((collaborator) => (_jsx(Avatar, { className: "h-6 w-6 border-2 border-white", children: _jsx(AvatarFallback, { className: "text-xs", children: collaborator.name
                                                                        .split(" ")
                                                                        .map((n) => n[0])
                                                                        .join("") }) }, collaborator.id))), document.collaborators.length > 3 && (_jsx("div", { className: "h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center", children: _jsxs("span", { className: "text-xs text-gray-600", children: ["+", document.collaborators.length - 3] }) }))] })] })] }, document.id))) }) }), _jsx(TabsContent, { value: "notifications", className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "p-3 bg-white rounded-lg border border-yellow-200 border-l-4 border-l-yellow-400", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Bell, { className: "h-4 w-4 text-yellow-600 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-sm text-gray-900", children: "Client Review Required" }), _jsx("p", { className: "text-sm text-gray-600", children: "Mike Chen requested changes to Invoice #2024-001" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "2 minutes ago" })] })] }) }), _jsx("div", { className: "p-3 bg-white rounded-lg border border-blue-200 border-l-4 border-l-blue-400", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-blue-600 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-sm text-gray-900", children: "Document Approved" }), _jsx("p", { className: "text-sm text-gray-600", children: "Lisa Rodriguez approved the Expense Report - October" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "1 hour ago" })] })] }) }), _jsx("div", { className: "p-3 bg-white rounded-lg border border-green-200 border-l-4 border-l-green-400", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Share2, { className: "h-4 w-4 text-green-600 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-sm text-gray-900", children: "Document Shared" }), _jsx("p", { className: "text-sm text-gray-600", children: "Tax Planning Summary shared with David Kim" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "3 hours ago" })] })] }) })] }) })] }), selectedDocument && (_jsxs("div", { className: "mt-4 p-4 bg-white rounded-lg border border-indigo-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h4", { className: "font-medium text-gray-900", children: ["Quick Comment on ", selectedDocument.name] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSelectedDocument(null), children: "\u00D7" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Textarea, { placeholder: "Add a comment...", value: newComment, onChange: (e) => setNewComment(e.target.value), className: "flex-1 min-h-[60px]" }), _jsx(Button, { onClick: handleSendComment, disabled: !newComment.trim(), className: "bg-indigo-600 hover:bg-indigo-700", children: _jsx(Send, { className: "h-4 w-4" }) })] })] }))] })] }));
}
