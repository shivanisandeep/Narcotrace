import { useParams } from 'react-router-dom'
import { FileX } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ChainOfCustodyTimeline } from '@/components/evidence/ChainOfCustodyTimeline'
import { EmptyState } from '@/components/ui/Feedback'
import { useAppData } from '@/lib/store'

export default function ChainOfCustody() {
  const { id } = useParams()
  const { getEvidence } = useAppData()
  const record = id ? getEvidence(id) : undefined

  if (!record) {
    return (
      <AppShell title="Chain of custody">
        <EmptyState icon={FileX} title="No matching record" body="This evidence ID doesn't exist on this device." />
      </AppShell>
    )
  }

  return (
    <AppShell title="Chain of custody" subtitle={`Evidence #${record.id} · Case ${record.caseId}`}>
      <div className="mx-auto max-w-2xl rounded-lg border border-line-800 bg-ink-700/40 p-5">
        <ChainOfCustodyTimeline events={record.custody} />
      </div>
    </AppShell>
  )
}
