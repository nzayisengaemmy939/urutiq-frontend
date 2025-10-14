import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Shield,
  Heart,
  Briefcase,
} from "lucide-react"

export default function PayrollPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">Comprehensive employee payroll and benefits administration</p>
        </div>
        <Button>
          <Calculator className="mr-2 h-4 w-4" />
          Run Payroll
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">+3 new this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$284,500</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Benefits Cost</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$42,680</div>
                <p className="text-xs text-muted-foreground">15% of total payroll</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Payroll</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Days until processing</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Processing Status</CardTitle>
                <CardDescription>Current payroll cycle progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Time Tracking</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Complete
                    </Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payroll Calculations</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tax Withholdings</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Direct Deposits</span>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payroll Activity</CardTitle>
                <CardDescription>Latest payroll events and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">December Payroll Processed</p>
                    <p className="text-xs text-muted-foreground">47 employees • $284,500 total</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">New Employee Onboarded</p>
                    <p className="text-xs text-muted-foreground">Sarah Johnson - Marketing Manager</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 week ago</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Benefits Enrollment Reminder</p>
                    <p className="text-xs text-muted-foreground">3 employees pending enrollment</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3 days ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Employee Directory</h2>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/professional-woman-diverse.png" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Sarah Johnson</CardTitle>
                    <CardDescription>Marketing Manager</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Employee ID</span>
                  <span className="font-medium">EMP-001</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Department</span>
                  <span className="font-medium">Marketing</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Salary</span>
                  <span className="font-medium">$75,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/professional-man.png" />
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Michael Davis</CardTitle>
                    <CardDescription>Senior Developer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Employee ID</span>
                  <span className="font-medium">EMP-002</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Department</span>
                  <span className="font-medium">Engineering</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Salary</span>
                  <span className="font-medium">$95,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/professional-woman-2.png" />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Emily Rodriguez</CardTitle>
                    <CardDescription>HR Specialist</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Employee ID</span>
                  <span className="font-medium">EMP-003</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Department</span>
                  <span className="font-medium">Human Resources</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Salary</span>
                  <span className="font-medium">$65,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    On Leave
                  </Badge>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Processing</CardTitle>
              <CardDescription>Manage payroll runs and calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  Next payroll processing is scheduled for January 15, 2025. Review all time entries and adjustments
                  before processing.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Pay Period</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Pay Period</span>
                      <span className="font-medium">Jan 1 - Jan 15, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Hours</span>
                      <span className="font-medium">3,760 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gross Pay</span>
                      <span className="font-medium">$284,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Withholdings</span>
                      <span className="font-medium text-red-600">-$68,280</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Benefits Deductions</span>
                      <span className="font-medium text-red-600">-$42,680</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Net Pay</span>
                      <span>$173,540</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tax Withholdings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Federal Income Tax</span>
                      <span className="font-medium">$42,675</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Income Tax</span>
                      <span className="font-medium">$14,225</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social Security</span>
                      <span className="font-medium">$7,640</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medicare</span>
                      <span className="font-medium">$2,130</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Disability</span>
                      <span className="font-medium">$1,610</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Total Withholdings</span>
                      <span>$68,280</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button>
                  <Calculator className="mr-2 h-4 w-4" />
                  Process Payroll
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Preview Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Benefits Overview</CardTitle>
                <CardDescription>Employee benefits enrollment and costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Health Insurance</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">42 enrolled</p>
                      <p className="text-sm text-muted-foreground">$28,560/month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Dental Insurance</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">38 enrolled</p>
                      <p className="text-sm text-muted-foreground">$4,560/month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-green-500" />
                      <span>401(k) Plan</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">35 enrolled</p>
                      <p className="text-sm text-muted-foreground">$9,560/month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span>Paid Time Off</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">47 enrolled</p>
                      <p className="text-sm text-muted-foreground">All employees</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefits Administration</CardTitle>
                <CardDescription>Manage enrollment and plan changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Open Enrollment</p>
                      <p className="text-sm text-muted-foreground">Annual benefits selection period</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Upcoming
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">New Hire Enrollments</p>
                      <p className="text-sm text-muted-foreground">3 employees pending</p>
                    </div>
                    <Badge variant="destructive">Action Required</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Plan Changes</p>
                      <p className="text-sm text-muted-foreground">2 pending approvals</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Review
                    </Badge>
                  </div>
                </div>

                <Button className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Manage Benefits
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time-off" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Management</CardTitle>
              <CardDescription>Employee leave requests and accruals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <p className="text-sm text-muted-foreground">Total PTO Days Available</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">42</div>
                  <p className="text-sm text-muted-foreground">Days Used This Year</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">8</div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Time Off Requests</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="/professional-woman-diverse.png" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">Vacation • Jan 20-24, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="/professional-man.png" />
                        <AvatarFallback>MD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Michael Davis</p>
                        <p className="text-sm text-muted-foreground">Sick Leave • Jan 10, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Approved
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="/professional-woman-2.png" />
                        <AvatarFallback>ER</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Emily Rodriguez</p>
                        <p className="text-sm text-muted-foreground">Maternity Leave • Feb 1 - May 1, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Approved
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Payroll Summary
                </CardTitle>
                <CardDescription>Monthly payroll breakdown and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Period</span>
                    <span className="text-sm font-medium">December 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Paid</span>
                    <span className="text-sm font-medium">$284,500</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Tax Liability
                </CardTitle>
                <CardDescription>Payroll tax obligations and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Quarter</span>
                    <span className="text-sm font-medium">Q4 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Liability</span>
                    <span className="text-sm font-medium">$68,280</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <Calculator className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Employee Report
                </CardTitle>
                <CardDescription>Comprehensive employee data and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Employees</span>
                    <span className="text-sm font-medium">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Salary</span>
                    <span className="text-sm font-medium">$72,450</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
