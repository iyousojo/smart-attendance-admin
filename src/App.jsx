import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages & Components
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Geofence from './pages/Geofence'; 
import Sessions from './pages/BroadcastLog'; 
import Profile from './pages/Profile';
import Loader from './components/ui/Loader';
import QRBroadcast from './components/ui/QRBroadcast';

const API_BASE = import.meta.env.VITE_API_URL || "https://studentattendanceapi-v4hq.onrender.com/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const handleRegister = async (registrationData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });
      
      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        return true; // Logic: Signal success to the component
      } else {
        alert(data.message || "Registration Failed");
        return false;
      }
    } catch (err) {
      alert("Connection Error. Check your backend status.");
      return false;
    }
  };

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'student') {
          alert("ACCESS DENIED: Faculty Terminal is reserved for authorized personnel.");
          return;
        }
        localStorage.setItem('token', data.token);
        handleUpdateUser(data.user);
        setIsAuthenticated(true);
      } else {
        alert(data.message || "Login Failed");
      }
    } catch (err) {
      alert("Terminal Connection Error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleViewLocation = (coords) => {
    if (coords && coords[0] && coords[1]) {
      // For internal routes, it is better to use a navigate wrapper, 
      // but if used outside a hook context, this works with vercel.json rewrites.
      window.location.href = `/geo?lat=${coords[0]}&lng=${coords[1]}`;
    }
  };

  if (isLoading) return <Loader message="Connecting to Node..." />;

  return (
    <Router>
      <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
        {isAuthenticated && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen} 
            user={user}
            activeSessionCount={sessions.filter(s => s.status === 'active').length}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto no-scrollbar">
            <Routes>
              <Route path="/" element={!isAuthenticated ? <Welcome /> : <Navigate to="/dashboard" />} />
              <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={<Register onRegister={handleRegister} />} />

              <Route path="/dashboard" element={isAuthenticated ? <Dashboard user={user} setIsSidebarOpen={setIsSidebarOpen} /> : <Navigate to="/login" />} />
              <Route path="/sessions" element={isAuthenticated ? <Sessions sessions={sessions} onSelectSession={setSelectedSession} setIsSidebarOpen={setIsSidebarOpen} /> : <Navigate to="/login" />} />
              <Route path="/students" element={isAuthenticated ? <Students setIsSidebarOpen={setIsSidebarOpen} onViewLocation={handleViewLocation} /> : <Navigate to="/login" />} />
              <Route path="/geo" element={isAuthenticated ? <Geofence setIsSidebarOpen={setIsSidebarOpen} /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isAuthenticated ? <Profile user={user} onLogout={handleLogout} onOpenSidebar={() => setIsSidebarOpen(true)} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>

        {selectedSession && (
          <QRBroadcast sessionData={selectedSession} onClose={() => setSelectedSession(null)} />
        )}
      </div>
    </Router>
  );
}

export default App;