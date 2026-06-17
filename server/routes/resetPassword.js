const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Forgot Password
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Frontend reset URL
    const resetLink =
      `https://campus-sync-sigma.vercel.app/reset-password/${resetToken}`;

    // Send email through Brevo
    const response = await apiInstance.sendTransacEmail({
      sender: {
        name: 'CampusSync',
        email: process.env.EMAIL
      },
      to: [
        {
          email: email
        }
      ],
      subject: 'CampusSync - Password Reset Request',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color:#4f46e5;">Password Reset Request</h2>

          <p>Hello,</p>

          <p>
            You requested to reset your password for your CampusSync account.
          </p>

          <p>
            Click the button below to reset your password.
            This link will expire in <strong>1 hour</strong>.
          </p>

          <a
            href="${resetLink}"
            style="
              background:#4f46e5;
              color:#ffffff;
              padding:12px 20px;
              border-radius:6px;
              text-decoration:none;
              display:inline-block;
            "
          >
            Reset Password
          </a>

          <p style="margin-top:20px;">
            If you did not request this password reset,
            please ignore this email.
          </p>

          <hr />

          <p style="color:#666;">
            CampusSync Team
          </p>
        </div>
      `
    });

    console.log('Email sent:', response);

    res.json({
      message: 'Reset link sent to your email'
    });
  } catch (err) {
    console.error('Brevo Error:', err);

    res.status(500).json({
      message: 'Failed to send reset email',
      error: err.message
    });
  }
});

// Reset Password
router.post('/reset/:token', async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset link'
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({
      message: 'Password reset successfully'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;