import React, { useState, useEffect, useCallback } from 'react';

// Status yang mungkin: success, error, info
const getStyle = (status) => {
    switch (status) {
        case 'success':
            return 'bg-green-500 border-green-700';
        case 'error':
            return 'bg-red-500 border-red-700';
        default:
            return 'bg-blue-500 border-blue-700';
    }
};




// Komponen yang menampilkan Toast
const Toast = ({ toastState, hideToast }) => {

    // Auto-hide logic
    useEffect(() => {
        if (toastState) {
            const timer = setTimeout(hideToast, toastState.duration);
            return () => clearTimeout(timer);
        }
    }, [toastState, hideToast]);

    if (!toastState) return null;

    const { message, status } = toastState;
    const styleClass = getStyle(status);

    return (
        <div className={`fixed bottom-4 right-4 p-4 text-white rounded-lg shadow-xl border-b-4 z-50 transition-transform duration-300 ease-out transform ${styleClass}`}>
            <div className="flex items-center">
                <span className="font-semibold text-sm">{status.toUpperCase()}</span>
                <span className="ml-3 text-base">{message}</span>
                <button onClick={hideToast} className="ml-4 text-white/75 hover:text-white font-bold text-xl">&times;</button>
            </div>
        </div>
    );
};

export default Toast;