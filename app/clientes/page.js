"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ClientFormModal } from "@/components/clientes/ClientFormModal";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Dog,
  Phone,
  Mail,
  MapPin,
  X,
  AlertTriangle,
  ShieldAlert,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const e = React.createElement;

export default function ClientsPage() {
  const {
    clients = [],
    pets = [],
    addClient,
    updateClient,
    softDeleteClient,
    currentRole,
  } = useApp();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewHistoryClient, setViewHistoryClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);

  // 1. Mapa de mascotas agrupadas por owner_id (O(N) para rendimiento optimizado)
  const petsByOwnerId = useMemo(() => {
    const map = new Map();
    pets.forEach((pet) => {
      if (!map.has(pet.owner_id)) {
        map.set(pet.owner_id, []);
      }
      map.get(pet.owner_id).push(pet);
    });
    return map;
  }, [pets]);

  // 2. Filtrado optimizado de clientes
  const filteredClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return clients.filter((c) => {
      if (c.status !== "activo") return false;
      if (!query) return true;

      const nameMatch = c.full_name?.toLowerCase().includes(query);
      const emailMatch = c.email?.toLowerCase().includes(query);
      const phoneMatch = c.phone?.includes(query);

      return nameMatch || emailMatch || phoneMatch;
    });
  }, [clients, searchTerm]);

  // Callbacks memetizados
  const handleOpenCreateModal = useCallback(() => {
    setEditingClient(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormOpen(false);
    setEditingClient(null);
  }, []);

  const handleCreateOrUpdate = useCallback(
    (data) => {
      if (editingClient) {
        updateClient({ ...editingClient, ...data });
      } else {
        addClient(data);
      }
      handleCloseFormModal();
    },
    [editingClient, updateClient, addClient, handleCloseFormModal]
  );

  const handleConfirmDelete = useCallback(() => {
    if (clientToDelete) {
      softDeleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  }, [clientToDelete, softDeleteClient]);

  // Vista restringida para rol "Cliente"
  if (currentRole === "Cliente") {
    return e(
      "div",
      {
        className:
          "flex flex-col items-center justify-center p-8 m-4 bg-white rounded-2xl border border-autumn-200 shadow-autumn-sm text-center max-w-lg mx-auto",
      },
      e(
        "div",
        { className: "p-3 bg-autumn-100 rounded-full text-autumn-700 mb-4" },
        e(ShieldAlert, { className: "w-8 h-8" })
      ),
      e("h2", { className: "text-xl font-bold text-autumn-900 mb-2" }, "Acceso Restringido"),
      e(
        "p",
        { className: "text-sm text-autumn-800/80 leading-relaxed" },
        "La gestión general de clientes está reservada únicamente para el personal administrativo y recepcionistas."
      )
    );
  }

  return e(
    "div",
    { className: "space-y-6 p-2 sm:p-4 max-w-7xl mx-auto" },

    /* Header & Acciones */
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
              "text-2xl sm:text-3xl font-extrabold text-autumn-900 tracking-tight flex items-center gap-2",
          },
          e(Users, { className: "w-7 h-7 text-autumn-600 inline-block" }),
          "Gestión de Clientes"
        ),
        e(
          "p",
          { className: "text-xs sm:text-sm text-autumn-800/70 mt-1" },
          "Administra los dueños de mascotas, sus datos de contacto e historial de pacientes."
        )
      ),
      e(
        Button,
        {
          onClick: handleOpenCreateModal,
          variant: "primary",
          className: "shrink-0 shadow-sm focus:ring-2 focus:ring-autumn-500 focus:ring-offset-2",
        },
        e(UserPlus, { className: "w-4 h-4 mr-2 inline-block" }),
        e("span", null, "Nuevo Cliente")
      )
    ),

    /* Barra de Búsqueda */
    e(
      "section",
      { className: "bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm" },
      e(
        "div",
        { className: "relative flex items-center w-full" },
        e(Input, {
          icon: Search,
          placeholder: "Buscar por nombre, email o teléfono...",
          value: searchTerm,
          onChange: (evt) => setSearchTerm(evt.target.value),
          className: "w-full pr-10",
          "aria-label": "Buscar cliente",
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
      )
    ),

    /* 1. Vista Móvil (Cartas) */
    e(
      "div",
      { className: "block lg:hidden space-y-4" },
      filteredClients.length === 0
        ? e(
            "div",
            {
              className:
                "bg-white p-8 text-center rounded-xl border border-autumn-200 text-autumn-800/60 text-sm",
            },
            "No se encontraron clientes coincidentes con la búsqueda."
          )
        : filteredClients.map((client) => {
            const allPets = petsByOwnerId.get(client.id) || [];
            const activePets = allPets.filter((p) => p.status === "activo");

            return e(
              "div",
              {
                key: client.id,
                className:
                  "bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm space-y-3",
              },
              e(
                "div",
                { className: "flex items-start justify-between" },
                e(
                  "div",
                  null,
                  e("h3", { className: "font-bold text-autumn-900 text-base" }, client.full_name),
                  e(
                    Badge,
                    { variant: "default", className: "text-[10px] mt-1" },
                    `ID: ${client.id}`
                  )
                ),
                e(
                  "div",
                  { className: "flex items-center space-x-1" },
                  e(
                    "button",
                    {
                      onClick: () => handleOpenEditModal(client),
                      className:
                        "p-2 text-autumn-700 hover:bg-autumn-100 rounded-lg transition-colors",
                      title: "Editar cliente",
                      "aria-label": `Editar ${client.full_name}`,
                    },
                    e(Edit, { className: "w-4 h-4" })
                  ),
                  currentRole === "Administrador"
                    ? e(
                        "button",
                        {
                          onClick: () => setClientToDelete(client),
                          className:
                            "p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors",
                          title: "Eliminar cliente",
                          "aria-label": `Eliminar ${client.full_name}`,
                        },
                        e(Trash2, { className: "w-4 h-4" })
                      )
                    : null
                )
              ),
              e(
                "div",
                {
                  className:
                    "space-y-1.5 text-xs text-autumn-800 border-t border-autumn-100 pt-2",
                },
                e(
                  "div",
                  { className: "flex items-center space-x-2" },
                  e(Mail, { className: "w-3.5 h-3.5 text-autumn-500 shrink-0" }),
                  e("span", { className: "truncate" }, client.email)
                ),
                e(
                  "div",
                  { className: "flex items-center space-x-2" },
                  e(Phone, { className: "w-3.5 h-3.5 text-autumn-500 shrink-0" }),
                  e("span", null, client.phone || "Sin teléfono")
                ),
                e(
                  "div",
                  { className: "flex items-center space-x-2" },
                  e(MapPin, { className: "w-3.5 h-3.5 text-autumn-500 shrink-0" }),
                  e("span", { className: "truncate" }, client.address || "N/A")
                )
              ),
              e(
                "div",
                {
                  className:
                    "flex items-center justify-between border-t border-autumn-100 pt-2 text-xs",
                },
                e(
                  "button",
                  {
                    onClick: () => setViewHistoryClient(client),
                    className:
                      "inline-flex items-center space-x-1.5 px-3 py-1.5 bg-autumn-100 hover:bg-autumn-200 text-autumn-900 rounded-lg font-semibold transition-colors",
                  },
                  e(Dog, { className: "w-3.5 h-3.5 text-autumn-600" }),
                  e("span", null, `${activePets.length} Mascota(s)`)
                ),
                e(
                  "span",
                  { className: "text-autumn-800/60" },
                  formatDate(client.created_at)
                )
              )
            );
          })
    ),

    /* 2. Vista Desktop (Tabla) */
    e(
      "div",
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
            e(Th, null, "Cliente"),
            e(Th, null, "Contacto"),
            e(Th, null, "Dirección"),
            e(Th, null, "Mascotas"),
            e(Th, null, "Fecha Registro"),
            e(Th, { className: "text-right" }, "Acciones")
          )
        ),
        e(
          Tbody,
          null,
          filteredClients.length === 0
            ? e(
                Tr,
                null,
                e(
                  Td,
                  { colSpan: 6, className: "text-center py-8 text-autumn-800/60" },
                  "No se encontraron clientes coincidentes con la búsqueda."
                )
              )
            : filteredClients.map((client) => {
                const allPets = petsByOwnerId.get(client.id) || [];
                const activePets = allPets.filter((p) => p.status === "activo");

                return e(
                  Tr,
                  { key: client.id, className: "hover:bg-autumn-50/50 transition-colors" },
                  e(
                    Td,
                    null,
                    e("div", { className: "font-bold text-autumn-900" }, client.full_name),
                    e(
                      Badge,
                      { variant: "default", className: "text-[10px] mt-0.5" },
                      `ID: ${client.id}`
                    )
                  ),
                  e(
                    Td,
                    null,
                    e(
                      "div",
                      { className: "space-y-1 text-xs" },
                      e(
                        "div",
                        { className: "flex items-center space-x-1.5 text-autumn-800" },
                        e(Mail, { className: "w-3.5 h-3.5 text-autumn-500 shrink-0" }),
                        e("span", null, client.email)
                      ),
                      e(
                        "div",
                        { className: "flex items-center space-x-1.5 text-autumn-800" },
                        e(Phone, { className: "w-3.5 h-3.5 text-autumn-500 shrink-0" }),
                        e("span", null, client.phone || "Sin teléfono")
                      )
                    )
                  ),
                  e(
                    Td,
                    null,
                    e(
                      "div",
                      { className: "flex items-center space-x-1.5 text-xs text-autumn-800" },
                      e(MapPin, { className: "w-3.5 h-3.5 text-autumn-500 shrink-0" }),
                      e(
                        "span",
                        { className: "truncate max-w-xs" },
                        client.address || "N/A"
                      )
                    )
                  ),
                  e(
                    Td,
                    null,
                    e(
                      "button",
                      {
                        onClick: () => setViewHistoryClient(client),
                        className:
                          "inline-flex items-center space-x-1.5 px-3 py-1 bg-autumn-100 hover:bg-autumn-200 text-autumn-900 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-autumn-400",
                        title: "Ver mascotas vinculadas",
                      },
                      e(Dog, { className: "w-3.5 h-3.5 text-autumn-600" }),
                      e("span", null, `${activePets.length} Mascota(s)`)
                    )
                  ),
                  e(
                    Td,
                    { className: "text-xs text-autumn-800" },
                    formatDate(client.created_at)
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
                          onClick: () => handleOpenEditModal(client),
                          className:
                            "p-1.5 text-autumn-700 hover:bg-autumn-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-autumn-400",
                          title: "Editar cliente",
                          "aria-label": `Editar ${client.full_name}`,
                        },
                        e(Edit, { className: "w-4 h-4" })
                      ),
                      currentRole === "Administrador"
                        ? e(
                            "button",
                            {
                              onClick: () => setClientToDelete(client),
                              className:
                                "p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400",
                              title: "Baja lógica",
                              "aria-label": `Baja lógica para ${client.full_name}`,
                            },
                            e(Trash2, { className: "w-4 h-4" })
                          )
                        : null
                    )
                  )
                );
              })
        )
      )
    ),

    /* Modal Formulario Cliente */
    e(ClientFormModal, {
      isOpen: isFormOpen,
      onClose: handleCloseFormModal,
      onSubmit: handleCreateOrUpdate,
      initialData: editingClient,
    }),

    /* Modal Historial de Mascotas */
    e(
      Modal,
      {
        isOpen: Boolean(viewHistoryClient),
        onClose: () => setViewHistoryClient(null),
        title: `Mascotas de ${viewHistoryClient?.full_name || ""}`,
      },
      e(
        "div",
        { className: "space-y-3 max-h-[60vh] overflow-y-auto pr-1" },
        viewHistoryClient &&
          (petsByOwnerId.get(viewHistoryClient.id) || []).map((pet) =>
            e(
              "div",
              {
                key: pet.id,
                className:
                  "p-4 bg-autumn-50 rounded-xl border border-autumn-200 flex items-center justify-between",
              },
              e(
                "div",
                null,
                e("div", { className: "font-bold text-autumn-900 text-base" }, pet.name),
                e(
                  "div",
                  { className: "text-xs text-autumn-800 mt-0.5" },
                  `${pet.species} - ${pet.breed || "Mestizo"} (${
                    pet.sex || "N/A"
                  }, ${pet.weight_kg ? `${pet.weight_kg} kg` : "Sin peso"})`
                )
              ),
              e(
                Badge,
                { variant: pet.status === "activo" ? "success" : "danger" },
                pet.status === "activo" ? "Activo" : "Dado de baja"
              )
            )
          ),
        viewHistoryClient &&
          (!petsByOwnerId.get(viewHistoryClient.id) ||
            petsByOwnerId.get(viewHistoryClient.id).length === 0)
          ? e(
              "p",
              { className: "text-center text-xs text-autumn-800/60 py-6" },
              "Este cliente aún no tiene mascotas registradas."
            )
          : null
      )
    ),

    /* Modal de Confirmación de Eliminación */
    e(
      Modal,
      {
        isOpen: Boolean(clientToDelete),
        onClose: () => setClientToDelete(null),
        title: "Confirmar baja de cliente",
      },
      e(
        "div",
        { className: "space-y-4" },
        e(
          "div",
          {
            className:
              "flex items-center space-x-3 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200",
          },
          e(AlertTriangle, { className: "w-6 h-6 shrink-0" }),
          e(
            "p",
            { className: "text-xs text-amber-800" },
            "Esta acción dará de baja al cliente ",
            e("strong", null, clientToDelete?.full_name),
            " del sistema."
          )
        ),
        e(
          "div",
          { className: "flex justify-end space-x-2 pt-2" },
          e(
            Button,
            { variant: "secondary", onClick: () => setClientToDelete(null) },
            "Cancelar"
          ),
          e(
            Button,
            { variant: "danger", onClick: handleConfirmDelete },
            "Confirmar baja"
          )
        )
      )
    )
  );
}