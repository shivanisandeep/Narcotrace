import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanFace, Fingerprint, ShieldCheck, Lock, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppData } from '@/lib/store'
import { useToast } from '@/components/ui/Feedback'
import { useI18n } from '@/lib/i18n'
import { LanguageSelector } from '@/components/ui/LanguageSelector'

export default function Login() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { login } = useAppData()
  const { push } = useToast()
  const [officerId, setOfficerId] = useState('OFF-1042')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login()
      push('Signed in — device verified', 'success')
      navigate('/dashboard')
    }, 700)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-900 px-4">
      {/* forensic backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={`${(i * 37) % 100}%`} cy={`${(i * 53) % 100}%`} r="70" fill="none" stroke="white" strokeWidth="1" />
          ))}
        </svg>
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-evidence-500/5 to-transparent" />
      </div>

      <div className="fixed end-4 top-4 z-20"><LanguageSelector /></div>
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-line-700 bg-ink-700 text-evidence-400">
            <ScanFace className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-mist-100">VIGIL</h1>
          <p className="mt-1 text-sm text-mist-500">AI-assisted forensic field intelligence</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 rounded-xl border border-line-800 bg-ink-800 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-500">{t('login.officerId')}</label>
            <input
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full rounded-md border border-line-700 bg-ink-900 px-3 py-2.5 text-sm text-mist-100 outline-none focus:border-signal-500"
              placeholder="OFF-XXXX"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-500">{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line-700 bg-ink-900 px-3 py-2.5 text-sm text-mist-100 outline-none focus:border-signal-500"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-line-800 bg-ink-900/60 px-3 py-2 text-xs text-mist-500">
            <Fingerprint className="h-4 w-4 text-signal-400" />
            Device verification: NCB-FIELD-TAB-0087
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading || !officerId}>
            <Lock className="h-4 w-4" />
            {loading ? 'Verifying…' : t('login.secureLogin')}
          </Button>
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleLogin}>
            <Fingerprint className="h-4 w-4" />
            {t('login.deviceAuth')}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-mist-700">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-verified-400" /> Encrypted</span>
          <span className="flex items-center gap-1.5"><Fingerprint className="h-3.5 w-3.5 text-verified-400" /> Device verified</span>
          <span className="flex items-center gap-1.5"><WifiOff className="h-3.5 w-3.5 text-verified-400" /> Offline enabled</span>
        </div>
      </div>
    </div>
  )
}
