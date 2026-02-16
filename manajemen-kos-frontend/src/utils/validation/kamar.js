import { validatePrice } from './common';

/**
 * Validasi nama kamar
 */
export const validateNamaKamar = (namaKamar) => {
    if (!namaKamar || namaKamar.trim() === '') return { valid: false, message: 'Nama kamar wajib diisi' };
    if (namaKamar.length > 50) return { valid: false, message: 'Nama kamar maksimal 50 karakter' };
    return { valid: true };
};

/**
 * Validasi blok
 */
export const validateBlok = (blok) => {
    if (!blok || blok.trim() === '') return { valid: false, message: 'Blok wajib diisi' };
    if (blok.length > 10) return { valid: false, message: 'Blok maksimal 10 karakter' };
    return { valid: true };
};

/**
 * Validasi luas kamar
 */
export const validateLuasKamar = (luas) => {
    if (!luas || luas.trim() === '') return { valid: false, message: 'Luas kamar wajib diisi' };
    if (luas.length > 50) return { valid: false, message: 'Luas kamar maksimal 50 karakter' };
    return { valid: true };
};

/**
 * Validasi form Kamar
 */
export const validateKamarForm = (formData) => {
    const errors = {};

    // Validasi nama kamar
    const nameValidation = validateNamaKamar(formData.nama_kamar);
    if (!nameValidation.valid) errors.nama_kamar = nameValidation.message;

    // Validasi harga
    const priceValidation = validatePrice(formData.harga_bulanan, 'Harga bulanan');
    if (!priceValidation.valid) errors.harga_bulanan = priceValidation.message;

    // Validasi luas kamar
    const luasValidation = validateLuasKamar(formData.luas_kamar);
    if (!luasValidation.valid) errors.luas_kamar = luasValidation.message;

    // Validasi blok
    const blokValidation = validateBlok(formData.blok);
    if (!blokValidation.valid) errors.blok = blokValidation.message;

    // Validasi lantai
    if (!formData.lantai || formData.lantai === '') {
        errors.lantai = 'Lantai wajib diisi';
    } else {
        const lantaiNum = parseInt(formData.lantai);
        if (isNaN(lantaiNum) || lantaiNum < 0) {
            errors.lantai = 'Lantai harus berupa angka positif';
        }
    }

    // Validasi type
    if (!formData.type || formData.type === '') {
        errors.type = 'Tipe kamar wajib dipilih';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};
