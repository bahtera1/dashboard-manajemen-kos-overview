import React, { useState } from "react";
import { formatCurrency } from "../../utils/currency";
import {
  useDashboardStats,
  useOccupancyTrend,
  useFinancialSummary,
} from "../../hooks/useDashboardData";
import FullScreenLoader from "../../components/common/ui/FullScreenLoader";
import StatsCard from "../../components/dashboard/StatsCard";
import KamarStatsGrid from "../../components/kamar/KamarStatsGrid";
import OccupancyChart from "../../components/dashboard/OccupancyChart";
import FinancialTrendChart from "../../components/dashboard/FinancialTrendChart";

const DashboardPage = () => {
  const [trendLimit, setTrendLimit] = useState(6);

  const statsQuery = useDashboardStats();
  const occupancyQuery = useOccupancyTrend();
  const financialQuery = useFinancialSummary(trendLimit);

  const stats = statsQuery.data;
  const occupancyTrend = occupancyQuery.data || [];

  const loading =
    statsQuery.isLoading ||
    financialQuery.isLoading ||
    occupancyQuery.isLoading;
  const error =
    statsQuery.error || financialQuery.error || occupancyQuery.error;

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Gagal memuat dashboard</p>
          <button
            onClick={() => {
              statsQuery.refetch();
              financialQuery.refetch();
              occupancyQuery.refetch();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <FullScreenLoader message="Memuat dashboard..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          📊 Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Ringkasan dan statistik manajemen kos
        </p>
      </div>

      {/* Room Status Stats */}
      <KamarStatsGrid stats={stats} />

      {/* Financial Stats (Colored Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Pemasukan Bulan Ini"
          value={formatCurrency(stats?.pemasukan_bulan_ini || 0)}
          icon="💰"
          className="bg-linear-to-br from-green-500 to-green-600 text-white"
        />
        <StatsCard
          title="Pengeluaran Bulan Ini"
          value={formatCurrency(stats?.pengeluaran_bulan_ini || 0)}
          icon="💸"
          className="bg-linear-to-br from-red-500 to-red-600 text-white"
        />
        <StatsCard
          title="Laba/Rugi Bulan Ini"
          value={formatCurrency(stats?.laba_rugi_bulan_ini || 0)}
          icon="📊"
          className="bg-linear-to-br from-blue-500 to-blue-600 text-white"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FinancialTrendChart
          data={financialQuery.data?.monthly_trend || []}
          selectedLimit={trendLimit}
          onLimitChange={setTrendLimit}
          isLoading={financialQuery.isFetching}
        />
        <OccupancyChart data={occupancyTrend} />
      </div>
    </div>
  );
};

export default DashboardPage;
