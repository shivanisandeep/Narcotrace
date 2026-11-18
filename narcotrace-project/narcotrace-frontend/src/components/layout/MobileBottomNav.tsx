import { useI18n, type TKey } from '@/lib/i18n'
import { NavLink, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { primaryNav } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const left = primaryNav.slice(0, 2)
  const right = primaryNav.slice(2)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line-800 bg-ink-800/95 backdrop-blur md:hidden">
      <div className="relative mx-auto flex h-16 max-w-md items-stretch justify-between px-2">
        {left.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="flex w-16 items-end justify-center">
          <button
            onClick={() => navigate('/test/new')}
            aria-label={t('nav.startTest')}
            className="mb-2 flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-evidence-500 text-white shadow-[0_0_0_4px_var(--color-ink-800)] active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {right.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ to, tk, icon: Icon }: { to: string; label?: string; tk: TKey; icon: typeof Plus }) {
  const { t } = useI18n()
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium',
          isActive ? 'text-evidence-400' : 'text-mist-500'
        )
      }
    >
      <Icon className="h-5 w-5" />
      {t(tk)}
    </NavLink>
  )
}
