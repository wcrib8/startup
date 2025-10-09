import React from 'react';
import './login.css';

export function Login() {
  return (
    <main>
      <div className="login-container">
        <form method="get" action="key_indicators.html">
            <div className="mb-3">
                <input type="email" name="email" className="form-control" placeholder="Email" required autocomplete="email" />
            </div>
            <div class="mb-4">
                <input type="password" name="password" className="form-control" placeholder="Password" required autocomplete="current-password" />
            </div>
            <button className="btn btn-primary" type="submit" value="login">Login</button>
            <div className="mt-3 text-center">
              <p>Don't have an account? </p>
              <button className="btn btn-secondary" type="submit" value="signup">Sign Up</button>
            </div>
        </form>
      </div>
    </main>
  );
}