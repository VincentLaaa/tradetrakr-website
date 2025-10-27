# Admin CSV Export Guide

Export all subscriber emails as a CSV file for email marketing campaigns.

---

## 🎯 Quick Export

### Using curl

```bash
curl -X GET https://your-backend.onrender.com/api/export \
  -H "x-admin-secret: tradetrakr_admin_key_01" \
  -o tradetrakr-subscribers.csv
```

### Using Browser

1. Open terminal/command prompt
2. Run:
```bash
curl https://tradetrakr-signup-api.onrender.com/api/export \
  -H "x-admin-secret: tradetrakr_admin_key_01" \
  -o subscribers.csv
```
3. File downloads as `subscribers.csv`

---

## 📊 CSV Format

**Headers:**
```
email,created_at
```

**Example data:**
```csv
email,created_at
"user@example.com","2025-01-15 10:30:00"
"trader@tradetrakr.com","2025-01-16 14:22:00"
```

---

## 🔒 Security

**Protected by:** `x-admin-secret` header

**Secret key:** `tradetrakr_admin_key_01`

**Unauthorized access:** Returns `401 Unauthorized`

---

## 📈 Usage Examples

### Export to CSV

```bash
curl https://tradetrakr-signup-api.onrender.com/api/export \
  -H "x-admin-secret: tradetrakr_admin_key_01" \
  -o subscribers-$(date +%Y%m%d).csv
```

### View in Terminal

```bash
curl https://tradetrakr-signup-api.onrender.com/api/export \
  -H "x-admin-secret: tradetrakr_admin_key_01"
```

### Import to Google Sheets

1. Download CSV
2. Open Google Sheets
3. File → Import → Upload CSV
4. Data is ready for email campaigns

### Import to Email Marketing Tool

**Mailchimp:**
1. Dashboard → Audience → Import contacts
2. Upload CSV file
3. Map `email` column
4. Schedule campaign

**ConvertKit:**
1. Subscribers → Import Subscribers
2. Upload CSV
3. Map fields

**SendGrid:**
1. Contacts → Import Contacts
2. Upload CSV
3. Map columns

---

## 📝 Logging

All export attempts are logged:

**Successful:**
```
Admin CSV export accessed: 42 subscribers exported at 2025-01-15T10:30:00.000Z
```

**Failed (unauthorized):**
```
Unauthorized export attempt from 192.168.1.1 at 2025-01-15T10:30:00.000Z
```

**View logs on Render:**
Dashboard → Your Service → Logs

---

## 🧪 Testing

**Test export endpoint:**

```bash
# Should succeed
curl https://tradetrakr-signup-api.onrender.com/api/export \
  -H "x-admin-secret: tradetrakr_admin_key_01"

# Should fail (401)
curl https://tradetrakr-signup-api.onrender.com/api/export
```

---

## ✅ Best Practices

1. **Export regularly** (weekly/monthly)
2. **Keep CSV files secure** (don't commit to Git)
3. **Remove old emails** from campaigns
4. **Respect unsubscribe requests**
5. **Track last export date** for automation

---

## 🚀 Automation

### Weekly Export Script

Create `scripts/export-weekly.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
curl -X GET https://tradetrakr-signup-api.onrender.com/api/export \
  -H "x-admin-secret: tradetrakr_admin_key_01" \
  -o "subscribers-$DATE.csv"

echo "Exported to subscribers-$DATE.csv"
```

### Cron Job

```bash
# Export every Monday at 9am
0 9 * * 1 /path/to/export-weekly.sh
```

---

## 📞 Support

**Backend URL:** `https://tradetrakr-signup-api.onrender.com`  
**Admin Secret:** `tradetrakr_admin_key_01`  
**Documentation:** `/backend/README.md`

---

**Ready to export your subscribers! 📧**

