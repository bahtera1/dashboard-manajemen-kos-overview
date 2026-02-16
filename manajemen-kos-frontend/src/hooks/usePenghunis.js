import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { useCheckoutPenghuni, useRecordPayment, useReassignPenghuni, useDeletePenghuni } from './useMutations';
import { useToast } from '../context/ToastContext';
import logger from '../utils/logger';

/**
 * Hook untuk fetch penghuni dengan filter
 */
export const usePenghunis = (filters = {}) => {
    return useQuery({
        queryKey: ['penghunis', filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters).toString();
            const res = await apiClient.get(`/penghunis?${params}`);
            return res.data.data;
        },
        placeholderData: keepPreviousData,
        staleTime: 30000, // 30 Detik
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch available kamars
 */
export const useAvailableKamars = () => {
    return useQuery({
        queryKey: ['kamars'],
        queryFn: async () => {
            const res = await apiClient.get('/kamars');
            return res.data.data.filter(k => Number(k.is_available) === 1 || k.is_available === true);
        },
        staleTime: 300000, // 5 Menit
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch detail penghuni by ID
 */
export const usePenghuniDetail = (id) => {
    return useQuery({
        queryKey: ['penghuni-detail', id],
        queryFn: async () => {
            const res = await apiClient.get(`/penghunis/${id}`);
            return res.data.data;
        },
        enabled: !!id,
        staleTime: 300000, // 5 Menit
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch semua kamar (untuk edit - termasuk yang terisi)
 */
export const useAllKamarsForEdit = () => {
    return useQuery({
        queryKey: ['kamars-all'],
        queryFn: async () => {
            const res = await apiClient.get('/kamars');
            return res.data.data;
        },
        staleTime: 300000, // 5 Menit
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch draft invoice penghuni
 */
export const usePenghuniDraftInvoice = (penghuniId) => {
    return useQuery({
        queryKey: ['penghuni-draft-invoice', penghuniId],
        queryFn: async () => {
            const res = await apiClient.get(`/tagihans/draft/${penghuniId}`);
            return res.data.tagihan_id;
        },
        enabled: !!penghuniId,
        retry: 1,
    });
};

/**
 * Hook untuk fetch data kuitansi tagihan
 */
export const useKuitansiData = (tagihanId, enabled = false) => {
    return useQuery({
        queryKey: ['kuitansi-data', tagihanId],
        queryFn: async () => {
            const res = await apiClient.get(`/tagihans/${tagihanId}/kuitansi-data`);
            return res.data.data;
        },
        enabled: enabled && !!tagihanId,
        retry: 1,
    });
};

/**
 * Hook untuk fetch penghuni aktif (untuk transaksi)
 */
export const useActivePenghunis = () => {
    return useQuery({
        queryKey: ['penghunis', { status_sewa: 'Aktif' }],
        queryFn: async () => {
            const res = await apiClient.get('/penghunis?status_sewa=Aktif');
            return res.data.data;
        },
        staleTime: 300000, // 5 Menit
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk fetch semua penghuni (untuk edit transaksi - termasuk non-aktif)
 */
export const useAllPenghunis = () => {
    return useQuery({
        queryKey: ['penghunis-all'],
        queryFn: async () => {
            const res = await apiClient.get('/penghunis');
            return res.data.data;
        },
        staleTime: 300000, // 5 Menit
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook untuk aksi-aksi penghuni (Mutations Wrapper)
 */
export const usePenghuniActions = () => {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const checkoutMutation = useCheckoutPenghuni();
    const paymentMutation = useRecordPayment();
    const reassignMutation = useReassignPenghuni();
    const deleteMutation = useDeletePenghuni();

    const handleDelete = async (id, onSuccess) => {
        try {
            await deleteMutation.mutateAsync(id);
            showToast('Penghuni berhasil dihapus!', 'success');
            queryClient.invalidateQueries(['penghunis']);
            queryClient.invalidateQueries(['kamars']);
            if (onSuccess) onSuccess();
        } catch (err) {
            const message = err.response?.data?.message || "Gagal menghapus.";
            showToast(message, 'error');
        }
    };

    const handlePayment = async (id, duration, unit, onSuccess) => {
        if (duration <= 0) {
            showToast("Durasi pembayaran harus minimal 1.", 'error');
            return;
        }
        try {
            await paymentMutation.mutateAsync({ id, data: { duration, unit } });
            showToast(`Pembayaran ${duration} ${unit} berhasil dicatat!`, 'success');
            queryClient.invalidateQueries(['penghunis']);
            if (onSuccess) onSuccess();
        } catch (err) {
            const message = err.response?.data?.message || "Gagal mencatat pembayaran.";
            showToast(message, 'error');
        }
    };

    const handleCheckout = async (id, date, onSuccess) => {
        if (!date) {
            showToast("Tanggal keluar wajib diisi.", 'error');
            return;
        }
        try {
            await checkoutMutation.mutateAsync({ id, tanggal_keluar: date });
            showToast('Checkout berhasil! Kamar kini kosong.', 'success');
            queryClient.invalidateQueries(['penghunis']);
            queryClient.invalidateQueries(['kamars']);
            if (onSuccess) onSuccess();
        } catch (err) {
            let message = "Gagal checkout.";
            if (err.response?.data?.message) message = err.response.data.message;
            else if (err.response?.data?.errors) message = Object.values(err.response.data.errors).flat().join(', ');
            else if (err.message) message = err.message;
            showToast(message, 'error');
        }
    };

    const handleReassign = async (id, data, onSuccess) => {
        try {
            await reassignMutation.mutateAsync({
                id,
                data: {
                    new_kamar_id: data.newKamarId,
                    tanggal_masuk_baru: data.newTanggalMasuk,
                    initial_duration: data.initial_duration,
                    duration_unit: data.duration_unit,
                }
            });
            showToast('Penghuni berhasil diaktifkan kembali!', 'success');
            queryClient.invalidateQueries(['penghunis']);
            queryClient.invalidateQueries(['kamars']);
            if (onSuccess) onSuccess();
        } catch (err) {
            logger.error("Reassign Error:", err);
            const message = err.response?.data?.message || "Gagal mengaktifkan kembali.";
            showToast(message, 'error');
        }
    };

    return {
        handleDelete,
        handlePayment,
        handleCheckout,
        handleReassign,
        isDeleting: deleteMutation.isPending,
        isProcessingPayment: paymentMutation.isPending,
        isCheckingOut: checkoutMutation.isPending,
        isReassigning: reassignMutation.isPending
    };
};
