
-- Lock down has_role: only policies (run as owner) need it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Replace permissive INSERT policy with a slightly stricter one
DROP POLICY "Anyone can submit a complaint" ON public.complaints;
CREATE POLICY "Anyone can submit a complaint"
ON public.complaints FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) BETWEEN 1 AND 200
  AND phone ~ '^[0-9]{10}$'
  AND ward_number > 0
  AND pincode ~ '^[1-9][0-9]{5}$'
  AND length(pdf_path) > 0
);

-- Storage policies for complaint-pdfs bucket
CREATE POLICY "Public can upload complaint PDFs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'complaint-pdfs');

CREATE POLICY "Admins can read complaint PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'complaint-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete complaint PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'complaint-pdfs' AND public.has_role(auth.uid(), 'admin'));
