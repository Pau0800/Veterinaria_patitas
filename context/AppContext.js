"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  INITIAL_CLIENTS,
  INITIAL_PETS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_APPOINTMENTS,
  INITIAL_VACCINES,
  INITIAL_HOSPITALIZATIONS,
  INITIAL_PHARMACY,
} from "@/lib/mockData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getRoleLabel } from "@/lib/permissions";

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

function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
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

export function AppProvider({ children, initialUser = null }) {
  const router = useRouter();

  // Estado de hidratación inicial para evitar errores de coincidencia en SSR
  const [isInitialized, setIsInitialized] = useState(false);

  // Usuario autenticado y rol real desde Supabase Auth + public.profiles
  const [user, setUser] = useState(initialUser);
  const [veterinarians, setVeterinarians] = useState([]);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [pets, setPets] = useState(INITIAL_PETS);
  const [medicalRecords, setMedicalRecords] = useState(INITIAL_MEDICAL_RECORDS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [vaccines, setVaccines] = useState(INITIAL_VACCINES);
  const [hospitalizations, setHospitalizations] = useState(INITIAL_HOSPITALIZATIONS);
  const [pharmacy, setPharmacy] = useState(INITIAL_PHARMACY);

  // Sincroniza el usuario recibido desde Server Components en cada navegación/refresh
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Escucha cambios de sesión en cliente (ej. cierre de sesión en otra pestaña)
  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        router.replace("/login");
        router.refresh();
      }
    });
    return () => subscription?.unsubscribe();
  }, [router]);

  const userRole = user?.role || null;
  const currentRole = useMemo(() => {
    return userRole ? getRoleLabel(userRole) : null;
  }, [userRole]);

  // Preparado para futura incorporación del rol cliente
  const activeClientId = useMemo(() => {
    return userRole === "cliente" ? user?.id || null : null;
  }, [userRole, user]);

  // Hidratación segura en el montaje del cliente
  useEffect(() => {
    try {
      const storedClients = loadStorageItem(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
      const storedPets = loadStorageItem(STORAGE_KEYS.PETS, INITIAL_PETS);
      const storedMedical = loadStorageItem(STORAGE_KEYS.MEDICAL, INITIAL_MEDICAL_RECORDS);
      const storedAppts = loadStorageItem(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
      const storedVaccines = loadStorageItem(STORAGE_KEYS.VACCINES, INITIAL_VACCINES);
      const storedHosp = loadStorageItem(STORAGE_KEYS.HOSPITALIZATIONS, INITIAL_HOSPITALIZATIONS);
      const storedPharm = loadStorageItem(STORAGE_KEYS.PHARMACY, INITIAL_PHARMACY);

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

  // Sincronización de mascotas reales desde public.pets en Supabase (si existen)
  useEffect(() => {
    if (!supabase || !user) return;
    let isCancelled = false;

    const loadPetsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !Array.isArray(data) || data.length === 0 || isCancelled) {
          return;
        }

        setPets((prevPets) => {
          const prevById = new Map(prevPets.map((p) => [p.id, p]));
          const mapped = data.map((row) => {
            const existing = prevById.get(row.id);
            const matchedOwner = clients.find((c) => c.id === row.owner_id);
            return {
              ...row,
              owner_name:
                matchedOwner?.full_name ||
                existing?.owner_name ||
                "Sin Asignar",
            };
          });
          saveStorageItem(STORAGE_KEYS.PETS, mapped);
          return mapped;
        });
      } catch (err) {
        console.error("[AppProvider] Error al leer mascotas de Supabase:", err);
      }
    };

    loadPetsFromSupabase();
    return () => {
      isCancelled = true;
    };
  }, [user, clients]);

  // Carga dinámica de veterinarios reales desde public.profiles (role = 'veterinario', status = 'activo')
  const refreshVeterinarians = useCallback(async () => {
    if (!user) {
      setVeterinarians([]);
      return;
    }

    try {
      const response = await fetch("/api/veterinarios", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.veterinarians)) {
          setVeterinarians(data.veterinarians);
          return;
        }
      }
    } catch {
      // Fallback directo a Supabase client
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, role, status")
          .eq("role", "veterinario")
          .eq("status", "activo")
          .order("full_name", { ascending: true });

        if (!error && Array.isArray(data)) {
          setVeterinarians(data);
        }
      } catch (err) {
        console.error("[AppProvider] Error al cargar veterinarios:", err);
      }
    }
  }, [user]);

  useEffect(() => {
    refreshVeterinarians();
  }, [refreshVeterinarians]);

  // Sincronización de turnos, historias clínicas, vacunas e internaciones desde Supabase
  useEffect(() => {
    if (!supabase || !user) return;
    let isCancelled = false;

    const loadClinicalData = async () => {
      try {
        const vetMap = new Map(veterinarians.map((v) => [v.id, v.full_name]));
        const petMap = new Map(pets.map((p) => [p.id, p]));
        const clientMap = new Map(clients.map((c) => [c.id, c.full_name]));

        const [apptsRes, medRes, vaccRes, hospRes] = await Promise.all([
          supabase
            .from("appointments")
            .select("*")
            .order("appointment_date", { ascending: false }),
          supabase
            .from("medical_records")
            .select("*")
            .order("record_date", { ascending: false }),
          supabase
            .from("vaccines")
            .select("*")
            .order("application_date", { ascending: false }),
          supabase
            .from("hospitalizations")
            .select("*")
            .order("admission_date", { ascending: false }),
        ]);

        if (isCancelled) return;

        if (!apptsRes.error && Array.isArray(apptsRes.data) && apptsRes.data.length > 0) {
          const mappedAppts = apptsRes.data.map((row) => {
            const assignedVetId = row.veterinarian_id || row.vet_id || "";
            const pet = petMap.get(row.pet_id);
            return {
              ...row,
              vet_id: assignedVetId,
              veterinarian_id: assignedVetId,
              vet_name: row.vet_name || vetMap.get(assignedVetId) || "Sin Asignar",
              pet_name: row.pet_name || pet?.name || "Mascota",
              client_name:
                row.client_name ||
                clientMap.get(row.client_id) ||
                pet?.owner_name ||
                "Cliente",
            };
          });
          setAppointments(mappedAppts);
          saveStorageItem(STORAGE_KEYS.APPOINTMENTS, mappedAppts);
        }

        if (!medRes.error && Array.isArray(medRes.data) && medRes.data.length > 0) {
          const mappedMed = medRes.data.map((row) => {
            const assignedVetId = row.veterinarian_id || row.vet_id || "";
            const pet = petMap.get(row.pet_id);
            return {
              ...row,
              vet_id: assignedVetId,
              veterinarian_id: assignedVetId,
              vet_name: row.vet_name || vetMap.get(assignedVetId) || "Veterinario",
              pet_name: row.pet_name || pet?.name || "Mascota",
            };
          });
          setMedicalRecords(mappedMed);
          saveStorageItem(STORAGE_KEYS.MEDICAL, mappedMed);
        }

        if (!vaccRes.error && Array.isArray(vaccRes.data) && vaccRes.data.length > 0) {
          const mappedVacc = vaccRes.data.map((row) => {
            const assignedVetId = row.veterinarian_id || row.vet_id || "";
            const pet = petMap.get(row.pet_id);
            return {
              ...row,
              vet_id: assignedVetId,
              veterinarian_id: assignedVetId,
              vet_name: row.vet_name || vetMap.get(assignedVetId) || "Veterinario",
              pet_name: row.pet_name || pet?.name || "Mascota",
              owner_name: row.owner_name || pet?.owner_name || "Dueño",
            };
          });
          setVaccines(mappedVacc);
          saveStorageItem(STORAGE_KEYS.VACCINES, mappedVacc);
        }

        if (!hospRes.error && Array.isArray(hospRes.data) && hospRes.data.length > 0) {
          const mappedHosp = hospRes.data.map((row) => {
            const assignedVetId = row.veterinarian_id || row.vet_id || "";
            const pet = petMap.get(row.pet_id);
            return {
              ...row,
              vet_id: assignedVetId,
              veterinarian_id: assignedVetId,
              vet_name: row.vet_name || vetMap.get(assignedVetId) || "Veterinario",
              pet_name: row.pet_name || pet?.name || "Mascota",
              species: row.species || pet?.species || "Canino",
              owner_name: row.owner_name || pet?.owner_name || "Dueño",
            };
          });
          setHospitalizations(mappedHosp);
          saveStorageItem(STORAGE_KEYS.HOSPITALIZATIONS, mappedHosp);
        }
      } catch (err) {
        console.error("[AppProvider] Error al sincronizar actividad clínica:", err);
      }
    };

    loadClinicalData();
    return () => {
      isCancelled = true;
    };
  }, [user, veterinarians, pets, clients]);

  // Cierre de sesión real en Supabase Auth + limpieza de cookies de servidor
  const signOut = useCallback(async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("[AppProvider] Error al cerrar sesión:", error);
    } finally {
      setUser(null);
      window.location.replace("/login");
    }
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
    async (newPet) => {
      const owner = clients.find((c) => c.id === newPet.owner_id);
      const ownerName = owner
        ? owner.full_name
        : newPet.owner_name || "Sin Asignar";

      let persistedRow = null;
      if (supabase && user) {
        try {
          const dbPayload = {
            name: newPet.name,
            species: newPet.species,
            breed: newPet.breed || "Mestizo",
            sex: newPet.sex || "Macho",
            age_years: Number(newPet.age_years) || 0,
            birth_date: newPet.birth_date || null,
            weight_kg:
              newPet.weight_kg !== "" && newPet.weight_kg !== null
                ? Number(newPet.weight_kg)
                : null,
            color: newPet.color || null,
            photo_url: newPet.photo_url?.trim() || null,
            microchip: newPet.microchip?.trim() || null,
            owner_id: isUuid(newPet.owner_id) ? newPet.owner_id : null,
            notes: newPet.notes || null,
            status: "activo",
          };
          const { data, error } = await supabase
            .from("pets")
            .insert(dbPayload)
            .select("*")
            .single();

          if (error) {
            console.error("[Supabase addPet error]:", error.message);
          } else if (data) {
            persistedRow = data;
          }
        } catch (err) {
          console.error("[Supabase addPet exception]:", err);
        }
      }

      const item = {
        ...newPet,
        ...(persistedRow || {}),
        id: persistedRow?.id || newPet.id || generateUniqueId("p"),
        photo_url: persistedRow?.photo_url ?? newPet.photo_url?.trim() ?? "",
        owner_name: ownerName,
        status: persistedRow?.status || "activo",
        created_at: persistedRow?.created_at || getLocalDateString(),
      };

      setPets((prevPets) => {
        const updated = [item, ...prevPets];
        saveStorageItem(STORAGE_KEYS.PETS, updated);
        return updated;
      });

      return item;
    },
    [clients, user]
  );

  const updatePet = useCallback(
    async (updatedPet) => {
      const owner = clients.find((c) => c.id === updatedPet.owner_id);
      const cleanPhotoUrl = updatedPet.photo_url?.trim() || "";
      const updatedItem = {
        ...updatedPet,
        photo_url: cleanPhotoUrl,
        owner_name: owner ? owner.full_name : updatedPet.owner_name,
      };

      if (supabase && user && isUuid(updatedPet.id)) {
        try {
          const { error } = await supabase
            .from("pets")
            .update({
              name: updatedPet.name,
              species: updatedPet.species,
              breed: updatedPet.breed || "Mestizo",
              sex: updatedPet.sex || "Macho",
              age_years: Number(updatedPet.age_years) || 0,
              birth_date: updatedPet.birth_date || null,
              weight_kg:
                updatedPet.weight_kg !== "" && updatedPet.weight_kg !== null
                  ? Number(updatedPet.weight_kg)
                  : null,
              color: updatedPet.color || null,
              photo_url: cleanPhotoUrl || null,
              microchip: updatedPet.microchip?.trim() || null,
              owner_id: isUuid(updatedPet.owner_id) ? updatedPet.owner_id : null,
              notes: updatedPet.notes || null,
            })
            .eq("id", updatedPet.id);

          if (error) {
            console.error("[Supabase updatePet error]:", error.message);
          }
        } catch (err) {
          console.error("[Supabase updatePet exception]:", err);
        }
      }

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
    [clients, user]
  );

  const softDeletePet = useCallback(
    async (petId) => {
      if (supabase && user && isUuid(petId)) {
        try {
          const { error } = await supabase
            .from("pets")
            .update({ status: "baja_logica" })
            .eq("id", petId);
          if (error) {
            console.error("[Supabase softDeletePet error]:", error.message);
          }
        } catch (err) {
          console.error("[Supabase softDeletePet exception]:", err);
        }
      }

      setPets((prevPets) => {
        const updated = prevPets.map((p) =>
          p.id === petId ? { ...p, status: "baja_logica" } : p
        );
        saveStorageItem(STORAGE_KEYS.PETS, updated);
        return updated;
      });
    },
    [user]
  );

  // --- MEDICAL RECORD ACTIONS ---
  const addMedicalRecord = useCallback(
    async (newRecord) => {
      const pet = pets.find((p) => p.id === newRecord.pet_id);
      const assignedVetId = newRecord.veterinarian_id || newRecord.vet_id || "";
      const vet = veterinarians.find(
        (v) => v.id === assignedVetId || v.user_id === assignedVetId
      );
      const vetName = vet?.full_name || newRecord.vet_name || "Veterinario";
      const petName = pet ? pet.name : newRecord.pet_name || "Desconocido";

      let persistedRow = null;
      if (supabase && user && isUuid(newRecord.pet_id)) {
        try {
          const { data, error } = await supabase
            .from("medical_records")
            .insert({
              pet_id: newRecord.pet_id,
              vet_id: isUuid(assignedVetId) ? assignedVetId : null,
              veterinarian_id: isUuid(assignedVetId) ? assignedVetId : null,
              vet_name: vetName,
              pet_name: petName,
              record_date: newRecord.record_date || getLocalDateString(),
              type: newRecord.type || "Consulta General",
              title: newRecord.title,
              description: newRecord.description,
              diagnosis: newRecord.diagnosis || null,
              treatment: newRecord.treatment || null,
              medication_prescribed: newRecord.medication_prescribed || null,
              attachment_url: newRecord.attachment_url || null,
            })
            .select("*")
            .single();

          if (error) {
            console.error("[Supabase addMedicalRecord error]:", error.message);
          } else {
            persistedRow = data;
          }
        } catch (err) {
          console.error("[Supabase addMedicalRecord exception]:", err);
        }
      }

      const item = {
        ...newRecord,
        ...(persistedRow || {}),
        id: persistedRow?.id || newRecord.id || generateUniqueId("m"),
        vet_id: persistedRow?.veterinarian_id || persistedRow?.vet_id || assignedVetId,
        veterinarian_id: persistedRow?.veterinarian_id || persistedRow?.vet_id || assignedVetId,
        pet_name: petName,
        vet_name: vetName,
        record_date: persistedRow?.record_date || newRecord.record_date || getLocalDateString(),
      };

      setMedicalRecords((prev) => {
        const updated = [item, ...prev];
        saveStorageItem(STORAGE_KEYS.MEDICAL, updated);
        return updated;
      });

      return item;
    },
    [pets, veterinarians, user]
  );

  // --- APPOINTMENT ACTIONS ---
  const addAppointment = useCallback(
    async (newAppt) => {
      const pet = pets.find((p) => p.id === newAppt.pet_id);
      const client = clients.find(
        (c) => c.id === (newAppt.client_id || pet?.owner_id)
      );
      const assignedVetId = newAppt.veterinarian_id || newAppt.vet_id || "";
      const vet = veterinarians.find(
        (v) => v.id === assignedVetId || v.user_id === assignedVetId
      );

      const petName = pet ? pet.name : newAppt.pet_name || "Mascota";
      const clientName = client
        ? client.full_name
        : pet?.owner_name || newAppt.client_name || "Cliente";
      const vetName = vet ? vet.full_name : newAppt.vet_name || "Sin Asignar";
      const clientId = newAppt.client_id || pet?.owner_id || null;

      let persistedRow = null;
      if (supabase && user) {
        try {
          const { data, error } = await supabase
            .from("appointments")
            .insert({
              pet_id: isUuid(newAppt.pet_id) ? newAppt.pet_id : null,
              client_id: isUuid(clientId) ? clientId : null,
              vet_id: isUuid(assignedVetId) ? assignedVetId : null,
              veterinarian_id: isUuid(assignedVetId) ? assignedVetId : null,
              vet_name: vetName,
              pet_name: petName,
              client_name: clientName,
              appointment_date: newAppt.appointment_date || getLocalDateString(),
              appointment_time: newAppt.appointment_time || "10:00",
              reason: newAppt.reason,
              status: newAppt.status || "solicitado",
              notes: newAppt.notes || null,
            })
            .select("*")
            .single();

          if (error) {
            console.error("[Supabase addAppointment error]:", error.message);
          } else {
            persistedRow = data;
          }
        } catch (err) {
          console.error("[Supabase addAppointment exception]:", err);
        }
      }

      const item = {
        ...newAppt,
        ...(persistedRow || {}),
        id: persistedRow?.id || newAppt.id || generateUniqueId("a"),
        vet_id: persistedRow?.veterinarian_id || persistedRow?.vet_id || assignedVetId,
        veterinarian_id: persistedRow?.veterinarian_id || persistedRow?.vet_id || assignedVetId,
        pet_name: petName,
        client_name: clientName,
        vet_name: vetName,
        status: persistedRow?.status || newAppt.status || "solicitado",
        created_at: persistedRow?.created_at || getLocalDateString(),
      };

      setAppointments((prev) => {
        const updated = [item, ...prev];
        saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
        return updated;
      });

      return item;
    },
    [pets, clients, veterinarians, user]
  );

  const updateAppointmentStatus = useCallback(
    async (id, newStatus) => {
      if (supabase && user && isUuid(id)) {
        try {
          const { error } = await supabase
            .from("appointments")
            .update({ status: newStatus })
            .eq("id", id);
          if (error) {
            console.error("[Supabase updateAppointmentStatus error]:", error.message);
          }
        } catch (err) {
          console.error("[Supabase updateAppointmentStatus exception]:", err);
        }
      }

      setAppointments((prev) => {
        const updated = prev.map((a) =>
          a.id === id ? { ...a, status: newStatus } : a
        );
        saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
        return updated;
      });
    },
    [user]
  );

  const updateAppointment = useCallback(
    async (updatedAppointment) => {
      const pet = pets.find((p) => p.id === updatedAppointment.pet_id);
      const client = clients.find(
        (c) => c.id === (updatedAppointment.client_id || pet?.owner_id)
      );
      const assignedVetId =
        updatedAppointment.veterinarian_id || updatedAppointment.vet_id || "";
      const vet = assignedVetId
        ? veterinarians.find(
            (v) => v.id === assignedVetId || v.user_id === assignedVetId
          )
        : null;

      const vetName = vet ? vet.full_name : updatedAppointment.vet_name;
      const petName = pet ? pet.name : updatedAppointment.pet_name;
      const clientName = client
        ? client.full_name
        : pet?.owner_name || updatedAppointment.client_name;

      if (supabase && user && isUuid(updatedAppointment.id)) {
        try {
          const { error } = await supabase
            .from("appointments")
            .update({
              pet_id: isUuid(updatedAppointment.pet_id)
                ? updatedAppointment.pet_id
                : null,
              client_id: isUuid(updatedAppointment.client_id)
                ? updatedAppointment.client_id
                : null,
              vet_id: isUuid(assignedVetId) ? assignedVetId : null,
              veterinarian_id: isUuid(assignedVetId) ? assignedVetId : null,
              vet_name: vetName,
              pet_name: petName,
              client_name: clientName,
              appointment_date: updatedAppointment.appointment_date,
              appointment_time: updatedAppointment.appointment_time,
              reason: updatedAppointment.reason,
              status: updatedAppointment.status,
              notes: updatedAppointment.notes || null,
            })
            .eq("id", updatedAppointment.id);

          if (error) {
            console.error("[Supabase updateAppointment error]:", error.message);
          }
        } catch (err) {
          console.error("[Supabase updateAppointment exception]:", err);
        }
      }

      const item = {
        ...updatedAppointment,
        vet_id: assignedVetId,
        veterinarian_id: assignedVetId,
        pet_name: petName,
        client_name: clientName,
        vet_name: vetName,
      };

      setAppointments((prev) => {
        const updated = prev.map((a) => (a.id === item.id ? item : a));
        saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
        return updated;
      });
    },
    [pets, clients, veterinarians, user]
  );

  const reassignAppointmentVet = useCallback(
    async (appointmentId, newVetId) => {
      const targetVet = veterinarians.find(
        (v) => v.id === newVetId || v.user_id === newVetId
      );
      if (!targetVet) {
        throw new Error("No se encontró el veterinario seleccionado.");
      }

      if (isUuid(appointmentId)) {
        const response = await fetch(`/api/turnos/${appointmentId}/reasignar`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newVeterinarianId: targetVet.id }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            data?.error || "No se pudo derivar el turno en Supabase."
          );
        }
      }

      setAppointments((prev) => {
        const updated = prev.map((a) =>
          a.id === appointmentId
            ? {
                ...a,
                vet_id: targetVet.id,
                veterinarian_id: targetVet.id,
                vet_name: targetVet.full_name,
              }
            : a
        );
        saveStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
        return updated;
      });

      return targetVet;
    },
    [veterinarians]
  );

  // --- VACCINE ACTIONS ---
  const addVaccine = useCallback(
    async (newVaccine) => {
      const pet = pets.find((p) => p.id === newVaccine.pet_id);
      const assignedVetId = newVaccine.veterinarian_id || newVaccine.vet_id || "";
      const vet = veterinarians.find(
        (v) => v.id === assignedVetId || v.user_id === assignedVetId
      );
      const vetName = vet?.full_name || newVaccine.vet_name || "Veterinario";
      const petName = pet ? pet.name : newVaccine.pet_name || "Mascota";
      const ownerName = pet ? pet.owner_name : newVaccine.owner_name || "Dueño";

      let persistedRow = null;
      if (supabase && user && isUuid(newVaccine.pet_id)) {
        try {
          const { data, error } = await supabase
            .from("vaccines")
            .insert({
              pet_id: newVaccine.pet_id,
              vaccine_name: newVaccine.vaccine_name,
              application_date:
                newVaccine.application_date || getLocalDateString(),
              next_due_date:
                newVaccine.next_due_date || getLocalDateString(),
              vet_id: isUuid(assignedVetId) ? assignedVetId : null,
              veterinarian_id: isUuid(assignedVetId) ? assignedVetId : null,
              vet_name: vetName,
              pet_name: petName,
              owner_name: ownerName,
              status: newVaccine.status || "aplicada",
              notes: newVaccine.notes || null,
            })
            .select("*")
            .single();

          if (error) {
            console.error("[Supabase addVaccine error]:", error.message);
          } else {
            persistedRow = data;
          }
        } catch (err) {
          console.error("[Supabase addVaccine exception]:", err);
        }
      }

      const item = {
        ...newVaccine,
        ...(persistedRow || {}),
        id: persistedRow?.id || newVaccine.id || generateUniqueId("vcc"),
        vet_id: persistedRow?.veterinarian_id || persistedRow?.vet_id || assignedVetId,
        veterinarian_id: persistedRow?.veterinarian_id || persistedRow?.vet_id || assignedVetId,
        vet_name: vetName,
        pet_name: petName,
        owner_name: ownerName,
        status: persistedRow?.status || newVaccine.status || "aplicada",
        application_date:
          persistedRow?.application_date ||
          newVaccine.application_date ||
          getLocalDateString(),
      };

      setVaccines((prev) => {
        const updated = [item, ...prev];
        saveStorageItem(STORAGE_KEYS.VACCINES, updated);
        return updated;
      });

      return item;
    },
    [pets, veterinarians, user]
  );

  // --- HOSPITALIZATION ACTIONS ---
  const addHospitalization = useCallback(
    async (newHosp) => {
      const pet = pets.find((p) => p.id === newHosp.pet_id);
      const assignedVetId = newHosp.veterinarian_id || newHosp.vet_id || "";
      const vet = veterinarians.find(
        (v) => v.id === assignedVetId || v.user_id === assignedVetId
      );
      const vetName = vet?.full_name || newHosp.vet_name || "Veterinario";
      const petName = pet ? pet.name : newHosp.pet_name || "Mascota";
      const species = pet ? pet.species : newHosp.species || "Canino";
      const ownerName = pet ? pet.owner_name : newHosp.owner_name || "Dueño";

      let persistedRow = null;
      if (supabase && user && isUuid(newHosp.pet_id)) {
        try {
          const { data, error } = await supabase
            .from("hospitalizations")
            .insert({
              pet_id: newHosp.pet_id,
              vet_id: isUuid(assignedVetId) ? assignedVetId : null,
              veterinarian_id: isUuid(assignedVetId) ? assignedVetId : null,
              vet_name: vetName,
              pet_name: petName,
              species,
              owner_name: ownerName,
              admission_date: newHosp.admission_date || new Date().toISOString(),
              reason: newHosp.reason,
              daily_evolution: newHosp.daily_evolution || null,
              treatment: newHosp.treatment || null,
              status: "activa",
            })
            .select("*")
            .single();

          if (error) {
            console.error("[Supabase addHospitalization error]:", error.message);
          } else {
            persistedRow = data;
          }
        } catch (err) {
          console.error("[Supabase addHospitalization exception]:", err);
        }
      }

      const item = {
        ...newHosp,
        ...(persistedRow || {}),
        id: persistedRow?.id || newHosp.id || generateUniqueId("h"),
        vet_id: persistedRow?.veterinarian_id || persistedRow?.vet_id || assignedVetId,
        veterinarian_id: persistedRow?.veterinarian_id || persistedRow?.vet_id || assignedVetId,
        vet_name: vetName,
        pet_name: petName,
        species,
        owner_name: ownerName,
        admission_date:
          persistedRow?.admission_date ||
          newHosp.admission_date ||
          getLocalDateString(),
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
    [pets, veterinarians, user]
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
      user,
      userRole,
      currentRole,
      signOut,
      activeClientId,
      veterinarians,
      refreshVeterinarians,
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
      reassignAppointmentVet,
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
      user,
      userRole,
      currentRole,
      signOut,
      activeClientId,
      veterinarians,
      refreshVeterinarians,
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
      reassignAppointmentVet,
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