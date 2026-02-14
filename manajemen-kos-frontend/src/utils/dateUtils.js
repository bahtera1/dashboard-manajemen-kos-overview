/**
 * Mengkonversi periode filter cepat (month, year, all) menjadi
 * objek tanggal mulai dan tanggal akhir yang siap untuk API.
 *
 * @param {string} period - 'month', 'year', 'all', 'custom'
 * @returns {object} { start_date, end_date }
 */
export const getFilterDates = (period) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  let startDate = "";

  if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  } else if (period === "year") {
    startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
  } else if (period === "all") {
    startDate = "";
  }

  return { start_date: startDate, end_date: today };
};

/**
 * Memformat string tanggal (YYYY-MM-DD) ke format lokal (Indonesia).
 * Contoh: 2025-11-20 -> 20 November 2025
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
