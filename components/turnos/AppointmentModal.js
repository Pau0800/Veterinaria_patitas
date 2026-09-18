"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VETERINARIANS } from "@/lib/mockData";
import { useApp } from "@/context/AppContext";

export function AppointmentModal({ isOpen, onClose, onSubmit, initialData }) {
  const { pets, clients } = useApp();

  const [formData, setFormData] = useState({
    pet_id: "",
    client_id: "",
    vet_id: VETERINARIANS[0].id,
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "10:00",
    reason: "",
    notes: "",
    status: "solicitado",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        pet_id: pets.length > 0 ? pets[0].id : "",
        client_id: clients.length > 0 ? clients[0].id : "",
        vet_id: VETERINARIANS[0].id,
        appointment_date: new Date().toISOString().split("T")[0],
        appointment_time: "10:00",
        reason: "",
        notes: "",
        status: "solicitado",
      });
    }
  }, [initialData, isOpen, pets, clients]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pet_id || !formData.reason || !formData.appointment_date) return;

    const pet = pets.find((p) => p.id === formData.pet_id);
    const vet = VETERINARIANS.find((v) => v.id === formData.vet_id);

    onSubmit({
      ...formData,
      vet_name: vet ? vet.full_name : "Veterinario Asignado",
      pet_name: pet ? pet.name : "Mascota",
      status: initialData ? formData.status : "solicitado",
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

  const timeOptions = [
    { value: "09:00", label: "09:00 AM" },
    { value: "09:30", label: "09:30 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "10:30", label: "10:30 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "11:30", label: "11:30 AM" },
    { value: "15:00", label: "03:00 PM" },
    { value: "15:30", label: "03:30 PM" },
    { value: "16:00", label: "04:00 PM" },
    { value: "16:30", label: "04:30 PM" },
    { value: "17:00", label: "05:00 PM" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar / Reprogramar Turno" : "Solicitar Nuevo Turno"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Mascota para el Turno"
          options={petOptions}
          value={formData.pet_id}
          onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
          required
        />

        <Select
          label="Veterinario de Preferencia"
          options={vetOptions}
          value={formData.vet_id}
          onChange={(e) => setFormData({ ...formData, vet_id: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha del Turno"
            type="date"
            value={formData.appointment_date}
            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            required
          />

          <Select
            label="Horario Disponible"
            options={timeOptions}
            value={formData.appointment_time}
            onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
            required
          />
        </div>

        <Input
          label="Motivo de la Consulta"
          placeholder="Ej. Vacunación, control post-operatorio, decaimiento..."
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />

        <Textarea
          label="Notas Adicionales (Opcional)"
          placeholder="Ej. Requiere bozal en sala de espera, traer ecografía previa..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        {initialData && (
          <Select
            label="Estado"
            options={[
              { value: "solicitado", label: "Solicitado" },
              { value: "confirmado", label: "Confirmado" },
              { value: "reprogramado", label: "Reprogramado" },
              { value: "cancelado", label: "Cancelado" },
            ]}
            value={formData.status || "solicitado"}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          />
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? "Guardar Cambios" : "Confirmar Solicitud de Turno"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
