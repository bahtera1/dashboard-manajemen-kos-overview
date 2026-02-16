import React, { memo } from "react";
import { getDaysRemaining, getContractStatus } from "../../utils/contractUtils";

const PenghuniTable = memo(function PenghuniTable({
  penghunis,
  onViewDetail,
  onEdit,
  onPayment,
  onCheckout,
  onReassign,
  onDelete,
  onOpenNotes,
}) {
  return (
    <div className="hidden md:block overflow-x-auto bg-white shadow-sm rounded-xl border border-gray-200 text-xs sm:text-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama & Kontak
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kamar
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pekerjaan
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status Kontrak
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              KTP & Emergency
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {penghunis.map((penghuni, index) => {
            const { daysRemaining, contractStatus } = penghuni._computed || {
              daysRemaining: getDaysRemaining(penghuni.masa_berakhir_sewa),
              contractStatus: getContractStatus(
                getDaysRemaining(penghuni.masa_berakhir_sewa),
              ),
            };

            return (
              <tr
                key={penghuni.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-2 py-2 text-sm text-gray-900 font-medium">
                  {index + 1}
                </td>

                <td className="px-2 py-2">
                  <div className="text-sm font-medium text-gray-900">
                    {penghuni.nama_lengkap}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    HP: {penghuni.no_hp}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px]">
                    Email: {penghuni.email}
                  </div>
                </td>

                <td className="px-2 py-2">
                  <div className="text-sm text-gray-900 font-semibold">
                    {penghuni.kamar?.nama_kamar || "-"}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Blok {penghuni.kamar?.blok} | Lt. {penghuni.kamar?.lantai}
                  </div>
                </td>

                <td className="px-2 py-2">
                  <div className="text-sm text-gray-800">
                    {penghuni.pekerjaan || "-"}
                  </div>
                  {penghuni.catatan ? (
                    <button
                      onClick={() => onOpenNotes(penghuni.catatan)}
                      className="text-xs text-blue-500 hover:text-blue-700 mt-1 underline"
                    >
                      Lihat Catatan
                    </button>
                  ) : (
                    <div className="text-xs text-gray-400">
                      Tidak ada catatan
                    </div>
                  )}
                </td>

                <td className="px-2 py-2 text-sm">
                  <div className="font-semibold text-gray-800">
                    Masuk: {penghuni.tanggal_masuk}
                  </div>
                  {penghuni.status_sewa === "Aktif" && (
                    <>
                      <div className="mt-1 text-xs text-gray-600">
                        Berakhir:{" "}
                        <span className="font-semibold">
                          {penghuni.masa_berakhir_sewa || "N/A"}
                        </span>
                      </div>
                      {contractStatus && (
                        <div
                          className={`mt-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${contractStatus.color}`}
                        >
                          <span className="mr-1">{contractStatus.icon}</span>
                          {contractStatus.text}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Bayar Terakhir: {penghuni.durasi_bayar_terakhir || 0}{" "}
                        {penghuni.unit_bayar_terakhir || "bulan"}
                      </div>
                    </>
                  )}
                </td>

                <td className="px-2 py-2">
                  <div className="text-xs text-gray-900">
                    KTP: {penghuni.no_ktp}
                  </div>
                  <div className="text-[10px] text-gray-500 italic">
                    PIC: {penghuni.pic_emergency}
                  </div>
                </td>

                <td className="px-2 py-2">
                  <span
                    className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${penghuni.status_sewa === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {penghuni.status_sewa}
                  </span>
                </td>

                <td className="px-2 py-2">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => onViewDetail(penghuni.id)}
                      className="w-full text-xs py-1 px-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap"
                    >
                      Detail
                    </button>

                    {penghuni.status_sewa === "Aktif" ? (
                      <>
                        <button
                          onClick={() => onPayment(penghuni.id)}
                          className="w-full text-xs py-1 px-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                        >
                          Perpanjang
                        </button>
                        <button
                          onClick={() => onEdit(penghuni.id)}
                          className="w-full text-xs py-1 px-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onCheckout(penghuni.id)}
                          className="w-full text-xs py-1 px-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors font-medium whitespace-nowrap"
                        >
                          Checkout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onReassign(penghuni.id)}
                          className="w-full text-xs py-1 px-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium whitespace-nowrap"
                        >
                          Sewa Lagi
                        </button>
                        <button
                          onClick={() => onDelete(penghuni.id)}
                          className="w-full text-xs py-1 px-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium whitespace-nowrap"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default PenghuniTable;
