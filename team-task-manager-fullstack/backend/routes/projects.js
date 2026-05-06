const router = require("express").Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const store = require("../memoryStore");

const dbReady = () => mongoose.connection.readyState === 1;

router.post("/", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { title, description, members } = req.body;
    if (!title) return res.status(400).json({ message: "Project title is required." });

    if (!dbReady()) {
      const project = { _id: store.id(), title, description, members: members || [], createdBy: req.user.id, createdAt: new Date() };
      store.projects.unshift(project);
      return res.status(201).json(project);
    }

    const project = await Project.create({ title, description, members: members || [], createdBy: req.user.id });
    res.status(201).json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get("/", auth, async (req, res) => {
  try {
    if (!dbReady()) return res.json(store.projects);
    const projects = await Project.find().populate("members", "name email role").populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get("/users/members", auth, async (req, res) => {
  try {
    if (!dbReady()) return res.json(store.users.map(({ password, ...u }) => ({ _id: u.id, ...u })));
    res.json(await User.find({}, "name email role").sort({ name: 1 }));
  } catch (error) { res.status(500).json({ message: error.message }); }
});
module.exports = router;
