# TradeTrakR Email Signup - Complete Setup Guide

This guide walks you through deploying the signup API backend and connecting it to your GitHub Pages frontend.

---

## 📋 What Was Built

### Backend API (`/backend`)
- ✅ Node.js + Express server
- ✅ SQLite database for subscriber storage
- ✅ POST `/api/signup` endpoint with validation
- ✅ GET `/api/list` admin endpoint (protected)
- ✅ CORS enabled for GitHub Pages
- ✅ Email validation & duplicate prevention

### Frontend (`index.html`)
- ✅ Beautiful signup form section
- ✅ Fetch API integration
- ✅ Success/error messages
- ✅ Loading states with spinner
- ✅ Responsive design

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Create Environment File

Create `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:
```
PORT=3000
ADMIN_SECRET=some-strong-random-secret-key-123
```

### Step 3: Run the Server

```bash
npm start
```

Server starts on http://localhost:3000

Test it:
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🌐 Deploy Backend to Cloud

### Option A: Render.com (Recommended - Free)

1. Go to [Render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `tradetrakr-signup-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variable:
   - **Key**: `ADMIN_SECRET`
   - **Value**: `your-production-secret-key-here`
6. Click **"Create Web Service"**

**Your backend URL will be**: `https://tradetrakr-signup-api.onrender.com`

### Option B: Railway.app (Free)

1. Sign up at [Railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects Node.js
5. Add Environment Variables in **Variables** tab:
   - `ADMIN_SECRET`: `your-production-secret`
6. Deploy automatically starts

### Option C: Fly.io (Free)

```bash
cd backend
fly auth login
fly launch
fly deploy
```

---

## 🔗 Update Frontend Backend URL

Once your backend is deployed, update the frontend:

1. Open `index.html`
2. Find line 1295:
   ```javascript
   const BACKEND_URL = 'https://tradetrakr-signup-api.onrender.com';
   ```
3. Replace with your actual backend URL:
   ```javascript
   const BACKEND_URL = 'https://your-backend.onrender.com';
   ```

---

## ✨ Testing

### Test Locally

1. Start backend: `cd backend && npm start`
2. Open `index.html` in browser
3. Scroll to signup form
4. Enter email → click button
5. Check terminal for: `New subscriber: test@example.com`

### Test Deployed Backend

```bash
# Test signup
curl -X POST https://your-backend.onrender.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should return: {"message":"OK"}

# Test duplicate (should return 409)
curl -X POST https://your-backend.onrender.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should return: {"error":"Already subscribed"}
```

### View All Subscribers (Admin)

```bash
curl -X GET https://your-backend.onrender.com/api/list \
  -H "x-admin-secret: your-secret-key"
```

---

## 📁 File Structure

```
Test Site/
├── index.html              # Homepage with signup form
├── backend/                # Backend API server
│   ├── server.js           # Express server & routes
│   ├── database.js         # SQLite setup & queries
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   ├── .gitignore          # Git ignores
│   ├── README.md           # Backend documentation
│   └── subscribers.db      # Auto-generated database
└── SIGNUP-SETUP.md         # This file
```

---

## 🎯 API Endpoints

### POST `/api/signup`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Responses:**
- ✅ `200 OK` → `{"message": "OK"}`
- ⚠️ `409 Conflict` → `{"error": "Already subscribed"}`
- ❌ `400 Bad Request` → `{"error": "Invalid email"}`

### GET `/api/list` (Protected)

**Headers:**
```
x-admin-secret: your-secret-key
```

**Response:**
```json
{
  "count": 10,
  "subscribers": [
    {
      "id": 1,
      "email": "user@example.com",
      "created_at": "2025-01-15 10:30:00"
    }
  ]
}
```

---

## 🎨 Frontend Features

- **Email validation** - Client & server-side
- **Duplicate prevention** - Shows friendly error
- **Loading states** - Animated spinner
- **Success message** - "You're in! Check your inbox soon 🚀"
- **Error handling** - Network issues handled gracefully
- **Responsive design** - Mobile-friendly

---

## 🔒 Security Notes

1. **Change `ADMIN_SECRET`** in production
2. **Enable HTTPS** on backend (Render/Railway do this automatically)
3. **Database is public** - Consider encrypting sensitive data if storing PII
4. **Rate limiting** - Consider adding if you expect high traffic

---

## 📊 Database Schema

**Table: `subscribers`**

| Column     | Type     | Description                  |
|------------|----------|------------------------------|
| id         | INTEGER  | Primary key (auto-increment) |
| email      | TEXT     | Unique email address         |
| created_at | DATETIME | Timestamp of signup          |

**View database:**
```bash
sqlite3 backend/subscribers.db
SELECT * FROM subscribers;
```

**Export CSV:**
```bash
sqlite3 -csv -header backend/subscribers.db \
  "SELECT * FROM subscribers;" > subscribers.csv
```

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check `PORT` in `.env`
- Make sure SQLite is installed: `npm install sqlite3`

**CORS errors:**
- Backend includes CORS middleware by default
- If issues persist, check allowed origins

**Database locked:**
- SQLite is single-threaded
- One connection per instance (handled by `database.js`)

**Render.com deployment fails:**
- Verify `"start": "node server.js"` in package.json
- Check build logs for errors
- Ensure `PORT` environment variable is set

---

## 📈 Next Steps (Optional)

### Email Automation
- Integrate SendGrid, Mailgun, or Resend
- Send welcome email on signup
- 7-day trial reminders

### Analytics
- Add Google Analytics event tracking
- Monitor conversion rates
- Track signup funnel

### Additional Features
- Newsletter preferences
- Custom metadata per signup (UTM params, etc.)
- Export to CSV button

---

## ✅ Success Criteria

✅ Emails submitted from GitHub Pages frontend successfully store in backend database  
✅ Duplicate emails are rejected  
✅ Admin can export subscriber list  
✅ UI shows success message to user  
✅ System ready for future email campaign automation

---

**Built for TradeTrakR trading journal marketing campaigns 🚀**

