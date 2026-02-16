import { useQuery, keepPreviousData } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

/**
 * Hook untuk fetch transaksis dengan filter
 */
export const useTransaksis = (filters = {}) => {
    return useQuery({
        queryKey: ['transaksis', filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters).toString();
            const res = await apiClient.get(`/transaksis?${params}`);
            return res.data;
        },
        placeholderData: keepPreviousData,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch laba rugi report
 */
export const useLabaRugiReport = (filters = {}) => {
    return useQuery({
        queryKey: ['laba-rugi', filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters).toString();
            const res = await apiClient.get(`/reports/laba-rugi?${params}`);
            return res.data;
        },
        placeholderData: keepPreviousData,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch financial summary dengan filter tanggal
 */
export const useFinancialSummaryWithFilters = (filters = {}) => {
    return useQuery({
        queryKey: ['financial-summary-filtered', filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters).toString();
            const res = await apiClient.get(`/reports/financial-summary?${params}`);
            return res.data;
        },
        placeholderData: keepPreviousData,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch detail transaksi by ID
 */
export const useTransaksiDetail = (id) => {
    return useQuery({
        queryKey: ['transaksi-detail', id],
        queryFn: async () => {
            const res = await apiClient.get(`/transaksis/${id}`);
            return res.data.data;
        },
        enabled: !!id,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};
