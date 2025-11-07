import React from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './auth_state';

export function Login({ userName, authState, onAuthChange }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = React.useState(false);

  const handleLogin = async (e) => {
    console.log('heya');
    e.preventDefault();
    if (!email || !password) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        onAuthChange(data.email, AuthState.Authenticated);
        navigate('/key_indicators');
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error', err);
      alert('Login failed. Check console for details.');
    }
  };

  return (
    <main>
      <div className="login-container">
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input 
              type="email" 
              name="email" 
              className="form-control" 
              placeholder="Email" 
              required 
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input 
              type="password" 
              name="password" 
              className="form-control" 
              placeholder="Password" 
              required 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-danger" type="submit" value="login">Login</button>
          <div className="mt-3 text-center">
            <p>Don't have an account? </p>
            <button 
              className="add-btn" 
              type="button" 
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}