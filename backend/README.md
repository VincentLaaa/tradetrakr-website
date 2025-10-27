# TradeTrakR Signup API Backend

Simple Node.js + Express API for collecting email signups for the 7-day free trial promotion.

## Features

- ✅ POST `/api/signup` - Collect email subscriptions
- ✅ GET `/api/list` - Admin endpoint to view all subscribers (protected)
- ✅ SQLite database for persistent storage
- ✅ Email validation and duplicate prevention
- ✅ CORS enabled for GitHub Pages integration
- ✅ Automatic timestamps

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env` file:

```env
PORT=3000
ADMIN_SECRET=your-secret-key-change-in-production
```

### 3. Run the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

### POST `/api/signup`

**Request:**
```json
{
  "email": "test@example.com"
}
```

**Responses:**
- ✅ `200 OK` - Successfully added → `{ "message": "OK" }`
- ⚠️ `409 Conflict` - Duplicate email → `{ "error": "Already subscribed" }`
- ❌ `400 Bad Request` - Invalid email → `{ "error": "Invalid email" }`

### GET `/api/list`

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
      "email": "test@example.com",
      "created_at": "2025-01-15 10:30:00"
    }
  ]
}
```

## Database Schema

**Table: `subscribers`**

| Column     | Type     | Description                      |
|------------|----------|----------------------------------|
| id         | INTEGER  | Primary key (auto-increment)     |
| email      | TEXT     | Unique email address             |
| created_at | DATETIME | Timestamp of signup (automatic)  |

## Deployment

### Render.com (Free)

1. Create new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variable: `ADMIN_SECRET=your-production-secret`
7. Deploy!

The database file (`subscribers.db`) will persist on Render's filesystem.

### Railway.app (Free)

1. Sign up at [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables in the **Variables** tab
5. Railway auto-detects Node.js and runs `npm start`

### Fly.io (Free)

```bash
fly auth login
fly launch
fly deploy
```

## Testing the API

### Using curl:

```bash
# Test signup
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test duplicate (should return 409)
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test admin list (with secret)
curl -X GET http://localhost:3000/api/list \
  -H "x-admin-secret: your-secret-key"
```

### Using Postman/Thunder Client:

1. Create POST request to `http://localhost:3000/api/signup`
2. Body → raw → JSON: `{"email":"test@example.com"}`
3. Send!

## Frontend Integration

Update your GitHub Pages frontend with the backend domain:

```javascript
const response = await fetch('https://your-backend.onrender.com/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: emailValue })
});
```

## Production Checklist

- [ ] Change `ADMIN_SECRET` to a strong random string
- [ ] Add CORS origin restriction for your GitHub Pages domain
- [ ] Enable HTTPS on backend (Render/Railway do this automatically)
- [ ] Set up monitoring/alerts (optional)
- [ ] Consider adding rate limiting (optional)
- [ ] Database backup strategy (optional)

## Troubleshooting

**Database locked error?**
- SQLite is single-threaded. Use connection pooling if scaling up.

**CORS issues?**
- Verify the CORS middleware is installed and running
- Check your frontend domain is whitelisted

**Port issues on deployment?**
- Render/Railway set `PORT` automatically via `process.env.PORT`

---

Built for TradeTrakR trading journal marketing campaigns 🚀

