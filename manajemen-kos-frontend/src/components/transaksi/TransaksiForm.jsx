import React, { useState, memo, useMemo } from "react";
import {
  CHART_OF_ACCOUNTS,
  CASH_FLOW_INDEX,
  TRANSACTION_CATEGORIES,
} from "../../utils/accountingConstants";
import CustomSelect from "../common/forms/CustomSelect";

const TooltipAccount = memo(
  ({ showTooltip, setShowTooltip, selectedAccountDetails }) => (
    <div className="relative group inline-block ml-2 align-middle">
      <button
        type="button"
        className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Info Kode Akun"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <div
        className={`absolute z-50 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl left-6 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${showTooltip ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
      >
        {selectedAccountDetails ? (
          <>
            <p className="font-bold text-yellow-300 mb-1">
              {selectedAccountDetails.code} - {selectedAccountDetails.name}
            </p>
            <p>{selectedAccountDetails.description}</p>
          </>
        ) : (
          <>
            <p className="font-bold mb-1 text-blue-300">Panduan Akun:</p>
            <p>
              Pilih kode akun yang sesuai agar laporan keuangan (Neraca & Laba
              Rugi) tercatat standar.
            </p>
          </>
        )}
        <div className="absolute top-1/2 -left-1 w-2 h-2 bg-gray-800 transform -translate-y-1/2 rotate-45"></div>
      </div>
    </div>
  ),
);

const TransaksiForm = memo(function TransaksiForm({
  formData,
  handleChange,
  handleSubmit,
  isEdit = false,
  loading = false,
  allPenghunis = [],
  historicalPenghuni = null, // Prop ini ternyata tidak dipakai secara langsung di logic bawah karena sudah digabung di parent, tapi biarkan saja untuk konsistensi
}) {
  const isPemasukan = formData.tipe_transaksi === "Pemasukan";
  const [showTooltip, setShowTooltip] = useState(false);

  // Cari detail akun yang sedang dipilih untuk ditampilkan deskripsinya
  const selectedAccountDetails = useMemo(
    () => CHART_OF_ACCOUNTS.find((a) => a.code === formData.account_code),
    [formData.account_code],
  );

  // Memoisasi Opsi Akun
  const accountOptions = useMemo(() => {
    const defaultOption = { label: "-- Pilih Akun (Opsional) --", value: "" };

    const groups = [
      { label: "PENDAPATAN (4-xxx)", prefix: "4-" },
      { label: "BEBAN/PENGELUARAN (5-xxx)", prefix: "5-" },
      { label: "ASET (1-xxx)", prefix: "1-" },
      { label: "KEWAJIBAN (2-xxx)", prefix: "2-" },
      { label: "MODAL (3-xxx)", prefix: "3-" },
    ];

    const groupedOptions = groups.map((group) => ({
      label: group.label,
      options: CHART_OF_ACCOUNTS.filter((a) =>
        a.code.startsWith(group.prefix),
      ).map((a) => ({
        value: a.code,
        label: `${a.code} - ${a.name}`,
      })),
    }));

    return [defaultOption, ...groupedOptions];
  }, []);

  // Memoisasi Opsi Penghuni
  const penghuniOptions = useMemo(() => {
    if (!isPemasukan) return [];

    return [
      { label: "-- Pilih Penghuni --", value: "" },
      {
        label: "--- PENGHUNI AKTIF ---",
        options: allPenghunis
          .filter((p) => p.status_sewa === "Aktif")
          .map((p) => ({
            label: `🟢 ${p.nama_lengkap} (Kamar: ${p.kamar?.nama_kamar || "N/A"})`,
            value: p.id,
          })),
      },
      {
        label: "--- PENGHUNI TIDAK AKTIF / HISTORY ---",
        options: allPenghunis
          .filter((p) => p.status_sewa !== "Aktif")
          .map((p) => ({
            label: `🔴 ${p.nama_lengkap} (Non-Aktif/Checkout)`,
            value: p.id,
          })),
      },
    ];
  }, [allPenghunis, isPemasukan]);

  // Memoisasi opsi kategori
  const currentCategories = useMemo(
    () =>
      isPemasukan
        ? TRANSACTION_CATEGORIES.INCOME
        : TRANSACTION_CATEGORIES.EXPENSE,
    [isPemasukan],
  );
  const categoryOptions = useMemo(
    () => currentCategories.map((cat) => ({ label: cat, value: cat })),
    [currentCategories],
  );
  const cashFlowOptions = useMemo(
    () => CASH_FLOW_INDEX.map((idx) => ({ label: idx.label, value: idx.id })),
    [],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 space-y-5"
    >
      <h2 className="text-xl font-bold border-b pb-2 text-gray-700">
        {isEdit ? "Edit" : "Tambah"} Transaksi Keuangan
      </h2>

      {/* Baris 1: Tipe Transaksi & Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipe Transaksi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Transaksi <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="tipe_transaksi"
            value={formData.tipe_transaksi || "Pemasukan"}
            onChange={handleChange}
            options={[
              { label: "Pemasukan (+)", value: "Pemasukan" },
              { label: "Pengeluaran (-)", value: "Pengeluaran" },
            ]}
            placeholder="Pilih Tipe"
            searchable={false}
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="kategori"
            value={formData.kategori || currentCategories[0]}
            onChange={handleChange}
            options={categoryOptions}
            placeholder="Pilih Kategori"
            searchable={false}
          />
        </div>
      </div>

      {/* Baris 2: Kode Akun & Index Arus Kas (Advanced) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kode Akun */}
        <div>
          <div className="flex items-center mb-1">
            <label className="text-sm font-medium text-gray-700">
              Kode Akun (Opsional)
            </label>
            <TooltipAccount
              showTooltip={showTooltip}
              setShowTooltip={setShowTooltip}
              selectedAccountDetails={selectedAccountDetails}
            />
          </div>

          <CustomSelect
            name="account_code"
            value={formData.account_code || ""}
            onChange={handleChange}
            options={accountOptions}
            searchable={false}
            placeholder="-- Pilih Akun (Opsional) --"
          />
          <p className="text-xs text-gray-500 mt-1 truncate">
            {selectedAccountDetails
              ? selectedAccountDetails.name
              : "Otomatis isi kategori jika kosong"}
          </p>
        </div>

        {/* Index Arus Kas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Index Arus Kas (Opsional)
          </label>
          <CustomSelect
            name="cash_flow_index"
            value={formData.cash_flow_index || 0}
            onChange={handleChange}
            options={cashFlowOptions}
            placeholder="-- Pilih Index (Opsional) --"
            searchable={false}
          />
          <p className="text-xs text-gray-500 mt-1">
            Klasifikasi untuk laporan Cash Flow.
          </p>
        </div>
      </div>

      {/* Baris 3: Jumlah & Tanggal Transaksi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jumlah (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="jumlah"
            value={formData.jumlah || ""}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-sm focus:outline-none focus:ring-2"
            placeholder="Contoh: 500000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Transaksi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal_transaksi"
            value={
              formData.tanggal_transaksi ||
              new Date().toISOString().split("T")[0]
            }
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-sm focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      {/* 🎯 KONDISIONAL: Penghuni ID (Hanya untuk Pemasukan) */}
      {isPemasukan && (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Penghuni Terkait
          </label>
          <CustomSelect
            name="penghuni_id"
            value={formData.penghuni_id || ""}
            onChange={handleChange}
            options={penghuniOptions}
            placeholder="-- Pilih Penghuni --"
            searchable={false}
          />
          <p className="text-xs text-gray-500 mt-1">
            Pilih penghuni yang terkait dengan transaksi ini. Penghuni aktif
            ditandai 🟢, non-aktif/checkout ditandai 🔴.
          </p>
        </div>
      )}

      {/* Baris 5: Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi <span className="text-red-500">*</span>
        </label>
        <textarea
          name="deskripsi"
          value={formData.deskripsi || ""}
          onChange={handleChange}
          required
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-sm focus:outline-none focus:ring-2"
          placeholder="Contoh: Pembayaran sewa Kamar 1A bulan November 2025/ Listrik Kamar A bulan Oktober 2025"
        ></textarea>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 text-white rounded-md font-medium ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading
            ? "Menyimpan..."
            : isEdit
              ? "Update Transaksi"
              : "Catat Transaksi"}
        </button>
      </div>
    </form>
  );
});

export default TransaksiForm;
