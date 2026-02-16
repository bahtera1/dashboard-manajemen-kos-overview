import React, { memo } from "react";
import { getDaysRemaining, getContractStatus } from "../../utils/contractUtils";

const PenghuniMobileCard = memo(function PenghuniMobileCard({
  penghuni,
  index,
  onViewDetail,
  onOpenNotes,
  onEdit,
  onPayment,
  onCheckout,
  onReassign,
  onDelete,
}) {
  const daysRemaining = getDaysRemaining(penghuni.masa_berakhir_sewa);
  const contractStatus = getContractStatus(daysRemaining);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Card Header - Compact */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-gray-500 font-medium">
              #{index + 1}
            </span>
            <h3 className="font-bold text-sm text-gray-900 truncate">
              {penghuni.nama_lengkap}
            </h3>
            <span
              className={`px-1.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${penghuni.status_sewa === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {penghuni.status_sewa}
            </span>
          </div>
          <button
            onClick={() => onViewDetail(penghuni.id)}
            className="ml-2 py-1 px-2 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium transition-colors whitespace-nowrap shrink-0"
          >
            📄
          </button>
        </div>
      </div>

      {/* Card Body - Compact Grid */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          {/* Nama & Kontak */}
          <div className="col-span-2 pb-2 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500 font-medium">HP:</span>
                <div className="font-medium text-gray-900">
                  {penghuni.no_hp}
                </div>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Email:</span>
                <div className="text-gray-700 break-all">{penghuni.email}</div>
              </div>
            </div>
          </div>

          {/* Kamar */}
          <div>
            <span className="text-gray-500 font-medium block mb-0.5">
              Kamar
            </span>
            <div className="font-semibold text-blue-700">
              {penghuni.kamar?.nama_kamar || "-"}
            </div>
            <div className="text-gray-500">
              Blok {penghuni.kamar?.blok} | Lt. {penghuni.kamar?.lantai}
            </div>
          </div>

          {/* Pekerjaan */}
          <div>
            <span className="text-gray-500 font-medium block mb-0.5">
              Pekerjaan
            </span>
            <div className="text-gray-900">{penghuni.pekerjaan || "-"}</div>
            {penghuni.catatan ? (
              <button
                onClick={() => onOpenNotes(penghuni.catatan)}
                className="text-blue-600 hover:text-blue-800 underline mt-0.5"
              >
                Lihat Catatan
              </button>
            ) : (
              <div className="text-gray-400 text-xs">Tanpa catatan</div>
            )}
          </div>

          {/* Status Kontrak */}
          <div className="col-span-2 pt-2 border-t border-gray-100">
            <span className="text-gray-500 font-medium block mb-1">
              Status Kontrak
            </span>
            <div className="space-y-1">
              <div>
                <span className="text-gray-600">Masuk:</span>
                <span className="ml-1 font-semibold text-gray-900">
                  {penghuni.tanggal_masuk}
                </span>
              </div>
              {penghuni.status_sewa === "Aktif" && (
                <>
                  <div>
                    <span className="text-gray-600">Berakhir:</span>
                    <span className="ml-1 font-semibold text-gray-900">
                      {penghuni.masa_berakhir_sewa || "N/A"}
                    </span>
                  </div>
                  {contractStatus && (
                    <div
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${contractStatus.color}`}
                    >
                      <span className="mr-1">{contractStatus.icon}</span>
                      {contractStatus.text}
                    </div>
                  )}
                  <div className="text-gray-500">
                    Perpanjang Terakhir: {penghuni.durasi_bayar_terakhir || 0}{" "}
                    {penghuni.unit_bayar_terakhir || "bulan"}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* KTP & Emergency Contact */}
          <div>
            <span className="text-gray-500 font-medium block mb-0.5">KTP</span>
            <div className="text-gray-900 font-medium">{penghuni.no_ktp}</div>
          </div>

          <div>
            <span className="text-gray-500 font-medium block mb-0.5">
              PIC Emergency
            </span>
            <div className="text-gray-900 italic">{penghuni.pic_emergency}</div>
          </div>
        </div>
      </div>

      {/* Card Footer - Compact Action Buttons */}
      <div className="px-3 pb-2 pt-1 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-1.5">
          {penghuni.status_sewa === "Aktif" ? (
            <>
              <button
                onClick={() => onPayment(penghuni.id)}
                className="py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 font-medium transition-colors"
              >
                Perpanjang +
              </button>
              <button
                onClick={() => onEdit(penghuni.id)}
                className="py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-medium transition-colors"
              >
                Edit Data
              </button>
              <button
                onClick={() => onCheckout(penghuni.id)}
                className="py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 font-medium transition-colors"
              >
                Checkout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onReassign(penghuni.id)}
                className="col-span-2 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 font-medium transition-colors"
              >
                Sewa Lagi
              </button>
              <button
                onClick={() => onDelete(penghuni.id)}
                className="py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 font-medium transition-colors"
              >
                Hapus
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default PenghuniMobileCard;
