"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Dog,
  User,
  Calendar,
  Weight,
  Palette,
  Image as ImageIcon,
  QrCode,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Upload,
  Trash2,
  Link2,
} from "lucide-react";

const SPECIES_OPTIONS = [
  { value: "Perro", label: "Perro" },
  { value: "Gato", label: "Gato" },
  { value: "Ave", label: "Ave" },
  { value: "Exótico", label: "Exótico / Otro" },
];

const SEX_OPTIONS = [
  { value: "Macho", label: "Macho" },
  { value: "Hembra", label: "Hembra" },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const INITIAL_FORM_STATE = {
  name: "",
  species: "Perro",
  breed: "",
  sex: "Macho",
  age_years: 0,
  birth_date: "",
  weight_kg: "",
  color: "",
  photo_url: "",
  microchip: "",
  owner_id: "",
  notes: "",
};

const calculateAgeInYears = (birthDateString) => {
  if (!birthDateString) return 0;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
};

function sanitizeFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();
}

export function PetFormModal({
  isOpen = false,
  onClose = () => {},
  onSubmit = async () => {},
  initialData = null,
  clients = [],
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para subida local de imagen a Supabase Storage
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef(null);

  const ownerOptions = useMemo(() => {
    if (!Array.isArray(clients) || clients.length === 0) return [];
    return clients.map((client) => ({
      value: String(client.id),
      label: `${client.full_name || client.name || "Sin nombre"} (${
        client.email || "Sin email"
      })`,
    }));
  }, [clients]);

  // Limpia ObjectURL al desmontar o cambiar
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setIsSubmitting(false);
      setSelectedFile(null);
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setPreviewError(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(null);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setPreviewError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (initialData && typeof initialData === "object") {
      const formattedBirthDate = initialData.birth_date
        ? String(initialData.birth_date).split("T")[0]
        : "";

      setFormData({
        name: initialData.name || "",
        species: initialData.species || "Perro",
        breed: initialData.breed || "",
        sex: initialData.sex || "Macho",
        age_years: initialData.age_years ?? calculateAgeInYears(formattedBirthDate),
        birth_date: formattedBirthDate,
        weight_kg:
          initialData.weight_kg !== null && initialData.weight_kg !== undefined
            ? String(initialData.weight_kg)
            : "",
        color: initialData.color || "",
        photo_url: initialData.photo_url || "",
        microchip: initialData.microchip || "",
        owner_id: initialData.owner_id ? String(initialData.owner_id) : "",
        notes: initialData.notes || "",
      });
    } else {
      const todayString = new Date().toISOString().split("T")[0];
      const defaultOwnerId = ownerOptions.length > 0 ? ownerOptions[0].value : "";

      setFormData({
        ...INITIAL_FORM_STATE,
        birth_date: todayString,
        owner_id: defaultOwnerId,
      });
    }

    setErrors({});
  }, [initialData, isOpen, ownerOptions]);

  const handleChange = useCallback((field, value) => {
    if (field === "photo_url") {
      // Si el usuario escribe o pega una URL externa, descartamos el archivo local pendiente
      setSelectedFile(null);
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setPreviewError(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "birth_date") {
        updated.age_years = calculateAgeInYears(value);
      }
      return updated;
    });

    setErrors((prevErrors) => {
      if (!prevErrors[field]) return prevErrors;
      const newErrors = { ...prevErrors };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo_url: "Formato no válido. Usá una imagen JPG, PNG, WEBP o GIF.",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        photo_url: "La imagen supera el límite máximo de 5 MB.",
      }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    setSelectedFile(file);
    setPreviewError(false);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photo_url;
      return next;
    });
  }, []);

  const handleClearPhoto = useCallback(() => {
    setSelectedFile(null);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setPreviewError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormData((prev) => ({ ...prev, photo_url: "" }));
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre de la mascota es obligatorio.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!formData.owner_id) {
      newErrors.owner_id = "Debes seleccionar un cliente/dueño registrado.";
    }

    if (!formData.species) {
      newErrors.species = "Selecciona una especie válida.";
    }

    if (formData.weight_kg !== "") {
      const parsedWeight = parseFloat(formData.weight_kg);
      if (isNaN(parsedWeight) || parsedWeight < 0) {
        newErrors.weight_kg = "Ingresa un peso válido (mayor o igual a 0).";
      }
    }

    if (formData.birth_date) {
      const selectedDate = new Date(formData.birth_date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.birth_date = "La fecha de nacimiento no puede ser futura.";
      }
    }

    if (!selectedFile && formData.photo_url.trim()) {
      try {
        const parsed = new URL(formData.photo_url.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          newErrors.photo_url = "La URL debe comenzar con http:// o https://.";
        }
      } catch {
        newErrors.photo_url = "Ingresa una URL de imagen válida (http/https).";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadPhotoToStorage = async (file) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Supabase no está configurado para subir imágenes desde el computador."
      );
    }

    const supabase = createClient();
    const safeName = sanitizeFileName(file.name || "mascota.jpg");
    const filePath = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `No se pudo subir la imagen a Supabase Storage: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage.from("pet-photos").getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error("No se pudo obtener la URL pública de la imagen subida.");
    }

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      let finalPhotoUrl = formData.photo_url.trim();
      if (selectedFile) {
        finalPhotoUrl = await uploadPhotoToStorage(selectedFile);
      }

      const parsedWeight =
        formData.weight_kg !== "" ? parseFloat(formData.weight_kg) : null;

      const payload = {
        ...formData,
        name: formData.name.trim(),
        breed: formData.breed.trim() || "Mestizo",
        color: formData.color.trim(),
        photo_url: finalPhotoUrl,
        microchip: formData.microchip.trim(),
        notes: formData.notes.trim(),
        weight_kg: parsedWeight,
        age_years: Number(formData.age_years),
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Error al procesar el formulario de mascota:", error);
      setErrors((prev) => ({
        ...prev,
        submit:
          error.message || "Ocurrió un error inesperado al guardar la ficha.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePreviewUrl = localPreviewUrl || formData.photo_url.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={
        <div className="flex items-center space-x-2">
          <Dog className="w-6 h-6 text-autumn-600" aria-hidden="true" />
          <span>
            {initialData ? "Editar Ficha de Mascota" : "Registrar Nueva Mascota"}
          </span>
        </div>
      }
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5 py-1">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2.5 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errors.submit}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre de la Mascota */}
          <div>
            <Input
              label={
                <span className="flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                  Nombre de la Mascota *
                </span>
              }
              placeholder="Ej. Max, Bella, Thor"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isSubmitting}
              error={errors.name}
              aria-invalid={!!errors.name}
              required
            />
          </div>

          {/* Dueño / Cliente */}
          <div>
            {ownerOptions.length > 0 ? (
              <Select
                label={
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                    Dueño / Cliente Asociado *
                  </span>
                }
                options={ownerOptions}
                value={formData.owner_id}
                onChange={(e) => handleChange("owner_id", e.target.value)}
                disabled={isSubmitting}
                error={errors.owner_id}
                required
              />
            ) : (
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-autumn-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                  Dueño / Cliente Asociado *
                </label>
                <div className="bg-amberGold-50 border border-amberGold-200 text-amberGold-800 text-xs p-2.5 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amberGold-600 shrink-0" aria-hidden="true" />
                  <span>No hay clientes disponibles. Registra un cliente antes.</span>
                </div>
              </div>
            )}
          </div>

          {/* Especie */}
          <Select
            label="Especie *"
            options={SPECIES_OPTIONS}
            value={formData.species}
            onChange={(e) => handleChange("species", e.target.value)}
            disabled={isSubmitting}
            error={errors.species}
            required
          />

          {/* Raza */}
          <Input
            label="Raza"
            placeholder="Ej. Golden Retriever, Mestizo, Persa"
            value={formData.breed}
            onChange={(e) => handleChange("breed", e.target.value)}
            disabled={isSubmitting}
          />

          {/* Sexo */}
          <Select
            label="Sexo"
            options={SEX_OPTIONS}
            value={formData.sex}
            onChange={(e) => handleChange("sex", e.target.value)}
            disabled={isSubmitting}
          />

          {/* Peso (kg) */}
          <Input
            label={
              <span className="flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                Peso Actual (kg)
              </span>
            }
            type="number"
            step="0.1"
            min="0"
            placeholder="Ej. 12.5"
            value={formData.weight_kg}
            onChange={(e) => handleChange("weight_kg", e.target.value)}
            disabled={isSubmitting}
            error={errors.weight_kg}
          />

          {/* Fecha de Nacimiento */}
          <Input
            label={
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                Fecha de Nacimiento
              </span>
            }
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={formData.birth_date}
            onChange={(e) => handleChange("birth_date", e.target.value)}
            disabled={isSubmitting}
            error={errors.birth_date}
          />

          {/* Color del Pelaje */}
          <Input
            label={
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                Color del Pelaje
              </span>
            }
            placeholder="Ej. Dorado / Marrón / Atigrado"
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
            disabled={isSubmitting}
          />

          {/* Código de Microchip */}
          <div className="md:col-span-2">
            <Input
              label={
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                  Código de Microchip (Opcional)
                </span>
              }
              placeholder="Ej. CHIP-985141002"
              value={formData.microchip}
              onChange={(e) => handleChange("microchip", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Sección de Fotografía: Subida desde PC o URL Externa + Vista Previa */}
        <div className="bg-autumn-50/70 border border-autumn-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-autumn-900 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-autumn-600" aria-hidden="true" />
              Fotografía de la Mascota
            </span>
            {(activePreviewUrl || selectedFile) && (
              <button
                type="button"
                onClick={handleClearPhoto}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Quitar foto</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Vista previa */}
            <div className="w-24 h-24 rounded-2xl border border-autumn-200 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
              {activePreviewUrl && !previewError ? (
                <img
                  src={activePreviewUrl}
                  alt="Vista previa de mascota"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-autumn-400 p-2 text-center">
                  <ImageIcon className="w-6 h-6 opacity-60" aria-hidden="true" />
                  <span className="text-[10px] mt-1 font-medium">Sin vista previa</span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              {/* Opción A: Subir archivo local */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="hidden"
                  id="pet-photo-file-input"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="pet-photo-file-input"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-autumn-300 text-autumn-900 hover:bg-autumn-100/70 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-autumn-600" aria-hidden="true" />
                    <span>Subir imagen desde el computador</span>
                  </label>
                  {selectedFile ? (
                    <span className="text-[11px] font-semibold text-sage-700 bg-sage-50 border border-sage-200 px-2.5 py-1 rounded-lg truncate max-w-[220px]">
                      {selectedFile.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-autumn-700/70">
                      JPG, PNG o WEBP (máx. 5 MB)
                    </span>
                  )}
                </div>
              </div>

              {/* Opción B: Pegar URL externa */}
              <Input
                label={
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Link2 className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                    O pegá una URL externa de imagen
                  </span>
                }
                placeholder="https://ejemplo.com/foto.jpg"
                value={formData.photo_url}
                onChange={(e) => handleChange("photo_url", e.target.value)}
                disabled={isSubmitting}
                error={errors.photo_url}
              />
            </div>
          </div>
        </div>

        {/* Observaciones y Alergias */}
        <Textarea
          label={
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
              Observaciones Clínicas / Alergias
            </span>
          }
          placeholder="Ej. Alérgico a la penicilina, carácter reactivo en presencia de otros perros, dieta especial..."
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          disabled={isSubmitting}
          rows={3}
        />

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
            disabled={isSubmitting || ownerOptions.length === 0}
            className="px-6 font-semibold min-w-[150px]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Guardando...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{initialData ? "Actualizar Mascota" : "Guardar Mascota"}</span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

PetFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    species: PropTypes.string,
    breed: PropTypes.string,
    sex: PropTypes.string,
    age_years: PropTypes.number,
    birth_date: PropTypes.string,
    weight_kg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    color: PropTypes.string,
    photo_url: PropTypes.string,
    microchip: PropTypes.string,
    owner_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    notes: PropTypes.string,
  }),
  clients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      full_name: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
    })
  ),
};
