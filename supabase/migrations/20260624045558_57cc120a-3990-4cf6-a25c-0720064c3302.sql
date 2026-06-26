
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Complaints
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_no text NOT NULL UNIQUE DEFAULT ('ATH-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  assembly_constituency text NOT NULL DEFAULT '129 - ATHOOR',
  ward_number integer NOT NULL CHECK (ward_number > 0),
  pincode text NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  pdf_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX complaints_created_at_idx ON public.complaints (created_at DESC);
CREATE INDEX complaints_phone_idx ON public.complaints (phone);
CREATE INDEX complaints_ward_idx ON public.complaints (ward_number);

GRANT INSERT ON public.complaints TO anon, authenticated;
GRANT SELECT, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a complaint
CREATE POLICY "Anyone can submit a complaint"
ON public.complaints FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read or delete
CREATE POLICY "Admins can view complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete complaints"
ON public.complaints FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
