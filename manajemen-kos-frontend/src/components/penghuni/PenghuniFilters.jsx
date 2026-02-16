import React, { memo } from "react";
import SearchBar from "../common/forms/SearchBar";
import CustomSelect from "../common/forms/CustomSelect";

const PenghuniFilters = memo(function PenghuniFilters({
  searchTerm,
  setSearchTerm,
  isSearching,
  statusFilter,
  setStatusFilter,
  onAddPenghuni,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isSearching={isSearching}
          placeholder="Cari nama, NIK, atau HP..."
          className="flex-1"
        />

        <div className="w-full sm:w-48">
          <CustomSelect
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "Semua Status", value: "Semua" },
              { label: "Aktif", value: "Aktif" },
              { label: "Nonaktif", value: "Nonaktif" },
            ]}
            placeholder="Semua Status"
            searchable={false}
          />
        </div>

        <button
          onClick={onAddPenghuni}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
        >
          + Tambah Penghuni
        </button>
      </div>
    </div>
  );
});

export default PenghuniFilters;
