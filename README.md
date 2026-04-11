🛡️ Faculty Terminal | Web Administration Portal
The Faculty Terminal is the centralized web interface for the Smart Attendance System. It is designed specifically for academic staff and administrators to manage geofencing, broadcast attendance sessions via QR codes, and monitor student activity in real-time.

🚀 Core Features
Hardware Binding: Securely links browser sessions to a unique System ID.

Broadcast Node: Generate and cycle dynamic QR codes for live attendance.

Geofence Control: Define \"Safe Zones\" using GPS coordinates (Leaflet maps) for valid check-ins; live student tracking.

Student Management: View enrolled students, live signals/counts.

Session Broadcast: Start QR sessions w/ dynamic security salt, view logs (BroadcastLog).

Dashboard: Overview of sessions, profile stats (attended/late counts).

Identity Enforcement: Automatic rejection of student-role logins to ensure portal integrity.

🛠️ Tech Stack
Framework: React 19 (^19.0.0, react-router-dom ^7.13.1)

Build Tool: Vite (^6.0.0)

Styling: Tailwind CSS (^3.4.19) w/ custom theme (bone/stone/accentAmber)

Icons: Lucide React (^0.284.0)

Maps: Leaflet + react-leaflet (^1.9.4, ^5.0.0)

QR: qrcode.react (^4.2.0)

HTTP: Axios (^1.6.0)

📦 Installation & Setup
Clone the Repository

```bash
git clone <your-repo-url>
cd smart-attendance-admin
```

Install Dependencies

```bash
npm install
```

Environment Configuration
Create a `.env` file in the root directory:

```
REACT_APP_API_URL=https://studentattendanceapi-v4hq.onrender.com/api
```

Launch Development Server

```bash
npm run dev
```

🏗️ Production Build & Deployment
Building for Production
To create an optimized bundle:

```bash
npm run build
```

**Deploy to Vercel** (vercel.json configured):

1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Auto-deploy on push

Or CLI: `vercel --prod`

🔒 Security Protocols
Role-Based Access Control (RBAC): The frontend strictly enforces professor and admin roles.

Token-Based Auth: JWT tokens are stored in localStorage for session persistence.

System Fingerprinting: Generates a unique WEB- prefixed ID based on browser/hardware specs to prevent unauthorized multi-device hijacking.

📂 Project Structure
```
src/
├── components/
│   ├── layout/       # Sidebar.jsx
│   └── ui/           # Loader.jsx, QRBroadcast.jsx, SessionModal.jsx
├── pages/            # Dashboard.jsx, Geofence.jsx (maps), Students.jsx (live list), 
│                     # BroadcastLog.jsx, Profile.jsx (stats), Login.jsx, Register.jsx, Welcome.jsx
├── services/         # api.js (auth, sessions, geofence)
├── App.jsx           # Main app, routing, auth guard
├── main.jsx          # Entry point
└── utils/            # Helpers
```

🛠️ Troubleshooting & FAQ
1. **"Terminal Connection Error"**

   - Backend Sleep: Render free tier sleeps after 15min inactivity (30-50s wakeup).
   - CORS: Whitelist your domain in backend.
   - Mixed Content: Use HTTPS for API calls.

2. **"ACCESS DENIED: Faculty Only"**

   Update user role to 'professor' or 'admin' in MongoDB Atlas.

3. **QR Code Not Displaying**

   - Active session required.
   - Stable connection for security salt sync.

4. **Hardware ID Reset**

   DevTools > Application > Local Storage > Delete `system_id` > Refresh.

🛰️ API Endpoints (services/api.js)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Auth professor/admin, returns token |
| GET | `/auth/profile` | Fetch user profile/attendance stats |
| POST | `/attendance/session` | Start session `{name, lat, lng, radius}` |
| GET | `/attendance/list?sessionId=...` | Session attendance list |
| GET | `/attendance/professor/sessions` | Professor's active sessions |

