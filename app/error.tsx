"use client"

import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Global app error:", error)
  }, [error])

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto border rounded-md p-4">
        <div className="text-lg font-semibold mb-2">Unexpected error</div>
        <p className="text-sm text-muted-foreground mb-3">The application encountered an error.</p>
        {error?.message && (
          <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded border mb-3">{error.message}</pre>
        )}
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border" onClick={() => reset()}>Try again</button>
          <button className="px-3 py-1 rounded border" onClick={() => location.reload()}>Reload</button>
        </div>
      </div>
    </div>
  )
}


