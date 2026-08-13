"use client";

import React from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export function DashboardCharts({ appointments, vaccines, pharmacy }) {
  // Chart 1 Data: Turnos por estado
  const statusCounts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const appointmentData = [
    { name: "Confirmados", cantidad: statusCounts["confirmado"] || 0, fill: "#556B2F" },
    { name: "Solicitados", cantidad: statusCounts["solicitado"] || 0, fill: "#D97706" },
    { name: "Cancelados", cantidad: statusCounts["cancelado"] || 0, fill: "#9E3B1B" },
    { name: "Reprogramados", cantidad: statusCounts["reprogramado"] || 0, fill: "#4A3E3D" },
  ];

  // Chart 2 Data: Distribución de Especies en Clínica
  const speciesData = [
    { name: "Perros", value: 14, color: "#C85A32" },
    { name: "Gatos", value: 8, color: "#D97706" },
    { name: "Aves", value: 3, color: "#556B2F" },
    { name: "Exóticos", value: 2, color: "#4A3E3D" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico 1: Turnos de la Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Turnos Agendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE6D5" />
                <XAxis dataKey="name" stroke="#4A3E3D" fontSize={12} />
                <YAxis stroke="#4A3E3D" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2C221E",
                    borderColor: "#C85A32",
                    borderRadius: "8px",
                    color: "#FFF",
                  }}
                />
                <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                  {appointmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 2: Distribución de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Especie de Mascotas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speciesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2C221E",
                    borderColor: "#C85A32",
                    borderRadius: "8px",
                    color: "#FFF",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {speciesData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5 text-xs font-medium text-autumn-800">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
