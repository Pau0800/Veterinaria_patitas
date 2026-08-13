"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ClientFormModal } from "@/components/clientes/ClientFormModal";
import { Search, UserPlus, Edit, Trash2, Dog, Phone, Mail, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ClientsPage() {
  const { clients, pets, addClient, updateClient, softDeleteClient, currentRole } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [viewHistoryClient, setViewHistoryClient] = useState(null);

  if (currentRole === "Cliente") {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-autumn-200 shadow-autumn-sm">
        <h2 className="text-xl font-bold text-autumn-900 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-autumn-800/70">
          La gestión general de clientes está reservada únicamente para administradores y recepcionistas.
        </p>
      </div>
    );
  }

  const filteredClients = clients.filter(
    (c) =>
      c.status === "activo" &&
      (c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm)))
  );

  const handleCreate = (data) => {
    addClient(data);
  };

  const handleEdit = (data) => {
    updateClient({ ...editingClient, ...data });
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-autumn-900">Gestión de Clientes</h1>
          <p className="text-xs text-autumn-800/70">
            Administra los dueños de mascotas, sus datos de contacto e historial de pacientes.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingClient(null);
            setIsFormOpen(true);
          }}
          variant="primary"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </Button>
      </div>

      {/* Bar de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-autumn-200 shadow-autumn-sm flex items-center">
        <Input
          icon={Search}
          placeholder="Buscar cliente por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Tabla de Clientes */}
      <Table>
        <Thead>
          <Tr>
            <Th>Cliente</Th>
            <Th>Contacto</Th>
            <Th>Dirección</Th>
            <Th>Mascotas Asociadas</Th>
            <Th>Fecha Registro</Th>
            <Th className="text-right">Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredClients.length === 0 ? (
            <Tr>
              <Td colSpan={6} className="text-center py-8 text-autumn-800/60">
                No se encontraron clientes coincidentes con la búsqueda.
              </Td>
            </Tr>
          ) : (
            filteredClients.map((client) => {
              const clientPets = pets.filter((p) => p.owner_id === client.id && p.status === "activo");

              return (
                <Tr key={client.id}>
                  <Td>
                    <div className="font-bold text-autumn-900">{client.full_name}</div>
                    <Badge variant="default" className="text-[10px] mt-0.5">
                      ID: {client.id}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center space-x-1.5 text-autumn-800">
                        <Mail className="w-3.5 h-3.5 text-autumn-500" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-autumn-800">
                        <Phone className="w-3.5 h-3.5 text-autumn-500" />
                        <span>{client.phone || "Sin teléfono"}</span>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center space-x-1.5 text-xs text-autumn-800">
                      <MapPin className="w-3.5 h-3.5 text-autumn-500 shrink-0" />
                      <span className="truncate max-w-xs">{client.address || "N/A"}</span>
                    </div>
                  </Td>
                  <Td>
                    <button
                      onClick={() => setViewHistoryClient(client)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-autumn-100 hover:bg-autumn-200 text-autumn-900 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Dog className="w-3.5 h-3.5 text-autumn-600" />
                      <span>{clientPets.length} Mascota(s)</span>
                    </button>
                  </Td>
                  <Td className="text-xs text-autumn-800">{formatDate(client.created_at)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-autumn-700 hover:bg-autumn-100 rounded-lg transition-colors"
                        title="Editar cliente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {currentRole === "Administrador" && (
                        <button
                          onClick={() => softDeleteClient(client.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Baja lógica"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>

      {/* Modal Formulario Cliente */}
      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClient(null);
        }}
        onSubmit={editingClient ? handleEdit : handleCreate}
        initialData={editingClient}
      />

      {/* Modal Historial de Mascotas del Cliente */}
      <Modal
        isOpen={Boolean(viewHistoryClient)}
        onClose={() => setViewHistoryClient(null)}
        title={`Mascotas de ${viewHistoryClient?.full_name || ""}`}
      >
        <div className="space-y-3">
          {pets
            .filter((p) => p.owner_id === viewHistoryClient?.id)
            .map((pet) => (
              <div
                key={pet.id}
                className="p-4 bg-autumn-50 rounded-xl border border-autumn-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-autumn-900 text-base">{pet.name}</div>
                  <div className="text-xs text-autumn-800">
                    {pet.species} - {pet.breed || "Mestizo"} ({pet.sex}, {pet.weight_kg} kg)
                  </div>
                </div>
                <Badge variant={pet.status === "activo" ? "success" : "danger"}>
                  {pet.status === "activo" ? "Activo" : "Dado de baja"}
                </Badge>
              </div>
            ))}

          {pets.filter((p) => p.owner_id === viewHistoryClient?.id).length === 0 && (
            <p className="text-center text-xs text-autumn-800/60 py-4">
              Este cliente aún no tiene mascotas registradas.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
