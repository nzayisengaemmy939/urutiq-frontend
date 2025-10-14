import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageLayout } from "@/components/page-layout"
import {
  FileText,
  Upload,
  Search,
  Filter,
  FolderOpen,
  Clock,
  Download,
  Share,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Lock,
  Archive,
  Shield,
  Activity,
  Globe,
  Smartphone,
  Zap,
  BarChart3,
  Target,
  TrendingUp,
  FileCheck,
  Workflow,
  Settings,
} from "lucide-react"

export default function DocumentsPage() {
  return (
    <PageLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management & Intelligence</h1>
            <p className="text-muted-foreground">Enterprise-grade document management with AI-powered insights and advanced workflows</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Document Analytics
            </Button>
            <Button>
              <Shield className="mr-2 h-4 w-4" />
              Security Settings
            </Button>
          </div>
        </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
                  <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">Documents</TabsTrigger>
          <TabsTrigger value="ai">AI Intelligence</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-10 w-64" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">+127 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Processed</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">1,892</div>
                <p className="text-xs text-muted-foreground">67% of documents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98%</div>
                <p className="text-xs text-muted-foreground">Excellent posture</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <p className="text-xs text-muted-foreground">All checks passed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Intelligence Health</CardTitle>
                <CardDescription>AI-powered document processing and analysis status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">OCR Processing</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">95% of documents processed with OCR</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Classification</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Learning
                      </Badge>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">87% accuracy in document categorization</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Content Extraction</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Optimized
                      </Badge>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">92% success rate in data extraction</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Automated Workflows</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Expanding
                      </Badge>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">78% of processes automated</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent AI Insights</CardTitle>
                <CardDescription>Latest intelligent document analysis and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Invoice pattern detected</p>
                      <p className="text-xs text-muted-foreground">Automated categorization improved by 12%</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Compliance risk identified</p>
                      <p className="text-xs text-muted-foreground">3 documents flagged for review</p>
                      <p className="text-xs text-muted-foreground">6 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Workflow optimization</p>
                      <p className="text-xs text-muted-foreground">Approval time reduced by 35%</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Duplicate detection</p>
                      <p className="text-xs text-muted-foreground">15 potential duplicates found</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">+127 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8 GB</div>
                <p className="text-xs text-muted-foreground">of 100 GB limit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Require your review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shared Documents</CardTitle>
                <Share className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">184</div>
                <p className="text-xs text-muted-foreground">Active collaborations</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Categories</CardTitle>
                <CardDescription>Organize documents by type and purpose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Financial Statements</p>
                        <p className="text-sm text-muted-foreground">P&L, Balance Sheet, Cash Flow</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">247</p>
                      <p className="text-sm text-muted-foreground">documents</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Tax Documents</p>
                        <p className="text-sm text-muted-foreground">Returns, Forms, Receipts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">892</p>
                      <p className="text-sm text-muted-foreground">documents</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Contracts & Agreements</p>
                        <p className="text-sm text-muted-foreground">Vendor, Client, Employment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">156</p>
                      <p className="text-sm text-muted-foreground">documents</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                        <FileText className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Invoices & Receipts</p>
                        <p className="text-sm text-muted-foreground">Sales, Purchase, Expense</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">1,552</p>
                      <p className="text-sm text-muted-foreground">documents</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest document actions and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Upload className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Q4 Financial Report uploaded</p>
                      <p className="text-xs text-muted-foreground">by Sarah Johnson • 2 hours ago</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      New
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Contract Amendment approved</p>
                      <p className="text-xs text-muted-foreground">by Michael Davis • 4 hours ago</p>
                    </div>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Approved
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                      <Share className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Tax documents shared with CPA</p>
                      <p className="text-xs text-muted-foreground">by Emily Rodriguez • 1 day ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Shared
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Invoice requires approval</p>
                      <p className="text-xs text-muted-foreground">by System • 2 days ago</p>
                    </div>
                    <Badge variant="destructive">Action Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>Browse and manage all your documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-1">Actions</div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                    <div className="col-span-5 flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Q4 2024 Financial Report.pdf</p>
                        <p className="text-sm text-muted-foreground">2.4 MB</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline">Financial</Badge>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">2 hours ago</div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/professional-woman-diverse.png" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Sarah J.</span>
                    </div>
                    <div className="col-span-1 flex items-center space-x-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                    <div className="col-span-5 flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Tax Return 2024.pdf</p>
                        <p className="text-sm text-muted-foreground">1.8 MB</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline">Tax</Badge>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">1 day ago</div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/professional-man.png" />
                        <AvatarFallback>MD</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Michael D.</span>
                    </div>
                    <div className="col-span-1 flex items-center space-x-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                    <div className="col-span-5 flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Vendor Agreement - ABC Corp.docx</p>
                        <p className="text-sm text-muted-foreground">456 KB</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline">Contract</Badge>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">3 days ago</div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/professional-woman-2.png" />
                        <AvatarFallback>ER</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Emily R.</span>
                    </div>
                    <div className="col-span-1 flex items-center space-x-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Lock className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Accessed Documents</CardTitle>
              <CardDescription>Documents you've viewed or modified in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">December Payroll Summary</p>
                        <p className="text-sm text-muted-foreground">Last opened: 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Recently Modified
                      </Badge>
                      <Button size="sm" variant="outline">
                        Open
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium">Q4 Tax Preparation Checklist</p>
                        <p className="text-sm text-muted-foreground">Last opened: 1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        In Progress
                      </Badge>
                      <Button size="sm" variant="outline">
                        Continue
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-medium">Client Onboarding Template</p>
                        <p className="text-sm text-muted-foreground">Last opened: 3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Template</Badge>
                      <Button size="sm" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shared Documents</CardTitle>
              <CardDescription>Documents shared with team members and external collaborators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Share className="h-4 w-4" />
                  <AlertDescription>
                    184 documents are currently shared with team members and external collaborators.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">Annual Budget Review</p>
                        <p className="text-sm text-muted-foreground">Shared with Finance Team (5 members)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Team Access
                      </Badge>
                      <Button size="sm" variant="outline">
                        Manage Access
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium">Tax Documents Package</p>
                        <p className="text-sm text-muted-foreground">Shared with External CPA</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        External Access
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-medium">Client Presentation Draft</p>
                        <p className="text-sm text-muted-foreground">Shared with Marketing Team (3 members)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Read Only</Badge>
                      <Button size="sm" variant="outline">
                        Edit Permissions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Archived Documents</CardTitle>
              <CardDescription>Documents moved to archive for long-term storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Documents are automatically archived after 2 years of inactivity
                  </p>
                  <Button variant="outline" size="sm">
                    Archive Settings
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                    <div className="flex items-center space-x-4">
                      <Archive className="h-8 w-8 text-gray-500" />
                      <div>
                        <p className="font-medium">2022 Financial Records</p>
                        <p className="text-sm text-muted-foreground">Archived: January 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Archived</Badge>
                      <Button size="sm" variant="outline">
                        Restore
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                    <div className="flex items-center space-x-4">
                      <Archive className="h-8 w-8 text-gray-500" />
                      <div>
                        <p className="font-medium">Old Vendor Contracts</p>
                        <p className="text-sm text-muted-foreground">Archived: March 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Archived</Badge>
                      <Button size="sm" variant="outline">
                        View Archive
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>AI Document Analysis</CardTitle>
                <CardDescription>Intelligent document processing and insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span className="font-medium">OCR Processing</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Extract text from scanned documents and images
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Smart Classification</span>
                      </div>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Learning
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically categorize documents by type and content
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Content Extraction</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Optimized
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Extract structured data from unstructured documents
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Automation</CardTitle>
                <CardDescription>Intelligent workflow automation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Workflow className="h-4 w-4" />
                        <span className="font-medium">Smart Routing</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically route documents to appropriate users
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileCheck className="h-4 w-4" />
                        <span className="font-medium">Auto-Approval</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Testing
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Approve low-risk documents automatically
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Risk Detection</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Identify compliance and security risks automatically
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Intelligent analytics and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">Trend Analysis</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Identify patterns and trends in document usage
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Predictive Analytics</span>
                      </div>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Learning
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Predict document processing needs and bottlenecks
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span className="font-medium">Smart Recommendations</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Suggest workflow improvements and optimizations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              AI intelligence is actively processing 1,892 documents. 67% of your document library has been enhanced with intelligent features.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Workflows</CardTitle>
              <CardDescription>Automated approval processes and document routing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Workflows</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Invoice Approval Process</p>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Invoices over $5,000 require manager approval
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarImage src="/professional-woman-diverse.png" />
                            <AvatarFallback>SJ</AvatarFallback>
                          </Avatar>
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarImage src="/professional-man.png" />
                            <AvatarFallback>MD</AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="text-sm text-muted-foreground">2 approvers</span>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Contract Review Workflow</p>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Legal review required for all new contracts</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarImage src="/professional-woman-2.png" />
                            <AvatarFallback>ER</AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="text-sm text-muted-foreground">1 reviewer</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Workflow Templates</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Expense Report Approval</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Standard approval process for expense reports
                      </p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Use Template
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Document Review & Sign</p>
                      <p className="text-sm text-muted-foreground mb-3">Multi-step review with digital signature</p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Use Template
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Compliance Check</p>
                      <p className="text-sm text-muted-foreground mb-3">Automated compliance verification workflow</p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  12 documents are currently in approval workflows. 3 require your immediate attention.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Security & Access Control</CardTitle>
              <CardDescription>Advanced security controls and document protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Access Control Features</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">Document-Level Security</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Granular permissions for individual documents
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="font-medium">Two-Factor Access</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Required
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        MFA required for sensitive document access
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">IP Restrictions</span>
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Access limited to approved IP addresses
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Time-Based Access</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Configured
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Access windows and session timeouts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security Status</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Encryption Status</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          AES-256
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All documents encrypted at rest and in transit
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Audit Logging</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Complete
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Full audit trail for all document access
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Threat Detection</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI-powered anomaly detection and alerts
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Backup Security</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Encrypted
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Secure backups with encryption and access controls
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Document security is at 98% with all critical controls active. 2,847 documents are protected with enterprise-grade security.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Regulatory Management</CardTitle>
              <CardDescription>Automated compliance monitoring and reporting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">SOC 2 Type II</p>
                    <p className="text-sm text-muted-foreground">Security & Availability</p>
                    <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                      Certified
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">GDPR</p>
                    <p className="text-sm text-muted-foreground">Data Protection</p>
                    <Badge variant="default" className="bg-green-100 text-blue-800 mt-1">
                      Compliant
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">HIPAA</p>
                    <p className="text-sm text-muted-foreground">Healthcare Data</p>
                    <Badge variant="default" className="bg-purple-100 text-purple-800 mt-1">
                      Ready
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Automated Compliance Checks</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Data Retention Policy</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatic compliance with retention requirements
                    </p>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Review Policy
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Privacy Impact Assessment</p>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Due Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Annual privacy assessment due in 30 days</p>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Start Assessment
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All critical compliance requirements are met. Next audit scheduled for March 2025.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Analytics & Business Intelligence</CardTitle>
              <CardDescription>Comprehensive insights and performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">24.8 GB</div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">67%</div>
                  <p className="text-sm text-muted-foreground">AI Processed</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">35%</div>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Document Processing Speed</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Optimized
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Average processing time: 2.3 seconds
                    </p>
                    <div className="flex items-center space-x-2 text-sm">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span>Last optimized: 1 day ago</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">User Adoption Rate</p>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Growing
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">87% of users actively using AI features</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-800" />
                      <span>+12% this month</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  Document analytics show strong performance with 35% time savings and 67% AI adoption rate.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Management Settings</CardTitle>
              <CardDescription>Configure system preferences and automation rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System Configuration</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Auto-Classification</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatically categorize uploaded documents
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Duplicate Detection</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Identify and flag duplicate documents
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Version Control</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Track document versions and changes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Automation Rules</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Workflow Triggers</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatic workflow initiation based on rules
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Notification System</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Configured
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automated alerts and notifications
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Backup Automation</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Scheduled
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Daily automated backups with encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  All system settings are optimized for performance and security. 12 automation rules are currently active.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
    </PageLayout>
  )
}
