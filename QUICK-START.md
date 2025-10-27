# Quick Start - Email Signup System

Get your signup system running in **5 minutes**.

---

## Step 1: Install & Start Backend

```bash
cd backend
npm install
npm start
```

Backend is now running at http://localhost:3000

---

## Step 2: Test the API

```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response: `{"message":"OK"}`

---

## Step 3: Update Backend URL in Frontend

Edit `index.html` line ~1295:

```javascript
const BACKEND_URL = 'http://localhost:3000';  // For local testing
```

Or use your deployed URL:
```javascript
const BACKEND_URL = 'https://your-backend.onrender.com';
```

---

## Step 4: Open Frontend

Open `index.html` in your browser, scroll to the signup form, enter your email, and test!

---

## Deploy to Production

1. Deploy backend to [Render.com](https://render.com)
2. Update `BACKEND_URL` in `index.html` to your Render URL
3. Push to GitHub
4. GitHub Pages auto-deploys

---

## View Subscribers (Admin)

```bash
curl -X GET http://localhost:3000/api/list \
  -H "x-admin-secret: dev-secret-123"
```

---

**That's it! You're ready to collect emails. 🚀**

For detailed instructions, see `SIGNUP-SETUP.md`.

