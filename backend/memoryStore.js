const users = [];
const projects = [];
const tasks = [];

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

module.exports = { users, projects, tasks, id };
