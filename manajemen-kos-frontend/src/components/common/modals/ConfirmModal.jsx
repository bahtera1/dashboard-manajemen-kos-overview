import React from 'react';

const ConfirmModal = ({ title = 'Konfirmasi Tindakan', message, onConfirm, onCancel, confirmText = 'Ya, Hapus', cancelText = 'Batal' }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-100 bg-clip-padding backdrop-filter backdrop-blur-sm bg-black/20">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>

                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;