"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { PetCard } from "@/components/mascotas/PetCard";
import { PetFormModal } from "@/components/mascotas/PetFormModal";
import { Modal } from "@/components/ui/Modal";
import { MedicalTimeline } from "@/components/historias/MedicalTimeline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  PlusCircle,
  Dog,
  Cat,
  Bird,
  Sparkles,
  ShieldAlert,
  XCircle,
  Filter,
  Weight,
  Cpu,
  User,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Lista de especies soportadas con sus respectivos iconos visuales
const SPECIES_OPTIONS = [
  { id: "Todas", label: "Todas", icon: Sparkles },
  { id: "Perro", label: "Perro", icon: Dog },
  { id: "Gato", label: "Gato", icon: Cat },
  { id: "Ave", label: "Ave", icon: Bird },
  { id: "Exótico", label: "Exótico", icon: Sparkles },
];

export default function PetsPage() {
  const {
    pets = [],
    clients = [],
    medicalRecords = [],
    addPet,
    updatePet,
    softDeletePet,
    currentRole,
    activeClientId,
  } = useApp();

  // Estados de interfaz y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("Todas");
  
  // Estados para modales de interacción
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [selectedPetForHistory, setSelectedPetForHistory] = useState(null);
  const [petToDelete, setPetToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Discriminación de visibilidad de mascotas según el Rol del usuario
  const visiblePets = useMemo(() => {
    if (!Array.isArray(pets)) return [];
    if (currentRole === "Cliente") {
      return pets.filter(
        (p) => p.owner_id === activeClientId && p.status === "activo"
      );
    }
    return pets.filter((p) => p.status === "activo");
  }, [pets, currentRole, activeClientId]);

  // Búsqueda y filtrado multi-criterio optimizado
  const filteredPets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return visiblePets.filter((pet) => {
      // Coincidencia por especie
      const matchesSpecies =
        selectedSpecies === "Todas" || pet.species === selectedSpecies;

      if (!matchesSpecies) return false;
      if (!query) return true;

      // Coincidencia por texto con defensas contra nulos
      const nameMatch = pet.name?.toLowerCase().includes(query) ?? false;
      const breedMatch = pet.breed?.toLowerCase().includes(query) ?? false;
      const ownerMatch = pet.owner_name?.toLowerCase().includes(query) ?? false;
      const chipMatch = pet.microchip?.toLowerCase().includes(query) ?? false;

      return nameMatch || breedMatch || ownerMatch || chipMatch;
    });
  }, [visiblePets, searchTerm, selectedSpecies]);

  // Filtrado de expedientes médicos asociados a la mascota en visualización
  const selectedPetMedicalRecords = useMemo(() => {
    if (!selectedPetForHistory?.id || !Array.isArray(medicalRecords)) return [];
    return medicalRecords.filter((r) => r.pet_id === selectedPetForHistory.id);
  }, [medicalRecords, selectedPetForHistory]);

  // Handlers para registro, edición y eliminación
  const handleOpenCreateModal = useCallback(() => {
    setEditingPet(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((pet) => {
    setEditingPet(pet);
    setIsFormOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormOpen(false);
    setEditingPet(null);
  }, []);

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingPet) {
        await updatePet({ ...editingPet, ...data });
      } else {
        await addPet(data);
      }
      handleCloseFormModal();
    } catch (error) {
      console.error("Error al guardar la información de la mascota:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!petToDelete?.id) return;
    try {
      setIsSubmitting(true);
      await softDeletePet(petToDelete.id);
      setPetToDelete(null);
    } catch (error) {
      console.error("Error al desactivar la mascota:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSpecies("Todas");
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Encabezado e Interfaz de Acción */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-autumn-200/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Dog className="w-7 h-7 text-autumn-600" aria-hidden="true" />
            <h1 className="text-3xl font-black tracking-tight text-autumn-900">
              Gestión de Mascotas
            </h1>
          </div>
          <p className="text-sm text-autumn-800/80 max-w-2xl leading-relaxed">
            Fichas clínicas completas con historial fotográfico, identificación por microchip, control ponderal, datos del propietario y expediente médico integrado.
          </p>
        </div>

        {currentRole !== "Cliente" && (
          <Button
            onClick={handleOpenCreateModal}
            variant="primary"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 shadow-sm hover:shadow-md transition-all font-semibold rounded-lg shrink-0"
            aria-label="Registrar nueva mascota en el sistema"
          >
            <PlusCircle className="w-5 h-5" aria-hidden="true" />
            <span>Registrar Mascota</span>
          </Button>
        )}
      </header>

      {/* Barra de Búsqueda y Filtro Categorizado */}
      <section className="bg-white p-4 rounded-2xl border border-autumn-200/80 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="w-full lg:w-96">
          <Input
            icon={Search}
            placeholder="Buscar por nombre, raza, tutor o microchip..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs"
            aria-label="Buscar mascotas por término"
          />
        </div>

        {/* Filtro por Especie */}
        <nav
          className="flex items-center space-x-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none"
          aria-label="Filtro de especies"
        >
          <span className="text-xs font-bold text-autumn-800 mr-2 flex items-center gap-1 shrink-0 hidden sm:flex">
            <Filter className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
            Especie:
          </span>

          {SPECIES_OPTIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = selectedSpecies === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedSpecies(id)}
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-autumn-400",
                  isSelected
                    ? "bg-autumn-500 text-white shadow-sm"
                    : "bg-autumn-100/70 text-autumn-800 hover:bg-autumn-200/80"
                )}
                aria-pressed={isSelected}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </section>

      {/* Grid de Pacientes / Estado Vacío */}
      <section aria-live="polite">
        {filteredPets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-autumn-200/80 p-8 shadow-sm max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-autumn-100 flex items-center justify-center mx-auto text-autumn-500">
              <Dog className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-autumn-900">
                No se encontraron mascotas
              </h2>
              <p className="text-xs text-autumn-700 leading-relaxed">
                No hay pacientes registrados que coincidan con los criterios de búsqueda o no posees mascotas asociadas a tu cuenta.
              </p>
            </div>
            {(searchTerm || selectedSpecies !== "Todas") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs border-autumn-300 text-autumn-900 hover:bg-autumn-50"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map((pet) => (
              <article key={pet.id}>
                <PetCard
                  pet={pet}
                  onEdit={handleOpenEditModal}
                  onDelete={(id) => setPetToDelete(pet)}
                  onViewHistory={(p) => setSelectedPetForHistory(p)}
                />
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal Formulario de Alta / Edición */}
      <PetFormModal
        isOpen={isFormOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingPet}
        clients={clients}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Historial Clínico de Mascota */}
      <Modal
        isOpen={Boolean(selectedPetForHistory)}
        onClose={() => setSelectedPetForHistory(null)}
        title={`Expediente Clínico: ${selectedPetForHistory?.name || ""}`}
        maxWidth="max-w-4xl"
      >
        {selectedPetForHistory && (
          <div className="space-y-6">
            {/* Banner Informativo del Paciente */}
            <div className="bg-autumn-50/80 p-4 rounded-2xl border border-autumn-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-autumn-900">
                    {selectedPetForHistory.name}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-autumn-200/70 text-autumn-800">
                    {selectedPetForHistory.species}
                  </span>
                </div>
                <div className="text-xs text-autumn-700 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{selectedPetForHistory.breed || "Raza no especificada"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                    Propietario: {selectedPetForHistory.owner_name || "Sin tutor asignado"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-autumn-800 border-t sm:border-t-0 sm:border-l border-autumn-200/80 pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto">
                <div className="space-y-0.5">
                  <span className="text-autumn-600 flex items-center gap-1 font-semibold">
                    <Weight className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                    Peso Actual
                  </span>
                  <p className="font-bold text-autumn-900">
                    {selectedPetForHistory.weight_kg ? `${selectedPetForHistory.weight_kg} kg` : "N/R"}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-autumn-600 flex items-center gap-1 font-semibold">
                    <Cpu className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                    Microchip
                  </span>
                  <p className="font-bold text-autumn-900">
                    {selectedPetForHistory.microchip || "No asignado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Línea de Tiempo de Consultas y Procedimientos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-autumn-100">
                <HeartPulse className="w-5 h-5 text-autumn-600" aria-hidden="true" />
                <h4 className="text-sm font-extrabold text-autumn-900">
                  Historial de Consultas e Intervenciones
                </h4>
              </div>
              <MedicalTimeline records={selectedPetMedicalRecords} />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmación de Eliminación */}
      <Modal
        isOpen={Boolean(petToDelete)}
        onClose={() => setPetToDelete(null)}
        title="Confirmar Desactivación"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-amber-900 leading-relaxed">
              ¿Está seguro de que desea dar de baja la ficha médica de{" "}
              <strong className="font-bold">{petToDelete?.name}</strong>? La mascota dejará de aparecer en la lista activa, pero sus registros médicos permanecerán resguardados.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setPetToDelete(null)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              Confirmar Baja
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}