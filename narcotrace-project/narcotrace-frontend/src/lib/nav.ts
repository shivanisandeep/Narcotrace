import { Home, FlaskConical, FileStack, CloudUpload, User, LayoutDashboard, ShieldCheck, Bell } from 'lucide-react'

export const primaryNav = [
  { to: '/dashboard', label: 'Home', tk: 'nav.home' as const, icon: Home },
  { to: '/test/new', label: 'Tests', tk: 'nav.tests' as const, icon: FlaskConical },
  { to: '/evidence', label: 'Evidence', tk: 'nav.evidence' as const, icon: FileStack },
  { to: '/sync', label: 'Sync', tk: 'nav.sync' as const, icon: CloudUpload },
  { to: '/profile', label: 'Profile', tk: 'nav.profile' as const, icon: User },
]

export const secondaryNav = [
  { to: '/command', label: 'Command Center', tk: 'nav.command' as const, icon: LayoutDashboard },
  { to: '/security', label: 'Security', tk: 'nav.security' as const, icon: ShieldCheck },
  { to: '/alerts', label: 'Alerts', tk: 'nav.alerts' as const, icon: Bell },
]
