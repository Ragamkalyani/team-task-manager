# Team Task Manager Full-Stack Web App

A role-based task management system where admins can create projects, assign tasks, and track progress. Members can view and update assigned tasks.

## Features
- Signup and Login
- JWT Authentication
- Role-based access control: Admin / Member
- Project management
- Task creation and assignment
- Task status tracking
- Dashboard with total, pending, in-progress, completed and overdue tasks
- Responsive UI

## Tech Stack
Frontend: React, Vite, Axios, CSS
Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

## Run Locally
Backend:
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Frontend:
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

First create an admin account from Signup page, then login and create projects/tasks.

## Deployment
Backend env variables:
```env
MONGO_URI=your_mongodb_connection_url
JWT_SECRET=your_secret
PORT=5000
```
Frontend env variable:
```env
VITE_API_URL=https://your-backend-url/api
```
