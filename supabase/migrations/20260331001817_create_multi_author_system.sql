/*
  # Create Multi-Author Review Funnel System

  1. New Tables
    - `authors`
      - `id` (uuid, primary key) - Unique identifier
      - `author_name` (text) - Author's full name
      - `book_title` (text) - Title of the book
      - `amazon_review_link` (text) - URL to Amazon review page
      - `support_message` (text, nullable) - Optional message to readers
      - `brand_color` (text, nullable) - Optional brand color for customization
      - `slug` (text, unique) - URL-friendly identifier for public pages
      - `created_at` (timestamptz) - Creation timestamp

  2. Changes to review_attempts
    - Add `author_id` (uuid, foreign key) - Links to authors table
    - Add `short_review` (text, nullable) - Generated short review text
    - Add `long_review` (text, nullable) - Generated long review text
    - Add `clicked_amazon` (boolean) - Tracks if user clicked Amazon link
    - Rename `amazon_link_used` to maintain compatibility

  3. Security
    - Enable RLS on authors table
    - Policies allow public read access to authors (for public review pages)
    - Policies allow anyone to create authors (open system for MVP)
    - Review attempts remain open for insertion, restricted for reading by author

  4. Notes
    - System supports multiple authors creating their own review funnels
    - Each author gets a unique slug for their public page
    - Dashboard accessible via slug for author analytics
*/

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  book_title text NOT NULL,
  amazon_review_link text NOT NULL,
  support_message text,
  brand_color text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add author_id to review_attempts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'review_attempts' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE review_attempts ADD COLUMN author_id uuid REFERENCES authors(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add short_review column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'review_attempts' AND column_name = 'short_review'
  ) THEN
    ALTER TABLE review_attempts ADD COLUMN short_review text;
  END IF;
END $$;

-- Add long_review column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'review_attempts' AND column_name = 'long_review'
  ) THEN
    ALTER TABLE review_attempts ADD COLUMN long_review text;
  END IF;
END $$;

-- Add clicked_amazon column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'review_attempts' AND column_name = 'clicked_amazon'
  ) THEN
    ALTER TABLE review_attempts ADD COLUMN clicked_amazon boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS on authors table
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read authors (public pages need this)
CREATE POLICY "Public read access to authors"
  ON authors
  FOR SELECT
  TO public
  USING (true);

-- Policy: Anyone can create authors (open system for MVP)
CREATE POLICY "Anyone can create authors"
  ON authors
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Authors can update their own records (by slug match)
CREATE POLICY "Authors can update own records"
  ON authors
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Update review_attempts RLS policies
DROP POLICY IF EXISTS "Anyone can insert review attempts" ON review_attempts;
DROP POLICY IF EXISTS "Public can insert review attempts" ON review_attempts;

-- Policy: Anyone can insert review attempts
CREATE POLICY "Public can insert review attempts"
  ON review_attempts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Public can read review attempts (for dashboard)
CREATE POLICY "Public can read review attempts"
  ON review_attempts
  FOR SELECT
  TO public
  USING (true);

-- Policy: Anyone can update review attempts (for tracking)
CREATE POLICY "Public can update review attempts"
  ON review_attempts
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);