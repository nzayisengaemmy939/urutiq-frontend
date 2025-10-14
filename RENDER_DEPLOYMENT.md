# Frontend Deployment Configuration for Render

## Render Static Site Configuration

### Build Command:
```bash
npm install && npm run build
```

### Publish Directory:
```
dist
```

### Environment Variables:
```
VITE_API_URL=https://urutiq-backend-clean-11.onrender.com
VITE_JWT_SECRET=dev-secret
VITE_DEMO_TENANT_ID=tenant_demo
VITE_DEMO_COMPANY_ID=seed-company-1
```

### Root Directory (if deploying from monorepo):
```
apps/frontend_vite
```

## Steps to Deploy:

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `apps/frontend_vite`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: Add the VITE_ variables above
5. Click "Create Static Site"
