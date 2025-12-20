-- Allow all authenticated users (students/teachers) to read evaluation settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'evaluation_settings'
      AND policyname = 'Everyone can read evaluation settings'
  ) THEN
    CREATE POLICY "Everyone can read evaluation settings"
      ON public.evaluation_settings
      FOR SELECT
      USING (true);
  END IF;
END$$;