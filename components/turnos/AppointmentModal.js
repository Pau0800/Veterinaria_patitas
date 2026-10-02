"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { VETERINARIANS } from "@/lib/mockData";
import { useApp } from "@/context/AppContext";
import {
  Calendar,
  Clock,
  User,
  Dog,
  Stethoscope,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

/**
 * Horarios de atención disponibles (Memorizado en memoria estática)
 */
const TIME_SLOTS = [
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

/**
 * Opciones de estados de la cita
 */
const STATUS_OPTIONS = [
  { value: "solicitado", label: "Solicitado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "reprogramado", label: "Reprogramado" },
  { value: "cancelado", label: "Cancelado" },
];

const INITIAL_FORM_STATE = {
  pet_id: "",
  client_id: "",
  vet_id: "",
  appointment_date: "",
  appointment_time: "10:00",
  reason: "",
  notes: "",
  status: "solicitado",
};

export function AppointmentModal({
  isOpen = false,
  onClose = () => {},
  onSubmit = async () => {},
  initialData = null,
}) {
  const { pets = [], clients = [] } = useApp() || {};

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mapeo memorizado para las opciones de mascotas
  const petOptions = useMemo(() => {
    if (!Array.isArray(pets) || pets.length === 0) return [];
    return pets.map((p) => ({
      value: String(p.id),
      label: `${p.name} (${p.species || "Mascota"} - Dueño: ${
        p.owner_name || "Sin asignar"
      })`,
    }));
  }, [pets]);

  // Mapeo memorizado para las opciones de veterinarios
  const vetOptions = useMemo(() => {
    const list = Array.isArray(VETERINARIANS) ? VETERINARIANS : [];
    return list.map((v) => ({
      value: String(v.id),
      label: `${v.full_name || v.name} (${v.specialization || "General"})`,
    }));
  }, []);

  // Sincronización e inicialización defensiva del formulario
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setIsSubmitting(false);
      return;
    }

    const todayString = new Date().toISOString().split("T")[0];
    const defaultVetId = vetOptions.length > 0 ? vetOptions[0].value : "";
    const defaultPetId = petOptions.length > 0 ? petOptions[0].value : "";

    if (initialData && typeof initialData === "object") {
      const formattedDate = initialData.appointment_date
        ? String(initialData.appointment_date).split("T")[0]
        : todayString;

      setFormData({
        pet_id: initialData.pet_id ? String(initialData.pet_id) : defaultPetId,
        client_id: initialData.client_id ? String(initialData.client_id) : "",
        vet_id: initialData.vet_id ? String(initialData.vet_id) : defaultVetId,
        appointment_date: formattedDate,
        appointment_time: initialData.appointment_time || "10:00",
        reason: initialData.reason || "",
        notes: initialData.notes || "",
        status: initialData.status || "solicitado",
      });
    } else {
      const selectedPet = pets.find((p) => String(p.id) === defaultPetId);

      setFormData({
        ...INITIAL_FORM_STATE,
        pet_id: defaultPetId,
        client_id: selectedPet ? String(selectedPet.owner_id || selectedPet.client_id || "") : "",
        vet_id: defaultVetId,
        appointment_date: todayString,
      });
    }

    setErrors({});
  }, [initialData, isOpen, petOptions, vetOptions, pets]);

  // Manejador unificado de cambios y actualización automática del dueño
  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        // Sincronizar automáticamente el cliente cuando se selecciona una mascota
        if (field === "pet_id") {
          const selectedPet = pets.find((p) => String(p.id) === String(value));
          if (selectedPet) {
            updated.client_id = String(
              selectedPet.owner_id || selectedPet.client_id || ""
            );
          }
        }

        return updated;
      });

      // Limpiar error asociado al campo
      setErrors((prevErrors) => {
        if (!prevErrors[field]) return prevErrors;
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    },
    [pets]
  );

  // Validación rigurosa del formulario de turnos
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pet_id) {
      newErrors.pet_id = "Debes seleccionar una mascota registrada.";
    }

    if (!formData.vet_id) {
      newErrors.vet_id = "Selecciona un profesional veterinario.";
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = "La fecha del turno es requerida.";
    } else {
      const selectedDate = new Date(formData.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today && !initialData) {
        newErrors.appointment_date = "No puedes programar citas en fechas pasadas.";
      }
    }

    if (!formData.appointment_time) {
      newErrors.appointment_time = "Selecciona un horario disponible.";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Indica el motivo principal de la consulta.";
    } else if (formData.reason.trim().length < 4) {
      newErrors.reason = "El motivo debe tener al menos 4 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envío asíncrono con feedback de error
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const petList = Array.isArray(pets) ? pets : [];
      const vetList = Array.isArray(VETERINARIANS) ? VETERINARIANS : [];

      const selectedPet = petList.find((p) => String(p.id) === String(formData.pet_id));
      const selectedVet = vetList.find((v) => String(v.id) === String(formData.vet_id));

      const payload = {
        ...formData,
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
        vet_name: selectedVet ? selectedVet.full_name || selectedVet.name : "Veterinario Asignado",
        pet_name: selectedPet ? selectedPet.name : "Mascota",
        owner_name: selectedPet ? selectedPet.owner_name : "Cliente",
        client_id: formData.client_id || (selectedPet ? String(selectedPet.owner_id || "") : ""),
        status: initialData ? formData.status : "solicitado",
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Error al procesar la cita:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Ocurrió un error inesperado al guardar el turno.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-autumn-600" aria-hidden="true" />
          <span>
            {initialData ? "Editar / Reprogramar Turno" : "Solicitar Nuevo Turno"}
          </span>
        </div>
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5 py-1">
        {/* Banner de error general */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2.5 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Mascota para el Turno */}
        <div>
          {petOptions.length > 0 ? (
            <Select
              label={
                <span className="flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                  Mascota para el Turno *
                </span>
              }
              options={petOptions}
              value={formData.pet_id}
              onChange={(e) => handleChange("pet_id", e.target.value)}
              disabled={isSubmitting}
              error={errors.pet_id}
              required
            />
          ) : (
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-autumn-900 flex items-center gap-1.5">
                <Dog className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                Mascota para el Turno *
              </label>
              <div className="bg-amberGold-50 border border-amberGold-200 text-amberGold-800 text-xs p-2.5 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amberGold-600 shrink-0" aria-hidden="true" />
                <span>No hay mascotas registradas en la plataforma. Registra una primero.</span>
              </div>
            </div>
          )}
        </div>

        {/* Veterinario de Preferencia */}
        <Select
          label={
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
              Veterinario de Preferencia *
            </span>
          }
          options={vetOptions}
          value={formData.vet_id}
          onChange={(e) => handleChange("vet_id", e.target.value)}
          disabled={isSubmitting}
          error={errors.vet_id}
          required
        />

        {/* Fecha y Hora del Turno */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                Fecha del Turno *
              </span>
            }
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={formData.appointment_date}
            onChange={(e) => handleChange("appointment_date", e.target.value)}
            disabled={isSubmitting}
            error={errors.appointment_date}
            required
          />

          <Select
            label={
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                Horario Disponible *
              </span>
            }
            options={TIME_SLOTS}
            value={formData.appointment_time}
            onChange={(e) => handleChange("appointment_time", e.target.value)}
            disabled={isSubmitting}
            error={errors.appointment_time}
            required
          />
        </div>

        {/* Motivo de la Consulta */}
        <Input
          label={
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
              Motivo de la Consulta *
            </span>
          }
          placeholder="Ej. Vacunación, control post-operatorio, decaimiento..."
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          disabled={isSubmitting}
          error={errors.reason}
          aria-invalid={!!errors.reason}
          required
        />

        {/* Notas Adicionales */}
        <Textarea
          label="Notas Adicionales (Opcional)"
          placeholder="Ej. Requiere bozal en sala de espera, traer ecografía previa..."
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          disabled={isSubmitting}
          rows={3}
        />

        {/* Estado (Solo visible al editar) */}
        {initialData && (
          <Select
            label="Estado del Turno *"
            options={STATUS_OPTIONS}
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            disabled={isSubmitting}
            required
          />
        )}

        {/* Botones de Acción */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-autumn-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 font-semibold"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || petOptions.length === 0}
            className="px-6 font-semibold min-w-[170px]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Guardando...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>
                  {initialData ? "Guardar Cambios" : "Confirmar Turno"}
                </span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

AppointmentModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pet_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    client_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vet_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    appointment_date: PropTypes.string,
    appointment_time: PropTypes.string,
    reason: PropTypes.string,
    notes: PropTypes.string,
    status: PropTypes.string,
  }),
};