import React, { memo } from 'react';

const StatsCard = memo(function StatsCard({
    title,
    value,
    icon,
    className = 'bg-white',
    valueClassName = '',
    titleClassName = '',
    loading = false
}) {
    if (loading) {
        return (
            <div className={`rounded-xl shadow-sm border p-6 animate-pulse bg-white ${className}`}>
                <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
        );
    }

    const finalTitleClass = titleClassName || (className.includes('bg-linear') || className.includes('bg-blue') || className.includes('bg-green') || className.includes('bg-red') ? 'text-blue-50/90' : 'text-gray-600');
    const finalValueClass = valueClassName || (className.includes('bg-linear') ? 'text-white' : 'text-gray-900');

    return (
        <div className={`rounded-xl shadow-sm border p-6 ${className}`}>
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className={`text-sm font-medium ${finalTitleClass}`}>{title}</h3>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${finalValueClass}`}>{value}</p>
        </div>
    );
});

export default StatsCard;
