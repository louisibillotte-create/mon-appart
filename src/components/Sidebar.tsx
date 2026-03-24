import { NavLink } from 'react-router-dom'

const mainLinks = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/timeline', label: 'Timeline', icon: '◎' },
  { to: '/comparateur', label: 'Comparateur', icon: '⇄' },
  { to: '/simulateur', label: 'Simulateur', icon: '◈' },
]

const analyseLinks = [
  { to: '/deepdive/amortissement', label: 'Amortissement', icon: '📊' },
  { to: '/deepdive/charges', label: 'Charges réelles', icon: '📋' },
  { to: '/deepdive/fiscal', label: 'Fiscal LMNP', icon: '🧾' },
  { to: '/deepdive/alternatives', label: 'vs Alternatives', icon: '⚖️' },
]

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 12px',
  marginBottom: 2,
  borderRadius: 8,
  textDecoration: 'none',
  color: isActive ? '#f1f5f9' : '#64748b',
  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
  fontWeight: isActive ? 600 : 400,
  fontSize: 13,
  transition: 'all 0.15s',
  borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
})

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: '#131720',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        padding: '24px 0',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            🏠
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>Mon Appart</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Suivi patrimonial</div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ padding: '0 12px' }}>
        {mainLinks.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} style={navLinkStyle}>
            <span style={{ fontSize: 15 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Analyses section */}
      <div style={{ padding: '16px 12px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: 6 }}>
          Analyses
        </div>
        {analyseLinks.map(link => (
          <NavLink key={link.to} to={link.to} style={navLinkStyle}>
            <span style={{ fontSize: 14 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Settings link */}
      <div style={{ padding: '0 12px 12px' }}>
        <NavLink to="/settings" style={navLinkStyle}>
          <span style={{ fontSize: 15 }}>⚙️</span>
          Paramètres & Données
        </NavLink>
      </div>

      {/* Footer card */}
      <div
        style={{
          margin: '0 12px',
          padding: '12px',
          background: 'rgba(99, 102, 241, 0.08)',
          borderRadius: 10,
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc', marginBottom: 4 }}>
          Appart Asnières
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>Depuis mars 2021</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>340 000 € d'achat</div>
      </div>
    </aside>
  )
}
