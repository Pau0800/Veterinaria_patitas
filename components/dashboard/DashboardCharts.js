"use client";

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Calendar, Syringe, Pill, AlertCircle, CheckCircle2 } from "lucide-react";

// Paleta otoñal cálida manteniendo verde para Confirmados y rojo para Cancelados
const COLOR_PALETTE = {
  confirmado: { bg: "#10B981", text: "text-emerald-600", label: "Confirmados" },
  solicitado: { bg: "#D48A1C", text: "text-[#D48A1C]", label: "Solicitados" },
  cancelado: { bg: "#EF4444", text: "text-red-600", label: "Cancelados" },
  reprogramado: { bg: "#AD5D1E", text: "text-[#AD5D1E]", label: "Reprogramados" },
  species: ["#B84A14", "#D48A1C", "#C4832B", "#4B4118", "#A03813"],
};

const CustomChartTooltip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-[#E6D8C3] bg-[#FFFDF9]/95 p-3 shadow-xl backdrop-blur-sm transition-all">
      <p className="mb-1 text-xs font-bold text-[#473621]">{label || payload[0].name}</p>
      <div className="flex items-center gap-2 text-xs font-semibold text-[#2C2115]">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: payload[0].color || payload[0].fill }}
        />
        <span>
          {payload[0].value.toLocaleString()} {unit}
        </span>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <Card className="transition-all duration-200 hover:shadow-md border-[#E6D8C3] bg-[#FFFDF9]">
    <CardContent className="p-5">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#6E4B2A]">{title}</p>
          <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#2C2115]">{value}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-[#6E4B2A]">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 bg-[#F5EFE4] border border-[#E6D8C3]/70 ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const EmptyChartState = ({ message }) => (
  <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#E6D8C3] bg-[#FAF6EF]/50 p-6 text-center">
    <AlertCircle className="mb-2 h-8 w-8 text-[#6E4B2A]" />
    <p className="text-sm font-medium text-[#473621]">{message}</p>
  </div>
);

