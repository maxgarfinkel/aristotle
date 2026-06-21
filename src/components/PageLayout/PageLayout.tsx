import type { ReactNode } from 'react'
import Header from '../Header/Header'

interface PageLayoutProps {
  children: ReactNode
  maxWidth?: 'lg' | '2xl'
}

export default function PageLayout({ children, maxWidth = '2xl' }: PageLayoutProps) {
  const containerClass = maxWidth === 'lg' ? 'mx-auto max-w-lg' : 'mx-auto max-w-2xl'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className={containerClass}>{children}</div>
      </main>
    </div>
  )
}
