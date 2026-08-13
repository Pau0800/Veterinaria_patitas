"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function PetFormModal({ isOpen, onClose, onSubmit, initialData, clients = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    species: "Perro",
    breed: "",
    sex: "Macho",
    age_years: 1,
    birth_date: "",
    weight_kg: 5.0,
    color: "",
    photo_url: "",
    microchip: "",
    owner_id: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        species: "Perro",
        breed: "",
        sex: "Macho",
        age_years: 1,
        birth_date: new Date().toISOString().split("T")[0],
        weight_kg: 5.0,
        color: "",
        photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
        microchip: "",
        owner_id: clients.length > 0 ? clients[0].id : "",
        notes: "",
      });
    }
  }, [initialData, isOpen, clients]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.species) return;
    onSubmit(formData);
    onClose();
  };

  const ownerOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.full_name} (${c.email})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Ficha de Mascota" : "Registrar Nueva Mascota"}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la Mascota"
            placeholder="Ej. Max"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Dueño / Cliente Asociado"
            options={ownerOptions}
            value={formData.owner_id}
            onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            required
          />

          <Select
            label="Especie"
            options={[
              { value: "Perro", label: "Perro" },
              { value: "Gato", label: "Gato" },
              { value: "Ave", label: "Ave" },
              { value: "Exótico", label: "Exótico / Otro" },
            ]}
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
          />

          <Input
            label="Raza"
            placeholder="Ej. Golden Retriever"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          />

          <Select
            label="Sexo"
            options={[
              { value: "Macho", label: "Macho" },
              { value: "Hembra", label: "Hembra" },
            ]}
            value={formData.sex}
            onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
          />

          <Input
            label="Peso Actual (kg)"
            type="number"
            step="0.1"
            placeholder="Ej. 12.5"
            value={formData.weight_kg}
            onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
          />

          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
          />

          <Input
            label="Color del Pelaje"
            placeholder="Ej. Dorado / Marrón"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />

          <Input
            label="Código de Microchip (Opcional)"
            placeholder="Ej. CHIP-985141"
            value={formData.microchip}
            onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
          />

          <Input
            label="URL Foto de Mascota"
            placeholder="https://..."
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
          />
        </div>

        <Textarea
          label="Observaciones y Alergias"
          placeholder="Ej. Alérgico a la penicilina, carácter nervioso en clínica..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? "Actualizar Mascota" : "Guardar Mascota"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
