-- Single-firm MVP contact-directory compatibility migration.
-- Removes auth.users foreign-key dependencies so backend imports can succeed.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE IF EXISTS public."Contacts" DROP CONSTRAINT IF EXISTS "Contacts_user_id_fkey";
ALTER TABLE IF EXISTS public."ContactPhones" DROP CONSTRAINT IF EXISTS "ContactPhones_user_id_fkey";
ALTER TABLE IF EXISTS public."Cases" DROP CONSTRAINT IF EXISTS "Cases_user_id_fkey";
ALTER TABLE IF EXISTS public."Images" DROP CONSTRAINT IF EXISTS "Images_user_id_fkey";
ALTER TABLE IF EXISTS public."AuditLogs" DROP CONSTRAINT IF EXISTS "AuditLogs_user_id_fkey";
ALTER TABLE IF EXISTS public."AutomationsConfig" DROP CONSTRAINT IF EXISTS "AutomationsConfig_user_id_fkey";
ALTER TABLE IF EXISTS public."Invoices" DROP CONSTRAINT IF EXISTS "Invoices_user_id_fkey";

CREATE TABLE IF NOT EXISTS public."Contacts" (
  "idInfringer" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company" text NOT NULL,
  "user_id" uuid,
  "createdAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."ContactPhones" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "idInfringer" uuid NOT NULL REFERENCES public."Contacts"("idInfringer") ON DELETE CASCADE,
  "phoneNumber" text NOT NULL,
  "isPrimary" boolean DEFAULT false,
  "user_id" uuid
);

CREATE TABLE IF NOT EXISTS public."Cases" (
  "idCase" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "pass" text,
  "customerName" text NOT NULL,
  "idClient" text,
  "idInfringer" uuid NOT NULL REFERENCES public."Contacts"("idInfringer") ON DELETE CASCADE,
  "createdAt" timestamptz DEFAULT now(),
  "isScrubbed" boolean NOT NULL DEFAULT false,
  "user_id" uuid
);

CREATE TABLE IF NOT EXISTS public."Images" (
  "idImage" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "idCase" uuid NOT NULL REFERENCES public."Cases"("idCase") ON DELETE CASCADE,
  "catalogImagePath" text NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  "user_id" uuid
);

CREATE TABLE IF NOT EXISTS public."AuditLogs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "action" text NOT NULL,
  "resourceId" text,
  "details" jsonb DEFAULT '{}'::jsonb,
  "createdAt" timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS public."Contacts" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE IF EXISTS public."ContactPhones" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE IF EXISTS public."Cases" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE IF EXISTS public."Images" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE IF EXISTS public."AuditLogs" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE IF EXISTS public."AutomationsConfig" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE IF EXISTS public."Invoices" ALTER COLUMN "user_id" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_contacts_company" ON public."Contacts"("company");
CREATE INDEX IF NOT EXISTS "idx_contacts_company_trgm" ON public."Contacts" USING gin ("company" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_contactphones_idInfringer" ON public."ContactPhones"("idInfringer");
CREATE INDEX IF NOT EXISTS "idx_cases_idInfringer" ON public."Cases"("idInfringer");
CREATE INDEX IF NOT EXISTS "idx_images_idCase" ON public."Images"("idCase");

CREATE OR REPLACE FUNCTION public.search_conflicts_fuzzy(search_term text)
RETURNS TABLE (
  "idInfringer" uuid,
  "company" text,
  "similarity" real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c."idInfringer",
    c."company",
    similarity(c."company", search_term) AS "similarity"
  FROM public."Contacts" c
  WHERE c."company" % search_term
  ORDER BY "similarity" DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
