/**
 * @fileoverview Colección centralizada de datos iniciales (Mock Data) con integridad referencial,
 * tipado declarativo y congelamiento de estado (immutability).
 * @module lib/constants/mockData
 */

/**
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} full_name
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {'Cliente' | 'Administrador' | 'Veterinario'} role
 * @property {'activo' | 'inactivo'} status
 * @property {string} created_at
 */
export const INITIAL_CLIENTS = Object.freeze([
  {
    id: "c1",
    full_name: "María Fernández",
    email: "maria.fernandez@email.com",
    phone: "+54 9 11 4523-8890",
    address: "Av. Corrientes 2450, CABA",
    role: "Cliente",
    status: "activo",
    created_at: "2024-01-15",
  },
  {
    id: "c2",
    full_name: "Carlos Rodríguez",
    email: "carlos.rodriguez@email.com",
    phone: "+54 9 11 6789-1234",
    address: "Calle Moldes 1820, Belgrano, CABA",
    role: "Cliente",
    status: "activo",
    created_at: "2024-02-01",
  },
  {
    id: "c3",
    full_name: "Lucía Morales",
    email: "lucia.morales@email.com",
    phone: "+54 9 11 3412-9900",
    address: "Calle Palermo 430, CABA",
    role: "Cliente",
    status: "activo",
    created_at: "2024-03-10",
  },
  {
    id: "c4",
    full_name: "Gonzalo Benítez",
    email: "gonzalo.benitez@email.com",
    phone: "+54 9 11 8876-4321",
    address: "Av. Santa Fe 3100, Palermo, CABA",
    role: "Cliente",
    status: "activo",
    created_at: "2024-04-20",
  },
]);

/**
 * @typedef {Object} Veterinarian
 * @property {string} id
 * @property {string} full_name
 * @property {string} specialization
 * @property {string} license_number
 * @property {'Veterinario'} role
 * @property {'activo' | 'inactivo'} status
 */
export const VETERINARIANS = Object.freeze([
  {
    id: "v1",
    full_name: "Dr. Mateo Gómez",
    specialization: "Cirugía y Medicina General",
    license_number: "MP-40921",
    role: "Veterinario",
    status: "activo",
  },
  {
    id: "v2",
    full_name: "Dra. Valeria Rossi",
    specialization: "Dermatología y Vacunación",
    license_number: "MP-51204",
    role: "Veterinario",
    status: "activo",
  },
  {
    id: "v3",
    full_name: "Dr. Santiago Silva",
    specialization: "Radiología e Internación",
    license_number: "MP-38910",
    role: "Veterinario",
    status: "activo",
  },
]);

/**
 * @typedef {Object} Pet
 * @property {string} id
 * @property {string} name
 * @property {'Perro' | 'Gato' | 'Ave' | 'Exótico'} species
 * @property {string} breed
 * @property {'Macho' | 'Hembra'} sex
 * @property {number} age_years
 * @property {string} birth_date
 * @property {number} weight_kg
 * @property {string} color
 * @property {string} photo_url
 * @property {string} microchip
 * @property {string} owner_id Clave foránea hacia INITIAL_CLIENTS
 * @property {string} owner_name Campo denormalizado optimizado
 * @property {string} notes
 * @property {'activo' | 'baja_logica'} status
 */
