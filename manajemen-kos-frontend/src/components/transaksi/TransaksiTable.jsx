import React, { useMemo } from "react";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/dateUtils";
import { EditIcon, TrashIcon } from "../common/ui/Icons";

const TransaksiTable = ({
  transaksis,
  currentPage,
  perPage,
  debouncedSearch,
  onEdit,
  onDelete,
}) => {
  // Empty State Component
  const EmptyState = () => (
    <tr>
      <td colSpan="7" className="text-center py-12 text-gray-500">
        <div className="flex flex-col items-center justify-center space-y-3">
          <span className="text-4xl">🧾</span>
          <p className="text-lg font-medium text-gray-600">
            Data Tidak Ditemukan
          </p>
          <p className="text-sm">
            {debouncedSearch
              ? `Tidak ada transaksi yang cocok dengan "${debouncedSearch}".`
              : "Belum ada transaksi yang tercatat dalam periode ini."}
          </p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12"
            >
              No
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Tanggal
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Tipe
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Kategori
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Deskripsi
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Jumlah (Rp)
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transaksis.length === 0 ? (
            <EmptyState />
          ) : (
            transaksis.map((t, index) => {
              const isPemasukan = t.tipe_transaksi === "Pemasukan";
              return (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {(currentPage - 1) * perPage + index + 1}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(t.tanggal_transaksi)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isPemasukan
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {t.tipe_transaksi}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {t.kategori}
                    {t.account_code && (
                      <span className="block text-xs text-gray-400 mt-0.5 font-mono">
                        {t.account_code}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 relative group">
                    <div
                      className="text-sm font-medium text-gray-900 truncate max-w-xs"
                      title={t.deskripsi}
                    >
                      {t.deskripsi}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <span className="mr-1">👤</span>
                      {t.penghuni?.nama_lengkap ||
                        t.penghuni_name ||
                        "Operasional / Umum"}
                    </div>
                  </td>
                  <td
                    className={`px-5 py-4 whitespace-nowrap text-right text-sm font-bold ${isPemasukan ? "text-blue-600" : "text-red-600"}`}
                  >
                    {isPemasukan ? "+" : "-"} {formatCurrency(t.jumlah)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => onEdit(t.id)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                        title="Edit Transaksi"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Hapus Transaksi"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransaksiTable;
