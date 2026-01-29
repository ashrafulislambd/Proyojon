import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user from storage', err);
        localStorage.removeItem('user');
      }
    }

    // Listen for storage changes
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser && updatedUser !== 'undefined') {
        try {
          setUser(JSON.parse(updatedUser));
        } catch (err) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear state and storage instantly
    localStorage.removeItem('user');
    setUser(null);
    // Smooth redirect to home
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Colorful Navigation */}
      <nav className="sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
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
              >
                Shop
              </Link>

              {/* Dashboard Button */}
              <Link
                to={user ? `/dashboard/${user.id}` : "/login"}
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
              >
                Admin
              </Link>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(239, 68, 68, 0.25)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(245, 158, 11, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  Login/Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