export const INITIAL_PETS = Object.freeze([
  {
    id: "p1",
    name: "Apolo",
    species: "Perro",
    breed: "Golden Retriever",
    sex: "Macho",
    age_years: 4,
    birth_date: "2020-05-12",
    weight_kg: 31.5,
    color: "Dorado",
    photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
    microchip: "CHIP-985141029",
    owner_id: "c1",
    owner_name: "María Fernández",
    notes: "Muy dócil, sensible al alimento con pollo.",
    status: "activo",
  },
  {
    id: "p2",
    name: "Luna",
    species: "Gato",
    breed: "Siamés",
    sex: "Hembra",
    age_years: 2,
    birth_date: "2022-08-20",
    weight_kg: 4.2,
    color: "Crema y Café",
    photo_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
    microchip: "CHIP-441209312",
    owner_id: "c2",
    owner_name: "Carlos Rodríguez",
    notes: "Vacunas al día, algo asustadiza.",
    status: "activo",
  },
  {
    id: "p3",
    name: "Thor",
    species: "Perro",
    breed: "Bulldog Francés",
    sex: "Macho",
    age_years: 3,
    birth_date: "2021-11-03",
    weight_kg: 12.8,
    color: "Atigrado",
    photo_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600",
    microchip: "CHIP-110948322",
    owner_id: "c3",
    owner_name: "Lucía Morales",
    notes: "Problemas respiratorios leves por síndrome braquicefálico.",
    status: "activo",
  },
  {
    id: "p4",
    name: "Simba",
    species: "Gato",
    breed: "Persa",
    sex: "Macho",
    age_years: 5,
    birth_date: "2019-03-15",
    weight_kg: 5.1,
    color: "Naranja",
    photo_url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600",
    microchip: "CHIP-773419082",
    owner_id: "c4",
    owner_name: "Gonzalo Benítez",
    notes: "Requiere cepillado frecuente y control dermatológico.",
    status: "activo",
  },
]);

/**
 * @typedef {Object} MedicalRecord
 * @property {string} id
 * @property {string} pet_id
 * @property {string} pet_name
 * @property {string} vet_id
 * @property {string} vet_name
 * @property {string} record_date
 * @property {'Consulta General' | 'Diagnóstico' | 'Cirugía' | 'Urgencia'} type
 * @property {string} title
 * @property {string} description
 * @property {string} diagnosis
 * @property {string} treatment
 * @property {string} medication_prescribed
 * @property {string} attachment_url
 */
export const INITIAL_MEDICAL_RECORDS = Object.freeze([
  {
    id: "m1",
    pet_id: "p1",
    pet_name: "Apolo",
    vet_id: "v1",
    vet_name: "Dr. Mateo Gómez",
    record_date: "2024-05-10",
    type: "Consulta General",
    title: "Chequeo Anual y Control de Peso",
    description: "Paciente en excelente estado de salud general. Mucosas rosadas, reflejos normales y ritmo cardíaco estable.",
    diagnosis: "Saludable",
    treatment: "Mantener dieta baja en grasas y ejercicio moderado.",
    medication_prescribed: "Pipeta antipulgas mensual",
    attachment_url: "",
  },
  {
    id: "m2",
    pet_id: "p2",
    pet_name: "Luna",
    vet_id: "v2",
    vet_name: "Dra. Valeria Rossi",
    record_date: "2024-06-02",
    type: "Diagnóstico",
    title: "Cuadro Dermatológico en Orejas",
    description: "Presenta rascado continuo e irritación eritematosa en pabellón auricular de oreja izquierda.",
    diagnosis: "Otitis fúngica leve",
    treatment: "Limpieza auricular 2 veces al día por 7 días.",
    medication_prescribed: "Gotas Otológicas con Ketoconazol y Dexametasona",
    attachment_url: "",
  },
  {
    id: "m3",
    pet_id: "p3",
    pet_name: "Thor",
    vet_id: "v3",
    vet_name: "Dr. Santiago Silva",
    record_date: "2024-07-14",
    type: "Cirugía",
    title: "Corrección de Narinas Estenóticas",
    description: "Procedimiento quirúrgico para ampliar la apertura nasal y mejorar el flujo aéreo.",
    diagnosis: "Síndrome Braquicefálico",
    treatment: "Reposo absoluto de 10 días con collar isabelino y cura diaria.",
    medication_prescribed: "Meloxicam 1mg/ml, Cefalexina 250mg",
    attachment_url: "",
  },
]);

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} pet_id
 * @property {string} pet_name
 * @property {string} client_id
 * @property {string} client_name
 * @property {string} vet_id
 * @property {string} vet_name
 * @property {string} appointment_date
 * @property {string} appointment_time
 * @property {string} reason
 * @property {'solicitado' | 'confirmado' | 'en_atencion' | 'completado' | 'cancelado'} status
 * @property {string} notes
 */
