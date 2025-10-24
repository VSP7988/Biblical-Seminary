/*
  # Create student registrations table

  1. New Tables
    - `student_registrations`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `date_of_birth` (date)
      - `gender` (text)
      - `education_level` (text)
      - `previous_institution` (text)
      - `program_interest` (text, not null)
      - `course_id` (uuid, references courses)
      - `start_date` (text)
      - `comments` (text)
      - `contacted` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public insert and authenticated management
*/

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
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_registrations ENABLE ROW LEVEL SECURITY;

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