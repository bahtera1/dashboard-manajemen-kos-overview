import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateKamar } from "../../hooks/useMutations";
import KamarForm from "../../components/kamar/KamarForm";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import { validateKamarForm } from "../../utils/validation/kamar";
import { useToast } from "../../context/ToastContext";
import logger from "../../utils/logger";

const KamarCreatePage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Mutation hook
  const createMutation = useCreateKamar();

  const [formData, setFormData] = useState({
    nama_kamar: "",
    harga_bulanan: "",
    luas_kamar: "",
    blok: "",
    lantai: "",
    type: 1,
    deskripsi_fasilitas: [],
  });

  const handleChange = useCallback((e) => {
    const { name, value, checked, dataset } = e.target;

    // Prevent input lebih dari 12 digit untuk harga
    if (name === "harga_bulanan" && value.length > 12) return;

    setFormData((prev) => {
      if (name === "facility") {
        const facilityName = dataset.name;
        const currentFacilities = prev.deskripsi_fasilitas || [];
        let updatedFacilities;

        if (checked) {
          updatedFacilities = currentFacilities.includes(facilityName)
            ? currentFacilities
            : [...currentFacilities, facilityName];
        } else {
          updatedFacilities = currentFacilities.filter(
            (f) => f !== facilityName,
          );
        }

        return { ...prev, deskripsi_fasilitas: updatedFacilities };
      }

      // Handle input number standar (HTML input type number return string value)
      // Tapi biarkan string biar user bisa hapus sampai kosong
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateKamarForm(formData);
    if (!validation.valid) {
      showToast(Object.values(validation.errors)[0], "error");
      return;
    }

    const facilitiesArray = Array.isArray(formData.deskripsi_fasilitas)
      ? formData.deskripsi_fasilitas
      : [];

    const dataToSend = {
      nama_kamar: formData.nama_kamar,
      harga_bulanan: formData.harga_bulanan,
      luas_kamar: formData.luas_kamar,
      blok: formData.blok,
      lantai: formData.lantai,
      type: formData.type,
      deskripsi_fasilitas: JSON.stringify(facilitiesArray),
    };

    try {
      await createMutation.mutateAsync(dataToSend);
      showToast("Kamar berhasil ditambahkan!", "success");
      navigate("/kamar");
    } catch (err) {
      logger.error("Error creating kamar:", err.response || err);

      let message = "Gagal menambahkan kamar. Periksa input Anda.";

      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = err.response.data.errors;
        const firstErrorKey = Object.keys(validationErrors)[0];

        if (firstErrorKey) {
          message = `Validasi Gagal: ${validationErrors[firstErrorKey][0]}`;
        }
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

  const handleBackClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleBackConfirm = () => {
    setIsConfirmModalOpen(false);
    navigate("/kamar");
  };

  const handleBackCancel = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBackClick}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          &larr; Kembali ke Daftar Kamar
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">➕ Tambah Kamar Baru</h1>
          <p className="text-gray-600">
            Isi form di bawah untuk menambahkan kamar baru
          </p>
        </div>

        <KamarForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isEdit={false}
          loading={createMutation.isPending}
        />
      </div>

      {isConfirmModalOpen && (
        <ConfirmModal
          message="Apakah Anda yakin ingin kembali? Semua data yang sudah Anda isi di form akan hilang."
          onConfirm={handleBackConfirm}
          onCancel={handleBackCancel}
          confirmText="Ya, Kembali"
          cancelText="Lanjutkan Edit"
        />
      )}
    </div>
  );
};

export default KamarCreatePage;
