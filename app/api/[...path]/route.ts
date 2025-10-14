import { NextRequest } from 'next/server'
import { config } from '@/lib/config'

const API_BASE = 'http://localhost:4000'

async function proxy(req: NextRequest, context: { params: { path: string[] } }) {
  const path = '/' + (context.params?.path || []).join('/')
  const targetUrl = API_BASE + '/api' + path + (req.nextUrl.search || '')

  const headers = new Headers()
  // forward essential headers
  const tenant = req.headers.get('x-tenant-id') || 'tenant_demo'
  headers.set('x-tenant-id', tenant)
  let auth = req.headers.get('authorization')
  headers.set('content-type', req.headers.get('content-type') || 'application/json')

  // Dev helper: obtain a demo token if missing Authorization
  if (!auth) {
    try {
      const tokenRes = await fetch(API_BASE + '/auth/demo-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sub: 'demo_user', roles: ['admin', 'accountant'] })
      })
      if (tokenRes.ok) {
        const { token } = await tokenRes.json()
        auth = `Bearer ${token}`
      }
    } catch {
      // ignore; backend may be down
    }
  }
  if (auth) headers.set('authorization', auth)

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET','HEAD'].includes(req.method) ? undefined : await req.text(),
    // include credentials if backend expects cookies in the future
  }

  let res = await fetch(targetUrl, init as any)
  // If unauthorized/forbidden, try to obtain a fresh admin/accountant token and retry once
  if (res.status === 401 || res.status === 403) {
    try {
      const tokenRes = await fetch(API_BASE + '/auth/demo-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-tenant-id': tenant },
        body: JSON.stringify({ sub: 'demo_user', roles: ['admin','accountant'] })
      })
      if (tokenRes.ok) {
        const { token } = await tokenRes.json()
        headers.set('authorization', `Bearer ${token}`)
        res = await fetch(targetUrl, { ...init, headers } as any)
      }
    } catch {}
  }
  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' }
  })
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS }


