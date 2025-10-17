// Environment Variables Test Component
import React from 'react';

const EnvTest: React.FC = () => {
  const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_JWT_SECRET: import.meta.env.VITE_JWT_SECRET,
    VITE_DEMO_TENANT_ID: import.meta.env.VITE_DEMO_TENANT_ID,
    VITE_DEMO_COMPANY_ID: import.meta.env.VITE_DEMO_COMPANY_ID,
    MODE: import.meta.env.MODE,
    NODE_ENV: import.meta.env.NODE_ENV,
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px' }}>
      <h3>🔧 Environment Variables Debug</h3>
      <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(envVars, null, 2)}
      </pre>
      <p><strong>Expected API URL:</strong> https://urutiq-backend-enhanced-bco4.onrender.com</p>
      <p><strong>Actual API URL:</strong> {envVars.VITE_API_URL}</p>
      <p><strong>Status:</strong> {envVars.VITE_API_URL === 'https://urutiq-backend-enhanced-bco4.onrender.com' ? '✅ Correct' : '❌ Wrong'}</p>
    </div>
  );
};

export default EnvTest;
