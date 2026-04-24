import React, { useState } from 'react';
import './TodoItem.css';

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (editedTitle.trim() === '') {
      alert('Title cannot be empty');
      return;
    }
    
    await onUpdate({
      title: editedTitle.trim(),
      description: editedDescription.trim(),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      setIsDeleting(true);
      await onDelete();
    }
  };

  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="todo-item editing">
        <div className="edit-form">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="edit-input"
            disabled={isDeleting}
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="edit-textarea"
            rows="3"
            disabled={isDeleting}
          ></textarea>
          <div className="edit-actions">
            <button
              onClick={handleSave}
              className="save-btn"
              disabled={isDeleting}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="cancel-btn"
              disabled={isDeleting}
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
          className="todo-checkbox"
          disabled={isDeleting}
        />
        <div className="todo-text">
          <h3 className="todo-title">{todo.title}</h3>
          {todo.description && <p className="todo-description">{todo.description}</p>}
        </div>
      </div>
      <div className="todo-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="edit-btn"
          disabled={isDeleting}
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="delete-btn"
          disabled={isDeleting}
          title="Delete"
        >
          {isDeleting ? '...' : '🗑️'}
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
