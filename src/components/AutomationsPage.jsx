// src/components/AutomationsPage.jsx

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios';
import './AutomationsPage.css';

// Base URL for your backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const AutomationsPage = () => {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize fetchIntegrations using useCallback
    const fetchIntegrations = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated. Please log in.');
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/integrations`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIntegrations(response.data);
            setError(null); // Clear any previous errors on successful fetch
        } catch (err) {
            console.error('Error fetching integrations:', err);
            setError('Failed to load integrations.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]); // Dependencies for useCallback

    // useEffect hook to fetch data on component mount and when dependencies change
    useEffect(() => {
        fetchIntegrations();

        // Get the origin of the backend API URL for the postMessage check
        // This dynamically extracts "http://localhost:5000" from "http://localhost:5000/api"
        const BACKEND_API_ORIGIN = new URL(API_BASE_URL).origin;

        const handleMessage = (event) => {
            console.log('Message received from popup:', event.data, 'from origin:', event.origin); // Added log
            console.log('Expected BACKEND_API_ORIGIN for check:', BACKEND_API_ORIGIN); // Added log
            console.log('Expected FRONTEND_URL for general use:', FRONTEND_URL); // Added log

            // Corrected origin check: check against the backend's origin
            if (event.origin === BACKEND_API_ORIGIN) { // <--- THIS IS THE CRITICAL CORRECTION
                console.log('Origin check passed. Triggering fetchIntegrations.'); // Added log
                if (event.data === 'hubspotConnected') {
                    alert('HubSpot Connected Successfully!');
                    fetchIntegrations(); // Re-fetch integrations to update UI
                } else if (event.data === 'xeroConnected') {
                    alert('Xero Connected Successfully!');
                    fetchIntegrations(); // Re-fetch integrations to update UI
                }
            } else {
                console.warn('Origin mismatch! Expected:', BACKEND_API_ORIGIN, 'Received:', event.origin); // Added log
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [fetchIntegrations, API_BASE_URL]); // Added API_BASE_URL to dependencies

    const isHubspotConnected = integrations.some(
        (integration) => integration.provider === 'hubspot' && integration.isConnected
    );
    const isXeroConnected = integrations.some(
        (integration) => integration.provider === 'xero' && integration.isConnected
    );

    const connectHubspot = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to connect HubSpot.');
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/integrations/hubspot/connect`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            window.open(response.data.authUrl, 'hubspotAuth', 'width=600,height=700,resizable=yes,scrollbars=yes');
        } catch (err) {
            console.error('Error initiating HubSpot connection:', err);
            alert('Failed to initiate HubSpot connection.');
        }
    };

    const connectXero = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to connect Xero.');
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/integrations/xero/connect`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            window.open(response.data.authUrl, 'xeroAuth', 'width=600,height=700,resizable=yes,scrollbars=yes');
        } catch (err) {
            console.error('Error initiating Xero connection:', err);
            alert('Failed to initiate Xero connection.');
        }
    };

    const disconnectXero = async () => {
        if (window.confirm('Are you sure you want to disconnect Xero? This will remove all associated triggers and data.')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Not authenticated.');
                    return;
                }
                setLoading(true);
                await axios.post(`${API_BASE_URL}/integrations/xero/disconnect`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert('Xero disconnected successfully!');
                fetchIntegrations(); // This should now trigger a re-render
            } catch (err) {
                console.error('Error disconnecting Xero:', err);
                setError('Failed to disconnect Xero.');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <div className="automations-page">Loading integrations...</div>;
    if (error) return <div className="automations-page error-message">Error: {error}</div>;

    return (
        <div className="automations-page">
            <h2 className="automations-page-title">Connect Your Business Apps</h2>
            <p className="automations-page-description">
                Seamlessly connect your CRM or accounting software to automate Google review requests.
            </p>

            <div className="integration-cards">
                {/* HubSpot Card */}
                <div className="integration-card">
                    <img src="/img/hubspot-logo.png" alt="HubSpot Logo" className="integration-logo" />
                    <h3>HubSpot CRM</h3>
                    <p>Automate review requests when deals are closed won.</p>
                    <button
                        className={`connect-button ${isHubspotConnected ? 'connected' : ''}`}
                        onClick={connectHubspot}
                        disabled={isHubspotConnected}
                    >
                        {isHubspotConnected ? 'HubSpot Connected!' : 'Connect HubSpot'}
                    </button>
                    {isHubspotConnected && (
                        <span className="status-indicator connected-status">&#10004; Connected</span>
                    )}
                </div>

                {/* Xero Card */}
                <div className="integration-card">
                    <img src="/img/xero-logo.png" alt="Xero Logo" className="integration-logo" />
                    <h3>Xero Accounting</h3>
                    <p>Trigger review requests automatically when invoices are paid.</p>
                    {!isXeroConnected ? (
                        <button
                            className="connect-button"
                            onClick={connectXero}
                        >
                            Connect Xero
                        </button>
                    ) : (
                        <>
                            <button
                                className="connect-button connected"
                                onClick={() => { /* No action on click for connected state */ }}
                            >
                                Xero Connected!
                                <span className="status-indicator connected-status">&#10004;</span>
                            </button>
                            <button
                                className="disconnect-button"
                                onClick={disconnectXero}
                            >
                                Disconnect
                            </button>
                        </>
                    )}
                </div>

                {/* Placeholder for other integrations */}
                <div className="integration-card coming-soon">
                    <img src="/img/myob-logo.png" alt="MYOB Logo" className="integration-logo" />
                    <h3>MYOB (Coming Soon)</h3>
                    <p>Integrate with MYOB to streamline your review collection.</p>
                    <button className="connect-button disabled" disabled>
                        Coming Soon
                    </button>
                </div>

                 <div className="integration-card coming-soon">
                    <img src="/img/tradify-logo.png" alt="Tradify Logo" className="integration-logo" />
                    <h3>Tradify (Coming Soon)</h3>
                    <p>Integrate with Tradify to streamline your review collection.</p>
                    <button className="connect-button disabled" disabled>
                        Coming Soon
                    </button>
                </div>
            </div>

            <h2 className="automations-page-title">Manage Your Review Triggers</h2>
            <p className="automations-page-description">
                Set up and customize the conditions for sending automated review requests.
            </p>

            {/* Placeholder for Trigger Management section */}
            <div className="triggers-section">
                <p>Trigger management features will appear here after integrations are connected.</p>
                {/* Future: Display list of configured triggers, options to add/edit/delete */}
            </div>
        </div>
    );
};

export default AutomationsPage;