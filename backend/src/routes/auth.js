import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, credits: u.credits });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (await User.findOne({ email: email.toLowerCase().trim() })) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = email && (await User.findOne({ email: email.toLowerCase().trim() }));
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: publicUser(user) });
});

export default router;