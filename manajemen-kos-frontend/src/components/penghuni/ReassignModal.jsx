import React, { useState } from "react";
import { formatCurrency } from "../../utils/currency"; // Import formatCurrency

const ReassignModal = ({
  data,
  setData,
  availableKamars,
  onSubmit,
  onClose,
}) => {
  // Handler untuk input biasa (Tanggal Masuk, Durasi, dan Unit)
  const handleChange = (e) => {
    const { name, value } = e.target;

    let finalValue = value;
    // Konversi durasi angka ke integer
    if (name === "initialDuration") {
      finalValue = parseInt(value) || 1;
    }

    setData({ ...data, [name]: finalValue });
  };

  // Handler untuk Kamar ID
  const handleKamarChange = (e) => {
    setData({ ...data, newKamarId: parseInt(e.target.value) });
  };

  const isKamarAvailable = availableKamars.length > 0;

  // Definisikan nilai state awal dari props data (disusun agar sesuai dengan nama input)
  const currentDuration = data.initialDuration || 1;
  const currentUnit = data.duration_unit || "month";

  // 🚨 FUNGSI SUBMIT BARU
  const handleSubmit = (e) => {
    e.preventDefault();

    // Objek data yang dikirim ke Parent Component (Parent akan mengambil initial_duration dan duration_unit)
    const dataToSend = {
      ...data,
      initial_duration: currentDuration, // 🚨 Pastikan key ini dikirim ke backend
      duration_unit: currentUnit,
    };

    // Memanggil onSubmit di Parent Component dengan event dan data lengkap
    // Parent function (processReassign) sekarang harus menerima dataToSend
    onSubmit(e, dataToSend);
  };

  const currentKamarId = data.newKamarId || "";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4 text-purple-700">
          Sewa Lagi (Reaktivasi)
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Pilih kamar baru dan durasi pembayaran awal untuk mengaktifkan
            kembali penghuni ini.
          </p>

          {!isKamarAvailable && (
            <div className="p-2 bg-red-100 text-red-700 rounded-md">
              Semua kamar sedang terisi.
            </div>
          )}

          {/* Input Kamar Baru */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Kamar Baru <span className="text-red-500">*</span>
            </label>
            <select
              name="newKamarId"
              value={currentKamarId}
              onChange={handleKamarChange}
              required
              disabled={!isKamarAvailable}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">-- Pilih Kamar Tersedia --</option>
              {availableKamars.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kamar} ({formatCurrency(k.harga_bulanan)})
                </option>
              ))}
            </select>
          </div>

          {/* Input Tanggal Masuk Baru */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Masuk Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="newTanggalMasuk"
              value={data.newTanggalMasuk}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Input Durasi Pembayaran Awal Fleksibel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durasi Bayar Awal <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {/* Input Angka Durasi */}
              <input
                type="number"
                name="initialDuration"
                value={currentDuration}
                onChange={handleChange}
                min="1"
                required
                className="w-1/2 px-3 py-2 border rounded-md"
                placeholder="Jumlah"
              />
              {/* Dropdown Unit Durasi */}
              <select
                name="duration_unit"
                value={currentUnit}
                onChange={handleChange}
                required
                className="w-1/2 px-3 py-2 border rounded-md"
              >
                <option value="day">Hari</option>
                <option value="week">Minggu</option>
                <option value="month">Bulan</option>
                <option value="year">Tahun</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isKamarAvailable}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Aktifkan Sewa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReassignModal;
