import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You dont have permission to access this page. If you believe this is a mistake, contact an administrator.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


