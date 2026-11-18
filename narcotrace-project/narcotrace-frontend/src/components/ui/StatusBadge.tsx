import { cn } from '@/lib/utils'
import type { ResultVerdict, SyncStatus } from '@/types'
import { CheckCircle2, XCircle, HelpCircle, Loader2, CloudOff, Clock } from 'lucide-react'

const verdictConfig: Record<ResultVerdict, { label: string; classes: string; Icon: typeof CheckCircle2 }> = {
  positive: { label: 'Positive', classes: 'bg-evidence-950 text-evidence-400 border-evidence-500/40', Icon: CheckCircle2 },
  negative: { label: 'Negative', classes: 'bg-verified-950 text-verified-400 border-verified-500/40', Icon: XCircle },
  inconclusive: { label: 'Inconclusive', classes: 'bg-caution-950 text-caution-400 border-caution-500/40', Icon: HelpCircle },
}

const syncConfig: Record<SyncStatus, { label: string; classes: string; Icon: typeof CheckCircle2 }> = {
  synced: { label: 'Synced', classes: 'bg-verified-950 text-verified-400 border-verified-500/40', Icon: CheckCircle2 },
  pending: { label: 'Pending sync', classes: 'bg-ink-600 text-mist-500 border-line-600', Icon: Clock },
  uploading: { label: 'Uploading', classes: 'bg-signal-500/10 text-signal-400 border-signal-500/40', Icon: Loader2 },
  failed: { label: 'Sync failed', classes: 'bg-evidence-950 text-evidence-400 border-evidence-500/40', Icon: CloudOff },
}

export function VerdictBadge({ verdict, className }: { verdict: ResultVerdict; className?: string }) {
  const { label, classes, Icon } = verdictConfig[verdict]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium', classes, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

export function SyncBadge({ status, className }: { status: SyncStatus; className?: string }) {
  const { label, classes, Icon } = syncConfig[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium', classes, className)}>
      <Icon className={cn('h-3.5 w-3.5', status === 'uploading' && 'animate-spin')} />
      {label}
    </span>
  )
}
