import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import ReactQueryDevtoolsPortal from './components/ReactQueryDevtoolsPortal'
import BackgroundQueries from './components/BackgroundQueries'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Initialize global error handler
import './utils/globalErrorHandler'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && <BackgroundQueries />}
      {import.meta.env.DEV && <ReactQueryDevtoolsPortal />}
    </QueryClientProvider>
  </React.StrictMode>,
)
