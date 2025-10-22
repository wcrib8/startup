import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';

import { AuthState } from '../auth_state';

export function Signup({ onAuthChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('userName', email);
      onAuthChange(AuthState.Authenticated);
      navigate('/key_indicators');
    }
  };

  return (
    <main>
      <div className="login-container">
        <form onSubmit={handleSignup}>
          <h2 className="text-center mb-3">Sign Up</h2>
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Create Account
          </button>
          <div className="mt-3 text-center">
            <p>Already have an account?</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
