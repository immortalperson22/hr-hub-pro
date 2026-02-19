-- Add granular feedback columns to the applicants table
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS pre_employment_feedback TEXT,
ADD COLUMN IF NOT EXISTS policy_rules_feedback TEXT;

-- Update RLS policies if necessary (usually not needed for adding columns to existing tables with general policies)
-- But ensure they are readable by the applicant and writable by the admin.
-- The existing policies on 'applicants' table already cover this.
