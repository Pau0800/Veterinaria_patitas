"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { MedicalTimeline } from "@/components/historias/MedicalTimeline";
import { MedicalRecordModal } from "@/components/historias/MedicalRecordModal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Search, 
  FilterX, 
  Stethoscope, 
  AlertCircle 
} from "lucide-react";

export default function MedicalRecordsPage() {
  const { 
    medicalRecords = [], 
    pets = [], 
    addMedicalRecord, 
    currentRole, 
    activeClientId 
  } = useApp();

  const searchParams = useSearchParams();

  // Estados locales
  const [selectedPetId, setSelectedPetId] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState(null);

  // Lectura reactiva y segura de parámetros de URL (SSR/Next.js amigable)
  useEffect(() => {
    const turnoId = searchParams.get("turnoId");
    if (!turnoId) return;

    const mascotaId = searchParams.get("mascotaId") || "";
    const veterinarioId = searchParams.get("veterinarioId") || "";
    const fecha = searchParams.get("fecha") || new Date().toISOString().split("T")[0];
    const motivo = searchParams.get("motivo") || "";

    setDefaultValues({
      pet_id: mascotaId,
      vet_id: veterinarioId,
      type: "",
      record_date: fecha,
      title: motivo,
    });

    if (mascotaId) {
      setSelectedPetId(mascotaId);
    }

    setIsModalOpen(true);
  }, [searchParams]);

  // Validación de permisos por rol
  const canCreateRecord = useMemo(() => {
    return currentRole === "Administrador" || currentRole === "Veterinario";
  }, [currentRole]);

  // Filtrado memoizado de mascotas según el Rol activo
  const availablePets = useMemo(() => {
    if (!Array.isArray(pets)) return [];
    if (currentRole === "Cliente") {
      return pets.filter((p) => p.owner_id === activeClientId && p.status === "activo");
    }
    return pets.filter((p) => p.status === "activo");
  }, [pets, currentRole, activeClientId]);

  // Filtrado memoizado de historias clínicas con búsquedas defensivas contra null/undefined
  const filteredRecords = useMemo(() => {
    if (!Array.isArray(medicalRecords)) return [];

    const query = searchTerm.trim().toLowerCase();

    return medicalRecords.filter((rec) => {
      // Filtrar mascotas del cliente si el rol es 'Cliente'
      if (currentRole === "Cliente") {
        const isMyPet = availablePets.some((p) => p.id === rec.pet_id);
        if (!isMyPet) return false;
      }

      // Filtro por selección de mascota específica
      const matchesPet = selectedPetId === "TODAS" || rec.pet_id === selectedPetId;
      if (!matchesPet) return false;

      // Búsqueda por término (validación segura contra valores nulos o no definidos)
      if (!query) return true;

      const titleMatch = rec.title?.toLowerCase().includes(query) ?? false;
      const descMatch = rec.description?.toLowerCase().includes(query) ?? false;
      const petNameMatch = rec.pet_name?.toLowerCase().includes(query) ?? false;
      const diagMatch = rec.diagnosis?.toLowerCase().includes(query) ?? false;

      return titleMatch || descMatch || petNameMatch || diagMatch;
    });
  }, [medicalRecords, selectedPetId, searchTerm, currentRole, availablePets]);

  // Opciones memoizadas para el selector de mascotas
  const petOptions = useMemo(() => {
    const defaultOption = { value: "TODAS", label: "Todas las Mascotas" };
    const options = availablePets.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.species}${p.owner_name ? ` - ${p.owner_name}` : ""})`,
    }));
    return [defaultOption, ...options];
  }, [availablePets]);

  // Handlers memoizados para evitar re-renders innecesarios
  const handleResetFilters = useCallback(() => {
    setSelectedPetId("TODAS");
    setSearchTerm("");
  }, []);

  const handleOpenModal = useCallback(() => {
    setDefaultValues(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmitRecord = async (formData) => {
    try {
      setIsSubmitting(true);
      await addMedicalRecord(formData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al registrar la historia clínica:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasActiveFilters = selectedPetId !== "TODAS" || searchTerm.trim() !== "";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Encabezado Principal */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-autumn-200/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-7 h-7 text-autumn-600" aria-hidden="true" />
            <h1 className="text-3xl font-black tracking-tight text-autumn-900">
              Historias Clínicas
            </h1>
          </div>
          <p className="text-sm text-autumn-800/80 max-w-2xl leading-relaxed">
            Expediente médico unificado: registro centralizado de consultas, diagnósticos, cirugías, evoluciones y esquemas farmacológicos.
          </p>
        </div>

        {canCreateRecord && (
          <Button
            onClick={handleOpenModal}
            variant="primary"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 shadow-sm hover:shadow-md transition-all font-semibold rounded-lg shrink-0"
            aria-label="Registrar nueva consulta o evolución médica"
          >
            <PlusCircle className="w-5 h-5" aria-hidden="true" />
            <span>Nueva Consulta / Evolución</span>
          </Button>
        )}
      </header>

      {/* Barra de Filtros y Búsqueda */}
      <section 
        className="bg-white p-5 rounded-2xl border border-autumn-200/80 shadow-sm space-y-4"
        aria-label="Filtros de búsqueda de registros clínicos"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <Select
              label="Filtrar por Paciente"
              options={petOptions}
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="md:col-span-5">
            <Input
              label="Buscar en Expediente"
              icon={Search}
              placeholder="Buscar por síntoma, diagnóstico, médico o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="w-full inline-flex items-center justify-center gap-2 text-autumn-700 hover:bg-autumn-50 border-autumn-300"
                title="Limpiar todos los filtros"
              >
                <FilterX className="w-4 h-4" aria-hidden="true" />
                <span>Limpiar</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Sección del Cronograma Clínico */}
      <section 
        className="bg-white p-6 sm:p-8 rounded-2xl border border-autumn-200/80 shadow-sm transition-all"
        aria-live="polite"
      >
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-autumn-100">
          <h2 className="text-xl font-bold text-autumn-900 flex items-center space-x-2.5">
            <FileSpreadsheet className="w-6 h-6 text-autumn-600" aria-hidden="true" />
            <span>Cronograma Clínico</span>
          </h2>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-autumn-100 text-autumn-800">
            {filteredRecords.length} {filteredRecords.length === 1 ? "registro" : "registros"}
          </span>
        </header>

        {/* Renderizado Condicional: Registros vs Estado Vacío */}
        {filteredRecords.length > 0 ? (
          <MedicalTimeline records={filteredRecords} />
        ) : (
          <div className="py-12 px-4 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-autumn-100 flex items-center justify-center mx-auto text-autumn-600">
              <AlertCircle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-autumn-900">
                No se encontraron registros
              </h3>
              <p className="text-sm text-autumn-600">
                {hasActiveFilters
                  ? "No hay expedientes que coincidan con los filtros aplicados. Intenta modificar la búsqueda."
                  : "Aún no hay historias clínicas registradas en la plataforma."}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="secondary"
                onClick={handleResetFilters}
                className="mt-2 text-sm"
              >
                Restablecer filtros
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Modal para Nueva Historia Clínica */}
      <MedicalRecordModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitRecord}
        pets={availablePets}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}