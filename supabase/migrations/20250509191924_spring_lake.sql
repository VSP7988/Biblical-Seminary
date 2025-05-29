/*
  # Fix banner policies

  1. Changes
    - Safely drop and recreate banner policies
    - Use DO block to handle existing policies
    - Use unique policy names to avoid conflicts

  2. Security
    - Maintain public read access
    - Allow authenticated users to manage banners
*/

DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow public read access on banners" ON banners;
  DROP POLICY IF EXISTS "Allow admin write access on banners" ON banners;
  DROP POLICY IF EXISTS "Allow authenticated users to manage banners" ON banners;
  
  -- Create new policies with unique names
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'banners' 
    AND policyname = 'Banners public read access'
  ) THEN
    CREATE POLICY "Banners public read access"
    ON banners FOR SELECT
    TO public
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'banners' 
    AND policyname = 'Banners authenticated management'
  ) THEN
    CREATE POLICY "Banners authenticated management"
    ON banners FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;