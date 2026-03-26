const API_BASE = process.env.REACT_APP_API_URL;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const api = {
  // --- AUTH ---
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() });
    return res.json();
  },

  // --- ATTENDANCE / GEOFENCE ---
  startSession: async (sessionData) => {
    const res = await fetch(`${API_BASE}/attendance/session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sessionData) // { name, lat, lng, radius }
    });
    return res.json();
  },

  getAttendanceList: async (sessionId) => {
    const res = await fetch(`${API_BASE}/attendance/list?sessionId=${sessionId}`, { 
      headers: getHeaders() 
    });
    return res.json();
  },

  getProfessorSessions: async () => {
    const res = await fetch(`${API_BASE}/attendance/professor/sessions`, { 
      headers: getHeaders() 
    });
    return res.json();
  }
};