import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/apiClient";
import { useUpdateKamar } from "../../hooks/useMutations";
import KamarForm from "../../components/kamar/KamarForm";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import { validateKamarForm } from "../../utils/validation/kamar";
import { useToast } from "../../context/ToastContext";
import logger from "../../utils/logger";

const KamarEditPage = () => {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Mutations
  const updateMutation = useUpdateKamar();

  // Fetch kamar detail
  const { data: kamarData, isLoading: fetchLoading } = useQuery({
    queryKey: ["kamars", id],
    queryFn: async () => {
      const res = await apiClient.get(`/kamars/${id}`);
      return res.data.data;
    },
    onError: (err) => {
      logger.error("Error fetching kamar detail:", err);
      showToast("Gagal memuat data kamar. Silakan coba lagi.", "error");
      navigate("/kamar");
    },
  });

  const [formData, setFormData] = useState({
    nama_kamar: "",
    harga_bulanan: "",
    luas_kamar: "",
    blok: "",
    lantai: "",
    type: 1,
    deskripsi_fasilitas: [],
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (kamarData) {
      let loadedFacilities = [];

      if (kamarData.deskripsi_fasilitas) {
        if (Array.isArray(kamarData.deskripsi_fasilitas)) {
          loadedFacilities = kamarData.deskripsi_fasilitas;
        } else if (typeof kamarData.deskripsi_fasilitas === "string") {
          try {
            const parsed = JSON.parse(kamarData.deskripsi_fasilitas);
            loadedFacilities = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            logger.error("Gagal parsing JSON fasilitas:", e);
            loadedFacilities = [];
          }
        }
      }

      setFormData({
        nama_kamar: kamarData.nama_kamar || "",
        harga_bulanan: parseFloat(kamarData.harga_bulanan) || "",
        luas_kamar: kamarData.luas_kamar || "",
        blok: kamarData.blok || "",
        lantai: kamarData.lantai || "",
        type: kamarData.type || 1,
        deskripsi_fasilitas: loadedFacilities,
      });
    }
  }, [kamarData]);

  const handleChange = useCallback((e) => {
    const { name, value, checked, dataset } = e.target;

    // Prevent input lebih dari 12 digit untuk harga
    if (name === "harga_bulanan" && value.length > 12) return;

    setFormData(prev => {
      if (name === "facility") {
        const facilityName = dataset.name;
        const currentFacilities = prev.deskripsi_fasilitas || [];
        let updatedFacilities;

        if (checked) {
          updatedFacilities = currentFacilities.includes(facilityName)
            ? currentFacilities
            : [...currentFacilities, facilityName];
        } else {
          updatedFacilities = currentFacilities.filter(f => f !== facilityName);
        }

        return { ...prev, deskripsi_fasilitas: updatedFacilities };
      } else {
        return { ...prev, [name]: value };
      }
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
      await updateMutation.mutateAsync({ id, data: dataToSend });
      showToast("Kamar berhasil diperbarui!", "success");
      navigate("/kamar");
    } catch (err) {
      logger.error("Error updating kamar:", err);
      const message =
        err.response?.data?.message ||
        "Gagal memperbarui kamar. Periksa input Anda.";
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

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kamar...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2">✏️ Edit Kamar</h1>
          <p className="text-gray-600">
            Perbarui informasi kamar {formData.nama_kamar}
          </p>
        </div>

        <KamarForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
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
          cancelText="Lanjutkan Edit"
        />
      )}
    </div>
  );
};

export default KamarEditPage;
