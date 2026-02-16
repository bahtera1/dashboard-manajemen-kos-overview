import React from "react";
import LabaRugiExportCard from "../../components/exports/LabaRugiExportCard";
import ExportKamarCard from "../../components/exports/ExportKamarCard";
import ExportPenghuniCard from "../../components/exports/ExportPenghuniCard";
import ExportJatuhTempoCard from "../../components/exports/ExportJatuhTempoCard";
import ExportLaporanLengkapCard from "../../components/exports/ExportLaporanLengkapCard";

const ExportPage = () => {
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Laporan & Export
        </h1>
        <p className="text-gray-600">
          Export data ke format Excel untuk dokumentasi dan analisis
        </p>
      </div>

      {/* Laporan Keuangan - Full Width */}
      <div className="mb-6">
        <LabaRugiExportCard />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <ExportKamarCard />
        <ExportPenghuniCard />
        <ExportJatuhTempoCard />
        <ExportLaporanLengkapCard />
      </div>
      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          💡 Informasi Export
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>
              File Excel akan otomatis terdownload ke folder Downloads Anda
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>
              Nama file mengandung tanggal export untuk memudahkan tracking
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>
              Laporan Lengkap berisi multiple sheets (Ringkasan, Kamar,
              Penghuni, Jatuh Tempo)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>Data yang diexport adalah data real-time dari sistem</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default ExportPage;
