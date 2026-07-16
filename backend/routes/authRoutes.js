const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET || "super_secret_jwt_key_for_development";


/* ================= TOKEN GENERATOR ================= */

const generateTokenAndRedirect = (req, res) => {

  if (!req.user) {
    return res.redirect(
      `${CLIENT_URL}/login?error=authentication_failed`
    );
  }

  const payload = {
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profileImage: req.user.profileImage,
      provider: req.user.provider,
    },
  };

  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }, (err, token) => {

    if (err) {
      console.error("JWT Error:", err);
      return res.redirect(
        `${CLIENT_URL}/login?error=token_error`
      );
    }

    // IMPORTANT FIX
    return res.redirect(`${CLIENT_URL}/login?token=${token}`);

  });

};


/* ================= GOOGLE ================= */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login`,
  }),
  generateTokenAndRedirect
);


/* ================= GITHUB ================= */

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${CLIENT_URL}/login`,
  }),
  generateTokenAndRedirect
);


/* ================= LINKEDIN ================= */

router.get("/linkedin", passport.authenticate("linkedin"));

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: `${CLIENT_URL}/login`,
  }),
  generateTokenAndRedirect
);


/* ================= GET CURRENT USER ================= */

router.get("/me", (req, res) => {

  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json(decoded.user);

  } catch (err) {

    res.status(401).json({ msg: "Invalid token" });

  }

});



/* ================= LOCAL EMAIL REGISTER ================= */

router.post("/register", async (req, res) => {

  const { name, email, password } = req.body;

  try {

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      provider: "local",
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        provider: user.provider,
        bio: user.bio,
        notifications: user.notifications,
        privacy: user.privacy,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }, (err, token) => {

      if (err) throw err;

      res.json({ token });

    });

  } catch (err) {

    console.error("Register error:", err.message);

    // MongoDB connection / timeout errors
    if (
      err.name === "MongooseError" ||
      err.name === "MongoServerSelectionError" ||
      (err.message && err.message.includes("timed out"))
    ) {
      return res.status(503).json({
        msg: "Database connection failed. Please check your MongoDB Atlas IP whitelist and try again.",
      });
    }

    res.status(500).json({ msg: "Server error. Please try again." });

  }

});


/* ================= LOCAL EMAIL LOGIN ================= */

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    if (!user.password) {
      return res.status(400).json({
        msg: "Please login with your social account",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        provider: user.provider,
        bio: user.bio,
        notifications: user.notifications,
        privacy: user.privacy,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }, (err, token) => {

      if (err) throw err;

      res.json({ token });

    });

  } catch (err) {

    console.error("Login error:", err.message);

    if (
      err.name === "MongooseError" ||
      err.name === "MongoServerSelectionError" ||
      (err.message && err.message.includes("timed out"))
    ) {
      return res.status(503).json({
        msg: "Database connection failed. Please check your MongoDB Atlas IP whitelist and try again.",
      });
    }

    res.status(500).json({ msg: "Server error. Please try again." });
  }
});

/* ================= PROFILE PHOTO UPLOAD ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
  },
});

router.post("/upload-photo", auth, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
    
    // Update user in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    res.json({
      msg: "Photo uploaded successfully",
      profileImage: imageUrl,
      user
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ msg: "Server error during upload" });
  }
});


/* ================= FORGOT PASSWORD ================= */

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User with this email does not exist." });
    }

    if (user.provider !== "local") {
      return res.status(400).json({ msg: "Please use your social login provider." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set token and expiry on user document
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    // Set up Nodemailer (Placeholder for now, use Ethereal for testing if needed)
    // NOTE: In production, use real SMTP settings
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // If no credentials, use Ethereal for testing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: '"AI Interview Coach" <noreply@ai-interview-coach.com>',
      to: user.email,
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) have requested the reset of a password. \n\n Please click on the following link, or paste this into your browser to complete the process: \n\n ${resetUrl}`,
      html: `<p>You are receiving this email because you (or someone else) have requested the reset of a password.</p><p>Please click on the following link, or paste this into your browser to complete the process:</p><a href="${resetUrl}">${resetUrl}</a>`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (!process.env.EMAIL_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    res.json({ msg: "Email sent" });

  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});


/* ================= RESET PASSWORD ================= */

router.post("/reset-password/:token", async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: "Password reset successful" });

  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

console.log("--- authRoutes.js routes registered ---");
module.exports = router;