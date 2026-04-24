import React, { useState } from 'react';
import { TextField, Button, Alert, CircularProgress } from '@mui/material';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (email === "admin@test.com" && password === "1234") {
        setSuccess("Login Successful!");
      } else {
        setError("Invalid Credentials");
      }
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} style={{width:'300px'}}>
      <h2>Login</h2>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" variant="contained" fullWidth>
        {loading ? <CircularProgress size={24} /> : "Login"}
      </Button>
    </form>
  );
}
