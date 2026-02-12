import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import MapPage from './pages/MapPage'
import './App.css'

function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="app-nav">
      <Link 
        to="/admin" 
        className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
      >
        Device Admin
      </Link>
      <Link 
        to="/map" 
        className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}
      >
        Agent Map
      </Link>
    </nav>
  )
}

function AppContent() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <img src="/logo-small.png" alt="Moltworker" className="header-logo" />
          <h1>Moltbot Admin</h1>
        </div>
        <Navigation />
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/_admin">
      <AppContent />
    </BrowserRouter>
  )
}
