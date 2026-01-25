import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <nav className="bg-indigo-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">Proyojon</Link>
            <div className="space-x-4">
              <Link to="/" className="hover:text-indigo-200">Shop</Link>
              <Link to="/dashboard/1" className="hover:text-indigo-200">My Dashboard</Link>
              <Link to="/admin" className="hover:text-indigo-200">Admin</Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard/:userId" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
