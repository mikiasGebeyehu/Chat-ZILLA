import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { applyThemeGlobally } from './lib/theme.js'

// Apply saved theme before React renders to avoid flash and ensure global theme works
const savedTheme = localStorage.getItem('theme') || 'light';
applyThemeGlobally(savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
