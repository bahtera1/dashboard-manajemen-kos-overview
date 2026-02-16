import React from 'react';
import { SearchIcon } from "../ui/Icons";

const SearchBar = ({
    searchTerm,
    onSearchChange,
    placeholder = "Cari...",
    className = ""
}) => {
    return (
        <div className={`relative ${className}`}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
    );
};

export default SearchBar;
