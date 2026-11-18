import { useNavigate } from 'react-router-dom'
import { Fingerprint, Lock, LogOut, ShieldCheck, Timer, User } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { useAppData, currentOfficer } from '@/lib/store'
import { useToast } from '@/components/ui/Feedback'

export default function Profile() {
  const { logout } = useAppData()
  const navigate = useNavigate()
  const { push } = useToast()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleLock = () => {
    push('Application locked', 'info')
  }

  return (
    <AppShell title="Profile">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="flex items-center gap-4 rounded-lg border border-line-800 bg-ink-700/40 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-600 text-mist-300">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-mist-100">{currentOfficer.name}</p>
            <p className="text-xs text-mist-500">{currentOfficer.officerId} · {currentOfficer.role}</p>
          </div>
        </div>

        <div className="rounded-lg border border-line-800 bg-ink-700/40 p-4">
          <p className="mb-2.5 text-sm font-semibold text-mist-100">Assignment</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-mist-700">Department</dt>
              <dd className="mt-0.5 font-medium text-mist-100">{currentOfficer.department}</dd>
            </div>
            <div>
              <dt className="text-xs text-mist-700">Assigned device</dt>
              <dd className="mt-0.5 font-mono font-medium text-mist-100">{currentOfficer.device}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-line-800 bg-ink-700/40 p-4">
          <p className="mb-2.5 text-sm font-semibold text-mist-100">Security</p>
          <div className="flex items-center justify-between border-b border-line-800 py-2.5">
            <span className="flex items-center gap-2 text-sm text-mist-300"><Fingerprint className="h-4 w-4 text-mist-700" />Biometric authentication</span>
            <ShieldCheck className="h-4 w-4 text-verified-400" />
          </div>
          <div className="flex items-center justify-between border-b border-line-800 py-2.5">
            <span className="flex items-center gap-2 text-sm text-mist-300"><Lock className="h-4 w-4 text-mist-700" />Device encryption</span>
            <ShieldCheck className="h-4 w-4 text-verified-400" />
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="flex items-center gap-2 text-sm text-mist-300"><Timer className="h-4 w-4 text-mist-700" />Session timeout</span>
            <span className="text-sm text-mist-500">5 minutes</span>
          </div>
        </div>

        <Button variant="secondary" size="lg" onClick={handleLock}>
          <Lock className="h-4 w-4" />
          Lock application
        </Button>
        <Button variant="danger" size="lg" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </AppShell>
  )
}
