import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  usePenghuniDetail,
  useAllKamarsForEdit,
} from "../../hooks/usePenghunis";
import { useUpdatePenghuni } from "../../hooks/useMutations";
import PenghuniForm from "../../components/penghuni/PenghuniForm";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import FullScreenLoader from "../../components/common/ui/FullScreenLoader";
import { validatePenghuniForm } from "../../utils/validation/penghuni";
import { useToast } from "../../context/ToastContext";

const PenghuniEditPage = () => {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [kamarName, setKamarName] = useState(null);

  // React Query hooks
  const {
    data: penghuniData,
    isLoading: penghuniLoading,
    error: penghuniError,
  } = usePenghuniDetail(id);
  const { data: allKamars = [], isLoading: kamarsLoading } =
    useAllKamarsForEdit();
  const updateMutation = useUpdatePenghuni();

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    no_ktp: "",
    no_hp: "",
    email: "",
    pekerjaan: "",
    pic_emergency: "",
    kamar_id: "",
    tanggal_masuk: "",
    catatan: "",
    initial_duration: 1,
    duration_unit: "month",
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (penghuniData) {
      setFormData({
        nama_lengkap: penghuniData.nama_lengkap,
        no_ktp: penghuniData.no_ktp,
        no_hp: penghuniData.no_hp,
        email: penghuniData.email,
        pekerjaan: penghuniData.pekerjaan || "",
        pic_emergency: penghuniData.pic_emergency,
        kamar_id: penghuniData.kamar_id,
        tanggal_masuk: penghuniData.tanggal_masuk,
        catatan: penghuniData.catatan || "",
        initial_duration: penghuniData.durasi_bayar_terakhir || 1,
        duration_unit: penghuniData.unit_bayar_terakhir || "month",
      });

      setKamarName(penghuniData.kamar?.nama_kamar || "Tidak Ditemukan");
    }
  }, [penghuniData]);

  // Handle error
  useEffect(() => {
    if (penghuniError) {
      showToast("Gagal memuat data penghuni", "error");
      navigate("/penghuni");
    }
  }, [penghuniError, showToast, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "initial_duration") {
      const intValue = parseInt(value);
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
      await updateMutation.mutateAsync({ id, data: formData });
      showToast("Data penghuni dan kamar berhasil diperbarui!", "success");
      navigate("/penghuni");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Gagal memperbarui. Kamar tujuan mungkin terisi.";
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

  const fetchLoading = penghuniLoading || kamarsLoading;

  if (fetchLoading) {
    return <FullScreenLoader message="Memuat form edit..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={handleBackClick}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          &larr; Kembali ke Daftar Penghuni
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">✏️ Edit Penghuni</h1>
          <p className="text-gray-600">
            Perbarui data diri dan/atau kamar yang ditempati penghuni{" "}
            {formData.nama_lengkap}
          </p>
        </div>

        <PenghuniForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          allKamars={allKamars}
          isEdit={true}
          loading={updateMutation.isPending}
          availableKamars={allKamars.filter(
            (k) => k.is_available || k.id === formData.kamar_id,
          )}
          kamarName={kamarName}
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

export default PenghuniEditPage;
