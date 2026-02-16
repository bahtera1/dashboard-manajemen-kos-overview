import React, { memo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import CustomSelect from '../common/forms/CustomSelect';

const FinancialTrendChart = memo(function FinancialTrendChart({ data, selectedLimit, onLimitChange, isLoading }) {
    const limitOptions = [
        { label: '1 Bulan Terakhir', value: 1 },
        { label: '2 Bulan Terakhir', value: 2 },
        { label: '3 Bulan Terakhir', value: 3 },
        { label: '4 Bulan Terakhir', value: 4 },
        { label: '5 Bulan Terakhir', value: 5 },
        { label: '6 Bulan Terakhir', value: 6 },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 relative">

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-xl transition-all duration-300">
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg border border-gray-100">
                        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Trend Keuangan</h3>
                    <p className="text-sm text-gray-500">
                        Pemasukan vs Pengeluaran ({selectedLimit} Bulan)
                    </p>
                </div>

                <div className="w-full sm:w-48 z-10">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Durasi Waktu:</label>
                    <CustomSelect
                        name="limit-select"
                        value={selectedLimit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        options={limitOptions}
                        searchable={false}
                        placeholder="Pilih Durasi"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="relative z-0">
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            width={55}
                            tickFormatter={(value) => {
                                const absValue = Math.abs(value);
                                const sign = value < 0 ? '-' : '';

                                if (absValue >= 1000000) {
                                    const formatted = (absValue / 1000000).toFixed(1).replace(/\.0$/, '');
                                    return `${sign}${formatted}Jt`;
                                }
                                if (absValue >= 1000) {
                                    const formatted = (absValue / 1000).toFixed(0);
                                    return `${sign}${formatted}Rb`;
                                }
                                return value;
                            }}
                        />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            cursor={{ fill: '#f9fafb' }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                        <Bar
                            dataKey="pemasukan"
                            fill="#10b981"
                            name="Pemasukan"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                        <Bar
                            dataKey="pengeluaran"
                            fill="#ef4444"
                            name="Pengeluaran"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                        <Bar
                            dataKey="laba_rugi"
                            fill="#3b82f6"
                            name="Laba/Rugi"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default FinancialTrendChart;
