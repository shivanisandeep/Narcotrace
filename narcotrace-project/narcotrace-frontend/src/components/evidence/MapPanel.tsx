import { useState } from 'react'
import type { EvidenceRecord } from '@/types'
import { formatTime } from '@/lib/utils'
import { Link } from 'react-router-dom'

const BOUNDS = { minLat: 12.83, maxLat: 12.99, minLng: 77.62, maxLng: 77.76 }

function toPercent(record: EvidenceRecord) {
  const x = ((record.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100
  const y = 100 - ((record.lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100
  return { left: `${Math.min(95, Math.max(5, x))}%`, top: `${Math.min(92, Math.max(8, y))}%` }
}

const dotColor = { positive: 'bg-evidence-500', negative: 'bg-verified-500', inconclusive: 'bg-caution-500' }

export function MapPanel({ records }: { records: EvidenceRecord[] }) {
  const [active, setActive] = useState<EvidenceRecord | null>(null)

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-lg border border-line-800 bg-ink-800">
      {/* faux street grid */}
      <svg className="absolute inset-0 h-full w-full opacity-25" xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="var(--color-line-700)" strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="var(--color-line-700)" strokeWidth="1" />
        ))}
      </svg>

      {records.map((r) => (
        <button
          key={r.id}
          style={toPercent(r)}
          onClick={() => setActive(r)}
          className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-ink-800/60 ${dotColor[r.verdict]}`}
          aria-label={r.id}
        >
          <span className={`h-full w-full rounded-full ${dotColor[r.verdict]} animate-pulse-dot`} />
        </button>
      ))}

      {active && (
        <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-line-700 bg-ink-700/95 p-3 backdrop-blur sm:right-auto sm:w-64">
          <div className="flex items-center justify-between">
            <Link to={`/evidence/${active.id}`} className="font-mono text-sm font-medium text-mist-100 hover:text-signal-400">
              {active.id}
            </Link>
            <button onClick={() => setActive(null)} className="text-xs text-mist-700 hover:text-mist-300">✕</button>
          </div>
          <p className="mt-1 text-xs text-mist-500">Case {active.caseId} · {active.officerName}</p>
          <p className="text-xs text-mist-700 tabular">{formatTime(active.timestamp)} · {active.location}</p>
        </div>
      )}

      <div className="absolute right-3 top-3 rounded-md border border-line-700 bg-ink-700/90 px-2.5 py-1.5 text-[11px] text-mist-500">
        Live field map · demo overlay
      </div>
    </div>
  )
}