export const INITIAL_APPOINTMENTS = Object.freeze([
  {
    id: "a1",
    pet_id: "p1",
    pet_name: "Apolo",
    client_id: "c1",
    client_name: "María Fernández",
    vet_id: "v1",
    vet_name: "Dr. Mateo Gómez",
    appointment_date: "2026-10-15",
    appointment_time: "10:00",
    reason: "Refuerzo de Vacuna Séxtuple",
    status: "confirmado",
    notes: "Traer libreta sanitaria actualizada.",
  },
  {
    id: "a2",
    pet_id: "p2",
    pet_name: "Luna",
    client_id: "c2",
    client_name: "Carlos Rodríguez",
    vet_id: "v2",
    vet_name: "Dra. Valeria Rossi",
    appointment_date: "2026-10-15",
    appointment_time: "11:30",
    reason: "Control de Otitis",
    status: "solicitado",
    notes: "Segunda revisión post tratamiento auricular.",
  },
  {
    id: "a3",
    pet_id: "p3",
    pet_name: "Thor",
    client_id: "c3",
    client_name: "Lucía Morales",
    vet_id: "v3",
    vet_name: "Dr. Santiago Silva",
    appointment_date: "2026-10-18",
    appointment_time: "16:00",
    reason: "Extracción de Puntos de Sutura",
    status: "confirmado",
    notes: "Evaluación post-quirúrgica.",
  },
  {
    id: "a4",
    pet_id: "p4",
    pet_name: "Simba",
    client_id: "c4",
    client_name: "Gonzalo Benítez",
    vet_id: "v1",
    vet_name: "Dr. Mateo Gómez",
    appointment_date: "2026-10-22",
    appointment_time: "09:30",
    reason: "Limpieza Dental y Profilaxis",
    status: "solicitado",
    notes: "Requiere ayuno previo de 8 horas.",
  },
]);

/**
 * @typedef {Object} Vaccine
 * @property {string} id
 * @property {string} pet_id
 * @property {string} pet_name
 * @property {string} owner_id
 * @property {string} owner_name
 * @property {string} vaccine_name
 * @property {string} application_date
 * @property {string} next_due_date
 * @property {string} vet_id
 * @property {string} vet_name
 * @property {'aplicada' | 'pendiente' | 'vencida'} status
 * @property {string} notes
 */
export const INITIAL_VACCINES = Object.freeze([
  {
    id: "vcc1",
    pet_id: "p1",
    pet_name: "Apolo",
    owner_id: "c1",
    owner_name: "María Fernández",
    vaccine_name: "Séxtuple Canina",
    application_date: "2025-10-10",
    next_due_date: "2026-10-10", // Próxima a vencer
    vet_id: "v1",
    vet_name: "Dr. Mateo Gómez",
    status: "pendiente",
    notes: "Refuerzo anual programado.",
  },
  {
    id: "vcc2",
    pet_id: "p2",
    pet_name: "Luna",
    owner_id: "c2",
    owner_name: "Carlos Rodríguez",
    vaccine_name: "Triple Felina",
    application_date: "2026-01-10",
    next_due_date: "2027-01-10",
    vet_id: "v2",
    vet_name: "Dra. Valeria Rossi",
    status: "aplicada",
    notes: "Sin reacciones adversas post-vacunación.",
  },
  {
    id: "vcc3",
    pet_id: "p3",
    pet_name: "Thor",
    owner_id: "c3",
    owner_name: "Lucía Morales",
    vaccine_name: "Antirrábica",
    application_date: "2025-10-20",
    next_due_date: "2026-10-20", // Próxima a vencer
    vet_id: "v3",
    vet_name: "Dr. Santiago Silva",
    status: "pendiente",
    notes: "Notificación automática pre-enviada al dueño.",
  },
  {
    id: "vcc4",
    pet_id: "p4",
    pet_name: "Simba",
    owner_id: "c4",
    owner_name: "Gonzalo Benítez",
    vaccine_name: "Leucemia Felina (FeLV)",
    application_date: "2026-03-05",
    next_due_date: "2027-03-05",
    vet_id: "v2",
    vet_name: "Dra. Valeria Rossi",
    status: "aplicada",
    notes: "Test diagnóstico de FeLV previo negativo.",
  },
]);

