"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { MedicineFormModal } from "@/components/farmacia/MedicineFormModal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Pill, PlusCircle, AlertTriangle, Search, Plus, Minus, Building2 } from "lucide-react";

export default function PharmacyPage() {
  const { pharmacy, addPharmacyItem, updatePharmacyStock, currentRole } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (currentRole === "Cliente" || currentRole === "Recepcionista") {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-autumn-200 shadow-autumn-sm">
        <Pill className="w-12 h-12 text-autumn-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-autumn-900 mb-2">Acceso Restringido a Farmacia</h2>
        <p className="text-sm text-autumn-800/70">
          La gestión de inventario de medicamentos e insumos está reservada para Farmacéuticos, Veterinarios y Administradores.
        </p>
      </div>
    );
  }

  const filteredItems = pharmacy.filter((item) => {
    const matchesCategory = selectedCategory === "TODAS" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const categories = ["TODAS", "Antibiótico", "Analgesia", "Biológico", "Dermatología", "Insumo Médico"];

  const lowStockCount = pharmacy.filter((p) => p.stock <= p.min_stock).length;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-autumn-900">Farmacia & Inventario</h1>
          <p className="text-xs text-autumn-800/70">
            Control de medicamentos, stock mínimo, fechas de vencimiento y proveedores.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Medicamento / Insumo</span>
        </Button>
      </div>

      {/* Alerta de Bajo Stock */}
      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-900 shadow-autumn-sm">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <strong className="font-bold text-sm block">¡Alerta de Stock Crítico!</strong>
              <p className="text-xs text-red-800">
                Se detectaron {lowStockCount} producto(s) por debajo del umbral mínimo de reposición.
              </p>
            </div>
          </div>
          <Badge variant="danger" className="text-xs">
            {lowStockCount} Ítems Críticos
          </Badge>
        </div>
      )}

      {/* Bar de Búsqueda y Categorías */}
      <div className="bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <Input
          icon={Search}
          placeholder="Buscar por medicamento, categoría o laboratorio proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96"
        />

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-autumn-800 mr-1 hidden sm:inline">Categoría:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-autumn-500 text-white shadow-autumn-sm"
                  : "bg-autumn-100 text-autumn-800 hover:bg-autumn-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Inventory */}
      <Table>
        <Thead>
          <Tr>
            <Th>Producto / Medicamento</Th>
            <Th>Categoría</Th>
            <Th>Proveedor</Th>
            <Th>Precio Unitario</Th>
            <Th>Stock Disponible</Th>
            <Th>Vencimiento</Th>
            <Th className="text-right">Ajuste de Stock</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredItems.length === 0 ? (
            <Tr>
              <Td colSpan={7} className="text-center py-8 text-autumn-800/60">
                No hay productos en farmacia que coincidan con la búsqueda.
              </Td>
            </Tr>
          ) : (
            filteredItems.map((item) => {
              const isLow = item.stock <= item.min_stock;

              return (
                <Tr key={item.id}>
                  <Td>
                    <div className="font-bold text-autumn-900 flex items-center space-x-1.5">
                      <Pill className="w-4 h-4 text-autumn-500 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.description && (
                      <div className="text-[11px] text-autumn-800/60 truncate max-w-xs">{item.description}</div>
                    )}
                  </Td>
                  <Td>
                    <Badge variant="default">{item.category}</Badge>
                  </Td>
                  <Td>
                    <div className="text-xs text-autumn-800 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-autumn-500 shrink-0" />
                      <span>{item.supplier || "Laboratorio"}</span>
                    </div>
                  </Td>
                  <Td className="font-bold text-autumn-900">{formatCurrency(item.unit_price)}</Td>
                  <Td>
                    <div className="flex items-center space-x-2">
                      <span className={`font-extrabold text-sm ${isLow ? "text-red-600" : "text-autumn-900"}`}>
                        {item.stock} unidades
                      </span>
                      {isLow && <Badge variant="danger">Bajo Stock (mín: {item.min_stock})</Badge>}
                    </div>
                  </Td>
                  <Td className="text-xs text-autumn-800">{formatDate(item.expiration_date)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => updatePharmacyStock(item.id, -1)}
                        className="p-1.5 bg-autumn-100 text-autumn-800 hover:bg-autumn-200 rounded-md transition-colors"
                        title="Restar 1 unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updatePharmacyStock(item.id, 1)}
                        className="p-1.5 bg-autumn-500 text-white hover:bg-autumn-600 rounded-md transition-colors"
                        title="Sumar 1 unidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>

      {/* Modal Formulario Insumo */}
      <MedicineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => addPharmacyItem(data)}
      />
    </div>
  );
}
