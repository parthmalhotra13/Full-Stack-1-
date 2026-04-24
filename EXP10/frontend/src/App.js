import React, { useState, useEffect } from 'react';
import './App.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new todo
  const addTodo = async (todoData) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });
      if (!response.ok) {
        throw new Error('Failed to create todo');
      }
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error adding todo:', err);
    }
  };

  // Update a todo
  const updateTodo = async (id, updatedData) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => (todo._id === id ? updatedTodo : todo)));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating todo:', err);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      setTodos(todos.filter(todo => todo._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting todo:', err);
    }
  };

  // Toggle todo completion status
  const toggleTodo = (id) => {
    const todo = todos.find(t => t._id === id);
    if (todo) {
      updateTodo(id, { completed: !todo.completed });
    }
  };

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="app">
      <div className="container">
        <h1>📝 My Todo List</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <TodoForm onAddTodo={addTodo} />
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <TodoList
            todos={todos}
            onToggleTodo={toggleTodo}
            onUpdateTodo={updateTodo}
            onDeleteTodo={deleteTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
