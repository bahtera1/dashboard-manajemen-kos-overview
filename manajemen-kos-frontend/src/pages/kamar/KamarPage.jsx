import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKamars, useAllKamars } from "../../hooks/useKamars";
import { useDeleteKamar } from "../../hooks/useMutations";
import KamarCard from "../../components/kamar/KamarCard";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import FullScreenLoader from "../../components/common/ui/FullScreenLoader";
import KamarStatsGrid from "../../components/kamar/KamarStatsGrid";
import SearchBar from "../../components/common/forms/SearchBar";
import CustomSelect from "../../components/common/forms/CustomSelect";
import { hitungStatusKamar } from "../../utils/kamarUtils";
import { useToast } from "../../context/ToastContext";

const KamarPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [lantaiFilter, setLantaiFilter] = useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [kamarToDelete, setKamarToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryFilters = {};
  if (debouncedSearch) queryFilters.search = debouncedSearch;
  if (availabilityFilter) queryFilters.is_available = availabilityFilter;
  if (lantaiFilter) queryFilters.lantai = lantaiFilter;

  const {
    data: kamars = [],
    isLoading: kamarsLoading,
    isFetching: isFetchingKamars,
    error: kamarsError,
  } = useKamars(queryFilters);

  const { data: allKamars = [], isLoading: allKamarsLoading } = useAllKamars();
  const deleteMutation = useDeleteKamar();

  const isInitialLoading =
    (kamarsLoading && !kamars.length && !isFetchingKamars) || allKamarsLoading;
  const error = kamarsError?.response?.data?.message || kamarsError?.message;

  const summary = hitungStatusKamar(allKamars);
  const statsForGrid = {
    total_kamar: summary.total,
    kamar_terisi: summary.occupied,
    kamar_kosong: summary.available,
  };

  const handleCreate = () => navigate("/kamar/create");
  const handleEdit = (id) => navigate(`/kamar/edit/${id}`);

  const confirmDelete = (id) => {
    setKamarToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!kamarToDelete) return;

    setIsConfirmModalOpen(false);

    try {
      await deleteMutation.mutateAsync(kamarToDelete);
      showToast("Kamar berhasil dihapus!", "success");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Gagal menghapus kamar. Kemungkinan masih ada riwayat penghuni.";
      showToast(message, "error");
    } finally {
      setKamarToDelete(null);
    }
  };

  if (isInitialLoading) {
    return <FullScreenLoader message="Memuat data kamar..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-2">🏠 Manajemen Kamar Kos</h1>
      <p className="text-gray-600 mb-8">Kelola semua data kamar kos Anda</p>

      <div className="mb-6 grid grid-cols-2 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
        <div className="col-span-2 sm:col-span-6 lg:col-span-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isSearching={isFetchingKamars}
            placeholder="Cari nama kamar atau blok..."
            className="w-full"
          />
        </div>

        <div className="col-span-1 sm:col-span-3 lg:col-span-3">
          <CustomSelect
            name="availability"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            options={[
              { label: "Semua Kamar", value: "" },
              { label: "Tersedia", value: "true" },
              { label: "Terisi", value: "false" },
            ]}
            placeholder="Semua Kamar"
            searchable={false}
          />
        </div>

        <div className="col-span-1 sm:col-span-3 lg:col-span-3">
          <CustomSelect
            name="lantai"
            value={lantaiFilter}
            onChange={(e) => setLantaiFilter(e.target.value)}
            options={[
              { label: "Semua Lantai", value: "" },
              { label: "Lantai 1", value: "1" },
              { label: "Lantai 2", value: "2" },
              { label: "Lantai 3", value: "3" },
            ]}
            placeholder="Semua Lantai"
            searchable={false}
          />
        </div>
      </div>

      <div className="mb-6">
        <KamarStatsGrid stats={statsForGrid} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-600">
            Total: <span className="font-semibold">{kamars.length}</span> kamar
            ditampilkan
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-medium shadow-sm transition-colors"
        >
          + Tambah Kamar Baru
        </button>
      </div>

      <div
        className={`transition-opacity duration-200 ${isFetchingKamars ? "opacity-50" : "opacity-100"}`}
      >
        {kamars.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg mb-4">
              {debouncedSearch
                ? `Tidak ada kamar yang cocok dengan "${debouncedSearch}".`
                : "Belum ada data kamar yang tersimpan."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kamars.map((kamar) => (
              <KamarCard
                key={kamar.id}
                kamar={kamar}
                onEdit={handleEdit}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        )}
      </div>

      {isConfirmModalOpen && (
        <ConfirmModal
          message="Apakah Anda yakin ingin menghapus kamar ini? Tindakan ini tidak dapat dibatalkan dan hanya bisa dilakukan jika tidak ada riwayat penghuni."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
          confirmText="Ya, Hapus Permanen"
        />
      )}
    </div>
  );
};

export default KamarPage;
