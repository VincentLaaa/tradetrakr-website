# 7-Day Trial Quiz Modal

Simple quiz modal that redirects to Whop checkout - no backend needed!

---

## 🎯 How It Works

1. **Modal appears** after 2 seconds on homepage
2. **User answers 3 questions:**
   - How long have you been trading?
   - Have you ever used a trading journal?
   - Are you ready to start tracking trades?
3. **After submission** → Shows success message for 2 seconds
4. **Auto-redirects** to Whop checkout: `https://whop.com/checkout/plan_5LC9GeWOWIlEy?d2c=true`

---

## 🎨 Features

- **Dark theme** matching your site (#0D0D0F background, neon purple #7A2CF2 accents)
- **Smooth animations** - modal slides in with backdrop blur
- **Mobile responsive** design
- **LocalStorage** - won't show again after:
  - User submits quiz (permanent)
  - User dismisses modal (30 days)

---

## 🔧 Files

**Modified:**
- `index.html` - Quiz modal + JavaScript

**No backend needed** - Everything runs client-side!

---

## 🚀 Testing

```bash
# Open locally
open index.html

# Or use dev server
npm run serve
```

Visit `http://localhost:8000` - modal appears after 2 seconds!

---

## 📝 Quiz Questions

1. **How long have you been trading?**
   - Under 1 year
   - 1-2 years
   - 2-5 years
   - 5+ years

2. **Have you ever used a trading journal?**
   - No, never
   - Tried but gave up
   - Sometimes
   - Yes, regularly

3. **Are you ready to start tracking your trades?**
   - Absolutely! Let's go
   - Yes, I'm ready
   - Maybe, let's see

---

## 🎯 Redirect

After answering all questions, user is redirected to:
`https://whop.com/checkout/plan_5LC9GeWOWIlEy?d2c=true`

To change the redirect URL, edit `index.html` line ~1713.

---

## ✅ Clean & Fast

- No backend API needed
- No database storage
- No email collection
- Pure client-side JavaScript
- Fast page loads
- Simple, lightweight system

---

**Ready to capture leads! 🚀**

