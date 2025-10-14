import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageLayout } from "@/components/page-layout"
import {
  Shield,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Activity,
  Database,
  Globe,
  Smartphone,
} from "lucide-react"

export default function SecurityPage() {
  return (
    <PageLayout>
      <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Compliance</h1>
          <p className="text-muted-foreground">Advanced security controls and regulatory compliance management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Security Audit
          </Button>
          <Button>
            <Shield className="mr-2 h-4 w-4" />
            Security Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="encryption">Data Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98%</div>
                <p className="text-xs text-muted-foreground">Excellent security posture</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">Across all users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <p className="text-xs text-muted-foreground">SOC 2 Type II compliant</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Health Check</CardTitle>
                <CardDescription>Current security status across all systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Two-Factor Authentication</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Enabled
                      </Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground">100% of users have 2FA enabled</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Encryption</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground">AES-256 encryption at rest and in transit</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Access Controls</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Configured
                      </Badge>
                    </div>
                    <Progress value={95} className="h-2" />
                    <p className="text-xs text-muted-foreground">Role-based permissions active</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Backup & Recovery</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="mr-1 h-3 w-3" />
                        In Progress
                      </Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">Daily backups with 99.9% success rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security activities and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Security scan completed</p>
                      <p className="text-xs text-muted-foreground">No vulnerabilities detected</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Key className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">API key rotated</p>
                      <p className="text-xs text-muted-foreground">Automatic key rotation completed</p>
                      <p className="text-xs text-muted-foreground">6 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Failed login attempt</p>
                      <p className="text-xs text-muted-foreground">Blocked suspicious IP address</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Compliance audit passed</p>
                      <p className="text-xs text-muted-foreground">SOC 2 Type II certification renewed</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Management</CardTitle>
              <CardDescription>Role-based permissions and user access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All users have appropriate role-based access controls. 47 active users with granular permissions.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">User Roles & Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                          <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Super Admin</p>
                          <p className="text-sm text-muted-foreground">Full system access</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">2 users</p>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Admin</p>
                          <p className="text-sm text-muted-foreground">User & system management</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">5 users</p>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          High
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Accountant</p>
                          <p className="text-sm text-muted-foreground">Financial data access</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">28 users</p>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Standard
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                          <Eye className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Viewer</p>
                          <p className="text-sm text-muted-foreground">Read-only access</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">12 users</p>
                        <Badge variant="outline">Limited</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Access Control Features</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="font-medium">Two-Factor Authentication</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Required
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All users must enable 2FA using authenticator apps or SMS
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">IP Whitelisting</span>
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Access restricted to approved IP addresses and locations
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Session Management</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Configured
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatic session timeout after 30 minutes of inactivity
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4" />
                          <span className="font-medium">API Key Management</span>
                        </div>
                        <Badge variant="default" className="bg-purple-100 text-purple-800">
                          Automated
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatic key rotation every 90 days with audit logging
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail & Activity Logs</CardTitle>
              <CardDescription>Comprehensive logging of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing recent audit events • 2,847 total events this month
                  </p>
                  <Button variant="outline" size="sm">
                    Export Logs
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-2">User</div>
                    <div className="col-span-3">Action</div>
                    <div className="col-span-2">Resource</div>
                    <div className="col-span-2">IP Address</div>
                    <div className="col-span-1">Status</div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-2 text-sm">2025-01-16 14:32:15</div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/professional-woman-diverse.png" />
                          <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Sarah J.</span>
                      </div>
                      <div className="col-span-3 text-sm">Document accessed</div>
                      <div className="col-span-2 text-sm">Q4_Report.pdf</div>
                      <div className="col-span-2 text-sm">192.168.1.100</div>
                      <div className="col-span-1">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Success
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-2 text-sm">2025-01-16 14:28:42</div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/professional-man.png" />
                          <AvatarFallback>MD</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Michael D.</span>
                      </div>
                      <div className="col-span-3 text-sm">User login</div>
                      <div className="col-span-2 text-sm">Dashboard</div>
                      <div className="col-span-2 text-sm">10.0.0.45</div>
                      <div className="col-span-1">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Success
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-2 text-sm">2025-01-16 14:15:33</div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>??</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Unknown</span>
                      </div>
                      <div className="col-span-3 text-sm">Failed login attempt</div>
                      <div className="col-span-2 text-sm">Login page</div>
                      <div className="col-span-2 text-sm">203.0.113.42</div>
                      <div className="col-span-1">
                        <Badge variant="destructive">Failed</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-2 text-sm">2025-01-16 13:45:18</div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/professional-woman-2.png" />
                          <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Emily R.</span>
                      </div>
                      <div className="col-span-3 text-sm">Permission changed</div>
                      <div className="col-span-2 text-sm">User: john.doe</div>
                      <div className="col-span-2 text-sm">192.168.1.105</div>
                      <div className="col-span-1">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Warning
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-2 text-sm">2025-01-16 13:22:07</div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>SY</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">System</span>
                      </div>
                      <div className="col-span-3 text-sm">Backup completed</div>
                      <div className="col-span-2 text-sm">Database</div>
                      <div className="col-span-2 text-sm">Internal</div>
                      <div className="col-span-1">
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Info
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance</CardTitle>
              <CardDescription>SOC 2, GDPR, and industry-specific compliance status</CardDescription>
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
                    <Badge variant="default" className="bg-blue-100 text-blue-800 mt-1">
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

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">PCI DSS</p>
                    <p className="text-sm text-muted-foreground">Payment Security</p>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
                      In Progress
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                    <Database className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">ISO 27001</p>
                    <p className="text-sm text-muted-foreground">Information Security</p>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Globe className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">CCPA</p>
                    <p className="text-sm text-muted-foreground">California Privacy</p>
                    <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                      Compliant
                    </Badge>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All critical compliance requirements are met. Next audit scheduled for March 2025.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compliance Actions</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Data Retention Policy</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatic data purging after 7 years as per regulations
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Security & Encryption</CardTitle>
              <CardDescription>Comprehensive data protection and encryption management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Encryption Status</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4" />
                          <span className="font-medium">Data at Rest</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          AES-256
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All database and file storage encrypted with AES-256
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">Data in Transit</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          TLS 1.3
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">All network communications secured with TLS 1.3</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4" />
                          <span className="font-medium">Key Management</span>
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          HSM
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Hardware Security Module for key generation and storage
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">Application Security</span>
                        </div>
                        <Badge variant="default" className="bg-purple-100 text-purple-800">
                          Multi-layer
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Application-level encryption for sensitive fields</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security Measures</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Data Loss Prevention</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Real-time monitoring and prevention of data exfiltration
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Intrusion Detection</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Monitoring
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">24/7 network monitoring and threat detection</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Vulnerability Scanning</span>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Automated
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Daily automated scans with immediate alerts</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Backup Encryption</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          AES-256
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All backups encrypted and stored in secure locations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Monitoring & Alerts</CardTitle>
              <CardDescription>Real-time security monitoring and incident response</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <p className="text-sm text-muted-foreground">Security Monitoring</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">&lt;5min</div>
                  <p className="text-sm text-muted-foreground">Incident Response</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Monitoring</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Network Traffic Analysis</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Normal
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Real-time analysis of network patterns and anomalies
                    </p>
                    <div className="flex items-center space-x-2 text-sm">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span>Last scan: 2 minutes ago</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">User Behavior Analytics</p>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Learning
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">AI-powered analysis of user access patterns</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span>47 users monitored</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Threat Intelligence</p>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        3 Alerts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Global threat feeds and security intelligence</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>Updated hourly</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Compliance Monitoring</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Compliant
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Continuous compliance validation and reporting</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>All checks passed</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Security monitoring is active across all systems. 3 minor alerts require review but no immediate
                  action needed.
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
