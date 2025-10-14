"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageSquare,
  Bell,
  Eye,
  Edit3,
  Share2,
  CheckCircle,
  AlertCircle,
  FileText,
  Video,
  Phone,
  Send,
  MoreHorizontal,
  UserPlus,
} from "lucide-react"

interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: "accountant" | "client" | "manager" | "viewer"
  status: "online" | "offline" | "away"
  lastSeen?: string
  currentDocument?: string
}

interface Activity {
  id: string
  type: "comment" | "edit" | "share" | "approve" | "view"
  user: CollaborationUser
  document: string
  message?: string
  timestamp: string
  priority: "high" | "medium" | "low"
}

interface Document {
  id: string
  name: string
  type: "invoice" | "report" | "statement" | "tax_form"
  status: "draft" | "review" | "approved" | "sent"
  collaborators: CollaborationUser[]
  lastModified: string
  comments: number
}

const mockUsers: CollaborationUser[] = [
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
]

const mockActivities: Activity[] = [
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
]

const mockDocuments: Document[] = [
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
]

export function RealTimeCollaborationHub() {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>(mockUsers)
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [newComment, setNewComment] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "accountant":
        return "bg-blue-100 text-blue-700"
      case "client":
        return "bg-green-100 text-green-700"
      case "manager":
        return "bg-purple-100 text-purple-700"
      case "viewer":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "edit":
        return <Edit3 className="h-4 w-4 text-orange-500" />
      case "share":
        return <Share2 className="h-4 w-4 text-green-500" />
      case "approve":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "view":
        return <Eye className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700"
      case "review":
        return "bg-yellow-100 text-yellow-700"
      case "approved":
        return "bg-green-100 text-green-700"
      case "sent":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const handleSendComment = () => {
    if (newComment.trim() && selectedDocument) {
      // Simulate adding a comment
      console.log("[v0] Adding comment:", newComment, "to document:", selectedDocument.name)
      setNewComment("")
    }
  }

  const onlineUsers = activeUsers.filter((user) => user.status === "online")
  const awayUsers = activeUsers.filter((user) => user.status === "away")

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-indigo-900">Collaboration Hub</CardTitle>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
              {onlineUsers.length} Online
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 bg-transparent">
              <Video className="h-4 w-4 mr-1" />
              Start Meeting
            </Button>
            <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 bg-transparent">
              <UserPlus className="h-4 w-4 mr-1" />
              Invite
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="users">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {activity.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <span className="font-medium text-sm text-gray-900">{activity.user.name}</span>
                      <Badge variant="outline" className={getRoleColor(activity.user.role)}>
                        {activity.user.role}
                      </Badge>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {activity.type === "comment"
                        ? "commented on"
                        : activity.type === "edit"
                          ? "edited"
                          : activity.type === "share"
                            ? "shared"
                            : activity.type === "approve"
                              ? "approved"
                              : "viewed"}
                      <span className="font-medium text-gray-900 ml-1">{activity.document}</span>
                    </p>
                    {activity.message && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">"{activity.message}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {activity.priority === "high" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Online ({onlineUsers.length})</h4>
                <div className="space-y-2">
                  {onlineUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 bg-white rounded-lg border border-indigo-100"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">{user.name}</span>
                          <Badge variant="outline" className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        {user.currentDocument && (
                          <p className="text-xs text-gray-600">Working on: {user.currentDocument}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {awayUsers.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Away ({awayUsers.length})</h4>
                  <div className="space-y-2">
                    {awayUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 opacity-75"
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-700">{user.name}</span>
                            <Badge variant="outline" className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">Last seen: {user.lastSeen}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="p-3 bg-white rounded-lg border border-indigo-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-sm text-gray-900">{document.name}</span>
                      <Badge variant="outline" className={getDocumentStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDocument(document)}
                      className="border-indigo-300 text-indigo-700"
                    >
                      Open
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Modified: {document.lastModified}</span>
                      <span>{document.comments} comments</span>
                    </div>
                    <div className="flex -space-x-1">
                      {document.collaborators.slice(0, 3).map((collaborator) => (
                        <Avatar key={collaborator.id} className="h-6 w-6 border-2 border-white">
                          <AvatarFallback className="text-xs">
                            {collaborator.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {document.collaborators.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{document.collaborators.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-yellow-200 border-l-4 border-l-yellow-400">
                <div className="flex items-start gap-2">
                  <Bell className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Client Review Required</p>
                    <p className="text-sm text-gray-600">Mike Chen requested changes to Invoice #2024-001</p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-200 border-l-4 border-l-blue-400">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Document Approved</p>
                    <p className="text-sm text-gray-600">Lisa Rodriguez approved the Expense Report - October</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-green-200 border-l-4 border-l-green-400">
                <div className="flex items-start gap-2">
                  <Share2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Document Shared</p>
                    <p className="text-sm text-gray-600">Tax Planning Summary shared with David Kim</p>
                    <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {selectedDocument && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Quick Comment on {selectedDocument.name}</h4>
              <Button size="sm" variant="ghost" onClick={() => setSelectedDocument(null)}>
                ×
              </Button>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[60px]"
              />
              <Button
                onClick={handleSendComment}
                disabled={!newComment.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
