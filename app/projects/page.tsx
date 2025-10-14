import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Clock,
  Play,
  Pause,
  Square,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  Timer,
  Briefcase,
  AlertTriangle,
} from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking & Projects</h1>
          <p className="text-muted-foreground">Track billable hours and analyze project profitability</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Timer className="mr-2 h-4 w-4" />
            Quick Timer
          </Button>
          <Button>
            <Briefcase className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42.5</div>
                <p className="text-xs text-muted-foreground">+5.2 hours from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Billable Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,450</div>
                <p className="text-xs text-muted-foreground">This week's earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 due this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Hourly Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$198</div>
                <p className="text-xs text-muted-foreground">+12% this month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Timer</CardTitle>
                <CardDescription>Track time for active tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Play className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Website Redesign - ABC Corp</p>
                      <p className="text-sm text-muted-foreground">Design & Development</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">02:34:18</p>
                    <p className="text-sm text-muted-foreground">Started at 9:15 AM</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Quick Start</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <span className="text-sm">Financial Analysis - XYZ Inc</span>
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <span className="text-sm">Tax Preparation - DEF LLC</span>
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Top performing projects this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Website Redesign</p>
                        <p className="text-sm text-muted-foreground">ABC Corp</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">$12,450</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +24%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <BarChart3 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Financial Analysis</p>
                        <p className="text-sm text-muted-foreground">XYZ Inc</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">$8,750</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +18%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                        <Target className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Tax Preparation</p>
                        <p className="text-sm text-muted-foreground">DEF LLC</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">$4,200</p>
                      <p className="text-sm text-red-600 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -8%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                        <Users className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Consulting Services</p>
                        <p className="text-sm text-muted-foreground">GHI Corp</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">$6,890</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +15%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Active Projects</h2>
            <Button>
              <Briefcase className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Website Redesign</CardTitle>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                <CardDescription>ABC Corp • Web Development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Hours Logged</p>
                    <p className="font-medium">84.5h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget Used</p>
                    <p className="font-medium">$16,900</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">Jan 30, 2025</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hourly Rate</p>
                    <p className="font-medium">$200/hr</p>
                  </div>
                </div>

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
                  <span className="text-sm text-muted-foreground">2 team members</span>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Play className="mr-2 h-4 w-4" />
                    Start Timer
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Financial Analysis</CardTitle>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Review
                  </Badge>
                </div>
                <CardDescription>XYZ Inc • Financial Consulting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Hours Logged</p>
                    <p className="font-medium">45.2h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget Used</p>
                    <p className="font-medium">$9,040</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">Jan 25, 2025</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hourly Rate</p>
                    <p className="font-medium">$200/hr</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarImage src="/professional-woman-2.png" />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-sm text-muted-foreground">1 team member</span>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Play className="mr-2 h-4 w-4" />
                    Start Timer
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Tax Preparation</CardTitle>
                  <Badge variant="destructive">Overdue</Badge>
                </div>
                <CardDescription>DEF LLC • Tax Services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Hours Logged</p>
                    <p className="font-medium">28.7h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget Used</p>
                    <p className="font-medium">$5,740</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium text-red-600">Jan 15, 2025</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hourly Rate</p>
                    <p className="font-medium">$200/hr</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarImage src="/professional-man-2.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-sm text-muted-foreground">1 team member</span>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Project is 3 days overdue</AlertDescription>
                </Alert>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Play className="mr-2 h-4 w-4" />
                    Start Timer
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timesheet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timesheet</CardTitle>
              <CardDescription>Track and manage your time entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Week of January 13-19, 2025</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Previous Week
                    </Button>
                    <Button variant="outline" size="sm">
                      Next Week
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-8 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-2">Project</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Total</div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-8 gap-2 items-center p-2 hover:bg-muted/50 rounded">
                    <div className="col-span-2">
                      <p className="font-medium">Website Redesign</p>
                      <p className="text-sm text-muted-foreground">ABC Corp</p>
                    </div>
                    <div className="text-center">8.5h</div>
                    <div className="text-center">7.2h</div>
                    <div className="text-center">6.8h</div>
                    <div className="text-center">8.0h</div>
                    <div className="text-center">4.5h</div>
                    <div className="text-center font-medium">35.0h</div>
                  </div>

                  <div className="grid grid-cols-8 gap-2 items-center p-2 hover:bg-muted/50 rounded">
                    <div className="col-span-2">
                      <p className="font-medium">Financial Analysis</p>
                      <p className="text-sm text-muted-foreground">XYZ Inc</p>
                    </div>
                    <div className="text-center">2.0h</div>
                    <div className="text-center">3.5h</div>
                    <div className="text-center">4.0h</div>
                    <div className="text-center">-</div>
                    <div className="text-center">2.5h</div>
                    <div className="text-center font-medium">12.0h</div>
                  </div>

                  <div className="grid grid-cols-8 gap-2 items-center p-2 hover:bg-muted/50 rounded">
                    <div className="col-span-2">
                      <p className="font-medium">Tax Preparation</p>
                      <p className="text-sm text-muted-foreground">DEF LLC</p>
                    </div>
                    <div className="text-center">-</div>
                    <div className="text-center">1.5h</div>
                    <div className="text-center">2.0h</div>
                    <div className="text-center">3.0h</div>
                    <div className="text-center">1.0h</div>
                    <div className="text-center font-medium">7.5h</div>
                  </div>

                  <div className="grid grid-cols-8 gap-2 items-center p-2 border-t pt-2 font-medium">
                    <div className="col-span-2">Daily Totals</div>
                    <div className="text-center">10.5h</div>
                    <div className="text-center">12.2h</div>
                    <div className="text-center">12.8h</div>
                    <div className="text-center">11.0h</div>
                    <div className="text-center">8.0h</div>
                    <div className="text-center text-lg">54.5h</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-muted-foreground">
                    Total billable hours: 54.5h • Total revenue: $10,900
                  </div>
                  <Button>Submit Timesheet</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Profitability Analysis</CardTitle>
              <CardDescription>Analyze revenue, costs, and profit margins by project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$45,280</div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">$28,450</div>
                  <p className="text-sm text-muted-foreground">Total Costs</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">37.2%</div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Briefcase className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Website Redesign</p>
                        <p className="text-sm text-muted-foreground">ABC Corp • 84.5 hours</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-medium ml-1">$16,900</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium ml-1">$8,450</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Profit:</span>
                          <span className="font-medium text-green-600 ml-1">50.0%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Financial Analysis</p>
                        <p className="text-sm text-muted-foreground">XYZ Inc • 45.2 hours</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-medium ml-1">$9,040</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium ml-1">$4,520</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Profit:</span>
                          <span className="font-medium text-green-600 ml-1">50.0%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                        <Target className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Tax Preparation</p>
                        <p className="text-sm text-muted-foreground">DEF LLC • 28.7 hours</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-medium ml-1">$5,740</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium ml-1">$4,305</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Profit:</span>
                          <span className="font-medium text-yellow-600 ml-1">25.0%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Consulting Services</p>
                        <p className="text-sm text-muted-foreground">GHI Corp • 68.9 hours</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-medium ml-1">$13,600</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium ml-1">$11,175</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Profit:</span>
                          <span className="font-medium text-red-600 ml-1">17.8%</span>
                        </div>
                      </div>
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
                  <Clock className="mr-2 h-5 w-5" />
                  Time Summary Report
                </CardTitle>
                <CardDescription>Detailed breakdown of time allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Period</span>
                    <span className="text-sm font-medium">This Month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Hours</span>
                    <span className="text-sm font-medium">227.3h</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Revenue Analysis
                </CardTitle>
                <CardDescription>Project revenue and billing analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Revenue</span>
                    <span className="text-sm font-medium">$45,280</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Hourly Rate</span>
                    <span className="text-sm font-medium">$199.21</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Profitability Report
                </CardTitle>
                <CardDescription>Profit margins and cost analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gross Profit</span>
                    <span className="text-sm font-medium">$16,830</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Profit Margin</span>
                    <span className="text-sm font-medium">37.2%</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
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
