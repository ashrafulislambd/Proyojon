import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Colorful Navigation */}
        <nav style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              {/* Brand Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(16, 185, 129, 0.25)'
                }}>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    letterSpacing: '-0.5px'
                  }}>
                    Proyojon
                  </span>
                </div>
              </Link>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3">
                {/* Shop Button */}
                <Link
                  to="/"
                  className="transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(236, 72, 153, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(236, 72, 153, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(236, 72, 153, 0.25)';
                  }}
                >
                  Shop
                </Link>

                {/* Dashboard Button */}
                <Link
                  to="/dashboard/1"
                  className="transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(139, 92, 246, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(139, 92, 246, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.25)';
                  }}
                >
                  Dashboard
                </Link>

                {/* Admin Button */}
                <Link
                  to="/admin/login"
                  className="transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(33, 150, 243, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(33, 150, 243, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.25)';
                  }}
                >
                  Admin
                </Link>

                {/* Login Button */}
                <Link
                  to="/login"
                  className="transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(245, 158, 11, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(245, 158, 11, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.25)';
                  }}
                >
                  Login
                </Link>

                {/* Register Button */}
                <Link
                  to="/register"
                  className="transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.25)';
                  }}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/:userId" element={<Dashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
