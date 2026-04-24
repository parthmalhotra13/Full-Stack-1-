# MERN Todo Application

A full-stack Todo application built with MongoDB, Express, React, and Node.js (MERN).

## Project Structure

```
EXP10/
├── backend/
│   ├── models/
│   │   └── Todo.js           # MongoDB Todo schema
│   ├── routes/
│   │   └── todos.js          # CRUD API endpoints
│   ├── server.js             # Express server
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
└── frontend/
    ├── public/
    │   └── index.html        # HTML entry point
    ├── src/
    │   ├── components/
    │   │   ├── TodoForm.js
    │   │   ├── TodoItem.js
    │   │   └── TodoList.js
    │   ├── App.js            # Main App component
    │   ├── App.css
    │   ├── index.js          # React entry point
    │   └── index.css
    └── package.json          # Frontend dependencies
```

## Features

✅ **Create** - Add new todos with title and description
✅ **Read** - Display all todos from the database
✅ **Update** - Edit todo details and mark as completed
✅ **Delete** - Remove todos from the list
✅ **Progress Tracking** - Visual progress bar showing completion percentage
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Real-time Updates** - UI updates instantly with database changes

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas connection string)
- npm or yarn

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Configure MongoDB

Edit `backend/.env` file:
```
MONGODB_URI=mongodb://localhost:27017/todo-app
PORT=5000
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app
```

## Running the Application

### Terminal 1: Start MongoDB (if using local)
```bash
mongod
```

### Terminal 2: Start Backend Server
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

Backend will run on `http://localhost:5000`

### Terminal 3: Start React Frontend
```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### GET all todos
```
GET /api/todos
```

### GET a specific todo
```
GET /api/todos/:id
```

### CREATE a new todo
```
POST /api/todos
Body: {
  "title": "Todo title",
  "description": "Optional description"
}
```

### UPDATE a todo
```
PUT /api/todos/:id
Body: {
  "title": "Updated title",
  "description": "Updated description",
  "completed": true/false
}
```

### DELETE a todo
```
DELETE /api/todos/:id
```

## Technologies Used

- **Frontend**: React 18, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **API**: RESTful API
- **Styling**: Custom CSS with gradient design

## Troubleshooting

### MongoDB connection error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB credentials if using Atlas

### Port already in use
- Change PORT in `backend/.env` if 5000 is occupied
- React uses port 3000, change with `PORT=3001 npm start`

### CORS errors
- CORS is already enabled in backend
- Ensure frontend proxy is set to `http://localhost:5000` in `frontend/package.json`

## Testing the Application

1. **Add a Todo**: Type title, add optional description, click "Add Todo"
2. **Mark as Complete**: Click the checkbox to toggle completion
3. **Edit a Todo**: Click the pencil icon to edit
4. **Delete a Todo**: Click the trash icon to remove
5. **View Progress**: See the progress bar update as you complete todos

## Future Enhancements

- [ ] User authentication & authorization
- [ ] Todo categories/tags
- [ ] Due dates and reminders
- [ ] Search and filter functionality
- [ ] Dark mode toggle
- [ ] Local storage backup
- [ ] Export/Import todos

## License

MIT

## Author

Created for MERN Stack Learning
