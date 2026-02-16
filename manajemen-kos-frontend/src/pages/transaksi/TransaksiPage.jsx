import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import { getFilterDates } from "../../utils/dateUtils";
import {
  useTransaksis,
  useLabaRugiReport,
  useFinancialSummaryWithFilters,
} from "../../hooks/useTransaksis";
import { useDeleteTransaksi } from "../../hooks/useMutations";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import FullScreenLoader from "../../components/common/ui/FullScreenLoader";
import FinancialChartWidget from "../../components/transaksi/FinancialChartWidget";
import TransaksiTable from "../../components/transaksi/TransaksiTable";
import TransaksiCharts from "../../components/transaksi/TransaksiCharts";
import TransaksiFilter from "../../components/transaksi/TransaksiFilter";
import Pagination from "../../components/common/ui/Pagination";
import { useToast } from "../../context/ToastContext";

const TransaksiPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [filterDate, setFilterDate] = useState({});
  const [filterTipe, setFilterTipe] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      if (searchInput !== debouncedSearch) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryFilters = {
    ...filterDate,
    ...(filterTipe !== "all" && { tipe_transaksi: filterTipe }),
    ...(debouncedSearch && { search: debouncedSearch }),
    page: currentPage,
    per_page: perPage,
  };

  const {
    data: transaksisData,
    isLoading: transaksisLoading,
    isFetching: transaksisIsFetching,
    error: transaksisError,
  } = useTransaksis(queryFilters);

  const {
    data: reportData,
    isLoading: reportLoading,
    isFetching: reportIsFetching,
  } = useLabaRugiReport(queryFilters);
  const { data: financialSummary, isLoading: financialLoading } =
    useFinancialSummaryWithFilters(filterDate);

  const deleteMutation = useDeleteTransaksi();

  const transaksis = transaksisData?.data || [];
  const lastPage = transaksisData?.last_page || 1;
  const totalItems = transaksisData?.total || 0;
  const report = reportData || { pemasukan: 0, pengeluaran: 0, laba_rugi: 0 };

  const isInitialLoading = transaksisLoading && !transaksisData;
  const isOverlayLoading = transaksisIsFetching && transaksisData;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (e) => {
    setQuickFilter("custom");
    setFilterDate({ ...filterDate, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleQuickFilterChange = (e) => {
    const period = e.target.value;
    setQuickFilter(period);

    if (period === "custom") return;

    if (period === "all") {
      setFilterDate({});
    } else {
      const dates = getFilterDates(period);
      setFilterDate(dates);
    }
    setCurrentPage(1);
  };

  const handleTipeFilterChange = (e) => {
    setFilterTipe(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleEdit = (id) => navigate(`/transaksi/edit/${id}`);

  const handleDeleteClick = (transaksiId) => {
    setSelectedTransaksiId(transaksiId);
    setIsConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaksiId) return;

    try {
      await deleteMutation.mutateAsync(selectedTransaksiId);
      showToast("Transaksi berhasil dihapus.", "success");
      setIsConfirmDialogOpen(false);
      setSelectedTransaksiId(null);

      if (transaksis.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal menghapus transaksi.";
      showToast(message, "error");
    }
  };

  const handleDeleteCancel = () => {
    setIsConfirmDialogOpen(false);
    setSelectedTransaksiId(null);
  };

  if (isInitialLoading) {
    return <FullScreenLoader message="Memuat data Transaksi..." />;
  }

  if (transaksisError) {
    return (
      <div className="p-8 text-red-600">
        {transaksisError.message || "Terjadi kesalahan memuat data."}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">💸 Manajemen Transaksi</h1>

      <div
        className={`mb-8 max-w-full lg:max-w-xl transition-opacity duration-200 ${reportIsFetching ? "opacity-70" : "opacity-100"}`}
      >
        <FinancialChartWidget report={report} />
      </div>

      {financialSummary && (filterDate.start_date || filterDate.end_date) && (
        <div className={financialLoading ? "opacity-70" : "opacity-100"}>
          <TransaksiCharts financialSummary={financialSummary} />
        </div>
      )}

      <TransaksiFilter
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        isSearching={transaksisIsFetching}
        filterTipe={filterTipe}
        onTipeChange={handleTipeFilterChange}
        quickFilter={quickFilter}
        onQuickFilterChange={handleQuickFilterChange}
        filterDate={filterDate}
        onDateChange={handleFilterChange}
        onAddClick={() => navigate("/transaksi/create")}
      />

      <div
        className={`transition-opacity duration-200 ${isOverlayLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
      >
        <TransaksiTable
          transaksis={transaksis}
          currentPage={currentPage}
          perPage={perPage}
          debouncedSearch={debouncedSearch}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        lastPage={lastPage}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={handlePageChange}
      />

      {isConfirmDialogOpen && (
        <ConfirmModal
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Konfirmasi Hapus"
          message="Apakah Anda yakin ingin menghapus transaksi ini?"
        />
      )}
    </div>
  );
};

export default TransaksiPage;
