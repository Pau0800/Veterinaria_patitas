"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VETERINARIANS } from "@/lib/mockData";
import { useApp } from "@/context/AppContext";

export function AdmissionModal({ isOpen, onClose, onSubmit }) {
  const { pets } = useApp();

  const [formData, setFormData] = useState({
    pet_id: pets.length > 0 ? pets[0].id : "",
    vet_id: VETERINARIANS[0].id,
    reason: "",
    daily_evolution: "Ingreso en observación. Constantes vitales estables.",
    treatment: "Fluidoterapia de soporte.",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pet_id || !formData.reason) return;

    const vet = VETERINARIANS.find((v) => v.id === formData.vet_id);

    onSubmit({
      ...formData,
      vet_name: vet ? vet.full_name : "Veterinario Cargo",
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ingreso de Internación Médica">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Mascota Paciente"
          options={petOptions}
          value={formData.pet_id}
          onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
          required
        />

        <Select
          label="Veterinario a Cargo de Internación"
          options={vetOptions}
          value={formData.vet_id}
          onChange={(e) => setFormData({ ...formData, vet_id: e.target.value })}
          required
        />

        <Input
          label="Motivo del Ingreso"
          placeholder="Ej. Post-quirúrgico, deshidratación severa, pancreatitis..."
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />

        <Textarea
          label="Tratamiento Inicial"
          placeholder="Ej. Suero Ringer Lactato a 20 ml/h, analgesia cada 8hs..."
          value={formData.treatment}
          onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
        />

        <Textarea
          label="Primer Informe de Evolución"
          placeholder="Ej. Paciente ingresa alerta, T: 38.5ºC, FC: 110bpm..."
          value={formData.daily_evolution}
          onChange={(e) => setFormData({ ...formData, daily_evolution: e.target.value })}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger">
            Confirmar Ingreso a Cama
          </Button>
        </div>
      </form>
    </Modal>
  );
}
