import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Timeline from './pages/Timeline'
import Comparateur from './pages/Comparateur'
import Simulateur from './pages/Simulateur'

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: '#0f1117' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/comparateur" element={<Comparateur />} />
            <Route path="/simulateur" element={<Simulateur />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
