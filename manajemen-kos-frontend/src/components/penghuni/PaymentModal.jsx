import React, { useState } from "react";

// PaymentModal sekarang menerima onSubmit, onClose, duration (angka), dan setDuration (setter angka)
const PaymentModal = ({ onSubmit, onClose, duration, setDuration }) => {
  const [durationUnit, setDurationUnit] = useState("month");

  // Pastikan input number diubah ke integer
  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value);
    setDuration(value >= 1 ? value : 1);
  };

  const handleUnitChange = (e) => {
    setDurationUnit(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, duration, durationUnit);
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center z-100 bg-clip-padding backdrop-filter backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 className="text-xl font-bold mb-4 text-green-700">
          Catat Pembayaran Sewa
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-green-50 p-3 rounded-md border border-green-200 text-sm text-green-800 mb-4">
            <p className="font-semibold mb-1">ℹ️ Perpanjang Masa Sewa:</p>
            <p className="text-xs">
              Mencatat pembayaran ini akan otomatis{" "}
              <strong>memperpanjang durasi sewa</strong> penghuni sesuai jumlah
              waktu yang dipilih.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durasi Pembayaran <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-3">
              {/* Input Angka Durasi */}
              <input
                type="number"
                value={duration}
                onChange={handleDurationChange}
                min="1"
                required
                className="w-1/2 px-3 py-2 border rounded-md"
                placeholder="Jumlah"
              />
              {/* Dropdown Unit Durasi */}
              <select
                value={durationUnit}
                onChange={handleUnitChange}
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Perpanjang ++
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
