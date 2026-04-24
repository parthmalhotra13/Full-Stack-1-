import React, { useState } from 'react';
import './TodoForm.css';

function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (title.trim() === '') {
      alert('Please enter a todo title');
      return;
    }

    setLoading(true);
    try {
      await onAddTodo({
        title: title.trim(),
        description: description.trim(),
      });
      setTitle('');
      setDescription('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <textarea
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="form-textarea"
          rows="3"
        ></textarea>
      </div>
      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
}

export default TodoForm;
