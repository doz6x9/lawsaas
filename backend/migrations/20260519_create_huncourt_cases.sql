-- Create the huncourt_cases table matching the dataset schema
CREATE TABLE IF NOT EXISTS public.huncourt_cases (
  ruling_id        BIGINT PRIMARY KEY,                    -- Ruling ID
  decision_id      TEXT NOT NULL,                         -- Decision ID (e.g., "1/2005")
  decision_date    DATE,                                  -- Date of decision
  decision_year    INTEGER,                               -- Year of decision
  subject_matter   TEXT,                                  -- Subject matter of the case
  keywords         TEXT,                                  -- Keywords
  content          TEXT,                                  -- Content of the ruling (full text)
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Metadata
);

-- Add a GENERATED COLUMN that automatically creates a tsvector for Hungarian full-text search
-- It combines keywords, subject_matter, and content
ALTER TABLE public.huncourt_cases
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('hungarian',
        COALESCE(keywords, '') || ' ' ||
        COALESCE(subject_matter, '') || ' ' ||
        COALESCE(content, '')
      )
    ) STORED;

-- Create a GIN index on the generated search_vector for lightning-fast full-text search
CREATE INDEX IF NOT EXISTS idx_huncourt_cases_search_vector
  ON public.huncourt_cases
  USING GIN (search_vector);

-- Create an index on decision_year for efficient year filtering
CREATE INDEX IF NOT EXISTS idx_huncourt_cases_decision_year
  ON public.huncourt_cases (decision_year);

-- Create an index on decision_id for lookups
CREATE INDEX IF NOT EXISTS idx_huncourt_cases_decision_id
  ON public.huncourt_cases (decision_id);

-- Enable Row Level Security (optional, set policies as needed for multi-tenant)
ALTER TABLE public.huncourt_cases ENABLE ROW LEVEL SECURITY;

