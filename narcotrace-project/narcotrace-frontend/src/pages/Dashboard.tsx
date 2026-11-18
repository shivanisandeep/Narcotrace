import { Link } from 'react-router-dom'
import { Plus, Camera, Satellite, HardDrive, ShieldCheck, MapPin, Wifi } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatCard } from '@/components/ui/StatCard'
import { EvidenceCard } from '@/components/evidence/EvidenceCard'
import { useAppData, currentOfficer } from '@/lib/store'
import { useOnlineStatus } from '@/lib/use-online'

export default function Dashboard() {
  const { evidence } = useAppData()
  const online = useOnlineStatus()
  const today = evidence.slice(0, 4)
  const positives = evidence.filter((e) => e.verdict === 'positive').length
  const negatives = evidence.filter((e) => e.verdict === 'negative').length
  const inconclusive = evidence.filter((e) => e.verdict === 'inconclusive').length

  return (
    <AppShell title={`Good morning, ${currentOfficer.name.split(' ')[0]}`} subtitle={`${currentOfficer.officerId} · ${currentOfficer.station}`}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 text-xs text-mist-500 sm:grid-cols-4">
          <InfoPill icon={Satellite} label="GPS" value="Locked" tone="verified" />
          <InfoPill icon={Wifi} label="Network" value={online ? 'Online' : 'Offline'} tone={online ? 'verified' : 'caution'} />
          <InfoPill icon={MapPin} label="Location" value="Whitefield" />
          <InfoPill icon={ShieldCheck} label="Last sync" value="2 min ago" tone="verified" />
        </div>

        <Link
          to="/test/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-evidence-500 py-4 text-base font-semibold text-white shadow-lg shadow-evidence-500/10 hover:bg-evidence-400 active:scale-[0.99]"
        >
          <Plus className="h-5 w-5" />
          Start new test
        </Link>

        <section>
          <p className="mb-2 text-sm font-semibold text-mist-100">Today&apos;s activity</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Tests conducted" value={evidence.length} />
            <StatCard label="Positive" value={positives} tone="evidence" />
            <StatCard label="Negative" value={negatives} tone="verified" />
            <StatCard label="Inconclusive" value={inconclusive} tone="caution" />
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-semibold text-mist-100">Device status</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DeviceStatus icon={Camera} label="Camera" value="Ready" tone="verified" />
            <DeviceStatus icon={Satellite} label="GPS" value="Locked" tone="verified" />
            <DeviceStatus icon={HardDrive} label="Storage" value="72% available" tone="default" />
            <DeviceStatus icon={ShieldCheck} label="Security" value="Verified" tone="verified" />
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-mist-100">Recent evidence</p>
            <Link to="/evidence" className="text-xs font-medium text-signal-400 hover:text-signal-300">View all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {today.map((r) => (
              <EvidenceCard key={r.id} record={r} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function InfoPill({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: typeof Satellite
  label: string
  value: string
  tone?: 'default' | 'verified' | 'caution'
}) {
  const toneClass = tone === 'verified' ? 'text-verified-400' : tone === 'caution' ? 'text-caution-400' : 'text-mist-300'
  return (
    <div className="flex items-center gap-2 rounded-md border border-line-800 bg-ink-700/40 px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-mist-700" />
      <div className="min-w-0">
        <p className="leading-none text-mist-700">{label}</p>
        <p className={`truncate text-[13px] font-medium leading-tight ${toneClass}`}>{value}</p>
      </div>
    </div>
  )
}

function DeviceStatus({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Satellite
  label: string
  value: string
  tone: 'default' | 'verified'
}) {
  return (
    <div className="rounded-lg border border-line-800 bg-ink-700/40 p-3">
      <Icon className="h-4 w-4 text-mist-700" />
      <p className="mt-2 text-xs text-mist-500">{label}</p>
      <p className={`text-sm font-semibold ${tone === 'verified' ? 'text-verified-400' : 'text-mist-100'}`}>{value}</p>
    </div>
  )
}
