import type { ReactNode } from 'react'
import React from 'react'

interface EmptyLayoutProps {
  children: ReactNode
}

/** Minimal empty layout with no chrome */
const EmptyLayout: React.FC<EmptyLayoutProps> = ({ children }) => {
  return <>{children}</>
}

export default EmptyLayout
