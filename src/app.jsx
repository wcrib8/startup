import React from 'react';
import { useEffect, useState } from 'react';
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
  const storedUser = localStorage.getItem('userName');
  const [userName, setUserName] = React.useState(storedUser || '');
  const [authState, setAuthState] = React.useState(
    storedUser ? AuthState.Authenticated : AuthState.Unauthenticated
  );
  const [socket, setSocket] = React.useState(null);
  

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

  const saveFriendFromReferral = async (friend) => {
    try {
      // Remove the old ID and create as new friend
      const newFriend = {
        ...friend,
        id: undefined  // Let backend generate new ID
      };
        
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newFriend)
      });
        
      if (response.ok) {
        console.log('✅ Friend saved from referral');
        window.dispatchEvent(new Event('friendsListUpdated'));
      } else {
        console.error('Failed to save referred friend');
      }
    } catch (err) {
      console.error('Error saving referred friend:', err);
    }
  };

  // WebSocket action
  useEffect(() => {
    if (authState !== AuthState.Authenticated || !userName) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'identify', userName: userName }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        if (data.type === 'friend_referral_recieved') {
          saveFriendFromReferral(data.friend);
          alert(`You recieved a friend referral: ${data.friend.name}!`);
        }

        if (data.type === 'referral_error') {
          console.log('Referral error:', data.message);
          alert(data.message);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket disconnected');

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [authState, userName]);


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
                <Key_indicators userName={userName} authState={authState} socket={socket} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute authState={authState}>
                <Friends userName={userName} authState={authState} socket={socket} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friend_info/:id"
            element={
              <ProtectedRoute authState={authState}>
                <Friend_info userName={userName} authState={authState} socket={socket} />
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