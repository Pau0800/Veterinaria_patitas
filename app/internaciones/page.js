"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { AdmissionModal } from "@/components/internaciones/AdmissionModal";
import { formatDate } from "@/lib/utils";
import { BedDouble, PlusCircle, HeartPulse, CheckCircle2, Activity } from "lucide-react";

export default function HospitalizationPage() {
  const {
    hospitalizations,
    addHospitalization,
    dischargePet,
    updateHospitalizationEvolution,
    currentRole,
  } = useApp();

  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [editingEvolutionHosp, setEditingEvolutionHosp] = useState(null);
  const [evolutionText, setEvolutionText] = useState("");

  if (currentRole === "Cliente" || currentRole === "Recepcionista") {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-autumn-200 shadow-autumn-sm">
        <BedDouble className="w-12 h-12 text-autumn-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-autumn-900 mb-2">Panel Médico de Internación</h2>
        <p className="text-sm text-autumn-800/70">
          El módulo de internaciones clínicas y seguimiento diario está restringido a Médicos Veterinarios y Administradores.
        </p>
      </div>
    );
  }

  const activeCases = hospitalizations.filter((h) => h.status === "activa");
  const dischargedCases = hospitalizations.filter((h) => h.status === "alta_medica");

  const handleOpenEvolution = (hosp) => {
    setEditingEvolutionHosp(hosp);
    setEvolutionText(hosp.daily_evolution || "");
  };

  const handleSaveEvolution = () => {
    if (editingEvolutionHosp) {
      updateHospitalizationEvolution(editingEvolutionHosp.id, evolutionText);
      setEditingEvolutionHosp(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-autumn-900">Control de Internaciones</h1>
          <p className="text-xs text-autumn-800/70">
            Monitoreo en tiempo real de mascotas hospitalizadas, registro de evolución médica diaria y alta.
          </p>
        </div>

        <Button onClick={() => setIsAdmissionOpen(true)} variant="danger">
          <PlusCircle className="w-4 h-4" />
          <span>Ingreso de Paciente</span>
        </Button>
      </div>

      {/* Grid de Pacientes Internados Activos */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-autumn-900 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-red-600 animate-pulse" />
          <span>Pacientes en Cama Activa ({activeCases.length})</span>
        </h2>

        {activeCases.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-autumn-200 p-6 shadow-autumn-sm">
            <CheckCircle2 className="w-10 h-10 text-sage-500 mx-auto mb-2" />
            <p className="font-bold text-autumn-900">No hay mascotas internadas actualmente.</p>
            <p className="text-xs text-autumn-800/70">Todas las áreas de hospitalización están libres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCases.map((hosp) => (
              <Card key={hosp.id} className="border-l-4 border-l-red-600">
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle>{hosp.pet_name}</CardTitle>
                      <span className="text-xs text-autumn-800">
                        {hosp.species} - Dueño: {hosp.owner_name}
                      </span>
                    </div>
                    <Badge variant="danger">Internado</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-xs text-autumn-800 space-y-1">
                    <div>
                      <strong className="text-autumn-900">Ingreso: </strong>
                      {formatDate(hosp.admission_date)}
                    </div>
                    <div>
                      <strong className="text-autumn-900">Veterinario a Cargo: </strong>
                      {hosp.vet_name}
                    </div>
                    <div>
                      <strong className="text-autumn-900">Motivo: </strong>
                      {hosp.reason}
                    </div>
                  </div>

                  {hosp.treatment && (
                    <div className="bg-sage-50 p-3 rounded-lg border border-sage-200 text-xs">
                      <strong className="text-sage-800 block mb-0.5">Tratamiento de Soporte:</strong>
                      <span className="text-sage-900">{hosp.treatment}</span>
                    </div>
                  )}

                  <div className="bg-autumn-50 p-3 rounded-lg border border-autumn-200 text-xs space-y-1">
                    <strong className="text-autumn-900 block flex items-center justify-between">
                      <span>Último Reporte de Evolución:</span>
                    </strong>
                    <p className="text-autumn-800 italic">{hosp.daily_evolution}</p>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEvolution(hosp)}
                    className="flex-1 text-xs"
                  >
                    Actualizar Evolución
                  </Button>

                  <Button
                    size="sm"
                    variant="sage"
                    onClick={() => dischargePet(hosp.id)}
                    className="text-xs"
                  >
                    Dar Alta Médica
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Altas Médicas */}
      {dischargedCases.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-autumn-900">Historial de Pacientes Dados de Alta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dischargedCases.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white p-4 rounded-xl border border-autumn-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-autumn-900 text-sm">{hosp.pet_name}</span>
                  <Badge variant="success">Alta Médica</Badge>
                </div>
                <div className="text-autumn-800">
                  Ingreso: {formatDate(hosp.admission_date)} | Alta: {formatDate(hosp.discharge_date)}
                </div>
                <p className="text-autumn-800/70 pt-1 border-t border-autumn-100">{hosp.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Ingreso Internación */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onSubmit={(data) => addHospitalization(data)}
      />

      {/* Modal Editar Evolución */}
      <Modal
        isOpen={Boolean(editingEvolutionHosp)}
        onClose={() => setEditingEvolutionHosp(null)}
        title={`Actualizar Evolución de ${editingEvolutionHosp?.pet_name || ""}`}
      >
        <div className="space-y-4">
          <Textarea
            label="Detalle de Evolución del Día"
            value={evolutionText}
            onChange={(e) => setEvolutionText(e.target.value)}
            rows={5}
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
            <Button variant="outline" onClick={() => setEditingEvolutionHosp(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveEvolution}>
              Guardar Evolución
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
