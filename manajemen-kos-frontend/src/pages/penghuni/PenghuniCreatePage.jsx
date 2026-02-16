import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAvailableKamars } from "../../hooks/usePenghunis";
import { useCreatePenghuni } from "../../hooks/useMutations";
import PenghuniForm from "../../components/penghuni/PenghuniForm";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import { validatePenghuniForm } from "../../utils/validation/penghuni";
import FullScreenLoader from "../../components/common/ui/FullScreenLoader";
import { useToast } from "../../context/ToastContext";

const PenghuniCreatePage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // React Query hooks
  const { data: availableKamars = [], isLoading: fetchLoading } =
    useAvailableKamars();
  const createMutation = useCreatePenghuni();

  const [formData, setFormData] = useState({
    // Data Diri
    nama_lengkap: "",
    no_ktp: "",
    no_hp: "",
    email: "",
    pekerjaan: "",
    pic_emergency: "",
    kamar_id: "",
    tanggal_masuk: new Date().toISOString().split("T")[0],
    catatan: "",
    initial_duration: 1,
    duration_unit: "month",
  });

  // Set default kamar_id saat availableKamars berubah
  useEffect(() => {
    if (availableKamars.length > 0 && !formData.kamar_id) {
      setFormData((prev) => ({ ...prev, kamar_id: availableKamars[0].id }));
    }
  }, [availableKamars, formData.kamar_id]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "initial_duration") {
      const intValue = parseInt(value);
      // Allow empty string to let user clear input
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
      }
      if (isNaN(intValue) || intValue < 1) return;

      setFormData((prev) => ({ ...prev, [name]: intValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validatePenghuniForm(formData);
    if (!validation.valid) {
      showToast(Object.values(validation.errors)[0], "error");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);

      showToast(
        "Penghuni baru berhasil ditambahkan! Masa berakhir sewa awal telah dihitung.",
        "success",
      );

      // Navigate dengan state reload=true agar PenghuniPage tau harus refresh
      navigate("/penghuni", { state: { reload: true } });
    } catch (err) {
      let message = "Gagal menambahkan penghuni. Periksa input Anda.";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        // Ambil semua pesan error, bukan cuma yang pertama
        const errorMessages = Object.values(validationErrors).flat().join("\n");
        message = `Validasi Gagal:\n${errorMessages}`;
      }

      showToast(message, "error");
    }
  };

  const handleBackClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleBackConfirm = () => {
    setIsConfirmModalOpen(false);
    navigate("/penghuni");
  };

  const handleBackCancel = () => {
    setIsConfirmModalOpen(false);
  };

  if (fetchLoading) {
    return <FullScreenLoader message="Memuat data kamar..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBackClick}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          &larr; Kembali ke Daftar Penghuni
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">➕ Tambah Penghuni Baru</h1>
          <p className="text-gray-600">
            Isi formulir di bawah untuk mendaftarkan penghuni.
          </p>
        </div>

        <PenghuniForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={createMutation.isPending}
          availableKamars={availableKamars}
        />
      </div>

      {isConfirmModalOpen && (
        <ConfirmModal
          message="Apakah Anda yakin ingin kembali? Data yang sudah diisi akan hilang."
          onConfirm={handleBackConfirm}
          onCancel={handleBackCancel}
          confirmText="Ya, Kembali"
          cancelText="Lanjut Isi"
        />
      )}
    </div>
  );
};

export default PenghuniCreatePage;
