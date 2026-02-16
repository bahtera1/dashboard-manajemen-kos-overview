import React, { memo } from 'react';
import { formatDate } from '../../utils/dateUtils';

const DueSoonWidget = memo(function DueSoonWidget({ dueSoon }) {
    const { data = [], count = 0, loading = false } = dueSoon;

    const getDaysRemaining = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getUrgencyColor = (daysRemaining) => {
        if (daysRemaining <= 0) return 'bg-red-50 border-red-200 text-red-800';
        if (daysRemaining <= 3) return 'bg-orange-50 border-orange-200 text-orange-800';
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    };

    const getUrgencyBadge = (daysRemaining) => {
        if (daysRemaining <= 0) return { text: 'EXPIRED', color: 'bg-red-600' };
        if (daysRemaining === 1) return { text: 'BESOK', color: 'bg-red-500' };
        if (daysRemaining <= 3) return { text: 'URGENT', color: 'bg-orange-500' };
        return { text: `${daysRemaining} HARI`, color: 'bg-yellow-500' };
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span>⏰</span>
                    <span>Jatuh Tempo</span>
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                    {count}
                </span>
            </div>

            {count === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Semua Aman</p>
                    <p className="text-xs text-gray-500">Tidak ada yang jatuh tempo</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {data.map((penghuni) => {
                        const daysRemaining = getDaysRemaining(penghuni.masa_berakhir_sewa);
                        const urgencyBadge = getUrgencyBadge(daysRemaining);

                        return (
                            <div
                                key={penghuni.id}
                                className={`border rounded-xl p-3 transition-all hover:shadow-md ${getUrgencyColor(daysRemaining)}`}
                            >
                                {/* Header Compact */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shrink-0 border border-current">
                                            👤
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-sm truncate">
                                                {penghuni.nama_lengkap}
                                            </h4>
                                            <p className="text-xs opacity-70 truncate">
                                                🏠 {penghuni.kamar?.nama_kamar || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`${urgencyBadge.color} text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap ml-2`}>
                                        {urgencyBadge.text}
                                    </span>
                                </div>

                                {/* Info Grid Compact */}
                                <div className="grid grid-cols-2 gap-2 bg-white bg-opacity-60 rounded-lg p-2 text-xs">
                                    <div>
                                        <span className="opacity-60 block">📅 Berakhir</span>
                                        <span className="font-semibold">{formatDate(penghuni.masa_berakhir_sewa)}</span>
                                    </div>
                                    <div>
                                        <span className="opacity-60 block">💰 Sewa</span>
                                        <span className="font-semibold">
                                            Rp {((penghuni.kamar?.harga_sewa || 0) / 1000).toFixed(0)}k
                                        </span>
                                    </div>
                                </div>

                                {/* Action Message Compact */}
                                <div className="mt-2 text-xs text-center opacity-70">
                                    {daysRemaining <= 0
                                        ? '⚠️ Hubungi segera!'
                                        : `⏳ ${daysRemaining} hari lagi`
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary Footer Compact */}
            {count > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Perlu Perhatian</span>
                        <span className="font-bold text-red-600">{count} Penghuni</span>
                    </div>
                </div>
            )}
        </div>
    );
});

export default DueSoonWidget;