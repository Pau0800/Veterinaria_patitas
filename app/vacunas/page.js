"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VaccineFormModal } from "@/components/vacunas/VaccineFormModal";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { Syringe, PlusCircle, AlertTriangle, ShieldCheck, Clock } from "lucide-react";

export default function VaccinesPage() {
  const { vaccines, pets, addVaccine, currentRole, activeClientId } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Role Filtering
  const availablePetIds =
    currentRole === "Cliente"
      ? pets.filter((p) => p.owner_id === activeClientId).map((p) => p.id)
      : pets.map((p) => p.id);

  const filteredVaccines = vaccines.filter((v) => availablePetIds.includes(v.pet_id));

  const alertVaccines = filteredVaccines.filter((v) => {
    const days = getDaysRemaining(v.next_due_date);
    return days <= 15;
  });

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-autumn-900">Control de Vacunación</h1>
          <p className="text-xs text-autumn-800/70">
            Registro de dosis aplicadas, profesional a cargo y alertas preventivas de vencimiento.
          </p>
        </div>

        {currentRole !== "Cliente" && (
          <Button onClick={() => setIsModalOpen(true)} variant="sage">
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Vacuna</span>
          </Button>
        )}
      </div>

      {/* Banner de Alerta por Vacunas Próximas a Vencer */}
      {alertVaccines.length > 0 && (
        <div className="bg-amberGold-50 border-2 border-amberGold-400/60 rounded-2xl p-5 shadow-autumn-sm">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-amberGold-600 animate-bounce" />
            <div>
              <h3 className="text-base font-bold text-amberGold-900">
                ¡Alertas de Revacunación Próxima! ({alertVaccines.length})
              </h3>
              <p className="text-xs text-amberGold-800">
                Las siguientes mascotas tienen su próxima dosis pendiente dentro de los próximos 15 días o ya vencida:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertVaccines.map((vcc) => {
              const days = getDaysRemaining(vcc.next_due_date);
              return (
                <div
                  key={vcc.id}
                  className="bg-white p-3 rounded-xl border border-amberGold-200 flex items-center justify-between shadow-autumn-sm"
                >
                  <div>
                    <div className="font-bold text-autumn-900 text-sm">
                      {vcc.pet_name} - <span className="text-amberGold-700">{vcc.vaccine_name}</span>
                    </div>
                    <div className="text-xs text-autumn-800">Dueño: {vcc.owner_name}</div>
                  </div>
                  <Badge variant={days < 0 ? "danger" : "warning"}>
                    {days < 0 ? `Vencida (${Math.abs(days)}d)` : `Vence en ${days} días`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table of Vaccines */}
      <Table>
        <Thead>
          <Tr>
            <Th>Mascota</Th>
            <Th>Vacuna Aplicada</Th>
            <Th>Fecha Aplicación</Th>
            <Th>Próxima Dosis</Th>
            <Th>Veterinario Cargo</Th>
            <Th>Estado</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredVaccines.length === 0 ? (
            <Tr>
              <Td colSpan={6} className="text-center py-8 text-autumn-800/60">
                No hay vacunas registradas en el historial.
              </Td>
            </Tr>
          ) : (
            filteredVaccines.map((vcc) => {
              const days = getDaysRemaining(vcc.next_due_date);

              return (
                <Tr key={vcc.id}>
                  <Td>
                    <div className="font-bold text-autumn-900">{vcc.pet_name}</div>
                    <div className="text-xs text-autumn-800/70">{vcc.owner_name}</div>
                  </Td>
                  <Td>
                    <div className="font-semibold text-autumn-900 flex items-center space-x-1.5">
                      <Syringe className="w-4 h-4 text-autumn-500" />
                      <span>{vcc.vaccine_name}</span>
                    </div>
                  </Td>
                  <Td className="text-xs text-autumn-800">{formatDate(vcc.application_date)}</Td>
                  <Td>
                    <div className="text-xs">
                      <span className="font-bold block text-autumn-900">
                        {formatDate(vcc.next_due_date)}
                      </span>
                      <span
                        className={`text-[11px] ${
                          days <= 15 ? "text-amberGold-600 font-bold" : "text-autumn-800/60"
                        }`}
                      >
                        {days < 0
                          ? "¡Vencida!"
                          : days <= 15
                          ? `Restan ${days} días`
                          : "En fecha"}
                      </span>
                    </div>
                  </Td>
                  <Td className="text-xs text-autumn-800">{vcc.vet_name}</Td>
                  <Td>
                    {days <= 15 ? (
                      <Badge variant="warning">Próxima Vencer</Badge>
                    ) : (
                      <Badge variant="success">Al día</Badge>
                    )}
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>

      {/* Modal Formulario Vacuna */}
      <VaccineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => addVaccine(data)}
      />
    </div>
  );
}
