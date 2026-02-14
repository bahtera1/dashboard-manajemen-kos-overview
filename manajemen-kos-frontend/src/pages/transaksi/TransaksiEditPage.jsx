import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTransaksiDetail } from "../../hooks/useTransaksis";
import { useAllPenghunis } from "../../hooks/usePenghunis";
import { useUpdateTransaksi } from "../../hooks/useMutations";
import TransaksiForm from "../../components/transaksi/TransaksiForm";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import { validateTransaksiForm } from "../../utils/validation/transaksi";
import FullScreenLoader from "../../components/common/ui/FullScreenLoader";
import { useToast } from "../../context/ToastContext";

const TransaksiEditPage = () => {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [historicalPenghuni, setHistoricalPenghuni] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [combinedPenghunis, setCombinedPenghunis] = useState([]);

  // React Query hooks
  const {
    data: transaksiData,
    isLoading: transaksiLoading,
    error: transaksiError,
  } = useTransaksiDetail(id);
  const { data: penghunisList = [], isLoading: penghuniLoading } =
    useAllPenghunis();
  const updateMutation = useUpdateTransaksi();

  const [formData, setFormData] = useState({
    tipe_transaksi: "Pemasukan",
    kategori: "",
    account_code: "",
    cash_flow_index: 0,
    jumlah: "",
    tanggal_transaksi: "",
    deskripsi: "",
    penghuni_id: "",
  });

  // Populate form and handle historical penghuni when data is loaded
  const [isInitialized, setIsInitialized] = useState(false);

  // Populate form and handle historical penghuni when data is loaded
  // Populate form and handle historical penghuni when data is loaded
  useEffect(() => {
    if (transaksiData && !isInitialized) {
      // LOGIKA ROBUST: Handle Historical Tenant
      let historicalTenant = null;
      let targetPenghuniId = transaksiData.penghuni_id;

      if (transaksiData.penghuni) {
        // Skenario A: Relasi Masih Ada
        historicalTenant = {
          ...transaksiData.penghuni,
          kamar: transaksiData.kamar,
        };
      } else if (transaksiData.penghuni_id) {
        // Skenario B: Relasi Hilang (Orphan ID)
        historicalTenant = {
          id: transaksiData.penghuni_id,
          nama_lengkap:
            transaksiData.penghuni_name ||
            `Penghuni ID #${transaksiData.penghuni_id} (Data Terhapus/Snapshot)`,
          kamar: transaksiData.kamar,
          status_sewa: "Nonaktif",
          is_orphaned: true,
        };
      }

      // Gabungkan data historis ke list dropdown biar selectable
      let newCombinedList = [...(penghunisList || [])];

      if (historicalTenant) {
        setHistoricalPenghuni(historicalTenant);
        // Cek duplicate manual biar aman
        const exists = newCombinedList.find((p) => p.id === historicalTenant.id);
        if (!exists) {
          newCombinedList.push(historicalTenant);
        }
      }
      setCombinedPenghunis(newCombinedList);

      setFormData({
        tipe_transaksi: transaksiData.tipe_transaksi,
        kategori: transaksiData.kategori,
        account_code: transaksiData.account_code || "",
        cash_flow_index: transaksiData.cash_flow_index || 0,
        jumlah: parseFloat(transaksiData.jumlah),
        tanggal_transaksi: transaksiData.tanggal_transaksi,
        deskripsi: transaksiData.deskripsi,
        penghuni_id: targetPenghuniId || "",
      });

      setIsInitialized(true); // Stop loop
    }
  }, [transaksiData, penghunisList, isInitialized]);

  // Handle error
  useEffect(() => {
    if (transaksiError) {
      showToast("Gagal memuat data transaksi.", "error");
      navigate("/transaksi");
    }
  }, [transaksiError, showToast, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const finalValue =
      type === "number" ? (value ? parseInt(value) : "") : value;

    setFormData(prev => {
      let newState = { ...prev, [name]: finalValue };

      // Reset kategori dan penghuni jika tipe transaksi berubah
      if (name === "tipe_transaksi") {
        newState.penghuni_id = "";
        newState.account_code = "";
        newState.kategori =
          value === "Pengeluaran" ? "Biaya Listrik" : "Sewa Bulanan";
      }
      return newState;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Format Dasar
    const validation = validateTransaksiForm(formData);
    if (!validation.valid) {
      showToast(Object.values(validation.errors)[0], "error");
      return;
    }



    try {
      await updateMutation.mutateAsync({ id, data: formData });

      showToast("Transaksi berhasil diperbarui!", "success");
      navigate("/transaksi");
    } catch (err) {
      let message = "Gagal memperbarui transaksi. Periksa input Anda.";

      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const firstField = Object.keys(validationErrors)[0];
        const firstError = validationErrors[firstField][0];
        message = `Validasi Gagal: ${firstError}`;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      showToast(message, "error");
    }
  };

  const handleBackClick = () => setIsConfirmModalOpen(true);
  const handleBackConfirm = () => navigate("/transaksi");
  const handleBackCancel = () => setIsConfirmModalOpen(false);

  const fetchLoading = transaksiLoading || penghuniLoading;

  if (fetchLoading) {
    return <FullScreenLoader message="Memuat form edit..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBackClick}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          &larr; Kembali ke Laporan Transaksi
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">✏️ Edit Transaksi</h1>
          <p className="text-gray-600">Perbarui detail transaksi ID: {id}</p>
        </div>

        <TransaksiForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          allPenghunis={combinedPenghunis}
          historicalPenghuni={historicalPenghuni}
          isEdit={true}
          loading={updateMutation.isPending}
        />
      </div>
      {isConfirmModalOpen && (
        <ConfirmModal
          message="Apakah Anda yakin ingin kembali? Perubahan yang belum disimpan akan hilang."
          onConfirm={handleBackConfirm}
          onCancel={handleBackCancel}
          confirmText="Ya, Kembali"
          cancelText="Lanjutkan Edit Form"
        />
      )}
    </div>
  );
};

export default TransaksiEditPage;
