// =================================================================
// CURRENCY FORMATTERS & CONVERTERS
// =================================================================

/**
 * Format angka menjadi mata uang Rupiah
 * Contoh: 1500000 -> Rp1.500.000
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * @deprecated Use formatCurrency instead
 * Kept for backward compatibility
 */
export const formatRupiah = formatCurrency;

/**
 * Format angka biasa
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

/**
 * Mengubah angka menjadi teks terbilang lengkap dalam bahasa Indonesia.
 * Contoh: 600000 -> Enam Ratus Ribu Rupiah
 * @param {number|string} number - Angka yang akan diubah.
 * @returns {string} Teks terbilang lengkap.
 */
export const numberToText = (number) => {
  const num = Math.floor(parseFloat(number) || 0);
  if (num === 0) return "Nol Rupiah";

  const units = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
  ];
  const teens = [
    "Sepuluh",
    "Sebelas",
    "Dua Belas",
    "Tiga Belas",
    "Empat Belas",
    "Lima Belas",
    "Enam Belas",
    "Tujuh Belas",
    "Delapan Belas",
    "Sembilan Belas",
  ];
  const tens = [
    "",
    "",
    "Dua Puluh",
    "Tiga Puluh",
    "Empat Puluh",
    "Lima Puluh",
    "Enam Puluh",
    "Tujuh Puluh",
    "Delapan Puluh",
    "Sembilan Puluh",
  ];

  const toWords = (n) => {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const tenDigit = Math.floor(n / 10);
      const unitDigit = n % 10;
      return tens[tenDigit] + (unitDigit !== 0 ? " " + units[unitDigit] : "");
    }
    if (n < 1000) {
      const hundredDigit = Math.floor(n / 100);
      const remainder = n % 100;
      return (
        units[hundredDigit] +
        " Ratus" +
        (remainder !== 0 ? " " + toWords(remainder) : "")
      );
    }
    if (n < 1000000) {
      const thousandDigit = Math.floor(n / 1000);
      const remainder = n % 1000;
      return (
        toWords(thousandDigit) +
        " Ribu" +
        (remainder !== 0 ? " " + toWords(remainder) : "")
      );
    }
    if (n < 1000000000) {
      const millionDigit = Math.floor(n / 1000000);
      const remainder = n % 1000000;
      return (
        toWords(millionDigit) +
        " Juta" +
        (remainder !== 0 ? " " + toWords(remainder) : "")
      );
    }
    return "Angka terlalu besar";
  };

  const result = toWords(num);
  let finalResult = result.replace(/Satu Ratus/g, "Seratus");
  finalResult = finalResult.replace(/Satu Ribu/g, "Seribu");
  return finalResult.trim() + " Rupiah";
};
