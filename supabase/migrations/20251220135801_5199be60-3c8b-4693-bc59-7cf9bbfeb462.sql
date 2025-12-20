-- Admin-focused extensions: user deactivation, evaluation settings, and error logs

-- 1) Soft deactivation flag on profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 2) Evaluation settings table for grading thresholds, weights, and allowed formats
CREATE TABLE IF NOT EXISTS public.evaluation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.evaluation_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage evaluation settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'evaluation_settings'
  ) THEN
    CREATE POLICY "Admins manage evaluation settings"
      ON public.evaluation_settings
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION public.update_evaluation_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS evaluation_settings_set_updated_at ON public.evaluation_settings;
CREATE TRIGGER evaluation_settings_set_updated_at
BEFORE UPDATE ON public.evaluation_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_evaluation_settings_updated_at();

-- 3) Error logs table for admin-only diagnostics
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL,
  source text NOT NULL,
  message text NOT NULL,
  details jsonb,
  user_id uuid
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated context to insert logs; only admins can read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'error_logs'
  ) THEN
    CREATE POLICY "Anyone can insert error logs"
      ON public.error_logs
      FOR INSERT
      WITH CHECK (true);

    CREATE POLICY "Admins can view error logs"
      ON public.error_logs
      FOR SELECT
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;