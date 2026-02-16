import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import apiClient from "../../api/apiClient";
import XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import logger from "../../utils/logger";

// Helper Style
const styles = {
  header: {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
    fill: { fgColor: { rgb: "3B82F6" } },
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

const ExportKamarCard = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState({
    start_date: new Date().toISOString().slice(0, 7) + "-01",
    end_date: new Date().toISOString().slice(0, 10),
  });
  const handleExport = async () => {
    setLoading(true);
    try {
      // Fetch room occupancy data
      const response = await apiClient.get("/reports/room-occupancy", {
        params: {
          start_date: period.start_date,
          end_date: period.end_date,
        },
      });
      const data = response.data.data;

      // Prepare Excel data
      const excelData = data.map((item, index) => ({
        No: index + 1,
        Kamar: item.nama_kamar,
        Blok: item.blok,
        Lantai: item.lantai,
        "Total Hari": item.total_days,
        "Hari Terisi": item.days_occupied,
        "Actual (%)": item.actual_percentage,
        "Plan (%)": item.plan_percentage,
      }));
      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 5 }, // No
        { wch: 15 }, // Kamar
        { wch: 8 }, // Blok
        { wch: 8 }, // Lantai
        { wch: 12 }, // Total Hari
        { wch: 12 }, // Hari Terisi
        { wch: 12 }, // Actual
        { wch: 12 }, // Plan
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

      XLSX.utils.book_append_sheet(wb, ws, "Room Occupancy");

      // Generate and download
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `Room_Occupancy_${period.start_date}_to_${period.end_date}.xlsx`,
      );
      showToast("Export Room Occupancy berhasil!", "success");
    } catch (error) {
      logger.error("Export error:", error);
      showToast("Gagal export data kamar", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 mb-0.5 truncate">
            Room Occupancy
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            Laporan okupansi kamar
          </p>
        </div>
      </div>
      {/* Period Filter */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Dari
          </label>
          <input
            type="date"
            value={period.start_date}
            onChange={(e) =>
              setPeriod({ ...period, start_date: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sampai
          </label>
          <input
            type="date"
            value={period.end_date}
            onChange={(e) => setPeriod({ ...period, end_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center gap-2"
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
export default ExportKamarCard;
