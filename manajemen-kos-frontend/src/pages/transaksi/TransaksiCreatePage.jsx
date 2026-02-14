import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useActivePenghunis } from "../../hooks/usePenghunis";
import { useCreateTransaksi } from "../../hooks/useMutations";
import TransaksiForm from "../../components/transaksi/TransaksiForm";
import { validateTransaksiForm } from "../../utils/validation/transaksi";
import FullScreenLoader from "../../components/common/ui/FullScreenLoader";
import { useToast } from "../../context/ToastContext";

const TransaksiCreatePage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // React Query hooks
  const { data: allPenghunis = [], isLoading: fetchLoading } =
    useActivePenghunis();
  const createMutation = useCreateTransaksi();

  const [formData, setFormData] = useState({
    tipe_transaksi: "Pemasukan",
    kategori: "Sewa Bulanan",
    account_code: "",
    cash_flow_index: 0,
    jumlah: "",
    tanggal_transaksi: new Date().toISOString().split("T")[0],
    deskripsi: "",
    penghuni_id: "",
  });

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const finalValue =
      type === "number" ? (value ? parseInt(value) : "") : value;

    setFormData(prev => {
      let newState = { ...prev, [name]: finalValue };

      if (name === "tipe_transaksi") {
        newState.penghuni_id = "";
        newState.account_code = ""; // Reset kode akun saat tipe berubah
        if (value === "Pengeluaran") {
          newState.kategori = "Biaya Listrik";
        } else {
          newState.kategori = "Sewa Bulanan";
        }
      }
      return newState;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateTransaksiForm(formData);
    if (!validation.valid) {
      showToast(Object.values(validation.errors)[0], "error");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);

      showToast("Transaksi berhasil dicatat!", "success");
      navigate("/transaksi");
    } catch (err) {
      let message = "Gagal mencatat transaksi. Periksa input Anda.";

      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = err.response.data.errors;
        const firstField = Object.keys(validationErrors)[0];
        const firstError = validationErrors[firstField][0];
        message = `Validasi Gagal: ${firstError}`;
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        message = err.response.data.message;
      }

      showToast(message, "error");
    }
  };

  const handleBack = () => {
    navigate("/transaksi");
  };

  if (fetchLoading) {
    return <FullScreenLoader message="Memuat data penghuni..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          &larr; Kembali ke Laporan Transaksi
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">📥 Catat Transaksi Baru</h1>
          <p className="text-gray-600">
            Pilih tipe, masukkan detail, dan catat transaksi.
          </p>
        </div>

        <TransaksiForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          allPenghunis={allPenghunis}
          isEdit={false}
          loading={createMutation.isPending}
        />
      </div>
    </div>
  );
};

export default TransaksiCreatePage;
