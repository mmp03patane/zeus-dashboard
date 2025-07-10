import React, { useState } from 'react';
import Header from './components/Header';
import DashboardTimeline from './components/DashboardTimeline';
import AutomationsPage from './components/AutomationsPage'; // Import the new component

function App() {
  // State to manage the current page. Default to 'reviews'.
  const [currentPage, setCurrentPage] = useState('reviews');

  // Function to change the current page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {/* Pass currentPage and handlePageChange to Header */}
      <Header currentPage={currentPage} onPageChange={handlePageChange} />

      {/* Conditionally render the content based on currentPage */}
      <main className="dashboard-content"> {/* Added a wrapper for consistent padding */}
        <div className="container">
          {currentPage === 'reviews' && <DashboardTimeline />}
          {currentPage === 'automations' && <AutomationsPage />}
        </div>
      </main>
    </>
  );
}

export default App;
