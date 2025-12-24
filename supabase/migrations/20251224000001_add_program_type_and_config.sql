-- Add program_type and config fields to programs table
-- Migration: 20251224000001_add_program_type_and_config

-- Add program_type enum type
CREATE TYPE program_type AS ENUM ('chat', 'form', 'template');

-- Add new columns to programs table
ALTER TABLE programs
  ADD COLUMN program_type program_type DEFAULT 'chat' NOT NULL,
  ADD COLUMN config JSONB DEFAULT '{}'::jsonb;

-- Add index for program_type for better query performance
CREATE INDEX idx_programs_program_type ON programs(program_type);

-- Add comment to describe the config structure
COMMENT ON COLUMN programs.config IS 'Program configuration stored as JSON:
- For chat type: {system_prompt, artifacts_enabled, ai_provider, ai_model}
- For form type: {form_schema, output_template, ai_provider, ai_model}
- For template type: {templates, ai_provider, ai_model}';

-- Update existing programs to have default chat type
-- (This is safe because the column has a default value)
UPDATE programs SET program_type = 'chat' WHERE program_type IS NULL;
