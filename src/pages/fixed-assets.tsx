import { PageLayout } from '../components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Boxes, Wrench, DollarSign } from 'lucide-react'

export default function FixedAssetsPage() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fixed Assets</h1>
            <p className="text-gray-600 mt-1">Manage assets, depreciation, and disposals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <div className="text-blue-600">
                  <Boxes className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Depreciations</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <div className="text-green-600">
                  <Wrench className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Book Value</p>
                  <p className="text-2xl font-bold text-purple-600">$0.00</p>
                </div>
                <div className="text-purple-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Asset Register</CardTitle>
            <Badge variant="outline">0 assets</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-gray-500">
              <Boxes className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No assets yet</p>
              <p className="text-sm mt-1">Create assets to see them listed here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}


