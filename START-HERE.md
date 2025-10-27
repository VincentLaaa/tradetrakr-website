# START HERE - 7-Day Trial Modal Setup

Your complete email signup system with auto-triggering modal popup is ready to deploy! 🚀

---

## ⚡ Quick Start (3 Steps)

### 1. Deploy Your Backend

```bash
# Already done! Your backend is at:
# /Users/vincentla/Desktop/Test Site/backend
```

Deploy to Render.com:
1. Go to [Render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Configure:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Add env var: `ADMIN_SECRET=your-secret-key`
4. Deploy & copy your URL

### 2. Update Backend URL in Frontend

Edit `index.html` line **1611**:

```javascript
const TRIAL_MODAL_URL = 'https://your-backend.onrender.com';
```

Replace with your Render.com URL.

### 3. Deploy to GitHub Pages

```bash
git add .
git commit -m "Add 7-day trial modal popup"
git push
```

Done! Modal appears automatically after 2 seconds on your live site.

---

## 🎯 What You Get

✅ **Auto-triggering modal** after 2 seconds  
✅ **Dark trading theme** matching your site (#0D0D0F + neon purple)  
✅ **Email submission** to backend API  
✅ **Success message** with auto-close after 3 seconds  
✅ **Mobile responsive** design  
✅ **Database storage** in SQLite  
✅ **Admin endpoint** to view subscribers  

---

## 📝 Modal Behavior

**Triggers:** Automatically after 2 seconds on homepage  
**Theme:** Dark (#0D0D0F) with neon purple accents (#7A2CF2)  
**Animation:** Smooth scale-in with backdrop blur  
**Close Options:** X button, "No thanks" button, ESC key, overlay click, auto-close on success

---

## 🧪 Test Locally

```bash
cd backend
npm start

# Then open index.html in browser
# Modal appears after 2 seconds!
```

---

## 📚 Documentation

- **TRIAL-MODAL-SETUP.md** - Complete modal setup guide
- **MODAL-IMPLEMENTATION-SUMMARY.md** - Technical details
- **SIGNUP-SETUP.md** - Backend setup instructions
- **INTEGRATION-GUIDE.md** - Deployment guide
- **QUICK-START.md** - Quick reference

---

## 🔍 View Subscribers

```bash
curl -X GET https://your-backend.onrender.com/api/list \
  -H "x-admin-secret: your-secret-key"
```

Export to CSV:
```bash
cd backend
sqlite3 -csv -header subscribers.db \
  "SELECT * FROM subscribers;" > subscribers.csv
```

---

**Ready to capture leads! 🚀**

