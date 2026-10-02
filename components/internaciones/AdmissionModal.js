"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VETERINARIANS } from "@/lib/mockData";
import { useApp } from "@/context/AppContext";

const INITIAL_FORM_VALUES = {
  pet_id: "",
  vet_id: VETERINARIANS[0]?.id ?? "",
  reason: "",
  daily_evolution: "Ingreso en observación. Constantes vitales estables.",
  treatment: "Fluidoterapia de soporte.",
};

export function AdmissionModal({ isOpen, onClose, onSubmit }) {
  const { pets = [] } = useApp();

  const [formData, setFormData] = useState(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronización y reseteo del formulario cuando el modal se abre o cambia la lista de mascotas
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...INITIAL_FORM_VALUES,
        pet_id: pets.length > 0 ? pets[0].id : "",
        vet_id: VETERINARIANS[0]?.id ?? "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, pets]);

  // Opciones memorizadas para evitar recálculos en re-renders innecesarios
  const petOptions = useMemo(() => {
    return pets.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.species} - Dueño: ${p.owner_name})`,
    }));
  }, [pets]);

  const vetOptions = useMemo(() => {
    return VETERINARIANS.map((v) => ({
      value: v.id,
      label: v.full_name,
    }));
  }, []);

  // Manejador de cambios centralizado
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // Validación de campos obligatorios y limpieza de espacios en blanco
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pet_id || !formData.pet_id.trim()) {
      newErrors.pet_id = "Debe seleccionar una mascota.";
    }
    if (!formData.vet_id || !formData.vet_id.trim()) {
      newErrors.vet_id = "Debe asignar un veterinario a cargo.";
    }
    if (!formData.reason || !formData.reason.trim()) {
      newErrors.reason = "El motivo del ingreso es obligatorio.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const selectedVet = VETERINARIANS.find((v) => v.id === formData.vet_id);

      await onSubmit({
        ...formData,
        reason: formData.reason.trim(),
        daily_evolution: formData.daily_evolution.trim(),
        treatment: formData.treatment.trim(),
        vet_name: selectedVet ? selectedVet.full_name : "Veterinario a Cargo",
      });

      onClose();
    } catch (error) {
      console.error("Error al procesar el ingreso de internación:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ingreso de Internación Médica">
      {pets.length === 0 ? (
        <div className="py-8 text-center space-y-4">
          <p className="text-autumn-600 font-medium">
            No hay pacientes registrados en el sistema para ingresar a internación.
          </p>
          <p className="text-sm text-gray-500">
            Registre una mascota antes de proceder con el alta de cama.
          </p>
          <div className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Select
              label="Mascota Paciente"
              options={petOptions}
              value={formData.pet_id}
              onChange={(e) => handleChange("pet_id", e.target.value)}
              disabled={isSubmitting}
              required
            />
            {errors.pet_id && (
              <p className="mt-1 text-xs text-red-600" id="pet-error">
                {errors.pet_id}
              </p>
            )}
          </div>

          <div>
            <Select
              label="Veterinario a Cargo de Internación"
              options={vetOptions}
              value={formData.vet_id}
              onChange={(e) => handleChange("vet_id", e.target.value)}
              disabled={isSubmitting}
              required
            />
            {errors.vet_id && (
              <p className="mt-1 text-xs text-red-600" id="vet-error">
                {errors.vet_id}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Motivo del Ingreso"
              placeholder="Ej. Post-quirúrgico, deshidratación severa, pancreatitis..."
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              disabled={isSubmitting}
              required
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-600" id="reason-error">
                {errors.reason}
              </p>
            )}
          </div>

          <Textarea
            label="Tratamiento Inicial"
            placeholder="Ej. Suero Ringer Lactato a 20 ml/h, analgesia cada 8hs..."
            value={formData.treatment}
            onChange={(e) => handleChange("treatment", e.target.value)}
            disabled={isSubmitting}
          />

          <Textarea
            label="Primer Informe de Evolución"
            placeholder="Ej. Paciente ingresa alerta, T: 38.5ºC, FC: 110bpm..."
            value={formData.daily_evolution}
            onChange={(e) => handleChange("daily_evolution", e.target.value)}
            disabled={isSubmitting}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando e ingresando..." : "Confirmar Ingreso a Cama"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

AdmissionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};