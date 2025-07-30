// src/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }

    try {
      await axios.post('https://logsentinel-backend.onrender.com/register', {
        email,
        password,
      });
      toast.success('✅ Registration successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(`❌ ${message}`);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-3">Register</h3>
      <input
        type="email"
        placeholder="Email"
        className="form-control mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="form-control mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister} className="btn btn-success w-100">
        Register
      </button>

      <div className="mt-3 text-center">
        <button className="btn btn-link" onClick={() => navigate('/login')}>
          ← Back to login
        </button>
      </div>
    </div>
  );
}

export default Register;
