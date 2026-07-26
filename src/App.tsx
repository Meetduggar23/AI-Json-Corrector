import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Workspace } from '@/pages/Workspace'
import ValidatorPage from '@/pages/Validator'
import RepairPage from '@/pages/Repair'
import BeautifyPage from '@/pages/Beautify'
import MinifyPage from '@/pages/Minify'
import SchemaPage from '@/pages/Schema'
import DiffPage from '@/pages/Diff'
import HistoryPage from '@/pages/History'
import SettingsPage from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import NotWorking from '@/pages/NotWorking'
function AppContent() {

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '12px',
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Workspace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/validator" element={<ValidatorPage />} />
          <Route path="/repair" element={<RepairPage />} />
          <Route path="/beautify" element={<BeautifyPage />} />
          <Route path="/minify" element={<MinifyPage />} />
          <Route path="/schema" element={<SchemaPage />} />
          <Route path="/diff" element={<DiffPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/oops" element={<NotWorking />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
