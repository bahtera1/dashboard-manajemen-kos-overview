import { validatePrice, validateDateNotFuture } from './common';

/**
 * Validasi form Transaksi
 */
export const validateTransaksiForm = (formData) => {
    const errors = {};

    // Validasi tipe transaksi
    if (!formData.tipe_transaksi) errors.tipe_transaksi = 'Tipe transaksi wajib dipilih';

    // Validasi kategori
    if (!formData.kategori || formData.kategori.trim() === '') {
        errors.kategori = 'Kategori wajib diisi';
    } else if (formData.kategori.length > 100) {
        errors.kategori = 'Kategori maksimal 100 karakter';
    }

    // Validasi deskripsi
    if (!formData.deskripsi || formData.deskripsi.trim() === '') errors.deskripsi = 'Deskripsi wajib diisi';

    // Validasi jumlah
    const amountValidation = validatePrice(formData.jumlah, 'Jumlah');
    if (!amountValidation.valid) errors.jumlah = amountValidation.message;

    // Validasi tanggal
    const dateValidation = validateDateNotFuture(formData.tanggal_transaksi, 'Tanggal transaksi');
    if (!dateValidation.valid) errors.tanggal_transaksi = dateValidation.message;

    // Validasi Account Code
    if (formData.account_code && formData.account_code.length > 255) {
        errors.account_code = 'Kode akun terlalu panjang (maksimal 255 karakter)';
    }

    // Validasi Cash Flow Index
    if (formData.cash_flow_index !== undefined && formData.cash_flow_index !== null && formData.cash_flow_index !== '') {
        const indexNum = parseInt(formData.cash_flow_index);
        if (isNaN(indexNum)) errors.cash_flow_index = 'Index arus kas harus berupa angka';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};
