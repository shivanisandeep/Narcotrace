import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppDataProvider } from '@/lib/store'
import { LanguageProvider } from '@/lib/i18n'
import { ToastProvider } from '@/components/ui/Feedback'
import { RequireAuth } from '@/components/layout/RequireAuth'

import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import NewTest from '@/pages/NewTest'
import EvidenceDetails from '@/pages/EvidenceDetails'
import ChainOfCustody from '@/pages/ChainOfCustody'
import EvidenceHistory from '@/pages/EvidenceHistory'
import OfflineSync from '@/pages/OfflineSync'
import CommandCenter from '@/pages/CommandCenter'
import Alerts from '@/pages/Alerts'
import Security from '@/pages/Security'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <LanguageProvider>
    <AppDataProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/test/new" element={<NewTest />} />
              <Route path="/evidence" element={<EvidenceHistory />} />
              <Route path="/evidence/:id" element={<EvidenceDetails />} />
              <Route path="/evidence/:id/custody" element={<ChainOfCustody />} />
              <Route path="/sync" element={<OfflineSync />} />
              <Route path="/command" element={<CommandCenter />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/security" element={<Security />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppDataProvider>
    </LanguageProvider>
  )
}
