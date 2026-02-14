import React, { memo } from "react";
import CustomSelect from "../common/forms/CustomSelect";

const TransaksiFilter = memo(function TransaksiFilter({
  searchInput,
  onSearchChange,
  isSearching,
  filterTipe,
  onTipeChange,
  quickFilter,
  onQuickFilterChange,
  filterDate,
  onDateChange,
  onAddClick,
}) {
  return (
    <div className="flex flex-col gap-4 mb-6 mt-8 p-4 bg-white shadow-md rounded-lg border">
      {/* BLOK FILTER - Compact Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {/* Search Input - Full Width on Mobile (col-span-2) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🔍 Cari Transaksi
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={onSearchChange}
              placeholder="Nama, kamar, kategori..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-none"
            />
            {/* Loading Spinner Kecil di Search Input */}
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tipe Transaksi - Half Width on Mobile */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe
          </label>
          <CustomSelect
            name="tipe"
            value={filterTipe}
            onChange={onTipeChange}
            options={[
              { label: "Semua", value: "all" },
              { label: "Masuk (+)", value: "Pemasukan" },
              { label: "Keluar (-)", value: "Pengeluaran" },
            ]}
            placeholder="Semua"
            searchable={false}
          />
        </div>

        {/* Filter Preset - Half Width on Mobile */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waktu
          </label>
          <CustomSelect
            name="quickFilter"
            value={quickFilter}
            onChange={onQuickFilterChange}
            options={[
              { label: "Semua", value: "all" },
              { label: "Bulan Ini", value: "month" },
              { label: "Tahun Ini", value: "year" },
              { label: "Rentang Waktu", value: "custom" },
            ]}
            placeholder="Waktu"
            searchable={false}
          />
        </div>

        {/* Filter Tanggal Manual - Side by side on Mobile */}
        <div
          className="col-span-1"
          title={
            quickFilter !== "custom"
              ? "Ubah Filter Cepat ke 'Manual' untuk mengedit."
              : ""
          }
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dari
          </label>
          <input
            type="date"
            name="start_date"
            value={filterDate.start_date || ""}
            onChange={onDateChange}
            disabled={quickFilter !== "custom"}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${quickFilter !== "custom" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
          />
        </div>
        <div
          className="col-span-1"
          title={
            quickFilter !== "custom"
              ? "Ubah Filter Cepat ke 'Manual' untuk mengedit."
              : ""
          }
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sampai
          </label>
          <input
            type="date"
            name="end_date"
            value={filterDate.end_date || ""}
            onChange={onDateChange}
            disabled={quickFilter !== "custom"}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${quickFilter !== "custom" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
          />
        </div>
      </div>

      {/* Tombol Tambah Transaksi */}
      <div className="w-full">
        <button
          onClick={onAddClick}
          className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold shadow"
        >
          + Tambah Transaksi
        </button>
      </div>
    </div>
  );
});

export default TransaksiFilter;
