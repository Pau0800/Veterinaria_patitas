"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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

const AppContext = createContext(null);

// Claves estáticas centralizadas para LocalStorage
const STORAGE_KEYS = {
  CLIENTS: "vet_clients_v2",
  PETS: "vet_pets_v2",
  MEDICAL: "vet_medical_v2",
  APPOINTMENTS: "vet_appointments_v2",
  VACCINES: "vet_vaccines_v2",
  HOSPITALIZATIONS: "vet_hospitalizations_v2",
  PHARMACY: "vet_pharmacy_v2",
  ROLE: "vet_current_role_v2",
};

/**
 * Genera un identificador único, legible y resiliente a colisiones
 */
function generateUniqueId(prefix) {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return `${prefix}_${window.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Retorna la fecha actual local formateada en YYYY-MM-DD
 * evitando desfases de zona horaria derivados de toISOString()
 */
function getLocalDateString(dateInput = new Date()) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Helper seguro para lecturas en LocalStorage
 */
function loadStorageItem(key, fallbackValue) {
  if (typeof window === "undefined") return fallbackValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallbackValue;
  } catch (error) {
    console.error(`[LocalStorage Error] Fallo al leer '${key}':`, error);
    return fallbackValue;
  }
}

/**
 * Helper seguro para escrituras en LocalStorage
 */
function saveStorageItem(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[LocalStorage Error] Fallo al guardar '${key}':`, error);
  }
}

