import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/currency";

const COLORS = [
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const TransaksiCharts = ({ financialSummary }) => {
  // Compute pie chart data for income
  const incomeByCategory = useMemo(() => {
    if (!financialSummary?.pemasukan_per_kategori) return [];

    const total = financialSummary.pemasukan_per_kategori.reduce(
      (sum, item) => sum + Number(item.total),
      0,
    );

    return financialSummary.pemasukan_per_kategori.map((item) => ({
      name: item.kategori,
      value: Number(item.total),
      percentage:
        total > 0 ? ((Number(item.total) / total) * 100).toFixed(1) : 0,
    }));
  }, [financialSummary]);

  // Compute pie chart data for expense
  const expenseByCategory = useMemo(() => {
    if (!financialSummary?.pengeluaran_per_kategori) return [];

    const total = financialSummary.pengeluaran_per_kategori.reduce(
      (sum, item) => sum + Number(item.total),
      0,
    );

    return financialSummary.pengeluaran_per_kategori.map((item) => ({
      name: item.kategori,
      value: Number(item.total),
      percentage:
        total > 0 ? ((Number(item.total) / total) * 100).toFixed(1) : 0,
    }));
  }, [financialSummary]);

  // Custom tooltip for pie charts
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(payload[0].value)} ({payload[0].payload.percentage}
            %)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Pie Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Pengeluaran */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold">
              💸 Pengeluaran per Kategori
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Gunakan filter tanggal di bawah untuk mengatur rentang data.
            </p>
          </div>
          {expenseByCategory.length > 0 ? (
            <div className="grow min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => {
                      const isMobile = window.innerWidth < 640;
                      return isMobile
                        ? `${entry.percentage}%`
                        : `${entry.name} (${entry.percentage}%)`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 flex-col gap-2">
              <span className="text-4xl">📊</span>
              <p className="text-center">Tidak ada data pengeluaran</p>
              <p className="text-xs text-center">
                Data kosong untuk periode ini
              </p>
            </div>
          )}
        </div>

        {/* Pie Chart - Pemasukan */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold">
              💰 Pemasukan per Kategori
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Gunakan filter tanggal di bawah untuk mengatur rentang data.
            </p>
          </div>
          {incomeByCategory.length > 0 ? (
            <div className="grow min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => {
                      const isMobile = window.innerWidth < 640;
                      return isMobile
                        ? `${entry.percentage}%`
                        : `${entry.name} (${entry.percentage}%)`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 flex-col gap-2">
              <span className="text-4xl">📊</span>
              <p className="text-center">Tidak ada data pemasukan</p>
              <p className="text-xs text-center">
                Data kosong untuk periode ini
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransaksiCharts;
