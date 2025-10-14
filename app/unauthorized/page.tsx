"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Unauthorized</CardTitle>
          <CardDescription>
            You don t have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake, contact your administrator or try a different account.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
            <Link href="/auth/login">
              <Button>Switch Account</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
