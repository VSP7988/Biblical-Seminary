/*
  # Add social media links to teachers

  1. Changes
    - Add social media columns to teachers table:
      - facebook_url (text, nullable)
      - twitter_url (text, nullable)
      - instagram_url (text, nullable)
      - linkedin_url (text, nullable)
*/

-- Drop columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teachers' AND column_name = 'facebook_url'
  ) THEN
    ALTER TABLE teachers DROP COLUMN facebook_url;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teachers' AND column_name = 'twitter_url'
  ) THEN
    ALTER TABLE teachers DROP COLUMN twitter_url;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teachers' AND column_name = 'instagram_url'
  ) THEN
    ALTER TABLE teachers DROP COLUMN instagram_url;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teachers' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE teachers DROP COLUMN linkedin_url;
  END IF;
END $$;

-- Add columns
ALTER TABLE teachers ADD COLUMN facebook_url text;
ALTER TABLE teachers ADD COLUMN twitter_url text;
ALTER TABLE teachers ADD COLUMN instagram_url text;
ALTER TABLE teachers ADD COLUMN linkedin_url text;