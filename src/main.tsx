import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ReactQueryProvider } from './components/react-query-provider'
import { KeyboardNavigationProvider } from './components/keyboard-navigation-provider'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <BrowserRouter>
        <KeyboardNavigationProvider>
          <App />
        </KeyboardNavigationProvider>
      </BrowserRouter>
    </ReactQueryProvider>
  </React.StrictMode>,
)
