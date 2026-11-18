import { AppShell } from '@/components/layout/AppShell'
import { SecurityRow, SecurityScoreGauge } from '@/components/evidence/SecurityCard'
import { currentOfficer } from '@/lib/store'

export default function Security() {
  return (
    <AppShell title="Security center" subtitle={currentOfficer.device}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-6">
        <SecurityScoreGauge score={98} />

        <div className="w-full rounded-lg border border-line-800 bg-ink-700/40 p-4">
          <SecurityRow label="Device status" value="Trusted" />
          <SecurityRow label="Encryption" value="AES-256 enabled" />
          <SecurityRow label="Evidence hashing" value="SHA-256 enabled" />
          <SecurityRow label="GPS integrity" value="Verified" />
          <SecurityRow label="Timestamp integrity" value="Verified" />
          <SecurityRow label="Database" value="Encrypted" />
          <SecurityRow label="Network" value="Secure" />
        </div>
      </div>
    </AppShell>
  )
}
