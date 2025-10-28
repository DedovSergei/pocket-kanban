// packages/client/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- 1. Import
import App from './App'
// import './index.css' // You might have this, it's fine

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- 2. Wrap App */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)