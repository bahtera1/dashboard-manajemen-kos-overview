import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import apiClient from "../../api/apiClient";
import XLSX from "xlsx-js-style"; // CHANGED: Library
import { saveAs } from "file-saver";
import { formatDate } from "../../utils/dateUtils";
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
  },
  // Context Colors
  hSummary: { fill: { fgColor: { rgb: "4F46E5" } } }, // Indigo
  hIncome: { fill: { fgColor: { rgb: "10B981" } } }, // Green
  hExpense: { fill: { fgColor: { rgb: "EF4444" } } }, // Red
  hMonthly: { fill: { fgColor: { rgb: "3B82F6" } } }, // Blue
  hDue: { fill: { fgColor: { rgb: "F97316" } } }, // Orange
  hRoom: { fill: { fgColor: { rgb: "0EA5E9" } } }, // Sky
  hTenant: { fill: { fgColor: { rgb: "A855F7" } } }, // Purple

  cell: {
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  },
  currency: {
    numFmt: "#,##0",
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  },
  title: { font: { bold: true, sz: 14, color: { rgb: "333333" } } },
};

const ExportLaporanLengkapCard = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState({
    start_date: new Date().toISOString().slice(0, 7) + "-01",
    end_date: new Date().toISOString().slice(0, 10),
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      // Fetch data untuk Laporan Keuangan (Logic from LabaRugiExportCard)
      // Menggunakan endpoint /reports/transaction-summary agar formatnya persis sama dengan LabaRugiExportCard
      const financialRes = await apiClient.get(
        `/reports/transaction-summary?start_date=${period.start_date}&end_date=${period.end_date}`,
      );
      const financialReport = financialRes.data; // { summary, income, expense }

      // Fetch data untuk Laporan Okupansi (Logic from ExportKamarCard)
      const occupancyRes = await apiClient.get("/reports/room-occupancy", {
        params: {
          start_date: period.start_date,
          end_date: period.end_date,
        },
      });

      // Fetch data untuk Laporan Penghuni (Logic from ExportPenghuniCard)
      const tenantRes = await apiClient.get("/reports/tenant-details");

      // Fetch data untuk Jatuh Tempo (Logic from ExportJatuhTempoCard)
      const dueSoonRes = await apiClient.get("/reports/due-soon");
      const dueSoonData = dueSoonRes.data.data;

      const wb = XLSX.utils.book_new();

      // ==========================================
      // SHEET 1: RINGKASAN & LABA RUGI
      // ==========================================
      const summarySheetData = [
        ["LAPORAN MANAJEMEN KOSAN - ALL IN ONE"],
        [
          `Periode Export: ${formatDate(period.start_date)} s/d ${formatDate(period.end_date)}`,
        ],
        [""],
        ["RINGKASAN KEUANGAN"],
        [
          "Total Pemasukan",
          {
            v: financialReport.summary.total_income,
            t: "n",
            s: styles.currency,
          },
        ],
        [
          "Total Pengeluaran",
          {
            v: financialReport.summary.total_expense,
            t: "n",
            s: styles.currency,
          },
        ],
        [
          "Laba (Rugi) Bersih",
          {
            v: financialReport.summary.net_profit,
            t: "n",
            s: { ...styles.currency, font: { bold: true } },
          },
        ],
        [""],
        ["STATISTIK OPERASIONAL"],
        [
          "Total Kamar",
          { v: occupancyRes.data.summary.total_rooms, s: styles.cell },
        ],
        [
          "Rata-rata Okupansi",
          {
            v: `${occupancyRes.data.summary.average_occupancy}%`,
            s: styles.cell,
          },
        ],
        [
          "Total Penghuni",
          { v: tenantRes.data.summary.total_tenants, s: styles.cell },
        ],
        [
          "Penghuni Aktif",
          { v: tenantRes.data.summary.active_tenants, s: styles.cell },
        ],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);

      // Styling Sheet 1
      wsSummary["!cols"] = [{ wch: 30 }, { wch: 25 }];

      // Apply Manual Styles
      if (wsSummary["A1"]) wsSummary["A1"].s = styles.title;
      // Subheaders
      ["A4", "A9"].forEach((r) => {
        if (wsSummary[r])
          wsSummary[r].s = {
            ...styles.header,
            ...styles.hSummary,
            alignment: { horizontal: "left", vertical: "center" },
          };
      });
      // Label Data Borders
      ["A5", "A6", "A7", "A10", "A11", "A12", "A13"].forEach((r) => {
        if (wsSummary[r]) wsSummary[r].s = styles.cell;
      });

      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Utama");

      // ==========================================
      // SHEET 2: DETAIL PEMASUKAN
      // ==========================================
      const incomeData = financialReport.income.map((t, i) => ({
        No: i + 1,
        Tanggal: formatDate(t.tanggal_transaksi),
        Kategori: t.kategori,
        Deskripsi: t.deskripsi,
        "Jumlah (Rp)": t.jumlah,
        Penghuni: t.penghuni?.nama_lengkap || t.penghuni_name || "-",
        Kamar: t.kamar?.nama_kamar || t.kamar_name || "-",
      }));
      const wsIncome = XLSX.utils.json_to_sheet(incomeData);
      wsIncome["!cols"] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 20 },
        { wch: 12 },
      ];

      // Style Income
      const incRange = XLSX.utils.decode_range(wsIncome["!ref"]);
      // Header
      for (let C = incRange.s.c; C <= incRange.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (wsIncome[addr])
          wsIncome[addr].s = { ...styles.header, ...styles.hIncome };
      }
      // Data
      for (let R = 1; R <= incRange.e.r; ++R) {
        for (let C = 0; C <= incRange.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!wsIncome[addr]) continue;
          wsIncome[addr].s = C === 4 ? styles.currency : styles.cell;
        }
      }
      XLSX.utils.book_append_sheet(wb, wsIncome, "Pemasukan");

      // ==========================================
      // SHEET 3: DETAIL PENGELUARAN
      // ==========================================
      const expenseData = financialReport.expense.map((t, i) => ({
        No: i + 1,
        Tanggal: formatDate(t.tanggal_transaksi),
        Kategori: t.kategori,
        Deskripsi: t.deskripsi,
        "Jumlah (Rp)": t.jumlah,
        Admin: t.admin_name || "-",
      }));
      const wsExpense = XLSX.utils.json_to_sheet(expenseData);
      wsExpense["!cols"] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 15 },
        { wch: 35 },
        { wch: 15 },
        { wch: 20 },
      ];

      // Style Expense
      const expRange = XLSX.utils.decode_range(wsExpense["!ref"]);
      // Header
      for (let C = expRange.s.c; C <= expRange.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (wsExpense[addr])
          wsExpense[addr].s = { ...styles.header, ...styles.hExpense };
      }
      // Data
      for (let R = 1; R <= expRange.e.r; ++R) {
        for (let C = 0; C <= expRange.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!wsExpense[addr]) continue;
          wsExpense[addr].s = C === 4 ? styles.currency : styles.cell;
        }
      }
      XLSX.utils.book_append_sheet(wb, wsExpense, "Pengeluaran");

      // ==========================================
      // SHEET 4: RINGKASAN BULANAN
      // ==========================================
      const monthlyData = {};
      const getMonthKey = (d) => (d ? d.substring(0, 7) : "Unknown");
      const getMonthName = (d) =>
        d
          ? new Date(d).toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })
          : "-";

      [...financialReport.income, ...financialReport.expense].forEach((t) => {
        const mKey = getMonthKey(t.tanggal_transaksi);
        if (!monthlyData[mKey])
          monthlyData[mKey] = {
            bulan: getMonthName(t.tanggal_transaksi),
            pemasukan: 0,
            pengeluaran: 0,
          };
        if (t.tipe_transaksi === "Pemasukan")
          monthlyData[mKey].pemasukan += Number(t.jumlah);
        else monthlyData[mKey].pengeluaran += Number(t.jumlah);
      });

      const sortedMonths = Object.keys(monthlyData).sort();
      const monthlySheetData = [
        ["RINGKASAN PEMASUKAN DAN PENGELUARAN PER BULAN"],
        ["No", "Bulan", "Pemasukan (Rp)", "Pengeluaran (Rp)"],
      ];

      sortedMonths.forEach((key, idx) => {
        const d = monthlyData[key];
        monthlySheetData.push([
          { v: idx + 1, s: styles.cell },
          { v: d.bulan, s: styles.cell },
          { v: d.pemasukan, t: "n", s: styles.currency },
          { v: d.pengeluaran, t: "n", s: styles.currency },
        ]);
      });

      const wsMonthly = XLSX.utils.aoa_to_sheet(monthlySheetData);
      wsMonthly["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 18 }, { wch: 18 }];
      wsMonthly["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

      if (wsMonthly["A1"]) wsMonthly["A1"].s = styles.title;
      ["A2", "B2", "C2", "D2"].forEach((r) => {
        if (wsMonthly[r])
          wsMonthly[r].s = { ...styles.header, ...styles.hMonthly };
      });

      XLSX.utils.book_append_sheet(wb, wsMonthly, "Keuangan Bulanan");

      // ==========================================
      // SHEET 5: JATUH TEMPO (Persis ExportJatuhTempoCard)
      // ==========================================
      const dueSheetData = dueSoonData.map((penghuni, index) => {
        // ... logic logic ... (Copy paste logic from view to ensure consistency, actually I should reuse existing logic but View didn't show full file for me to copy paste inside map. Wait. I can see lines 155-189 in previous View File. I will copy strict.)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(penghuni.masa_berakhir_sewa);
        endDate.setHours(0, 0, 0, 0);

        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let statusJatuhTempo = "";
        let prioritas = "";

        if (diffDays < 0) {
          statusJatuhTempo = `Lewat ${Math.abs(diffDays)} Hari`;
          prioritas = "URGENT - Lewat Tempo";
        } else if (diffDays === 0) {
          statusJatuhTempo = "Jatuh Tempo Hari Ini";
          prioritas = "URGENT";
        } else {
          statusJatuhTempo = `${diffDays} Hari Lagi`;
          prioritas =
            diffDays <= 3
              ? "URGENT"
              : diffDays <= 7
                ? "Perlu Perhatian"
                : "Normal";
        }

        return {
          No: index + 1,
          "Nama Bola": penghuni.nama_lengkap,
          "No HP": penghuni.no_hp,
          Kamar: penghuni.kamar?.nama_kamar || "-",
          "Tanggal Masuk": formatDate(penghuni.tanggal_masuk),
          "Masa Berakhir Sewa": formatDate(penghuni.masa_berakhir_sewa),
          "Status Jatuh Tempo": statusJatuhTempo,
          "Sisa Hari": diffDays,
          Prioritas: prioritas,
        };
      });

      const wsDue = XLSX.utils.json_to_sheet(dueSheetData);
      wsDue["!cols"] = [
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

      // Style Due
      const dueRange = XLSX.utils.decode_range(wsDue["!ref"]);
      for (let C = dueRange.s.c; C <= dueRange.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (wsDue[addr]) wsDue[addr].s = { ...styles.header, ...styles.hDue };
      }
      for (let R = 1; R <= dueRange.e.r; ++R) {
        for (let C = 0; C <= dueRange.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!wsDue[addr]) continue;
          wsDue[addr].s = styles.cell;
        }
      }

      XLSX.utils.book_append_sheet(wb, wsDue, "Jatuh Tempo");

      // ==========================================
      // SHEET 6: OKUPANSI KAMAR
      // ==========================================
      const roomSheetData = occupancyRes.data.data.map((item, i) => ({
        No: i + 1,
        "Nama Kamar": item.nama_kamar,
        Lokasi: `Blok ${item.blok} Lt ${item.lantai}`,
        "Total Hari": item.total_days,
        "Hari Terisi": item.days_occupied,
        "Okupansi (%)": item.actual_percentage,
        Status: item.actual_percentage > 0 ? "Terisi" : "Kosong",
      }));
      const wsRoom = XLSX.utils.json_to_sheet(roomSheetData);
      wsRoom["!cols"] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 10 },
      ];

      // Style Room
      const roomRange = XLSX.utils.decode_range(wsRoom["!ref"]);
      for (let C = roomRange.s.c; C <= roomRange.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (wsRoom[addr])
          wsRoom[addr].s = { ...styles.header, ...styles.hRoom };
      }
      for (let R = 1; R <= roomRange.e.r; ++R) {
        for (let C = 0; C <= roomRange.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!wsRoom[addr]) continue;
          wsRoom[addr].s = styles.cell;
        }
      }
      XLSX.utils.book_append_sheet(wb, wsRoom, "Status Kamar");

      // ==========================================
      // SHEET 7: DATA PENGHUNI
      // ==========================================
      const tenantSheetData = tenantRes.data.data.map((item, i) => ({
        No: i + 1,
        "Nama Lengkap": item.nama_lengkap,
        "No. HP": item.no_hp || "-",
        Kamar: item.kamar_nama,
        Status: item.status_sewa,
        "Tanggal Masuk": item.tanggal_masuk
          ? formatDate(item.tanggal_masuk)
          : "-",
        "Masa Berakhir": item.masa_berakhir_sewa
          ? formatDate(item.masa_berakhir_sewa)
          : "-",
      }));
      const wsTenant = XLSX.utils.json_to_sheet(tenantSheetData);
      wsTenant["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
      ];

      // Style Tenant
      const tenRange = XLSX.utils.decode_range(wsTenant["!ref"]);
      for (let C = tenRange.s.c; C <= tenRange.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (wsTenant[addr])
          wsTenant[addr].s = { ...styles.header, ...styles.hTenant };
      }
      for (let R = 1; R <= tenRange.e.r; ++R) {
        for (let C = 0; C <= tenRange.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!wsTenant[addr]) continue;
          wsTenant[addr].s = styles.cell;
        }
      }
      XLSX.utils.book_append_sheet(wb, wsTenant, "Data Penghuni");

      // Generate File
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `Laporan_Lengkap_Kos_${formatDate(new Date())}.xlsx`);

      showToast("Export Laporan Lengkap berhasil didownload!", "success");
    } catch (error) {
      logger.error("Export error:", error);
      showToast("Gagal mengunduh laporan lengkap.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
          <svg
            className="w-5 h-5 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 mb-0.5 truncate">
            Laporan Lengkap
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            Semua laporan (5 sheets)
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center gap-2"
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

export default ExportLaporanLengkapCard;
