import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import {
  usePenghuniDetail,
} from "../../hooks/usePenghunis";
import KuitansiEditorModal from "../../components/penghuni/KuitansiEditorModal";
import FullScreenLoader from "../../components/common/ui/FullScreenLoader";
import { getDaysRemaining } from "../../utils/contractUtils";
import { useToast } from "../../context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

const PenghuniDetailPage = () => {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [kuitansiLoading, setKuitansiLoading] = useState(false);

  // React Query hooks
  const {
    data: penghuni,
    isLoading: penghuniLoading,
    error: penghuniError,
  } = usePenghuniDetail(id);

  // const { data: draftInvoiceId, isLoading: draftLoading } = usePenghuniDraftInvoice(id); // REMOVED

  // Handle error via UI instead of useEffect to avoid navigation loop
  if (penghuniError) {
    return (
      <div className="p-8 text-red-600 text-center min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <p className="text-xl mb-4">
            <span className="mr-2">❌</span>
            Gagal memuat data penghuni
          </p>
          <button
            onClick={() => navigate("/penghuni")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  // Preview Mode (New Feature)
  const handleCreatePreview = async () => {
    setKuitansiLoading(true);
    try {
      const response = await apiClient.get(
        `/penghunis/${id}/kuitansi-preview`
      );
      const responseData = response.data.data;
      setModalData(responseData);
      setIsModalOpen(true);
    } catch (err) {
      showToast("Gagal membuat preview invoice.", "error");
    } finally {
      setKuitansiLoading(false);
    }
  };



  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleTagihanSaved = () => {
    handleCloseModal();
    // Refresh data setelah menyimpan (jika perlu)
    queryClient.invalidateQueries({ queryKey: ["penghuni-detail", id] });
    // queryClient.invalidateQueries({ queryKey: ["penghuni-draft-invoice", id] }); // Removed
    showToast("Invoice berhasil disimpan!", "success");
  };

  // --- Render Logic ---

  // Function helper untuk UI Status Chip (lokal karena spesifik UI)
  const getDaysStatusChip = (days, isActive) => {
    if (!isActive)
      return { text: "Nonaktif", color: "bg-red-100 text-red-800" };
    if (days === null)
      return { text: "N/A", color: "bg-gray-100 text-gray-600" };
    if (days < 0)
      return {
        text: `${Math.abs(days)} Hari Lewat`,
        color: "bg-red-100 text-red-800",
      };
    if (days === 0)
      return { text: "Berakhir Hari Ini", color: "bg-red-100 text-red-800" };
    if (days <= 7)
      return {
        text: `${days} Hari Tersisa`,
        color: "bg-orange-100 text-orange-800",
      };
    return {
      text: `${days} Hari Tersisa`,
      color: "bg-green-100 text-green-800",
    };
  };

  const loading = penghuniLoading || kuitansiLoading; // draftLoading removed

  if (loading && !penghuni) {
    return <FullScreenLoader message="Memuat detail Penghuni..." />;
  }

  if (!penghuni)
    return (
      <div className="p-8 text-red-600 text-center min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl p-4 bg-white shadow-xl rounded-lg">
          <span className="mr-2">❌</span>
          Data Penghuni dengan ID <strong>{id}</strong> tidak ditemukan.
        </p>
      </div>
    );

  const daysRemaining = getDaysRemaining(penghuni?.masa_berakhir_sewa);
  const isContractActive = penghuni?.status_sewa === "Aktif";
  const statusChip = getDaysStatusChip(daysRemaining, isContractActive);

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/penghuni")}
          className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center font-medium transition duration-150"
        >
          <span className="text-lg mr-2">←</span> Kembali ke Daftar Penghuni
        </button>

        {/* Header Utama */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-t-4 border-indigo-500">
          <div className="flex justify-between items-center flex-wrap">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-2">
              <span className="mr-3 text-4xl">👤</span> {penghuni.nama_lengkap}
            </h1>
            <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm flex items-center ${statusChip.color}`}>
              <span className="mr-2">●</span> {statusChip.text}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div className="flex items-center">
              <span className="w-6 text-center mr-2">🏠</span>
              <span className="font-medium">Kamar:</span>
              <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">
                {penghuni.kamar?.nama_kamar || "Tidak Ada Kamar"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-6 text-center mr-2">📱</span>
              <span className="font-medium">No. HP:</span>
              <span className="ml-2 font-mono text-gray-800">{penghuni.no_hp}</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 text-center mr-2">🆔</span>
              <span className="font-medium">KTP:</span>
              <span className="ml-2 font-mono text-gray-800">{penghuni.no_ktp}</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 text-center mr-2">📅</span>
              <span className="font-medium">Masa Sewa:</span>
              <span className="ml-2 text-gray-800">
                {penghuni.tanggal_masuk} s/d {penghuni.masa_berakhir_sewa || "?"}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BAR: Cetak Invoice */}
        <div className="flex justify-start items-center mb-10 p-6 bg-yellow-50 rounded-xl shadow border-l-4 border-yellow-400">
          <h2 className="text-xl font-bold text-gray-800 mr-6">
            Cetak Invoice/Kwitansi
          </h2>

          <button
            onClick={handleCreatePreview}
            disabled={kuitansiLoading}
            className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white text-md hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center disabled:opacity-50"
            title="Buat Invoice Baru"
          >
            {kuitansiLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Memuat...
              </>
            ) : (
              <>
                <span className="mr-2">📝</span> Buat Invoice Baru
              </>
            )}
          </button>
        </div>

        {/* Grid Informasi Detail */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-t-4 border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg text-blue-600">📋</span> Data Pribadi &
            Sewa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-700">
            {/* Kolom 1: Identitas & Kontak */}
            <div>
              <p className="mb-2">
                <strong className="text-gray-900">No. KTP:</strong>{" "}
                {penghuni?.no_ktp || "-"}
              </p>
              <p className="mb-2">
                <strong className="text-gray-900">No. HP:</strong>{" "}
                {penghuni?.no_hp || "-"}
              </p>
              <p className="mb-2">
                <strong className="text-gray-900">Email:</strong>{" "}
                {penghuni?.email || "-"}
              </p>
              <p className="mb-2">
                <strong className="text-gray-900">Pekerjaan:</strong>{" "}
                {penghuni?.pekerjaan || "-"}
              </p>
            </div>
            {/* Kolom 2: Administrasi Sewa */}
            <div>
              <p className="mb-2">
                <strong className="text-gray-900">Tanggal Masuk:</strong>{" "}
                {penghuni?.tanggal_masuk || "-"}
              </p>
              <p className="mb-2">
                <strong className="text-gray-900">Tanggal Keluar:</strong>{" "}
                {penghuni?.tanggal_keluar || "-"}
              </p>
              <p className="mb-2">
                <strong className="text-gray-900">PIC Darurat:</strong>{" "}
                {penghuni?.pic_emergency || "-"}
              </p>
            </div>
            {/* Kolom 3: Info Pembayaran */}
            <div>
              <p className="mb-2">
                <strong className="text-gray-900">Status Sewa:</strong>{" "}
                {penghuni?.status_sewa || "N/A"}
              </p>
              <p className="mb-2">
                <strong className="text-gray-900">Bayar Terakhir:</strong>{" "}
                {penghuni?.durasi_bayar_terakhir || 0}{" "}
                {penghuni?.unit_bayar_terakhir || "bulan"}
              </p>
              <p className="mb-2">
                <strong className="text-gray-900">Blok Kamar:</strong>{" "}
                {penghuni?.kamar?.blok || "-"} | Lantai{" "}
                {penghuni?.kamar?.lantai || "-"}
              </p>
            </div>
          </div>

          {/* Catatan Admin */}
          {penghuni?.catatan && (
            <div className="mt-6 pt-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900">Catatan Admin:</h3>
              <p className="text-sm italic text-gray-600 bg-gray-50 p-2 rounded-md mt-1">
                {penghuni.catatan}
              </p>
            </div>
          )}
        </div>

        {/* Modal Tagihan */}
        {isModalOpen && modalData && (
          <KuitansiEditorModal
            initialData={modalData}
            onClose={handleCloseModal}
            onSaved={handleTagihanSaved}
            penghuniId={id}
          />
        )}
      </div>
    </div>
  );
};

export default PenghuniDetailPage;
