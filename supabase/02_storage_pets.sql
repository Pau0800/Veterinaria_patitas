-- ============================================================================
-- VetOtoño: Bucket público y políticas RLS para fotografías de mascotas
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

-- 1. Crear o actualizar el bucket público 'pet-photos'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  true,
  5242880, -- 5 MB máximo por imagen
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Limpiar políticas previas si se re-ejecuta el script
DROP POLICY IF EXISTS "pet_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_authenticated_delete" ON storage.objects;

-- 3. Lectura pública de las imágenes del bucket 'pet-photos'
CREATE POLICY "pet_photos_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'pet-photos');

-- 4. Subida (INSERT) permitida para usuarios autenticados
CREATE POLICY "pet_photos_authenticated_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pet-photos');

-- 5. Actualización (UPDATE) permitida para usuarios autenticados
CREATE POLICY "pet_photos_authenticated_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pet-photos')
  WITH CHECK (bucket_id = 'pet-photos');

-- 6. Eliminación (DELETE) permitida para usuarios autenticados
CREATE POLICY "pet_photos_authenticated_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'pet-photos');
