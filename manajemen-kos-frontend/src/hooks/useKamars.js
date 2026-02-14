import { useQuery, keepPreviousData } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

/**
 * Hook untuk fetch kamars dengan filter
 */
export const useKamars = (filters = {}) => {
    return useQuery({
        queryKey: ['kamars', filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters).toString();
            const res = await apiClient.get(`/kamars?${params}`);
            return res.data.data;
        },
        placeholderData: keepPreviousData,
        staleTime: 30000, // 30 detik agar filter tidak terlalu agresif
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch ALL kamars tanpa filter (untuk summary)
 */
export const useAllKamars = () => {
    return useQuery({
        queryKey: ['kamars-all'],
        queryFn: async () => {
            const res = await apiClient.get('/kamars');
            return res.data.data;
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};
