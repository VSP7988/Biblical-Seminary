/*
  # Create student registrations table

  1. New Tables
    - student_registrations table for storing student application data
  2. Security
    - Enable RLS
    - Add policies for public insert and authenticated management
*/

-- Create student registrations table
CREATE TABLE IF NOT EXISTS student_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  date_of_birth date,
  gender text,
  education_level text,
  previous_institution text,
  program_interest text NOT NULL,
  course_id uuid REFERENCES courses(id),
  start_date text,
  comments text,
  contacted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  payment_screenshot_url text
);

-- Enable RLS
ALTER TABLE student_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to insert student registrations" ON student_registrations;
DROP POLICY IF EXISTS "Allow authenticated users to manage student registrations" ON student_registrations;

-- Create policies
CREATE POLICY "Allow public to insert student registrations"
  ON student_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage student registrations"
  ON student_registrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);