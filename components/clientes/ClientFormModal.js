"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ClientFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ full_name: "", email: "", phone: "", address: "" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Cliente" : "Registrar Nuevo Cliente"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre Completo"
          placeholder="Ej. María Fernández"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="maria@ejemplo.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Teléfono de Contacto"
          placeholder="+54 9 11 1234-5678"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Dirección de Domicilio"
          placeholder="Av. Corrientes 1234, CABA"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? "Guardar Cambios" : "Crear Cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
