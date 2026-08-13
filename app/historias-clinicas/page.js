"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MedicalTimeline } from "@/components/historias/MedicalTimeline";
import { MedicalRecordModal } from "@/components/historias/MedicalRecordModal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { FileSpreadsheet, PlusCircle, Search, Filter } from "lucide-react";

export default function MedicalRecordsPage() {
  const { medicalRecords, pets, addMedicalRecord, currentRole, activeClientId } = useApp();

  const [selectedPetId, setSelectedPetId] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Role Filtering
  const availablePets =
    currentRole === "Cliente"
      ? pets.filter((p) => p.owner_id === activeClientId && p.status === "activo")
      : pets.filter((p) => p.status === "activo");

  const filteredRecords = medicalRecords.filter((rec) => {
    // Filter by client pets if role is Cliente
    if (currentRole === "Cliente") {
      const isMyPet = availablePets.some((p) => p.id === rec.pet_id);
      if (!isMyPet) return false;
    }

    const matchesPet = selectedPetId === "TODAS" || rec.pet_id === selectedPetId;

    const matchesSearch =
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.diagnosis && rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesPet && matchesSearch;
  });

  const petOptions = [
    { value: "TODAS", label: "Todas las Mascotas" },
    ...availablePets.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.species} - ${p.owner_name})`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-autumn-900">Historias Clínicas</h1>
          <p className="text-xs text-autumn-800/70">
            Registro unificado de consultas, diagnósticos, cirugías, tratamientos y medicación prescrita.
          </p>
        </div>

        {(currentRole === "Administrador" || currentRole === "Veterinario") && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Consulta / Evolución</span>
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Filtrar por Paciente"
          options={petOptions}
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
        />

        <Input
          label="Buscar en Expediente"
          icon={Search}
          placeholder="Buscar por síntoma, diagnóstico o título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Timeline Section */}
      <div className="bg-white p-6 rounded-2xl border border-autumn-200 shadow-autumn-sm">
        <h2 className="text-lg font-bold text-autumn-900 mb-6 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-autumn-500" />
          <span>Cronograma Clínico ({filteredRecords.length} registros)</span>
        </h2>

        <MedicalTimeline records={filteredRecords} />
      </div>

      {/* Modal Nueva Historia */}
      <MedicalRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => addMedicalRecord(data)}
        pets={availablePets}
      />
    </div>
  );
}
