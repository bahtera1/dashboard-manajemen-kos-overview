import React, { memo } from "react";
import { formatCurrency } from "../../utils/currency";
import logger from "../../utils/logger";

const KamarCard = memo(function KamarCard({ kamar, onEdit, onDelete }) {
  let facilities = [];

  if (kamar.deskripsi_fasilitas) {
    if (Array.isArray(kamar.deskripsi_fasilitas)) {
      facilities = kamar.deskripsi_fasilitas;
    } else if (typeof kamar.deskripsi_fasilitas === "string") {
      try {
        const parsed = JSON.parse(kamar.deskripsi_fasilitas);
        facilities = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        logger.error("Error parsing facilities:", e);
        facilities = [];
      }
    }
  }

  // Badge untuk status penghuni
  const StatusBadge = () => {
    const isPenghuni = kamar.penghuni && kamar.penghuni.id;

    if (isPenghuni) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-sm border border-red-200">
          ⛔ Terisi
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm border border-green-200">
        ✅ Kosong
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Header Card */}
      <div className="bg-linear-to-r from-blue-500 to-blue-600 p-4 text-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold tracking-tight">
            {kamar.nama_kamar}
          </h3>
          <StatusBadge />
        </div>
        <p className="text-2xl font-bold">
          {formatCurrency(kamar.harga_bulanan)}
        </p>
        <p className="text-xs opacity-90 mt-1 font-light">per bulan</p>
      </div>

      {/* Body Card */}
      <div className="p-4 space-y-3">
        {/* Info Kamar */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Luas</p>
            <p className="font-semibold text-gray-800">{kamar.luas_kamar}</p>
          </div>
          <div>
            <p className="text-gray-500">Blok</p>
            <p className="font-semibold text-gray-800">
              {kamar.blok} - Lt. {kamar.lantai}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Tipe</p>
            <p className="font-semibold text-gray-800">
              {kamar.type === 1 ? "Standard" : "Deluxe"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Penghuni</p>
            <p className="font-semibold text-gray-800">
              {kamar.penghuni ? kamar.penghuni.nama_lengkap : "-"}
            </p>
          </div>
        </div>

        {/* 🔧 SECTION FASILITAS - PERBAIKAN */}
        <div className="pt-3 border-t">
          <p className="text-xs font-semibold text-gray-600 mb-2">FASILITAS:</p>
          {facilities.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {facilities.map((facility, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {facility}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Tidak ada fasilitas tercatat
            </p>
          )}
        </div>
      </div>

      {/* Footer - Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onEdit(kamar.id)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(kamar.id)}
          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={kamar.penghuni && kamar.penghuni.id}
          title={
            kamar.penghuni && kamar.penghuni.id
              ? "Kamar sedang terisi"
              : "Hapus Kamar"
          }
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  );
});

export default KamarCard;
