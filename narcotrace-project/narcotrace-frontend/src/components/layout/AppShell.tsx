import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { TopBar } from './TopBar'

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-ink-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-8">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
