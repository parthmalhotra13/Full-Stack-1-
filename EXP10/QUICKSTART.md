# MERN Todo App - Quick Start Guide

## 📋 What's Included

This is a complete MERN stack todo application with:
- **MongoDB** for data persistence
- **Express.js** for the REST API backend
- **React** for the interactive frontend UI
- **Node.js** for the runtime environment

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
# Run the setup script
setup.bat
```

Or manually:
```bash
# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### Step 2: Start MongoDB
Make sure MongoDB is running on your system:
```bash
mongod
```

Or use MongoDB Atlas (cloud):
- Update `.env` file in backend with your connection string

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Server runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
App opens on: `http://localhost:3000`

## ✨ Core Features

| Feature | Implementation |
|---------|-----------------|
| **Add Todo** | Form validates input, sends POST request |
| **View Todos** | Fetches from `/api/todos` on mount |
| **Mark Complete** | Checkbox updates todo state via PUT |
| **Edit Todo** | In-line editor for title & description |
| **Delete Todo** | Confirmation dialog, DELETE request |
| **Progress Bar** | Real-time calculation based on completion |

## 📁 Project Structure

```
backend/
├── models/
│   └── Todo.js          → MongoDB schema definition
├── routes/
│   └── todos.js         → All CRUD endpoints
├── server.js            → Express server setup
├── package.json         → Dependencies
└── .env                 → MongoDB URI config

frontend/
├── src/
│   ├── components/
│   │   ├── TodoForm.js      → Add new todo form
│   │   ├── TodoList.js      → Renders all todos
│   │   └── TodoItem.js      → Individual todo with edit/delete
│   ├── App.js               → Main component with state management
│   └── App.css              → Global styles
├── public/
│   └── index.html           → HTML template
└── package.json             → React dependencies
```

## 🔌 API Reference

### Create Todo
```
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

### Read All Todos
```
GET /api/todos
```

### Read Single Todo
```
GET /api/todos/[ID]
```

### Update Todo
```
PUT /api/todos/[ID]
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}
```

### Delete Todo
```
DELETE /api/todos/[ID]
```

## 🛠️ Development Tips

### Adding a New Feature?

1. **Backend**: Add route in `backend/routes/todos.js`
2. **Database**: Update `backend/models/Todo.js` if needed
3. **Frontend**: Create component in `frontend/src/components/`
4. **Styling**: Add CSS file next to component

### Debugging

- **Backend logs**: Check terminal running `npm start`
- **Network errors**: Open browser DevTools (F12) → Network tab
- **MongoDB errors**: Check `.env` connection string
- **React errors**: Check browser console for stack trace

### Using MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get connection string
3. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/todo-app
   ```

## 🎯 Testing Checklist

- [ ] Add a todo with title
- [ ] Add a todo with title + description
- [ ] Mark todo as complete
- [ ] Unmark a completed todo
- [ ] Edit todo title
- [ ] Edit todo description
- [ ] Delete a todo
- [ ] Verify progress bar updates
- [ ] Refresh page - data persists
- [ ] Mobile responsive layout

## ⚡ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Connection refused" | MongoDB not running. Start with `mongod` |
| "Port already in use" | Change PORT in `.env` or close other apps |
| "Blank page" | Check browser console (F12) for errors |
| "CORS error" | Backend CORS already enabled, verify proxy in package.json |
| "Slow performance" | MongoDB Atlas connection slow? Use local MongoDB |

## 📚 Next Steps

- Add user authentication
- Implement todo categories
- Add due dates
- Create search functionality
- Deploy to production (Heroku, Vercel, etc.)

## 💡 File Navigation

- **Need to modify DB schema?** → `backend/models/Todo.js`
- **Need to add API?** → `backend/routes/todos.js`
- **Need to change UI?** → `frontend/src/components/TodoItem.js`
- **Need to change styling?** → `frontend/src/components/*.css`
- **Need to configure?** → `backend/.env`

---

**Happy coding! 🚀**
