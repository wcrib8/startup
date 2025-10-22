import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Login } from './login/login';
import { Contact } from './contact/contact';
import { About } from './about/about';
import { Friends } from './friends/friends';
import { Key_indicators } from './key_indicators/key_indicators';
import { Friend_info } from './friend_info/friend_info';
import { Submit_contact } from './submit_contact/submit_contact';

export default function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);

  return (
    <BrowserRouter>
        <div className="body">
            <Header />
            <Routes>
                <Route
                  path='/' 
                  element={
                    <Login
                      userName={userName}
                      authState={authState}
                      onAuthChange={(userName, authState) => {
                        setUserName(userName);       
                        setAuthState(authState);
                      }}
                    />
                  }
                  exact
                />
                <Route 
                  path="/signup" 
                  element={
                    <Signup 
                      userName={userName}
                      authState={authState}
                      onAuthChange={(userName, authState) => {
                        setUserName(userName);       
                        setAuthState(authState);
                      }} 
                    />
                  } 
                  exact
                />
                <Route path='/key_indicators' element={<Key_indicators userName={userName} />} />
                <Route path='/friends' element={<Friends userName={userName} />} />
                <Route path='/about' element={<About />} />
                <Route path='/contact' element={<Contact />} />
                <Route path='/friend_info' element={<Friend_info userName={userName} />} />
                <Route path='/submit_contact' element={<Submit_contact />} />
                <Route path='*' element={<NotFound />} />
            </Routes>

            <footer className="site-footer">
            <div className="container">
                <span className="text-reset">Wolf Cribbs</span>
                <span>&copy; 2025 PMGDating. All rights reserved.</span>
                <a href="https://github.com/wcrib8/startup.git" className="footer-link"> GitHub</a>
            </div>
            </footer>
        </div>
    </BrowserRouter>
  );
}

function Header() {
  const location = useLocation();

  const isLoginPage = location.pathname === '/';
  const isSignUpPage = location.pathname === '/signup';
  const isAboutPage = location.pathname === '/about';
  const isContactPage = location.pathname === '/contact';
  const isSubmitContactPage = location.pathname === '/submit_contact';
  const isKeyIndicatorsPage = location.pathname === '/key_indicators';
  const isFriendsPage = location.pathname === '/friends';
  const isFriendInfoPage = location.pathname === '/friend_info';

  return (
    <header className="site-header">
      <div className="container">
        <h1 className="pmg-title">Pursue Marital Goals</h1>
        <p className="pmg-subtitle">Through Dating</p>
        <nav>
          <menu className="nav">
            {isLoginPage ? (
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
            ) : isSignUpPage ? (
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
            ) : isAboutPage ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link text-light" to="/">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-light" to="/contact">
                    Contact
                  </NavLink>
                </li>
              </>
            ) : isContactPage ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link text-light" to="/">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-light" to="/about">
                    About
                  </NavLink>
                </li>
              </>
            ) : isSubmitContactPage ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link text-light" to="/">
                    Login
                  </NavLink>
                </li>
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
            ) : isKeyIndicatorsPage ? (
              <>
                <li className="nav-item">
                  <NavLink 
                    className="nav-link text-light" 
                    to="/"
                    onClick={() => {
                      localStorage.removeItem('userName');
                    }}
                  >
                    Back to Login
                  </NavLink>
                </li>
                {authState === AuthState.Authenticated && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-light" to="/friends">
                      Friends
                    </NavLink>
                  </li>
                )}
              </>
            ) : isFriendsPage ? (
                <>
                <li className="nav-item">
                  <NavLink 
                    className="nav-link text-light" 
                    to="/"
                    onClick={() => {
                      localStorage.removeItem('userName');
                    }}
                  >
                    Back to Login
                  </NavLink>
                </li>
                {authState === AuthState.Authenticated && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-light" to="/key_indicators">
                      Key Indicators
                    </NavLink>
                  </li>
                )}
                </>
            ) : isFriendInfoPage ? (
                <>
                <li className="nav-item">
                  <NavLink 
                    className="nav-link text-light" 
                    to="/"
                    onClick={() => {
                      localStorage.removeItem('userName');
                    }}
                  >
                    Back to Login
                  </NavLink>
                </li>
                {authState === AuthState.Authenticated && (
                  <li className="nav-item">
                    <NavLink className="nav-link text-light" to="/friends">
                      Friends
                    </NavLink>
                  </li>
                )}
                </>
            ) : null}
          </menu>
        </nav>
      </div>
    </header>
  );
}


function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}