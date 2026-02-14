import React, { useState } from "react";
import { numberToText } from "../../utils/currency";
import KuitansiPrintView from "./KuitansiPrintView";
import { ALL_FACILITIES, ALL_PARKING } from "../../utils/facilityConstants";
import { PAYMENT_METHODS } from "../../utils/paymentConstants";
import apiClient from "../../api/apiClient";
import { useToast } from "../../context/ToastContext";

const FacilityCheckboxes = ({ data, handleNestedChange }) => (
  <div>
    <h5 className="font-semibold text-gray-700 mb-2">Fasilitas Kamar</h5>
    <div className="grid grid-cols-2 gap-y-1 mt-2">
      {ALL_FACILITIES.map((facility) => {
        const key = facility.toLowerCase().replace(/ /g, "_");
        return (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              checked={data.fasilitas?.[key] || false}
              onChange={(e) =>
                handleNestedChange("fasilitas", key, e.target.checked)
              }
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label className="text-sm text-gray-700 select-none cursor-pointer">
              {facility}
            </label>
          </div>
        );
      })}
    </div>
  </div>
);

const ParkingCheckboxes = ({ data, handleNestedChange }) => (
  <div>
    <h5 className="font-semibold text-gray-700 mb-2">Parkir</h5>
    <div className="space-y-1 mt-2">
      {ALL_PARKING.map((parking) => {
        const key = parking.toLowerCase().replace(/ /g, "_");
        return (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              checked={data.parkir?.[key] || false}
              onChange={(e) =>
                handleNestedChange("parkir", key, e.target.checked)
              }
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label className="text-sm text-gray-700 select-none cursor-pointer">
              {parking} (1 Unit)
            </label>
          </div>
        );
      })}
    </div>
  </div>
);

