"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

// Constantes estáticas fuera del componente para evitar recreación en cada render
const CATEGORY_OPTIONS = [
  { value: "Antibiótico", label: "Antibiótico" },
  { value: "Analgesia", label: "Analgesia / Antiinflamatorio" },
  { value: "Biológico", label: "Biológico / Vacuna" },
  { value: "Dermatología", label: "Dermatología" },
  { value: "Insumo Médico", label: "Insumo Médico / Jeringas" },
  { value: "Alimento", label: "Alimento Medicado" },
];

const getDefaultExpirationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 180);
  return date.toISOString().split("T")[0];
};

const INITIAL_STATE = {
  name: "",
  category: "Antibiótico",
  description: "",
  stock: 10,
  min_stock: 5,
  unit_price: 1500,
  supplier: "VetPharma Labs",
  expiration_date: "",
};

export function MedicineFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isEditMode = Boolean(initialData && initialData.id);

  // Sincronización del estado al abrir el modal o recibir datos iniciales
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          category: initialData.category || CATEGORY_OPTIONS[0].value,
          description: initialData.description || "",
          stock: initialData.stock ?? 0,
          min_stock: initialData.min_stock ?? 0,
          unit_price: initialData.unit_price ?? 0,
          supplier: initialData.supplier || "",
          expiration_date:
            initialData.expiration_date || getDefaultExpirationDate(),
        });
      } else {
        setFormData({
          ...INITIAL_STATE,
          expiration_date: getDefaultExpirationDate(),
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialData]);

  // Manejo centralizado de cambios de entrada
  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;

    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Limpiar error al modificar el campo
    setErrors((prev) => (prev[name] ? { ...prev, [name]: null } : prev));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Validación de formulario estricta
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es obligatorio.";
    }

    if (!formData.category) {
      newErrors.category = "Seleccione una categoría válida.";
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      newErrors.stock = "El stock debe ser un número igual o mayor a 0.";
    }

    if (formData.min_stock === "" || Number(formData.min_stock) < 0) {
      newErrors.min_stock = "El stock mínimo debe ser igual o mayor a 0.";
    }

    if (formData.unit_price === "" || Number(formData.unit_price) < 0) {
      newErrors.unit_price = "El precio debe ser un número positivo.";
    }

    if (!formData.expiration_date) {
      newErrors.expiration_date = "La fecha de vencimiento es obligatoria.";
    }

    return newErrors;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Marcar todos los campos como interactuados
      const allTouched = Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: error?.message || "Ocurrió un error al guardar el medicamento.",
      }));
    }
  };

  const modalTitle = isEditMode
    ? "Editar Medicamento / Insumo"
    : "Agregar Medicamento / Insumo";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <div
            className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md"
            role="alert"
          >
            {errors.form}
          </div>
        )}

        <Input
          label="Nombre del Producto *"
          name="name"
          placeholder="Ej. Cephalexina 500mg"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name && errors.name}
          aria-invalid={Boolean(touched.name && errors.name)}
          disabled={isLoading}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoría *"
            name="category"
            options={CATEGORY_OPTIONS}
            value={formData.category}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.category && errors.category}
            aria-invalid={Boolean(touched.category && errors.category)}
            disabled={isLoading}
            required
          />

          <Input
            label="Proveedor"
            name="supplier"
            placeholder="Ej. Zoetis Argentina"
            value={formData.supplier}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          />

          <Input
            label="Cantidad en Stock *"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.stock && errors.stock}
            aria-invalid={Boolean(touched.stock && errors.stock)}
            disabled={isLoading}
            required
          />

          <Input
            label="Stock Mínimo (Alerta) *"
            name="min_stock"
            type="number"
            min="0"
            step="1"
            value={formData.min_stock}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.min_stock && errors.min_stock}
            aria-invalid={Boolean(touched.min_stock && errors.min_stock)}
            disabled={isLoading}
            required
          />

          <Input
            label="Precio Unitario ($) *"
            name="unit_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.unit_price}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.unit_price && errors.unit_price}
            aria-invalid={Boolean(touched.unit_price && errors.unit_price)}
            disabled={isLoading}
            required
          />

          <Input
            label="Fecha de Vencimiento *"
            name="expiration_date"
            type="date"
            value={formData.expiration_date}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.expiration_date && errors.expiration_date}
            aria-invalid={Boolean(
              touched.expiration_date && errors.expiration_date
            )}
            disabled={isLoading}
            required
          />
        </div>

        <Textarea
          label="Descripción o Posología"
          name="description"
          placeholder="Ej. Comprimidos de 500mg, blister x 10..."
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          rows={3}
        />

        <div className="flex justify-end items-center space-x-3 pt-4 border-t border-autumn-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading
              ? "Guardando..."
              : isEditMode
              ? "Actualizar Insumo"
              : "Guardar Insumo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

MedicineFormModal.propTypes = {
  isOpen: PropTypes.bool.ariaRequired || PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
    stock: PropTypes.number,
    min_stock: PropTypes.number,
    unit_price: PropTypes.number,
    supplier: PropTypes.string,
    expiration_date: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};