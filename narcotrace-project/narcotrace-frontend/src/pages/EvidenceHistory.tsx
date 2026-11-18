import { useMemo, useState } from 'react'
import { Search, FileX } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { EvidenceTable } from '@/components/evidence/EvidenceTable'
import { EmptyState } from '@/components/ui/Feedback'
import { cn } from '@/lib/utils'
import { useAppData } from '@/lib/store'
import type { ResultVerdict, SyncStatus } from '@/types'

type VerdictFilter = 'all' | ResultVerdict
type SyncFilter = 'all' | SyncStatus

export default function EvidenceHistory() {
  const { evidence } = useAppData()
  const [query, setQuery] = useState('')
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('all')
  const [syncFilter, setSyncFilter] = useState<SyncFilter>('all')

  const filtered = useMemo(() => {
    return evidence.filter((r) => {
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || r.id.toLowerCase().includes(q) || r.caseId.toLowerCase().includes(q)
      const matchesVerdict = verdictFilter === 'all' || r.verdict === verdictFilter
      const matchesSync = syncFilter === 'all' || r.syncStatus === syncFilter
      return matchesQuery && matchesVerdict && matchesSync
    })
  }, [evidence, query, verdictFilter, syncFilter])

  return (
    <AppShell title="Evidence history" subtitle={`${evidence.length} records on this device`}>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-700" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search evidence ID or case ID..."
            className="w-full rounded-md border border-line-700 bg-ink-800 py-2.5 pl-9 pr-3 text-sm text-mist-100 outline-none focus:border-signal-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterGroup
            value={verdictFilter}
            onChange={setVerdictFilter}
            options={[
              { value: 'all', label: 'All results' },
              { value: 'positive', label: 'Positive' },
              { value: 'negative', label: 'Negative' },
              { value: 'inconclusive', label: 'Inconclusive' },
            ]}
          />
          <FilterGroup
            value={syncFilter}
            onChange={setSyncFilter}
            options={[
              { value: 'all', label: 'All sync' },
              { value: 'synced', label: 'Synced' },
              { value: 'pending', label: 'Pending sync' },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FileX} title="No matching evidence" body="Try a different search term or clear your filters." />
        ) : (
          <EvidenceTable records={filtered} />
        )}
      </div>
    </AppShell>
  )
}

function FilterGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md border px-3 py-1.5 text-xs font-medium',
            value === o.value ? 'border-signal-500/50 bg-signal-500/10 text-signal-400' : 'border-line-700 text-mist-500 hover:text-mist-300'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
