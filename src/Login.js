import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2>🔐 Admin Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email:</label>
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit">Login</button>
        <div className="mt-3">
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
