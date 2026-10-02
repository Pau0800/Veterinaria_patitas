"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VETERINARIANS } from "@/lib/mockData";
import { useApp } from "@/context/AppContext";

// Lista estática fuera del componente para no reallocar memoria en cada render
const COMMON_VACCINES = [
  { value: "Séxtuple Canina", label: "Séxtuple Canina (DAPP)" },
  { value: "Antirrábica", label: "Antirrábica Anual" },
  { value: "Triple Felina", label: "Triple Felina (VRCP)" },
  { value: "Leucemia Felina (FeLV)", label: "Leucemia Felina (FeLV)" },
  { value: "Tos de las Kennels (Bordetella)", label: "Tos de las Kennels (Bordetella)" },
  { value: "Otra", label: "Otra / Personalizada" },
];

/**
 * Retorna fecha local formateada en YYYY-MM-DD
 * evitando desfasajes de zona horaria generados por toISOString()
 */
function getFormattedDate(offsetYears = 0) {
  const date = new Date();
  if (offsetYears !== 0) {
    date.setFullYear(date.getFullYear() + offsetYears);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function VaccineFormModal({ isOpen, onClose, onSubmit }) {
  const { pets = [] } = useApp();

  const [formData, setFormData] = useState({
    pet_id: "",
    vaccine_name: COMMON_VACCINES[0].value,
    custom_vaccine_name: "",
    application_date: getFormattedDate(0),
    next_due_date: getFormattedDate(1),
    vet_id: VETERINARIANS?.[0]?.id || "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reiniciar estado cada vez que el modal se abre
  const resetForm = useCallback(() => {
    setFormData({
      pet_id: pets.length > 0 ? pets[0].id : "",
      vaccine_name: COMMON_VACCINES[0].value,
      custom_vaccine_name: "",
      application_date: getFormattedDate(0),
      next_due_date: getFormattedDate(1),
      vet_id: VETERINARIANS?.[0]?.id || "",
      notes: "",
    });
    setErrors({});
    setIsSubmitting(false);
  }, [pets]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Memorización de listas derivadas
  const petOptions = useMemo(() => {
    return pets.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.species}${p.owner_name ? ` - Dueño: ${p.owner_name}` : ""})`,
    }));
  }, [pets]);

  const vetOptions = useMemo(() => {
    return (VETERINARIANS || []).map((v) => ({
      value: v.id,
      label: v.full_name,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpia el mensaje de error del campo al editar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.pet_id) {
      newErrors.pet_id = "Debe seleccionar una mascota.";
    }

    const selectedVaccine =
      formData.vaccine_name === "Otra"
        ? formData.custom_vaccine_name.trim()
        : formData.vaccine_name;

    if (!selectedVaccine) {
      newErrors.vaccine_name = "Debe especificar el nombre de la vacuna.";
    }

    if (!formData.application_date) {
      newErrors.application_date = "La fecha de aplicación es requerida.";
    }

    if (!formData.next_due_date) {
      newErrors.next_due_date = "La fecha de próxima dosis es requerida.";
    } else if (
      formData.application_date &&
      new Date(formData.next_due_date) < new Date(formData.application_date)
    ) {
      newErrors.next_due_date =
        "La fecha de vencimiento no puede ser anterior a la fecha de aplicación.";
    }

    if (!formData.vet_id) {
      newErrors.vet_id = "Debe seleccionar un veterinario responsable.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const selectedVet = VETERINARIANS.find((v) => v.id === formData.vet_id);
      const finalVaccineName =
        formData.vaccine_name === "Otra"
          ? formData.custom_vaccine_name.trim()
          : formData.vaccine_name;

      const payload = {
        pet_id: formData.pet_id,
        vaccine_name: finalVaccineName,
        application_date: formData.application_date,
        next_due_date: formData.next_due_date,
        vet_id: formData.vet_id,
        vet_name: selectedVet ? selectedVet.full_name : "Veterinario",
        notes: formData.notes.trim(),
        status: "aplicada",
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Error al registrar la vacuna:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Ocurrió un error al procesar el registro. Inténtelo nuevamente.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Aplicación de Vacuna">
      {pets.length === 0 ? (
        <div className="py-6 text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No hay mascotas registradas en el sistema para asignar una vacuna.
          </p>
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors.submit && (
            <div
              role="alert"
              className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md"
            >
              {errors.submit}
            </div>
          )}

          <Select
            label="Mascota Paciente"
            name="pet_id"
            options={petOptions}
            value={formData.pet_id}
            onChange={handleChange}
            required
            aria-invalid={!!errors.pet_id}
            error={errors.pet_id}
          />

          <Select
            label="Nombre de la Vacuna"
            name="vaccine_name"
            options={COMMON_VACCINES}
            value={formData.vaccine_name}
            onChange={handleChange}
            required
            aria-invalid={!!errors.vaccine_name}
            error={errors.vaccine_name}
          />

          {formData.vaccine_name === "Otra" && (
            <Input
              label="Especifique el nombre de la vacuna"
              name="custom_vaccine_name"
              type="text"
              placeholder="Ej. Brucelosis Canina"
              value={formData.custom_vaccine_name}
              onChange={handleChange}
              required
              aria-invalid={!!errors.vaccine_name}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Aplicación"
              name="application_date"
              type="date"
              value={formData.application_date}
              onChange={handleChange}
              required
              aria-invalid={!!errors.application_date}
              error={errors.application_date}
            />

            <Input
              label="Próxima Dosis (Vencimiento)"
              name="next_due_date"
              type="date"
              value={formData.next_due_date}
              onChange={handleChange}
              required
              min={formData.application_date}
              aria-invalid={!!errors.next_due_date}
              error={errors.next_due_date}
            />
          </div>

          <Select
            label="Veterinario Responsable"
            name="vet_id"
            options={vetOptions}
            value={formData.vet_id}
            onChange={handleChange}
            required
            aria-invalid={!!errors.vet_id}
            error={errors.vet_id}
          />

          <Textarea
            label="Observaciones (Nº de Lote, marca...)"
            name="notes"
            placeholder="Lote Nº 84920, laboratorio Zoetis..."
            value={formData.notes}
            onChange={handleChange}
            rows={3}
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
              variant="sage"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar Vacuna"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}