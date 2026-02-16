import React, { useState, useEffect } from "react";
import { formatCurrency, numberToText } from "../../utils/currency"; // formatCurrency
import { ALL_FACILITIES, ALL_PARKING } from "../../utils/facilityConstants";

const KuitansiPrintView = ({ data, mode, onDataChange }) => {
  const isLunas = mode === "RECEIPT" || data.status_pembayaran === "Lunas";
  const fasilitas = data.fasilitas || {};
  const parkir = data.parkir || {};

  // Logic to determine initial Doc ID
  const getInitialDocId = () => {
    if (data.nomor_kuitansi) return data.nomor_kuitansi;
    if (
      data.nomor_tagihan &&
      !data.nomor_tagihan.toString().toUpperCase().includes("DRAFT")
    )
      return data.nomor_tagihan;

    // Auto-generate format YYYY-MM-INV-XX if draft or missing
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    // Random 2 digits
    const random = Math.floor(Math.random() * 90 + 10);
    return `${year}-${month}-INV-${random}`;
  };

  const initialDocId = getInitialDocId();
  const [editableDocId, setEditableDocId] = useState(initialDocId);

  // Update if props change logic
  useEffect(() => {
    setEditableDocId(getInitialDocId());
  }, [data.nomor_kuitansi, data.nomor_tagihan]);

  const tanggalDoc = data.tanggal_dokumen || new Date().toISOString().split('T')[0];

  // Debug: Log nilai terbilang untuk memastikan
  const terbilangValue = numberToText(data.jumlah || 0);

  return (
    <div
      id="print-section"
      className="p-6 md:p-8 print:p-0 max-w-4xl print:max-w-full mx-auto bg-white print:border-none print:shadow-none font-sans text-gray-800"
      style={{ fontSize: "10pt" }}
    >
      <style>
        {`
                    @media print {
                        @page {
                            margin: 0;
                            size: auto;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #print-section, #print-section * {
                            visibility: visible;
                        }
                        #print-section {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            margin: 0;
                            padding: 20px;
                            box-sizing: border-box;
                        }
                    }
                `}
      </style>

      {/* HEADER - Logo, Title, Address */}
      <header className="flex justify-between items-start pb-3 mb-4 print:mb-2 print:pb-2">
        <img src="/logo.png" alt="Logo" className="w-32 h-24 object-contain print:w-24 print:h-20" />
        <div className="text-center flex-1 mx-4">
          <h1 className="text-3xl font-bold tracking-wider mb-2 print:text-2xl print:mb-1">
            {isLunas ? "KWITANSI" : "INVOICE"}
          </h1>
        </div>
        <div className="w-48 text-xs text-right">
          <p className="font-semibold">Perum Cijati Asri Blok N No. 4</p>
          <p>RT 004 RW 015 Kelurahan</p>
          <p>Jayawaras Kecamatan Tarogong</p>
          <p>Kidul</p>
        </div>
      </header>

      {/* ID SECTION */}
      <div className="border-t-2 border-b-2 border-gray-800 py-2 mb-4 print:py-1 print:mb-2 flex justify-between text-xs font-semibold items-center">
        <span>ID Penghuni: {data.id_penghuni || "N/A"}</span>
        <span>ID Kamar: {data.kamar_id || "N/A"}</span>
        <div className="flex items-center">
          <span>Kwitansi No : </span>
          <input
            type="text"
            value={editableDocId}
            onChange={(e) => {
              const val = e.target.value;
              setEditableDocId(val);
              if (onDataChange) onDataChange("nomor_kuitansi", val);
            }}
            className="ml-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none px-1 w-48 text-right font-bold print:border-none"
            placeholder="YYYY-XX-INV-XX"
          />
        </div>
      </div>

      {/* MAIN CONTENT - 3 COLUMNS with custom widths: 15% | 15% | 70% */}
      <div className="grid grid-cols-[18%_20%_62%] gap-0 text-sm border-2 border-gray-800">
        {/* LEFT COLUMN (15%) - Jatuh Tempo, Status, etc. */}
        <div className="border-r-2 border-gray-800 p-3 print:p-2 space-y-2 print:space-y-1">
          {data.tampilkan_jatuh_tempo !== false && (
            <div className="border-b border-gray-400 pb-2 print:pb-1">
              <p className="text-xs">Jatuh Tempo Berikut</p>
              <p className="font-semibold text-blue-600">
                {data.jatuh_tempo_berikut || "N/A"}
              </p>
            </div>
          )}

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <p className="text-xs">Status Pembayaran</p>
            <p
              className={`font-bold ${isLunas ? "text-blue-600" : "text-red-600"}`}
            >
              {data.status_pembayaran || "Belum Lunas"}
            </p>
          </div>

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <p className="text-xs">Metode Pembayaran</p>
            <p className="font-semibold">{data.metode_pembayaran || "N/A"}</p>
          </div>

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <p className="text-xs">Uang Muka</p>
            <p className="font-semibold text-blue-600">
              {formatCurrency(data.uang_muka || 0)}
            </p>
          </div>

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <p className="text-xs">Pelunasan</p>
            <p className="font-semibold text-blue-600">
              {formatCurrency(data.pelunasan || 0)}
            </p>
            <p className="text-xs text-gray-600">
              {data.tanggal_bayar || "N/A"}
            </p>
          </div>

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <p className="text-xs">Lain-Lain</p>
            <p className="font-semibold text-blue-600">
              {formatCurrency(data.lain_lain || 0)}
            </p>
          </div>

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <p className="text-xs">Refund</p>
            <p className="font-semibold text-blue-600">
              {formatCurrency(data.refund || 0)}
            </p>
          </div>
        </div>

        {/* MIDDLE COLUMN (15%) - Fasilitas and Parkir */}
        <div className="border-r-2 border-gray-800 p-3 print:p-2 space-y-2 print:space-y-1">
          {/* FASILITAS BOX */}
          <div className="border border-gray-600 p-2 print:p-1">
            <h3 className="font-bold text-center mb-2 print:mb-1 border-b border-gray-400 pb-1">
              Fasilitas
            </h3>
            <div className="space-y-1">
              {ALL_FACILITIES.map((facility) => {
                const key = facility.toLowerCase().replace(/ /g, "_");
                return (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={fasilitas[key] || false}
                      disabled
                      className="mr-2 h-3 w-3 border-gray-800"
                      style={{ accentColor: "#000" }}
                    />
                    <label className="text-xs">{facility}</label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PARKIR BOX */}
          <div className="border border-gray-600 p-2 print:p-1 mt-2 print:mt-1">
            <h3 className="font-bold text-center mb-2 print:mb-1 border-b border-gray-400 pb-1">
              Parkir
            </h3>
            <div className="space-y-1">
              {ALL_PARKING.map((parking) => {
                const key = parking.toLowerCase().replace(/ /g, "_");
                return (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={parkir[key] || false}
                      disabled
                      className="mr-2 h-3 w-3 border-gray-800"
                      style={{ accentColor: "#000" }}
                    />
                    <label className="text-xs">
                      {parking.replace("Rental", "")} (1 Unit)
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (70%) - Sudah Terima Dari, etc. */}
        <div className="p-4 print:p-3 space-y-3 print:space-y-2">
          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <span className="text-xs">
              {isLunas ? "Sudah Terima Dari :" : "Tagihan Kepada :"}
            </span>
            <span className="font-semibold">{data.nama_penghuni || "N/A"}</span>
          </div>

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <span className="text-xs">Terbilang : </span>
            <span className="font-bold">{terbilangValue}</span>
          </div>

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <span className="text-xs">Untuk Pembayaran : </span>
            <span className="font-semibold">
              {data.deskripsi || "Sewa Kamar"}
            </span>
          </div>

          <div className="border-b border-gray-400 pb-2 print:pb-1">
            <span className="text-xs">Jumlah : </span>
            <span className="font-bold text-base">
              {formatCurrency(data.jumlah || 0)}
            </span>
          </div>

          {/* SIGNATURE */}
          <div className="text-right mt-16 pt-12 print:mt-6 print:pt-4">
            <p className="mb-1">Garut, {tanggalDoc}</p>
            <p className="mt-20 print:mt-12 font-semibold border-t border-gray-800 inline-block px-6 pt-1">
              Handani Kost - Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KuitansiPrintView;
