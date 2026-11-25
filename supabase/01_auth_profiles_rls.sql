-- ============================================================================
-- VetOtoño: Migración de Autenticación, Perfiles y Políticas RLS (Opción A)
-- Compatible con supabase_schema.sql existente y llaves foráneas actuales.
-- Ejecutar en el SQL Editor de Supabase (una sola vez).
-- ============================================================================

-- 1. Asegurar existencia de public.profiles (si se corre en proyecto limpio)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'cliente',
  phone VARCHAR(50),
  address TEXT,
  status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vincular profiles.user_id con auth.users(id) ON DELETE CASCADE sin romper
--    registros previos de clientes sin cuenta de autenticación (user_id NULL).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_user_id_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique_idx
  ON public.profiles (user_id)
  WHERE user_id IS NOT NULL;

-- 3. Normalizar roles a minúsculas y actualizar CHECK constraint
--    Mantiene 'cliente' permitido para futura incorporación sin migraciones destructivas.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

UPDATE public.profiles
SET role = LOWER(TRIM(role))
WHERE role IS NOT NULL AND role <> LOWER(TRIM(role));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('administrador', 'veterinario', 'recepcionista', 'cliente'));

-- 4. Trigger automático al crear usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  v_role := LOWER(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'rol',
    'cliente'
  )));

  IF v_role NOT IN ('administrador', 'veterinario', 'recepcionista', 'cliente') THEN
    v_role := 'cliente';
  END IF;

  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'), ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, user_id, full_name, email, role, status)
  VALUES (NEW.id, NEW.id, v_full_name, NEW.email, v_role, 'activo')
  ON CONFLICT (email) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Protección: nadie puede modificar su propio rol desde el cliente
CREATE OR REPLACE FUNCTION public.prevent_client_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'No tienes permiso para modificar el rol de un perfil desde el cliente.';
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'No tienes permiso para modificar la vinculación de usuario.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_client_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_client_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_role_change();

-- 6. Funciones auxiliares SECURITY DEFINER (evitan recursión infinita en RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LOWER(role)
  FROM public.profiles
  WHERE user_id = auth.uid() OR id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.profiles
  WHERE user_id = auth.uid() OR id = auth.uid()
  LIMIT 1;
$$;

-- 7. Habilitar RLS en todas las tablas del dominio
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas permisivas anteriores de supabase_schema.sql
DROP POLICY IF EXISTS "Permitir lectura publica" ON public.profiles;
DROP POLICY IF EXISTS "Permitir lectura publica mascotas" ON public.pets;
DROP POLICY IF EXISTS "Permitir lectura historias" ON public.medical_records;
DROP POLICY IF EXISTS "Permitir lectura turnos" ON public.appointments;
DROP POLICY IF EXISTS "Permitir lectura vacunas" ON public.vaccines;
DROP POLICY IF EXISTS "Permitir lectura internaciones" ON public.hospitalizations;
DROP POLICY IF EXISTS "Permitir lectura farmacia" ON public.pharmacy;

-- Limpiar políticas nuevas si se re-ejecuta el script
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

DROP POLICY IF EXISTS "pets_select_policy" ON public.pets;
DROP POLICY IF EXISTS "pets_insert_policy" ON public.pets;
DROP POLICY IF EXISTS "pets_update_policy" ON public.pets;
DROP POLICY IF EXISTS "pets_delete_policy" ON public.pets;

DROP POLICY IF EXISTS "medical_records_select_policy" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_insert_policy" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_update_policy" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_delete_policy" ON public.medical_records;

DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete_policy" ON public.appointments;

DROP POLICY IF EXISTS "vaccines_select_policy" ON public.vaccines;
DROP POLICY IF EXISTS "vaccines_insert_policy" ON public.vaccines;
DROP POLICY IF EXISTS "vaccines_update_policy" ON public.vaccines;
DROP POLICY IF EXISTS "vaccines_delete_policy" ON public.vaccines;

DROP POLICY IF EXISTS "hospitalizations_select_policy" ON public.hospitalizations;
DROP POLICY IF EXISTS "hospitalizations_insert_policy" ON public.hospitalizations;
DROP POLICY IF EXISTS "hospitalizations_update_policy" ON public.hospitalizations;
DROP POLICY IF EXISTS "hospitalizations_delete_policy" ON public.hospitalizations;

DROP POLICY IF EXISTS "pharmacy_select_policy" ON public.pharmacy;
DROP POLICY IF EXISTS "pharmacy_insert_policy" ON public.pharmacy;
DROP POLICY IF EXISTS "pharmacy_update_policy" ON public.pharmacy;
DROP POLICY IF EXISTS "pharmacy_delete_policy" ON public.pharmacy;

-- ============================================================================
-- POLÍTICAS RLS POR TABLA Y ROL
-- Matriz:
-- - administrador: acceso total a todos los módulos y lectura de todos los perfiles.
-- - veterinario: mascotas, turnos, historias, vacunas, internaciones, farmacia. SIN clientes.
-- - recepcionista: clientes, mascotas, turnos, historias, vacunas. SIN internaciones ni farmacia.
-- - cliente (futuro): solo su propio perfil, sus mascotas, sus turnos, sus historias/vacunas.
-- ============================================================================

-- PROFILES
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = id
    OR public.get_my_role() = 'administrador'
    OR (public.get_my_role() = 'recepcionista' AND role = 'cliente')
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'administrador'
    OR (public.get_my_role() = 'recepcionista' AND role = 'cliente' AND user_id IS NULL)
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = id
    OR public.get_my_role() = 'administrador'
    OR (public.get_my_role() = 'recepcionista' AND role = 'cliente')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = id
    OR public.get_my_role() = 'administrador'
    OR (public.get_my_role() = 'recepcionista' AND role = 'cliente')
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'administrador');

