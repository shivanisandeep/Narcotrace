import { Navigate, Outlet } from 'react-router-dom'
import { useAppData } from '@/lib/store'

export function RequireAuth() {
  const { isAuthenticated } = useAppData()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
