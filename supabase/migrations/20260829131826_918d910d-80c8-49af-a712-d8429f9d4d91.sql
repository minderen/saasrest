CREATE POLICY "tenant media read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'tenant-media' AND public.has_tenant_access(NULLIF((storage.foldername(name))[1],'')::uuid));
CREATE POLICY "tenant media insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tenant-media' AND public.has_tenant_access(NULLIF((storage.foldername(name))[1],'')::uuid));
CREATE POLICY "tenant media update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'tenant-media' AND public.has_tenant_access(NULLIF((storage.foldername(name))[1],'')::uuid));
CREATE POLICY "tenant media delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'tenant-media' AND public.has_tenant_access(NULLIF((storage.foldername(name))[1],'')::uuid));