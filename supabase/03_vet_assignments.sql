-- ============================================================================
-- VetOtoño: Asignación real de veterinarios (public.profiles) y Mi Registro
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

-- 1. Permitir que el personal autenticado (admin, veterinario, recepcionista)
--    pueda listar a los veterinarios activos en selectores y derivaciones,
--    sin exponer otros perfiles restringidos.
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = id
    OR public.get_my_role() = 'administrador'
    OR (public.get_my_role() = 'recepcionista' AND role = 'cliente')
    OR (
      public.get_my_role() IN ('administrador', 'veterinario', 'recepcionista')
      AND role = 'veterinario'
      AND status = 'activo'
    )
  );

-- 2. Agregar columnas veterinarian_id (FK a public.profiles) y vet_name
--    en appointments, medical_records, vaccines y hospitalizations.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS veterinarian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vet_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS pet_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS client_name VARCHAR(150);

ALTER TABLE public.medical_records
  ADD COLUMN IF NOT EXISTS veterinarian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vet_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS pet_name VARCHAR(100);

ALTER TABLE public.vaccines
  ADD COLUMN IF NOT EXISTS veterinarian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vet_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS pet_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150);

ALTER TABLE public.hospitalizations
  ADD COLUMN IF NOT EXISTS veterinarian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vet_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS pet_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS species VARCHAR(50),
  ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150);

-- 3. Backfill: sincronizar veterinarian_id con vet_id existente si aún está vacío
UPDATE public.appointments
SET veterinarian_id = vet_id
WHERE veterinarian_id IS NULL AND vet_id IS NOT NULL;

UPDATE public.medical_records
SET veterinarian_id = vet_id
WHERE veterinarian_id IS NULL AND vet_id IS NOT NULL;

UPDATE public.vaccines
SET veterinarian_id = vet_id
WHERE veterinarian_id IS NULL AND vet_id IS NOT NULL;

UPDATE public.hospitalizations
SET veterinarian_id = vet_id
WHERE veterinarian_id IS NULL AND vet_id IS NOT NULL;

-- 4. Índices para acelerar las consultas personales en /mi-registro
CREATE INDEX IF NOT EXISTS idx_appointments_veterinarian_id
  ON public.appointments (veterinarian_id);

CREATE INDEX IF NOT EXISTS idx_medical_records_veterinarian_id
  ON public.medical_records (veterinarian_id);

CREATE INDEX IF NOT EXISTS idx_vaccines_veterinarian_id
  ON public.vaccines (veterinarian_id);

CREATE INDEX IF NOT EXISTS idx_hospitalizations_veterinarian_id
  ON public.hospitalizations (veterinarian_id);
