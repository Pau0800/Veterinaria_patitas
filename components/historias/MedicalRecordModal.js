"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VETERINARIANS } from "@/lib/mockData";

export function MedicalRecordModal({ isOpen, onClose, onSubmit, pets = [], defaultValues }) {
  const getInitialFormData = () => ({
    pet_id: pets.length > 0 ? pets[0].id : "",
    vet_id: VETERINARIANS[0].id,
    type: "Consulta General",
    title: "",
    description: "",
    diagnosis: "",
    treatment: "",
    medication_prescribed: "",
    record_date: new Date().toISOString().split("T")[0],
    ...defaultValues,
  });

  const [formData, setFormData] = useState(getInitialFormData);

  useEffect(() => {
    if (isOpen) setFormData(getInitialFormData());
  }, [isOpen, defaultValues, pets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pet_id || !formData.title || !formData.description) return;
    const vet = VETERINARIANS.find((v) => v.id === formData.vet_id);
    onSubmit({
      ...formData,
      vet_name: vet ? vet.full_name : "Dr. Veterinario",
    });
    onClose();
  };

  const petOptions = pets.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.species} - Dueño: ${p.owner_name})`,
  }));

  const vetOptions = VETERINARIANS.map((v) => ({
    value: v.id,
    label: `${v.full_name} (${v.specialization})`,
  }));

  const typeOptions = [
    { value: "", label: "Seleccionar tipo de registro" },
    { value: "Consulta General", label: "Consulta General" },
    { value: "Diagnóstico", label: "Diagnóstico" },
    { value: "Tratamiento", label: "Tratamiento" },
    { value: "Medicación", label: "Medicación" },
    { value: "Cirugía", label: "Cirugía" },
    { value: "Estudios", label: "Estudios / Rayos X / Laboratorio" },
    { value: "Evolución", label: "Evolución Médica" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Registro a Historia Clínica"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Mascota Paciente"
            options={petOptions}
            value={formData.pet_id}
            onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
            required
          />

          <Select
            label="Veterinario Responsable"
            options={vetOptions}
            value={formData.vet_id}
            onChange={(e) => setFormData({ ...formData, vet_id: e.target.value })}
            required
          />

          <Select
            label="Tipo de Registro"
            options={typeOptions}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />

          <Input
            label="Fecha del Registro"
            type="date"
            value={formData.record_date}
            onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
          />
        </div>

        <Input
          label="Título / Motivo de Consulta"
          placeholder="Ej. Chequeo semestral y vacunación"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Textarea
          label="Descripción Médica y Síntomas"
          placeholder="Detallar examen físico, temperatura, antecedentes..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Diagnóstico Presuntivo / Definitivo"
            placeholder="Ej. Otitis media izquierda..."
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          />

          <Textarea
            label="Tratamiento Indicado"
            placeholder="Ej. Reposo 48hs, cura local..."
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
          />
        </div>

        <Input
          label="Medicación / Receta Prescrita"
          placeholder="Ej. Amoxicilina 500mg c/12hs por 7 días"
          value={formData.medication_prescribed}
          onChange={(e) => setFormData({ ...formData, medication_prescribed: e.target.value })}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Historia Clínica
          </Button>
        </div>
      </form>
    </Modal>
  );
}
