import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Timeline from './pages/Timeline'
import Comparateur from './pages/Comparateur'
import Simulateur from './pages/Simulateur'
import Settings from './pages/Settings'
import Amortissement from './pages/deepdive/Amortissement'
import Charges from './pages/deepdive/Charges'
import Fiscal from './pages/deepdive/Fiscal'
import Alternatives from './pages/deepdive/Alternatives'
import Provisions from './pages/deepdive/Provisions'

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: '#0f1117' }}>
          <Sidebar />
          <main style={{ flex: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/comparateur" element={<Comparateur />} />
              <Route path="/simulateur" element={<Simulateur />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/deepdive/amortissement" element={<Amortissement />} />
              <Route path="/deepdive/charges" element={<Charges />} />
              <Route path="/deepdive/fiscal" element={<Fiscal />} />
              <Route path="/deepdive/alternatives" element={<Alternatives />} />
              <Route path="/deepdive/provisions" element={<Provisions />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </DataProvider>
  )
}

export default App
