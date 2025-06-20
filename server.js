const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');  // ✅ added
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());  // ✅ added
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define your User model
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  verified: { type: Boolean, default: false }
}));

// 👇 Your routes should come AFTER app is defined
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = new User({ name, email, password });

  await newUser.save();
  console.log("✅ User saved");

  // Send email
  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Optional: validate credentials
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env");
  return res.status(500).send("Server email configuration error");
}

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    text: 'Thanks for signing up! Please verify your email.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email send error:", error);
      return res.status(500).send("Error sending email");
    }
    console.log("✅ Email sent:", info.response);
    res.send("Signup successful! Check your email.");
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
