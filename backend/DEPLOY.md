# Backend Deployment Guide - Render.com

Deploy your TradeTrakR signup backend to Render.com for free.

---

## 🚀 Quick Deploy

### Step 1: Prepare Repository

Your backend is ready at `/backend` folder with:
- ✅ `server.js` - Express server
- ✅ `database.js` - SQLite setup
- ✅ `package.json` - Dependencies
- ✅ `.env.example` - Environment template

### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign up (free)

2. **Click "New +" → "Web Service"**

3. **Connect GitHub**
   - Authorize Render to access your repos
   - Select: `VincentLaaa/tradetrakr-website`

4. **Configure Service**
   - **Name:** `tradetrakr-signup-api`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. **Add Environment Variable**
   - Click "Environment" tab
   - Add Variable:
     - **Key:** `ADMIN_SECRET`
     - **Value:** `tradetrakr_admin_key_01`

6. **Deploy!**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Copy your URL: `https://tradetrakr-signup-api.onrender.com`

### Step 3: Update Frontend

Edit `index.html` line ~1611:

```javascript
const TRIAL_MODAL_URL = "https://tradetrakr-signup-api.onrender.com";
```

---

## 🔒 Security

**CORS configured for:**
- `https://tradetrakr.com`
- `https://vincentlaaa.github.io`
- `http://localhost:5000` (local dev)

**Admin endpoints protected by:** `ADMIN_SECRET` header

---

## 📊 Endpoints

### POST `/api/signup`
Signup for 7-day trial

```bash
curl -X POST https://tradetrakr-signup-api.onrender.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### GET `/api/list` (Admin)
View all subscribers

```bash
curl -X GET https://tradetrakr-signup-api.onrender.com/api/list \
  -H "x-admin-secret: tradetrakr_admin_key_01"
```

### GET `/api/export` (Admin)
Download subscribers as CSV

```bash
curl -X GET https://tradetrakr-signup-api.onrender.com/api/export \
  -H "x-admin-secret: tradetrakr_admin_key_01" \
  -o subscribers.csv
```

### GET `/health`
Health check

```bash
curl https://tradetrakr-signup-api.onrender.com/health
```

---

## 🗄️ Database

SQLite database (`subscribers.db`) is automatically created and persisted on Render's filesystem.

**View database:**
Render Web Service → `shell` → `cd backend && sqlite3 subscribers.db "SELECT * FROM subscribers;"`

**Export CSV:**
See `/backend/ADMIN-EXPORT.md`

---

## 📝 Environment Variables

Required on Render:
```
ADMIN_SECRET=tradetrakr_admin_key_01
PORT=auto (set by Render)
```

Optional:
```
NODE_ENV=production
```

---

## 🐛 Troubleshooting

**Build fails:**
- Check `backend/package.json` has `"start": "node server.js"`
- Verify Node version (recommend 18+)

**Database locked error:**
- SQLite is single-threaded - normal for this use case
- Only one instance running

**CORS errors:**
- Verify your domain is in `corsOptions.origin` array
- Check backend logs on Render dashboard

---

## 📈 Monitoring

**View Logs:**
- Render Dashboard → Your Service → Logs

**Access Stats:**
- Monitor signups: `New subscriber: <email>`
- Monitor exports: `Admin CSV export accessed`

---

## ✅ Success

Once deployed:
1. Your backend URL: `https://tradetrakr-signup-api.onrender.com`
2. Update frontend `TRIAL_MODAL_URL`
3. Test signup flow end-to-end
4. Export subscribers as needed

---

**Deployment complete! 🚀**