/**
 * @typedef {Object} Hospitalization
 * @property {string} id
 * @property {string} pet_id
 * @property {string} pet_name
 * @property {string} species
 * @property {string} owner_id Clave foránea añadida para integridad
 * @property {string} owner_name
 * @property {string} vet_id
 * @property {string} vet_name
 * @property {string} admission_date
 * @property {string | null} discharge_date
 * @property {string} reason
 * @property {string} daily_evolution
 * @property {string} treatment
 * @property {'activa' | 'alta_medica'} status
 */
export const INITIAL_HOSPITALIZATIONS = Object.freeze([
  {
    id: "h1", // ID único propio corregido (antes p3)
    pet_id: "p3",
    pet_name: "Thor",
    species: "Perro",
    owner_id: "c3",
    owner_name: "Lucía Morales",
    vet_id: "v3",
    vet_name: "Dr. Santiago Silva",
    admission_date: "2026-10-01",
    discharge_date: null,
    reason: "Monitoreo post-quirúrgico y manejo del dolor nasal",
    daily_evolution: "Evolución favorable. Mantiene saturación de oxígeno óptima. Aceptó alimento blando.",
    treatment: "Fluidoterapia Ringer Lactato, Analgesia IV cada 8hs.",
    status: "activa",
  },
]);

/**
 * @typedef {Object} PharmacyItem
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {'Antibiótico' | 'Analgesia' | 'Biológico' | 'Dermatología' | 'Insumo general'} category
 * @property {number} stock
 * @property {number} min_stock
 * @property {number} unit_price
 * @property {string} supplier
 * @property {string} expiration_date
 */
export const INITIAL_PHARMACY = Object.freeze([
  {
    id: "ph1",
    name: "Amoxicilina + Ácido Clavulánico 500mg",
    description: "Antibiótico de amplio espectro para caninos y felinos.",
    category: "Antibiótico",
    stock: 4,
    min_stock: 10, // Genera alerta de bajo stock
    unit_price: 4500,
    supplier: "Laboratorio VetPharma",
    expiration_date: "2027-02-15",
  },
  {
    id: "ph2",
    name: "Meloxicam Gotas 0.5%",
    description: "Antiinflamatorio no esteroideo (AINE) para gatos y perros.",
    category: "Analgesia",
    stock: 18,
    min_stock: 5,
    unit_price: 3200,
    supplier: "Zoetis Argentina",
    expiration_date: "2026-11-30",
  },
  {
    id: "ph3",
    name: "Vacuna Antirrábica Nobivac",
    description: "Frasco ampolla monodosis de 1ml.",
    category: "Biológico",
    stock: 3,
    min_stock: 15, // Genera alerta de bajo stock
    unit_price: 6800,
    supplier: "MSD Animal Health",
    expiration_date: "2026-11-01",
  },
  {
    id: "ph4",
    name: "Shampoo Antiséptico Chlorhexidine 3%",
    description: "Higiene dermatológica para tratamiento de piodermias.",
    category: "Dermatología",
    stock: 12,
    min_stock: 4,
    unit_price: 5400,
    supplier: "Bayer Animal Health",
    expiration_date: "2028-05-10",
  },
]);