"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PetCard } from "@/components/mascotas/PetCard";
import { PetFormModal } from "@/components/mascotas/PetFormModal";
import { Modal } from "@/components/ui/Modal";
import { MedicalTimeline } from "@/components/historias/MedicalTimeline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, PlusCircle, Dog, Cat, Bird, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PetsPage() {
  const { pets, clients, medicalRecords, addPet, updatePet, softDeletePet, currentRole, activeClientId } =
    useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("Todas");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [selectedPetForHistory, setSelectedPetForHistory] = useState(null);

  // Role filtering
  const visiblePets =
    currentRole === "Cliente"
      ? pets.filter((p) => p.owner_id === activeClientId && p.status === "activo")
      : pets.filter((p) => p.status === "activo");

  const filteredPets = visiblePets.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.microchip && p.microchip.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecies = selectedSpecies === "Todas" || p.species === selectedSpecies;

    return matchesSearch && matchesSpecies;
  });

  const speciesOptions = ["Todas", "Perro", "Gato", "Ave", "Exótico"];

  const handleCreate = (data) => {
    addPet(data);
  };

  const handleEdit = (data) => {
    updatePet({ ...editingPet, ...data });
    setEditingPet(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-autumn-900">Gestión de Mascotas</h1>
          <p className="text-xs text-autumn-800/70">
            Fichas clínicas completas con foto, microchip, peso, propietario y expediente médico.
          </p>
        </div>

        {currentRole !== "Cliente" && (
          <Button
            onClick={() => {
              setEditingPet(null);
              setIsFormOpen(true);
            }}
            variant="primary"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Mascota</span>
          </Button>
        )}
      </div>

      {/* Bar de Búsqueda y Filtros de Especie */}
      <div className="bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <Input
          icon={Search}
          placeholder="Buscar por nombre de mascota, microchip, raza o dueño..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96"
        />

        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-autumn-800 mr-1 hidden sm:inline">Especie:</span>
          {speciesOptions.map((species) => (
            <button
              key={species}
              onClick={() => setSelectedSpecies(species)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                selectedSpecies === species
                  ? "bg-autumn-500 text-white shadow-autumn-sm"
                  : "bg-autumn-100 text-autumn-800 hover:bg-autumn-200"
              )}
            >
              {species}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas de Mascotas */}
      {filteredPets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-autumn-200 p-8 shadow-autumn-sm">
          <Dog className="w-12 h-12 text-autumn-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-autumn-900">No se encontraron mascotas</h3>
          <p className="text-xs text-autumn-800/70 max-w-md mx-auto mt-1">
            No hay registros que coincidan con la búsqueda actual o no tienes mascotas registradas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={(p) => {
                setEditingPet(p);
                setIsFormOpen(true);
              }}
              onDelete={(id) => softDeletePet(id)}
              onViewHistory={(p) => setSelectedPetForHistory(p)}
            />
          ))}
        </div>
      )}

      {/* Modal Formulario Mascota */}
      <PetFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPet(null);
        }}
        onSubmit={editingPet ? handleEdit : handleCreate}
        initialData={editingPet}
        clients={clients}
      />

      {/* Modal de Historial Clínico de Mascota */}
      <Modal
        isOpen={Boolean(selectedPetForHistory)}
        onClose={() => setSelectedPetForHistory(null)}
        title={`Historial Clínico: ${selectedPetForHistory?.name || ""}`}
        maxWidth="max-w-4xl"
      >
        {selectedPetForHistory && (
          <div className="space-y-6">
            <div className="bg-autumn-50 p-4 rounded-xl border border-autumn-200 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-autumn-900">{selectedPetForHistory.name}</div>
                <div className="text-xs text-autumn-800">
                  {selectedPetForHistory.species} - {selectedPetForHistory.breed} (Dueño:{" "}
                  {selectedPetForHistory.owner_name})
                </div>
              </div>
              <div className="text-right text-xs text-autumn-800">
                <span className="font-semibold block">Peso: {selectedPetForHistory.weight_kg} kg</span>
                <span>Microchip: {selectedPetForHistory.microchip || "No asignado"}</span>
              </div>
            </div>

            <MedicalTimeline
              records={medicalRecords.filter((r) => r.pet_id === selectedPetForHistory.id)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
