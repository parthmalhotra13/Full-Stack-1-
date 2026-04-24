
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Admin from './Admin';
import User from './User';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/" />;
  if (role && role !== userRole) return <h2>Access Denied</h2>;

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/user" element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
