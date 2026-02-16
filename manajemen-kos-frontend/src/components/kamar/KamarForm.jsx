import React, { memo } from 'react';
import { ALL_FACILITIES, ALL_PARKING } from '../../utils/facilityConstants';
import CustomSelect from '../common/forms/CustomSelect';

const KamarForm = memo(({ formData, handleChange, handleSubmit, isEdit = false, loading = false }) => {
    const ALL_ROOM_FEATURES = [...ALL_FACILITIES, ...ALL_PARKING];
    const selectedFacilities = Array.isArray(formData.deskripsi_fasilitas)
        ? formData.deskripsi_fasilitas
        : [];

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-4 md:p-8 space-y-4">

            {/* 1. INFORMASI DASAR */}

            {/* Nama Kamar */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kamar <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="nama_kamar"
                    value={formData.nama_kamar || ''}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contoh: Kamar 101"
                />
            </div>

            {/* Baris 2: Harga & Luas - Layout Compact untuk Mobile */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="harga_bulanan"
                        value={formData.harga_bulanan || ''}
                        onChange={handleChange}
                        maxLength={10}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="500000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Luas <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="luas_kamar"
                        value={formData.luas_kamar || ''}
                        onChange={handleChange}
                        maxLength={20}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3x4m"
                    />
                </div>
            </div>

            {/* Baris 3: Blok, Lantai, Tipe - Layout Compact */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blok <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="blok"
                        value={formData.blok || ''}
                        onChange={handleChange}
                        maxLength={2}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="A"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lantai <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="lantai"
                        value={formData.lantai || ''}
                        onChange={handleChange}
                        required
                        maxLength={2}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipe <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                        name="type"
                        value={formData.type || 1}
                        onChange={handleChange}
                        options={[
                            { label: 'Standard', value: 1 },
                            { label: 'Premium', value: 2 },
                        ]}
                        placeholder="Pilih"
                        searchable={false}
                    />
                </div>
            </div>

            {/* 2. FASILITAS */}
            <div className="border p-4 rounded-xl bg-gray-50">
                <label className="block text-sm font-bold text-gray-800 mb-3">FASILITAS & PARKIR</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-4 text-sm">
                    {ALL_ROOM_FEATURES.map((facility) => {
                        const facilityId = `facility-${facility.toLowerCase().replace(/\s+/g, '-')}`;
                        const isChecked = selectedFacilities.includes(facility);

                        return (
                            <div key={facility} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={facilityId}
                                    name="facility"
                                    data-name={facility}
                                    checked={isChecked}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label
                                    htmlFor={facilityId}
                                    className="ml-2 text-gray-700 select-none cursor-pointer"
                                >
                                    {facility}
                                </label>
                            </div>
                        );
                    })}
                </div>

                {/* Debug Info (Dibuat lebih tersembunyi) */}
                <details className="mt-3 text-xs text-gray-600">
                    <summary className="cursor-pointer">Fasilitas Terpilih ({selectedFacilities.length})</summary>
                    <p className="mt-1 wrap-break-word">
                        {selectedFacilities.length > 0 ? selectedFacilities.join(', ') : 'Belum ada fasilitas dipilih'}
                    </p>
                </details>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 text-white rounded-md font-medium ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'Menyimpan...' : (isEdit ? 'Update Kamar' : 'Tambah Kamar')}
                </button>
            </div>
        </form>
    );
});

export default KamarForm;