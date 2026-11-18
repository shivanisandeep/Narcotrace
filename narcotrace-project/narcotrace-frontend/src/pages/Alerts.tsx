import { AppShell } from '@/components/layout/AppShell'
import { AlertCard } from '@/components/ui/AlertCard'
import { EmptyState } from '@/components/ui/Feedback'
import { BellOff } from 'lucide-react'
import { alerts } from '@/lib/mock-data'

export default function Alerts() {
  return (
    <AppShell title="Alerts" subtitle={`${alerts.length} notifications`}>
      {alerts.length === 0 ? (
        <EmptyState icon={BellOff} title="No alerts" body="You're all caught up. New alerts will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
