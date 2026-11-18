import type { ReactNode } from 'react'

export function ChartCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line-800 bg-ink-700/50 p-4">
      <p className="text-sm font-semibold text-mist-100">{title}</p>
      {sub && <p className="text-xs text-mist-500">{sub}</p>}
      <div className="mt-3">{children}</div>
    </div>
  )
}
