// api/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const tokenModel = require("../models/tokenModel.js");
const crypto = require("crypto");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register route
router.post("/register", async (req, res) => {
  const { email, password, role, fullName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ email, password, role, fullName });
    await newUser.save();
    const tokenData = new tokenModel({
      userId: newUser._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await tokenData.save();
    const link = `https://backend-six-kappa-64.vercel.app/auth/confirm/${token.token}`;

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    return res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "24h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 1800000 });
  return res.status(200).json({ message: "Login Successful", token });
});

router.get("/me", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err)
      return res.status(500).json({ message: "Failed to authenticate token" });

    const user = await User.findById(decoded.id).select("email");
    res.json(user);
  });
});

router.get("/", async (req, res) => {
  return res.json("Backend is working");
});

module.exports = router;
