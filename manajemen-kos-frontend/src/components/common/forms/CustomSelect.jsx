import React, { useState, useRef, useEffect, memo } from 'react';

const CustomSelect = memo(function CustomSelect({
    value,
    onChange,
    options = [],
    name,
    placeholder = "Pilih...",
    disabled = false,
    className = "",
    searchable = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    const getSelectedLabel = () => {
        if (!value) return null;

        for (const opt of options) {
            if (opt.options && Array.isArray(opt.options)) {
                const found = opt.options.find(o => o.value == value);
                if (found) return found.label;
            }
            else if (opt.value == value) {
                return opt.label;
            }
        }
        return value;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({
            target: {
                name: name,
                value: optionValue
            }
        });
        setIsOpen(false);
        setSearchTerm('');
    };

    const getFilteredOptions = () => {
        if (!searchTerm) return options;
        const lowerSearch = searchTerm.toLowerCase();

        return options.reduce((acc, opt) => {
            if (opt.options) {
                const filteredSubOptions = opt.options.filter(o => o.label.toLowerCase().includes(lowerSearch));
                if (filteredSubOptions.length > 0) {
                    acc.push({ ...opt, options: filteredSubOptions });
                }
            } else {
                if (opt.label.toLowerCase().includes(lowerSearch)) {
                    acc.push(opt);
                }
            }
            return acc;
        }, []);
    };

    const displayOptions = getFilteredOptions();

    return (
        <div
            className={`relative ${className}`}
            ref={containerRef}
            style={{ zIndex: isOpen ? 50 : 'auto' }}
        >
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full px-3 py-2 border rounded-md flex justify-between items-center bg-white cursor-pointer transition-colors text-sm
                    ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:border-blue-400 focus:ring-2 focus:ring-blue-500'}
                    ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-500'} 
                `}
                style={{ minHeight: '38px', borderColor: 'rgb(209 213 219)' }}
            >
                <span className={`block truncate ${!value ? 'text-gray-500' : 'text-gray-900'}`}>
                    {getSelectedLabel() || placeholder}
                </span>
                <span className="pointer-events-none flex items-center pl-2">
                    <svg className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </div>

            {isOpen && (
                <div className="absolute z-100 mt-1 w-full bg-white shadow-xl max-h-60 rounded-md border border-gray-200 overflow-hidden flex flex-col animate-fadeIn">
                    {searchable && (
                        <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
                            <input
                                autoFocus
                                type="text"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                placeholder="Cari..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="overflow-auto flex-1 py-1">
                        {displayOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500 min-h-[50px] flex items-center justify-center">
                                Tidak ada hasil.
                            </div>
                        ) : (
                            displayOptions.map((opt, idx) => (
                                <React.Fragment key={idx}>
                                    {opt.options ? (
                                        <div>
                                            <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 sticky -top-1">
                                                {opt.label}
                                            </div>
                                            {opt.options.map((subOpt) => (
                                                <div
                                                    key={subOpt.value}
                                                    onClick={() => handleSelect(subOpt.value)}
                                                    className={`
                                                        px-3 py-2 text-sm cursor-pointer pl-6
                                                        ${value === subOpt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                                                    `}
                                                >
                                                    {subOpt.label}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => !opt.disabled && handleSelect(opt.value)}
                                            className={`
                                                px-3 py-2 text-sm
                                                ${opt.disabled
                                                    ? 'text-gray-400 cursor-not-allowed bg-gray-50 italic'
                                                    : value === opt.value
                                                        ? 'bg-blue-50 text-blue-700 font-medium cursor-pointer'
                                                        : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
                                                }
                                            `}
                                        >
                                            {opt.label}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default CustomSelect;
