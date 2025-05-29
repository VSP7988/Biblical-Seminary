/*
  # Initial Schema Setup for Maranatha Biblical Seminary Website

  1. New Tables
    - users (handled by Supabase Auth)
    - banners
    - useful_links
    - about_content
    - statistics
    - teachers
    - gallery
    - videos
    - courses
    - blog_posts
    - downloads

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  button_text text,
  button_link text,
  active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Useful links table
CREATE TABLE IF NOT EXISTS useful_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon_name text NOT NULL,
  link text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- About content table
CREATE TABLE IF NOT EXISTS about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  section_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Statistics table
CREATE TABLE IF NOT EXISTS statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  value integer NOT NULL,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  image_url text NOT NULL,
  bio text,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  description text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  duration text,
  price decimal(10,2),
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  author_id uuid REFERENCES auth.users,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE useful_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on banners" ON banners FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on useful_links" ON useful_links FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on about_content" ON about_content FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on statistics" ON statistics FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on teachers" ON teachers FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on gallery" ON gallery FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on videos" ON videos FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on courses" ON courses FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on blog_posts" ON blog_posts FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on downloads" ON downloads FOR SELECT TO public USING (true);

-- Create policies for admin write access
CREATE POLICY "Allow admin write access on banners" ON banners FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on useful_links" ON useful_links FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on about_content" ON about_content FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on statistics" ON statistics FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on teachers" ON teachers FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on gallery" ON gallery FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on videos" ON videos FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on courses" ON courses FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on blog_posts" ON blog_posts FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
CREATE POLICY "Allow admin write access on downloads" ON downloads FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));