-- PETS (Mascotas)
CREATE POLICY "pets_select_policy" ON public.pets
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
    OR (public.get_my_role() = 'cliente' AND owner_id = public.get_my_profile_id())
  );

CREATE POLICY "pets_insert_policy" ON public.pets
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
  );

CREATE POLICY "pets_update_policy" ON public.pets
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista'))
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista'));

CREATE POLICY "pets_delete_policy" ON public.pets
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'administrador');

-- MEDICAL RECORDS (Historias Clínicas)
CREATE POLICY "medical_records_select_policy" ON public.medical_records
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
    OR (
      public.get_my_role() = 'cliente'
      AND EXISTS (
        SELECT 1 FROM public.pets p
        WHERE p.id = medical_records.pet_id
          AND p.owner_id = public.get_my_profile_id()
      )
    )
  );

CREATE POLICY "medical_records_insert_policy" ON public.medical_records
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario'));

CREATE POLICY "medical_records_update_policy" ON public.medical_records
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('administrador', 'veterinario'))
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario'));

CREATE POLICY "medical_records_delete_policy" ON public.medical_records
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'administrador');

-- APPOINTMENTS (Turnos)
CREATE POLICY "appointments_select_policy" ON public.appointments
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
    OR (public.get_my_role() = 'cliente' AND client_id = public.get_my_profile_id())
  );

CREATE POLICY "appointments_insert_policy" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
    OR (public.get_my_role() = 'cliente' AND client_id = public.get_my_profile_id())
  );

CREATE POLICY "appointments_update_policy" ON public.appointments
  FOR UPDATE TO authenticated
  USING (
    public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
    OR (public.get_my_role() = 'cliente' AND client_id = public.get_my_profile_id())
  )
  WITH CHECK (
    public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
    OR (public.get_my_role() = 'cliente' AND client_id = public.get_my_profile_id())
  );

CREATE POLICY "appointments_delete_policy" ON public.appointments
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'administrador');

-- VACCINES (Vacunas)
CREATE POLICY "vaccines_select_policy" ON public.vaccines
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
    OR (
      public.get_my_role() = 'cliente'
      AND EXISTS (
        SELECT 1 FROM public.pets p
        WHERE p.id = vaccines.pet_id
          AND p.owner_id = public.get_my_profile_id()
      )
    )
  );

CREATE POLICY "vaccines_insert_policy" ON public.vaccines
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista'));

CREATE POLICY "vaccines_update_policy" ON public.vaccines
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista'))
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista'));

CREATE POLICY "vaccines_delete_policy" ON public.vaccines
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'administrador');

-- HOSPITALIZATIONS (Internaciones: solo administrador y veterinario)
CREATE POLICY "hospitalizations_select_policy" ON public.hospitalizations
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('administrador', 'veterinario'));

CREATE POLICY "hospitalizations_insert_policy" ON public.hospitalizations
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario'));

CREATE POLICY "hospitalizations_update_policy" ON public.hospitalizations
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('administrador', 'veterinario'))
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario'));

CREATE POLICY "hospitalizations_delete_policy" ON public.hospitalizations
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'administrador');

-- PHARMACY (Farmacia & Stock: solo administrador y veterinario)
CREATE POLICY "pharmacy_select_policy" ON public.pharmacy
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('administrador', 'veterinario'));

CREATE POLICY "pharmacy_insert_policy" ON public.pharmacy
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario'));

CREATE POLICY "pharmacy_update_policy" ON public.pharmacy
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('administrador', 'veterinario'))
  WITH CHECK (public.get_my_role() IN ('administrador', 'veterinario'));

CREATE POLICY "pharmacy_delete_policy" ON public.pharmacy
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'administrador');
