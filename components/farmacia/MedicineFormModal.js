"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function MedicineFormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Medicamento",
    description: "",
    stock: 10,
    min_stock: 5,
    unit_price: 1500,
    supplier: "VetPharma Labs",
    expiration_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
    onClose();
  };

  const categoryOptions = [
    { value: "Antibiótico", label: "Antibiótico" },
    { value: "Analgesia", label: "Analgesia / Antiinflamatorio" },
    { value: "Biológico", label: "Biológico / Vacuna" },
    { value: "Dermatología", label: "Dermatología" },
    { value: "Insumo Médico", label: "Insumo Médico / Jeringas" },
    { value: "Alimento", label: "Alimento Medicado" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Medicamento / Insumo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Producto"
          placeholder="Ej. Cephalexina 500mg"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoría"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <Input
            label="Proveedor"
            placeholder="Ej. Zoetis Argentina"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />

          <Input
            label="Cantidad en Stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            required
          />

          <Input
            label="Stock Mínimo (Alerta)"
            type="number"
            value={formData.min_stock}
            onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
            required
          />

          <Input
            label="Precio Unitario ($)"
            type="number"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
          />

          <Input
            label="Fecha de Vencimiento"
            type="date"
            value={formData.expiration_date}
            onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
          />
        </div>

        <Textarea
          label="Descripción o Posología"
          placeholder="Ej. Comprimidos de 500mg, blister x 10..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Insumo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
