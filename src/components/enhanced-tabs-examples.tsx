import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsGroup } from "../components/ui/tabs"
import { 
  Home, 
  Settings, 
  Users, 
  BarChart3, 
  FileText, 
  DollarSign,
  Bell,
  Shield,
  Heart,
  Star
} from "lucide-react"

export function EnhancedTabsExamples() {
  // Sample data for TabsGroup
  const dashboardTabs = [
    {
      value: "overview",
      label: "Overview",
      icon: <Home className="w-4 h-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome to your dashboard! Here's a summary of your activities.</p>
          </CardContent>
        </Card>
      )
    },
    {
      value: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      badge: "12",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View detailed analytics and reports. You have 12 new reports available.</p>
          </CardContent>
        </Card>
      )
    },
    {
      value: "team",
      label: "Team",
      icon: <Users className="w-4 h-4" />,
      badge: "5",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage your team members. Currently 5 active team members.</p>
          </CardContent>
        </Card>
      )
    },
    {
      value: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configure your application preferences and settings.</p>
          </CardContent>
        </Card>
      )
    }
  ]

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Enhanced Tabs Examples</h1>
        <p className="text-muted-foreground">
          Showcase of the new enhanced tab component variants and features.
        </p>
      </div>

      {/* Default Variant with Icons and Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Default Variant with Icons & Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" variant="default" size="md">
            <TabsList variant="default" size="md">
              <TabsTrigger 
                value="documents" 
                variant="default" 
                icon={<FileText className="w-4 h-4" />}
                badge="8"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="finance" 
                variant="default" 
                icon={<DollarSign className="w-4 h-4" />}
                badge="3"
              >
                Finance
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                variant="default" 
                icon={<Bell className="w-4 h-4" />}
                badge="12"
              >
                Notifications
              </TabsTrigger>
            </TabsList>
            <TabsContent value="documents">
              <p>You have 8 documents ready for review.</p>
            </TabsContent>
            <TabsContent value="finance">
              <p>3 financial reports require your attention.</p>
            </TabsContent>
            <TabsContent value="notifications">
              <p>You have 12 unread notifications.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pills Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Pills Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="security" variant="pills" size="lg">
            <TabsList variant="pills" size="lg">
              <TabsTrigger 
                value="security" 
                variant="pills" 
                icon={<Shield className="w-4 h-4" />}
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                variant="pills" 
                icon={<Heart className="w-4 h-4" />}
                badge="5"
              >
                Favorites
              </TabsTrigger>
              <TabsTrigger 
                value="starred" 
                variant="pills" 
                icon={<Star className="w-4 h-4" />}
                badge="2"
              >
                Starred
              </TabsTrigger>
            </TabsList>
            <TabsContent value="security">
              <p>Security settings and configurations.</p>
            </TabsContent>
            <TabsContent value="favorites">
              <p>Your 5 favorite items are displayed here.</p>
            </TabsContent>
            <TabsContent value="starred">
              <p>2 starred items for quick access.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Underline Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Underline Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" variant="underline" size="sm">
            <TabsList variant="underline" size="sm">
              <TabsTrigger value="performance" variant="underline">Performance</TabsTrigger>
              <TabsTrigger value="metrics" variant="underline" badge="24">Metrics</TabsTrigger>
              <TabsTrigger value="logs" variant="underline">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="performance">
              <p>System performance overview and statistics.</p>
            </TabsContent>
            <TabsContent value="metrics">
              <p>24 metrics are being tracked and monitored.</p>
            </TabsContent>
            <TabsContent value="logs">
              <p>Application logs and debugging information.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bordered Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Bordered Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="projects" variant="bordered" size="md">
            <TabsList variant="bordered" size="md">
              <TabsTrigger value="projects" variant="bordered" badge="3">Projects</TabsTrigger>
              <TabsTrigger value="tasks" variant="bordered" badge="15">Tasks</TabsTrigger>
              <TabsTrigger value="calendar" variant="bordered">Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="projects">
              <p>You have 3 active projects in progress.</p>
            </TabsContent>
            <TabsContent value="tasks">
              <p>15 tasks are pending completion.</p>
            </TabsContent>
            <TabsContent value="calendar">
              <p>View your calendar and upcoming events.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* TabsGroup Compound Component */}
      <Card>
        <CardHeader>
          <CardTitle>TabsGroup Compound Component</CardTitle>
          <p className="text-sm text-muted-foreground">
            Simplified API using the TabsGroup component with an array of items
          </p>
        </CardHeader>
        <CardContent>
          <TabsGroup
            defaultValue="overview"
            variant="default"
            size="md"
            items={dashboardTabs}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Animation Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Animation Features</CardTitle>
          <p className="text-sm text-muted-foreground">
            TabsContent supports smooth animations during transitions
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="animated1" variant="pills">
            <TabsList variant="pills">
              <TabsTrigger value="animated1" variant="pills">Smooth Transition</TabsTrigger>
              <TabsTrigger value="animated2" variant="pills">Fade Effect</TabsTrigger>
              <TabsTrigger value="animated3" variant="pills">Scale Animation</TabsTrigger>
            </TabsList>
            <TabsContent value="animated1" animated={true}>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Smooth Transitions</h3>
                <p>Content appears with smooth fade and scale animations.</p>
              </div>
            </TabsContent>
            <TabsContent value="animated2" animated={true}>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Fade Effects</h3>
                <p>Beautiful fade transitions make the interface feel responsive.</p>
              </div>
            </TabsContent>
            <TabsContent value="animated3" animated={true}>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Scale Animations</h3>
                <p>Subtle scale effects enhance the user experience.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
