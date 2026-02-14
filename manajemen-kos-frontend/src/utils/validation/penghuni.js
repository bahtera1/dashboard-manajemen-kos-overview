import { validateName, validateNIK, validatePhoneNumber, validateEmail, validateDuration } from './common';

/**
 * Validasi pekerjaan
 */
export const validatePekerjaan = (pekerjaan) => {
    if (!pekerjaan || pekerjaan.trim() === '') return { valid: true }; // Pekerjaan optional
    if (pekerjaan.length > 100) return { valid: false, message: 'Pekerjaan maksimal 100 karakter' };
    return { valid: true };
};

/**
 * Validasi form Penghuni
 */
export const validatePenghuniForm = (formData) => {
    const errors = {};

    // Validasi nama
    const nameValidation = validateName(formData.nama_lengkap, 'Nama lengkap');
    if (!nameValidation.valid) errors.nama_lengkap = nameValidation.message;

    // Validasi NIK
    const nikValidation = validateNIK(formData.no_ktp);
    if (!nikValidation.valid) errors.no_ktp = nikValidation.message;

    // Validasi HP
    const phoneValidation = validatePhoneNumber(formData.no_hp);
    if (!phoneValidation.valid) errors.no_hp = phoneValidation.message;

    // Validasi Email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) errors.email = emailValidation.message;

    // Validasi Pekerjaan
    const pekerjaanValidation = validatePekerjaan(formData.pekerjaan);
    if (!pekerjaanValidation.valid) errors.pekerjaan = pekerjaanValidation.message;

    // Validasi PIC Emergency
    const picValidation = validateName(formData.pic_emergency, 'PIC Emergency');
    if (!picValidation.valid) errors.pic_emergency = picValidation.message;

    if (!formData.kamar_id) errors.kamar_id = 'Kamar wajib dipilih';

    if (!formData.tanggal_masuk || formData.tanggal_masuk.trim() === '') {
        errors.tanggal_masuk = 'Tanggal masuk wajib diisi';
    }

    // Validasi Durasi (jika ada)
    if (formData.initial_duration) {
        const durationValidation = validateDuration(formData.initial_duration, 'Durasi sewa');
        if (!durationValidation.valid) errors.initial_duration = durationValidation.message;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};
