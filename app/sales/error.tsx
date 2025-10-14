"use client"

import { useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Sales route error:", error)
  }, [error])

  return (
    <PageLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">An unexpected error occurred while loading Sales.</p>
            {error?.message && (
              <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded">{error.message}</pre>
            )}
            <div className="flex gap-2">
              <Button onClick={() => reset()}>
                Try again
              </Button>
              <Button variant="outline" onClick={() => location.reload()}>
                Reload page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}


