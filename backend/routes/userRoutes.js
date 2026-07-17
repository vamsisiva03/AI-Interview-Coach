const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/* ================= GET USER PROFILE ================= */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ================= UPDATE USER PROFILE ================= */
router.put("/update-profile", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    let { name, bio, notifications, privacy } = req.body;


    // Auto-generate name from email if blank
    if (!name || name.trim() === "") {
      const emailBase = user.email.split("@")[0];
      name = emailBase.charAt(0).toUpperCase() + emailBase.slice(1);

    }

    const updatedData = {
      name,
      bio: bio !== undefined ? bio : user.bio,
      notifications: notifications || user.notifications,
      privacy: privacy || user.privacy
    };


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password");


    res.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ msg: "Update failed" });
  }
});

module.exports = router;
