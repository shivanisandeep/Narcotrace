import type { EvidenceRecord } from '@/types'
import { SyncBadge } from '@/components/ui/StatusBadge'

export function SyncQueue({ records }: { records: EvidenceRecord[] }) {
  if (records.length === 0) return null
  return (
    <div className="divide-y divide-line-800 rounded-lg border border-line-800">
      {records.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="font-mono text-sm text-mist-100">{r.id}</p>
            <p className="truncate text-xs text-mist-500">{r.substance} · {r.location}</p>
          </div>
          <SyncBadge status={r.syncStatus} />
        </div>
      ))}
    </div>
  )
}
