/**
 * Menghitung status kamar (Total, Tersedia, Terisi)
 * Berdasarkan logika: Kamar Terisi = Ada penghuni dengan status_sewa 'Aktif'
 *
 * @param {Array} allKamars - Array data kamar dari API (termasuk relasi penghuni)
 * @returns {Object} { total, available, occupied }
 */
export const hitungStatusKamar = (allKamars) => {
  if (!Array.isArray(allKamars)) {
    return { total: 0, available: 0, occupied: 0 };
  }

  const total = allKamars.length;

  // Kamar tersedia = TIDAK ada penghuni dengan status Aktif
  const available = allKamars.filter((k) => {
    return !k.penghuni || !k.penghuni.id || k.penghuni.status_sewa !== "Aktif";
  }).length;

  // Kamar terisi = ADA penghuni dengan status Aktif
  const occupied = allKamars.filter((k) => {
    return k.penghuni && k.penghuni.id && k.penghuni.status_sewa === "Aktif";
  }).length;

  return { total, available, occupied };
};
