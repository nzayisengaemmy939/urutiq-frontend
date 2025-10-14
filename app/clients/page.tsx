import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  MessageSquare,
  FileText,
  Send,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Share,
  Download,
  Eye,
  Bell,
} from "lucide-react"

export default function ClientsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Portal & Communication</h1>
          <p className="text-muted-foreground">Manage client relationships and secure communications</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            New Message
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="documents">Shared Documents</TabsTrigger>
          <TabsTrigger value="portal">Portal Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">+3 new this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Require response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Documents awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portal Logins</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">284</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Communications</CardTitle>
                <CardDescription>Latest messages and interactions with clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/professional-woman-diverse.png" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">ABC Corporation</p>
                      <p className="text-xs text-muted-foreground">
                        "Can you review the Q4 financial statements before our meeting?"
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="destructive">Urgent</Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/professional-man.png" />
                      <AvatarFallback>XY</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">XYZ Industries</p>
                      <p className="text-xs text-muted-foreground">
                        "Thank you for the tax preparation documents. Everything looks good."
                      </p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Read
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/professional-woman-2.png" />
                      <AvatarFallback>DE</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">DEF Enterprises</p>
                      <p className="text-xs text-muted-foreground">
                        "Could we schedule a call to discuss the budget projections?"
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/professional-man-2.png" />
                      <AvatarFallback>GH</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">GHI Solutions</p>
                      <p className="text-xs text-muted-foreground">
                        "The invoice has been approved and payment is being processed."
                      </p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Info
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Portal Activity</CardTitle>
                <CardDescription>Recent client portal usage and document access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Document Viewed</p>
                      <p className="text-xs text-muted-foreground">ABC Corp viewed "Q4 Financial Report.pdf"</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Download className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Document Downloaded</p>
                      <p className="text-xs text-muted-foreground">XYZ Industries downloaded "Tax Return 2024.pdf"</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Document Approved</p>
                      <p className="text-xs text-muted-foreground">
                        DEF Enterprises approved "Contract Amendment.docx"
                      </p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                      <MessageSquare className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">New Message</p>
                      <p className="text-xs text-muted-foreground">
                        GHI Solutions sent a message about invoice payment
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Client Directory</h2>
            <div className="flex items-center space-x-2">
              <Input placeholder="Search clients..." className="w-64" />
              <Button>Add Client</Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/professional-woman-diverse.png" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">ABC Corporation</CardTitle>
                      <CardDescription>Technology Services</CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>contact@abccorp.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Login</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Portal Access</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Enabled
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/professional-man.png" />
                      <AvatarFallback>XY</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">XYZ Industries</CardTitle>
                      <CardDescription>Manufacturing</CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>info@xyzind.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+1 (555) 987-6543</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Login</span>
                  <span className="font-medium">1 day ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Portal Access</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Enabled
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/professional-woman-2.png" />
                      <AvatarFallback>DE</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">DEF Enterprises</CardTitle>
                      <CardDescription>Retail & E-commerce</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pending Setup
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>admin@defent.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+1 (555) 456-7890</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Login</span>
                  <span className="font-medium text-muted-foreground">Never</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Portal Access</span>
                  <Badge variant="outline">Setup Required</Badge>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Send Invite
                  </Button>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Center</CardTitle>
              <CardDescription>Secure communications with clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  You have 12 unread messages from clients. 3 are marked as urgent and require immediate attention.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Messages</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/professional-woman-diverse.png" />
                            <AvatarFallback>AC</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">ABC Corporation</p>
                            <p className="text-sm text-muted-foreground">Sarah Johnson</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">Urgent</Badge>
                          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        "Can you review the Q4 financial statements before our meeting tomorrow? I have some questions
                        about the revenue projections."
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/professional-man.png" />
                            <AvatarFallback>XY</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">XYZ Industries</p>
                            <p className="text-sm text-muted-foreground">Michael Chen</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Read
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        "Thank you for the tax preparation documents. Everything looks good and we're ready to proceed
                        with filing."
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/professional-woman-2.png" />
                            <AvatarFallback>DE</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">DEF Enterprises</p>
                            <p className="text-sm text-muted-foreground">Emily Rodriguez</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        "Could we schedule a call to discuss the budget projections for next quarter? I'd like to go
                        over the numbers in detail."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Compose New Message
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Share className="mr-2 h-4 w-4" />
                      Share Document
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Bell className="mr-2 h-4 w-4" />
                      Send Notification
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Message Templates</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="ghost" className="w-full justify-start text-sm">
                        Document Review Request
                      </Button>
                      <Button size="sm" variant="ghost" className="w-full justify-start text-sm">
                        Meeting Confirmation
                      </Button>
                      <Button size="sm" variant="ghost" className="w-full justify-start text-sm">
                        Payment Reminder
                      </Button>
                      <Button size="sm" variant="ghost" className="w-full justify-start text-sm">
                        Project Update
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shared Documents</CardTitle>
              <CardDescription>Documents shared with clients through the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">184 documents are currently shared with clients</p>
                  <Button>
                    <Share className="mr-2 h-4 w-4" />
                    Share New Document
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div className="col-span-4">Document</div>
                    <div className="col-span-2">Client</div>
                    <div className="col-span-2">Shared Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-4 flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Q4 Financial Report.pdf</p>
                          <p className="text-sm text-muted-foreground">2.4 MB</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/professional-woman-diverse.png" />
                            <AvatarFallback>AC</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">ABC Corp</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">2 hours ago</div>
                      <div className="col-span-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending Review
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-4 flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Tax Return 2024.pdf</p>
                          <p className="text-sm text-muted-foreground">1.8 MB</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/professional-man.png" />
                            <AvatarFallback>XY</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">XYZ Ind</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">1 day ago</div>
                      <div className="col-span-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approved
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-4 flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Contract Amendment.docx</p>
                          <p className="text-sm text-muted-foreground">456 KB</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/professional-woman-2.png" />
                            <AvatarFallback>DE</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">DEF Ent</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">3 days ago</div>
                      <div className="col-span-2">
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Rejected
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portal Configuration</CardTitle>
                <CardDescription>Customize client portal settings and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Custom Branding</p>
                      <p className="text-sm text-muted-foreground">Add your logo and brand colors</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Enhanced security for client access</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Required
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Document Watermarks</p>
                      <p className="text-sm text-muted-foreground">Add watermarks to shared documents</p>
                    </div>
                    <Badge variant="outline">Optional</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Notify clients of new documents</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>
                </div>

                <Button className="w-full">Configure Portal Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Management</CardTitle>
                <CardDescription>Manage client permissions and access levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Document Access</p>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Full Access
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Clients can view, download, and approve documents</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Communication</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Enabled
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Secure messaging and meeting scheduling</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Financial Reports</p>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        View Only
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Read-only access to financial statements</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Invoice Management</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Full Access
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">View, approve, and pay invoices online</p>
                  </div>
                </div>

                <Button className="w-full bg-transparent" variant="outline">
                  Manage Permissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
