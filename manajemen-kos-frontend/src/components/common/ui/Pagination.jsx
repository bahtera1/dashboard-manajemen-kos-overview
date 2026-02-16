import React from 'react';

const Pagination = ({
    currentPage,
    lastPage,
    totalItems,
    perPage,
    onPageChange
}) => {

    // Logic untuk render tombol halaman
    const renderPageButtons = () => {
        if (lastPage <= 1) return null;

        let start = Math.max(1, currentPage - 2);
        let end = Math.min(lastPage, currentPage + 2);

        const buttons = [];

        if (start > 1) {
            buttons.push(
                <button key={1} onClick={() => onPageChange(1)} className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100">1</button>
            );
            if (start > 2) buttons.push(<span key="dots-start" className="px-3 py-1 text-gray-500">...</span>);
        }

        for (let i = start; i <= end; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 border rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    aria-current={i === currentPage ? 'page' : undefined}
                >
                    {i}
                </button>
            );
        }

        if (end < lastPage) {
            if (end < lastPage - 1) buttons.push(<span key="dots-end" className="px-3 py-1 text-gray-500">...</span>);
            buttons.push(
                <button key={lastPage} onClick={() => onPageChange(lastPage)} className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100 mb-1 sm:mb-0">
                    {lastPage}
                </button>
            );
        }

        return buttons;
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 p-4 bg-white shadow-lg rounded-lg border">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
                Menampilkan <span className="font-semibold">{(currentPage - 1) * perPage + 1}</span> sampai <span className="font-semibold">{Math.min(currentPage * perPage, totalItems)}</span> dari total <span className="font-semibold">{totalItems}</span> data.
            </p>
            <div className="flex space-x-2 flex-wrap justify-center items-center gap-y-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
                >
                    &larr; Sebelumnya
                </button>

                <div className="flex space-x-1">
                    {renderPageButtons()}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="px-3 py-1 border rounded bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
                >
                    Selanjutnya &rarr;
                </button>
            </div>
        </div>
    );
};

export default Pagination;
