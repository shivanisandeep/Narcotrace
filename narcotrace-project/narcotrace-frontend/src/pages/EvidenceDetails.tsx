import { useParams, Link } from 'react-router-dom'
import { ShieldCheck, MapPin, Thermometer, Sun, Smartphone, ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { VerdictBadge, SyncBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { useAppData } from '@/lib/store'
import { Form6Panel, GenerateForm6Button, newForm6 } from '@/components/evidence/Form6Panel'
import { formatDateTime } from '@/lib/utils'
import { FileX } from 'lucide-react'

export default function EvidenceDetails() {
  const { id } = useParams()
  const { getEvidence, getForm6, saveForm6 } = useAppData()
  const record = id ? getEvidence(id) : undefined
  const form6 = id ? getForm6(id) : undefined

  if (!record) {
    return (
      <AppShell title="Evidence not found">
        <EmptyState icon={FileX} title="No matching record" body="This evidence ID doesn't exist on this device." />
      </AppShell>
    )
  }

  return (
    <AppShell title={`Evidence #${record.id}`} subtitle={`Case ${record.caseId}`}>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="flex items-center gap-2">
          <VerdictBadge verdict={record.verdict} />
          <SyncBadge status={record.syncStatus} />
        </div>

        <Section title="Test result">
          <p className="text-sm text-mist-300">{record.substance}</p>
          <p className="mt-1 text-xs text-mist-700 tabular">{formatDateTime(record.timestamp)}</p>
        </Section>

        <Section title="Case information">
          <Grid>
            <Row label="Case ID" value={record.caseId} mono />
            <Row label="Officer ID" value={`${record.officerId} · ${record.officerName}`} />
            <Row label="Test kit ID" value={record.testKitId} mono />
            <Row label="Sample ID" value={record.id} mono />
          </Grid>
        </Section>

        <Section title="AI analysis">
          <Grid>
            <Row label="Classification" value={record.verdict} />
            <Row label="Confidence" value={`${record.confidence.toFixed(1)}%`} />
            <Row label="Model version" value={record.modelVersion} mono />
            <Row label="Timestamp" value={formatDateTime(record.timestamp)} />
          </Grid>
        </Section>

        <Section title="Environmental data">
          <Grid>
            <Row label="GPS coordinates" value={`${record.lat.toFixed(4)}, ${record.lng.toFixed(4)}`} mono icon={MapPin} />
            <Row label="Location" value={record.location} />
            <Row label="Temperature" value={`${record.temperatureC}°C`} icon={Thermometer} />
            <Row label="Lighting" value={`${record.lightingLux} lux`} icon={Sun} />
            <Row label="Device" value={record.deviceId} mono icon={Smartphone} />
          </Grid>
        </Section>

        <Section title="Cryptographic integrity">
          <p className="text-xs font-medium text-mist-500">SHA-256 hash</p>
          <p className="mt-1 break-all rounded-md bg-ink-900/60 p-2.5 font-mono text-xs text-mist-300">{record.sha256}</p>
          <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-verified-400">
            <ShieldCheck className="h-4 w-4" />
            Image integrity verified
          </div>
          <p className="mt-1 text-xs text-mist-700">Evidence has not been modified since capture.</p>
        </Section>

        <Link to={`/evidence/${record.id}/custody`}>
          <Button variant="secondary" size="lg" className="w-full">
            View chain of custody
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        {form6 ? (
          <Form6Panel record={record} form={form6} onForm={saveForm6} onConfirm={saveForm6} />
        ) : (
          <GenerateForm6Button onClick={() => saveForm6(newForm6(record))} />
        )}
      </div>
    </AppShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line-800 bg-ink-700/40 p-4">
      <p className="mb-2.5 text-sm font-semibold text-mist-100">{title}</p>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function Row({ label, value, mono, icon: Icon }: { label: string; value: string; mono?: boolean; icon?: typeof MapPin }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-mist-700">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </dt>
      <dd className={`mt-0.5 text-sm font-medium text-mist-100 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
