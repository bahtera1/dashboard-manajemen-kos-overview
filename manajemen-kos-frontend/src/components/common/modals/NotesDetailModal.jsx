import React from 'react';
import { sanitizeHTML } from '../../../utils/security';

const NotesDetailModal = ({ notes, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Catatan Admin</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div
                    className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-3 rounded-md max-h-80 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(notes) }}
                />
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default NotesDetailModal;