export function DashboardCharts({
  appointments = [],
  vaccines = [],
  pharmacy = [],
  showPharmacy = true,
}) {
  const { appointmentData, totalAppointments, confirmationRate } = useMemo(() => {
    const safeAppointments = Array.isArray(appointments) ? appointments : [];

    const counts = safeAppointments.reduce((acc, app) => {
      const status = (app?.status || "solicitado").toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const total = safeAppointments.length;
    const confirmed = counts["confirmado"] || 0;
    const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    const data = [
      { name: "Confirmados", cantidad: counts["confirmado"] || 0, fill: COLOR_PALETTE.confirmado.bg, status: "confirmado" },
      { name: "Solicitados", cantidad: counts["solicitado"] || 0, fill: COLOR_PALETTE.solicitado.bg, status: "solicitado" },
      { name: "Reprogramados", cantidad: counts["reprogramado"] || 0, fill: COLOR_PALETTE.reprogramado.bg, status: "reprogramado" },
      { name: "Cancelados", cantidad: counts["cancelado"] || 0, fill: COLOR_PALETTE.cancelado.bg, status: "cancelado" },
    ];

    return { appointmentData: data, totalAppointments: total, confirmationRate: rate };
  }, [appointments]);

  const speciesData = useMemo(() => {
    const safeAppointments = Array.isArray(appointments) ? appointments : [];

    const counts = safeAppointments.reduce((acc, app) => {
      const species = app?.patient?.species || app?.species || "Perros";
      acc[species] = (acc[species] || 0) + 1;
      return acc;
    }, {});

    const hasDynamicData = Object.keys(counts).length > 0;

    const sourceData = hasDynamicData
      ? Object.entries(counts).map(([name, value]) => ({ name, value }))
      : [
        { name: "Perros", value: 14 },
        { name: "Gatos", value: 8 },
        { name: "Aves", value: 3 },
        { name: "Exóticos", value: 2 },
      ];

    return sourceData.map((item, index) => ({
      ...item,
      color: COLOR_PALETTE.species[index % COLOR_PALETTE.species.length],
    }));
  }, [appointments]);

  const vaccineStats = useMemo(() => {
    const safeVaccines = Array.isArray(vaccines) ? vaccines : [];
    const pending = safeVaccines.filter((v) => v?.status === "pendiente").length;
    return { total: safeVaccines.length, pending };
  }, [vaccines]);

  const pharmacyStats = useMemo(() => {
    const safePharmacy = Array.isArray(pharmacy) ? pharmacy : [];
    const lowStock = safePharmacy.filter((item) => (item?.stock || 0) <= (item?.min_stock ?? item?.minStock ?? 5)).length;
    return { total: safePharmacy.length, lowStock };
  }, [pharmacy]);

  return (
    <div className="space-y-6 w-full">
      {/* Sección Superior: Tarjetas resumen de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Agendados"
          value={totalAppointments}
          subtitle={`${confirmationRate}% de tasa de confirmación`}
          icon={Calendar}
          colorClass="text-[#B84A14]"
        />
        <StatCard
          title="Vacunas Aplicadas/Pendientes"
          value={vaccineStats.total}
          subtitle={`${vaccineStats.pending} pendientes este mes`}
          icon={Syringe}
          colorClass="text-emerald-600"
        />
        {showPharmacy && (
          <StatCard
            title="Alertas Farmacia"
            value={pharmacyStats.lowStock}
            subtitle="Productos con bajo stock"
            icon={Pill}
            colorClass={pharmacyStats.lowStock > 0 ? "text-[#D48A1C]" : "text-[#4B4118]"}
          />
        )}
        <StatCard
          title="Especies Atendidas"
          value={speciesData.reduce((acc, curr) => acc + curr.value, 0)}
          subtitle={`${speciesData.length} categorías activas`}
          icon={CheckCircle2}
          colorClass="text-[#AD5D1E]"
        />
      </div>

      {/* Sección Principal de Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico 1: Estado de Turnos */}
        <Card className="flex flex-col border-[#E6D8C3] bg-[#FFFDF9]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#2C2115]">
              Estado de Turnos Agendados
            </CardTitle>
            <CardDescription className="text-xs text-[#6E4B2A]">
              Desglose en tiempo real de citas según su estado
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-2">
            {totalAppointments === 0 && appointmentData.every((d) => d.cantidad === 0) ? (
              <EmptyChartState message="No hay turnos registrados para mostrar" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6D8C3" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#473621", fontSize: 12, fontWeight: 500 }}
                      dy={8}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6E4B2A", fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomChartTooltip unit="turnos" />} cursor={{ fill: "rgba(184, 74, 20, 0.06)" }} />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} maxBarSize={55}>
                      {appointmentData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.fill} className="transition-opacity duration-200 hover:opacity-80" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 2: Distribución por Especie */}
        <Card className="flex flex-col border-[#E6D8C3] bg-[#FFFDF9]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#2C2115]">
              Distribución por Especie
            </CardTitle>
            <CardDescription className="text-xs text-[#6E4B2A]">
              Proporción de pacientes atendidos en la clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-between pt-2">
            {speciesData.length === 0 ? (
              <EmptyChartState message="No hay datos de especies registrados" />
            ) : (
              <>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={speciesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {speciesData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.color} className="transition-opacity duration-200 hover:opacity-80" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip unit="pacientes" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Leyenda Personalizada e Interactiva */}
                <div className="mt-4 flex w-full flex-wrap justify-center gap-3 border-t border-[#E6D8C3] pt-4">
                  {speciesData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center space-x-2 rounded-full bg-[#F5EFE4] border border-[#E6D8C3] px-3 py-1 text-xs font-semibold text-[#473621]"
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                      <span className="text-[#6E4B2A]">({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

DashboardCharts.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
      species: PropTypes.string,
    })
  ),
  vaccines: PropTypes.array,
  pharmacy: PropTypes.array,
  showPharmacy: PropTypes.bool,
};
