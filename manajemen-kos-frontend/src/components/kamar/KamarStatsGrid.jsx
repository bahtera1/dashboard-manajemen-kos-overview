import React from 'react';
import StatsCard from '../dashboard/StatsCard';

const KamarStatsGrid = ({ stats }) => {
    // Memastikan angka valid meskipun stats null/undefined
    const total = stats?.total_kamar || stats?.total || 0;
    const terisi = stats?.kamar_terisi || stats?.occupied || 0;
    const kosong = stats?.kamar_kosong || stats?.available || 0;

    // Hitung okupansi jika tidak disediakan langsung
    let occupancy = stats?.occupancy_rate;
    if (occupancy === undefined && total > 0) {
        occupancy = ((terisi / total) * 100).toFixed(1);
    } else if (occupancy === undefined) {
        occupancy = 0;
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <StatsCard
                title="Total Kamar"
                value={total}
                icon="🏠"
            />
            <StatsCard
                title="Terisi"
                value={terisi}
                icon="✅"
                valueClassName="text-green-600"
            />
            <StatsCard
                title="Kosong"
                value={kosong}
                icon="⬜"
            />
            <StatsCard
                title="Okupansi"
                value={`${occupancy}%`}
                icon="📈"
                valueClassName="text-blue-600"
            />
        </div>
    );
};

export default KamarStatsGrid;
