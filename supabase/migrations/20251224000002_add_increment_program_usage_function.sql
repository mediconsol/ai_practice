-- Create function to increment program usage count
CREATE OR REPLACE FUNCTION increment_program_usage(program_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE programs
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = program_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_program_usage(UUID) TO authenticated;
