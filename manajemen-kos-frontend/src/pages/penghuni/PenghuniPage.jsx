import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePenghunis, useAvailableKamars, usePenghuniActions } from '../../hooks/usePenghunis';
import { getDaysRemaining, getContractStatus } from '../../utils/contractUtils';
import { useToast } from '../../context/ToastContext';
import logger from '../../utils/logger';

import ConfirmModal from '../../components/common/modals/ConfirmModal';
import CheckoutModal from '../../components/penghuni/CheckoutModal';
import PaymentModal from '../../components/penghuni/PaymentModal';
import ReassignModal from '../../components/penghuni/ReassignModal';
import NotesDetailModal from '../../components/common/modals/NotesDetailModal';
import FullScreenLoader from '../../components/common/ui/FullScreenLoader';
import PenghuniMobileCard from '../../components/penghuni/PenghuniMobileCard';

import PenghuniFilters from '../../components/penghuni/PenghuniFilters';
import PenghuniTable from '../../components/penghuni/PenghuniTable';

const PenghuniPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // --- State Management ---
    const [statusFilter, setStatusFilter] = useState('Aktif');

    // Search States (Debounce)
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal States
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [currentNotes, setCurrentNotes] = useState('');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [checkoutId, setCheckoutId] = useState(null);
    const [checkoutDate, setCheckoutDate] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentId, setPaymentId] = useState(null);
    const [paymentDuration, setPaymentDuration] = useState(1);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [reassignData, setReassignData] = useState({
        penghuniId: null,
        newKamarId: '',
        newTanggalMasuk: '',
        initialDuration: 1
    });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [penghuniToDelete, setPenghuniToDelete] = useState(null);

    // Debounce Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Build query filters object
    const queryFilters = {};
    if (debouncedSearch) queryFilters.search = debouncedSearch;
    if (statusFilter && statusFilter !== 'Semua') queryFilters.status_sewa = statusFilter;

    // --- Actions Hook ---
    const { handleDelete, handlePayment, handleCheckout, handleReassign } = usePenghuniActions();

    // --- Data Fetching (TanStack Query) ---
    const {
        data: penghunis = [],
        isLoading: penghunisLoading,
        isFetching: isFetchingPenghuni,
        error: penghunisError,
        refetch
    } = usePenghunis(queryFilters);

    const { data: availableKamars = [], isLoading: kamarsLoading, error: kamarsError } = useAvailableKamars();

    // Performance: Memoize computed values
    const enrichedPenghunis = useMemo(() => {
        return penghunis.map(p => ({
            ...p,
            _computed: {
                daysRemaining: getDaysRemaining(p.masa_berakhir_sewa),
                contractStatus: getContractStatus(getDaysRemaining(p.masa_berakhir_sewa))
            }
        }));
    }, [penghunis]);

    // Initial Loading vs Background Loading
    // FullScreenLoader hanya muncul saat data pertama kali dimuat (belum ada cache)
    const isInitialLoading = (penghunisLoading && !penghunis.length) || kamarsLoading;
    const error = penghunisError || kamarsError;

    // Effect: Reload data jika navigasi membawa state reload (misal dari CreatePage)
    useEffect(() => {
        if (location.state?.reload) {
            queryClient.invalidateQueries(['penghunis']);
            refetch();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, queryClient, refetch, navigate, location.pathname]);

    // Error Handling
    useEffect(() => {
        if (error) {
            logger.error("Gagal mengambil data:", error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('authToken');
                navigate('/login', { replace: true });
            } else {
                showToast('Gagal memuat data penghuni.', 'error');
            }
        }
    }, [error, navigate, showToast]);

    // --- Event Handlers (UI Only) ---

    const openNotesModal = (notes) => {
        setCurrentNotes(notes);
        setIsNotesModalOpen(true);
    };

    const handleEdit = (id) => navigate(`/penghuni/edit/${id}`);
    const handleViewDetail = (id) => navigate(`/penghuni/detail/${id}`);

    const confirmDelete = (id) => {
        setPenghuniToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const onConfirmDelete = () => {
        if (penghuniToDelete) {
            handleDelete(penghuniToDelete, () => {
                setIsConfirmModalOpen(false);
                setPenghuniToDelete(null);
            });
        }
    };

    const openPaymentModal = (id) => {
        setPaymentId(id);
        const target = penghunis.find(p => p.id === id);
        setPaymentDuration(target?.durasi_bayar_terakhir || 1);
        setIsPaymentModalOpen(true);
    };

    const onProcessPayment = (e, duration, durationUnit) => {
        e.preventDefault();
        handlePayment(paymentId, duration, durationUnit, () => {
            setIsPaymentModalOpen(false);
        });
    };

    const openCheckoutModal = (id) => {
        setCheckoutId(id);
        setCheckoutDate(new Date().toISOString().split('T')[0]);
        setIsCheckoutModalOpen(true);
    };

    const onProcessCheckout = (e) => {
        e.preventDefault();
        handleCheckout(checkoutId, checkoutDate, () => {
            setIsCheckoutModalOpen(false);
        });
    };

    const openReassignModal = (penghuniId) => {
        queryClient.invalidateQueries(['kamars']);

        const targetPenghuni = penghunis.find(p => p.id === penghuniId);

        setReassignData({
            penghuniId: penghuniId,
            newKamarId: '',
            newTanggalMasuk: new Date().toISOString().split('T')[0],
            initialDuration: targetPenghuni?.durasi_bayar_terakhir || 1,
            duration_unit: targetPenghuni?.unit_bayar_terakhir || 'month'
        });
        setIsReassignModalOpen(true);
    };

    const onProcessReassign = (e, dataToSend) => {
        e.preventDefault();
        handleReassign(dataToSend.penghuniId, dataToSend, () => {
            setIsReassignModalOpen(false);
        });
    };

    // --- UI RENDER ---

    if (isInitialLoading) {
        return <FullScreenLoader message="Memuat data Penghuni..." />;
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🧑 Manajemen Penghuni</h1>
                <p className="text-sm sm:text-base text-gray-600">Kelola data penghuni dan pantau status kontrak sewa</p>

                <div className="mt-4 flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100 items-center max-w-fit">
                    <span className="flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                        <span><strong>Aktif</strong> = Sedang menempati kamar</span>
                    </span>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span className="flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span>
                        <span><strong>Tidak Aktif</strong> = Sudah selesai/tidak menempati kamar</span>
                    </span>
                </div>
            </div>

            <PenghuniFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isSearching={isFetchingPenghuni}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onAddPenghuni={() => navigate('/penghuni/create')}
            />

            {/* Content List */}
            {enrichedPenghunis.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm">
                    <div className="text-5xl sm:text-6xl mb-4">📋</div>
                    <p className="text-gray-500 text-base sm:text-lg mb-6 px-4">
                        {statusFilter === 'Semua' && !debouncedSearch
                            ? 'Belum ada data penghuni yang tersimpan.'
                            : `Tidak ada penghuni yang cocok dengan pencarian.`}
                    </p>
                    {statusFilter === 'Semua' && !debouncedSearch && (
                        <button
                            onClick={() => navigate('/penghuni/create')}
                            className="px-6 py-3 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                        >
                            Tambah Penghuni Pertama
                        </button>
                    )}
                </div>
            ) : (
                <div className={`transition-opacity duration-200 ${isFetchingPenghuni ? 'opacity-50' : 'opacity-100'}`}>
                    <PenghuniTable
                        penghunis={enrichedPenghunis}
                        onViewDetail={handleViewDetail}
                        onEdit={handleEdit}
                        onPayment={openPaymentModal}
                        onCheckout={openCheckoutModal}
                        onReassign={openReassignModal}
                        onDelete={confirmDelete}
                        onOpenNotes={openNotesModal}
                    />

                    {/* Mobile View: Cards */}
                    {/* Shown on small screens, hidden on md and up */}
                    <div className="block md:hidden space-y-3">
                        {enrichedPenghunis.map((penghuni, index) => (
                            <PenghuniMobileCard
                                key={penghuni.id}
                                penghuni={penghuni}
                                index={index}
                                onViewDetail={handleViewDetail}
                                onOpenNotes={openNotesModal}
                                onEdit={handleEdit}
                                onPayment={openPaymentModal}
                                onCheckout={openCheckoutModal}
                                onReassign={openReassignModal}
                                onDelete={confirmDelete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modals Section */}
            {isPaymentModalOpen && (
                <PaymentModal
                    onSubmit={onProcessPayment}
                    onClose={() => setIsPaymentModalOpen(false)}
                    duration={paymentDuration}
                    setDuration={setPaymentDuration}
                />
            )}
            {isCheckoutModalOpen && (
                <CheckoutModal
                    onSubmit={onProcessCheckout}
                    onClose={() => setIsCheckoutModalOpen(false)}
                    date={checkoutDate}
                    setDate={setCheckoutDate}
                />
            )}
            {isReassignModalOpen && (
                <ReassignModal
                    data={reassignData}
                    setData={setReassignData}
                    availableKamars={availableKamars}
                    onSubmit={onProcessReassign}
                    onClose={() => setIsReassignModalOpen(false)}
                />
            )}
            {isConfirmModalOpen && (
                <ConfirmModal
                    message="Apakah Anda yakin ingin menghapus data penghuni ini secara permanen? Tindakan ini hanya boleh dilakukan jika tidak ada riwayat transaksi."
                    onConfirm={onConfirmDelete}
                    onCancel={() => setIsConfirmModalOpen(false)}
                    confirmText="Ya, Hapus Permanen"
                    cancelText="Batal"
                    isDanger={true}
                />
            )}
            {isNotesModalOpen && (
                <NotesDetailModal notes={currentNotes} onClose={() => setIsNotesModalOpen(false)} />
            )}
        </div >
    );
};

export default PenghuniPage;
