import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  tone?: 'default' | 'evidence' | 'verified' | 'caution'
}) {
  const toneClasses: Record<string, string> = {
    default: 'text-mist-100',
    evidence: 'text-evidence-400',
    verified: 'text-verified-400',
    caution: 'text-caution-400',
  }
  return (
    <div className="rounded-lg border border-line-800 bg-ink-700/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-mist-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-mist-700" />}
      </div>
      <p className={cn('mt-2 text-2xl font-semibold tabular', toneClasses[tone])}>{value}</p>
      {sub && <p className="mt-1 text-xs text-mist-700">{sub}</p>}
    </div>
  )
}
