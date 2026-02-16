/**
 * Mutations untuk operasi Create/Update/Delete
 * 
 * @note Loading States Usage:
 * Semua mutations expose `isPending` state yang bisa digunakan untuk loading indicators.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

/**
 * Mutation untuk create transaksi baru
 */
export const useCreateTransaksi = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => apiClient.post('/transaksis', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transaksis'] });
            queryClient.invalidateQueries({ queryKey: ['laba-rugi'] });
            queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
            queryClient.invalidateQueries({ queryKey: ['financial-summary-filtered'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

/**
 * Mutation untuk update transaksi
 */
export const useUpdateTransaksi = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiClient.put(`/transaksis/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transaksis'] });
            queryClient.invalidateQueries({ queryKey: ['laba-rugi'] });
            queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
            queryClient.invalidateQueries({ queryKey: ['financial-summary-filtered'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

/**
 * Mutation untuk delete transaksi
 */
export const useDeleteTransaksi = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiClient.delete(`/transaksis/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transaksis'] });
            queryClient.invalidateQueries({ queryKey: ['laba-rugi'] });
            queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
            queryClient.invalidateQueries({ queryKey: ['financial-summary-filtered'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

/**
 * Mutation untuk create kamar baru
 */
export const useCreateKamar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => apiClient.post('/kamars', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kamars'] });
            queryClient.invalidateQueries({ queryKey: ['kamars-all'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

/**
 * Mutation untuk update kamar
 */
export const useUpdateKamar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiClient.put(`/kamars/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kamars'] });
            queryClient.invalidateQueries({ queryKey: ['kamars-all'] });
        },
    });
};

/**
 * Mutation untuk delete kamar
 */
export const useDeleteKamar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiClient.delete(`/kamars/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kamars'] });
            queryClient.invalidateQueries({ queryKey: ['kamars-all'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

/**
 * Mutation untuk create penghuni baru
 */
export const useCreatePenghuni = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => apiClient.post('/penghunis', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['penghunis'] });
            queryClient.invalidateQueries({ queryKey: ['penghunis-all'] });
            queryClient.invalidateQueries({ queryKey: ['kamars'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

/**
 * Mutation untuk update penghuni
 */
export const useUpdatePenghuni = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiClient.put(`/penghunis/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['penghunis'] });
            queryClient.invalidateQueries({ queryKey: ['penghunis-all'] });
            queryClient.invalidateQueries({ queryKey: ['kamars'] });
        },
    });
};

/**
 * Mutation untuk delete penghuni
 */
export const useDeletePenghuni = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiClient.delete(`/penghunis/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['penghunis'] });
            queryClient.invalidateQueries({ queryKey: ['penghunis-all'] });
            queryClient.invalidateQueries({ queryKey: ['kamars'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

/**
 * Mutation untuk checkout penghuni
 */
export const useCheckoutPenghuni = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, tanggal_keluar }) => apiClient.post(`/penghunis/${id}/checkout`, { tanggal_keluar }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['penghunis'] });
            queryClient.invalidateQueries({ queryKey: ['penghunis-all'] });
            queryClient.invalidateQueries({ queryKey: ['kamars'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['occupancy-trend'] });
        },
    });
};

/**
 * Mutation untuk reassign penghuni
 */
export const useReassignPenghuni = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiClient.post(`/penghunis/${id}/reassign`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['penghunis'] });
            queryClient.invalidateQueries({ queryKey: ['penghunis-all'] });
            queryClient.invalidateQueries({ queryKey: ['kamars'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

/**
 * Mutation untuk record payment penghuni
 */
export const useRecordPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiClient.post(`/penghunis/${id}/payment`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['penghunis'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
            queryClient.invalidateQueries({ queryKey: ['transaksis'] });
        },
    });
};
