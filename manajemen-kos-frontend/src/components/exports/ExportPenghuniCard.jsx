import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/apiClient';
import XLSX from 'xlsx-js-style'; // CHANGED
import { saveAs } from 'file-saver';
import logger from '../../utils/logger';

// Helper Style
const styles = {
    header: {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "A855F7" } }, // Purple 500
        border: {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" }
        }
    },
    cell: {
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    }
};

const ExportPenghuniCard = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const handleExport = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const response = await apiClient.get('/reports/tenant-details', { params });
            const data = response.data.data;

            const excelData = data.map((item, index) => ({
                'No': index + 1,
                'Nama': item.nama_lengkap,
                'Tanggal Masuk': item.tanggal_masuk || '-',
                'Tanggal Keluar': item.tanggal_keluar || '-',
                'Masa Berakhir': item.masa_berakhir_sewa || '-',
                'Status': item.status_sewa,
                'Kamar': item.kamar_nama,
                'Jumlah Hari': item.jumlah_hari,
                'No HP': item.no_hp,
                'Email': item.email || '-',
            }));
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            ws['!cols'] = [
                { wch: 5 },   // No
                { wch: 20 },  // Nama
                { wch: 15 },  // Tanggal Masuk
                { wch: 15 },  // Tanggal Keluar
                { wch: 15 },  // Masa Berakhir
                { wch: 12 },  // Status
                { wch: 12 },  // Kamar
                { wch: 12 },  // Jumlah Hari
                { wch: 15 },  // No HP
                { wch: 25 },  // Email
            ];

            // Apply Styles
            const range = XLSX.utils.decode_range(ws['!ref']);

            // Header Style
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!ws[address]) continue;
                ws[address].s = styles.header;
            }

            // Data Style (Border)
            for (let R = 1; R <= range.e.r; ++R) {
                for (let C = 0; C <= range.e.c; ++C) {
                    const address = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[address]) continue;
                    ws[address].s = styles.cell;
                }
            }

            XLSX.utils.book_append_sheet(wb, ws, 'Detail Penghuni');

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            saveAs(blob, `Detail_Penghuni_${new Date().toISOString().slice(0, 10)}.xlsx`);
            showToast('Export Detail Penghuni berhasil!', 'success');
        } catch (error) {
            logger.error('Export error:', error);
            showToast('Gagal export data penghuni', 'error');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5 truncate">Detail Penghuni</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">Data lengkap penghuni</p>
                </div>
            </div>
            {/* Status Filter */}
            <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Filter Status</label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Tidak Aktif</option>
                </select>
            </div>
            <button
                onClick={handleExport}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Exporting...</span>
                    </>
                ) : (
                    <>
                        <span>📥</span>
                        <span>Export Excel</span>
                    </>
                )}
            </button>
        </div>
    );
};
export default ExportPenghuniCard;