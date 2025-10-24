/*
  # Add payment screenshot support to student registrations

  1. Changes
    - Add payment_screenshot_url column to student_registrations table
    - Create storage bucket for payment screenshots
    - Add storage policies for public upload and authenticated management
*/

-- Add payment_screenshot_url column to student_registrations
ALTER TABLE student_registrations ADD COLUMN payment_screenshot_url text;

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Payment screenshots are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Public can upload payment screenshots"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Authenticated users can manage payment screenshots"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'payment-screenshots')
WITH CHECK (bucket_id = 'payment-screenshots');