export function AppProvider({ children }) {
  // Estado de hidratación inicial para evitar errores de coincidencia en SSR
  const [isInitialized, setIsInitialized] = useState(false);

  // Estados de Dominio
  const [currentRole, setCurrentRoleState] = useState("Administrador");
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [pets, setPets] = useState(INITIAL_PETS);
  const [medicalRecords, setMedicalRecords] = useState(INITIAL_MEDICAL_RECORDS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [vaccines, setVaccines] = useState(INITIAL_VACCINES);
  const [hospitalizations, setHospitalizations] = useState(INITIAL_HOSPITALIZATIONS);
  const [pharmacy, setPharmacy] = useState(INITIAL_PHARMACY);

  // Cliente activo cuando el rol es "Cliente" (María Fernández - id: c1 por defecto)
  const activeClientId = useMemo(() => {
    return currentRole === "Cliente" ? "c1" : null;
  }, [currentRole]);

  // Hidratación segura en el montaje del cliente
  useEffect(() => {
    try {
      const storedRole = loadStorageItem(STORAGE_KEYS.ROLE, "Administrador");
      const storedClients = loadStorageItem(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
      const storedPets = loadStorageItem(STORAGE_KEYS.PETS, INITIAL_PETS);
      const storedMedical = loadStorageItem(STORAGE_KEYS.MEDICAL, INITIAL_MEDICAL_RECORDS);
      const storedAppts = loadStorageItem(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
      const storedVaccines = loadStorageItem(STORAGE_KEYS.VACCINES, INITIAL_VACCINES);
      const storedHosp = loadStorageItem(STORAGE_KEYS.HOSPITALIZATIONS, INITIAL_HOSPITALIZATIONS);
      const storedPharm = loadStorageItem(STORAGE_KEYS.PHARMACY, INITIAL_PHARMACY);

      setCurrentRoleState(storedRole);
      setClients(storedClients);
      setPets(storedPets);
      setMedicalRecords(storedMedical);
      setAppointments(storedAppts);
      setVaccines(storedVaccines);
      setHospitalizations(storedHosp);
      setPharmacy(storedPharm);
    } catch (error) {
      console.error("[AppProvider] Error en la inicialización de datos:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Manejador de cambio de rol con persistencia
  const setCurrentRole = useCallback((role) => {
    setCurrentRoleState(role);
    saveStorageItem(STORAGE_KEYS.ROLE, role);
  }, []);

  // Restablecimiento de datos predeterminados (Utility)
  const resetToMockData = useCallback(() => {
    setClients(INITIAL_CLIENTS);
    setPets(INITIAL_PETS);
    setMedicalRecords(INITIAL_MEDICAL_RECORDS);
    setAppointments(INITIAL_APPOINTMENTS);
    setVaccines(INITIAL_VACCINES);
    setHospitalizations(INITIAL_HOSPITALIZATIONS);
    setPharmacy(INITIAL_PHARMACY);

    saveStorageItem(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    saveStorageItem(STORAGE_KEYS.PETS, INITIAL_PETS);
    saveStorageItem(STORAGE_KEYS.MEDICAL, INITIAL_MEDICAL_RECORDS);
    saveStorageItem(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    saveStorageItem(STORAGE_KEYS.VACCINES, INITIAL_VACCINES);
    saveStorageItem(STORAGE_KEYS.HOSPITALIZATIONS, INITIAL_HOSPITALIZATIONS);
    saveStorageItem(STORAGE_KEYS.PHARMACY, INITIAL_PHARMACY);
  }, []);

  // --- CLIENT ACTIONS ---
  const addClient = useCallback((newClient) => {
    const item = {
      ...newClient,
      id: newClient.id || generateUniqueId("c"),
      role: "Cliente",
      status: "activo",
      created_at: getLocalDateString(),
    };

    setClients((prevClients) => {
      const updated = [item, ...prevClients];
      saveStorageItem(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    });

    return item;
  }, []);

  const updateClient = useCallback((updatedClient) => {
    setClients((prevClients) => {
      const updated = prevClients.map((c) =>
        c.id === updatedClient.id ? { ...c, ...updatedClient } : c
      );
      saveStorageItem(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    });

    // Sincronización en cascada: actualizar denormalización de owner_name
    if (updatedClient.full_name) {
      setPets((prevPets) => {
        const updatedPets = prevPets.map((p) =>
          p.owner_id === updatedClient.id
            ? { ...p, owner_name: updatedClient.full_name }
            : p
        );
        saveStorageItem(STORAGE_KEYS.PETS, updatedPets);
        return updatedPets;
      });

      setAppointments((prevAppts) => {
        const updatedAppts = prevAppts.map((a) =>
          a.client_id === updatedClient.id
            ? { ...a, client_name: updatedClient.full_name }
            : a
        );
        saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updatedAppts);
        return updatedAppts;
      });
    }
  }, []);

  const softDeleteClient = useCallback((clientId) => {
    setClients((prevClients) => {
      const updated = prevClients.map((c) =>
        c.id === clientId ? { ...c, status: "inactivo" } : c
      );
      saveStorageItem(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    });
  }, []);

  // --- PET ACTIONS ---
  const addPet = useCallback(
    (newPet) => {
      const owner = clients.find((c) => c.id === newPet.owner_id);
      const item = {
        ...newPet,
        id: newPet.id || generateUniqueId("p"),
        owner_name: owner ? owner.full_name : newPet.owner_name || "Sin Asignar",
        status: "activo",
        created_at: getLocalDateString(),
      };

      setPets((prevPets) => {
        const updated = [item, ...prevPets];
        saveStorageItem(STORAGE_KEYS.PETS, updated);
        return updated;
      });

      return item;
    },
    [clients]
  );

  const updatePet = useCallback(
    (updatedPet) => {
      const owner = clients.find((c) => c.id === updatedPet.owner_id);
      const updatedItem = {
        ...updatedPet,
        owner_name: owner ? owner.full_name : updatedPet.owner_name,
      };

      setPets((prevPets) => {
        const updated = prevPets.map((p) =>
          p.id === updatedItem.id ? updatedItem : p
        );
        saveStorageItem(STORAGE_KEYS.PETS, updated);
        return updated;
      });

      // Sincronización en cascada para pet_name
      if (updatedPet.name) {
        setMedicalRecords((prev) => {
          const updated = prev.map((m) =>
            m.pet_id === updatedPet.id ? { ...m, pet_name: updatedPet.name } : m
          );
          saveStorageItem(STORAGE_KEYS.MEDICAL, updated);
          return updated;
        });

        setAppointments((prev) => {
          const updated = prev.map((a) =>
            a.pet_id === updatedPet.id ? { ...a, pet_name: updatedPet.name } : a
          );
          saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
          return updated;
        });

        setVaccines((prev) => {
          const updated = prev.map((v) =>
            v.pet_id === updatedPet.id ? { ...v, pet_name: updatedPet.name } : v
          );
          saveStorageItem(STORAGE_KEYS.VACCINES, updated);
          return updated;
        });

        setHospitalizations((prev) => {
          const updated = prev.map((h) =>
            h.id === updatedPet.id ? { ...h, pet_name: updatedPet.name } : h
          );
          saveStorageItem(STORAGE_KEYS.HOSPITALIZATIONS, updated);
          return updated;
        });
      }
    },
    [clients]
  );

  const softDeletePet = useCallback((petId) => {
    setPets((prevPets) => {
      const updated = prevPets.map((p) =>
        p.id === petId ? { ...p, status: "baja_logica" } : p
      );
      saveStorageItem(STORAGE_KEYS.PETS, updated);
      return updated;
    });
  }, []);

  // --- MEDICAL RECORD ACTIONS ---
  const addMedicalRecord = useCallback(
    (newRecord) => {
      const pet = pets.find((p) => p.id === newRecord.pet_id);
      const vet = VETERINARIANS.find((v) => v.id === newRecord.vet_id);

      const item = {
        ...newRecord,
        id: newRecord.id || generateUniqueId("m"),
        pet_name: pet ? pet.name : newRecord.pet_name || "Desconocido",
        vet_name: vet ? vet.full_name : newRecord.vet_name || "Veterinario",
        record_date: newRecord.record_date || getLocalDateString(),
      };

      setMedicalRecords((prev) => {
        const updated = [item, ...prev];
        saveStorageItem(STORAGE_KEYS.MEDICAL, updated);
        return updated;
      });

      return item;
    },
    [pets]
  );

  // --- APPOINTMENT ACTIONS ---
  const addAppointment = useCallback(
    (newAppt) => {
      const pet = pets.find((p) => p.id === newAppt.pet_id);
      const client = clients.find(
        (c) => c.id === (newAppt.client_id || pet?.owner_id)
      );
      const vet = VETERINARIANS.find((v) => v.id === newAppt.vet_id);

      const item = {
        ...newAppt,
        id: newAppt.id || generateUniqueId("a"),
        pet_name: pet ? pet.name : newAppt.pet_name || "Mascota",
        client_name: client ? client.full_name : newAppt.client_name || "Cliente",
        vet_name: vet ? vet.full_name : newAppt.vet_name || "Sin Asignar",
        status: newAppt.status || "solicitado",
        created_at: getLocalDateString(),
      };

      setAppointments((prev) => {
        const updated = [item, ...prev];
        saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
        return updated;
      });

      return item;
    },
    [pets, clients]
  );

  const updateAppointmentStatus = useCallback((id, newStatus) => {
    setAppointments((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, status: newStatus } : a
      );
      saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
      return updated;
    });
  }, []);

  const updateAppointment = useCallback(
    (updatedAppointment) => {
      const pet = pets.find((p) => p.id === updatedAppointment.pet_id);
      const client = clients.find(
        (c) => c.id === (updatedAppointment.client_id || pet?.owner_id)
      );
      const vet = updatedAppointment.vet_id
        ? VETERINARIANS.find((v) => v.id === updatedAppointment.vet_id)
        : null;

      const item = {
        ...updatedAppointment,
        pet_name: pet ? pet.name : updatedAppointment.pet_name,
        client_name: client ? client.full_name : updatedAppointment.client_name,
        vet_name: vet ? vet.full_name : updatedAppointment.vet_name,
      };

      setAppointments((prev) => {
        const updated = prev.map((a) => (a.id === item.id ? item : a));
        saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
        return updated;
      });
    },
    [pets, clients]
  );

  // --- VACCINE ACTIONS ---
  const addVaccine = useCallback(
    (newVaccine) => {
      const pet = pets.find((p) => p.id === newVaccine.pet_id);
      const item = {
        ...newVaccine,
        id: newVaccine.id || generateUniqueId("vcc"),
        pet_name: pet ? pet.name : newVaccine.pet_name || "Mascota",
        owner_name: pet ? pet.owner_name : newVaccine.owner_name || "Dueño",
        status: newVaccine.status || "aplicada",
        application_date: newVaccine.application_date || getLocalDateString(),
      };

      setVaccines((prev) => {
        const updated = [item, ...prev];
        saveStorageItem(STORAGE_KEYS.VACCINES, updated);
        return updated;
      });

      return item;
    },
    [pets]
  );

  // --- HOSPITALIZATION ACTIONS ---
  const addHospitalization = useCallback(
    (newHosp) => {
      const pet = pets.find((p) => p.id === newHosp.pet_id);
      const item = {
        ...newHosp,
        id: newHosp.id || generateUniqueId("h"),
        pet_name: pet ? pet.name : newHosp.pet_name || "Mascota",
        species: pet ? pet.species : newHosp.species || "Canino",
        owner_name: pet ? pet.owner_name : newHosp.owner_name || "Dueño",
        admission_date: newHosp.admission_date || getLocalDateString(),
        discharge_date: null,
        status: "activa",
      };

      setHospitalizations((prev) => {
        const updated = [item, ...prev];
        saveStorageItem(STORAGE_KEYS.HOSPITALIZATIONS, updated);
        return updated;
      });

      return item;
    },
    [pets]
  );

  const dischargePet = useCallback((id) => {
    setHospitalizations((prev) => {
      const updated = prev.map((h) =>
        h.id === id
          ? {
              ...h,
              status: "alta_medica",
              discharge_date: getLocalDateString(),
            }
          : h
      );
      saveStorageItem(STORAGE_KEYS.HOSPITALIZATIONS, updated);
      return updated;
    });
  }, []);

  const updateHospitalizationEvolution = useCallback((id, evolutionText) => {
    setHospitalizations((prev) => {
      const updated = prev.map((h) =>
        h.id === id ? { ...h, daily_evolution: evolutionText } : h
      );
      saveStorageItem(STORAGE_KEYS.HOSPITALIZATIONS, updated);
      return updated;
    });
  }, []);

  // --- PHARMACY ACTIONS ---
  const addPharmacyItem = useCallback((newItem) => {
    const item = {
      ...newItem,
      id: newItem.id || generateUniqueId("ph"),
      stock: Math.max(0, Number(newItem.stock) || 0),
      min_stock: Math.max(0, Number(newItem.min_stock) || 5),
      unit_price: Math.max(0, Number(newItem.unit_price) || 0),
    };

    setPharmacy((prev) => {
      const updated = [item, ...prev];
      saveStorageItem(STORAGE_KEYS.PHARMACY, updated);
      return updated;
    });

    return item;
  }, []);

  const updatePharmacyStock = useCallback((id, delta) => {
    setPharmacy((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      );
      saveStorageItem(STORAGE_KEYS.PHARMACY, updated);
      return updated;
    });
  }, []);

  // Memorización del valor expuesto por el Contexto
  const contextValue = useMemo(
    () => ({
      isInitialized,
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
      // Acciones memorizadas con useCallback
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
      resetToMockData,
      isSupabaseConfigured,
      supabase,
    }),
    [
      isInitialized,
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
      resetToMockData,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe ser utilizado dentro de un AppProvider.");
  }
  return context;
}