const express = require('express');
const nodemailer = require('nodemailer');
const supabase = require('../utils/db');

const router = express.Router();

// Send phishing test email
router.post('/api/send-test-email', async (req, res) => {
  try {
    const { testerEmail, testEmail } = req.body;
    if (!testerEmail || !testEmail) {
      return res.status(400).json({ error: 'Both emails are required.' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
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
      subject: 'Security Alert - Action Required',
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
    res.status(200).json({ message: 'Test email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email. Check server logs for details.' });
  }
});

// Track clicks from phishing email
router.get('/api/track-click', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send('Invalid request');
  }

  try {
    await supabase.from('phishing_clicks').insert([{ email }]);

    const testerEmail = process.env.TESTER_EMAIL;
    const alertMailOptions = {
      from: process.env.EMAIL_USER,
      to: testerEmail,
      subject: 'Phishing Alert - User Clicked!',
      text: `The user ${email} clicked the phishing link at ${new Date().toISOString()}`
    };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail(alertMailOptions);
  } catch (error) {
    console.error('Error tracking click:', error);
  }

  res.redirect('https://your-training-page.com');
});

module.exports = router;
