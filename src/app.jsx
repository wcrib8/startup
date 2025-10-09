import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Contact } from './contact/contact';
import { About } from './about/about';
import { Friends } from './friends/friends';
import { Key_indicators } from './key_indicators/key_indicators';
import { Friend_info } from './friend_info/friend_info';
import { Submit_contact } from './submit_contact/submit_contact';

export default function App() {
  return (
    <BrowserRouter>
        <div className="home-page">
            <header className="site-header">
                <div className="container">
                <h1 className="pmg-title">Pursue Marital Goals</h1>
                <p className="pmg-subtitle">Through Dating</p>
                    <nav>
                        <menu className="nav">
                        <li className="nav-item"><NavLink className="nav-link text-light" to="">Login</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link text-light" to="key_indicators">Key Indicators</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link text-light" to="friends">Friends</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link text-light" to="about">About</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link text-light" to="contact">Contact</NavLink></li>
                        </menu>
                    </nav>
                </div>
            </header>

            <Routes>
                <Route path='/' element={<Login />} exact />
                <Route path='/key_indicators' element={<Key_indicators />} />
                <Route path='/friends' element={<Friends />} />
                <Route path='/about' element={<About />} />
                <Route path='/contact' element={<Contact />} />
                <Route path='/friend_info' element={<Friend_info />} />
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

function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}