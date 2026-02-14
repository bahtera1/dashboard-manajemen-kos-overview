/**
 * Validasi NIK (Nomor Induk Kependudukan)
 * NIK standar Indonesia: 16 digit angka
 */
export const validateNIK = (nik) => {
    if (!nik || nik.trim() === '') return { valid: false, message: 'NIK wajib diisi' };
    const nikClean = nik.replace(/\s/g, '');
    if (!/^\d+$/.test(nikClean)) return { valid: false, message: 'NIK hanya boleh berisi angka' };
    if (nikClean.length !== 16) return { valid: false, message: 'NIK harus 16 digit' };
    if (nikClean.length > 17) return { valid: false, message: 'NIK maksimal 17 karakter' };
    return { valid: true };
};

/**
 * Validasi nomor HP
 * Format: 08xx atau +62xxx
 */
export const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') return { valid: false, message: 'Nomor HP wajib diisi' };
    const phoneClean = phone.replace(/[\s-]/g, '');
    if (phoneClean.length > 16) return { valid: false, message: 'Nomor HP maksimal 16 karakter' };
    if (!/^(\+)?\d+$/.test(phoneClean)) return { valid: false, message: 'Nomor HP hanya boleh berisi angka' };
    if (phoneClean.length < 9) return { valid: false, message: 'Nomor HP minimal 9 digit' };
    return { valid: true };
};

/**
 * Validasi email
 */
export const validateEmail = (email) => {
    if (!email || email.trim() === '') return { valid: true };
    if (email.length > 150) return { valid: false, message: 'Email maksimal 150 karakter' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { valid: false, message: 'Format email tidak valid' };
    return { valid: true };
};

/**
 * Validasi nama (tidak boleh kosong, minimal 3 karakter)
 */
export const validateName = (name, fieldName = 'Nama') => {
    if (!name || name.trim() === '') return { valid: false, message: `${fieldName} wajib diisi` };
    if (name.trim().length < 3) return { valid: false, message: `${fieldName} minimal 3 karakter` };
    if (name.trim().length > 150) return { valid: false, message: `${fieldName} maksimal 150 karakter` };
    return { valid: true };
};

/**
 * Validasi harga/jumlah uang (harus positif)
 */
export const validatePrice = (price, fieldName = 'Harga') => {
    if (!price || price === '' || price === '0') return { valid: false, message: `${fieldName} wajib diisi` };
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return { valid: false, message: `${fieldName} harus berupa angka` };
    if (priceNum <= 0) return { valid: false, message: `${fieldName} harus lebih dari 0` };
    if (priceNum > 99999999.99) return { valid: false, message: `${fieldName} terlalu besar (max 99,999,999.99)` };
    return { valid: true };
};

/**
 * Validasi tanggal (tidak boleh kosong)
 */
export const validateDate = (date, fieldName = 'Tanggal') => {
    if (!date || date.trim() === '') return { valid: false, message: `${fieldName} wajib diisi` };
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return { valid: false, message: `${fieldName} tidak valid` };
    return { valid: true };
};

/**
 * Validasi tanggal tidak boleh di masa depan
 */
export const validateDateNotFuture = (date, fieldName = 'Tanggal') => {
    const basicValidation = validateDate(date, fieldName);
    if (!basicValidation.valid) return basicValidation;
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateObj > today) return { valid: false, message: `${fieldName} tidak boleh di masa depan` };
    return { valid: true };
};

/**
 * Validasi durasi (harus integer positif)
 */
export const validateDuration = (duration, fieldName = 'Durasi') => {
    if (!duration || duration === '' || duration === '0') return { valid: false, message: `${fieldName} wajib diisi` };
    const durationNum = parseInt(duration);
    if (isNaN(durationNum)) return { valid: false, message: `${fieldName} harus berupa angka` };
    if (durationNum <= 0) return { valid: false, message: `${fieldName} harus lebih dari 0` };
    if (durationNum > 120) return { valid: false, message: `${fieldName} maksimal 120` };
    return { valid: true };
};
