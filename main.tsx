import ErrorBoundary from '@kombai/react-error-boundary'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import KombaiWrapper from './KombaiWrapper'
import Example from './main'
import './src/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <KombaiWrapper>
        <Example />
      </KombaiWrapper>
    </ErrorBoundary>
  </StrictMode>,
)
