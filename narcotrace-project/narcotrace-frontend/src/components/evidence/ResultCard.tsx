import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react'
import type { EvidenceRecord } from '@/types'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import { cn } from '@/lib/utils'

const verdictStyle = {
  positive: { classes: 'border-evidence-500/40 bg-evidence-950', text: 'text-evidence-400', Icon: AlertTriangle, label: 'POSITIVE' },
  negative: { classes: 'border-verified-500/40 bg-verified-950', text: 'text-verified-400', Icon: CheckCircle2, label: 'NEGATIVE' },
  inconclusive: { classes: 'border-caution-500/40 bg-caution-950', text: 'text-caution-400', Icon: HelpCircle, label: 'INCONCLUSIVE' },
}

export function ResultCard({ record }: { record: EvidenceRecord }) {
  const style = verdictStyle[record.verdict]

  return (
    <div className={cn('rounded-xl border p-5', style.classes)}>
      <div className="flex items-center gap-2">
        <style.Icon className={cn('h-6 w-6', style.text)} />
        <p className={cn('text-2xl font-bold tracking-tight', style.text)}>{style.label}</p>
      </div>

      <p className="mt-1 text-sm text-mist-300">{record.substance}</p>

      <div className="mt-4">
        <ConfidenceMeter value={record.confidence} verdict={record.verdict} />
      </div>

      {record.verdict === 'inconclusive' && record.inconclusiveReasons && (
        <div className="mt-4 rounded-md border border-caution-500/30 bg-ink-900/40 p-3">
          <p className="text-xs font-medium text-caution-400">Reasons</p>
          <ul className="mt-1 list-inside list-disc text-xs text-mist-300">
            {record.inconclusiveReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-y-2 border-t border-line-800/70 pt-4 text-xs">
        <Row label="Test kit" value={record.testKitId} mono />
        <Row label="Reaction detected" value={record.reactionColor} />
        <Row label="Image quality" value={record.imageQuality} />
        <Row label="Calibration accuracy" value={`${record.calibrationAccuracy}%`} />
        <Row label="Analysis model" value={record.modelVersion} mono />
      </dl>

      <p className="mt-4 rounded-md bg-ink-900/50 p-3 text-xs text-mist-500">
        AI-assisted screening result. Confirmatory laboratory testing is recommended.
      </p>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-mist-700">{label}</dt>
      <dd className={cn('mt-0.5 font-medium text-mist-100', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}
