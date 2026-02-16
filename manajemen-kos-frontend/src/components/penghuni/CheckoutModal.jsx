import React from "react";

const CheckoutModal = ({ onSubmit, onClose, date, setDate }) => {
  return (
    <div className="fixed inset-0  flex items-center justify-center z-100 bg-clip-padding backdrop-filter backdrop-blur-sm">
      {/* ... (Isi Modal Checkout) ... */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 className="text-xl font-bold mb-4">Konfirmasi Checkout</h3>

        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-800 mb-4">
          <p className="font-semibold mb-1">ℹ️ Informasi Penting:</p>
          <ul className="list-disc ml-4 space-y-1 text-xs">
            <li><strong>Checkout</strong> berarti menonaktifkan penghuni ini dari sistem kamar.</li>
            <li>Penghuni <strong>Aktif</strong> = Sedang menempati kamar.</li>
            <li>Penghuni <strong>Tidak Aktif</strong> = Sudah selesai/tidak menempati kamar.</li>
          </ul>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-gray-600 text-sm">
            Masukkan tanggal resmi penghuni keluar.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Keluar <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
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
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Konfirmasi Checkout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
