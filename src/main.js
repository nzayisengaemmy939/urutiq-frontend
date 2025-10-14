import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ReactQueryProvider } from './components/react-query-provider';
import { KeyboardNavigationProvider } from './components/keyboard-navigation-provider';
import App from './App';
import './styles/globals.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(ReactQueryProvider, { children: _jsx(BrowserRouter, { children: _jsx(KeyboardNavigationProvider, { children: _jsx(App, {}) }) }) }) }));
