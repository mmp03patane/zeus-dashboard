import React from 'react';

const SuccessModal = ({ message, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '3rem', color: '#10B981', marginBottom: '1rem' }}>✅</p> {/* Success checkmark emoji */}
                    <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Success!</h2>
                    <p style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '1.5rem' }}>{message}</p>
                    <button className="btn btn-primary" onClick={onClose}>
                        Got It!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;