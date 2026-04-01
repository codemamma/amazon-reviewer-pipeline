/*
  # Add Email and Password Protection to Authors

  1. Changes to authors table
    - Add `email` (text, unique) - Author's email for notifications and funnel management
    - Add `password_hash` (text) - Hashed password for dashboard access
    - Add `view_count` (integer) - Track how many times the public page is viewed
    - Add `last_accessed_at` (timestamptz) - Track when dashboard was last accessed

  2. Notes
    - Email is required for sending dashboard links
    - Password hash uses bcrypt-style hashing for security
    - View count helps authors track engagement
    - Existing authors will have null email/password until they update
*/

-- Add email column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'authors' AND column_name = 'email'
  ) THEN
    ALTER TABLE authors ADD COLUMN email text UNIQUE;
  END IF;
END $$;

-- Add password_hash column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'authors' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE authors ADD COLUMN password_hash text;
  END IF;
END $$;

-- Add view_count column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'authors' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE authors ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

-- Add last_accessed_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'authors' AND column_name = 'last_accessed_at'
  ) THEN
    ALTER TABLE authors ADD COLUMN last_accessed_at timestamptz;
  END IF;
END $$;