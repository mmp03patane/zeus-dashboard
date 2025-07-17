import React, { useState } from 'react';

const AuthModal = ({ onClose, onLoginSuccess }) => {
    const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and register forms
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // For displaying success/error messages

    // Determine the API base URL from environment variables
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        const endpoint = isRegistering ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/login`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(isRegistering ? 'Registration successful! Please log in.' : 'Login successful!');
                if (!isRegistering) {
                    onLoginSuccess(data.token); // Pass the token up to App.jsx
                } else {
                    // After successful registration, switch to login form
                    setIsRegistering(false);
                    setEmail(''); // Clear email for login form
                    setPassword(''); // Clear password for login form
                }
            } else {
                setMessage(data.message || 'An error occurred.');
            }
        } catch (error) {
            console.error('Auth error:', error);
            setMessage('Network error or server unreachable.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <h2>{isRegistering ? 'Register' : 'Login'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                </form>
                {message && <p className="auth-message">{message}</p>}
                <p className="toggle-auth">
                    {isRegistering ? (
                        <>
                            Already have an account?{' '}
                            <span onClick={() => setIsRegistering(false)}>Login here</span>
                        </>
                    ) : (
                        <>
                            Don't have an account?{' '}
                            <span onClick={() => setIsRegistering(true)}>Register here</span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default AuthModal;

