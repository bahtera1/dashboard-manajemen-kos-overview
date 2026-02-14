import React, { memo } from "react";
import CustomSelect from "../common/forms/CustomSelect";
import { formatCurrency } from "../../utils/currency";

/**
 * Komponen PenghuniForm
 * * Komponen ini digunakan untuk membuat atau mengedit data penghuni kos.
 * Mendukung mode edit dan tambah baru, dengan validasi form dan pilihan kamar.
 * * Props:
 * - formData: Object data form penghuni (nama_lengkap, no_ktp, dll.)
 * - handleChange: Fungsi untuk menangani perubahan input
 * - submit: Fungsi untuk submit form
 */
const PenghuniForm = memo(({
  formData,
  handleChange,
  handleSubmit,
  isEdit = false,
  loading = false,
  availableKamars = [],
  allKamars = [],
}) => {
  const kamarList = isEdit ? allKamars : availableKamars;
  const currentKamarId = formData.kamar_id;

  const initialDuration = formData.initial_duration || 1;
  const initialDurationUnit = formData.duration_unit || "month";

  const getKamarStatus = (kamar) => {
    const isKamarAvailable =
      kamar.penghuni === null || kamar.penghuni === undefined;

    if (isEdit && kamar.id === currentKamarId) {
      return "(Kamar Saat Ini)";
    }
    return isKamarAvailable ? "(Tersedia)" : "(Terisi)";
  };

  const kamarOptions = [
    { label: "-- Pilih Kamar --", value: "", disabled: true },
    ...kamarList.map((k) => {
      const isCurrentKamar = isEdit && k.id === currentKamarId;
      const isKamarAvailable = k.penghuni === null || k.penghuni === undefined;
      const isDisabled = !isCurrentKamar && !isKamarAvailable;

      return {
        label: `${k.nama_kamar} ${getKamarStatus(k)} - ${formatCurrency(k.harga_bulanan)}`,
        value: k.id,
        disabled: isDisabled,
      };
    }),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-3 md:p-4 space-y-4"
    >
      {/* INFORMASI PRIBADI */}
      <div className="border-b pb-2">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg
            className="w-4 h-4 md:w-5 md:h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Informasi Pribadi
        </h2>
      </div>

      {/* Input Nama Lengkap */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="nama_lengkap"
          value={formData.nama_lengkap || ""}
          onChange={handleChange}
          required
          maxLength="255"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Contoh: Budi Santoso"
        />
      </div>

      {/* Input KTP dan HP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            No. KTP <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="no_ktp"
            minLength="16"
            pattern="\d{16}"
            title="Nomor KTP harus 16 digit angka"
            value={formData.no_ktp || ""}
            onChange={handleChange}
            required
            maxLength="16"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="16 digit angka"
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            No. HP <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="no_hp"
            value={formData.no_hp || ""}
            onChange={handleChange}
            required
            maxLength="16"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="08xxxxxxxxxxxxx"
          />
        </div>
      </div>

      {/* Input Email dan Pekerjaan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            maxLength="100"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Pekerjaan
          </label>
          <input
            type="text"
            name="pekerjaan"
            value={formData.pekerjaan || ""}
            onChange={handleChange}
            maxLength="50"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Karyawan Swasta"
          />
        </div>
      </div>

      {/* Input Kontak Darurat */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
          Kontak Darurat (PIC) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="pic_emergency"
          value={formData.pic_emergency || ""}
          onChange={handleChange}
          required
          maxLength="100"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nama & No. HP Keluarga"
        />
      </div>

      {/* Input Catatan Admin */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
          Catatan Admin{" "}
          <span className="text-gray-400 text-xs">(Opsional)</span>
        </label>
        <textarea
          name="catatan"
          value={formData.catatan || ""}
          onChange={handleChange}
          rows="2"
          maxLength={150}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Catatan tambahan tentang penghuni..."
        ></textarea>
      </div>

      {/* STATUS KAMAR & SEWA */}
      <div className="border-b pb-2 pt-2">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg
            className="w-4 h-4 md:w-5 md:h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Status Kamar & Sewa
        </h2>
      </div>

      {/* Input Kamar dan Tanggal Masuk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Kamar yang Ditempati <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="kamar_id"
            value={currentKamarId || ""}
            onChange={handleChange}
            options={kamarOptions}
            searchable={false}
            placeholder="-- Pilih Kamar --"
          />
          {kamarList.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ Tidak ada kamar tersedia. Tambahkan kamar terlebih dahulu.
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Tanggal Masuk <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal_masuk"
            value={formData.tanggal_masuk || ""}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* BLOK PEMBAYARAN AWAL DENGAN DURASI FLEKSIBEL (hanya untuk mode tambah) */}
      {!isEdit && (
        <div className="border-2 border-green-200 bg-linear-to-br from-green-50 to-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-green-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-sm md:text-base font-semibold text-green-800">
              Penyewaan Awal
            </h3>
          </div>

          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Durasi <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-3">
            {/* Input Angka Durasi */}
            <div className="w-1/3">
              <input
                type="number"
                name="initial_duration"
                value={initialDuration}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="1"
              />
            </div>

            {/* Dropdown Unit Durasi */}
            <div className="flex-1">
              <CustomSelect
                name="duration_unit"
                value={initialDurationUnit}
                onChange={handleChange}
                options={[
                  { label: "Hari", value: "day" },
                  { label: "Minggu", value: "week" },
                  { label: "Bulan", value: "month" },
                  { label: "Tahun", value: "year" },
                ]}
                placeholder="Satuan"
                searchable={false}
              />
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-1.5 flex items-start gap-1">
            <svg
              className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Sistem akan otomatis menghitung masa berakhir sewa berdasarkan
              durasi ini.
            </span>
          </p>
        </div>
      )}

      {/* Tombol Submit */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t">
        <button
          type="button"
          onClick={() => {
            window.history.back();
          }}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading || kamarList.length === 0}
          className={`w-full sm:w-auto px-4 py-2 text-sm text-white rounded-md font-medium transition-colors ${loading || kamarList.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
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
              Menyimpan...
            </span>
          ) : isEdit ? (
            "✅ Update Penghuni"
          ) : (
            "➕ Tambah Penghuni"
          )}
        </button>
      </div>
    </form>
  );
});

export default PenghuniForm;
