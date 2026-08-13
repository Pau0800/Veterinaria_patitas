"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VETERINARIANS } from "@/lib/mockData";
import { useApp } from "@/context/AppContext";

export function VaccineFormModal({ isOpen, onClose, onSubmit }) {
  const { pets } = useApp();

  const [formData, setFormData] = useState({
    pet_id: pets.length > 0 ? pets[0].id : "",
    vaccine_name: "Séxtuple Canina",
    application_date: new Date().toISOString().split("T")[0],
    next_due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    vet_id: VETERINARIANS[0].id,
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pet_id || !formData.vaccine_name) return;

    const vet = VETERINARIANS.find((v) => v.id === formData.vet_id);

    onSubmit({
      ...formData,
      vet_name: vet ? vet.full_name : "Veterinario",
      status: "aplicada",
    });
    onClose();
  };

  const petOptions = pets.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.species} - Dueño: ${p.owner_name})`,
  }));

  const vetOptions = VETERINARIANS.map((v) => ({
    value: v.id,
    label: `${v.full_name}`,
  }));

  const commonVaccines = [
    { value: "Séxtuple Canina", label: "Séxtuple Canina (DAPP)" },
    { value: "Antirrábica", label: "Antirrábica Anual" },
    { value: "Triple Felina", label: "Triple Felina (VRCP)" },
    { value: "Leucemia Felina (FeLV)", label: "Leucemia Felina (FeLV)" },
    { value: "Tos de las Kennels (Bordetella)", label: "Tos de las Kennels (Bordetella)" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Aplicación de Vacuna">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Mascota Paciente"
          options={petOptions}
          value={formData.pet_id}
          onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
          required
        />

        <Select
          label="Nombre de la Vacuna"
          options={commonVaccines}
          value={formData.vaccine_name}
          onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de Aplicación"
            type="date"
            value={formData.application_date}
            onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
            required
          />

          <Input
            label="Próxima Dosis (Vencimiento)"
            type="date"
            value={formData.next_due_date}
            onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
            required
          />
        </div>

        <Select
          label="Veterinario Responsable"
          options={vetOptions}
          value={formData.vet_id}
          onChange={(e) => setFormData({ ...formData, vet_id: e.target.value })}
        />

        <Textarea
          label="Observaciones (Nº de Lote, marca...)"
          placeholder="Lote Nº 84920, laboratorio Zoetis..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="sage">
            Registrar Vacuna
          </Button>
        </div>
      </form>
    </Modal>
  );
}
