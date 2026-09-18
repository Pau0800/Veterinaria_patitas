-- Schema SQL para el Sistema Integral de Gestión Veterinaria "VetOtoño"
-- Compatible con Supabase / PostgreSQL

-- 1. Tabla de Perfiles (Usuarios: Admin, Veterinario, Recepcionista, Cliente)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('Administrador', 'Veterinario', 'Recepcionista', 'Cliente')),
  phone VARCHAR(50),
  address TEXT,
  status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Mascotas
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL, -- Perro, Gato, Ave, Exótico, etc.
  breed VARCHAR(100),
  sex VARCHAR(20) CHECK (sex IN ('Macho', 'Hembra')),
  age_years INT DEFAULT 0,
  birth_date DATE,
  weight_kg DECIMAL(5,2),
  color VARCHAR(50),
  photo_url TEXT,
  microchip VARCHAR(50) UNIQUE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'baja_logica')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Historias Clínicas / Consultas
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('Consulta General', 'Diagnóstico', 'Tratamiento', 'Medicación', 'Cirugía', 'Estudios', 'Evolución')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  medication_prescribed TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Turnos / Citas
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'confirmado', 'reprogramado', 'cancelado')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Vacunas
CREATE TABLE IF NOT EXISTS public.vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(100) NOT NULL,
  application_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  vet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'aplicada' CHECK (status IN ('aplicada', 'pendiente', 'vencida')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Internaciones
CREATE TABLE IF NOT EXISTS public.hospitalizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discharge_date TIMESTAMP WITH TIME ZONE,
  reason TEXT NOT NULL,
  daily_evolution TEXT,
  treatment TEXT,
  status VARCHAR(30) DEFAULT 'activa' CHECK (status IN ('activa', 'alta_medica')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de Farmacia / Inventario de Medicamentos
CREATE TABLE IF NOT EXISTS public.pharmacy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'Medicamento',
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 5,
  unit_price DECIMAL(10,2) DEFAULT 0.00,
  supplier VARCHAR(150),
  expiration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) opcionalmente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura básica pública o autenticada
CREATE POLICY "Permitir lectura publica" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica mascotas" ON public.pets FOR SELECT USING (true);
CREATE POLICY "Permitir lectura historias" ON public.medical_records FOR SELECT USING (true);
CREATE POLICY "Permitir lectura turnos" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Permitir lectura vacunas" ON public.vaccines FOR SELECT USING (true);
CREATE POLICY "Permitir lectura internaciones" ON public.hospitalizations FOR SELECT USING (true);
CREATE POLICY "Permitir lectura farmacia" ON public.pharmacy FOR SELECT USING (true);
