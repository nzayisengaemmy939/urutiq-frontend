# Environment Setup

This document explains how to configure environment variables for the UrutiIQ application.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp env.example .env.local
   ```

2. **Update the values in `.env.local` as needed:**
   ```bash
   # For development (default)
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_JWT_SECRET=dev-secret
   NEXT_PUBLIC_DEMO_TENANT_ID=tenant_demo
   NEXT_PUBLIC_DEMO_COMPANY_ID=seed-company-1

   # For production
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NEXT_PUBLIC_JWT_SECRET=your-production-secret
   NEXT_PUBLIC_DEMO_TENANT_ID=your-tenant-id
   NEXT_PUBLIC_DEMO_COMPANY_ID=your-company-id
   ```

## Environment Variables

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000` | `https://api.urutiq.com` |
| `NEXT_PUBLIC_JWT_SECRET` | JWT secret for authentication | `dev-secret` | `your-secure-secret` |
| `NEXT_PUBLIC_DEMO_TENANT_ID` | Default tenant ID for demo | `tenant_demo` | `your-tenant-id` |
| `NEXT_PUBLIC_DEMO_COMPANY_ID` | Default company ID for demo | `seed-company-1` | `your-company-id` |

### Configuration Usage

The application uses a centralized configuration system in `lib/config.ts`:

```typescript
import { config, getApiUrl, getCompanyId, getTenantId } from '@/lib/config'

// Get API URL
const apiUrl = config.api.baseUrl

// Get company ID (from localStorage or default)
const companyId = getCompanyId()

// Get tenant ID (from localStorage or default)
const tenantId = getTenantId()

// Build API URLs
const endpointUrl = getApiUrl('/companies')
```

## Deployment

### Development
- Uses `http://localhost:4000` by default
- No additional setup required

### Production
1. Set `NEXT_PUBLIC_API_URL` to your production API URL
2. Set `NEXT_PUBLIC_JWT_SECRET` to a secure secret
3. Update tenant and company IDs as needed

### Docker
```dockerfile
ENV NEXT_PUBLIC_API_URL=https://your-api-domain.com
ENV NEXT_PUBLIC_JWT_SECRET=your-secure-secret
```

### Vercel/Netlify
Set environment variables in your deployment platform's dashboard or use their CLI:

```bash
# Vercel
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_JWT_SECRET

# Netlify
netlify env:set NEXT_PUBLIC_API_URL https://your-api-domain.com
netlify env:set NEXT_PUBLIC_JWT_SECRET your-secure-secret
```

## Benefits

- ✅ **No hardcoded URLs** - Easy to deploy to different environments
- ✅ **Centralized configuration** - Single source of truth for all settings
- ✅ **Type safety** - TypeScript support for all configuration
- ✅ **Fallback values** - Sensible defaults for development
- ✅ **Environment-specific** - Different settings for dev/staging/prod

## Migration from Hardcoded URLs

If you have existing code with hardcoded URLs, update them to use the config:

```typescript
// Before
const response = await fetch('http://localhost:4000/api/companies')

// After
import { getApiUrl } from '@/lib/config'
const response = await fetch(getApiUrl('/api/companies'))
```
