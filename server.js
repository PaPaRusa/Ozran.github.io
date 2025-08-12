const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
// Redirect requests ending with .html to their extensionless counterparts
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    return res.redirect(301, req.path.slice(0, -5));
  }
  next();
});

// Serve static files and allow extensionless URLs
app.use(
  express.static(path.join(__dirname, 'public'), {
    extensions: ['html'],
  })
);

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const SECRET_KEY = process.env.JWT_SECRET;

// ✅ Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

// ✅ Supabase Setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Register API
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must include uppercase, lowercase, number, and special character",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { error } = await supabase
      .from("users")
      .insert([{ email, username, password: hashedPassword }]);

    if (error) throw error;

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("🚨 Registration error:", error);
    res.status(400).json({ error: "Email or username already taken" });
  }
});

// Helper to parse cookies
function getTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = decodeURIComponent(value);
    return acc;
  }, {});
  return cookies.token;
}

// ✅ Login API
app.post("/login", limiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, username, password")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, data.password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: data.id, email: data.email, username: data.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    res.json({ username: data.username, email: data.email });
  } catch (error) {
    console.error("🚨 Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Logout API (Optional)
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "User logged out successfully" });
});

// ✅ Middleware to Verify JWT
function authenticateToken(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ✅ Check Authentication Status
app.get("/auth-status", authenticateToken, (req, res) => {
  res.json({ authenticated: true, user: { username: req.user.username, email: req.user.email } });
});

// ✅ Send Phishing Test Email API
app.post("/api/send-test-email", limiter, async (req, res) => {
  try {
    const { testerEmail, testEmail } = req.body;
    if (!testerEmail || !testEmail) {
      return res.status(400).json({ error: "Both emails are required." });
    }

    console.log("📩 Sending test email to:", testEmail);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const trackingUrl = `https://ozran.net/api/track-click?email=${encodeURIComponent(testEmail)}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: "Security Alert - Action Required",
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
              <h2 style="color: #0072c6;">Outlook Security Notice</h2>
              <p>Dear User,</p>
              <p>All Hotmail customers have been upgraded to Outlook.com. Your Hotmail account services have expired.</p>
              <p>To continue using your account, please verify your account:</p>
              <p><a href="${trackingUrl}" style="color: #0072c6; font-weight: bold;">Verify Now</a></p>
              <p>Thanks,</p>
              <p>The Microsoft Account Team</p>
          </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");

    res.status(200).json({ message: "Test email sent!" });

  } catch (error) {
    console.error("🚨 Error sending email:", error);
    res.status(500).json({ error: "Failed to send email. Check server logs for details." });
  }
});

// ✅ Track Clicks API
app.get("/api/track-click", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send("Invalid request");
  }

  console.log(`📊 User clicked phishing link: ${email}`);

  try {
    await supabase.from("phishing_clicks").insert([{ email }]);

    const testerEmail = process.env.TESTER_EMAIL;
    const alertMailOptions = {
      from: process.env.EMAIL_USER,
      to: testerEmail,
      subject: "Phishing Alert - User Clicked!",
      text: `The user ${email} clicked the phishing link at ${new Date().toISOString()}`
    };

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail(alertMailOptions);
    console.log("📩 Tester notified!");

  } catch (error) {
    console.error("🚨 Error tracking click:", error);
  }

  res.redirect("https://your-training-page.com");
});

// ✅ Serve Index Page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
