🛡️ Faculty Terminal | Web Administration Portal
The Faculty Terminal is the centralized web interface for the Smart Attendance System. It is designed specifically for academic staff and administrators to manage geofencing, broadcast attendance sessions via QR codes, and monitor student activity in real-time.

🚀 Core Features
Hardware Binding: Securely links browser sessions to a unique System ID.

Broadcast Node: Generate and cycle dynamic QR codes for live attendance.

Geofence Control: Define "Safe Zones" using GPS coordinates for valid check-ins.

Student Registry: Comprehensive management of enrolled student profiles.

Identity Enforcement: Automatic rejection of student-role logins to ensure portal integrity.

🛠️ Tech Stack
Framework: React 19

Build Tool: Vite

Styling: Tailwind CSS

Icons: Lucide React

Routing: React Router v6

📦 Installation & Setup
Clone the Repository

Bash
git clone <your-repo-url>
cd faculty-terminal-web
Install Dependencies

Bash
npm install
Environment Configuration
Create a .env file in the root directory:

Code snippet
VITE_API_URL=https://studentattendanceapi-v4hq.onrender.com/api
Launch Development Server

Bash
npm run dev
🏗️ Production Build & Deployment
Building for Production
To create an optimized bundle for hosting (Vercel, Netlify, or Expo):

Bash
npm run build
Deploying via EAS (Optional)
If you wish to host the web build on Expo's global infrastructure:

Bash
npx expo export --platform web
eas deploy
🔒 Security Protocols
Role-Based Access Control (RBAC): The frontend strictly enforces professor and admin roles.

Token-Based Auth: JWT tokens are stored in localStorage for session persistence.

System Fingerprinting: Generates a unique WEB- prefixed ID based on browser/hardware specs to prevent unauthorized multi-device hijacking.

📂 Project Structure
Plaintext
src/
├── components/       # Reusable UI (Sidebar, Loader, QRBroadcast)
├── pages/            # View-level components (Dashboard, Geofence, etc.)
├── layout/           # Shared wrappers and navigation
├── App.jsx           # Main Routing and Role Security Logic
└── main.jsx          # Entry point
🛠️ Troubleshooting & FAQ1. "Terminal Connection Error"

  If the login screen shows this error, check the following:Backend Sleep:
 Your API is hosted on Render's free tier. If it hasn't been used in 15 minutes, it "sleeps." 
 The first request can take 30–50 seconds to wake it up.CORS Block: Ensure your Web URL (e.g., localhost:5173 or yourdomain.com) is whitelisted in the Node.js backend cors() configuration.Mixed Content: Ensure you are accessing the site via https if your API is https.

 2. "ACCESS DENIED: Faculty Only"Reason: You are logged in with an account where the role is set to student in the MongoDB database.Fix: Manually update the user's role to professor or admin in your database (MongoDB Atlas) to grant web access.
 
 3. QR Code Not DisplayingCheck: Verify that you have an active session in the Sessions tab.Network: The QR generator requires a stable internet connection to sync the dynamic "security salt" with the mobile app.

 4. Hardware ID ResetIf you need to clear the current "System ID" (for testing or device handover):Open Browser Developer Tools (F12).Go to Application > Local Storage.Right-click and Clear or delete the system_id key.Refresh the page; a new WEB- prefix ID will be generated.

 🛰️ API Endpoints UsedMethodEndpointDescription POST/auth/login Authenticates
 
  Faculty & binds DeviceID GET/sessions/active Fetches live QR broadcast data
  POST/geo/updateUpdates 

  the geofence coordinatesGET/students/logsRetrieves real-time attendance history