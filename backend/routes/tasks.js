const router = require("express").Router();
const mongoose = require("mongoose");
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const store = require("../memoryStore");

const dbReady = () => mongoose.connection.readyState === 1;
const populateMemoryTask = (task) => ({
  ...task,
  project: store.projects.find((p) => p._id === task.project) || { _id: task.project, title: "Project" },
  assignedTo: store.users.find((u) => u.id === task.assignedTo) || { _id: task.assignedTo, name: "User" },
  createdBy: store.users.find((u) => u.id === task.createdBy) || { _id: task.createdBy, name: "Admin" }
});

router.post("/", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, dueDate } = req.body;
    if (!title || !project || !assignedTo || !dueDate) return res.status(400).json({ message: "Title, project, assigned user, and due date are required." });

    if (!dbReady()) {
      const task = { _id: store.id(), title, description, project, assignedTo, status: status || "pending", dueDate, createdBy: req.user.id, createdAt: new Date() };
      store.tasks.unshift(task);
      return res.status(201).json(populateMemoryTask(task));
    }

    const task = await Task.create({ title, description, project, assignedTo, status: status || "pending", dueDate, createdBy: req.user.id });
    res.status(201).json(await Task.findById(task._id).populate("project", "title").populate("assignedTo", "name email role"));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get("/", auth, async (req, res) => {
  try {
    if (!dbReady()) {
      const data = req.user.role === "member" ? store.tasks.filter((t) => t.assignedTo === req.user.id) : store.tasks;
      return res.json(data.map(populateMemoryTask));
    }
    const query = req.user.role === "member" ? { assignedTo: req.user.id } : {};
    const tasks = await Task.find(query).populate("project", "title").populate("assignedTo", "name email role").populate("createdBy", "name email").sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put("/:id", auth, async (req, res) => {
  try {
    if (!dbReady()) {
      const task = store.tasks.find((t) => t._id === req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found." });
      if (req.user.role === "member" && task.assignedTo !== req.user.id) return res.status(403).json({ message: "You can update only your assigned tasks." });
      if (req.body.status) task.status = req.body.status;
      if (req.user.role === "admin") ["title","description","dueDate","assignedTo","project"].forEach(k => { if (req.body[k] !== undefined) task[k] = req.body[k]; });
      return res.json(populateMemoryTask(task));
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    if (req.user.role === "member" && String(task.assignedTo) !== req.user.id) return res.status(403).json({ message: "You can update only your assigned tasks." });
    const allowedUpdates = {};
    if (req.body.status) allowedUpdates.status = req.body.status;
    if (req.user.role === "admin") ["title","description","dueDate","assignedTo","project"].forEach(k => { if (req.body[k] !== undefined) allowedUpdates[k] = req.body[k]; });
    res.json(await Task.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true }).populate("project", "title").populate("assignedTo", "name email role"));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete("/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    if (!dbReady()) {
      const index = store.tasks.findIndex((t) => t._id === req.params.id);
      if (index !== -1) store.tasks.splice(index, 1);
      return res.json({ message: "Task deleted successfully." });
    }
    await Task.findByIdAndDelete(req.params.id); res.json({ message: "Task deleted successfully." });
  } catch (error) { res.status(500).json({ message: error.message }); }
});
module.exports = router;
