import React from 'react';

/**
 * Komponen untuk menampilkan loading spinner di tengah layar penuh.
 * @param {string} message - Pesan yang ditampilkan di bawah spinner.
 */
const FullScreenLoader = ({ message = "Memuat data..." }) => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8">
                {/* Modern Bouncing Dots Spinner */}
                <div className="flex justify-center items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* Pesan loading yang dapat disesuaikan */}
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
};

export default FullScreenLoader;