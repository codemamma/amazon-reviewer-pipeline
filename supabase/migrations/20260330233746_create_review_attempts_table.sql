/*
  # Create review_attempts table

  1. New Tables
    - `review_attempts`
      - `id` (uuid, primary key) - Unique identifier for each review attempt
      - `email` (text) - User's email address
      - `takeaway` (text) - Answer to "What was your biggest takeaway from the book?"
      - `recommendation` (text) - Answer to "Who would you recommend this book to?"
      - `standout` (text) - Answer to "What stood out most?"
      - `review_generated` (boolean, default false) - Whether review was generated
      - `copied` (boolean, default false) - Whether review was copied
      - `created_at` (timestamptz) - Timestamp of creation

  2. Security
    - Enable RLS on `review_attempts` table
    - Add policy for public insert (no auth required for this simple app)
    - Add policy for public updates (to track copy action)
*/

CREATE TABLE IF NOT EXISTS review_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  takeaway text DEFAULT '',
  recommendation text DEFAULT '',
  standout text DEFAULT '',
  review_generated boolean DEFAULT false,
  copied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert review attempts"
  ON review_attempts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update review attempts"
  ON review_attempts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read review attempts"
  ON review_attempts
  FOR SELECT
  TO anon
  USING (true);
