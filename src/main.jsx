import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import DownfieldOS from './DownfieldOS.jsx'
import { CLERK_PUBLISHABLE_KEY, isClerkConfigured } from './lib/clerk'

// Conditionally import ClerkProvider — only loads the bundle when key is set
const ClerkWrapper = isClerkConfigured
  ? React.lazy(() => import('@clerk/clerk-react').then(m => ({
      default: ({ children }) => <m.ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>{children}</m.ClerkProvider>
    })))
  : ({ children }) => children;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      <ClerkWrapper>
        <BrowserRouter>
          <DownfieldOS />
        </BrowserRouter>
      </ClerkWrapper>
    </React.Suspense>
  </React.StrictMode>,
)
