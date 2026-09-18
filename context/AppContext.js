"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_CLIENTS,
  INITIAL_PETS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_APPOINTMENTS,
  INITIAL_VACCINES,
  INITIAL_HOSPITALIZATIONS,
  INITIAL_PHARMACY,
  VETERINARIANS,
} from "@/lib/mockData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentRole, setCurrentRole] = useState("Administrador"); // Administrador, Veterinario, Recepcionista, Cliente
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [pets, setPets] = useState(INITIAL_PETS);
  const [medicalRecords, setMedicalRecords] = useState(INITIAL_MEDICAL_RECORDS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [vaccines, setVaccines] = useState(INITIAL_VACCINES);
  const [hospitalizations, setHospitalizations] = useState(INITIAL_HOSPITALIZATIONS);
  const [pharmacy, setPharmacy] = useState(INITIAL_PHARMACY);

  // Filtered client context for "Cliente" role (María Fernández - c1)
  const activeClientId = currentRole === "Cliente" ? "c1" : null;

  // Sync / Hydrate from LocalStorage if available
  useEffect(() => {
    try {
      const storedClients = localStorage.getItem("vet_clients");
      if (storedClients) setClients(JSON.parse(storedClients));

      const storedPets = localStorage.getItem("vet_pets");
      if (storedPets) setPets(JSON.parse(storedPets));

      const storedMedical = localStorage.getItem("vet_medical");
      if (storedMedical) setMedicalRecords(JSON.parse(storedMedical));

      const storedAppts = localStorage.getItem("vet_appointments");
      if (storedAppts) setAppointments(JSON.parse(storedAppts));

      const storedVaccines = localStorage.getItem("vet_vaccines");
      if (storedVaccines) setVaccines(JSON.parse(storedVaccines));

      const storedHosp = localStorage.getItem("vet_hospitalizations");
      if (storedHosp) setHospitalizations(JSON.parse(storedHosp));

      const storedPharm = localStorage.getItem("vet_pharmacy");
      if (storedPharm) setPharmacy(JSON.parse(storedPharm));
    } catch (e) {
      console.warn("Using initial in-memory mock data:", e);
    }
  }, []);

  // Save changes to LocalStorage
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to local storage:", e);
    }
  };

  // --- CLIENT ACTIONS ---
  const addClient = (newClient) => {
    const item = {
      ...newClient,
      id: `c_${Date.now()}`,
      role: "Cliente",
      status: "activo",
      created_at: new Date().toISOString().split("T")[0],
    };
    const updated = [item, ...clients];
    setClients(updated);
    saveToStorage("vet_clients", updated);
    return item;
  };

  const updateClient = (updatedClient) => {
    const updated = clients.map((c) => (c.id === updatedClient.id ? { ...c, ...updatedClient } : c));
    setClients(updated);
    saveToStorage("vet_clients", updated);
  };

  const softDeleteClient = (clientId) => {
    const updated = clients.map((c) => (c.id === clientId ? { ...c, status: "inactivo" } : c));
    setClients(updated);
    saveToStorage("vet_clients", updated);
  };

  // --- PET ACTIONS ---
  const addPet = (newPet) => {
    const owner = clients.find((c) => c.id === newPet.owner_id);
    const item = {
      ...newPet,
      id: `p_${Date.now()}`,
      owner_name: owner ? owner.full_name : "Sin Asignar",
      status: "activo",
    };
    const updated = [item, ...pets];
    setPets(updated);
    saveToStorage("vet_pets", updated);
    return item;
  };

  const updatePet = (updatedPet) => {
    const owner = clients.find((c) => c.id === updatedPet.owner_id);
    const item = {
      ...updatedPet,
      owner_name: owner ? owner.full_name : updatedPet.owner_name,
    };
    const updated = pets.map((p) => (p.id === item.id ? item : p));
    setPets(updated);
    saveToStorage("vet_pets", updated);
  };

  const softDeletePet = (petId) => {
    const updated = pets.map((p) => (p.id === petId ? { ...p, status: "baja_logica" } : p));
    setPets(updated);
    saveToStorage("vet_pets", updated);
  };

  // --- MEDICAL RECORD ACTIONS ---
  const addMedicalRecord = (newRecord) => {
    const pet = pets.find((p) => p.id === newRecord.pet_id);
    const item = {
      ...newRecord,
      id: `m_${Date.now()}`,
      pet_name: pet ? pet.name : "Desconocido",
      record_date: newRecord.record_date || new Date().toISOString().split("T")[0],
    };
    const updated = [item, ...medicalRecords];
    setMedicalRecords(updated);
    saveToStorage("vet_medical", updated);
    return item;
  };

  // --- APPOINTMENT ACTIONS ---
  const addAppointment = (newAppt) => {
    const pet = pets.find((p) => p.id === newAppt.pet_id);
    const client = clients.find((c) => c.id === (newAppt.client_id || pet?.owner_id));
    const item = {
      ...newAppt,
      id: `a_${Date.now()}`,
      pet_name: pet ? pet.name : "Mascota",
      client_name: client ? client.full_name : "Cliente",
      status: newAppt.status || "solicitado",
    };
    const updated = [item, ...appointments];
    setAppointments(updated);
    saveToStorage("vet_appointments", updated);
    return item;
  };

  const updateAppointmentStatus = (id, newStatus) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    setAppointments(updated);
    saveToStorage("vet_appointments", updated);
  };

  const updateAppointment = (updatedAppointment) => {
    const pet = pets.find((p) => p.id === updatedAppointment.pet_id);
    const client = clients.find((c) => c.id === (updatedAppointment.client_id || pet?.owner_id));
    const vet = updatedAppointment.vet_id
      ? VETERINARIANS.find((v) => v.id === updatedAppointment.vet_id)
      : null;
    const item = {
      ...updatedAppointment,
      pet_name: pet ? pet.name : updatedAppointment.pet_name,
      client_name: client ? client.full_name : updatedAppointment.client_name,
      vet_name: vet ? vet.full_name : updatedAppointment.vet_name,
    };
    const updated = appointments.map((a) => (a.id === item.id ? item : a));
    setAppointments(updated);
    saveToStorage("vet_appointments", updated);
  };

  // --- VACCINE ACTIONS ---
  const addVaccine = (newVaccine) => {
    const pet = pets.find((p) => p.id === newVaccine.pet_id);
    const item = {
      ...newVaccine,
      id: `vcc_${Date.now()}`,
      pet_name: pet ? pet.name : "Mascota",
      owner_name: pet ? pet.owner_name : "Dueño",
      status: newVaccine.status || "aplicada",
    };
    const updated = [item, ...vaccines];
    setVaccines(updated);
    saveToStorage("vet_vaccines", updated);
    return item;
  };

  // --- HOSPITALIZATION ACTIONS ---
  const addHospitalization = (newHosp) => {
    const pet = pets.find((p) => p.id === newHosp.pet_id);
    const item = {
      ...newHosp,
      id: `h_${Date.now()}`,
      pet_name: pet ? pet.name : "Mascota",
      species: pet ? pet.species : "Canino",
      owner_name: pet ? pet.owner_name : "Dueño",
      admission_date: new Date().toISOString().split("T")[0],
      discharge_date: null,
      status: "activa",
    };
    const updated = [item, ...hospitalizations];
    setHospitalizations(updated);
    saveToStorage("vet_hospitalizations", updated);
    return item;
  };

  const dischargePet = (id) => {
    const updated = hospitalizations.map((h) =>
      h.id === id
        ? {
            ...h,
            status: "alta_medica",
            discharge_date: new Date().toISOString().split("T")[0],
          }
        : h
    );
    setHospitalizations(updated);
    saveToStorage("vet_hospitalizations", updated);
  };

  const updateHospitalizationEvolution = (id, evolutionText) => {
    const updated = hospitalizations.map((h) =>
      h.id === id ? { ...h, daily_evolution: evolutionText } : h
    );
    setHospitalizations(updated);
    saveToStorage("vet_hospitalizations", updated);
  };

  // --- PHARMACY ACTIONS ---
  const addPharmacyItem = (newItem) => {
    const item = {
      ...newItem,
      id: `ph_${Date.now()}`,
      stock: Number(newItem.stock) || 0,
      min_stock: Number(newItem.min_stock) || 5,
      unit_price: Number(newItem.unit_price) || 0,
    };
    const updated = [item, ...pharmacy];
    setPharmacy(updated);
    saveToStorage("vet_pharmacy", updated);
    return item;
  };

  const updatePharmacyStock = (id, delta) => {
    const updated = pharmacy.map((p) =>
      p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    );
    setPharmacy(updated);
    saveToStorage("vet_pharmacy", updated);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeClientId,
        clients,
        pets,
        medicalRecords,
        appointments,
        vaccines,
        hospitalizations,
        pharmacy,
        // Methods
        addClient,
        updateClient,
        softDeleteClient,
        addPet,
        updatePet,
        softDeletePet,
        addMedicalRecord,
        addAppointment,
        updateAppointment,
        updateAppointmentStatus,
        addVaccine,
        addHospitalization,
        dischargePet,
        updateHospitalizationEvolution,
        addPharmacyItem,
        updatePharmacyStock,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
