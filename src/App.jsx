import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardTimeline from './components/DashboardTimeline';
import AutomationsPage from './components/AutomationsPage';
import AuthModal from './components/AuthModal'; // We will create this next

function App() {
  // State to manage the current page. Default to 'reviews'.
  const [currentPage, setCurrentPage] = useState('reviews');
  // State to manage user login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to control AuthModal visibility
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check for token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // In a real app, you'd want to validate this token with your backend
      // to ensure it's still valid and not expired.
    }
  }, []);

  // Function to change the current page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to open the AuthModal
  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  // Function to close the AuthModal
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Function to handle successful login (passed to AuthModal)
  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token); // Store the token
    setIsLoggedIn(true);
    closeAuthModal(); // Close modal on success
  };

  // Function to handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('token'); // Remove the token
    setIsLoggedIn(false);
    setCurrentPage('reviews'); // Optionally redirect to a default page
    alert('You have been signed out.'); // Use a custom message box in production
  };

  return (
    <>
      {/* Pass login status and handlers to Header */}
      <Header
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isLoggedIn={isLoggedIn}
        onLoginClick={openAuthModal} // Header will trigger modal open
        onSignOut={handleSignOut} // Header will handle sign out
      />

      <main className="dashboard-content">
        <div className="container">
          {/* Conditionally render content based on login status */}
          {isLoggedIn ? (
            <>
              {currentPage === 'reviews' && <DashboardTimeline />}
              {currentPage === 'automations' && <AutomationsPage />}
            </>
          ) : (
            // If not logged in, show a message or direct to login modal
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h2>Welcome to ZEUS!</h2>
              <p>Please log in or register to access your dashboard.</p>
              <button className="btn btn-primary" onClick={openAuthModal}>
                Login / Register
              </button>
            </div>
          )}
        </div>
      </main>

      {/* AuthModal component */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={closeAuthModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}

export default App;
