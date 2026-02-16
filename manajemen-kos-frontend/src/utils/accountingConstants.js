export const CHART_OF_ACCOUNTS = [
  // ASET
  {
    code: "1-111",
    name: "Kas",
    description: "Kas, Aset, Debit, Uang tunai dan saldo bank",
  },
  {
    code: "1-112",
    name: "Piutang",
    description:
      "Piutang Sewa, Aset, Debit, Tagihan sewa yang belum dibayar penghuni",
  },
  {
    code: "1-113",
    name: "Persediaan",
    description:
      "Persediaan, Aset, Debit, Barang habis pakai untuk operasional",
  },
  {
    code: "1-114",
    name: "Deposit Listrik",
    description: "Deposit Listrik, Aset, Debit, Deposit ke PLN",
  },
  {
    code: "1-115",
    name: "Deposit Air",
    description: "Deposit Air, Aset, Debit, Deposit ke PDAM",
  },
  {
    code: "1-211",
    name: "Peralatan",
    description: "Peralatan Kos, Aset, Debit, AC, kasur, lemari, dll",
  },
  {
    code: "1-212",
    name: "Tanah dan Bangunan",
    description: "Tanah dan Bangunan, Aset, Debit, Gedung dan tanah kos",
  },
  {
    code: "1-213",
    name: "Penyusutan",
    description: "Akumulasi Penyusutan, Aset, Kredit, Penyusutan aset tetap",
  },

  // KEWAJIBAN
  {
    code: "2-111",
    name: "Hutang Usaha",
    description: "Hutang Usaha, Kewajiban, Kredit, Hutang ke supplier",
  },
  {
    code: "2-112",
    name: "Hutang Bank",
    description: "Hutang Bank, Kewajiban, Kredit, Kredit bank",
  },
  {
    code: "2-113",
    name: "Deposit Penghuni",
    description: "Deposit Penghuni, Kewajiban, Kredit, Uang jaminan penghuni",
  },
  {
    code: "2-114",
    name: "Hutang Pajak",
    description: "Hutang Pajak, Kewajiban, Kredit, Pajak yang belum dibayar",
  },

  // MODAL
  {
    code: "3-111",
    name: "Modal",
    description: "Modal Pemilik, Modal, Kredit, Modal awal pemilik",
  },
  {
    code: "3-112",
    name: "Laba Ditahan",
    description:
      "Laba Ditahan, Modal, Kredit, Akumulasi laba periode sebelumnya",
  },
  {
    code: "3-211",
    name: "Prive",
    description: "Prive, Modal, Debit, Pengambilan pribadi pemilik",
  },

  // PENDAPATAN
  {
    code: "4-111",
    name: "Pendapatan",
    description: "Pendapatan Sewa, Pendapatan, Kredit, Pendapatan sewa kamar",
  },
  {
    code: "4-112",
    name: "Pendapatan Listrik",
    description:
      "Pendapatan Listrik, Pendapatan, Kredit, Pendapatan listrik dari penghuni",
  },
  {
    code: "4-113",
    name: "Pendapatan Air",
    description:
      "Pendapatan Air, Pendapatan, Kredit, Pendapatan air dari penghuni",
  },
  {
    code: "4-114",
    name: "Pendapatan Loundry",
    description: "Pendapatan Laundry, Pendapatan, Kredit, Jasa laundry",
  },
  {
    code: "4-115",
    name: "Pendapatan Lain-Lain",
    description: "Pendapatan Lain-lain, Pendapatan, Kredit, Pendapatan lainnya",
  },

  // BEBAN
  {
    code: "5-111",
    name: "Beban Gaji",
    description: "Beban Gaji, Beban, Debit, Gaji karyawan",
  },
  {
    code: "5-112",
    name: "Beban Listrik",
    description: "Beban Listrik, Beban, Debit, Tagihan listrik",
  },
  {
    code: "5-113",
    name: "Beban Air",
    description: "Beban Air, Beban, Debit, Tagihan PDAM",
  },
  {
    code: "5-114",
    name: "Beban Internet",
    description: "Beban Internet, Beban, Debit, Biaya internet",
  },
  {
    code: "5-115",
    name: "Beban Pemeliharaan",
    description: "Beban Pemeliharaan, Beban, Debit, Perbaikan dan maintenance",
  },
  {
    code: "5-116",
    name: "Beban ATK",
    description: "Beban ATK, Beban, Debit, Alat tulis kantor",
  },
  {
    code: "5-117",
    name: "Beban Pajak",
    description: "Beban Pajak, Beban, Debit, Pajak bumi dan bangunan",
  },
  {
    code: "5-118",
    name: "Beban Asuransi",
    description: "Beban Asuransi, Beban, Debit, Premi asuransi",
  },
  {
    code: "5-119",
    name: "Beban Penyusutan",
    description: "Beban Penyusutan, Beban, Debit, Penyusutan aset",
  },
  {
    code: "5-120",
    name: "Lainnya",
    description: "Beban Operasional Lainnya, Beban, Debit, Beban lain-lain",
  },
];

export const CASH_FLOW_INDEX = [
  { id: 0, label: "-- Pilih Index Arus Kas (Opsional) --" },
  { id: 1, label: "1 - Arus Kas Operasi" },
  { id: 2, label: "2 - Arus Kas Investasi" },
  { id: 3, label: "3 - Arus Kas Pendanaan" },
];

export const TRANSACTION_CATEGORIES = {
  INCOME: [
    "Sewa Tahunan",
    "Sewa Bulanan",
    "Sewa Mingguan/Harian",
    "Denda",
    "Lain-lain Pemasukan",
  ],
  EXPENSE: [
    "Listrik Kamar",
    "PDAM Kamar",
    "Pemeliharaan",
    "Kebersihan",
    "Penggantian Alat - Materi",
    "Listrik Umum",
    "Daya Pompa Air",
    "PDAM Air Umum",
    "Gaji Karyawan",
    "Satpam",
    "Pajak & Izin Usaha",
    "Administrasi",
    "Internet Bersama",
    "Pemeliharaan Umum",
    "Perbaikan Atap Bocor",
    "Asuransi",
    "Promosi",
    "Pembangunan - Material",
    "Pembangunan - Upah",
    "Renovasi - Material",
    "Renovasi - Upah",
    "Pemeliharaan CCTV",
    "Pengadaan CCTV Baru - Material",
    "Pengadaan CCTV Baru - Upah",
    "Biaya Lain-lain(Tak Terduga)",
  ],
};
