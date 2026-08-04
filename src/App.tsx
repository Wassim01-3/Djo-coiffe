import React from 'react'
import { ErrorBoundary } from '@app/ErrorBoundary'
import { Providers } from '@app/Providers'
import { AppRoutes } from '@app/AppRoutes'

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Providers>
        <AppRoutes />
      </Providers>
    </ErrorBoundary>
  )
}

export default App
