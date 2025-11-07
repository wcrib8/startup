import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Login } from './login/login';
import { Signup } from './login/signup';
import { Contact } from './contact/contact';
import { About } from './about/about';
import { Friends } from './friends/friends';
import { Key_indicators } from './key_indicators/key_indicators';
import { Friend_info } from './friend_info/friend_info';
import { Submit_contact } from './submit_contact/submit_contact';
import { AuthState } from './login/auth_state';

import { ProtectedRoute } from './protected_route';

export default function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const [authState, setAuthState] = React.useState(
    AuthState.Unauthenticated
  );

  function handleLogout() {
    localStorage.removeItem('userName');
    localStorage.removeItem('keyIndicators');
    localStorage.removeItem('friends');
    localStorage.removeItem('lastResetDate');
    setUserName('');
    setAuthState(AuthState.Unauthenticated);
  } 

  const handleAuthChange = (newUserName, newAuthState) => {
    console.log('please work')
    setUserName(newUserName);
    setAuthState(newAuthState);
    if (newAuthState === AuthState.Authenticated) {
      console.log('please work')
      localStorage.setItem('userName', newUserName);
    }
  };


  return (
    <BrowserRouter>
      <div className="body">
        <Header authState={authState} onLogout={handleLogout} />

        <Routes>
          <Route
            path="/"
            element={
              authState === AuthState.Authenticated ? (
                <Navigate to="/key_indicators" replace />
              ) : (
                <Login userName={userName} authState={authState} onAuthChange={handleAuthChange} />
              )
            }
          />

          <Route
            path="/signup"
            element={
              authState === AuthState.Authenticated ? (
                <Navigate to="/key_indicators" replace />
              ) : (
                <Signup onAuthChange={handleAuthChange} />
              )
            }
          />

          <Route
            path="/key_indicators"
            element={
              <ProtectedRoute authState={authState}>
                <Key_indicators userName={userName} authState={authState} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute authState={authState}>
                <Friends userName={userName} authState={authState} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friend_info/:id"
            element={
              <ProtectedRoute authState={authState}>
                <Friend_info userName={userName} authState={authState} />
              </ProtectedRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/submit_contact" element={<Submit_contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="site-footer">
          <div className="container">
            <span className="text-reset">Wolf Cribbs</span>
            <span>&copy; 2025 PMGDating. All rights reserved.</span>
            <a href="https://github.com/wcrib8/startup.git" className="footer-link">
              {' '}
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function Header({ authState, onLogout }) {
  const location = useLocation();

  const isLoginPage = location.pathname === '/';
  const isSignUpPage = location.pathname === '/signup';
  const isAboutPage = location.pathname === '/about';
  const isContactPage = location.pathname === '/contact';
  const isSubmitContactPage = location.pathname === '/submit_contact';
  const isKeyIndicatorsPage = location.pathname === '/key_indicators';
  const isFriendsPage = location.pathname === '/friends';
  const isFriendInfoPage = location.pathname.startsWith('/friend_info');

  return (
    <header className="site-header">
      <div className="container">
        <h1 className="pmg-title">Pursue Marital Goals</h1>
        <p className="pmg-subtitle">Through Dating</p>
        <nav>
          <menu className="nav">
            {(isLoginPage || isSignUpPage) && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link text-light" to="/about">
                    About
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-light" to="/contact">
                    Contact
                  </NavLink>
                </li>
              </>
            )}

            {(isAboutPage || isContactPage || isSubmitContactPage) && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link text-light" to="/">
                    Login
                  </NavLink>
                </li>
                {isAboutPage && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-light" to="/contact">
                      Contact
                    </NavLink>
                  </li>
                )}
                {isContactPage && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-light" to="/about">
                      About
                    </NavLink>
                  </li>
                )}
              </>
            )}

            {(isKeyIndicatorsPage || isFriendsPage || isFriendInfoPage) && (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link text-light"
                    to="/"
                    onClick={onLogout}
                  >
                    Back to Login
                  </NavLink>
                </li>
                {authState === AuthState.Authenticated && isKeyIndicatorsPage && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-light" to="/friends">
                      Friends
                    </NavLink>
                  </li>
                )}
                {authState === AuthState.Authenticated && isFriendsPage && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-light" to="/key_indicators">
                      Key Indicators
                    </NavLink>
                  </li>
                )}
                {authState === AuthState.Authenticated && isFriendInfoPage && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-light" to="/friends">
                      Friends
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </menu>
        </nav>
      </div>
    </header>
  );
}

function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}