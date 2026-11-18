import { Link } from 'react-router-dom'
import type { EvidenceRecord } from '@/types'
import { VerdictBadge, SyncBadge } from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/lib/utils'

export function EvidenceTable({ records }: { records: EvidenceRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line-800">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-line-800 bg-ink-700/60 text-xs font-medium text-mist-500">
            <th className="px-4 py-3">Evidence ID</th>
            <th className="px-4 py-3">Case ID</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Result</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Officer</th>
            <th className="px-4 py-3">Sync</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-line-800 last:border-0 hover:bg-ink-700/40">
              <td className="px-4 py-3">
                <Link to={`/evidence/${r.id}`} className="font-mono text-mist-100 hover:text-signal-400">
                  {r.id}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-mist-500">{r.caseId}</td>
              <td className="px-4 py-3 tabular text-mist-300">{formatDateTime(r.timestamp)}</td>
              <td className="px-4 py-3"><VerdictBadge verdict={r.verdict} /></td>
              <td className="px-4 py-3 tabular text-mist-300">{r.confidence.toFixed(1)}%</td>
              <td className="px-4 py-3 text-mist-300">{r.location}</td>
              <td className="px-4 py-3 text-mist-300">{r.officerName}</td>
              <td className="px-4 py-3"><SyncBadge status={r.syncStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
