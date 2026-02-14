/**
 * Menghitung sisa hari dari tanggal berakhir kontrak
 * @param {string} endDate - Tanggal berakhir kontrak
 * @returns {number|null} Jumlah hari tersisa (negatif jika sudah lewat)
 */
export const getDaysRemaining = (endDate) => {
  if (!endDate) return null;

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const end = new Date(new Date(endDate).setHours(0, 0, 0, 0));
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Mendapatkan status kontrak berdasarkan sisa hari
 * @param {number} daysRemaining - Sisa hari kontrak
 * @returns {object|null} Object berisi text, color, dan icon
 */
export const getContractStatus = (daysRemaining) => {
  if (daysRemaining === null) return null;

  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return {
      text: `${overdueDays} Hari Lewat Jatuh Tempo`,
      color: "bg-red-100 text-red-800 border-red-300",
      icon: "⚠️",
    };
  } else if (daysRemaining === 0) {
    return {
      text: "Jatuh Tempo Hari Ini",
      color: "bg-red-100 text-red-800 border-red-300",
      icon: "🔴",
    };
  } else if (daysRemaining <= 7) {
    return {
      text: `${daysRemaining} Hari Lagi`,
      color: "bg-orange-100 text-orange-800 border-orange-300",
      icon: "⏰",
    };
  } else if (daysRemaining <= 14) {
    return {
      text: `${daysRemaining} Hari Lagi`,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: "📅",
    };
  } else {
    return {
      text: `${daysRemaining} Hari Lagi`,
      color: "bg-green-100 text-green-800 border-green-300",
      icon: "✅",
    };
  }
};
