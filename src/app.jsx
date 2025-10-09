import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <div className="home-page">
        <header className="site-header">
            <div className="container">
            <h1 className="pmg-title">Pursue Marital Goals</h1>
            <p className="pmg-subtitle">Through Dating</p>
                <nav>
                    <menu className="nav">
                    <li className="nav-item"><a classNaem="nav-link text-light" href="index.html">Home</a></li>
                    <li className="nav-item"><a className="nav-link text-light" href="key_indicators.html">Key Indicators</a></li>
                    <li className="nav-item"><a className="nav-link text-light" href="friends.html">Friends</a></li>
                    <li className="nav-item"><a className="nav-link text-light" href="about.html">About</a></li>
                    <li className="nav-item"><a className="nav-link text-light" href="contact.html">Contact</a></li>
                    </menu>
                </nav>
            </div>
        </header>

        <main>App components go here</main>

        <footer className="site-footer">
          <div className="container">
            <span className="text-reset">Wolf Cribbs</span>
            <span>&copy; 2025 PMGDating. All rights reserved.</span>
            <a href="https://github.com/wcrib8/startup.git" className="footer-link"> GitHub</a>
          </div>
        </footer>
    </div>
  );
}