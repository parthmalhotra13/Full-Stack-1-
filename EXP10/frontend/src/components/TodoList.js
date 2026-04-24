import React from 'react';
import TodoItem from './TodoItem';
import './TodoList.css';

function TodoList({ todos, onToggleTodo, onUpdateTodo, onDeleteTodo }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>✨ No todos yet. Add one to get started!</p>
      </div>
    );
  }

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="todo-list-container">
      <div className="progress-bar">
        <div className="progress" style={{ width: `${(completedCount / totalCount) * 100}%` }}></div>
      </div>
      <p className="progress-text">
        {completedCount} of {totalCount} completed
      </p>
      
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            onToggle={() => onToggleTodo(todo._id)}
            onUpdate={(updatedData) => onUpdateTodo(todo._id, updatedData)}
            onDelete={() => onDeleteTodo(todo._id)}
          />
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
