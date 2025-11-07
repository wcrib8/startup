import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';

import { AuthState } from './auth_state';

export function Signup({ onAuthChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Signup failed');
      }

      onAuthChange(email, AuthState.Authenticated);
      
      navigate('/key_indicators');

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="login-container">
        <form onSubmit={handleSignup}>
          <h3 className="text-center mb-3">Sign Up</h3>
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
          <button className="btn btn-danger" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Create Account'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className="mt-3 text-center">
            <p>Already have an account?</p>
            <button
              className="add-btn"
              type="button"
              onClick={() => {
                onAuthChange('', AuthState.Unauthenticated);
                navigate('/');
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
