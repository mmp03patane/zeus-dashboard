import React, { useState } from 'react';
import ZeusLogo from '/zeuscrop.PNG'; // Make sure you have zeus-logo.png in your public folder

// Header component now accepts currentPage and onPageChange as props
const Header = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#" onClick={() => onPageChange('reviews')} className="header-logo">
            <img src={ZeusLogo} alt="Zeus Logo" className="header-logo" />
          </a>
          {/* Dashboard Navigation Links */}
          <nav className="navbar-dashboard-links">
            <a
              href="#"
              onClick={() => onPageChange('reviews')}
              className={`nav-link ${currentPage === 'reviews' ? 'active' : ''}`}
            >
              Reviews
            </a>
            <a
              href="#"
              onClick={() => onPageChange('automations')}
              className={`nav-link ${currentPage === 'automations' ? 'active' : ''}`}
            >
              Automations
            </a>
          </nav>
        </div>

        <div className="nav-controls">
          {/* Mobile Hamburger Button */}
          <button className="hamburger-button" onClick={toggleMobileMenu}>
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
          </button>
          {/* Sign Out Button (Desktop) */}
          <a href="#" className="btn btn-login btn-login-desktop">Sign Out</a>
        </div>
      </div>

      {/* Mobile Menu */}
      <ul id="mobile-menu" className={isMobileMenuOpen ? 'open' : ''}>
        <li>
          <a
            href="#"
            onClick={() => onPageChange('reviews')}
            className={`nav-link ${currentPage === 'reviews' ? 'active' : ''}`}
          >
            Reviews
          </a>
        </li>
        <li>
          <a
            href="#"
            onClick={() => onPageChange('automations')}
            className={`nav-link ${currentPage === 'automations' ? 'active' : ''}`}
          >
            Automations
          </a>
        </li>
        <li><a href="#" className="btn btn-login btn-login-mobile">Sign Out</a></li>
      </ul>
    </header>
  );
};

export default Header;
