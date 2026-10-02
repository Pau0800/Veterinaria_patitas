"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { AdmissionModal } from "@/components/internaciones/AdmissionModal";
import { formatDate } from "@/lib/utils";
import {
  BedDouble,
  PlusCircle,
  Activity,
  CheckCircle2,
  Search,
  AlertCircle,
  Calendar,
  User,
  Stethoscope,
  Clock,
  ClipboardList,
  ShieldAlert,
  FileCheck2,
  RefreshCw
} from "lucide-react";

export default function HospitalizationPage() {
  const {
    hospitalizations = [],
    addHospitalization,
    dischargePet,
    updateHospitalizationEvolution,
    currentRole,
  } = useApp();

  // Estados de control de modals e interacción
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [editingEvolutionHosp, setEditingEvolutionHosp] = useState(null);
  const [evolutionText, setEvolutionText] = useState("");
  const [dischargingHosp, setDischargingHosp] = useState(null);
  const [dischargeNotes, setDischargeNotes] = useState("");
  
  // Estados de interfaz y filtrado
  const [activeTab, setActiveTab] = useState("activos"); // 'activos' | 'historial'
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificación de permisos de rol
  const hasAccess = useMemo(() => {
    return currentRole !== "Cliente" && currentRole !== "Recepcionista";
  }, [currentRole]);

  // Filtrado optimizado para casos activos
  const activeCases = useMemo(() => {
    if (!Array.isArray(hospitalizations)) return [];
    const query = searchTerm.trim().toLowerCase();

    return hospitalizations.filter((h) => {
      if (h.status !== "activa") return false;
      if (!query) return true;

      const petMatch = h.pet_name?.toLowerCase().includes(query) ?? false;
      const ownerMatch = h.owner_name?.toLowerCase().includes(query) ?? false;
      const vetMatch = h.vet_name?.toLowerCase().includes(query) ?? false;
      const reasonMatch = h.reason?.toLowerCase().includes(query) ?? false;

      return petMatch || ownerMatch || vetMatch || reasonMatch;
    });
  }, [hospitalizations, searchTerm]);

  // Filtrado optimizado para historial de altas
  const dischargedCases = useMemo(() => {
    if (!Array.isArray(hospitalizations)) return [];
    const query = searchTerm.trim().toLowerCase();

    return hospitalizations.filter((h) => {
      if (h.status !== "alta_medica") return false;
      if (!query) return true;

      const petMatch = h.pet_name?.toLowerCase().includes(query) ?? false;
      const ownerMatch = h.owner_name?.toLowerCase().includes(query) ?? false;
      const vetMatch = h.vet_name?.toLowerCase().includes(query) ?? false;
      const reasonMatch = h.reason?.toLowerCase().includes(query) ?? false;

      return petMatch || ownerMatch || vetMatch || reasonMatch;
    });
  }, [hospitalizations, searchTerm]);

  // Handlers optimizados
  const handleOpenEvolution = useCallback((hosp) => {
    setEditingEvolutionHosp(hosp);
    setEvolutionText(hosp.daily_evolution || "");
  }, []);

  const handleCloseEvolution = useCallback(() => {
    setEditingEvolutionHosp(null);
    setEvolutionText("");
  }, []);

  const handleSaveEvolution = async () => {
    if (!editingEvolutionHosp) return;
    try {
      setIsSubmitting(true);
      await updateHospitalizationEvolution(editingEvolutionHosp.id, evolutionText);
      handleCloseEvolution();
    } catch (error) {
      console.error("Error al guardar la evolución médica:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDischargeModal = useCallback((hosp) => {
    setDischargingHosp(hosp);
    setDischargeNotes("");
  }, []);

  const handleCloseDischargeModal = useCallback(() => {
    setDischargingHosp(null);
    setDischargeNotes("");
  }, []);

  const handleConfirmDischarge = async () => {
    if (!dischargingHosp) return;
    try {
      setIsSubmitting(true);
      await dischargePet(dischargingHosp.id, dischargeNotes);
      handleCloseDischargeModal();
    } catch (error) {
      console.error("Error al procesar el alta médica:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdmissionSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await addHospitalization(data);
      setIsAdmissionOpen(false);
    } catch (error) {
      console.error("Error al ingresar paciente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pantalla de restricción por rol
  if (!hasAccess) {
    return (
      <main className="max-w-3xl mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-autumn-200/80 shadow-md space-y-4">
        <div className="w-16 h-16 rounded-full bg-autumn-100 flex items-center justify-center mx-auto text-autumn-600">
          <BedDouble className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-autumn-900">
            Panel Médico de Internación
          </h1>
          <p className="text-sm text-autumn-700 max-w-md mx-auto leading-relaxed">
            El módulo de internaciones clínicas, monitoreo de signos vitales y seguimiento diario está restringido exclusivamente a Médicos Veterinarios y Administradores.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-medium bg-autumn-50 text-autumn-800 px-4 py-2 rounded-lg border border-autumn-200">
          <ShieldAlert className="w-4 h-4 text-autumn-600" aria-hidden="true" />
          <span>Acceso Protegido por Rol</span>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Encabezado Principal */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-autumn-200/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BedDouble className="w-7 h-7 text-autumn-600" aria-hidden="true" />
            <h1 className="text-3xl font-black tracking-tight text-autumn-900">
              Control de Internaciones
            </h1>
          </div>
          <p className="text-sm text-autumn-800/80 max-w-2xl leading-relaxed">
            Monitoreo en tiempo real de pacientes hospitalizados, registro de evoluciones diarias, esquema farmacológico y gestión de altas médicas.
          </p>
        </div>

        <Button
          onClick={() => setIsAdmissionOpen(true)}
          variant="danger"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 shadow-sm hover:shadow-md transition-all font-semibold rounded-lg shrink-0"
          aria-label="Registrar ingreso de paciente a internación"
        >
          <PlusCircle className="w-5 h-5" aria-hidden="true" />
          <span>Ingreso de Paciente</span>
        </Button>
      </header>

      {/* Controles de Navegación y Búsqueda */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-autumn-200/80 shadow-sm">
        {/* Tabs de estado */}
        <nav className="flex space-x-2 bg-autumn-100/60 p-1 rounded-xl" aria-label="Estados de Internación">
          <button
            onClick={() => setActiveTab("activos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "activos"
                ? "bg-white text-autumn-900 shadow-sm"
                : "text-autumn-700 hover:text-autumn-900"
            }`}
          >
            <Activity className="w-4 h-4 text-red-600 animate-pulse" aria-hidden="true" />
            <span>Pacientes Internados</span>
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-bold">
              {activeCases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("historial")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "historial"
                ? "bg-white text-autumn-900 shadow-sm"
                : "text-autumn-700 hover:text-autumn-900"
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-sage-600" aria-hidden="true" />
            <span>Historial de Altas</span>
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-sage-100 text-sage-800 font-bold">
              {dischargedCases.length}
            </span>
          </button>
        </nav>

        {/* Buscador */}
        <div className="w-full md:w-80">
          <Input
            icon={Search}
            placeholder="Buscar por paciente, tutor o médico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs"
          />
        </div>
      </section>

      {/* Pestaña Pacientes Activos */}
      {activeTab === "activos" && (
        <section aria-live="polite" className="space-y-6">
          {activeCases.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-autumn-200/80 p-8 shadow-sm max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto text-sage-600">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold text-autumn-900">
                Sin Pacientes Internados
              </h2>
              <p className="text-xs text-autumn-700 leading-relaxed">
                {searchTerm
                  ? "No se encontraron mascotas internadas que coincidan con el término de búsqueda."
                  : "Actualmente todas las camillas y áreas de hospitalización se encuentran disponibles."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeCases.map((hosp) => (
                <article key={hosp.id}>
                  <Card className="border-l-4 border-l-red-600 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="bg-autumn-50/50 pb-4 border-b border-autumn-100">
                      <div className="flex items-start justify-between w-full">
                        <div>
                          <CardTitle className="text-lg font-black text-autumn-900">
                            {hosp.pet_name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1 text-xs text-autumn-700">
                            <span className="font-semibold">{hosp.species}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                              {hosp.owner_name}
                            </span>
                          </div>
                        </div>
                        <Badge variant="danger" className="animate-pulse">
                          En Cama
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4 text-xs">
                      {/* Información Clínica Principal */}
                      <div className="grid grid-cols-2 gap-3 bg-autumn-50/30 p-3 rounded-xl border border-autumn-100">
                        <div className="space-y-1">
                          <span className="text-autumn-600 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                            Ingreso
                          </span>
                          <p className="font-medium text-autumn-900">
                            {formatDate(hosp.admission_date)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-autumn-600 flex items-center gap-1 font-semibold">
                            <Stethoscope className="w-3.5 h-3.5 text-autumn-500" aria-hidden="true" />
                            Veterinario
                          </span>
                          <p className="font-medium text-autumn-900">
                            {hosp.vet_name || "No asignado"}
                          </p>
                        </div>
                      </div>

                      {/* Motivo de ingreso */}
                      <div className="space-y-1">
                        <span className="font-bold text-autumn-900 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                          Motivo de Internación:
                        </span>
                        <p className="text-autumn-800 bg-white p-2.5 rounded-lg border border-autumn-200/60 leading-relaxed">
                          {hosp.reason}
                        </p>
                      </div>

                      {/* Tratamiento de Soporte */}
                      {hosp.treatment && (
                        <div className="bg-sage-50/80 p-3 rounded-xl border border-sage-200 space-y-1">
                          <strong className="text-sage-900 font-bold block flex items-center gap-1">
                            <ClipboardList className="w-3.5 h-3.5 text-sage-600" aria-hidden="true" />
                            Tratamiento de Soporte:
                          </strong>
                          <p className="text-sage-900 leading-relaxed">
                            {hosp.treatment}
                          </p>
                        </div>
                      )}

                      {/* Último reporte de evolución */}
                      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 space-y-1">
                        <strong className="text-amber-900 font-bold block flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                            Último Reporte de Evolución:
                          </span>
                        </strong>
                        <p className="text-amber-950 italic leading-relaxed">
                          {hosp.daily_evolution || "Sin registros de evolución ingresados."}
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="gap-2 bg-autumn-50/30 pt-3 border-t border-autumn-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEvolution(hosp)}
                        className="flex-1 text-xs border-autumn-300 text-autumn-900 hover:bg-white"
                      >
                        Actualizar Evolución
                      </Button>

                      <Button
                        size="sm"
                        variant="sage"
                        onClick={() => handleOpenDischargeModal(hosp)}
                        className="text-xs shrink-0"
                      >
                        Dar Alta Médica
                      </Button>
                    </CardFooter>
                  </Card>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pestaña Historial de Altas */}
      {activeTab === "historial" && (
        <section aria-live="polite" className="space-y-4">
          {dischargedCases.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-autumn-200 p-6 shadow-sm max-w-md mx-auto space-y-2">
              <p className="font-bold text-autumn-900 text-sm">
                Sin antecedentes de alta médica
              </p>
              <p className="text-xs text-autumn-700">
                No hay historiales de pacientes dados de alta con los términos ingresados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dischargedCases.map((hosp) => (
                <article
                  key={hosp.id}
                  className="bg-white p-4 rounded-xl border border-autumn-200/80 shadow-sm hover:shadow transition-shadow text-xs space-y-2"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-autumn-100">
                    <span className="font-extrabold text-autumn-900 text-sm">
                      {hosp.pet_name}
                    </span>
                    <Badge variant="success">Alta Médica</Badge>
                  </div>

                  <div className="text-autumn-700 space-y-1">
                    <div>
                      <strong className="text-autumn-900">Tutor:</strong> {hosp.owner_name}
                    </div>
                    <div>
                      <strong className="text-autumn-900">Ingreso:</strong> {formatDate(hosp.admission_date)}
                    </div>
                    <div>
                      <strong className="text-autumn-900">Alta:</strong> {formatDate(hosp.discharge_date)}
                    </div>
                  </div>

                  <p className="text-autumn-800/80 pt-2 border-t border-autumn-100 leading-relaxed italic">
                    "{hosp.reason}"
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal Ingreso Internación */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onSubmit={handleAdmissionSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Modal Editar Evolución */}
      <Modal
        isOpen={Boolean(editingEvolutionHosp)}
        onClose={handleCloseEvolution}
        title={`Actualizar Evolución de ${editingEvolutionHosp?.pet_name || ""}`}
      >
        <div className="space-y-4">
          <Textarea
            label="Detalle de Evolución del Día y Constantes Vitales"
            placeholder="Ingrese temperatura, frecuencia cardíaca, alimentación, novedades y cambios en la medicación..."
            value={evolutionText}
            onChange={(e) => setEvolutionText(e.target.value)}
            rows={5}
            className="text-xs"
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
            <Button
              variant="outline"
              onClick={handleCloseEvolution}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEvolution}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2"
            >
              {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>Guardar Evolución</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmación de Alta Médica */}
      <Modal
        isOpen={Boolean(dischargingHosp)}
        onClose={handleCloseDischargeModal}
        title={`Alta Médica para ${dischargingHosp?.pet_name || ""}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-autumn-800 leading-relaxed">
            ¿Está seguro de dar el alta médica a <strong className="text-autumn-900">{dischargingHosp?.pet_name}</strong>? Esta acción liberará la cama y moverá el expediente al historial.
          </p>

          <Textarea
            label="Indicaciones de Alta / Medicación para el Hogar (Opcional)"
            placeholder="Recomendaciones post-internación, reposo, dietas especiales..."
            value={dischargeNotes}
            onChange={(e) => setDischargeNotes(e.target.value)}
            rows={3}
            className="text-xs"
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-autumn-100">
            <Button
              variant="outline"
              onClick={handleCloseDischargeModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="sage"
              onClick={handleConfirmDischarge}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2"
            >
              {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>Confirmar Alta Médica</span>
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}