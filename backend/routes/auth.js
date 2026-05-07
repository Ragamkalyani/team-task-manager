const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const auth = require("../middleware/auth");
const store = require("../memoryStore");

const dbReady = () => mongoose.connection.readyState === 1;
const publicUser = (u) => ({ id: u._id || u.id, _id: u._id || u.id, name: u.name, email: u.email, role: u.role });

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

    if (!dbReady()) {
      if (store.users.find((u) => u.email === email.toLowerCase())) return res.status(409).json({ message: "Email already registered." });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { id: store.id(), name, email: email.toLowerCase(), password: hashedPassword, role: role === "admin" ? "admin" : "member" };
      store.users.push(user);
      return res.status(201).json({ message: "Signup successful", user: publicUser(user) });
    }

    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role === "admin" ? "admin" : "member" });
    res.status(201).json({ message: "Signup successful", user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    let user;
    if (!dbReady()) {
      user = store.users.find((u) => u.email === email.toLowerCase());
    } else {
      user = await User.findOne({ email });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password." });
    const safe = publicUser(user);
    const token = jwt.sign({ id: safe.id, role: safe.role, name: safe.name, email: safe.email }, process.env.JWT_SECRET || "secret123", { expiresIn: "1d" });
    res.json({ message: "Login successful", token, user: safe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", auth, (req, res) => res.json({ user: req.user }));
module.exports = router;
