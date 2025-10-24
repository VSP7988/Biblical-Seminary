/*
  # Update banner table policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies for public read and authenticated write access
    - Remove dependency on users table role check

  2. Security
    - Allow public read access to all banners
    - Allow authenticated users to manage banners
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access on banners" ON banners;
DROP POLICY IF EXISTS "Allow admin write access on banners" ON banners;
DROP POLICY IF EXISTS "Allow authenticated users to manage banners" ON banners;

-- Create new policies
CREATE POLICY "Allow public read access on banners"
ON banners FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage banners"
ON banners FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);