import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "tradetrakr_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 30
    }
  })
);

const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

app.post("/api/validate", async (req, res) => {
  try {
    const { licenseKey } = req.body || {};
    if (!licenseKey) {
      return res.status(400).json({ valid: false, error: "Missing license key." });
    }

    if (!process.env.WHOP_API_KEY) {
      return res.status(500).json({ valid: false, error: "License validation unavailable." });
    }

    const response = await fetch(
      "https://api.whop.com/api/v2/memberships/validate_license_key",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ license_key: licenseKey })
      }
    );

    if (!response.ok) {
      return res.status(502).json({ valid: false, error: "Validation request failed." });
    }

    const data = await response.json();

    if (data?.valid) {
      req.session.validLicense = true;
      return res.json({ valid: true });
    }

    req.session.validLicense = false;
    return res.json({ valid: false });
  } catch (error) {
    return res.status(500).json({ valid: false, error: "Unexpected server error." });
  }
});

app.get("/api/check-session", (req, res) => {
  if (req.session?.validLicense) {
    return res.json({ authorized: true });
  }
  return res.status(401).json({ authorized: false });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`TradeTrakR server running on port ${PORT}`);
});
