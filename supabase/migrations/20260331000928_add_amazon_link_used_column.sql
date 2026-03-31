/*
  # Add Amazon Link Usage Tracking

  1. Changes
    - Add `amazon_link_used` column to `review_attempts` table
      - Boolean field to track if user clicked the Amazon link to post their review
      - Defaults to false
      - Nullable to support existing records

  2. Notes
    - Existing records will have NULL values
    - New records will default to false unless explicitly set to true
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'review_attempts' AND column_name = 'amazon_link_used'
  ) THEN
    ALTER TABLE review_attempts ADD COLUMN amazon_link_used boolean DEFAULT false;
  END IF;
END $$;