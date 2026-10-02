"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { MedicineFormModal } from "@/components/farmacia/MedicineFormModal";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Pill,
  PlusCircle,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  Building2,
  ShieldAlert,
  X,
  Calendar,
  Clock,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";

const e = React.createElement;

// Categorías predefinidas del sistema
const DEFAULT_CATEGORIES = [
  "TODAS",
  "Antibiótico",
  "Analgesia",
  "Biológico",
  "Dermatología",
  "Insumo Médico",
];

export default function PharmacyPage() {
  const {
    pharmacy = [],
    addPharmacyItem,
    updatePharmacyStock,
    currentRole,
  } = useApp();

  // Estados locales de la vista
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Obtención dinámica y unificada de categorías
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set(DEFAULT_CATEGORIES);
    pharmacy.forEach((item) => {
      if (item.category) categoriesSet.add(item.category);
    });
    return Array.from(categoriesSet);
  }, [pharmacy]);

  // 2. Cálculo memoizado de alertas de inventario (Stock Crítico y Vencimientos)
  const { lowStockItems, expiredItems, expiringSoonItems } = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const lowStock = [];
    const expired = [];
    const expiringSoon = [];

    pharmacy.forEach((item) => {
      // Chequeo de bajo stock
      if (item.stock <= (item.min_stock ?? 0)) {
        lowStock.push(item);
      }

      // Chequeo de vencimiento
      if (item.expiration_date) {
        const expDate = new Date(item.expiration_date);
        if (expDate < now) {
          expired.push(item);
        } else if (expDate <= thirtyDaysFromNow) {
          expiringSoon.push(item);
        }
      }
    });

    return {
      lowStockItems: lowStock,
      expiredItems: expired,
      expiringSoonItems: expiringSoon,
    };
  }, [pharmacy]);

  // 3. Filtrado memoizado multi-criterio de medicamentos
  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return pharmacy.filter((item) => {
      const matchesCategory =
        selectedCategory === "TODAS" || item.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const nameMatch = item.name?.toLowerCase().includes(query);
      const supplierMatch = item.supplier?.toLowerCase().includes(query);
      const descMatch = item.description?.toLowerCase().includes(query);

      return nameMatch || supplierMatch || descMatch;
    });
  }, [pharmacy, selectedCategory, searchTerm]);

  // Handlers memoizados
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const handleCreateItem = useCallback(
    (data) => {
      addPharmacyItem(data);
      handleCloseModal();
    },
    [addPharmacyItem, handleCloseModal]
  );

  const handleStockIncrement = useCallback(
    (id) => {
      updatePharmacyStock(id, 1);
    },
    [updatePharmacyStock]
  );

  const handleStockDecrement = useCallback(
    (id, currentStock) => {
      if (currentStock <= 0) return;
      updatePharmacyStock(id, -1);
    },
    [updatePharmacyStock]
  );

  // Control de Acceso por Rol (RBAC)
  if (currentRole === "Cliente" || currentRole === "Recepcionista") {
    return e(
      "main",
      { className: "p-4 sm:p-8 max-w-lg mx-auto" },
      e(
        "div",
        {
          className:
            "flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-autumn-200 shadow-autumn-sm text-center space-y-4",
        },
        e(
          "div",
          { className: "p-3.5 bg-autumn-100 rounded-full text-autumn-600" },
          e(ShieldAlert, { className: "w-10 h-10" })
        ),
        e(
          "h2",
          { className: "text-xl font-bold text-autumn-900 tracking-tight" },
          "Acceso Restringido a Farmacia"
        ),
        e(
          "p",
          { className: "text-sm text-autumn-800/80 leading-relaxed" },
          "La gestión de inventario de medicamentos e insumos está reservada exclusivamente para el personal de Farmacia, Veterinarios y Administradores."
        )
      )
    );
  }

  return e(
    "main",
    { className: "space-y-6 p-2 sm:p-4 max-w-7xl mx-auto" },

    /* Header principal */
    e(
      "header",
      {
        className:
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-autumn-100",
      },
      e(
        "div",
        null,
        e(
          "h1",
          {
            className:
              "text-2xl sm:text-3xl font-extrabold text-autumn-900 tracking-tight flex items-center gap-2.5",
          },
          e(Pill, { className: "w-7 h-7 text-autumn-600 inline-block" }),
          "Farmacia e Inventario"
        ),
        e(
          "p",
          { className: "text-xs sm:text-sm text-autumn-800/70 mt-1" },
          "Control integral de medicamentos, monitoreo de lote, umbral de reposición y trazabilidad."
        )
      ),
      e(
        Button,
        {
          onClick: handleOpenModal,
          variant: "primary",
          className:
            "shrink-0 shadow-sm focus:ring-2 focus:ring-autumn-500 focus:ring-offset-2 flex items-center justify-center gap-2",
        },
        e(PlusCircle, { className: "w-4 h-4 inline-block" }),
        e("span", null, "Nuevo Medicamento / Insumo")
      )
    ),

    /* Banner Informativo de Métricas y Alertas de Inventario */
    (lowStockItems.length > 0 || expiredItems.length > 0 || expiringSoonItems.length > 0) &&
      e(
        "section",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },

        /* Alerta de Stock Crítico */
        lowStockItems.length > 0
          ? e(
              "div",
              {
                className:
                  "bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between text-red-900 shadow-autumn-sm",
              },
              e(
                "div",
                { className: "flex items-start space-x-3" },
                e(AlertTriangle, { className: "w-5 h-5 text-red-600 shrink-0 mt-0.5" }),
                e(
                  "div",
                  null,
                  e("strong", { className: "font-bold text-sm block" }, "Stock Crítico"),
                  e(
                    "p",
                    { className: "text-xs text-red-800/90 mt-0.5" },
                    `${lowStockItems.length} producto(s) por debajo del mínimo.`
                  )
                )
              ),
              e(Badge, { variant: "danger", className: "text-xs shrink-0" }, lowStockItems.length)
            )
          : null,

        /* Alerta de Productos Vencidos */
        expiredItems.length > 0
          ? e(
              "div",
              {
                className:
                  "bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between text-rose-900 shadow-autumn-sm",
              },
              e(
                "div",
                { className: "flex items-start space-x-3" },
                e(Calendar, { className: "w-5 h-5 text-rose-600 shrink-0 mt-0.5" }),
                e(
                  "div",
                  null,
                  e("strong", { className: "font-bold text-sm block" }, "Productos Vencidos"),
                  e(
                    "p",
                    { className: "text-xs text-rose-800/90 mt-0.5" },
                    `${expiredItems.length} ítem(s) no apto(s) para dispensación.`
                  )
                )
              ),
              e(Badge, { variant: "danger", className: "text-xs shrink-0" }, expiredItems.length)
            )
          : null,

        /* Alerta de Vencimiento Próximo */
        expiringSoonItems.length > 0
          ? e(
              "div",
              {
                className:
                  "bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between text-amber-900 shadow-autumn-sm",
              },
              e(
                "div",
                { className: "flex items-start space-x-3" },
                e(Clock, { className: "w-5 h-5 text-amber-600 shrink-0 mt-0.5" }),
                e(
                  "div",
                  null,
                  e("strong", { className: "font-bold text-sm block" }, "Próximos a Vencer"),
                  e(
                    "p",
                    { className: "text-xs text-amber-800/90 mt-0.5" },
                    `${expiringSoonItems.length} ítem(s) vencen en 30 días.`
                  )
                )
              ),
              e(Badge, { variant: "warning", className: "text-xs shrink-0" }, expiringSoonItems.length)
            )
          : null
      ),

    /* Barra de Búsqueda y Filtro por Categorías */
    e(
      "section",
      {
        className:
          "bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm flex flex-col md:flex-row gap-4 justify-between items-center",
      },
      e(
        "div",
        { className: "relative flex items-center w-full md:w-96" },
        e(Input, {
          icon: Search,
          placeholder: "Buscar por nombre, laboratorio o descripción...",
          value: searchTerm,
          onChange: (evt) => setSearchTerm(evt.target.value),
          className: "w-full pr-10 text-sm",
          "aria-label": "Buscar productos en farmacia",
        }),
        searchTerm
          ? e(
              "button",
              {
                onClick: () => setSearchTerm(""),
                className:
                  "absolute right-3 text-autumn-400 hover:text-autumn-700 p-1 rounded-full hover:bg-autumn-100 transition-colors",
                title: "Limpiar búsqueda",
                "aria-label": "Limpiar campo de búsqueda",
              },
              e(X, { className: "w-4 h-4" })
            )
          : null
      ),

      /* Pill Filters de Categorías */
      e(
        "div",
        {
          className:
            "flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none",
        },
        e(
          "span",
          { className: "text-xs font-semibold text-autumn-800 mr-1 hidden sm:inline shrink-0" },
          "Categoría:"
        ),
        availableCategories.map((cat) => {
          const isActive = selectedCategory === cat;
          return e(
            "button",
            {
              key: cat,
              onClick: () => setSelectedCategory(cat),
              className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-autumn-400 ${
                isActive
                  ? "bg-autumn-600 text-white shadow-autumn-sm"
                  : "bg-autumn-100 text-autumn-800 hover:bg-autumn-200"
              }`,
              "aria-pressed": isActive,
            },
            cat
          );
        })
      )
    ),

    /* 1. Vista Móvil / Tablet (Tarjetas Responsorias) */
    e(
      "section",
      { className: "block lg:hidden space-y-4" },
      filteredItems.length === 0
        ? e(
            "div",
            {
              className:
                "bg-white p-8 text-center rounded-xl border border-autumn-200 text-autumn-800/60 text-sm space-y-2",
            },
            e(PackageCheck, { className: "w-8 h-8 text-autumn-400 mx-auto" }),
            e("p", null, "No se encontraron productos coincidentes con los criterios de búsqueda.")
          )
        : filteredItems.map((item) => {
            const isLow = item.stock <= (item.min_stock ?? 0);
            const isExpired = item.expiration_date && new Date(item.expiration_date) < new Date();

            return e(
              "div",
              {
                key: item.id,
                className:
                  "bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm space-y-3",
              },
              e(
                "div",
                { className: "flex items-start justify-between gap-2" },
                e(
                  "div",
                  { className: "space-y-1" },
                  e(
                    "div",
                    { className: "font-bold text-autumn-900 text-base flex items-center gap-1.5" },
                    e(Pill, { className: "w-4 h-4 text-autumn-500 shrink-0" }),
                    e("span", null, item.name)
                  ),
                  item.description
                    ? e(
                        "p",
                        { className: "text-xs text-autumn-800/70 line-clamp-2" },
                        item.description
                      )
                    : null
                ),
                e(
                  Badge,
                  { variant: "default", className: "text-[10px] shrink-0" },
                  item.category || "General"
                )
              ),
              e(
                "div",
                {
                  className:
                    "grid grid-cols-2 gap-2 text-xs border-t border-b border-autumn-100 py-2 text-autumn-800",
                },
                e(
                  "div",
                  { className: "space-y-1" },
                  e(
                    "span",
                    { className: "text-[10px] uppercase font-bold text-autumn-800/50 block" },
                    "Proveedor / Lab"
                  ),
                  e(
                    "div",
                    { className: "flex items-center space-x-1" },
                    e(Building2, { className: "w-3.5 h-3.5 text-autumn-500 shrink-0" }),
                    e("span", { className: "truncate" }, item.supplier || "Sin Proveedor")
                  )
                ),
                e(
                  "div",
                  { className: "space-y-1" },
                  e(
                    "span",
                    { className: "text-[10px] uppercase font-bold text-autumn-800/50 block" },
                    "Precio Unitario"
                  ),
                  e(
                    "span",
                    { className: "font-bold text-autumn-900" },
                    formatCurrency(item.unit_price)
                  )
                ),
                e(
                  "div",
                  { className: "space-y-1" },
                  e(
                    "span",
                    { className: "text-[10px] uppercase font-bold text-autumn-800/50 block" },
                    "Vencimiento"
                  ),
                  e(
                    "span",
                    { className: isExpired ? "text-red-600 font-semibold" : "text-autumn-800" },
                    formatDate(item.expiration_date)
                  )
                ),
                e(
                  "div",
                  { className: "space-y-1" },
                  e(
                    "span",
                    { className: "text-[10px] uppercase font-bold text-autumn-800/50 block" },
                    "Estado Stock"
                  ),
                  isLow
                    ? e(
                        Badge,
                        { variant: "danger", className: "text-[10px]" },
                        `Bajo (Mín: ${item.min_stock})`
                      )
                    : e(
                        Badge,
                        { variant: "success", className: "text-[10px]" },
                        "Normal"
                      )
                )
              ),
              e(
                "div",
                { className: "flex items-center justify-between pt-1" },
                e(
                  "div",
                  { className: "flex items-center space-x-1.5" },
                  e("span", { className: "text-xs text-autumn-800/70" }, "Disponible:"),
                  e(
                    "span",
                    {
                      className: `font-extrabold text-sm ${
                        isLow ? "text-red-600" : "text-autumn-900"
                      }`,
                    },
                    `${item.stock} unidades`
                  )
                ),

                /* Controles Rápidos de Ajuste de Stock */
                e(
                  "div",
                  { className: "flex items-center space-x-1" },
                  e(
                    "button",
                    {
                      onClick: () => handleStockDecrement(item.id, item.stock),
                      disabled: item.stock <= 0,
                      className:
                        "p-1.5 bg-autumn-100 text-autumn-800 hover:bg-autumn-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-autumn-400",
                      title: "Restar 1 unidad",
                      "aria-label": `Restar 1 unidad a ${item.name}`,
                    },
                    e(Minus, { className: "w-4 h-4" })
                  ),
                  e(
                    "button",
                    {
                      onClick: () => handleStockIncrement(item.id),
                      className:
                        "p-1.5 bg-autumn-600 text-white hover:bg-autumn-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-autumn-400",
                      title: "Sumar 1 unidad",
                      "aria-label": `Sumar 1 unidad a ${item.name}`,
                    },
                    e(Plus, { className: "w-4 h-4" })
                  )
                )
              )
            );
          })
    ),

    /* 2. Vista Desktop (Tabla estructurada) */
    e(
      "section",
      {
        className:
          "hidden lg:block bg-white rounded-xl border border-autumn-200 shadow-autumn-sm overflow-hidden",
      },
      e(
        Table,
        null,
        e(
          Thead,
          null,
          e(
            Tr,
            null,
            e(Th, null, "Producto / Medicamento"),
            e(Th, null, "Categoría"),
            e(Th, null, "Proveedor"),
            e(Th, null, "Precio Unitario"),
            e(Th, null, "Stock Disponible"),
            e(Th, null, "Vencimiento"),
            e(Th, { className: "text-right" }, "Ajuste Rápido")
          )
        ),
        e(
          Tbody,
          null,
          filteredItems.length === 0
            ? e(
                Tr,
                null,
                e(
                  Td,
                  { colSpan: 7, className: "text-center py-10 text-autumn-800/60" },
                  "No hay productos en farmacia que coincidan con la búsqueda."
                )
              )
            : filteredItems.map((item) => {
                const isLow = item.stock <= (item.min_stock ?? 0);
                const isExpired =
                  item.expiration_date && new Date(item.expiration_date) < new Date();

                return e(
                  Tr,
                  { key: item.id, className: "hover:bg-autumn-50/50 transition-colors" },
                  e(
                    Td,
                    null,
                    e(
                      "div",
                      { className: "font-bold text-autumn-900 flex items-center space-x-2" },
                      e(Pill, { className: "w-4 h-4 text-autumn-500 shrink-0" }),
                      e("span", null, item.name)
                    ),
                    item.description
                      ? e(
                          "div",
                          { className: "text-[11px] text-autumn-800/60 truncate max-w-xs mt-0.5" },
                          item.description
                        )
                      : null
                  ),
                  e(
                    Td,
                    null,
                    e(Badge, { variant: "default" }, item.category || "General")
                  ),
                  e(
                    Td,
                    null,
                    e(
                      "div",
                      { className: "text-xs text-autumn-800 flex items-center space-x-1.5" },
                      e(Building2, { className: "w-3.5 h-3.5 text-autumn-500 shrink-0" }),
                      e("span", null, item.supplier || "Laboratorio")
                    )
                  ),
                  e(
                    Td,
                    { className: "font-bold text-autumn-900 text-sm" },
                    formatCurrency(item.unit_price)
                  ),
                  e(
                    Td,
                    null,
                    e(
                      "div",
                      { className: "flex items-center space-x-2" },
                      e(
                        "span",
                        {
                          className: `font-extrabold text-sm ${
                            isLow ? "text-red-600" : "text-autumn-900"
                          }`,
                        },
                        `${item.stock} unidades`
                      ),
                      isLow
                        ? e(
                            Badge,
                            { variant: "danger", className: "text-[10px]" },
                            `Mín: ${item.min_stock}`
                          )
                        : null
                    )
                  ),
                  e(
                    Td,
                    { className: "text-xs" },
                    e(
                      "span",
                      {
                        className: isExpired
                          ? "text-red-600 font-semibold"
                          : "text-autumn-800",
                      },
                      formatDate(item.expiration_date)
                    )
                  ),
                  e(
                    Td,
                    { className: "text-right" },
                    e(
                      "div",
                      { className: "flex items-center justify-end space-x-1" },
                      e(
                        "button",
                        {
                          onClick: () => handleStockDecrement(item.id, item.stock),
                          disabled: item.stock <= 0,
                          className:
                            "p-1.5 bg-autumn-100 text-autumn-800 hover:bg-autumn-200 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-autumn-400",
                          title: "Restar 1 unidad",
                          "aria-label": `Restar 1 unidad a ${item.name}`,
                        },
                        e(Minus, { className: "w-3.5 h-3.5" })
                      ),
                      e(
                        "button",
                        {
                          onClick: () => handleStockIncrement(item.id),
                          className:
                            "p-1.5 bg-autumn-600 text-white hover:bg-autumn-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-autumn-400",
                          title: "Sumar 1 unidad",
                          "aria-label": `Sumar 1 unidad a ${item.name}`,
                        },
                        e(Plus, { className: "w-3.5 h-3.5" })
                      )
                    )
                  )
                );
              })
        )
      )
    ),

    /* Modal Formulario de Insumos / Medicamentos */
    e(MedicineFormModal, {
      isOpen: isModalOpen,
      onClose: handleCloseModal,
      onSubmit: handleCreateItem,
    })
  );
}