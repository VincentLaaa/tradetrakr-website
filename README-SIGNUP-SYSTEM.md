# TradeTrakR Email Signup System

A production-ready email collection system for 7-day free trial signups on your GitHub Pages website.

---

## 🎯 What This Does

Collects email addresses from your GitHub Pages site and stores them in a SQLite database for marketing campaigns, 7-day free trial promotions, and email automation.

---

## 📦 What's Included

### Frontend (`index.html`)
- ✅ Beautiful signup form with "Start Free 7-Day Trial" CTA
- ✅ Real-time success/error messages
- ✅ Loading states with animated spinner
- ✅ Fetch API integration to backend
- ✅ Mobile-responsive design
- ✅ Integrated into existing TradeTrakR homepage

### Backend (`/backend`)
- ✅ Node.js + Express API server
- ✅ SQLite database (subscribers.db)
- ✅ POST `/api/signup` endpoint
- ✅ GET `/api/list` admin endpoint (password-protected)
- ✅ Email validation & duplicate prevention
- ✅ CORS enabled for GitHub Pages
- ✅ Automatic timestamps

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

```bash
cd backend
echo "PORT=3000
ADMIN_SECRET=dev-secret-123" > .env
```

### 3. Start Backend

```bash
npm start
```

Server runs on http://localhost:3000

### 4. Test Locally

```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected: `{"message": "OK"}`

### 5. Deploy Backend to Render.com

1. Sign up at [Render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Configure:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Add env var: `ADMIN_SECRET=your-secret`
4. Deploy!

### 6. Update Frontend URL

Edit `index.html` line ~1295:

```javascript
const BACKEND_URL = 'https://your-backend.onrender.com';
```

### 7. Deploy to GitHub Pages

```bash
git add .
git commit -m "Add email signup system"
git push
```

---

## 📂 File Structure

```
├── index.html                 # Homepage with signup form (UPDATED)
├── backend/                   # Backend API (NEW)
│   ├── server.js             # Express server
│   ├── database.js           # SQLite setup
│   ├── package.json          # Dependencies
│   ├── .env                  # Environment variables
│   └── subscribers.db        # Auto-created database
├── SIGNUP-SETUP.md           # Detailed setup guide
├── INTEGRATION-GUIDE.md      # Deployment guide
└── README-SIGNUP-SYSTEM.md   # This file
```

---

## 🎨 Frontend Form Location

The signup form has been added to `index.html` between the **Pricing** and **Community** sections (around line 1095).

**Look for:**
- Section: "Start Your Free 7-Day Trial"
- Email input field
- "Start Free 7-Day Trial" button
- Success/error messages

---

## 🧪 Testing

### Test Frontend
1. Open `index.html` in browser
2. Scroll to signup form
3. Enter email and submit
4. Check backend terminal for logs

### Test Backend API
```bash
# Success
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# View all subscribers
curl -X GET http://localhost:3000/api/list \
  -H "x-admin-secret: dev-secret-123"
```

---

## 📊 API Reference

### POST `/api/signup`
```json
// Request
{"email": "user@example.com"}

// Responses
200: {"message": "OK"}
409: {"error": "Already subscribed"}
400: {"error": "Invalid email"}
```

### GET `/api/list` (Protected)
```bash
curl -X GET http://localhost:3000/api/list \
  -H "x-admin-secret: your-secret-key"
```

Returns: `{"count": 10, "subscribers": [...]}`

---

## 🔒 Security

- Admin endpoint requires secret key header
- SQLite database stores data locally on server
- Email validation prevents malicious input
- Duplicate email prevention
- CORS enabled for GitHub Pages domain

---

## 📈 Database Export

Export subscribers to CSV:

```bash
cd backend
sqlite3 -csv -header subscribers.db \
  "SELECT * FROM subscribers;" > subscribers.csv
```

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check `.env` file exists
- Verify PORT in environment variables

**Form not working:**
- Check browser console for errors
- Verify `BACKEND_URL` in `index.html`
- Test backend API with curl first

**CORS errors:**
- Backend has CORS middleware enabled
- Check if backend URL is correct

---

## ✅ Success Criteria

- ✅ Emails collected from frontend
- ✅ Stored in SQLite database
- ✅ Duplicate emails rejected
- ✅ Admin can view subscribers
- ✅ User sees success message
- ✅ Mobile-responsive design
- ✅ Ready for email automation

---

## 📚 Documentation

- **SIGNUP-SETUP.md** - Detailed setup instructions
- **INTEGRATION-GUIDE.md** - Deployment guide
- **backend/README.md** - Backend API docs

---

**Ready to collect leads for your 7-day free trial! 🚀**

