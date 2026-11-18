import { Link } from 'react-router-dom'
import { MapPin, ChevronRight } from 'lucide-react'
import type { EvidenceRecord } from '@/types'
import { VerdictBadge, SyncBadge } from '@/components/ui/StatusBadge'
import { formatTime } from '@/lib/utils'

export function EvidenceCard({ record }: { record: EvidenceRecord }) {
  return (
    <Link
      to={`/evidence/${record.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-line-800 bg-ink-700/50 p-4 hover:border-line-600 hover:bg-ink-700"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm font-medium text-mist-100">{record.id}</p>
          <VerdictBadge verdict={record.verdict} />
        </div>
        <p className="mt-1 truncate text-sm text-mist-300">{record.substance}</p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-mist-700">
          <span className="tabular">{formatTime(record.timestamp)}</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {record.location}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <SyncBadge status={record.syncStatus} />
        <ChevronRight className="h-4 w-4 text-mist-700" />
      </div>
    </Link>
  )
}
