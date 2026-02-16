import React from "react";

import { formatCurrency } from "../../utils/currency";

/**
 * Widget yang menampilkan perbandingan Pemasukan dan Pengeluaran dalam bentuk Diagram Batang.
 * @param {object} report - Objek laporan laba rugi ({pemasukan, pengeluaran, laba_rugi})
 */
const FinancialChartWidget = ({ report }) => {
  const { pemasukan, pengeluaran, laba_rugi } = report;

  const maxValue = Math.max(pemasukan, pengeluaran, 1);

  // Hitung tinggi batang sebagai persentase dari nilai maksimum
  const incomeHeight = (pemasukan / maxValue) * 100;
  const expenseHeight = (pengeluaran / maxValue) * 100;

  // Tentukan warna label laba rugi
  const profitColor = laba_rugi >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800">
        Visualisasi Laba Rugi Periode Ini
      </h3>

      {/* 🚨 VISUALISASI DIAGRAM BATANG VERTICAL (LEBIH LEBAR DAN DETAIL) */}
      <div className="flex justify-evenly items-end h-40 w-full pt-2 gap-10">
        {/* Batang Pemasukan */}
        <div className="flex flex-col items-center h-full w-20">
          {/* Nilai di atas batang */}
          <p className="text-xs font-semibold text-blue-600 mb-1 absolute top-0 transform -translate-y-full">
            {formatCurrency(pemasukan)}
          </p>

          <div
            className="w-full bg-gray-200 rounded-t-lg flex items-end overflow-hidden"
            style={{ height: "100%" }}
          >
            <div
              style={{ height: `${incomeHeight}%` }}
              className="w-full bg-blue-500 transition-all duration-700 ease-out"
            ></div>
          </div>
          <p className="text-xs font-semibold text-gray-700 mt-1 whitespace-nowrap">
            Pemasukan
          </p>
        </div>

        {/* Batang Pengeluaran */}
        <div className="flex flex-col items-center h-full w-20">
          {/* Nilai di atas batang */}
          <p className="text-xs font-semibold text-red-600 mb-1 absolute top-0 transform -translate-y-full">
            {formatCurrency(pengeluaran)}
          </p>

          <div
            className="w-full bg-gray-200 rounded-t-lg flex items-end overflow-hidden"
            style={{ height: "100%" }}
          >
            <div
              style={{ height: `${expenseHeight}%` }}
              className="w-full bg-red-500 transition-all duration-700 ease-out"
            ></div>
          </div>
          <p className="text-xs font-semibold text-gray-700 mt-1 whitespace-nowrap">
            Pengeluaran
          </p>
        </div>
      </div>
      {/* ---------------------------------------------------- */}

      {/* Detail Data Ringkasan (dipertahankan) */}
      <div className="grid grid-cols-3 gap-4 text-sm border-t pt-3">
        <div>
          <p className="text-xs text-gray-500">Pemasukan</p>
          <p className="font-semibold text-blue-600">
            {formatCurrency(pemasukan)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Pengeluaran</p>
          <p className="font-semibold text-red-600">
            {formatCurrency(pengeluaran)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-700">Laba Bersih</p>
          <p className={`font-bold text-lg ${profitColor}`}>
            {formatCurrency(laba_rugi)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialChartWidget;
