import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import apiClient from "../../api/apiClient";
import XLSX from "xlsx-js-style"; // CHANGED
import { saveAs } from "file-saver";
import { formatDate } from "../../utils/dateUtils";
import logger from "../../utils/logger";

// Helper Style
const styles = {
  header: {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "F97316" } },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  },
  cell: {
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  },
};

const ExportJatuhTempoCard = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const exportJatuhTempo = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/reports/due-soon");
      const dueSoon = response.data.data;

      if (!dueSoon || dueSoon.length === 0) {
        showToast("Tidak ada data penghuni yang akan jatuh tempo", "info");
        setLoading(false);
        return;
      }

      const excelData = dueSoon.map((penghuni, index) => {
        const today = new Date();
        const endDate = new Date(penghuni.masa_berakhir_sewa);
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let statusJatuhTempo = "";
        if (diffDays < 0) {
          statusJatuhTempo = `Lewat ${Math.abs(diffDays)} Hari`;
        } else if (diffDays === 0) {
          statusJatuhTempo = "Jatuh Tempo Hari Ini";
        } else {
          statusJatuhTempo = `${diffDays} Hari Lagi`;
        }

        return {
          No: index + 1,
          "Nama Lengkap": penghuni.nama_lengkap,
          "No HP": penghuni.no_hp,
          Kamar: penghuni.kamar?.nama_kamar || "-",
          "Tanggal Masuk": formatDate(penghuni.tanggal_masuk),
          "Masa Berakhir Sewa": formatDate(penghuni.masa_berakhir_sewa),
          "Status Jatuh Tempo": statusJatuhTempo,
          "Sisa Hari": diffDays,
          Prioritas:
            diffDays < 0
              ? "URGENT - Lewat Tempo"
              : diffDays <= 3
                ? "URGENT"
                : diffDays <= 7
                  ? "Perlu Perhatian"
                  : "Normal",
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      ws["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 18 },
        { wch: 20 },
        { wch: 10 },
        { wch: 20 },
      ];

      // Apply Styles
      const range = XLSX.utils.decode_range(ws["!ref"]);

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

      XLSX.utils.book_append_sheet(wb, ws, "Jatuh Tempo");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `Laporan_Jatuh_Tempo_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      showToast("Laporan Jatuh Tempo berhasil diexport!", "success");
    } catch (error) {
      logger.error("Error exporting jatuh tempo:", error);
      showToast("Gagal export laporan jatuh tempo", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Layout Compact Horizontal */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg shrink-0">
          {/* SVG Clock Icon in Orange */}
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 mb-0.5 truncate">
            Jatuh Tempo
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            Export laporan jatuh tempo
          </p>
        </div>
      </div>

      <button
        onClick={exportJatuhTempo}
        disabled={loading}
        className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Checking...</span>
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

export default ExportJatuhTempoCard;
