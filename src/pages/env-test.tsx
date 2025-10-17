// Environment Variables Test Page
// Add this to your frontend to test if env vars are working

import React from 'react';

export default function EnvTestPage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const jwtSecret = import.meta.env.VITE_JWT_SECRET;
  const tenantId = import.meta.env.VITE_DEMO_TENANT_ID;
  const companyId = import.meta.env.VITE_DEMO_COMPANY_ID;
  const mode = import.meta.env.MODE;

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      console.log('✅ API Connection successful:', data);
      alert('API Connection successful! Check console for details.');
    } catch (error) {
      console.error('❌ API Connection failed:', error);
      alert('API Connection failed! Check console for details.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Environment Variables Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Variables:</h2>
        <ul>
          <li><strong>VITE_API_URL:</strong> {apiUrl || '❌ Not set'}</li>
          <li><strong>VITE_JWT_SECRET:</strong> {jwtSecret || '❌ Not set'}</li>
          <li><strong>VITE_DEMO_TENANT_ID:</strong> {tenantId || '❌ Not set'}</li>
          <li><strong>VITE_DEMO_COMPANY_ID:</strong> {companyId || '❌ Not set'}</li>
          <li><strong>MODE:</strong> {mode || '❌ Not set'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>API Connection Test:</h2>
        <button 
          onClick={testApiConnection}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test API Connection
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>All Environment Variables:</h2>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '5px',
          overflow: 'auto'
        }}>
          {JSON.stringify(import.meta.env, null, 2)}
        </pre>
      </div>
    </div>
  );
}
