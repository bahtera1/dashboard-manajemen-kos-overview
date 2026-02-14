import React, { memo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const OccupancyChart = memo(function OccupancyChart({ data }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Room Occupancy</h3>
                {data.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                        {data[0]?.date_formatted} - {data[data.length - 1]?.date_formatted}
                    </p>
                )}
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="0"
                        stroke="#e5e7eb"
                        vertical={true}
                        horizontal={true}
                    />
                    <XAxis
                        dataKey="date_formatted"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        label={{ value: 'Tanggal', position: 'insideBottom', offset: -10, style: { fontSize: 12, fill: '#374151' } }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        ticks={[0, 20, 40, 60, 80, 100]}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        label={{ value: 'Percentage', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#374151' } }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />
                    <Line
                        type="linear"
                        dataKey="occupancy_rate"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        name="Actual (%)"
                        dot={{ fill: '#2563eb', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="linear"
                        dataKey="plan_rate"
                        stroke="#dc2626"
                        strokeWidth={2.5}
                        strokeDasharray="5 5"
                        name="Plan (%)"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});

export default OccupancyChart;
