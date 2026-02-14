import { useQuery, useQueries, keepPreviousData } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

const STALE_TIME = 5 * 60 * 1000; // 5 Menit

/**
 * Hook untuk fetch dashboard stats
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/reports/dashboard-stats");
      return res.data.data;
    },
    staleTime: STALE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook untuk fetch financial summary (dengan opsi limit bulan untuk trend)
 */
export const useFinancialSummary = (trendLimit = 6) => {
  return useQuery({
    queryKey: ["financial-summary", trendLimit],
    queryFn: async () => {
      const res = await apiClient.get(
        `/reports/financial-summary?trend_limit=${trendLimit}`,
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
};

/**
 * Hook untuk fetch occupancy trend
 */
export const useOccupancyTrend = () => {
  return useQuery({
    queryKey: ["occupancy-trend"],
    queryFn: async () => {
      const res = await apiClient.get("/reports/occupancy-trend");
      return res.data.data;
    },
    staleTime: STALE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook untuk fetch semua dashboard data sekaligus.
 */
export const useDashboardData = () => {
  return useQueries({
    queries: [
      {
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
          const res = await apiClient.get("/reports/dashboard-stats");
          return res.data.data;
        },
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["financial-summary", 6], // Default 6 bulan
        queryFn: async () => {
          const res = await apiClient.get(
            "/reports/financial-summary?trend_limit=6",
          );
          return res.data;
        },
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["occupancy-trend"],
        queryFn: async () => {
          const res = await apiClient.get("/reports/occupancy-trend");
          return res.data.data;
        },
        staleTime: STALE_TIME,
      },
    ],
  });
};
