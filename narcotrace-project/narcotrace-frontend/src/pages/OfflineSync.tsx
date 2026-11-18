import { CloudOff, RefreshCw } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { SyncQueue } from '@/components/evidence/SyncQueue'
import { useAppData } from '@/lib/store'
import { useOnlineStatus } from '@/lib/use-online'
import { useToast } from '@/components/ui/Feedback'

export default function OfflineSync() {
  const { evidence, syncAll, isSyncing } = useAppData()
  const online = useOnlineStatus()
  const { push } = useToast()

  const pending = evidence.filter((e) => e.syncStatus === 'pending' || e.syncStatus === 'uploading')
  const failed = evidence.filter((e) => e.syncStatus === 'failed')
  const synced = evidence.filter((e) => e.syncStatus === 'synced')
  const storageUsedGb = 2.4

  const handleSync = () => {
    syncAll()
    push('Synchronizing evidence to secure server…', 'info')
    setTimeout(() => push('All evidence synchronized', 'success'), 2000)
  }

  return (
    <AppShell title="Offline sync center">
      <div className="flex flex-col gap-4">
        {!online && (
          <div className="flex items-center gap-3 rounded-lg border border-caution-500/40 bg-caution-950 p-4">
            <CloudOff className="h-5 w-5 shrink-0 text-caution-400" />
            <div>
              <p className="text-sm font-semibold text-mist-100">Device currently offline</p>
              <p className="text-xs text-mist-300">Evidence will be securely stored on this device and synchronized automatically when connectivity is restored.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Pending uploads" value={pending.length} tone="caution" />
          <StatCard label="Synced" value={synced.length} tone="verified" />
          <StatCard label="Failed" value={failed.length} tone="evidence" />
          <StatCard label="Storage" value={`${storageUsedGb} GB`} sub="of 10 GB" />
        </div>

        <Button size="lg" className="w-full" onClick={handleSync} disabled={isSyncing || (pending.length === 0 && failed.length === 0)}>
          <RefreshCw className={isSyncing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          {isSyncing ? 'Syncing…' : 'Sync now'}
        </Button>

        <div>
          <p className="mb-2 text-sm font-semibold text-mist-100">Queue</p>
          <SyncQueue records={[...failed, ...pending, ...synced.slice(0, 3)]} />
        </div>
      </div>
    </AppShell>
  )
}
