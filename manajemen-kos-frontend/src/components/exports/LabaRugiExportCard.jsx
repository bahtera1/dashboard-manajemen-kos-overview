import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../../api/apiClient';
import XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currency';
import logger from '../../utils/logger';

// Helper Style
const styles = {
    header: {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" }
        }
    },
    headerIncome: { fill: { fgColor: { rgb: "10B981" } } }, // Emerald 500
    headerExpense: { fill: { fgColor: { rgb: "EF4444" } } }, // Red 500
    headerSummary: { fill: { fgColor: { rgb: "3B82F6" } } }, // Blue 500
    cell: {
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    },
    currency: {
        numFmt: '#,##0',
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    },
    title: { font: { bold: true, sz: 14, color: { rgb: "333333" } } }
};

// Helper function to extract month name from date string
const getMonthName = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { month: 'long' });
};

// Helper function to get month key for grouping (YYYY-MM format)
const getMonthKey = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const LabaRugiExportCard = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const handleDateChange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    const generateReport = async () => {
        setLoading(true);
        const { start, end } = dateRange;

        if (new Date(start) > new Date(end)) {
            showToast('Tanggal "Dari" tidak boleh lebih lambat dari tanggal "Sampai".', 'error');
            setLoading(false);
            return;
        }

        const apiUrl = `/reports/transaction-summary?start_date=${start}&end_date=${end}`;

        try {
            const response = await apiClient.get(apiUrl);

            if (!response.data || !response.data.summary) {
                throw new Error("API berhasil, tetapi struktur data respons tidak lengkap.");
            }

            setReportData(response.data);
            setShowPreview(true);
            showToast('Data laporan berhasil dimuat!', 'success');

        } catch (error) {
            logger.error('--- LOAD REPORT ERROR ---');
            logger.error('Pesan Error:', error.message);

            if (error.response) {
                logger.error('Status API:', error.response.status);
                logger.error('Data API:', error.response.data);
                showToast(`Gagal: Status ${error.response.status}. Periksa Log Server.`, 'error');
            } else {
                logger.error('Jenis Error:', 'Network/Client-side');
                showToast('Gagal: Periksa koneksi atau format tanggal.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const exportLabaRugi = async () => {
        if (!reportData) {
            showToast('Generate laporan terlebih dahulu sebelum export!', 'error');
            return;
        }

        const { start, end } = dateRange;
        const { summary, income, expense } = reportData;

        try {
            const wb = XLSX.utils.book_new();

            // === SHEET 1: RINGKASAN LABA RUGI ===
            const summarySheetData = [
                ['LAPORAN LABA RUGI'],
                [`Periode: ${formatDate(start)} sampai ${formatDate(end)}`],
                [''],
                ['Keterangan', 'Jumlah (Rp)'],
                ['Pemasukan Total', { v: summary.total_income, t: 'n', s: styles.currency }],
                ['Pengeluaran Total', { v: summary.total_expense, t: 'n', s: styles.currency }],
                [''],
                ['Laba (Rugi) Bersih', { v: summary.net_profit, t: 'n', s: { ...styles.currency, font: { bold: true } } }]
            ];
            const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);

            // Styling & width untuk Sheet 1
            wsSummary['!cols'] = [{ wch: 30 }, { wch: 25 }];
            wsSummary['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }
            ];

            // Apply Styles Manually to specific cells
            ['A1'].forEach(ref => { if (wsSummary[ref]) wsSummary[ref].s = styles.title; });
            ['A4', 'B4'].forEach(ref => { if (wsSummary[ref]) wsSummary[ref].s = { ...styles.header, ...styles.headerSummary }; });

            // Border & Style for Data Cells
            ['A5', 'A6', 'A8'].forEach(ref => { if (wsSummary[ref]) wsSummary[ref].s = styles.cell; });

            XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

            // === SHEET 2: DETAIL PEMASUKAN ===
            const incomeData = income.map((t, i) => ({
                'No': i + 1,
                'Tanggal': formatDate(t.tanggal_transaksi),
                'Bulan': getMonthName(t.tanggal_transaksi),
                'Kategori': t.kategori,
                'Deskripsi': t.deskripsi,
                'Jumlah (Rp)': t.jumlah,
                'Penghuni': t.penghuni?.nama_lengkap || t.penghuni_name || '-',
                'Kamar': t.kamar?.nama_kamar || t.kamar_name || '-',
            }));

            const wsIncome = XLSX.utils.json_to_sheet(incomeData);

            // Styling Sheet 2
            wsIncome['!cols'] = [
                { wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 20 },
                { wch: 40 }, { wch: 18 }, { wch: 20 }, { wch: 10 }
            ];

            // Header Color
            const incomeRange = XLSX.utils.decode_range(wsIncome['!ref']);
            for (let C = incomeRange.s.c; C <= incomeRange.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!wsIncome[address]) continue;
                wsIncome[address].s = { ...styles.header, ...styles.headerIncome };
            }
            // Data Border & Currency
            for (let R = 1; R <= incomeRange.e.r; ++R) {
                for (let C = 0; C <= incomeRange.e.c; ++C) {
                    const address = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!wsIncome[address]) continue;

                    let cellStyle = { ...styles.cell };
                    if (C === 5) cellStyle = { ...styles.currency }; // Jumlah
                    wsIncome[address].s = cellStyle;
                }
            }

            XLSX.utils.book_append_sheet(wb, wsIncome, 'Pemasukan');

            // === SHEET 3: DETAIL PENGELUARAN ===
            const expenseData = expense.map((t, i) => ({
                'No': i + 1,
                'Tanggal': formatDate(t.tanggal_transaksi),
                'Bulan': getMonthName(t.tanggal_transaksi),
                'Kategori': t.kategori,
                'Deskripsi': t.deskripsi,
                'Jumlah (Rp)': t.jumlah,
                'Admin': t.admin_name || '-',
            }));

            const wsExpense = XLSX.utils.json_to_sheet(expenseData);

            // Styling Sheet 3
            wsExpense['!cols'] = [
                { wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 20 },
                { wch: 40 }, { wch: 18 }, { wch: 15 }
            ];

            // Header Color
            const expenseRange = XLSX.utils.decode_range(wsExpense['!ref']);
            for (let C = expenseRange.s.c; C <= expenseRange.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!wsExpense[address]) continue;
                wsExpense[address].s = { ...styles.header, ...styles.headerExpense };
            }
            // Data Border & Currency
            for (let R = 1; R <= expenseRange.e.r; ++R) {
                for (let C = 0; C <= expenseRange.e.c; ++C) {
                    const address = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!wsExpense[address]) continue;

                    let cellStyle = { ...styles.cell };
                    if (C === 5) cellStyle = { ...styles.currency }; // Jumlah
                    wsExpense[address].s = cellStyle;
                }
            }

            XLSX.utils.book_append_sheet(wb, wsExpense, 'Pengeluaran');

            // === SHEET 4: RINGKASAN PER BULAN ===
            // Group income and expense by month
            const monthlyData = {};

            income.forEach(t => {
                const monthKey = getMonthKey(t.tanggal_transaksi);
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        bulan: getMonthName(t.tanggal_transaksi),
                        pemasukan: 0,
                        pengeluaran: 0
                    };
                }
                monthlyData[monthKey].pemasukan += Number(t.jumlah);
            });

            expense.forEach(t => {
                const monthKey = getMonthKey(t.tanggal_transaksi);
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        bulan: getMonthName(t.tanggal_transaksi),
                        pemasukan: 0,
                        pengeluaran: 0
                    };
                }
                monthlyData[monthKey].pengeluaran += Number(t.jumlah);
            });

            // Sort by month key and convert to array
            const sortedMonths = Object.keys(monthlyData).sort();
            const monthlySheetData = [
                ['RINGKASAN PEMASUKAN DAN PENGELUARAN PER BULAN'],
                [`Periode: ${formatDate(start)} sampai ${formatDate(end)}`],
                [''],
                ['No', 'Bulan', 'Pemasukan (Rp)', 'Pengeluaran (Rp)']
            ];

            let totalPemasukan = 0;
            let totalPengeluaran = 0;

            sortedMonths.forEach((monthKey, index) => {
                const data = monthlyData[monthKey];
                totalPemasukan += data.pemasukan;
                totalPengeluaran += data.pengeluaran;
                monthlySheetData.push([
                    { v: index + 1, s: styles.cell },
                    { v: data.bulan, s: styles.cell },
                    { v: data.pemasukan, t: 'n', s: styles.currency },
                    { v: data.pengeluaran, t: 'n', s: styles.currency }
                ]);
            });

            // Add total row
            monthlySheetData.push(['']);
            monthlySheetData.push([
                '',
                { v: 'TOTAL', s: { ...styles.cell, font: { bold: true } } },
                { v: totalPemasukan, t: 'n', s: { ...styles.currency, font: { bold: true } } },
                { v: totalPengeluaran, t: 'n', s: { ...styles.currency, font: { bold: true } } }
            ]);

            const wsMonthlySummary = XLSX.utils.aoa_to_sheet(monthlySheetData);

            wsMonthlySummary['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
            wsMonthlySummary['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
                { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } } // Corrected merge for title
            ];
            // Fix merge rows - 0 and 1
            wsMonthlySummary['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
            ];

            // Apply Header Styles
            ['A1'].forEach(ref => { if (wsMonthlySummary[ref]) wsMonthlySummary[ref].s = styles.title; });
            ['A4', 'B4', 'C4', 'D4'].forEach(ref => { if (wsMonthlySummary[ref]) wsMonthlySummary[ref].s = { ...styles.header, ...styles.headerSummary }; });

            XLSX.utils.book_append_sheet(wb, wsMonthlySummary, 'Ringkasan Bulanan');

            // Generate & Download
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Laporan_LabaRugi_${start}_s_d_${end}.xlsx`);

            showToast('Laporan Laba Rugi berhasil diexport!', 'success');

        } catch (error) {
            logger.error('--- EXPORT LABA RUGI ERROR ---');
            logger.error('Pesan Error:', error.message);
            showToast('Gagal export Excel. Periksa console untuk detail.', 'error');
        }
    };

    const pieData = reportData ? [
        { name: 'Pemasukan', value: reportData.summary.total_income, color: '#10b981' },
        { name: 'Pengeluaran', value: reportData.summary.total_expense, color: '#ef4444' }
    ] : [];

    const barData = reportData ? [
        { name: 'Total Pemasukan', amount: reportData.summary.total_income, fill: '#10b981' },
        { name: 'Total Pengeluaran', amount: reportData.summary.total_expense, fill: '#ef4444' },
        { name: 'Laba Bersih', amount: reportData.summary.net_profit, fill: '#3b82f6' }
    ] : [];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-linear-to-r from-pink-600 to-purple-600 rounded-2xl shadow-lg p-4 md:p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Laporan Keuangan</h2>
                        <p className="text-pink-100 text-sm md:text-base">Generate laporan laba rugi profesional</p>
                    </div>
                    <div className="text-4xl md:text-6xl opacity-20">📊</div>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-100 rounded-lg flex items-center justify-center text-lg md:text-xl">
                        🗓️
                    </div>
                    <div>
                        <h3 className="text-base md:text-xl font-semibold text-gray-900">Filter Periode</h3>
                        <p className="text-xs md:text-sm text-gray-500">Pilih rentang tanggal</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    <div className="space-y-1 md:space-y-2 col-span-1">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700">Dari Tanggal</label>
                        <input
                            type="date"
                            name="start"
                            value={dateRange.start}
                            onChange={handleDateChange}
                            className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none text-sm md:text-base"
                        />
                    </div>

                    <div className="space-y-1 md:space-y-2 col-span-1">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700">Sampai Tanggal</label>
                        <input
                            type="date"
                            name="end"
                            value={dateRange.end}
                            onChange={handleDateChange}
                            className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none text-sm md:text-base"
                        />
                    </div>

                    <div className="space-y-1 md:space-y-2 col-span-2 md:col-span-1">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 opacity-0 md:block">Action</label>
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="w-full px-6 py-2 md:py-3 bg-linear-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 md:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Proses...</span>
                                </>
                            ) : (
                                <>
                                    <span>📊</span>
                                    <span>Generate Laporan</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Laporan */}
            {showPreview && reportData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="text-3xl">💰</div>
                                <div className="text-green-200 text-sm font-medium">Total Pemasukan</div>
                            </div>
                            <h4 className="text-sm font-medium text-green-100 mb-1"></h4>
                            <p className="text-base sm:text-lg md:text-2xl font-bold wrap-break-word">{formatCurrency(reportData.summary.total_income)}</p>
                        </div>

                        <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="text-3xl">💸</div>
                                <div className="text-red-200 text-sm font-medium">Total Pengeluaran</div>
                            </div>
                            <h4 className="text-sm font-medium text-red-100 mb-1"></h4>
                            <p className="text-base sm:text-lg md:text-2xl font-bold wrap-break-word">{formatCurrency(reportData.summary.total_expense)}</p>
                        </div>

                        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="text-3xl">📈</div>
                                <div className="text-blue-200 text-sm font-medium">Net Laba Bersih</div>
                            </div>
                            <h4 className="text-sm font-medium text-blue-100 mb-1"></h4>
                            <p className="text-base sm:text-lg md:text-2xl font-bold wrap-break-word">{formatCurrency(reportData.summary.net_profit)}</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Keuangan</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Keuangan</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Export Button */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Export Laporan</h3>
                                <p className="text-sm text-gray-500 mt-1">Download laporan dalam format Excel dengan 4 sheet terpisah (Ringkasan, Pemasukan, Pengeluaran, Ringkasan Bulanan)</p>
                            </div>
                            <button
                                onClick={exportLabaRugi}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                            >
                                <span>📥</span>
                                <span>Download Excel</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LabaRugiExportCard;