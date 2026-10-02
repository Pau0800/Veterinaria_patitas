"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VETERINARIANS as MOCK_VETERINARIANS } from "@/lib/mockData";
import { AlertCircle, Loader2, Save, X } from "lucide-react";

// ----------------------------------------------------------------------
// Constantes Inmutables
// ----------------------------------------------------------------------

const RECORD_TYPES = [
  { value: "Consulta General", label: "Consulta General" },
  { value: "Diagnóstico", label: "Diagnóstico" },
  { value: "Tratamiento", label: "Tratamiento" },
  { value: "Medicación", label: "Medicación" },
  { value: "Cirugía", label: "Cirugía" },
  { value: "Estudios", label: "Estudios / Rayos X / Laboratorio" },
  { value: "Evolución", label: "Evolución Médica" },
];

export function MedicalRecordModal({
  isOpen,
  onClose,
  onSubmit,
  pets = [],
  veterinarians = MOCK_VETERINARIANS,
  defaultValues = null,
  isLoading: externalLoading = false,
}) {
  // 1. Estado inicial memoizado dinámicamente
  const getInitialState = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const defaultPet = pets.length > 0 ? pets[0].id : "";
    const defaultVet = veterinarians.length > 0 ? veterinarians[0].id : "";

    return {
      pet_id: defaultPet,
      vet_id: defaultVet,
      type: "Consulta General",
      title: "",
      description: "",
      diagnosis: "",
      treatment: "",
      medication_prescribed: "",
      record_date: today,
      ...defaultValues,
    };
  }, [pets, veterinarians, defaultValues]);

  const [formData, setFormData] = useState(getInitialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modo edición vs. creación
  const isEditing = Boolean(defaultValues && defaultValues.id);

  // Reset del estado al abrir el modal o cambiar las props base
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, getInitialState]);

  // 2. Memoización de Opciones para Selects (Optimización de Rendimiento)
  const petOptions = useMemo(
    () => [
      { value: "", label: "Seleccionar mascota..." },
      ...pets.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.species}) — Dueño: ${p.owner_name}`,
      })),
    ],
    [pets]
  );

  const vetOptions = useMemo(
    () => [
      { value: "", label: "Seleccionar profesional..." },
      ...veterinarians.map((v) => ({
        value: v.id,
        label: `${v.full_name} (${v.specialization})`,
      })),
    ],
    [veterinarians]
  );

  const typeOptions = useMemo(
    () => [
      { value: "", label: "Seleccionar tipo..." },
      ...RECORD_TYPES.map((t) => ({ value: t.value, label: t.label })),
    ],
    []
  );

  // 3. Handlers Optimizados
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Limpia el error del campo al modificarlo
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  // 4. Validación de Formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pet_id) newErrors.pet_id = "Debe seleccionar una mascota.";
    if (!formData.vet_id) newErrors.vet_id = "Debe seleccionar un profesional.";
    if (!formData.type) newErrors.type = "Seleccione el tipo de registro.";
    if (!formData.title?.trim()) newErrors.title = "El título o motivo es obligatorio.";
    if (!formData.description?.trim()) newErrors.description = "La descripción médica es obligatoria.";
    if (!formData.record_date) newErrors.record_date = "La fecha es requerida.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 5. Submit Handler Asíncrono con Prevención de Doble Clic
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting || externalLoading) return;

    try {
      setIsSubmitting(true);
      const selectedVet = veterinarians.find(
        (v) => String(v.id) === String(formData.vet_id)
      );

      const payload = {
        ...formData,
        vet_name: selectedVet ? selectedVet.full_name : "Veterinario No Especificado",
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Error al guardar la historia clínica:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || externalLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Registro de Historia Clínica" : "Nuevo Registro Clínico"}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Encabezado e Instrucciones */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete los detalles de la atención médica. Los campos marcados con (*) son obligatorios.
        </p>

        {/* Sección: Selección Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Mascota Paciente *"
              name="pet_id"
              options={petOptions}
              value={formData.pet_id}
              onChange={handleChange}
              disabled={isPending}
              error={errors.pet_id}
            />
            {errors.pet_id && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.pet_id}
              </p>
            )}
          </div>

          <div>
            <Select
              label="Veterinario Responsable *"
              name="vet_id"
              options={vetOptions}
              value={formData.vet_id}
              onChange={handleChange}
              disabled={isPending}
              error={errors.vet_id}
            />
            {errors.vet_id && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.vet_id}
              </p>
            )}
          </div>

          <div>
            <Select
              label="Tipo de Registro *"
              name="type"
              options={typeOptions}
              value={formData.type}
              onChange={handleChange}
              disabled={isPending}
              error={errors.type}
            />
            {errors.type && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.type}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Fecha del Registro *"
              name="record_date"
              type="date"
              value={formData.record_date}
              onChange={handleChange}
              disabled={isPending}
              error={errors.record_date}
            />
            {errors.record_date && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.record_date}
              </p>
            )}
          </div>
        </div>

        {/* Sección: Información Principal */}
        <div>
          <Input
            label="Título / Motivo de Consulta *"
            name="title"
            placeholder="Ej. Chequeo semestral, aplicación de vacunas o control sintomático"
            value={formData.title}
            onChange={handleChange}
            disabled={isPending}
            error={errors.title}
            maxLength={150}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
            </p>
          )}
        </div>

        <div>
          <Textarea
            label="Descripción Médica y Síntomas *"
            name="description"
            placeholder="Detalle el examen físico, constante vital (temperatura, peso), anamnesis..."
            value={formData.description}
            onChange={handleChange}
            disabled={isPending}
            rows={3}
            error={errors.description}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
            </p>
          )}
        </div>

        {/* Sección: Diagnóstico y Tratamiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Diagnóstico Presuntivo / Definitivo"
            name="diagnosis"
            placeholder="Ej. Otitis externa bilateral leve"
            value={formData.diagnosis}
            onChange={handleChange}
            disabled={isPending}
            rows={3}
          />

          <Textarea
            label="Tratamiento Indicado"
            name="treatment"
            placeholder="Ej. Limpieza auricular cada 12hs, reposo relativo"
            value={formData.treatment}
            onChange={handleChange}
            disabled={isPending}
            rows={3}
          />
        </div>

        {/* Sección: Prescripción */}
        <div>
          <Input
            label="Medicación / Receta Prescrita"
            name="medication_prescribed"
            placeholder="Ej. Amoxicilina + Ácido Clavulánico 250mg c/12hs por 7 días"
            value={formData.medication_prescribed}
            onChange={handleChange}
            disabled={isPending}
          />
        </div>

        {/* Barra de Acciones del Formulario */}
        <div className="flex items-center justify-end space-x-3 pt-5 border-t border-slate-200 dark:border-slate-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="min-w-[140px] flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? "Actualizar Registro" : "Guardar Registro"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}