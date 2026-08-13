import React from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Stethoscope, Activity, Pill, ShieldAlert, FileText } from "lucide-react";

export function MedicalTimeline({ records = [] }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-10 bg-autumn-50 rounded-xl border border-autumn-200 text-autumn-800/70">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="font-semibold">No hay historial clínico registrado aún.</p>
        <p className="text-xs">Los registros veterinarios aparecerán aquí ordenados cronológicamente.</p>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "Cirugía":
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case "Diagnóstico":
        return <Activity className="w-4 h-4 text-amberGold-600" />;
      case "Medicación":
      case "Tratamiento":
        return <Pill className="w-4 h-4 text-sage-600" />;
      default:
        return <Stethoscope className="w-4 h-4 text-autumn-600" />;
    }
  };

  return (
    <div className="relative pl-6 border-l-2 border-autumn-300 space-y-6">
      {records.map((rec) => (
        <div key={rec.id} className="relative group">
          {/* Dot Icon */}
          <div className="absolute -left-[31px] top-1 bg-white p-1 rounded-full border-2 border-autumn-500 shadow-autumn-sm">
            {getTypeIcon(rec.type)}
          </div>

          {/* Record Card */}
          <div className="bg-white p-5 rounded-xl border border-autumn-200 shadow-autumn-sm hover:shadow-autumn-md transition-shadow space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Badge variant={rec.type === "Cirugía" ? "danger" : "primary"}>
                  {rec.type}
                </Badge>
                <h4 className="text-base font-bold text-autumn-900">{rec.title}</h4>
              </div>
              <div className="text-xs font-semibold text-autumn-700 bg-autumn-100 px-2.5 py-1 rounded-full">
                {formatDate(rec.record_date)}
              </div>
            </div>

            <p className="text-sm text-autumn-800 leading-relaxed">{rec.description}</p>

            {rec.diagnosis && (
              <div className="bg-amberGold-50 p-3 rounded-lg border border-amberGold-200/60 text-xs">
                <span className="font-bold text-amberGold-800">Diagnóstico: </span>
                <span className="text-amberGold-900">{rec.diagnosis}</span>
              </div>
            )}

            {rec.treatment && (
              <div className="bg-sage-50 p-3 rounded-lg border border-sage-200/60 text-xs">
                <span className="font-bold text-sage-800">Tratamiento Indicado: </span>
                <span className="text-sage-900">{rec.treatment}</span>
              </div>
            )}

            {rec.medication_prescribed && (
              <div className="bg-autumn-50 p-3 rounded-lg border border-autumn-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-autumn-900">Receta / Medicación: </span>
                  <span className="text-autumn-800">{rec.medication_prescribed}</span>
                </div>
                <Badge variant="warning">Recetado</Badge>
              </div>
            )}

            <div className="text-[11px] text-autumn-800/60 pt-2 border-t border-autumn-100 flex items-center justify-between">
              <span>Atendido por: <strong className="text-autumn-900">{rec.vet_name}</strong></span>
              <span>Ref: #{rec.id}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
