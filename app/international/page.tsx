import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Globe,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Building,
  MapPin,
  Calculator,
  FileText,
  AlertTriangle,
  CheckCircle,
  Banknote,
} from "lucide-react"

export default function InternationalPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">International & Multi-Currency</h1>
          <p className="text-muted-foreground">Global business operations and currency management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Rates
          </Button>
          <Button>
            <Globe className="mr-2 h-4 w-4" />
            Add Currency
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
          <TabsTrigger value="exchange">Exchange Rates</TabsTrigger>
          <TabsTrigger value="compliance">Tax Compliance</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Currencies</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Across 12 countries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value (USD)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,847,500</div>
                <p className="text-xs text-muted-foreground">+5.2% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FX Exposure</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$184,200</div>
                <p className="text-xs text-muted-foreground">Unrealized gains</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tax Jurisdictions</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Active compliance</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Currency Portfolio</CardTitle>
                <CardDescription>Current holdings across all currencies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-xs font-medium">USD</span>
                      </div>
                      <div>
                        <p className="font-medium">US Dollar</p>
                        <p className="text-sm text-muted-foreground">Base currency</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$1,847,500</p>
                      <p className="text-sm text-muted-foreground">64.9%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <span className="text-xs font-medium">EUR</span>
                      </div>
                      <div>
                        <p className="font-medium">Euro</p>
                        <p className="text-sm text-muted-foreground">€420,000</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$462,000</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +2.1%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                        <span className="text-xs font-medium">GBP</span>
                      </div>
                      <div>
                        <p className="font-medium">British Pound</p>
                        <p className="text-sm text-muted-foreground">£180,000</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$225,000</p>
                      <p className="text-sm text-red-600 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -1.3%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                        <span className="text-xs font-medium">CAD</span>
                      </div>
                      <div>
                        <p className="font-medium">Canadian Dollar</p>
                        <p className="text-sm text-muted-foreground">C$420,000</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$312,000</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +0.8%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>International Operations</CardTitle>
                <CardDescription>Business presence by country</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">United States</p>
                        <p className="text-sm text-muted-foreground">Headquarters • USD</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">United Kingdom</p>
                        <p className="text-sm text-muted-foreground">Branch Office • GBP</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Germany</p>
                        <p className="text-sm text-muted-foreground">Subsidiary • EUR</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Setup
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        <MapPin className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Canada</p>
                        <p className="text-sm text-muted-foreground">Sales Office • CAD</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="currencies" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Currency Management</h2>
            <div className="flex space-x-2">
              <Select defaultValue="usd">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">Base: USD</SelectItem>
                  <SelectItem value="eur">Base: EUR</SelectItem>
                  <SelectItem value="gbp">Base: GBP</SelectItem>
                </SelectContent>
              </Select>
              <Button>Add Currency</Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Banknote className="h-5 w-5" />
                    <span>US Dollar (USD)</span>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Base
                  </Badge>
                </CardTitle>
                <CardDescription>United States Dollar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Current Balance</span>
                  <span className="font-medium">$1,847,500.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Exchange Rate</span>
                  <span className="font-medium">1.0000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm text-muted-foreground">Base currency</span>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  View Transactions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Banknote className="h-5 w-5" />
                    <span>Euro (EUR)</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </CardTitle>
                <CardDescription>European Union Euro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Current Balance</span>
                  <span className="font-medium">€420,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Exchange Rate</span>
                  <span className="font-medium text-green-600">1.1000 (+2.1%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">USD Equivalent</span>
                  <span className="font-medium">$462,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm text-muted-foreground">2 min ago</span>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  View Transactions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Banknote className="h-5 w-5" />
                    <span>British Pound (GBP)</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </CardTitle>
                <CardDescription>British Pound Sterling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Current Balance</span>
                  <span className="font-medium">£180,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Exchange Rate</span>
                  <span className="font-medium text-red-600">1.2500 (-1.3%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">USD Equivalent</span>
                  <span className="font-medium">$225,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm text-muted-foreground">1 min ago</span>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  View Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exchange" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rate Management</CardTitle>
              <CardDescription>Real-time currency exchange rates and historical data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  Exchange rates are updated every 5 minutes during market hours. Last update: 2 minutes ago.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Rates (USD Base)</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <span className="text-xs font-medium">EUR</span>
                        </div>
                        <span className="font-medium">EUR/USD</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">1.1000</p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +2.1%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                          <span className="text-xs font-medium">GBP</span>
                        </div>
                        <span className="font-medium">GBP/USD</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">1.2500</p>
                        <p className="text-sm text-red-600 flex items-center">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          -1.3%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                          <span className="text-xs font-medium">CAD</span>
                        </div>
                        <span className="font-medium">CAD/USD</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">0.7429</p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +0.8%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                          <span className="text-xs font-medium">JPY</span>
                        </div>
                        <span className="font-medium">JPY/USD</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">0.0067</p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +1.2%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Rate Settings</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Auto-Update Rates</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Rates update every 5 minutes during market hours</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Rate Source</span>
                        <span className="text-sm font-medium">ECB + Fed</span>
                      </div>
                      <p className="text-sm text-muted-foreground">European Central Bank and Federal Reserve data</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Variance Alert</span>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          ±5%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Alert when rates change more than 5%</p>
                    </div>

                    <Button className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Update All Rates Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>International Tax Compliance</CardTitle>
              <CardDescription>Multi-jurisdiction tax obligations and compliance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">United States</p>
                    <p className="text-sm text-muted-foreground">Federal & State</p>
                    <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Compliant
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">United Kingdom</p>
                    <p className="text-sm text-muted-foreground">HMRC VAT & Corp Tax</p>
                    <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Compliant
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <Building className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Germany</p>
                    <p className="text-sm text-muted-foreground">VAT Registration</p>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Building className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Canada</p>
                    <p className="text-sm text-muted-foreground">GST/HST & Income</p>
                    <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Compliant
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Building className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Japan</p>
                    <p className="text-sm text-muted-foreground">Consumption Tax</p>
                    <Badge variant="outline">Not Required</Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <Building className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Australia</p>
                    <p className="text-sm text-muted-foreground">GST Registration</p>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Review Required
                    </Badge>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  2 jurisdictions require attention: Germany VAT registration pending, Australia GST review needed.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Multi-Currency P&L
                </CardTitle>
                <CardDescription>Profit & Loss across all currencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Reporting Period</span>
                    <span className="text-sm font-medium">Q4 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Base Currency</span>
                    <span className="text-sm font-medium">USD</span>
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
                  FX Gain/Loss Report
                </CardTitle>
                <CardDescription>Foreign exchange impact analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Realized Gains</span>
                    <span className="text-sm font-medium text-green-600">+$24,580</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Unrealized Gains</span>
                    <span className="text-sm font-medium text-green-600">+$184,200</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <Calculator className="mr-2 h-4 w-4" />
                  View Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Country-wise Reports
                </CardTitle>
                <CardDescription>Localized financial statements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Countries</span>
                    <span className="text-sm font-medium">6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Compliance Status</span>
                    <span className="text-sm font-medium text-green-600">83% Complete</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <Building className="mr-2 h-4 w-4" />
                  View by Country
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
