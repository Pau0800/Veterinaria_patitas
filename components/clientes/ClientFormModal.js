"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Loader2, User, Mail, Phone, MapPin } from "lucide-react";

// Estado inicial por defecto para limpiezas y reseteos
const DEFAULT_FORM_STATE = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
};

// Expresión regular para validación básica pero efectiva de correo electrónico
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function ClientFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Sincroniza el formulario cuando se abre el modal o cambian los datos iniciales
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id || undefined,
          full_name: initialData.full_name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          address: initialData.address || "",
        });
      } else {
        setFormData(DEFAULT_FORM_STATE);
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [initialData, isOpen]);

  /**
   * Valida exhaustivamente cada campo del formulario
   */
  const validateForm = useCallback((data) => {
    const newErrors = {};

    const trimmedName = (data.full_name || "").trim();
    if (!trimmedName) {
      newErrors.full_name = "El nombre completo es obligatorio.";
    } else if (trimmedName.length < 3) {
      newErrors.full_name = "El nombre debe tener al menos 3 caracteres.";
    }

    const trimmedEmail = (data.email || "").trim();
    if (!trimmedEmail) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Ingrese una dirección de correo electrónico válida.";
    }

    const trimmedPhone = (data.phone || "").trim();
    if (trimmedPhone && trimmedPhone.length < 6) {
      newErrors.phone = "El número de teléfono debe tener un formato válido.";
    }

    return newErrors;
  }, []);

  /**
   * Manejador centralizado de cambios en las entradas del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpia dinámicamente el error del campo actual mientras el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (submitError) {
      setSubmitError(null);
    }
  };

  /**
   * Procesa el envío del formulario con manejo de validaciones y asincronía
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpieza previa (sanitización de datos)
    const sanitizedData = {
      ...formData,
      full_name: (formData.full_name || "").trim(),
      email: (formData.email || "").trim().toLowerCase(),
      phone: (formData.phone || "").trim(),
      address: (formData.address || "").trim(),
    };

    const validationErrors = validateForm(sanitizedData);

    // Si existen errores de validación, detiene el envío y los muestra
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Permite que onSubmit sea asíncrono (petición API)
      await onSubmit(sanitizedData);
      onClose();
    } catch (err) {
      const errorMessage =
        err?.message ||
        "Ocurrió un error inesperado al guardar los cambios. Intente nuevamente.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData?.id || initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={isEditing ? "Editar Cliente" : "Registrar Nuevo Cliente"}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Banner de error general (API o Servidor) */}
        {submitError && (
          <div
            role="alert"
            className="flex items-center gap-3 p-3 text-sm rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60 transition-all duration-200"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <p className="font-medium">{submitError}</p>
          </div>
        )}

        {/* Nombre Completo */}
        <div>
          <Input
            name="full_name"
            label="Nombre Completo *"
            placeholder="Ej. María Fernández"
            value={formData.full_name}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.full_name}
            aria-invalid={Boolean(errors.full_name)}
            aria-describedby={errors.full_name ? "full_name-error" : undefined}
            icon={<User className="w-4 h-4 text-gray-400" />}
            required
          />
        </div>

        {/* Correo Electrónico */}
        <div>
          <Input
            name="email"
            type="email"
            label="Correo Electrónico *"
            placeholder="maria@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
            required
          />
        </div>

        {/* Teléfono de Contacto */}
        <div>
          <Input
            name="phone"
            type="tel"
            label="Teléfono de Contacto"
            placeholder="+54 9 11 1234-5678"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            icon={<Phone className="w-4 h-4 text-gray-400" />}
          />
        </div>

        {/* Dirección */}
        <div>
          <Input
            name="address"
            label="Dirección de Domicilio"
            placeholder="Av. Corrientes 1234, CABA"
            value={formData.address}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.address}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
            icon={<MapPin className="w-4 h-4 text-gray-400" />}
          />
        </div>

        {/* Acciones del Formulario */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 mt-6 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Cliente"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}