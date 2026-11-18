import { NavLink } from 'react-router-dom'
import { ScanFace, Plus } from 'lucide-react'
import { primaryNav, secondaryNav } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { currentOfficer } from '@/lib/store'
import { useI18n, type TKey } from '@/lib/i18n'

export function Sidebar() {
  const { t } = useI18n()
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line-800 bg-ink-800 md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-evidence-500/15 text-evidence-400">
          <ScanFace className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-mist-100">VIGIL</p>
          <p className="text-[11px] leading-none text-mist-700 mt-0.5">SIH 2026 · SIH26231</p>
        </div>
      </div>

      <div className="px-3">
        <NavLink to="/test/new">
          <div className="mb-3 flex items-center justify-center gap-2 rounded-md bg-evidence-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-evidence-400">
            <Plus className="h-4 w-4" />
            {t('nav.startTest')}
          </div>
        </NavLink>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {primaryNav.map((item) => (
          <SideLink key={item.to} {...item} />
        ))}
        <p className="mt-5 px-3 text-[11px] font-medium uppercase tracking-wide text-mist-700">{t('nav.oversight')}</p>
        {secondaryNav.map((item) => (
          <SideLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-line-800 px-4 py-4">
        <p className="text-xs font-medium text-mist-100">{currentOfficer.name}</p>
        <p className="text-[11px] text-mist-700">{currentOfficer.officerId} · {currentOfficer.station}</p>
      </div>
    </aside>
  )
}

function SideLink({ to, tk, icon: Icon }: { to: string; label?: string; tk: TKey; icon: typeof Plus }) {
  const { t } = useI18n()
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
          isActive ? 'bg-ink-600 text-mist-100' : 'text-mist-500 hover:bg-ink-600/60 hover:text-mist-300'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {t(tk)}
    </NavLink>
  )
}
