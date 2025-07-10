import React, { useState } from 'react';

const AutomationsPage = () => {
  // State to hold the currently selected CRM
  const [selectedCRM, setSelectedCRM] = useState(null);
  // State to track if a CRM is connected
  const [isConnected, setIsConnected] = useState(false);
  // State for the search input value
  const [searchTerm, setSearchTerm] = useState('');

  // List of suggested CRMs/platforms
  const suggestedCRMs = [
    'Hubspot',
    'Quickbooks',
    'MYOB',
    'Tradify',
    'ServiceM8',
    'Salesforce',
    'Zoho CRM',
    'Xero',
    'Shopify',
    'WooCommerce',
    'Pipedrive',
    'Freshsales',
    'Insightly',
  ];

  // Filtered CRMs based on search term
  const filteredCRMs = suggestedCRMs.filter(crm =>
    crm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle CRM item click
  const handleCRMSelect = (crm) => {
    setSelectedCRM(crm);
    setIsConnected(false); // Reset connection status if a new CRM is selected
  };

  // Handle Connect button click
  const handleConnect = () => {
    if (selectedCRM) {
      setIsConnected(true);
      // In a real application, you would trigger an API call here
      // to connect to the selected CRM.
      console.log(`Attempting to connect to: ${selectedCRM}`);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSelectedCRM(null); // Clear selection when searching
    setIsConnected(false); // Reset connection status when searching
  };

  // Handle search button click (optional, as filtering is live)
  const handleSearchClick = () => {
    // You could add specific search logic here if needed,
    // but for now, the filtering happens on input change.
    console.log(`Searching for: ${searchTerm}`);
  };

  return (
    <div className="automations-page">
      <h2 className="automations-heading">Connect ZEUS to your current CRM</h2>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="What CRM do you use?"
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="search-button btn btn-primary" onClick={handleSearchClick}>Search</button>
      </div>

      {/* Display connection status */}
      {isConnected && selectedCRM && (
        <div className="connection-status connected">
          ✅ Successfully Connected to {selectedCRM}!
        </div>
      )}

      {/* Display selected CRM and Connect button */}
      {selectedCRM && !isConnected && (
        <div className="selected-crm-container">
          <p className="selected-crm-text">You selected: <strong>{selectedCRM}</strong></p>
          <button className="btn btn-primary" onClick={handleConnect}>
            Connect to {selectedCRM}
          </button>
        </div>
      )}

      <h3 className="suggested-automations-heading">Suggested Automations</h3>
      <div className="suggested-automations-grid">
        {filteredCRMs.length > 0 ? (
          filteredCRMs.map((crm, index) => (
            <div
              key={index}
              className={`automation-item ${selectedCRM === crm ? 'selected' : ''}`}
              onClick={() => handleCRMSelect(crm)}
            >
              {crm}
            </div>
          ))
        ) : (
          <p className="no-results-message">No CRMs found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default AutomationsPage;
