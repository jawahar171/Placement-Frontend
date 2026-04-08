# College Placement Management System

A full-stack MERN application for managing college placements — students, companies, interviews, drives, and analytics.

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, TailwindCSS, Recharts, Socket.io-client |
| Backend   | Node.js, Express.js, MongoDB (Mongoose), Socket.io |
| Auth      | JWT + bcryptjs |
| File Upload | Cloudinary (resumes & images) |
| Email     | Nodemailer (Gmail SMTP) |
| Video     | Daily.co API |
| Deploy    | Netlify (frontend) + Render (backend) |

---

## Project Structure

```
placement-system/
├── backend/
│   ├── config/          # Cloudinary config
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Email, video, notifications
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── components/  # Layouts, common UI
    │   ├── context/     # Auth, Notifications
    │   ├── pages/       # student/, company/, admin/, auth/
    │   └── utils/       # Axios instance
    └── public/          # Static files
```

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/placement-system.git
cd placement-system

# Backend
cd backend
npm install
cp .env.example .env   # fill in values

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure `.env` (backend)

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/placement_db
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password   # Gmail App Password, not account password

DAILY_API_KEY=your_daily_co_key   # optional, works without for dev

CLIENT_URL=http://localhost:5173
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Visit: **http://localhost:5173**

---

## Seed Demo Users

Run this once after starting the backend:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@demo.com","password":"password123","role":"admin"}'

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"student@demo.com","password":"password123","role":"student","rollNumber":"21CS001","department":"CSE","batch":"2021-2025"}'

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"HR Manager","email":"company@demo.com","password":"password123","role":"company","companyName":"TechCorp India","industry":"Technology"}'
```

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add all environment variables from `.env`
5. Deploy → copy the URL (e.g. `https://placement-api.onrender.com`)

### Frontend → Netlify

1. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
2. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add environment variables:
   - `VITE_API_URL` = `https://placement-api.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://placement-api.onrender.com`
4. Deploy

---

## Features

### Student Portal
- Browse & apply for jobs (with eligibility check)
- Track application status & timeline
- View & join video interviews (Daily.co)
- Register for placement drives
- Upload resume (Cloudinary)
- Profile management with academic records

### Company Portal
- Post job listings with eligibility criteria
- Review applications (shortlist / reject / offer)
- Schedule interviews (virtual / in-person)
- Submit interview feedback with ratings
- Send offer letters with package details

### Admin Panel
- Full student management (bulk status updates, export CSV)
- Company account management
- Create & manage placement drives with schedules
- All-interviews calendar view grouped by date
- Analytics dashboard with Recharts:
  - Placement rate donut chart
  - Monthly offer trend line chart
  - Department-wise bar chart
  - Package distribution chart
  - Top hiring companies

### Real-time
- Socket.io notifications for application updates, interview scheduling
- Email notifications (Nodemailer) for all key events

---

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/students/dashboard` | Student |
| POST | `/api/applications/job/:jobId` | Student |
| GET | `/api/applications/company` | Company |
| PATCH | `/api/applications/:id/status` | Company/Admin |
| POST | `/api/interviews/schedule` | Company/Admin |
| GET | `/api/reports/stats` | Admin |
| GET | `/api/reports/export` | Admin |

Full API documentation available via console logs in development mode.

---

## License

Open source — feel free to use, modify, and deploy.
