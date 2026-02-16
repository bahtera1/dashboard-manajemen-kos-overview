import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/ui/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toastState, setToastState] = useState(null);

    const showToast = useCallback((message, status = 'info', duration = 3000) => {
        setToastState({ message, status, duration });
    }, []);

    const hideToast = useCallback(() => {
        setToastState(null);
    }, []);

    const contextValue = { showToast, hideToast };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <Toast toastState={toastState} hideToast={hideToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