const KuitansiEditorModal = ({ initialData, onClose, onSaved }) => {
  const { showToast } = useToast();
  const safeInitialData = {
    fasilitas: {},
    parkir: {},
    jumlah: 0,
    uang_muka: 0,
    pelunasan: 0,
    refund: 0,
    lain_lain: 0,
    status_pembayaran: "Belum Lunas", // Default status
    tampilkan_jatuh_tempo: true, // Default tampilkan tanggal jatuh tempo
    ...initialData,
  };

  if (
    !safeInitialData.nomor_kuitansi ||
    safeInitialData.nomor_kuitansi.includes("DRAFT")
  ) {
    const currentData = new Date(
      safeInitialData.tanggal_bayar ||
      safeInitialData.jatuh_tempo ||
      Date.now(),
    );
    safeInitialData.tanggal_bayar = currentData.toISOString().split("T")[0];
    safeInitialData.tanggal_dokumen = new Date().toISOString().split("T")[0];

    const date = new Date(
      safeInitialData.tanggal_bayar ||
      safeInitialData.jatuh_tempo ||
      Date.now(),
    );
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 90 + 10);
    safeInitialData.nomor_kuitansi = `${year}-${month}-INV-${random}`;
  } else {
    // If not new, ensure tanggal_dokumen exists for editing, default to today if null
    safeInitialData.tanggal_dokumen =
      safeInitialData.tanggal_dokumen || new Date().toISOString().split("T")[0];
    // Ensure tanggal_bayar is formatted for input
    if (safeInitialData.tanggal_bayar) {
      safeInitialData.tanggal_bayar = new Date(safeInitialData.tanggal_bayar)
        .toISOString()
        .split("T")[0];
    }
  }
  const [data, setData] = useState(safeInitialData);
  const [showEditor, setShowEditor] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const currentStatus = data.status_pembayaran || "Belum Lunas";

  // --- HANDLERS ---
  const handleDataChange = (field, value) => {
    let newAmount = parseFloat(data.jumlah) || 0;
    if (field === "jumlah") {
      newAmount = parseFloat(value) || 0;
      setData((prevData) => ({
        ...prevData,
        [field]: value,
        terbilang: numberToText(newAmount),
        pelunasan: newAmount,
      }));
    } else {
      setData((prevData) => ({ ...prevData, [field]: value }));
    }
  };

  const handleNestedChange = (category, field, value) => {
    setData((prevData) => ({
      ...prevData,
      [category]: {
        ...(prevData[category] || {}),
        [field]: value,
      },
    }));
  };

  const handlePrint = async () => {
    if (data.id === "PREVIEW-TEMP") {
      setIsSaving(true);
      try {
        // Simpan Snapshot ke Server
        const response = await apiClient.post("/tagihans", {
          penghuni_id: data.id_penghuni,
          kamar_id: data.kamar_id || null, // Optional
          jumlah: data.jumlah,
          nomor_kuitansi: data.nomor_kuitansi,
          deskripsi: data.deskripsi,
          status_pembayaran: data.status_pembayaran,
          jatuh_tempo: data.jatuh_tempo,
          // Kirim data snapshot lengkap kalau backend dukung
        });

        const newId = response.data.tagihan_id;

        // Update ID lokal agar di print muncul ID asli dan tombol berubah jadi 'Cetak Ulang'
        setData((prev) => ({ ...prev, id: newId }));

        showToast("Invoice berhasil disimpan ke history.", "success");
        // if (onSaved) onSaved(); // Jangan tutup modal dulu agar bisa diprint!

      } catch (err) {
        showToast("Gagal menyimpan history invoice: " + (err.response?.data?.message || err.message), "error");
        // Tetap izinkan print walau gagal save? Konfirmasi user
        if (!window.confirm("Gagal menyimpan ke database. Tetap ingin mencetak? (Data tidak akan tersimpan di history)")) {
          setIsSaving(false);
          return;
        }
      } finally {
        setIsSaving(false);
        // Beri waktu React update DOM (ID & Button state) sebelum print dialog muncul
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    } else {
      // Sudah ada ID, langsung print
      window.print();
    }
  };
  const handleBackToEditor = () => setShowEditor(true);
  const handleLanjut = () => setShowEditor(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative z-10000">
        {/* HEADER MODAL */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white print:hidden">
          <h2 className="text-xl font-bold">
            {showEditor ? "Edit Dokumen" : "Tampilan Cetak Invoice"}
          </h2>
          <div className="flex gap-2">
            {!showEditor && (
              <>
                <button
                  onClick={handleBackToEditor}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                >
                  &larr; Kembali Edit
                </button>
                <button
                  onClick={handlePrint}
                  disabled={isSaving}
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50 flex items-center"
                >
                  {isSaving ? "Menyimpan..." : "🖨️ Cetak & Simpan"}
                </button>
              </>
            )}
            {showEditor && (
              <button
                onClick={handleLanjut}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Lanjut &rarr;
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* BODY MODAL */}
        <div className="modal-body p-0">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mx-6 mt-4 mb-1">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg
                  className="h-4 w-4 text-yellow-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-yellow-700">
                  Perubahan di halaman ini hanya untuk pencetakan (PDF/Print)
                  dan <strong>tidak mengubah data asli</strong> di database.
                </p>
              </div>
            </div>
          </div>

          {showEditor ? (
            /* 🚨 EDITOR - SEMUA INPUT SEKARANG AKTIF */
            <div className="p-4 pt-2">
              <h3 className="text-xl font-bold mb-4">
                Konfirmasi Data Kwitansi/Invoice
              </h3>

              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                {/* BLOK ID & NAMA (READ-ONLY) */}
                {/* BLOK ID & NAMA (READ-ONLY) */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      ID Tagihan
                    </label>
                    <input
                      type="text"
                      value={data.id}
                      disabled
                      className="w-full px-3 py-2 bg-gray-200 border border-transparent rounded-md text-gray-700 text-sm font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      No. Kamar
                    </label>
                    <input
                      type="text"
                      value={data.nama_kamar || "N/A"}
                      disabled
                      className="w-full px-3 py-2 bg-gray-200 border border-transparent rounded-md text-gray-700 text-sm font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nama Penghuni
                    </label>
                    <input
                      type="text"
                      value={data.nama_penghuni || "N/A"}
                      disabled
                      className="w-full px-3 py-2 bg-gray-200 border border-transparent rounded-md text-gray-700 text-sm font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nomor Manual Kwitansi / Invoice <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.nomor_kuitansi || ""}
                    onChange={(e) =>
                      handleDataChange("nomor_kuitansi", e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-medium"
                    placeholder="Format: YYYY-XX-INV-XX"
                  />
                </div>

                <hr className="my-3" />

                {/* STATUS, DESKRIPSI & TANGGAL (EDITABLE) */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Status Pembayaran <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={data.status_pembayaran || "Belum Lunas"}
                        onChange={(e) =>
                          handleDataChange("status_pembayaran", e.target.value)
                        }
                        className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-colors font-bold ${data.status_pembayaran === "Lunas"
                          ? "border-green-500 bg-green-50 text-green-700 focus:ring-green-500 focus:border-green-600"
                          : "border-red-500 bg-red-50 text-red-700 focus:ring-red-500 focus:border-red-600"
                          }`}
                      >
                        <option value="Belum Lunas" className="text-red-700 font-semibold">
                          Belum Lunas
                        </option>
                        <option value="Lunas" className="text-green-700 font-semibold">
                          Lunas
                        </option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1 italic">
                        *Lunas = KWITANSI, Belum Lunas = INVOICE
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Untuk Pembayaran (Deskripsi)
                      </label>
                      <input
                        type="text"
                        value={data.deskripsi || ""}
                        onChange={(e) =>
                          handleDataChange("deskripsi", e.target.value)
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* 🚨 UPDATED DATE INPUTS GRID 🚨 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Tagihan / Bayar
                      </label>
                      <input
                        type="date"
                        value={data.tanggal_bayar || ""}
                        onChange={(e) =>
                          handleDataChange("tanggal_bayar", e.target.value)
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Tanda Tangan
                      </label>
                      <input
                        type="date"
                        value={data.tanggal_dokumen || ""}
                        onChange={(e) =>
                          handleDataChange("tanggal_dokumen", e.target.value)
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-600">
                          Sewa Berakhir (Read-Only)
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={data.tampilkan_jatuh_tempo !== false}
                            onChange={(e) =>
                              handleDataChange("tampilkan_jatuh_tempo", e.target.checked)
                            }
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            id="chk-jatuh-tempo"
                          />
                          <label htmlFor="chk-jatuh-tempo" className="ml-1 text-xs text-blue-600 cursor-pointer select-none">
                            Tampilkan
                          </label>
                        </div>
                      </div>
                      <input
                        type="date"
                        value={data.jatuh_tempo_berikut || ""}
                        disabled
                        className={`w-full px-3 py-2 bg-gray-200 border border-transparent rounded-md text-gray-700 text-sm font-medium cursor-not-allowed ${data.tampilkan_jatuh_tempo === false ? "opacity-50" : ""
                          }`}
                      />
                    </div>
                  </div>
                </div>

                <hr className="my-4 border-gray-200" />

                {/* BLOK DETAIL TRANSAKSI & UANG (EDITABLE) */}
                <h4 className="text-md font-bold text-gray-800 mb-3">
                  Detail Keuangan ({currentStatus})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Jumlah Tagihan (Rp)
                    </label>
                    <input
                      type="number"
                      value={data.jumlah || 0}
                      onChange={(e) =>
                        handleDataChange("jumlah", e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Uang Muka (Rp)
                    </label>
                    <input
                      type="number"
                      value={data.uang_muka || 0}
                      onChange={(e) =>
                        handleDataChange("uang_muka", e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pelunasan (Rp)
                    </label>
                    <input
                      type="number"
                      value={data.pelunasan || 0}
                      onChange={(e) =>
                        handleDataChange("pelunasan", e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Metode Pembayaran
                    </label>
                    {/* 🚨 DROPDOWN METODE PEMBAYARAN */}
                    <select
                      value={data.metode_pembayaran || "Transfer"}
                      onChange={(e) =>
                        handleDataChange("metode_pembayaran", e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lain-Lain (Rp)
                    </label>
                    <input
                      type="number"
                      value={data.lain_lain || 0}
                      onChange={(e) =>
                        handleDataChange("lain_lain", e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund (Rp)
                    </label>
                    <input
                      type="number"
                      value={data.refund || 0}
                      onChange={(e) =>
                        handleDataChange("refund", e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <hr className="my-3" />

                {/* BLOK FASILITAS & PARKIR (EDITABLE) */}
                <h4 className="text-md font-semibold mb-3">
                  FASILITAS & PARKIR
                </h4>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="grid grid-cols-2 gap-6">
                    {/* 🚨 PENGGUNAAN KOMPONEN FASILITAS 🚨 */}
                    <FacilityCheckboxes
                      data={data}
                      handleNestedChange={handleNestedChange}
                    />

                    {/* 🚨 PENGGUNAAN KOMPONEN PARKIR 🚨 */}
                    <ParkingCheckboxes
                      data={data}
                      handleNestedChange={handleNestedChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tampilan Level 2: Print View Final */
            <div className="print-view-container min-h-[500px] printable-area">
              <KuitansiPrintView
                data={data}
                mode={currentStatus === "Lunas" ? "RECEIPT" : "INVOICE"}
                onDataChange={handleDataChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KuitansiEditorModal;
